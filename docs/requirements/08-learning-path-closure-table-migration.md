# 08 - 学习路径闭包表迁移（Neo4j → Neon PostgreSQL）

| 属性 | 值 |
|------|-----|
| 需求编号 | REQ-LP-001 |
| 状态 | ⏳ 计划中 |
| 优先级 | P1 |
| 影响范围 | `backend-next`、Admin Web、Desktop Manager 学习路径模块 |
| 最后更新 | 2026-06-18 |

---

## 1. 背景与目标

### 1.1 现状

原系统使用 **Neo4j** 存储 STEM 知识点依赖关系。学习路径查询通过 Cypher 递归实现，例如：

```cypher
MATCH path = (start)-[:PROGRESSES_TO*1..8]->(end)
```

当前相关 API：

- `POST /api/v1/knowledge-graph/path` — 基于 `Tutorial` 节点与 `PROGRESSES_TO` 关系
- `GET/POST /api/v1/learning/path` — 学习路径生成与查询

Neo4j 侧规模参考：KnowledgePoint 约 4,623 个，`PROGRESSES_TO` 关系约 28,380 条。

### 1.2 目标

将**「学习路径依赖」模块**迁移到 **Neon PostgreSQL**，采用**闭包表（Closure Table）**方案：

- 保持三种核心查询功能与现有行为一致
- 替换应用层所有相关 Cypher 为简单 SQL
- 降低运维复杂度，减少对 Neo4j Aura 的依赖

### 1.3 预期收益

| 收益 | 说明 |
|------|------|
| 运维简化 | 用户、题库、学习路径统一在 PostgreSQL，减少双库同步 |
| 查询简单 | 不依赖递归 CTE，单表 JOIN 即可获取完整依赖树 |
| 教学友好 | 适合低配置教学环境，SQL 可直接演示与调试 |
| 性能可预期 | 闭包表预计算传递关系，读查询 O(1) 索引查找 |

### 1.4 范围边界

**本需求范围内**：

- 知识点（Concept）节点 CRUD
- 直接依赖关系（Concept Dependency）维护
- 闭包表（Concept Path）自动维护
- 三种路径查询 API
- Neo4j → PostgreSQL 数据迁移脚本
- 与现有前端查询接口的行为对齐

**本需求范围外**（仍保留 Neo4j 或后续单独迁移）：

- 教程、课件、硬件项目等非依赖图资源
- `CONTAINS`、`BELONGS_TO` 等其他图关系
- 协同过滤推荐算法

---

## 2. 功能需求

### 2.1 知识点节点管理（FR-LP-01）

| ID | 需求描述 | 优先级 |
|----|----------|--------|
| FR-LP-01.1 | 每个知识点有唯一 ID、名称、描述等基本字段 | P0 |
| FR-LP-01.2 | 支持创建、读取、更新、删除知识点 | P0 |
| FR-LP-01.3 | 删除知识点时级联清理依赖边与闭包表记录 | P0 |
| FR-LP-01.4 | 可选：保留与 Neo4j 原节点 ID 的映射字段（`legacy_neo4j_id`）便于迁移对账 | P1 |

**业务规则**：

- 知识点 A → B 表示：学习 B 之前必须先掌握 A
- 不允许自环直接依赖（A → A）
- 同一对节点可存在不同 `path_type` 的依赖（如 `required` 与 `optional`）

### 2.2 学习路径查询（FR-LP-02）

#### 查询 1：追溯前置依赖树（「我该先学什么？」）

| 属性 | 说明 |
|------|------|
| 输入 | 目标知识点 ID、`path_type`（可选，默认 `required`） |
| 输出 | 所有必须预先学习的知识点列表 |
| 排序 | 按依赖深度 **从大到小**（最基础的知识点排最前） |
| 过滤 | 支持按 `path_type` 过滤（如只看必修） |

**API 建议**：`GET /api/v1/learning-path/prerequisites/:conceptId?path_type=required`

#### 查询 2：探索后续可学节点（「学了这个能做什么？」）

| 属性 | 说明 |
|------|------|
| 输入 | 已掌握知识点 ID、`path_type`（可选） |
| 输出 | 可直接或间接学习的后继知识点列表 |
| 排序 | 按距离（depth）**从小到大** |
| 过滤 | 支持按 `path_type` 过滤 |

**API 建议**：`GET /api/v1/learning-path/successors/:conceptId?path_type=required`

#### 查询 3：获取完整路径链条（可选增强）

| 属性 | 说明 |
|------|------|
| 输入 | 起点 ID、终点 ID、`path_type`（可选） |
| 输出 | 从起点到终点的具体节点序列 |
| 实现说明 | 闭包表默认只存起终点与深度；需结合 `concept_dependency` 边表做路径重建 |
| 优先级 | P2（首期可不做，查询 1/2 为 MVP） |

**API 建议**：`GET /api/v1/learning-path/route?from=:startId&to=:endId&path_type=required`

### 2.3 依赖关系维护（FR-LP-03）

| ID | 需求描述 | 优先级 |
|----|----------|--------|
| FR-LP-03.1 | 新增直接依赖 (A→B) 时，自动更新闭包表 | P0 |
| FR-LP-03.2 | 删除直接依赖时，同步移除闭包表中对应的传递路径 | P0 |
| FR-LP-03.3 | 维护操作必须在同一数据库事务内完成 | P0 |
| FR-LP-03.4 | 删除策略：初期可接受「重建闭包表」；生产环境需实现增量移除或全量重建脚本 | P1 |

**新增依赖时的闭包维护逻辑**（见第 3.2 节）：

1. 插入自引用 `(A, A, 0)` 与 `(B, B, 0)`
2. 插入直接路径 `(A, B, 1)`
3. 组合所有能到达 A 的节点与从 B 出发能到达的节点，插入 `(X, Y, d1+d2+1)`

**删除依赖时的策略**：

| 策略 | 适用阶段 | 说明 |
|------|----------|------|
| 全量重建 | MVP / 数据量 < 5000 | 清空 `concept_path`，按 `concept_dependency` 逐条重建 |
| 增量移除 | 生产 | 移除受影响的传递路径组合，需防残留 |
| 定期校验 | 运维 | 对比 edge 表推导结果与闭包表，不一致时触发重建 |

---

## 3. 数据库设计（PostgreSQL / Neon）

### 3.1 表结构

```sql
-- 知识点表
CREATE TABLE concept (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    legacy_neo4j_id VARCHAR(255),  -- 可选：迁移对账
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 直接依赖关系表（边）
CREATE TABLE concept_dependency (
    prerequisite_id INT NOT NULL REFERENCES concept(id) ON DELETE CASCADE,
    dependent_id INT NOT NULL REFERENCES concept(id) ON DELETE CASCADE,
    path_type VARCHAR(50) NOT NULL DEFAULT 'required',  -- required, optional 等
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (prerequisite_id, dependent_id, path_type),
    CHECK (prerequisite_id <> dependent_id)
);

-- 传递闭包表
CREATE TABLE concept_path (
    ancestor_id INT NOT NULL REFERENCES concept(id) ON DELETE CASCADE,
    descendant_id INT NOT NULL REFERENCES concept(id) ON DELETE CASCADE,
    depth INT NOT NULL CHECK (depth >= 0),
    path_type VARCHAR(50) NOT NULL,
    PRIMARY KEY (ancestor_id, descendant_id, path_type)
);

-- 索引
CREATE INDEX idx_cp_descendant ON concept_path(descendant_id, path_type, depth);
CREATE INDEX idx_cp_ancestor ON concept_path(ancestor_id, path_type, depth);
CREATE INDEX idx_cd_dependent ON concept_dependency(dependent_id, path_type);
CREATE INDEX idx_cd_prerequisite ON concept_dependency(prerequisite_id, path_type);
```

### 3.2 Prisma Schema 映射（建议）

在 `backend-next/prisma/schema.prisma` 中新增：

```prisma
model Concept {
  id              Int      @id @default(autoincrement())
  name            String
  description     String?
  legacyNeo4jId   String?  @unique
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  prerequisites   ConceptDependency[] @relation("Prerequisite")
  dependents      ConceptDependency[] @relation("Dependent")
  ancestorPaths   ConceptPath[]       @relation("Ancestor")
  descendantPaths ConceptPath[]       @relation("Descendant")
}

model ConceptDependency {
  prerequisiteId Int
  dependentId    Int
  pathType       String   @default("required")
  createdAt      DateTime @default(now())

  prerequisite Concept @relation("Prerequisite", fields: [prerequisiteId], references: [id], onDelete: Cascade)
  dependent    Concept @relation("Dependent", fields: [dependentId], references: [id], onDelete: Cascade)

  @@id([prerequisiteId, dependentId, pathType])
}

model ConceptPath {
  ancestorId    Int
  descendantId  Int
  depth         Int
  pathType      String

  ancestor   Concept @relation("Ancestor", fields: [ancestorId], references: [id], onDelete: Cascade)
  descendant Concept @relation("Descendant", fields: [descendantId], references: [id], onDelete: Cascade)

  @@id([ancestorId, descendantId, pathType])
  @@index([descendantId, pathType, depth])
  @@index([ancestorId, pathType, depth])
}
```

### 3.3 闭包表维护算法（插入依赖）

当添加一条直接依赖 `(pre, dep, type)` 时，在同一事务内执行：

```sql
-- 1. 插入自身引用（如果不存在）
INSERT INTO concept_path (ancestor_id, descendant_id, depth, path_type)
VALUES (pre, pre, 0, type) ON CONFLICT DO NOTHING;

INSERT INTO concept_path (ancestor_id, descendant_id, depth, path_type)
VALUES (dep, dep, 0, type) ON CONFLICT DO NOTHING;

-- 2. 插入直接路径
INSERT INTO concept_path (ancestor_id, descendant_id, depth, path_type)
VALUES (pre, dep, 1, type) ON CONFLICT DO NOTHING;

-- 3. 组合：所有能到 pre 的节点 × 从 dep 出发能到达的节点
INSERT INTO concept_path (ancestor_id, descendant_id, depth, path_type)
SELECT
    cp1.ancestor_id,
    cp2.descendant_id,
    cp1.depth + cp2.depth + 1,
    cp1.path_type
FROM concept_path cp1
JOIN concept_path cp2
  ON cp1.descendant_id = pre
 AND cp2.ancestor_id = dep
WHERE cp1.path_type = type
  AND cp2.path_type = type
ON CONFLICT DO NOTHING;
```

**注意**：若新增边导致环，闭包表会写入环上所有传递对；业务层应在插入 `concept_dependency` 前做环检测（可选 P1）。

### 3.4 闭包表重建算法（删除依赖 / 批量迁移）

MVP 阶段推荐全量重建：

```sql
TRUNCATE concept_path;

-- 对每个 path_type 分组，逐条 concept_dependency 调用 3.3 插入算法
-- 或由应用层脚本循环执行
```

---

## 4. 核心查询 SQL

### 4.1 获取所有前置依赖

**场景**：输入目标知识点，返回「必须先学」的列表。

```sql
-- 参数: @target_id, @path_type (默认 'required')
SELECT c.id, c.name, c.description, cp.depth
FROM concept_path cp
JOIN concept c ON cp.ancestor_id = c.id
WHERE cp.descendant_id = @target_id
  AND cp.path_type = @path_type
  AND cp.depth > 0
ORDER BY cp.depth DESC;
```

### 4.2 获取所有后续可学节点

**场景**：输入已掌握知识点，返回可继续学习的内容。

```sql
-- 参数: @ancestor_id, @path_type
SELECT c.id, c.name, c.description, cp.depth
FROM concept_path cp
JOIN concept c ON cp.descendant_id = c.id
WHERE cp.ancestor_id = @ancestor_id
  AND cp.path_type = @path_type
  AND cp.depth > 0
ORDER BY cp.depth ASC;
```

### 4.3 获取完整路径链条（P2 增强）

闭包表证明「存在路径」并提供最短深度，但不保存中间节点。实现思路：

1. 用闭包表确认 `@start_id` → `@end_id` 存在且取 `depth = d`
2. 递归或 BFS：在 `concept_dependency` 上从 `@start_id` 向下走，每步 depth-1，直到 `@end_id`
3. 或使用 PostgreSQL 递归 CTE **仅作用于边表**（边表规模远小于全图递归）

```sql
-- 示例：边表 BFS 重建一条最短路径（path_type 过滤）
WITH RECURSIVE route AS (
  SELECT prerequisite_id AS node_id,
         dependent_id AS next_id,
         ARRAY[prerequisite_id, dependent_id] AS path,
         1 AS depth
  FROM concept_dependency
  WHERE prerequisite_id = @start_id
    AND path_type = @path_type

  UNION ALL

  SELECT r.node_id,
         cd.dependent_id,
         r.path || cd.dependent_id,
         r.depth + 1
  FROM route r
  JOIN concept_dependency cd ON cd.prerequisite_id = r.next_id
  WHERE cd.path_type = @path_type
    AND NOT cd.dependent_id = ANY(r.path)
    AND r.depth < 20
)
SELECT path
FROM route
WHERE next_id = @end_id
ORDER BY depth ASC
LIMIT 1;
```

---

## 5. 迁移步骤

### 5.1 数据导出（Neo4j）

从 Neo4j 导出节点与 `PROGRESSES_TO`（或等价 PREREQUISITE）关系为 CSV：

| 文件 | 字段 |
|------|------|
| `concepts.csv` | neo4j_id, name, description |
| `dependencies.csv` | prerequisite_neo4j_id, dependent_neo4j_id, path_type |

**path_type 映射建议**：

| Neo4j 关系属性 | PostgreSQL path_type |
|----------------|----------------------|
| 默认先修 | `required` |
| 推荐/选修 | `optional` |

### 5.2 导入 PostgreSQL

1. 执行 DDL 创建 `concept`、`concept_dependency`、`concept_path`
2. 导入 `concept`，保留 `legacy_neo4j_id`
3. 将 `dependencies.csv` 中的 Neo4j ID 映射为 PostgreSQL `concept.id`
4. 批量插入 `concept_dependency`（暂不写闭包表）

### 5.3 初始化闭包表

对 `concept_dependency` 中每条边，按 **3.3 节算法**依次执行；或编写脚本：

```
FOR each path_type IN DISTINCT path_types:
  FOR each edge IN concept_dependency WHERE path_type = path_type:
    apply closure_insert(edge)
```

### 5.4 应用层替换

| 现有 | 迁移后 |
|------|--------|
| `knowledge-graph/path/route.ts` Cypher | 调用闭包表 SQL / Prisma raw query |
| `learning/path/route.ts` | 同上或合并为统一 learning-path 模块 |
| Admin 知识图谱管理 | 改为维护 concept / concept_dependency |
| Desktop 路径可视化 | API 响应格式保持不变，仅数据源切换 |

### 5.5 对账测试

1. 随机抽取 N 个知识点（建议 N ≥ 100）
2. 同一输入分别跑 Neo4j 递归与 PostgreSQL 闭包查询
3. 比较节点 ID 集合与 depth 排序是否一致
4. 新增/删除一条依赖后，立即验证查询 1、2 结果

---

## 6. 非功能需求

| ID | 需求 | 指标 |
|----|------|------|
| NFR-LP-01 | 查询响应时间 | 5000 节点规模内，查询 1/2 **< 50ms**（P95） |
| NFR-LP-02 | 闭包维护事务性 | 插入/删除依赖与闭包更新同一事务，失败全回滚 |
| NFR-LP-03 | 数据一致性 | 迁移后与 Neo4j 结果 **100% 一致**（集合相等） |
| NFR-LP-04 | 可观测性 | 闭包重建操作记录耗时与影响行数 |

---

## 7. 验收标准

| # | 验收项 | 通过条件 |
|---|--------|----------|
| AC-1 | 前置依赖查询 | 输入任意目标知识点，返回列表与 Neo4j 递归结果**完全一致**（节点集合 + depth 排序） |
| AC-2 | 后续节点查询 | 输入任意起点知识点，返回列表与 Neo4j 递归结果**完全一致** |
| AC-3 | 闭包自动更新 | 新增一条 A→B 依赖后，不重建全表即可正确回答查询 1、2 |
| AC-4 | 闭包删除同步 | 删除一条直接依赖后，传递路径无残留；查询结果即时正确 |
| AC-5 | 路径类型过滤 | `path_type=required` 与 `optional` 结果互不干扰 |
| AC-6 | 性能 | 5000 节点、闭包表约 10 万行规模，查询 1/2 P95 < 50ms |
| AC-7 | API 兼容 | 现有前端（Desktop path-visualization、Admin 知识图谱）无需改接口契约或仅改 base URL |

---

## 8. 风险与缓解

| 风险 | 影响 | 缓解 |
|------|------|------|
| 闭包表行数膨胀 | 存储与写入变慢 | 仅迁移 KnowledgePoint 依赖；定期归档；删除用全量重建 |
| 删除边算法复杂 | 残留错误路径 | MVP 用 TRUNCATE + 重建；后期再做增量 |
| 环状依赖 | 无限传递 | 插入边前环检测；或限制 max depth |
| Neo4j 与 PG 并行期双写 | 数据不一致 | 迁移窗口只读 Neo4j，写 PG；对账通过后切读 |

---

## 9. 实施任务拆分（建议）

| 阶段 | 任务 | 产出 |
|------|------|------|
| T1 | Prisma Schema + 迁移 SQL | `concept*` 三表 |
| T2 | 闭包维护服务 `lib/concept-path.ts` | insertDependency / removeDependency / rebuildAll |
| T3 | 查询 API 三个端点 | prerequisites / successors / route |
| T4 | Neo4j 导出脚本 | `scripts/export-neo4j-concepts.ts` |
| T5 | 导入 + 闭包初始化脚本 | `scripts/import-concept-closure.ts` |
| T6 | 对账测试脚本 | `scripts/verify-closure-vs-neo4j.ts` |
| T7 | 替换现有 API + 前端联调 | 移除或降级 Neo4j 路径查询 |
| T8 | 文档更新 | API 文档、05-数据需求、本需求状态 → ✅ |

---

## 10. 相关文档

- [05 - 数据需求](./05-data-requirements.md) — 当前 Neo4j 图模型
- [03 - 功能需求](./03-functional-requirements.md) — FR-1.6 知识图谱学习路径
- [06 - 系统架构](./06-system-architecture.md) — 双库架构
- [backend-next/app/api/v1/knowledge-graph/path/route.ts](../../backend-next/app/api/v1/knowledge-graph/path/route.ts) — 现有 Cypher 实现

---

*需求提出：2026-06-18 | 状态：⏳ 待开发*
