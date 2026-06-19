/**
 * 知识图谱数据迁移脚本 — JSON → PostgreSQL 闭包表
 *
 * 读取 scripts/migration-output/ 下 export-from-json.ts 已生成的结构化数据：
 *   - exported_concepts.json     知识点列表（含 legacyNeo4jId）
 *   - exported_dependencies.json PROGRESSES_TO 直接依赖边
 *
 * 将其导入 PostgreSQL 的 Concept / ConceptDependency 表，并触发闭包表
 * ConceptPath 的全量重建，使学习路径 API 可立即返回真实数据。
 *
 * 设计要点：
 *   1. 幂等：Concept 用 upsert（按 legacyNeo4jId），ConceptDependency 用 skipDuplicates
 *   2. PROGRESSES_TO 关系映射为 path_type='required'（与 lib/concept-path.ts 默认对齐）
 *   3. 闭包表重建调用 lib/concept-path.ts 的 rebuildAllClosure()（事务内递归 CTE）
 *   4. 输出详细 stats 报告到 scripts/migration-output/migration-report.json
 *
 * 使用：
 *   npx tsx scripts/migrate-knowledge-graph.ts
 *   npx tsx scripts/migrate-knowledge-graph.ts --dry-run  # 仅校验，不写入
 */

import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import prisma from '../lib/db';
import { rebuildAllClosure } from '../lib/concept-path';

// ──────────────────────────────────────────────
// 启动前检查
// ──────────────────────────────────────────────

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

if (!process.env.DATABASE_URL) {
  console.error('❌ 未找到 DATABASE_URL 环境变量');
  console.error('   请确保 backend-next/.env.local 存在且包含 DATABASE_URL');
  process.exit(1);
}

const isDryRun = process.argv.includes('--dry-run');

// ──────────────────────────────────────────────
// 类型定义
// ──────────────────────────────────────────────

interface ExportedConcept {
  id: string;
  name: string;
  description: string;
  source: string;
  subject: string;
  gradeLevel: string;
}

interface ExportedConceptsFile {
  exportedAt: string;
  totalCount: number;
  concepts: ExportedConcept[];
}

interface ExportedDependency {
  sourceId: string;
  targetId: string;
  relationshipType: string;
  confidence?: number;
}

interface ExportedDependenciesFile {
  exportedAt: string;
  totalCount: number;
  dependencies: ExportedDependency[];
}

interface MigrationReport {
  startedAt: string;
  finishedAt: string;
  durationMs: number;
  dryRun: boolean;
  sourceFiles: {
    conceptsFile: string;
    dependenciesFile: string;
    conceptsExportedAt: string;
    dependenciesExportedAt: string;
  };
  stats: {
    conceptsRead: number;
    conceptsCreated: number;
    conceptsUpdated: number;
    conceptsFailed: number;
    dependenciesRead: number;
    dependenciesInserted: number;
    dependenciesDataSkipped: number;
    dependenciesDbErrors: number;
    closureByType: Record<string, { rowsAffected: number; elapsedMs: number }>;
    closureTotalRows: number;
    closureTotalElapsedMs: number;
  };
  dbCounts: {
    conceptsBefore: number;
    dependenciesBefore: number;
    conceptPathRowsBefore: number;
    conceptsAfter: number;
    dependenciesAfter: number;
    conceptPathRowsAfter: number;
  };
  warnings: string[];
}

// ──────────────────────────────────────────────
// 路径常量
// ──────────────────────────────────────────────

const OUTPUT_DIR = path.join(process.cwd(), 'scripts', 'migration-output');
const CONCEPTS_FILE = path.join(OUTPUT_DIR, 'exported_concepts.json');
const DEPENDENCIES_FILE = path.join(OUTPUT_DIR, 'exported_dependencies.json');
const REPORT_FILE = path.join(OUTPUT_DIR, 'migration-report.json');

// PROGRESSES_TO 关系在闭包表中用 'required' 标识（与 lib/concept-path.ts 默认值对齐）
const RELATIONSHIP_TO_PATH_TYPE: Record<string, string> = {
  PROGRESSES_TO: 'required',
};

const BATCH_SIZE = 200;

// ──────────────────────────────────────────────
// 工具函数
// ──────────────────────────────────────────────

function loadJsonFile<T>(filePath: string): T {
  const content = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(content) as T;
}

function saveJsonFile(filePath: string, data: unknown): void {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

function chunk<T>(arr: T[], size: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
}

// ──────────────────────────────────────────────
// 1. 加载源数据
// ──────────────────────────────────────────────

function loadSourceData(): {
  concepts: ExportedConcept[];
  dependencies: ExportedDependency[];
  conceptsMeta: ExportedConceptsFile;
  dependenciesMeta: ExportedDependenciesFile;
} {
  console.log('📂 加载导出的中间数据...');

  if (!fs.existsSync(CONCEPTS_FILE)) {
    throw new Error(`缺少文件: ${CONCEPTS_FILE}\n请先运行: npx tsx scripts/export-from-json.ts`);
  }
  if (!fs.existsSync(DEPENDENCIES_FILE)) {
    throw new Error(`缺少文件: ${DEPENDENCIES_FILE}\n请先运行: npx tsx scripts/export-from-json.ts`);
  }

  const conceptsMeta = loadJsonFile<ExportedConceptsFile>(CONCEPTS_FILE);
  const dependenciesMeta = loadJsonFile<ExportedDependenciesFile>(DEPENDENCIES_FILE);

  console.log(`   ✅ 知识点:   ${conceptsMeta.totalCount} 条 (${CONCEPTS_FILE})`);
  console.log(`   ✅ 依赖关系: ${dependenciesMeta.totalCount} 条 (${DEPENDENCIES_FILE})`);

  return {
    concepts: conceptsMeta.concepts,
    dependencies: dependenciesMeta.dependencies,
    conceptsMeta,
    dependenciesMeta,
  };
}

// ──────────────────────────────────────────────
// 2. 导入 Concept（upsert by legacyNeo4jId）
// ──────────────────────────────────────────────

async function importConcepts(concepts: ExportedConcept[], dryRun: boolean) {
  console.log(`\n📥 [Phase 1] 导入 Concept 表${dryRun ? ' (DRY-RUN)' : ''}`);
  console.log(`   待处理: ${concepts.length} 条`);

  let created = 0;
  let updated = 0;
  let failed = 0;

  if (dryRun) {
    console.log('   ⏭️  DRY-RUN 跳过实际写入');
    return { created, updated, failed };
  }

  for (const batch of chunk(concepts, BATCH_SIZE)) {
    for (const c of batch) {
      try {
        // 名称截断到 255 字符（schema 中 concept.name 是 VarChar(255)）
        const safeName = (c.name || c.id || 'Unknown').slice(0, 255);
        const safeDescription = c.description || null;

        const result = await prisma.concept.upsert({
          where: { legacyNeo4jId: c.id },
          create: {
            legacyNeo4jId: c.id,
            name: safeName,
            description: safeDescription,
            // subject/source/gradeLevel 不在 Concept 表中（schema 仅保留核心字段）
          },
          update: {
            name: safeName,
            description: safeDescription,
          },
          select: { id: true, createdAt: true, updatedAt: true },
        });

        // 通过 createdAt/updatedAt 差异近似判断 created vs updated
        if (result.createdAt.getTime() === result.updatedAt.getTime()) {
          created++;
        } else {
          updated++;
        }
      } catch (err) {
        failed++;
        const msg = err instanceof Error ? err.message : String(err);
        console.warn(`   ⚠️  失败 [${c.id}]: ${msg.slice(0, 120)}`);
      }
    }
  }

  console.log(`   ✅ 完成: 新增 ${created} / 更新 ${updated} / 失败 ${failed}`);
  return { created, updated, failed };
}

// ──────────────────────────────────────────────
// 3. 建立 legacyNeo4jId → int id 映射
// ──────────────────────────────────────────────

async function buildLegacyToIdMap(): Promise<Map<string, number>> {
  console.log('\n🗺️  [Phase 2] 构建 legacyNeo4jId → id 映射');

  // 分页拉取（PostgreSQL 单次查询在大量数据下可能超时）
  const map = new Map<string, number>();
  const PAGE = 1000;
  let skip = 0;

  while (true) {
    const rows = await prisma.concept.findMany({
      where: { legacyNeo4jId: { not: null } },
      select: { id: true, legacyNeo4jId: true },
      skip,
      take: PAGE,
    });
    if (rows.length === 0) break;
    for (const r of rows) {
      if (r.legacyNeo4jId) map.set(r.legacyNeo4jId, r.id);
    }
    skip += PAGE;
    if (rows.length < PAGE) break;
  }

  console.log(`   ✅ 已映射 ${map.size} 个概念`);
  return map;
}

// ──────────────────────────────────────────────
// 4. 导入 ConceptDependency（createMany skipDuplicates）
//    区分"数据完整性跳过"与"真实 DB 错误"
// ──────────────────────────────────────────────

async function importDependencies(
  dependencies: ExportedDependency[],
  legacyMap: Map<string, number>,
  dryRun: boolean,
) {
  console.log(`\n📥 [Phase 3] 导入 ConceptDependency 表${dryRun ? ' (DRY-RUN)' : ''}`);
  console.log(`   待处理: ${dependencies.length} 条`);

  let inserted = 0;
  let dbErrors = 0;
  let dataSkipped = 0;
  const skippedMissingConcept: string[] = [];
  const skippedUnknownType: string[] = [];
  const skippedSelfLoop: string[] = [];

  if (dryRun) {
    return { inserted, dbErrors, dataSkipped };
  }

  // 预映射 + 校验（区分"数据完整性跳过"与"真实 DB 错误"）
  const records: { prerequisiteId: number; dependentId: number; pathType: string }[] = [];
  for (const d of dependencies) {
    const preId = legacyMap.get(d.sourceId);
    const depId = legacyMap.get(d.targetId);

    if (!preId || !depId) {
      skippedMissingConcept.push(`${d.sourceId} → ${d.targetId}`);
      dataSkipped++;
      continue;
    }
    if (preId === depId) {
      skippedSelfLoop.push(`${d.sourceId} → ${d.targetId}`);
      dataSkipped++;
      continue;
    }
    const pathType = RELATIONSHIP_TO_PATH_TYPE[d.relationshipType];
    if (!pathType) {
      skippedUnknownType.push(`${d.relationshipType}: ${d.sourceId} → ${d.targetId}`);
      dataSkipped++;
      continue;
    }
    records.push({ prerequisiteId: preId, dependentId: depId, pathType });
  }

  console.log(`   有效记录: ${records.length} 条`);
  if (skippedMissingConcept.length > 0) {
    console.log(`   ⚠️  跳过 (源/目标未找到 Concept): ${skippedMissingConcept.length} 条`);
    if (skippedMissingConcept.length <= 5) {
      skippedMissingConcept.forEach(s => console.log(`      - ${s}`));
    }
  }
  if (skippedSelfLoop.length > 0) {
    console.log(`   ⚠️  跳过 (自环): ${skippedSelfLoop.length} 条`);
    if (skippedSelfLoop.length <= 5) {
      skippedSelfLoop.forEach(s => console.log(`      - ${s}`));
    }
  }
  if (skippedUnknownType.length > 0) {
    console.log(`   ⚠️  跳过 (未知关系类型): ${skippedUnknownType.length} 条`);
    if (skippedUnknownType.length <= 5) {
      skippedUnknownType.forEach(s => console.log(`      - ${s}`));
    }
  }

  for (const batch of chunk(records, BATCH_SIZE)) {
    try {
      const result = await prisma.conceptDependency.createMany({
        data: batch,
        skipDuplicates: true, // 主键 (prerequisiteId, dependentId, pathType) 冲突时跳过
      });
      inserted += result.count;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`   ❌ 批次插入失败 (${batch.length} 条): ${msg.slice(0, 200)}`);
      dbErrors += batch.length;
    }
  }

  console.log(`   ✅ 完成: 插入 ${inserted} / 真实错误 ${dbErrors} / 数据跳过 ${dataSkipped}`);
  return { inserted, dbErrors, dataSkipped };
}

// ──────────────────────────────────────────────
// 5. 重建闭包表 ConceptPath
// ──────────────────────────────────────────────

async function rebuildClosure(dryRun: boolean) {
  console.log(`\n🔨 [Phase 4] 重建闭包表 ConceptPath${dryRun ? ' (DRY-RUN)' : ''}`);

  if (dryRun) {
    return {
      byType: {} as Record<string, { rowsAffected: number; elapsedMs: number }>,
      totalRows: 0,
      totalElapsedMs: 0,
    };
  }

  const result = await rebuildAllClosure();

  console.log(`   ✅ 完成: 总计 ${result.totalRows} 行, 耗时 ${result.elapsedMs}ms`);
  for (const [type, stat] of Object.entries(result.byType)) {
    console.log(`      - path_type="${type}": ${stat.rowsAffected} 行 (${stat.elapsedMs}ms)`);
  }

  return {
    byType: Object.fromEntries(
      Object.entries(result.byType).map(([k, v]) => [
        k,
        { rowsAffected: v.rowsAffected, elapsedMs: v.elapsedMs },
      ]),
    ),
    totalRows: result.totalRows,
    totalElapsedMs: result.elapsedMs,
  };
}

// ──────────────────────────────────────────────
// 主流程
// ──────────────────────────────────────────────

async function main() {
  const startTime = Date.now();
  const startedAt = new Date().toISOString();

  console.log('='.repeat(64));
  console.log('🔄 知识图谱迁移 — JSON → PostgreSQL 闭包表');
  console.log('='.repeat(64));
  if (isDryRun) {
    console.log('⚠️  DRY-RUN 模式：不会写入数据库');
  }

  // 0. 连接数据库 + 取迁移前快照
  console.log('\n🔗 连接数据库...');
  try {
    await prisma.$connect();
    console.log('   ✅ 连接成功');
  } catch (e) {
    console.error('   ❌ 连接失败:', e);
    process.exit(1);
  }

  const before = {
    concepts: await prisma.concept.count(),
    dependencies: await prisma.conceptDependency.count(),
    conceptPathRows: await prisma.$queryRaw<{ count: bigint }[]>`SELECT COUNT(*) as count FROM concept_path`.then(r => Number(r[0].count)),
  };
  console.log(`\n📊 迁移前数据库状态:`);
  console.log(`   - Concept:           ${before.concepts}`);
  console.log(`   - ConceptDependency: ${before.dependencies}`);
  console.log(`   - ConceptPath:       ${before.conceptPathRows}`);

  // 1. 加载源数据
  const { concepts, dependencies, conceptsMeta, dependenciesMeta } = loadSourceData();

  const warnings: string[] = [];

  // 2. Phase 1: 导入 Concept
  const c1 = await importConcepts(concepts, isDryRun);

  // 3. Phase 2: 构建映射
  const legacyMap = isDryRun ? new Map<string, number>() : await buildLegacyToIdMap();

  if (!isDryRun && legacyMap.size < concepts.length * 0.9) {
    const warn = `映射覆盖率偏低: ${legacyMap.size}/${concepts.length} (${((legacyMap.size / concepts.length) * 100).toFixed(1)}%)`;
    warnings.push(warn);
    console.warn(`   ⚠️  ${warn}`);
  }

  // 4. Phase 3: 导入 ConceptDependency
  const c3 = await importDependencies(dependencies, legacyMap, isDryRun);

  // 5. Phase 4: 重建闭包表
  const closure = await rebuildClosure(isDryRun);

  // 6. 迁移后快照
  const after = {
    concepts: await prisma.concept.count(),
    dependencies: await prisma.conceptDependency.count(),
    conceptPathRows: await prisma.$queryRaw<{ count: bigint }[]>`SELECT COUNT(*) as count FROM concept_path`.then(r => Number(r[0].count)),
  };

  const finishedAt = new Date().toISOString();
  const durationMs = Date.now() - startTime;

  // 7. 输出汇总
  console.log('\n' + '='.repeat(64));
  console.log('📋 迁移汇总');
  console.log('='.repeat(64));
  console.log(`  模式:         ${isDryRun ? 'DRY-RUN' : '实际执行'}`);
  console.log(`  Concept:      新增 ${c1.created} / 更新 ${c1.updated} / 失败 ${c1.failed}`);
  console.log(`  Dependency:   插入 ${c3.inserted} / 数据跳过 ${c3.dataSkipped} / DB错误 ${c3.dbErrors}`);
  console.log(`  Closure:      新增 ${closure.totalRows} 行 (${closure.totalElapsedMs}ms)`);
  console.log(`  数据库变化:`);
  const cDelta = after.concepts - before.concepts;
  const dDelta = after.dependencies - before.dependencies;
  const pDelta = after.conceptPathRows - before.conceptPathRows;
  const fmt = (n: number) => (n >= 0 ? `+${n}` : `${n}`);
  console.log(`    - Concept:           ${before.concepts} → ${after.concepts}  (Δ ${fmt(cDelta)})`);
  console.log(`    - ConceptDependency: ${before.dependencies} → ${after.dependencies}  (Δ ${fmt(dDelta)})`);
  console.log(`    - ConceptPath:       ${before.conceptPathRows} → ${after.conceptPathRows}  (Δ ${fmt(pDelta)})`);
  console.log(`  总耗时:       ${durationMs}ms`);

  // 8. 保存报告
  const report: MigrationReport = {
    startedAt,
    finishedAt,
    durationMs,
    dryRun: isDryRun,
    sourceFiles: {
      conceptsFile: CONCEPTS_FILE,
      dependenciesFile: DEPENDENCIES_FILE,
      conceptsExportedAt: conceptsMeta.exportedAt,
      dependenciesExportedAt: dependenciesMeta.exportedAt,
    },
    stats: {
      conceptsRead: concepts.length,
      conceptsCreated: c1.created,
      conceptsUpdated: c1.updated,
      conceptsFailed: c1.failed,
      dependenciesRead: dependencies.length,
      dependenciesInserted: c3.inserted,
      dependenciesDataSkipped: c3.dataSkipped,
      dependenciesDbErrors: c3.dbErrors,
      closureByType: closure.byType,
      closureTotalRows: closure.totalRows,
      closureTotalElapsedMs: closure.totalElapsedMs,
    },
    dbCounts: {
      conceptsBefore: before.concepts,
      dependenciesBefore: before.dependencies,
      conceptPathRowsBefore: before.conceptPathRows,
      conceptsAfter: after.concepts,
      dependenciesAfter: after.dependencies,
      conceptPathRowsAfter: after.conceptPathRows,
    },
    warnings,
  };

  if (!isDryRun) {
    saveJsonFile(REPORT_FILE, report);
    console.log(`\n📁 迁移报告已保存: ${REPORT_FILE}`);
  } else {
    console.log(`\n📁 DRY-RUN 模式，未保存报告`);
  }

  await prisma.$disconnect();
  console.log('\n👋 数据库连接已关闭');

  // 退出码：仅在真实 DB 错误时返回 1（数据完整性跳过不算错误）
  if (!isDryRun && c3.dbErrors > 0) {
    console.error(`\n⚠️  有真实 DB 错误，请检查上方输出`);
    process.exit(1);
  }
}

main().catch(err => {
  console.error('\n💥 迁移过程出错:', err);
  prisma.$disconnect().finally(() => process.exit(1));
});