/**
 * 闭包表维护验收测试
 *
 * 覆盖 AC-3 / AC-4 / AC-5:
 *   - 新增依赖后闭包自动更新
 *   - 删除依赖后查询结果正确
 *   - path_type 隔离 (required vs optional)
 *
 * 使用: npx tsx scripts/test-closure-maintenance.ts
 */

import * as path from 'path';
import * as dotenv from 'dotenv';
import prisma from '../lib/db';
import {
  addDependency,
  removeDependency,
  getPrerequisites,
  getSuccessors,
  createConcept,
  deleteConcept,
} from '../lib/concept-path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

if (!process.env.DATABASE_URL) {
  console.error('❌ 未找到 DATABASE_URL');
  process.exit(1);
}

const TEST_PREFIX = '__closure_test__';
let createdIds: number[] = [];

async function cleanup() {
  for (const id of [...createdIds].reverse()) {
    try {
      await deleteConcept(id);
    } catch {
      // ignore
    }
  }
  createdIds = [];
}

async function createTestConcept(name: string): Promise<number> {
  const c = await createConcept({
    name: `${TEST_PREFIX}${name}`,
    description: 'closure maintenance test',
  });
  createdIds.push(c.id);
  return c.id;
}

async function testAddDependencyUpdatesClosure(): Promise<boolean> {
  console.log('\n📋 测试 1: 新增依赖 → 闭包自动更新');

  const a = await createTestConcept('A');
  const b = await createTestConcept('B');
  const c = await createTestConcept('C');

  await addDependency(a, b, 'required');
  await addDependency(b, c, 'required');

  const prereqsC = await getPrerequisites(c, 'required');
  const hasA = prereqsC.some((p) => p.id === a);
  const hasB = prereqsC.some((p) => p.id === b);

  const succsA = await getSuccessors(a, 'required');
  const hasC = succsA.some((s) => s.id === c);

  const directClosure = await prisma.$queryRaw<{ depth: number }[]>`
    SELECT depth FROM concept_path
    WHERE ancestor_id = ${a} AND descendant_id = ${c}
      AND path_type = 'required'
  `;

  const ok = hasA && hasB && hasC && directClosure.length > 0 && Number(directClosure[0].depth) === 2;
  console.log(ok ? '   ✅ 通过' : '   ❌ 失败', { hasA, hasB, hasC, transitiveDepth: directClosure[0]?.depth });
  return ok;
}

async function testRemoveDependencyRebuilds(): Promise<boolean> {
  console.log('\n📋 测试 2: 删除依赖 → 闭包重建');

  const a = await createTestConcept('RA');
  const b = await createTestConcept('RB');
  const c = await createTestConcept('RC');

  await addDependency(a, b, 'required');
  await addDependency(b, c, 'required');

  await removeDependency(b, c, 'required');

  const prereqsC = await getPrerequisites(c, 'required');
  const stillHasB = prereqsC.some((p) => p.id === b);
  const stillHasA = prereqsC.some((p) => p.id === a);

  const succsB = await getSuccessors(b, 'required');
  const stillHasC = succsB.some((s) => s.id === c);

  const ok = !stillHasB && !stillHasA && !stillHasC;
  console.log(ok ? '   ✅ 通过' : '   ❌ 失败', { stillHasB, stillHasA, stillHasC });
  return ok;
}

async function testPathTypeIsolation(): Promise<boolean> {
  console.log('\n📋 测试 3: path_type 隔离 (required vs optional)');

  const a = await createTestConcept('PA');
  const b = await createTestConcept('PB');

  await addDependency(a, b, 'required');
  await addDependency(a, b, 'optional');

  const requiredPrereqs = await getPrerequisites(b, 'required');
  const optionalPrereqs = await getPrerequisites(b, 'optional');

  const requiredOnly = requiredPrereqs.some((p) => p.id === a);
  const optionalOnly = optionalPrereqs.some((p) => p.id === a);

  const crossCheck = await prisma.$queryRaw<{ cnt: bigint }[]>`
    SELECT COUNT(*) as cnt FROM concept_path
    WHERE ancestor_id = ${a} AND descendant_id = ${b}
      AND path_type = 'required' AND depth = 1
  `;

  const ok = requiredOnly && optionalOnly && Number(crossCheck[0].cnt) === 1;
  console.log(ok ? '   ✅ 通过' : '   ❌ 失败', { requiredOnly, optionalOnly });
  return ok;
}

async function testCycleRejection(): Promise<boolean> {
  console.log('\n📋 测试 4: 环检测拒绝');

  const a = await createTestConcept('CA');
  const b = await createTestConcept('CB');

  await addDependency(a, b, 'required');

  let rejected = false;
  try {
    await addDependency(b, a, 'required');
  } catch (e) {
    rejected = (e as Error).message.includes('环') || (e as Error).message.includes('循环');
  }

  console.log(rejected ? '   ✅ 通过 (正确拒绝)' : '   ❌ 失败 (未检测到环)');
  return rejected;
}

async function main() {
  console.log('='.repeat(64));
  console.log('🔧 闭包表维护验收测试');
  console.log('='.repeat(64));

  const results: boolean[] = [];

  try {
    await prisma.$connect();

    results.push(await testAddDependencyUpdatesClosure());
    await cleanup();

    results.push(await testRemoveDependencyRebuilds());
    await cleanup();

    results.push(await testPathTypeIsolation());
    await cleanup();

    results.push(await testCycleRejection());
  } finally {
    await cleanup();
    await prisma.$disconnect();
  }

  const passed = results.filter(Boolean).length;
  const failed = results.length - passed;

  console.log('\n' + '='.repeat(64));
  console.log(`📊 结果: ${passed}/${results.length} 通过, ${failed} 失败`);
  console.log('='.repeat(64));

  process.exit(failed === 0 ? 0 : 1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
