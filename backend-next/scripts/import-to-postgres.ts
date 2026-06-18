/**
 * 数据导入脚本 - 导入知识点和依赖关系到 PostgreSQL
 * 
 * 功能：
 * 1. 清空现有的 concept 相关表
 * 2. 导入知识点到 concept 表
 * 3. 导入依赖关系到 concept_dependency 表
 * 4. 初始化闭包表
 * 
 * 依赖：
 * - 需要先运行 export-from-json.ts 生成导出数据
 */

import * as path from 'path';
import * as dotenv from 'dotenv';
import { Prisma } from '@prisma/client';
import prisma from '../lib/db';
import { rebuildClosureForType } from '../lib/concept-path';

// 加载环境变量
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

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

interface ExportedDependency {
  sourceId: string;
  targetId: string;
  relationshipType: string;
  confidence?: number;
}

interface ExportData {
  exportedAt: string;
  totalCount: number;
  concepts: ExportedConcept[];
}

interface DependencyData {
  exportedAt: string;
  totalCount: number;
  dependencies: ExportedDependency[];
}

// ──────────────────────────────────────────────
// 工具函数
// ──────────────────────────────────────────────

function loadJsonFile<T>(filePath: string): T {
  console.log(`📂 加载文件: ${filePath}`);
  const content = require('fs').readFileSync(filePath, 'utf-8');
  return JSON.parse(content) as T;
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ──────────────────────────────────────────────
// 清理现有数据
// ──────────────────────────────────────────────

async function cleanExistingData(): Promise<void> {
  console.log('\n🧹 清理现有数据...');
  
  // 按依赖顺序删除表数据（闭包表 → 边表 → 节点表）
  await prisma.$executeRaw`TRUNCATE TABLE concept_path CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE concept_dependency CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE concept CASCADE`;
  
  // 重置自增序列
  await prisma.$executeRaw`SELECT setval('concept_id_seq', 1, false)`;
  
  console.log('   ✅ 现有数据已清理');
}

// ──────────────────────────────────────────────
// 导入知识点
// ──────────────────────────────────────────────

async function importConcepts(concepts: ExportedConcept[]): Promise<Map<string, number>> {
  console.log('\n📚 导入知识点...');
  console.log(`   总数: ${concepts.length}`);
  
  const idMapping = new Map<string, number>();
  
  // 分批处理，每批 50 条
  const batchSize = 50;
  let processed = 0;
  
  for (let i = 0; i < concepts.length; i += batchSize) {
    const batch = concepts.slice(i, i + batchSize);
    
    try {
      // 使用带超时的事务
      await prisma.$transaction(async (tx) => {
        for (const concept of batch) {
          const record = await tx.concept.create({
            data: {
              name: concept.name.substring(0, 255),
              description: concept.description || null,
              legacyNeo4jId: concept.id,
            },
          });
          idMapping.set(concept.id, record.id);
        }
      }, { timeout: 30000 }); // 30秒超时
      
      processed += batch.length;
      console.log(`   进度: ${processed}/${concepts.length} (${Math.round(processed / concepts.length * 100)}%)`);
      
    } catch (error) {
      console.error(`   ❌ 批次导入失败 (${i} - ${i + batchSize}):`, (error as Error).message);
      throw error;
    }
  }
  
  console.log(`   ✅ 成功导入 ${idMapping.size} 个知识点`);
  return idMapping;
}

// ──────────────────────────────────────────────
// 导入依赖关系
// ──────────────────────────────────────────────

async function importDependencies(
  dependencies: ExportedDependency[],
  idMapping: Map<string, number>
): Promise<number> {
  console.log('\n🔗 导入依赖关系...');
  console.log(`   总数: ${dependencies.length}`);
  
  // 过滤掉无法映射的关系
  const validDeps = dependencies.filter(d => {
    const srcId = idMapping.get(d.sourceId);
    const tgtId = idMapping.get(d.targetId);
    return srcId !== undefined && tgtId !== undefined && srcId !== tgtId;
  });
  
  console.log(`   有效关系: ${validDeps.length} / ${dependencies.length}`);
  
  if (validDeps.length === 0) {
    console.warn('   ⚠️  没有有效的依赖关系，跳过导入');
    return 0;
  }
  
  // 使用原始 SQL 批量插入
  console.log('   使用批量 INSERT...');
  
  const values = validDeps.map(dep => {
    const srcId = idMapping.get(dep.sourceId)!;
    const tgtId = idMapping.get(dep.targetId)!;
    const pathType = dep.relationshipType === 'PROGRESSES_TO' ? 'required' : 'optional';
    return `(${srcId}, ${tgtId}, '${pathType}')`;
  }).join(',\n');
  
  try {
    await prisma.$executeRaw`
      INSERT INTO concept_dependency (prerequisite_id, dependent_id, path_type)
      VALUES ${Prisma.raw(values)}
      ON CONFLICT (prerequisite_id, dependent_id, path_type) DO NOTHING
    `;
    
    console.log(`   ✅ 成功导入 ${validDeps.length} 条依赖关系`);
    return validDeps.length;
    
  } catch (error) {
    console.error('   ❌ 批量插入失败:', (error as Error).message);
    throw error;
  }
}

// ──────────────────────────────────────────────
// 初始化闭包表
// ──────────────────────────────────────────────

async function initializeClosureTable(): Promise<void> {
  console.log('\n🔄 初始化闭包表...');
  
  // 检查是否有依赖关系
  const depCount = await prisma.$queryRaw<{ count: bigint }[]>`
    SELECT COUNT(*) as count FROM concept_dependency
  `;
  
  if (Number(depCount[0].count) === 0) {
    console.log('   ⚠️  没有依赖关系，跳过闭包表初始化');
    return;
  }
  
  // 重建闭包表
  console.log('   正在重建闭包表 (required)...');
  const startTime = Date.now();
  
  try {
    const stats = await rebuildClosureForType('required');
    const elapsed = Date.now() - startTime;
    
    console.log(`   ✅ 闭包表初始化完成`);
    console.log(`      - 新增行数: ${stats.rowsAffected}`);
    console.log(`      - 耗时: ${elapsed}ms`);
    
  } catch (error) {
    console.error('   ❌ 闭包表初始化失败:', (error as Error).message);
    throw error;
  }
}

// ──────────────────────────────────────────────
// 验证导入结果
// ──────────────────────────────────────────────

async function verifyImport(): Promise<void> {
  console.log('\n📊 验证导入结果...');
  
  const conceptCount = await prisma.$queryRaw<{ count: bigint }[]>`
    SELECT COUNT(*) as count FROM concept
  `;
  
  const depCount = await prisma.$queryRaw<{ count: bigint }[]>`
    SELECT COUNT(*) as count FROM concept_dependency
  `;
  
  const pathCount = await prisma.$queryRaw<{ count: bigint }[]>`
    SELECT COUNT(*) as count FROM concept_path
  `;
  
  const pathCountNonZero = await prisma.$queryRaw<{ count: bigint }[]>`
    SELECT COUNT(*) as count FROM concept_path WHERE depth > 0
  `;
  
  console.log(`   - 知识点表: ${conceptCount[0].count} 条`);
  console.log(`   - 依赖关系表: ${depCount[0].count} 条`);
  console.log(`   - 闭包表: ${pathCount[0].count} 条 (其中 ${pathCountNonZero[0].count} 条为非自引用)`);
  
  // 检查是否有环
  const cycleCheck = await prisma.$queryRaw<{ exists: number }[]>`
    SELECT 1 as exists FROM concept_dependency cd
    JOIN concept_path cp1 ON cd.prerequisite_id = cp1.ancestor_id AND cd.dependent_id = cp1.descendant_id
    JOIN concept_path cp2 ON cd.dependent_id = cp2.ancestor_id AND cd.prerequisite_id = cp2.descendant_id
    WHERE cp1.depth > 0 AND cp2.depth > 0
    LIMIT 1
  `;
  
  if (cycleCheck.length > 0) {
    console.warn('   ⚠️  检测到可能的循环依赖!');
  } else {
    console.log('   ✅ 未检测到循环依赖');
  }
  
  // 展示样本数据
  console.log('\n   示例知识点:');
  const sampleConcepts = await prisma.$queryRaw<{ id: number; name: string; legacy_neo4j_id: string | null }[]>`
    SELECT id, name, legacy_neo4j_id FROM concept LIMIT 5
  `;
  sampleConcepts.forEach((c, i) => {
    console.log(`     ${i + 1}. ${c.name} (id=${c.id}, legacy=${c.legacy_neo4j_id})`);
  });
  
  console.log('\n   示例依赖关系:');
  const sampleDeps = await prisma.$queryRaw<{ prerequisite_id: number; dependent_id: number; path_type: string }[]>`
    SELECT prerequisite_id, dependent_id, path_type FROM concept_dependency LIMIT 5
  `;
  sampleDeps.forEach((d, i) => {
    console.log(`     ${i + 1}. ${d.prerequisite_id} → ${d.dependent_id} (${d.path_type})`);
  });
}

// ──────────────────────────────────────────────
// 主导入函数
// ──────────────────────────────────────────────

async function importToPostgres(): Promise<void> {
  console.log('='.repeat(60));
  console.log('🔄 开始导入数据到 PostgreSQL');
  console.log('='.repeat(60));
  
  const outputDir = path.join(process.cwd(), 'scripts', 'migration-output');
  
  try {
    // 1. 加载导出数据
    console.log('\n📂 加载导出数据...');
    const conceptsData = loadJsonFile<ExportData>(path.join(outputDir, 'exported_concepts.json'));
    const dependenciesData = loadJsonFile<DependencyData>(path.join(outputDir, 'exported_dependencies.json'));
    
    console.log(`   - 知识点: ${conceptsData.totalCount}`);
    console.log(`   - 依赖关系: ${dependenciesData.totalCount}`);
    
    // 2. 清理现有数据
    await cleanExistingData();
    
    // 3. 导入知识点
    const idMapping = await importConcepts(conceptsData.concepts);
    
    // 4. 导入依赖关系
    await importDependencies(dependenciesData.dependencies, idMapping);
    
    // 5. 初始化闭包表
    await initializeClosureTable();
    
    // 6. 验证结果
    await verifyImport();
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ 导入完成!');
    console.log('='.repeat(60));
    
  } catch (error) {
    console.error('\n❌ 导入失败:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// ──────────────────────────────────────────────
// 脚本入口
// ──────────────────────────────────────────────

console.log('🔧 PostgreSQL 数据导入工具');
console.log('   工作目录:', process.cwd());

importToPostgres()
  .then(() => {
    console.log('\n🎉 所有任务完成!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 执行失败:', error);
    process.exit(1);
  });
