/**
 * 学习路径闭包表维护服务
 *
 * 负责 concept / concept_dependency / concept_path 三表的 CRUD 与闭包自动维护。
 * 所有写操作在同一事务内完成，保证数据一致性。
 *
 * 算法参考: docs/requirements/08-learning-path-closure-table-migration.md §3.3
 */

import { Prisma } from '@prisma/client';
import prisma from './db';

// ──────────────────────────────────────────────
// 类型定义
// ──────────────────────────────────────────────

export interface ConceptWithDepth {
  id: number;
  name: string;
  description: string | null;
  depth: number;
}

export interface ClosureStats {
  rowsAffected: number;
  elapsedMs: number;
}

export interface RouteResult {
  path: number[];
  concepts: { id: number; name: string }[];
  depth: number;
}

// ──────────────────────────────────────────────
// 查询函数（只读，无需事务）
// ──────────────────────────────────────────────

/**
 * 查询 1: 获取目标知识点的所有前置依赖
 * 按依赖深度从大到小排序（最基础的知识点排最前）
 */
export async function getPrerequisites(
  conceptId: number,
  pathType: string = 'required'
): Promise<ConceptWithDepth[]> {
  const rows = await prisma.$queryRaw<ConceptWithDepth[]>`
    SELECT c.id, c.name, c.description, cp.depth
    FROM concept_path cp
    JOIN concept c ON cp.ancestor_id = c.id
    WHERE cp.descendant_id = ${conceptId}
      AND cp.path_type = ${pathType}
      AND cp.depth > 0
    ORDER BY cp.depth DESC
  `;
  return rows.map(r => ({
    id: Number(r.id),
    name: r.name,
    description: r.description,
    depth: Number(r.depth),
  }));
}

/**
 * 查询 2: 获取已掌握知识点的所有后续可学节点
 * 按距离（depth）从小到大排序
 */
export async function getSuccessors(
  conceptId: number,
  pathType: string = 'required'
): Promise<ConceptWithDepth[]> {
  const rows = await prisma.$queryRaw<ConceptWithDepth[]>`
    SELECT c.id, c.name, c.description, cp.depth
    FROM concept_path cp
    JOIN concept c ON cp.descendant_id = c.id
    WHERE cp.ancestor_id = ${conceptId}
      AND cp.path_type = ${pathType}
      AND cp.depth > 0
    ORDER BY cp.depth ASC
  `;
  return rows.map(r => ({
    id: Number(r.id),
    name: r.name,
    description: r.description,
    depth: Number(r.depth),
  }));
}

/**
 * 查询 3 (P2): 获取从起点到终点的完整路径链条
 * 在 concept_dependency 边表上用递归 CTE BFS 重建最短路径
 */
export async function findRoute(
  fromId: number,
  toId: number,
  pathType: string = 'required'
): Promise<RouteResult | null> {
  // 先通过闭包表确认路径存在并获取最短深度
  const exists = await prisma.$queryRaw<{ depth: number }[]>`
    SELECT depth FROM concept_path
    WHERE ancestor_id = ${fromId}
      AND descendant_id = ${toId}
      AND path_type = ${pathType}
      AND depth > 0
    LIMIT 1
  `;

  if (exists.length === 0) return null;

  const minDepth = Number(exists[0].depth);

  // 递归 CTE 在边表上做 BFS 重建路径
  const routes = await prisma.$queryRaw<{ path: number[] }[]>`
    WITH RECURSIVE route AS (
      SELECT
        cd.prerequisite_id AS node_id,
        cd.dependent_id AS next_id,
        ARRAY[cd.prerequisite_id, cd.dependent_id] AS path,
        1 AS depth
      FROM concept_dependency cd
      WHERE cd.prerequisite_id = ${fromId}
        AND cd.path_type = ${pathType}

      UNION ALL

      SELECT
        r.node_id,
        cd.dependent_id,
        r.path || cd.dependent_id,
        r.depth + 1
      FROM route r
      JOIN concept_dependency cd ON cd.prerequisite_id = r.next_id
      WHERE cd.path_type = ${pathType}
        AND NOT cd.dependent_id = ANY(r.path)
        AND r.depth < 20
    )
    SELECT path
    FROM route
    WHERE next_id = ${toId}
    ORDER BY depth ASC
    LIMIT 1
  `;

  if (routes.length === 0) return null;

  const pathArr = routes[0].path as unknown as number[];

  // 获取路径上所有节点的名称
  const concepts = await prisma.$queryRaw<{ id: number; name: string }[]>`
    SELECT id, name FROM concept
    WHERE id = ANY(${pathArr})
    ORDER BY array_position(${pathArr}::int[], id)
  `;

  return {
    path: pathArr.map(Number),
    concepts: concepts.map(c => ({ id: Number(c.id), name: c.name })),
    depth: minDepth,
  };
}

// ──────────────────────────────────────────────
// 写操作（事务内执行）
// ──────────────────────────────────────────────

/**
 * 新增直接依赖 (pre → dep) 并自动维护闭包表
 *
 * 算法步骤:
 * 1. 环检测: 若已存在 dep → pre 的路径，则会形成环，拒绝插入
 * 2. 插入 concept_dependency 记录
 * 3. 插入自引用 (pre, pre, 0) 和 (dep, dep, 0)
 * 4. 插入直接路径 (pre, dep, 1)
 * 5. 组合插入: ancestors_of(pre) × descendants_of(dep)
 */
export async function addDependency(
  prerequisiteId: number,
  dependentId: number,
  pathType: string = 'required'
): Promise<void> {
  if (prerequisiteId === dependentId) {
    throw new Error('不允许自环依赖: prerequisite_id 不能等于 dependent_id');
  }

  await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    // 1. 环检测
    const cycleCheck = await tx.$queryRaw<{ exists: number }[]>`
      SELECT 1 AS exists FROM concept_path
      WHERE ancestor_id = ${dependentId}
        AND descendant_id = ${prerequisiteId}
        AND path_type = ${pathType}
        AND depth > 0
      LIMIT 1
    `;

    if (cycleCheck.length > 0) {
      throw new Error(
        `检测到环: 添加 ${prerequisiteId} → ${dependentId} 会形成循环依赖 (path_type=${pathType})`
      );
    }

    // 2. 插入 concept_dependency
    await tx.$executeRaw`
      INSERT INTO concept_dependency (prerequisite_id, dependent_id, path_type)
      VALUES (${prerequisiteId}, ${dependentId}, ${pathType})
      ON CONFLICT (prerequisite_id, dependent_id, path_type) DO NOTHING
    `;

    // 3. 插入自引用（如果不存在）
    await tx.$executeRaw`
      INSERT INTO concept_path (ancestor_id, descendant_id, depth, path_type)
      VALUES (${prerequisiteId}, ${prerequisiteId}, 0, ${pathType})
      ON CONFLICT (ancestor_id, descendant_id, path_type) DO NOTHING
    `;
    await tx.$executeRaw`
      INSERT INTO concept_path (ancestor_id, descendant_id, depth, path_type)
      VALUES (${dependentId}, ${dependentId}, 0, ${pathType})
      ON CONFLICT (ancestor_id, descendant_id, path_type) DO NOTHING
    `;

    // 4. 插入直接路径
    await tx.$executeRaw`
      INSERT INTO concept_path (ancestor_id, descendant_id, depth, path_type)
      VALUES (${prerequisiteId}, ${dependentId}, 1, ${pathType})
      ON CONFLICT (ancestor_id, descendant_id, path_type) DO NOTHING
    `;

    // 5. 组合插入: 所有能到达 pre 的节点 × 从 dep 出发能到达的节点
    await tx.$executeRaw`
      INSERT INTO concept_path (ancestor_id, descendant_id, depth, path_type)
      SELECT
        cp1.ancestor_id,
        cp2.descendant_id,
        cp1.depth + cp2.depth + 1,
        ${pathType}
      FROM concept_path cp1
      CROSS JOIN concept_path cp2
      WHERE cp1.descendant_id = ${prerequisiteId}
        AND cp2.ancestor_id = ${dependentId}
        AND cp1.path_type = ${pathType}
        AND cp2.path_type = ${pathType}
      ON CONFLICT (ancestor_id, descendant_id, path_type) DO NOTHING
    `;
  });
}

/**
 * 删除直接依赖并重建该 pathType 的闭包表
 * MVP 策略: 全量重建该 pathType
 */
export async function removeDependency(
  prerequisiteId: number,
  dependentId: number,
  pathType: string = 'required'
): Promise<void> {
  await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    // 删除边
    const result = await tx.$executeRaw`
      DELETE FROM concept_dependency
      WHERE prerequisite_id = ${prerequisiteId}
        AND dependent_id = ${dependentId}
        AND path_type = ${pathType}
    `;

    if (result === 0) {
      throw new Error(
        `依赖不存在: ${prerequisiteId} → ${dependentId} (path_type=${pathType})`
      );
    }

    // MVP: 全量重建该 pathType 的闭包表
    await rebuildClosureForTypeInTx(tx, pathType);
  });
}

/**
 * 全量重建某个 pathType 的闭包表（事务内版本）
 */
async function rebuildClosureForTypeInTx(
  tx: Prisma.TransactionClient,
  pathType: string
): Promise<ClosureStats> {
  const start = Date.now();

  // 清空该 pathType 的闭包
  await tx.$executeRaw`
    DELETE FROM concept_path WHERE path_type = ${pathType}
  `;

  // 插入所有自引用
  await tx.$executeRaw`
    INSERT INTO concept_path (ancestor_id, descendant_id, depth, path_type)
    SELECT id, id, 0, ${pathType}
    FROM concept
    ON CONFLICT (ancestor_id, descendant_id, path_type) DO NOTHING
  `;

  // 使用递归 CTE 一次性计算传递闭包
  const result = await tx.$executeRaw`
    WITH RECURSIVE transitive AS (
      -- base case: 所有直接依赖边
      SELECT
        cd.prerequisite_id AS ancestor_id,
        cd.dependent_id AS descendant_id,
        1 AS depth,
        cd.path_type
      FROM concept_dependency cd
      WHERE cd.path_type = ${pathType}

      UNION ALL

      -- recursive: 沿边向下扩展
      SELECT
        t.ancestor_id,
        cd.dependent_id,
        t.depth + 1,
        cd.path_type
      FROM transitive t
      JOIN concept_dependency cd
        ON cd.prerequisite_id = t.descendant_id
        AND cd.path_type = t.path_type
      WHERE t.depth < 20
    )
    INSERT INTO concept_path (ancestor_id, descendant_id, depth, path_type)
    SELECT ancestor_id, descendant_id, MIN(depth) AS depth, path_type
    FROM transitive
    GROUP BY ancestor_id, descendant_id, path_type
    ON CONFLICT (ancestor_id, descendant_id, path_type) DO NOTHING
  `;

  const elapsedMs = Date.now() - start;
  console.log(
    `[ClosureRebuild] pathType="${pathType}" 完成, 新增 ${result} 行, 耗时 ${elapsedMs}ms`
  );

  return { rowsAffected: Number(result), elapsedMs };
}

/**
 * 全量重建某个 pathType 的闭包表（独立事务，供脚本调用）
 */
export async function rebuildClosureForType(
  pathType: string
): Promise<ClosureStats> {
  return prisma.$transaction(
    async (tx) => rebuildClosureForTypeInTx(tx, pathType),
    { timeout: 120000 } // 2 分钟超时，适配大数据量
  );
}

/**
 * 全量重建所有闭包表
 */
export async function rebuildAllClosure(): Promise<{
  totalRows: number;
  elapsedMs: number;
  byType: Record<string, ClosureStats>;
}> {
  const start = Date.now();

  // 获取所有 distinct path_type
  const types = await prisma.$queryRaw<{ path_type: string }[]>`
    SELECT DISTINCT path_type FROM concept_dependency
  `;

  const byType: Record<string, ClosureStats> = {};
  let totalRows = 0;

  for (const t of types) {
    const stats = await rebuildClosureForType(t.path_type);
    byType[t.path_type] = stats;
    totalRows += stats.rowsAffected;
  }

  const elapsedMs = Date.now() - start;
  console.log(
    `[ClosureRebuild] 全量重建完成, 共 ${totalRows} 行, 耗时 ${elapsedMs}ms`
  );

  return { totalRows, elapsedMs, byType };
}

// ──────────────────────────────────────────────
// 知识点 CRUD
// ──────────────────────────────────────────────

/**
 * 创建知识点
 */
export async function createConcept(data: {
  name: string;
  description?: string;
  legacyNeo4jId?: string;
}): Promise<{ id: number; name: string }> {
  const result = await prisma.concept.create({
    data: {
      name: data.name,
      description: data.description,
      legacyNeo4jId: data.legacyNeo4jId,
    },
  });

  // 为新知识点插入自引用闭包行
  const types = await prisma.$queryRaw<{ path_type: string }[]>`
    SELECT DISTINCT path_type FROM concept_dependency
  `;

  for (const t of types) {
    await prisma.$executeRaw`
      INSERT INTO concept_path (ancestor_id, descendant_id, depth, path_type)
      VALUES (${result.id}, ${result.id}, 0, ${t.path_type})
      ON CONFLICT (ancestor_id, descendant_id, path_type) DO NOTHING
    `;
  }

  return { id: result.id, name: result.name };
}

/**
 * 获取单个知识点
 */
export async function getConcept(id: number) {
  return prisma.concept.findUnique({ where: { id } });
}

/**
 * 更新知识点
 */
export async function updateConcept(
  id: number,
  data: { name?: string; description?: string }
) {
  return prisma.concept.update({ where: { id }, data });
}

/**
 * 删除知识点（级联清理依赖边与闭包表记录，由 ON DELETE CASCADE 自动处理）
 */
export async function deleteConcept(id: number): Promise<void> {
  await prisma.concept.delete({ where: { id } });
}

/**
 * 列出所有知识点（支持分页）
 */
export async function listConcepts(options?: {
  skip?: number;
  take?: number;
  search?: string;
}) {
  const where = options?.search
    ? { name: { contains: options.search, mode: 'insensitive' as const } }
    : {};

  const [items, total] = await Promise.all([
    prisma.concept.findMany({
      where,
      skip: options?.skip,
      take: options?.take || 100,
      orderBy: { id: 'asc' },
    }),
    prisma.concept.count({ where }),
  ]);

  return { items, total };
}
