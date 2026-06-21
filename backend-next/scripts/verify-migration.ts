/**
 * 知识图谱迁移验收脚本
 *
 * 验证以下内容：
 *   1. PostgreSQL 闭包表数据完整性
 *   2. 关键 API 端点的可用性（自引用、前置依赖、后续节点、路径查找）
 *   3. 迁移报告与实际数据库的一致性
 *
 * 使用：npx tsx scripts/verify-migration.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import prisma from '../lib/db';
import { getPrerequisites, getSuccessors, findRoute } from '../lib/concept-path';

// ──────────────────────────────────────────────
// 启动前检查
// ──────────────────────────────────────────────

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

if (!process.env.DATABASE_URL) {
  console.error('❌ 未找到 DATABASE_URL 环境变量');
  console.error('   请确保 backend-next/.env.local 存在且包含 DATABASE_URL');
  process.exit(1);
}

// ──────────────────────────────────────────────
// 类型定义
// ──────────────────────────────────────────────

interface CheckResult {
  name: string;
  passed: boolean;
  message: string;
  details?: unknown;
}

// ──────────────────────────────────────────────
// 工具
// ──────────────────────────────────────────────

const results: CheckResult[] = [];

function record(name: string, passed: boolean, message: string, details?: unknown) {
  results.push({ name, passed, message, details });
  const icon = passed ? '✅' : '❌';
  console.log(`   ${icon} ${name}: ${message}`);
}

// ──────────────────────────────────────────────
// 检查 1：基础数据量
// ──────────────────────────────────────────────

async function checkBasicCounts() {
  console.log('\n📋 检查 1: 基础数据量');

  const conceptCount = await prisma.concept.count();
  const conceptWithLegacy = await prisma.concept.count({
    where: { legacyNeo4jId: { not: null } },
  });
  const depCount = await prisma.conceptDependency.count();
  const selfRefs = await prisma.$queryRaw<{ count: bigint }[]>`
    SELECT COUNT(*) as count FROM concept_path WHERE ancestor_id = descendant_id
  `.then(r => Number(r[0].count));
  const totalClosure = await prisma.$queryRaw<{ count: bigint }[]>`
    SELECT COUNT(*) as count FROM concept_path
  `.then(r => Number(r[0].count));

  record(
    'Concept 总数',
    conceptCount >= 1461,
    `数据库有 ${conceptCount} 条 Concept (期望 ≥ 1461)`,
    { conceptCount }
  );

  record(
    'Concept 含 legacy_neo4j_id',
    conceptWithLegacy === conceptCount,
    `${conceptWithLegacy}/${conceptCount} 有 legacy ID`,
    { conceptWithLegacy, conceptCount }
  );

  record(
    'ConceptDependency 总数',
    depCount >= 1400,
    `数据库有 ${depCount} 条依赖 (期望 ≥ 1400)`,
    { depCount }
  );

  record(
    '闭包表自引用',
    selfRefs === conceptCount,
    `${selfRefs}/${conceptCount} 概念有 (id,id,0) 自引用`,
    { selfRefs, conceptCount }
  );

  record(
    '闭包表总行数',
    totalClosure > conceptCount,
    `${totalClosure} 行 (应大于概念数 ${conceptCount})`,
    { totalClosure, conceptCount }
  );
}

// ──────────────────────────────────────────────
// 检查 2：lib/concept-path.ts 函数可用性
// ──────────────────────────────────────────────

async function checkConceptPathFunctions() {
  console.log('\n📋 检查 2: lib/concept-path.ts 函数可用性');

  // ConceptDependency 模型只有 prerequisiteId / dependentId / pathType 字段（无 depth）
  const sampleDep = await prisma.conceptDependency.findFirst({
    where: { pathType: 'required' },
  });

  if (!sampleDep) {
    record('样本概念查找', false, '未找到任何 ConceptDependency，跳过后续检查');
    return;
  }

  const prereqId = sampleDep.prerequisiteId;
  const depId = sampleDep.dependentId;

  // 2a: getPrerequisites
  try {
    const prereqs = await getPrerequisites(depId, 'required');
    record(
      'getPrerequisites()',
      Array.isArray(prereqs),
      `目标概念 #${depId} 有 ${prereqs.length} 个前置依赖`,
      { sample: prereqs.slice(0, 3) }
    );
  } catch (e) {
    record('getPrerequisites()', false, `异常: ${(e as Error).message}`);
  }

  // 2b: getSuccessors
  try {
    const succs = await getSuccessors(prereqId, 'required');
    record(
      'getSuccessors()',
      Array.isArray(succs),
      `起点概念 #${prereqId} 有 ${succs.length} 个后续节点`,
      { sample: succs.slice(0, 3) }
    );
  } catch (e) {
    record('getSuccessors()', false, `异常: ${(e as Error).message}`);
  }

  // 2c: findRoute（找一个深度 ≥ 2 的路径样本）
  try {
    const deepPath = await prisma.$queryRaw<{ ancestor_id: number; descendant_id: number }[]>`
      SELECT ancestor_id, descendant_id FROM concept_path
      WHERE depth >= 2 AND depth <= 5 AND ancestor_id != descendant_id
      LIMIT 1
    `;
    if (deepPath.length === 0) {
      record('findRoute()', false, '未找到深度 ≥ 2 的路径样本');
    } else {
      const route = await findRoute(deepPath[0].ancestor_id, deepPath[0].descendant_id, 'required');
      record(
        'findRoute()',
        route !== null,
        `从 #${deepPath[0].ancestor_id} → #${deepPath[0].descendant_id} 找到路径 (深度 ${route?.depth ?? 'N/A'})`,
        { pathLength: route?.path.length }
      );
    }
  } catch (e) {
    record('findRoute()', false, `异常: ${(e as Error).message}`);
  }
}

// ──────────────────────────────────────────────
// 检查 3：传递性抽样验证
// ──────────────────────────────────────────────

async function checkTransitivity() {
  console.log('\n📋 检查 3: 传递性抽样验证');

  // 抽样：A→B 和 B→C 都存在时，A→C 应存在
  const samples = await prisma.$queryRaw<{
    a_id: number;
    b_id: number;
    c_id: number;
  }[]>`
    SELECT cp1.ancestor_id as a_id, cp1.descendant_id as b_id, cp2.descendant_id as c_id
    FROM concept_path cp1
    JOIN concept_path cp2
      ON cp1.descendant_id = cp2.ancestor_id
      AND cp1.path_type = cp2.path_type
    WHERE cp1.depth = 1 AND cp2.depth = 1
      AND cp1.ancestor_id != cp2.descendant_id
      AND cp1.ancestor_id != cp1.descendant_id
    LIMIT 5
  `;

  let passCount = 0;
  for (const s of samples) {
    const transitive = await prisma.$queryRaw<{ depth: number }[]>`
      SELECT depth FROM concept_path
      WHERE ancestor_id = ${s.a_id}
        AND descendant_id = ${s.c_id}
        AND path_type = 'required'
    `;
    if (transitive.length > 0) passCount++;
  }

  record(
    '传递性闭包',
    samples.length === 0 || passCount === samples.length,
    `抽样 ${samples.length} 条，A→C 都通过闭包可达 (通过 ${passCount})`,
    { passCount, total: samples.length }
  );
}

// ──────────────────────────────────────────────
// 检查 4：迁移报告与数据库一致性
// ──────────────────────────────────────────────

async function checkReportConsistency() {
  console.log('\n📋 检查 4: 迁移报告与数据库一致性');

  const reportPath = path.join(process.cwd(), 'scripts', 'migration-output', 'migration-report.json');
  if (!fs.existsSync(reportPath)) {
    record('迁移报告存在', false, `文件不存在: ${reportPath}`);
    return;
  }

  const report = JSON.parse(fs.readFileSync(reportPath, 'utf-8'));

  record(
    '迁移报告存在',
    true,
    `报告生成于 ${report.finishedAt}`,
    { duration: report.durationMs }
  );

  const currentClosure = await prisma.$queryRaw<{ count: bigint }[]>`
    SELECT COUNT(*) as count FROM concept_path
  `.then(r => Number(r[0].count));

  record(
    '闭包表行数与报告一致',
    Math.abs(currentClosure - report.dbCounts.conceptPathRowsAfter) < 50,
    `当前 ${currentClosure} 行 vs 报告 ${report.dbCounts.conceptPathRowsAfter} 行 (差异 < 50 视为一致)`,
    { current: currentClosure, reported: report.dbCounts.conceptPathRowsAfter }
  );

  record(
    '迁移报告无 warnings',
    report.warnings.length === 0,
    `${report.warnings.length} 条警告`,
    { warnings: report.warnings }
  );
}

// ──────────────────────────────────────────────
// 检查 5：查询性能 (AC-6: P95 < 50ms)
// ──────────────────────────────────────────────

async function checkQueryPerformance() {
  console.log('\n📋 检查 5: 查询性能 (P95 < 50ms)');

  const conceptCount = await prisma.concept.count();
  const samples = await prisma.$queryRaw<Array<{ id: number }>>`
    SELECT id FROM concept ORDER BY RANDOM() LIMIT 50
  `;

  if (samples.length === 0) {
    record('性能基准', false, '无概念数据，跳过');
    return;
  }

  const latencies: number[] = [];

  for (const s of samples) {
    const t0 = performance.now();
    await getPrerequisites(s.id, 'required');
    await getSuccessors(s.id, 'required');
    latencies.push(performance.now() - t0);
  }

  latencies.sort((a, b) => a - b);
  const p50 = latencies[Math.floor(latencies.length * 0.5)];
  const p95 = latencies[Math.floor(latencies.length * 0.95)];
  const max = latencies[latencies.length - 1];

  const threshold = conceptCount <= 5000 ? 50 : 100;
  const passed = p95 < threshold;

  record(
    '查询 P95 延迟',
    passed,
    `P50=${p50.toFixed(1)}ms P95=${p95.toFixed(1)}ms Max=${max.toFixed(1)}ms (阈值 ${threshold}ms, 概念数 ${conceptCount})`,
    { p50, p95, max, threshold, conceptCount, samples: latencies.length }
  );
}

// ──────────────────────────────────────────────
// 主流程
// ──────────────────────────────────────────────

async function main() {
  console.log('='.repeat(64));
  console.log('🔍 知识图谱迁移 — 验收检查');
  console.log('='.repeat(64));

  try {
    await prisma.$connect();
    console.log('\n🔗 数据库连接成功');
  } catch (e) {
    console.error('❌ 数据库连接失败:', e);
    process.exit(1);
  }

  await checkBasicCounts();
  await checkConceptPathFunctions();
  await checkTransitivity();
  await checkReportConsistency();
  await checkQueryPerformance();

  // 汇总
  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;

  console.log('\n' + '='.repeat(64));
  console.log('📋 验收汇总');
  console.log('='.repeat(64));
  console.log(`  ✅ 通过: ${passed}`);
  console.log(`  ❌ 失败: ${failed}`);
  console.log(`  📊 总计: ${results.length}`);

  if (failed > 0) {
    console.log('\n❌ 失败的检查项:');
    results.filter(r => !r.passed).forEach(r => {
      console.log(`   - ${r.name}: ${r.message}`);
    });
  }

  await prisma.$disconnect();
  console.log('\n👋 数据库连接已关闭');

  process.exit(failed === 0 ? 0 : 1);
}

main().catch(err => {
  console.error('\n💥 验收过程出错:', err);
  prisma.$disconnect().finally(() => process.exit(1));
});