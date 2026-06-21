/**
 * PostgreSQL 数据库 K12 学科类课件清理脚本
 *
 * 扫描 Course、Tutorial、Courseware 三张表，
 * 移除其中的 K12 学科类课程条目，只保留 STEM 非学科教育内容。
 *
 * 使用: npx tsx scripts/clean-db-k12.ts
 */

import * as path from 'path';
import * as dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { isK12Academic } from '../lib/k12-filter';

// 加载环境变量
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

interface K12Check {
  title?: string;
  subject?: string;
  source?: string;
  grade_level?: string;
  description?: string;
}

interface DbStats {
  table: string;
  total: number;
  removed: number;
  errors: number;
}

const prisma = new PrismaClient();

function toK12Check(item: {
  title?: string;
  subject?: string;
  source?: string;
  gradeLevel?: string | null;
  description?: string | null;
  [key: string]: unknown;
}): K12Check {
  return {
    title: item.title,
    subject: item.subject,
    source: item.source,
    grade_level: item.gradeLevel ?? undefined,
    description: item.description ?? undefined,
  };
}

async function cleanCoursewares(): Promise<DbStats> {
  console.log('\n📄 课件表 (courseware)');
  const all = await prisma.courseware.findMany();
  console.log(`   总记录数: ${all.length}`);

  let removed = 0;
  let errors = 0;

  for (const item of all) {
    try {
      if (isK12Academic(toK12Check(item as unknown as Record<string, unknown>))) {
        console.log(`  🗑️  过滤: [${item.subject}] ${item.title}`);
        await prisma.courseware.delete({ where: { id: item.id } });
        removed++;
      }
    } catch (e) {
      console.error(`  ❌ 删除失败: [${item.subject}] ${item.title} - ${e}`);
      errors++;
    }
  }

  if (removed > 0) {
    console.log(`  ✅ 已移除 ${removed} 条 K12 学科类课件`);
  } else {
    console.log(`  ✅ 无 K12 内容需要清理`);
  }
  if (errors > 0) {
    console.log(`  ⚠️   ${errors} 条删除失败`);
  }

  return { table: 'courseware', total: all.length, removed, errors };
}

async function cleanTutorials(): Promise<DbStats> {
  console.log('\n📄 教程表 (tutorial)');
  const all = await prisma.tutorial.findMany();
  console.log(`   总记录数: ${all.length}`);

  let removed = 0;
  let errors = 0;

  for (const item of all) {
    try {
      if (isK12Academic(toK12Check(item as unknown as Record<string, unknown>))) {
        console.log(`  🗑️  过滤: [${item.subject}] ${item.title}`);
        await prisma.tutorial.delete({ where: { id: item.id } });
        removed++;
      }
    } catch (e) {
      console.error(`  ❌ 删除失败: [${item.subject}] ${item.title} - ${e}`);
      errors++;
    }
  }

  if (removed > 0) {
    console.log(`  ✅ 已移除 ${removed} 条 K12 学科类教程`);
  } else {
    console.log(`  ✅ 无 K12 内容需要清理`);
  }
  if (errors > 0) {
    console.log(`  ⚠️   ${errors} 条删除失败`);
  }

  return { table: 'tutorial', total: all.length, removed, errors };
}

async function cleanCourses(): Promise<DbStats> {
  console.log('\n📄 课程表 (course)');
  const all = await prisma.course.findMany();
  console.log(`   总记录数: ${all.length}`);

  let removed = 0;
  let errors = 0;

  for (const item of all) {
    try {
      if (isK12Academic(toK12Check(item as unknown as Record<string, unknown>))) {
        console.log(`  🗑️  过滤: [${item.subject}] ${item.title}`);
        await prisma.course.delete({ where: { id: item.id } });
        removed++;
      }
    } catch (e) {
      console.error(`  ❌ 删除失败: [${item.subject}] ${item.title} - ${e}`);
      errors++;
    }
  }

  if (removed > 0) {
    console.log(`  ✅ 已移除 ${removed} 条 K12 学科类课程`);
  } else {
    console.log(`  ✅ 无 K12 内容需要清理`);
  }
  if (errors > 0) {
    console.log(`  ⚠️   ${errors} 条删除失败`);
  }

  return { table: 'course', total: all.length, removed, errors };
}

async function main() {
  console.log('='.repeat(60));
  console.log('🗄️  PostgreSQL 数据库 K12 学科类数据清理工具');
  console.log('='.repeat(60));
  console.log('\n正在连接数据库...');

  try {
    // 测试连接
    await prisma.$connect();
    console.log('✅ 数据库连接成功\n');
  } catch (e) {
    console.error('❌ 数据库连接失败:', e);
    process.exit(1);
  }

  const results: DbStats[] = [];

  try {
    results.push(await cleanCoursewares());
  } catch (e) {
    console.error('❌ 清理课件表失败:', e);
    results.push({ table: 'courseware', total: -1, removed: 0, errors: 1 });
  }

  try {
    results.push(await cleanTutorials());
  } catch (e) {
    console.error('❌ 清理教程表失败:', e);
    results.push({ table: 'tutorial', total: -1, removed: 0, errors: 1 });
  }

  try {
    results.push(await cleanCourses());
  } catch (e) {
    console.error('❌ 清理课程表失败:', e);
    results.push({ table: 'course', total: -1, removed: 0, errors: 1 });
  }

  const totalRemoved = results.reduce((sum, r) => sum + r.removed, 0);
  const totalErrors = results.reduce((sum, r) => sum + r.errors, 0);

  console.log('\n' + '='.repeat(60));
  console.log('📊 清理汇总');
  console.log('='.repeat(60));
  for (const r of results) {
    if (r.total >= 0) {
      console.log(`  ${r.table.padEnd(15)} 总 ${r.total} 条，移除 ${r.removed} 条`);
    } else {
      console.log(`  ${r.table.padEnd(15)} ❌ 处理失败`);
    }
  }
  console.log(`  ${''.padEnd(15)} ─────────────────`);
  console.log(`  ${'总计'.padEnd(15)} 移除 ${totalRemoved} 条${totalErrors > 0 ? `，${totalErrors} 个错误` : ''}`);

  if (totalRemoved === 0 && totalErrors === 0) {
    console.log('\n💡 提示: 数据库中已无 K12 学科类内容，数据干净。');
  }

  await prisma.$disconnect();
  console.log('\n👋 数据库连接已关闭');
}

main();
