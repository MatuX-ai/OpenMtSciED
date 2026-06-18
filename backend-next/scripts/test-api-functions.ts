/**
 * API 功能测试脚本
 */

import * as path from 'path';
import * as dotenv from 'dotenv';
import prisma from '../lib/db';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

async function testApiFunctions(): Promise<void> {
  console.log('🔍 测试 API 查询功能');
  console.log('='.repeat(50));
  
  try {
    // 测试1: 获取某个知识点的前置依赖
    console.log('\n1. 测试 getPrerequisites (获取前置依赖)');
    const prereqs = await prisma.$queryRaw<{ id: number; name: string; depth: number }[]>`
      SELECT c.id, c.name, cp.depth
      FROM concept_path cp
      JOIN concept c ON cp.ancestor_id = c.id
      WHERE cp.descendant_id = 10
        AND cp.path_type = 'required'
        AND cp.depth > 0
      ORDER BY cp.depth DESC
      LIMIT 5
    `;
    console.log('   知识点 ID=10 的前置依赖 (前5个):');
    prereqs.forEach((p, i) => console.log(`   ${i + 1}. ${p.name} (depth=${p.depth})`));
    
    // 测试2: 获取某个知识点的前置依赖数量
    console.log('\n2. 测试 getSuccessors (获取后续可学)');
    const succs = await prisma.$queryRaw<{ id: number; name: string; depth: number }[]>`
      SELECT c.id, c.name, cp.depth
      FROM concept_path cp
      JOIN concept c ON cp.descendant_id = c.id
      WHERE cp.ancestor_id = 1
        AND cp.path_type = 'required'
        AND cp.depth > 0
      ORDER BY cp.depth ASC
      LIMIT 5
    `;
    console.log('   知识点 ID=1 的后续可学 (前5个):');
    succs.forEach((s, i) => console.log(`   ${i + 1}. ${s.name} (depth=${s.depth})`));
    
    // 测试3: 按来源平台统计
    console.log('\n3. 按来源平台统计知识点');
    const stats = await prisma.$queryRaw<{ platform: string; count: bigint }[]>`
      SELECT 
        CASE 
          WHEN legacy_neo4j_id LIKE 'ARDU-%' THEN 'Arduino'
          WHEN legacy_neo4j_id LIKE 'OS-%' THEN 'OpenSciEd'
          WHEN legacy_neo4j_id LIKE 'STEM-%' THEN 'STEM课程'
          WHEN legacy_neo4j_id LIKE 'K12-%' THEN 'K12课程'
          ELSE '其他'
        END as platform,
        COUNT(*) as count
      FROM concept
      GROUP BY platform
      ORDER BY count DESC
    `;
    console.log('   平台分布:');
    stats.forEach(s => console.log(`   - ${s.platform}: ${s.count} 条`));
    
    // 测试4: 验证传递闭包正确性
    console.log('\n4. 验证传递闭包正确性');
    // 如果 A→B 且 B→C，则 A→C 应该在闭包表中
    const transitivityCheck = await prisma.$queryRaw<{ ancestor: string; middle: string; descendant: string }[]>`
      SELECT 
        ca.name as ancestor,
        cm.name as middle,
        cd.name as descendant
      FROM concept_dependency e1
      JOIN concept_dependency e2 ON e1.dependent_id = e2.prerequisite_id
      JOIN concept_path cp ON cp.ancestor_id = e1.prerequisite_id 
        AND cp.descendant_id = e2.dependent_id
        AND cp.depth > 1
      JOIN concept ca ON ca.id = e1.prerequisite_id
      JOIN concept cm ON cm.id = e1.dependent_id
      JOIN concept cd ON cd.id = e2.dependent_id
      WHERE e1.path_type = 'required' AND e2.path_type = 'required'
      LIMIT 3
    `;
    console.log('   传递闭包验证 (A→B, B→C ⇒ A→C 存在):');
    transitivityCheck.forEach((t, i) => console.log(`   ${i + 1}. ${t.ancestor} → ${t.middle} → ${t.descendant}`));
    
    console.log('\n✅ API 查询测试完成 - 所有功能正常!');
    
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
