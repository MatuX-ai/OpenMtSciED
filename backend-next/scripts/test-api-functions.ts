/**
 * API 功能测试脚本 — 通过 lib/concept-path.ts 验证查询
 */

import * as path from 'path';
import * as dotenv from 'dotenv';
import prisma from '../lib/db';
import {
  getPrerequisites,
  getSuccessors,
  findRoute,
} from '../lib/concept-path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

async function testApiFunctions(): Promise<void> {
  console.log('🔍 测试 lib/concept-path 查询功能');
  console.log('='.repeat(50));

  try {
    const sample = await prisma.concept.findFirst({ orderBy: { id: 'asc' } });
    if (!sample) {
      console.log('⚠️  无概念数据，跳过测试');
      return;
    }

    const targetId = sample.id;

    console.log(`\n1. getPrerequisites (概念 #${targetId})`);
    const prereqs = await getPrerequisites(targetId, 'required');
    prereqs.slice(0, 5).forEach((p, i) => {
      console.log(`   ${i + 1}. ${p.name} (depth=${p.depth})`);
    });
    console.log(`   共 ${prereqs.length} 个前置依赖`);

    console.log(`\n2. getSuccessors (概念 #${targetId})`);
    const succs = await getSuccessors(targetId, 'required');
    succs.slice(0, 5).forEach((s, i) => {
      console.log(`   ${i + 1}. ${s.name} (depth=${s.depth})`);
    });
    console.log(`   共 ${succs.length} 个后续节点`);

    console.log('\n3. findRoute (深度 ≥ 2 样本)');
    const deepPath = await prisma.$queryRaw<
      Array<{ ancestor_id: number; descendant_id: number }>
    >`
      SELECT ancestor_id, descendant_id FROM concept_path
      WHERE depth >= 2 AND depth <= 8 AND ancestor_id != descendant_id
      LIMIT 1
    `;

    if (deepPath.length > 0) {
      const route = await findRoute(
        deepPath[0].ancestor_id,
        deepPath[0].descendant_id,
        'required'
      );
      if (route) {
        console.log(`   路径: ${route.path.join(' → ')} (depth=${route.depth})`);
      } else {
        console.log('   未找到路径');
      }
    } else {
      console.log('   无深度 ≥ 2 样本');
    }

    console.log('\n4. 平台分布统计');
    const stats = await prisma.$queryRaw<Array<{ platform: string; count: bigint }>>`
      SELECT
        CASE
          WHEN legacy_neo4j_id LIKE 'ARDU-%' THEN 'Arduino'
          WHEN legacy_neo4j_id LIKE 'OS-%' THEN 'OpenSciEd'
          WHEN legacy_neo4j_id LIKE 'STEM-%' THEN 'STEM课程'
          WHEN legacy_neo4j_id LIKE 'K12-%' THEN 'K12课程'
          ELSE '其他'
        END AS platform,
        COUNT(*) AS count
      FROM concept
      GROUP BY platform
      ORDER BY count DESC
    `;
    stats.forEach((s) => console.log(`   - ${s.platform}: ${s.count}`));

    console.log('\n✅ lib/concept-path 查询测试完成');
  } catch (error) {
    console.error('\n❌ 测试失败:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

testApiFunctions()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
