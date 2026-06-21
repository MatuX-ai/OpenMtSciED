/**
 * 高效批量清理数据库中剩余 K12 学科内容
 *
 * 使用: npx tsx scripts/clean-k12-remaining.ts
 */

import * as path from 'path';
import * as dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const prisma = new PrismaClient();

const ACADEMIC_BLACKLIST = ['语文', '数学', '英语', '外语', '政治', '历史', '地理', '思想品德', '道德与法治'];
const AMBIGUOUS = ['物理', '化学', '生物', '科学'];

async function main() {
  console.log('='.repeat(60));
  console.log('🗑️  批量清理 K12 学科内容（PostgreSQL）');
  console.log('='.repeat(60));

  // === Course 表 ===
  console.log('\n📚 Course 表');

  // 1. 硬黑名单学科：直接批量删除
  let totalRemoved = 0;
  for (const subj of ACADEMIC_BLACKLIST) {
    const result = await prisma.course.deleteMany({ where: { subject: subj } });
    if (result.count > 0) {
      console.log(`  🗑️  ${subj}: 删除 ${result.count} 条`);
      totalRemoved += result.count;
    }
  }

  // 2. 可凝学科（物理/化学/生物/科学）：按来源过滤
  //    保留来源为 openscied / mit 的探究式内容，删除其他（如 k12_curriculum）
  for (const subj of AMBIGUOUS) {
    const all = await prisma.course.findMany({ where: { subject: subj }, select: { id: true, source: true, title: true } });

    let removed = 0;
    let kept = 0;
    for (const item of all) {
      const src = (item.source || '').toLowerCase();
      // OpenSciEd / MIT OCW → 保留（现象驱动探究）
      if (src.includes('openscied') || src.includes('mit') || src.includes('mit_ocw')) {
        kept++;
        continue;
      }
      // 其他来源（包括 k12_curriculum）→ 删除 K12 标准学科
      await prisma.course.delete({ where: { id: item.id } });
      removed++;
      totalRemoved++;
    }
    if (removed > 0) console.log(`  🗑️  ${subj}: 删除 ${removed} 条（保留 ${kept} 条 STEM）`);
  }

  // 3. 经济学：非大学级别
  const econAll = await prisma.course.findMany({
    where: { OR: [{ subject: '经济' }, { subject: '经济学' }] },
    select: { id: true, title: true, gradeLevel: true },
  });
  if (econAll.length > 0) {
    let removedEcon = 0;
    for (const e of econAll) {
      if (!e.gradeLevel?.toLowerCase().includes('university')) {
        await prisma.course.delete({ where: { id: e.id } });
        removedEcon++;
        totalRemoved++;
      }
    }
    if (removedEcon > 0) console.log(`  🗑️  经济学: 删除 ${removedEcon} 条（保留大学级别）`);
  }

  if (totalRemoved === 0) console.log('  ✅ 无 K12 内容需要清理');

  // === Courseware 表（检查，应该已干净）===
  console.log('\n📄 Courseware 表');
  const cwAll = await prisma.courseware.findMany({ select: { id: true, subject: true, title: true } });
  let cwRemoved = 0;
  for (const c of cwAll) {
    if (ACADEMIC_BLACKLIST.includes(c.subject)) {
      await prisma.courseware.delete({ where: { id: c.id } });
      cwRemoved++;
      totalRemoved++;
    }
  }
  if (cwRemoved > 0) console.log(`  🗑️  课件表: 删除 ${cwRemoved} 条`);
  else console.log('  ✅ 无 K12 内容');

  // === Tutorial 表（检查）===
  console.log('\n📖 Tutorial 表');
  const tAll = await prisma.tutorial.findMany({ select: { id: true, subject: true, title: true } });
  let tRemoved = 0;
  for (const t of tAll) {
    if (ACADEMIC_BLACKLIST.includes(t.subject)) {
      await prisma.tutorial.delete({ where: { id: t.id } });
      tRemoved++;
      totalRemoved++;
    }
  }
  if (tRemoved > 0) console.log(`  🗑️  教程表: 删除 ${tRemoved} 条`);
  else console.log('  ✅ 无 K12 内容');

  // === 最终统计 ===
  const [courseCount, coursewareCount, tutorialCount] = await Promise.all([
    prisma.course.count(),
    prisma.courseware.count(),
    prisma.tutorial.count(),
  ]);

  console.log('\n' + '='.repeat(60));
  console.log(`📊 清理完成: 共删除 ${totalRemoved} 条 K12 内容`);
  console.log('='.repeat(60));
  console.log(`  Course:     ${courseCount} 条`);
  console.log(`  Courseware: ${coursewareCount} 条`);
  console.log(`  Tutorial:   ${tutorialCount} 条`);

  await prisma.$disconnect();
}

main();
