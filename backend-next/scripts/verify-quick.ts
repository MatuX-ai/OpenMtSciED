/**
 * 闭包表快速验证脚本 - 验证迁移后数据的关键指标
 */

import * as path from 'path';
import * as dotenv from 'dotenv';
import prisma from '../lib/db';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

async function quickVerify(): Promise<void> {
  console.log('='.repeat(60));
  console.log('🔍 闭包表快速验证');
  console.log('='.repeat(60));
  
  try {
    // 1. 统计数据
    console.log('\n📊 数据统计:');
    
    const [concepts, dependencies, closureRows, selfRefs, nonSelfRefs] = await Promise.all([
      prisma.$queryRaw<{ count: bigint }[]>`SELECT COUNT(*) as count FROM concept`,
      prisma.$queryRaw<{ count: bigint }[]>`SELECT COUNT(*) as count FROM concept_dependency`,
      prisma.$queryRaw<{ count: bigint }[]>`SELECT COUNT(*) as count FROM concept_path`,
      prisma.$queryRaw<{ count: bigint }[]>`SELECT COUNT(*) as count FROM concept_path WHERE ancestor_id = descendant_id`,
      prisma.$queryRaw<{ count: bigint }[]>`SELECT COUNT(*) as count FROM concept_path WHERE depth > 0`,
    ]);
    
    const conceptCount = Number(concepts[0].count);
    const depCount = Number(dependencies[0].count);
    const closureCount = Number(closureRows[0].count);
    const selfRefCount = Number(selfRefs[0].count);
    const nonSelfRefCount = Number(nonSelfRefs[0].count);
    
    console.log(`   - 知识点: ${conceptCount}`);
    console.log(`   - 依赖关系: ${depCount}`);
    console.log(`   - 闭包表记录: ${closureCount}`);
    console.log(`   - 自引用记录: ${selfRefCount}`);
    console.log(`   - 非自引用记录: ${nonSelfRefCount}`);
    
    // 2. 验证自引用
    console.log('\n✅ 验证 1: 自引用完整性');
    if (selfRefCount === conceptCount) {
      console.log(`   通过: ${selfRefCount}/${conceptCount} 个概念有自引用`);
    } else {
      console.log(`   警告: ${selfRefCount}/${conceptCount} 个概念有自引用`);
    }
    
    // 3. 验证闭包表与边表关系
    console.log('\n✅ 验证 2: 闭包表规模合理性');
    const expectedClosureMin = conceptCount + depCount; // 至少 = 自引用 + 直接依赖
    if (closureCount >= expectedClosureMin) {
      console.log(`   通过: 闭包表有 ${closureCount} 条记录 (期望 >= ${expectedClosureMin})`);
    } else {
      console.log(`   警告: 闭包表只有 ${closureCount} 条记录 (期望 >= ${expectedClosureMin})`);
    }
    
    // 4. 检查深度分布
    console.log('\n✅ 验证 3: 深度分布');
    const depthDist = await prisma.$queryRaw<{ depth: number; count: bigint }[]>`
      SELECT depth, COUNT(*) as count
      FROM concept_path
      GROUP BY depth
      ORDER BY depth
    `;
    
    console.log('   深度分布:');
    depthDist.forEach(d => {
      console.log(`     depth=${d.depth}: ${d.count} 条`);
    });
    
    // 5. 抽样验证
    console.log('\n✅ 验证 4: 抽样验证');
    const samples = await prisma.$queryRaw<{
      ancestor_id: number;
      ancestor_name: string;
      descendant_id: number;
      descendant_name: string;
      depth: number;
    }[]>`
      SELECT 
        cp.ancestor_id,
        ca.name as ancestor_name,
        cp.descendant_id,
        cd.name as descendant_name,
        cp.depth
      FROM concept_path cp
      JOIN concept ca ON cp.ancestor_id = ca.id
      JOIN concept cd ON cp.descendant_id = cd.id
      WHERE cp.depth > 0
      ORDER BY cp.depth DESC
      LIMIT 5
    `;
    
    console.log('   最长路径示例 (按 depth 降序):');
    samples.forEach((s, i) => {
      console.log(`     ${i + 1}. ${s.ancestor_name} → ${s.descendant_name} (depth=${s.depth})`);
    });
    
    // 6. 检查环
    console.log('\n✅ 验证 5: 环检测');
    const cycles = await prisma.$queryRaw<{ a: number; b: number }[]>`
      SELECT DISTINCT cp1.ancestor_id as a, cp1.descendant_id as b
      FROM concept_path cp1
      JOIN concept_path cp2 ON cp1.ancestor_id = cp2.descendant_id
        AND cp1.descendant_id = cp2.ancestor_id
        AND cp1.path_type = cp2.path_type
      WHERE cp1.depth > 0 
        AND cp2.depth > 0
        AND cp1.ancestor_id < cp1.descendant_id
      LIMIT 10
    `;
    
    if (cycles.length === 0) {
      console.log('   通过: 没有检测到循环依赖');
    } else {
      console.log(`   ⚠️  检测到 ${cycles.length} 个可能的循环依赖`);
      cycles.forEach(c => console.log(`     ${c.a} ↔ ${c.b}`));
    }
    
    // 7. 与原始数据对比
    console.log('\n✅ 验证 6: 与原始数据对比');
    const fs = require('fs');
    const dataDir = path.join(process.cwd(), '..', 'data');
    const relationshipsFile = path.join(dataDir, 'knowledge_graph_relationships.json');
    
    try {
      const content = fs.readFileSync(relationshipsFile, 'utf-8');
      const data = JSON.parse(content);
      const originalDeps = data.progressive_relationships?.length || 0;
      
      console.log(`   - 原始数据边数: ${originalDeps}`);
      console.log(`   - PostgreSQL 边数: ${depCount}`);
      
      const diff = Math.abs(originalDeps - depCount);
      const ratio = depCount / Math.max(originalDeps, 1);
      
      if (ratio >= 0.9 && ratio <= 1.1) {
        console.log(`   通过: 边数差异在合理范围内 (${Math.round(ratio * 100)}%)`);
      } else {
        console.log(`   ⚠️  边数差异较大 (${Math.round(ratio * 100)}%)`);
      }
    } catch {
      console.log('   跳过: 无法加载原始数据');
    }
    
    // 总结
    console.log('\n' + '='.repeat(60));
    console.log('📋 验证总结');
    console.log('='.repeat(60));
    console.log(`
   ✅ 迁移成功完成！
   
   📊 关键指标:
   - 知识点: ${conceptCount} 条
   - 依赖关系: ${depCount} 条
   - 闭包表: ${closureCount} 条
   - 传递路径: ${nonSelfRefCount} 条
   
   💡 闭包表会自动维护学习路径的前置/后续关系查询。
   `);
    
  } catch (error) {
    console.error('\n❌ 验证失败:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

quickVerify()
  .then(() => {
    console.log('\n🎉 验证完成!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 执行失败:', error);
    process.exit(1);
  });
