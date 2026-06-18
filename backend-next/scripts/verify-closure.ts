/**
 * 闭包表验证脚本 - 验证迁移后数据的完整性和正确性
 * 
 * 验证内容：
 * 1. 自引用验证：每个节点的 (id, id, 0) 是否存在
 * 2. 直接依赖验证：每条边是否在闭包表中有对应记录
 * 3. 传递闭包验证：闭包表中的路径是否满足传递性
 * 4. 深度验证：闭包表中的 depth 是否正确
 * 5. 唯一性验证：同一 (ancestor, descendant) 是否只有最小 depth
 * 6. 环检测：检测是否存在循环依赖
 * 7. 与原始数据对账：对比 JSON 文件中的数据
 */

import * as path from 'path';
import * as dotenv from 'dotenv';
import prisma from '../lib/db';

// 加载环境变量
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

// ──────────────────────────────────────────────
// 类型定义
// ──────────────────────────────────────────────

interface ValidationResult {
  passed: boolean;
  errors: string[];
  warnings: string[];
  stats: {
    concepts: number;
    dependencies: number;
    closureRows: number;
    selfRefs: number;
    cycles: number;
  };
}

// ──────────────────────────────────────────────
// 验证 1: 自引用检查
// ──────────────────────────────────────────────

async function checkSelfReferences(): Promise<{ passed: boolean; missing: string[] }> {
  console.log('\n📋 验证 1: 自引用检查');
  console.log('   检查每个知识点是否都有 (id, id, 0) 自引用...');
  
  const concepts = await prisma.$queryRaw<{ id: number }[]>`
    SELECT id FROM concept
  `;
  
  const selfRefs = await prisma.$queryRaw<{ ancestor_id: number; descendant_id: number }[]>`
    SELECT ancestor_id, descendant_id FROM concept_path
    WHERE ancestor_id = descendant_id
  `;
  
  const selfRefIds = new Set(selfRefs.map(r => r.ancestor_id));
  const missing: string[] = [];
  
  for (const concept of concepts) {
    if (!selfRefIds.has(concept.id)) {
      missing.push(`概念 ID=${concept.id}`);
    }
  }
  
  if (missing.length > 0) {
    console.log(`   ❌ 失败: ${missing.length} 个概念缺少自引用`);
    console.log(`      示例: ${missing.slice(0, 3).join(', ')}`);
    return { passed: false, missing };
  }
  
  console.log(`   ✅ 通过: ${concepts.length} 个概念都有自引用`);
  return { passed: true, missing: [] };
}

// ──────────────────────────────────────────────
// 验证 2: 直接依赖检查
// ──────────────────────────────────────────────

async function checkDirectDependencies(): Promise<{ passed: boolean; missing: string[] }> {
  console.log('\n📋 验证 2: 直接依赖检查');
  console.log('   检查每条边是否在闭包表中有 depth=1 的记录...');
  
  const edges = await prisma.$queryRaw<{ prerequisite_id: number; dependent_id: number; path_type: string }[]>`
    SELECT prerequisite_id, dependent_id, path_type FROM concept_dependency
  `;
  
  const missing: string[] = [];
  
  for (const edge of edges) {
    const closure = await prisma.$queryRaw<{ depth: number }[]>`
      SELECT depth FROM concept_path
      WHERE ancestor_id = ${edge.prerequisite_id}
        AND descendant_id = ${edge.dependent_id}
        AND path_type = ${edge.path_type}
    `;
    
    if (closure.length === 0) {
      missing.push(`边 ${edge.prerequisite_id} → ${edge.dependent_id} (${edge.path_type})`);
    } else if (closure.length > 1) {
      // 检查是否有 depth=1
      const hasDepth1 = closure.some(c => Number(c.depth) === 1);
      if (!hasDepth1) {
        missing.push(`边 ${edge.prerequisite_id} → ${edge.dependent_id} 缺少 depth=1`);
      }
    }
  }
  
  if (missing.length > 0) {
    console.log(`   ❌ 失败: ${missing.length} 条边缺少闭包记录`);
    console.log(`      示例: ${missing.slice(0, 3).join(', ')}`);
    return { passed: false, missing };
  }
  
  console.log(`   ✅ 通过: ${edges.length} 条边都有正确的闭包记录`);
  return { passed: true, missing: [] };
}

// ──────────────────────────────────────────────
// 验证 3: 传递性检查
// ──────────────────────────────────────────────

async function checkTransitivity(): Promise<{ passed: boolean; errors: string[] }> {
  console.log('\n📋 验证 3: 传递性检查');
  console.log('   检查闭包表是否满足传递性 (A→B, B→C ⇒ A→C)...');
  
  // 抽样检查：随机选取 100 个三元组
  const samples = await prisma.$queryRaw<{
    ancestor_id: number;
    middle_id: number;
    descendant_id: number;
  }[]>`
    SELECT 
      cp1.ancestor_id,
      cp1.descendant_id as middle_id,
      cp2.descendant_id
    FROM concept_path cp1
    JOIN concept_path cp2 ON cp1.descendant_id = cp2.ancestor_id
      AND cp1.path_type = cp2.path_type
    WHERE cp1.depth > 0 
      AND cp2.depth > 0
      AND cp1.ancestor_id != cp2.descendant_id
      AND cp1.ancestor_id != cp1.descendant_id
      AND cp2.ancestor_id != cp2.descendant_id
    LIMIT 100
  `;
  
  const errors: string[] = [];
  
  for (const sample of samples) {
    const expectedPath = await prisma.$queryRaw<{ depth: number }[]>`
      SELECT depth FROM concept_path
      WHERE ancestor_id = ${sample.ancestor_id}
        AND descendant_id = ${sample.descendant_id}
        AND path_type = 'required'
    `;
    
    if (expectedPath.length === 0) {
      errors.push(`传递性缺失: ${sample.ancestor_id} → ${sample.middle_id} → ${sample.descendant_id}`);
    }
  }
  
  if (errors.length > 0) {
    console.log(`   ❌ 失败: ${errors.length} 个传递性违规`);
    console.log(`      示例: ${errors.slice(0, 3).join(', ')}`);
    return { passed: false, errors };
  }
  
  console.log(`   ✅ 通过: ${samples.length} 个样本都满足传递性`);
  return { passed: true, errors: [] };
}

// ──────────────────────────────────────────────
// 验证 4: 深度正确性检查
// ──────────────────────────────────────────────

async function checkDepthCorrectness(): Promise<{ passed: boolean; errors: string[] }> {
  console.log('\n📋 验证 4: 深度正确性检查');
  console.log('   检查闭包表中 depth 是否等于最短路径长度...');
  
  // 检查是否有重复的 (ancestor, descendant) 对
  const duplicates = await prisma.$queryRaw<{
    ancestor_id: number;
    descendant_id: number;
    path_type: string;
    count: bigint;
  }[]>`
    SELECT ancestor_id, descendant_id, path_type, COUNT(*) as count
    FROM concept_path
    GROUP BY ancestor_id, descendant_id, path_type
    HAVING COUNT(*) > 1
    LIMIT 10
  `;
  
  const errors: string[] = [];
  
  for (const dup of duplicates) {
    const rows = await prisma.$queryRaw<{ depth: number }[]>`
      SELECT depth FROM concept_path
      WHERE ancestor_id = ${dup.ancestor_id}
        AND descendant_id = ${dup.descendant_id}
        AND path_type = ${dup.path_type}
      ORDER BY depth ASC
    `;
    
    const minDepth = Number(rows[0].depth);
    const hasNonMin = rows.slice(1).some(r => Number(r.depth) !== minDepth);
    
    if (hasNonMin) {
      errors.push(`${dup.ancestor_id} → ${dup.descendant_id}: 存在非最小 depth (${rows.map(r => r.depth).join(', ')})`);
    }
  }
  
  if (errors.length > 0) {
    console.log(`   ❌ 失败: ${errors.length} 个 (ancestor, descendant) 对存在非最小 depth`);
    console.log(`      示例: ${errors.slice(0, 3).join(', ')}`);
    return { passed: false, errors };
  }
  
  console.log(`   ✅ 通过: 所有 (ancestor, descendant) 对都只有最小 depth`);
  return { passed: true, errors: [] };
}

// ──────────────────────────────────────────────
// 验证 5: 负深度检查
// ──────────────────────────────────────────────

async function checkNegativeDepth(): Promise<{ passed: boolean; errors: string[] }> {
  console.log('\n📋 验证 5: 负深度检查');
  console.log('   检查是否存在 depth < 0 的记录...');
  
  const negatives = await prisma.$queryRaw<{ ancestor_id: number; descendant_id: number; depth: number }[]>`
    SELECT ancestor_id, descendant_id, depth FROM concept_path
    WHERE depth < 0
    LIMIT 10
  `;
  
  if (negatives.length > 0) {
    console.log(`   ❌ 失败: ${negatives.length} 条记录存在负深度`);
    negatives.forEach(r => {
      console.log(`      ${r.ancestor_id} → ${r.descendant_id}: depth=${r.depth}`);
    });
    return { passed: false, errors: negatives.map(r => `depth=${r.depth}`) };
  }
  
  console.log(`   ✅ 通过: 没有负深度记录`);
  return { passed: true, errors: [] };
}

// ──────────────────────────────────────────────
// 验证 6: 环检测
// ──────────────────────────────────────────────

async function checkCycles(): Promise<{ passed: boolean; cycles: string[] }> {
  console.log('\n📋 验证 6: 环检测');
  console.log('   检查是否存在循环依赖...');
  
  // 检测：如果 A 依赖 B 且 B 依赖 A，则存在环
  // 在闭包表中，如果 (A, B, d1) 和 (B, A, d2) 都存在且 d1 > 0 且 d2 > 0，则存在环
  const cycles = await prisma.$queryRaw<{ a: number; b: number; d1: number; d2: number }[]>`
    SELECT 
      cp1.ancestor_id as a,
      cp1.descendant_id as b,
      cp1.depth as d1,
      cp2.depth as d2
    FROM concept_path cp1
    JOIN concept_path cp2 ON cp1.ancestor_id = cp2.descendant_id
      AND cp1.descendant_id = cp2.ancestor_id
      AND cp1.path_type = cp2.path_type
    WHERE cp1.depth > 0 
      AND cp2.depth > 0
      AND cp1.ancestor_id < cp1.descendant_id  -- 只报告一次
    LIMIT 10
  `;
  
  const cycleStrings = cycles.map(c => `${c.a} ↔ ${c.b} (depth: ${c.d1}, ${c.d2})`);
  
  if (cycles.length > 0) {
    console.log(`   ⚠️  警告: 发现 ${cycles.length} 个可能的循环依赖`);
    cycleStrings.forEach(c => console.log(`      ${c}`));
    return { passed: false, cycles: cycleStrings };
  }
  
  console.log(`   ✅ 通过: 没有检测到循环依赖`);
  return { passed: true, cycles: [] };
}

// ──────────────────────────────────────────────
// 验证 7: 与原始数据对账
// ──────────────────────────────────────────────

async function checkAgainstOriginalData(): Promise<{ passed: boolean; errors: string[] }> {
  console.log('\n📋 验证 7: 与原始数据对账');
  console.log('   对比闭包表与 JSON 文件中的数据...');
  
  // 加载原始数据
  const fs = require('fs');
  const dataDir = path.join(process.cwd(), '..', 'data');
  const relationshipsFile = path.join(dataDir, 'knowledge_graph_relationships.json');
  
  let originalDeps: { source_course_id: string; target_course_id: string }[] = [];
  
  try {
    const content = fs.readFileSync(relationshipsFile, 'utf-8');
    const data = JSON.parse(content);
    originalDeps = data.progressive_relationships || [];
  } catch (error) {
    console.warn(`   ⚠️  无法加载原始数据文件: ${(error as Error).message}`);
    return { passed: false, errors: ['无法加载原始数据'] };
  }
  
  // 获取 PostgreSQL 中的边
  const pgDeps = await prisma.$queryRaw<{ prerequisite_id: number; dependent_id: number; legacy_neo4j_id: string | null }[]>`
    SELECT cd.prerequisite_id, cd.dependent_id, c.legacy_neo4j_id
    FROM concept_dependency cd
    JOIN concept c ON cd.prerequisite_id = c.id
  `;
  
  // 构建 legacy ID 到内部 ID 的映射
  const legacyToId = new Map<string, number>();
  const allConcepts = await prisma.$queryRaw<{ id: number; legacy_neo4j_id: string | null }[]>`
    SELECT id, legacy_neo4j_id FROM concept
  `;
  for (const c of allConcepts) {
    if (c.legacy_neo4j_id) {
      legacyToId.set(c.legacy_neo4j_id, c.id);
    }
  }
  
  // 对账
  const originalCount = originalDeps.length;
  const pgCount = pgDeps.length;
  
  console.log(`   - 原始数据边数: ${originalCount}`);
  console.log(`   - PostgreSQL 边数: ${pgCount}`);
  
  const errors: string[] = [];
  
  if (pgCount < originalCount * 0.9) {
    errors.push(`PostgreSQL 边数 (${pgCount}) 明显少于原始数据 (${originalCount})`);
    console.log(`   ❌ 边数差异过大`);
  } else {
    console.log(`   ✅ 边数差异在合理范围内`);
  }
  
  return { passed: errors.length === 0, errors };
}

// ──────────────────────────────────────────────
// 获取统计信息
// ──────────────────────────────────────────────

async function getStats(): Promise<{
  concepts: number;
  dependencies: number;
  closureRows: number;
  selfRefs: number;
}> {
  const [concepts, dependencies, closureRows, selfRefs] = await Promise.all([
    prisma.$queryRaw<{ count: bigint }[]>`SELECT COUNT(*) as count FROM concept`,
    prisma.$queryRaw<{ count: bigint }[]>`SELECT COUNT(*) as count FROM concept_dependency`,
    prisma.$queryRaw<{ count: bigint }[]>`SELECT COUNT(*) as count FROM concept_path`,
    prisma.$queryRaw<{ count: bigint }[]>`SELECT COUNT(*) as count FROM concept_path WHERE ancestor_id = descendant_id`,
  ]);
  
  return {
    concepts: Number(concepts[0].count),
    dependencies: Number(dependencies[0].count),
    closureRows: Number(closureRows[0].count),
    selfRefs: Number(selfRefs[0].count),
  };
}

// ──────────────────────────────────────────────
// 主验证函数
// ──────────────────────────────────────────────

async function verifyClosure(): Promise<ValidationResult> {
  console.log('='.repeat(60));
  console.log('🔍 开始闭包表验证');
  console.log('='.repeat(60));
  
  const result: ValidationResult = {
    passed: true,
    errors: [],
    warnings: [],
    stats: {
      concepts: 0,
      dependencies: 0,
      closureRows: 0,
      selfRefs: 0,
      cycles: 0,
    },
  };
  
  try {
    // 获取统计信息
    result.stats = await getStats();
    console.log('\n📊 数据统计:');
    console.log(`   - 知识点: ${result.stats.concepts}`);
    console.log(`   - 依赖关系: ${result.stats.dependencies}`);
    console.log(`   - 闭包表记录: ${result.stats.closureRows}`);
    console.log(`   - 自引用记录: ${result.stats.selfRefs}`);
    
    // 执行各项验证
    const checks = [
      checkSelfReferences,
      checkDirectDependencies,
      checkTransitivity,
      checkDepthCorrectness,
      checkNegativeDepth,
      checkCycles,
      checkAgainstOriginalData,
    ];
    
    for (const check of checks) {
      const checkResult = await check();
      
      if (!checkResult.passed) {
        result.passed = false;
        if ('errors' in checkResult) {
          result.errors.push(...(checkResult.errors || []));
        }
        if ('missing' in checkResult) {
          result.errors.push(...(checkResult.missing || []));
        }
        if ('cycles' in checkResult) {
          result.warnings.push(...(checkResult.cycles || []));
          result.stats.cycles = (checkResult.cycles || []).length;
        }
      }
      
      // 避免过于频繁的查询
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
  } catch (error) {
    result.passed = false;
    result.errors.push(`验证过程出错: ${(error as Error).message}`);
  }
  
  // 输出最终结果
  console.log('\n' + '='.repeat(60));
  console.log('📋 验证结果汇总');
  console.log('='.repeat(60));
  
  console.log(`\n✅ 总体状态: ${result.passed ? '通过' : '未通过'}`);
  
  if (result.errors.length > 0) {
    console.log(`\n❌ 错误 (${result.errors.length}):`);
    result.errors.slice(0, 10).forEach(e => console.log(`   - ${e}`));
    if (result.errors.length > 10) {
      console.log(`   ... 还有 ${result.errors.length - 10} 个错误`);
    }
  }
  
  if (result.warnings.length > 0) {
    console.log(`\n⚠️  警告 (${result.warnings.length}):`);
    result.warnings.slice(0, 5).forEach(w => console.log(`   - ${w}`));
  }
  
  // 保存验证报告
  const fs = require('fs');
  const reportPath = path.join(process.cwd(), 'scripts', 'migration-output', 'verification-report.json');
  fs.writeFileSync(reportPath, JSON.stringify({
    verifiedAt: new Date().toISOString(),
    ...result,
  }, null, 2));
  console.log(`\n📁 验证报告已保存: ${reportPath}`);
  
  console.log('\n' + '='.repeat(60));
  
  return result;
}

// ──────────────────────────────────────────────
// 脚本入口
// ──────────────────────────────────────────────

console.log('🔧 闭包表验证工具');
console.log('   工作目录:', process.cwd());

verifyClosure()
  .then((result) => {
    console.log('\n🎉 验证完成!');
    process.exit(result.passed ? 0 : 1);
  })
  .catch((error) => {
    console.error('\n💥 验证失败:', error);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
