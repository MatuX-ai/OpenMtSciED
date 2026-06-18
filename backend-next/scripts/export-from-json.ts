/**
 * 数据导出脚本 - 从 JSON 文件导出知识点和依赖关系
 * 
 * 功能：
 * 1. 读取 knowledge_graph_relationships.json 获取学习路径依赖关系
 * 2. 读取课程库文件获取课程名称和描述
 * 3. 生成可导入的中间数据文件
 * 
 * 输出：
 * - exported_concepts.json: 知识点列表
 * - exported_dependencies.json: 依赖关系列表
 */

import * as fs from 'fs';
import * as path from 'path';

// ──────────────────────────────────────────────
// 类型定义
// ──────────────────────────────────────────────

interface CourseInfo {
  course_id: string;
  title: string;
  description?: string;
  source?: string;
  subject?: string;
  grade_level?: string;
  url?: string;
}

interface ProgressiveRelationship {
  source_course_id: string;
  target_course_id: string;
  relationship_type: string;
  source_platform?: string;
  target_platform?: string;
  subject?: string;
  source_level?: string;
  target_level?: string;
  confidence?: number;
  created_at?: string;
}

interface KnowledgeGraphRelationships {
  progressive_relationships: ProgressiveRelationship[];
  optimization_timestamp?: string;
  total_courses_processed?: number;
  total_similar_pairs_found?: number;
}

interface ExportedConcept {
  id: string;           // 原始课程ID，作为 legacyNeo4jId
  name: string;         // 课程名称
  description: string;  // 课程描述
  source: string;       // 来源平台
  subject: string;      // 学科
  gradeLevel: string;    // 年级
}

interface ExportedDependency {
  sourceId: string;     // 源课程ID
  targetId: string;     // 目标课程ID
  relationshipType: string;
  confidence?: number;
}

// ──────────────────────────────────────────────
// 工具函数
// ──────────────────────────────────────────────

function loadJsonFile<T>(filePath: string): T {
  console.log(`📂 加载文件: ${filePath}`);
  const content = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(content) as T;
}

function saveJsonFile(filePath: string, data: unknown): void {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  console.log(`✅ 保存文件: ${filePath}`);
}

// ──────────────────────────────────────────────
// 课程库加载
// ──────────────────────────────────────────────

interface CourseLibraryCache {
  [courseId: string]: CourseInfo;
}

function buildCourseLibraryCache(): CourseLibraryCache {
  console.log('\n📚 构建课程库缓存...');
  const cache: CourseLibraryCache = {};
  
  const dataDir = path.join(process.cwd(), '..', 'data', 'course_library');
  
  if (!fs.existsSync(dataDir)) {
    console.warn('⚠️  课程库目录不存在，使用空缓存');
    return cache;
  }
  
  const jsonFiles = fs.readdirSync(dataDir)
    .filter(f => f.endsWith('.json') && !f.includes('_test'))
    .slice(0, 10); // 限制文件数量避免超时
  
  console.log(`   扫描 ${jsonFiles.length} 个课程文件...`);
  
  for (const file of jsonFiles) {
    try {
      const filePath = path.join(dataDir, file);
      const content = fs.readFileSync(filePath, 'utf-8');
      const courses = JSON.parse(content) as CourseInfo[];
      
      for (const course of courses) {
        if (course.course_id) {
          cache[course.course_id] = course;
        }
      }
    } catch (err) {
      console.warn(`   ⚠️  加载 ${file} 失败:`, (err as Error).message);
    }
  }
  
  console.log(`   缓存了 ${Object.keys(cache).length} 个课程信息`);
  return cache;
}

// ──────────────────────────────────────────────
// 主导出函数
// ──────────────────────────────────────────────

function exportFromJson(): void {
  console.log('='.repeat(60));
  console.log('🔄 开始导出知识图谱数据');
  console.log('='.repeat(60));
  
  const dataDir = path.join(process.cwd(), '..', 'data');
  const outputDir = path.join(process.cwd(), 'scripts', 'migration-output');
  
  // 1. 加载关系数据
  const relationshipsFile = path.join(dataDir, 'knowledge_graph_relationships.json');
  const relationshipsData = loadJsonFile<KnowledgeGraphRelationships>(relationshipsFile);
  const relationships = relationshipsData.progressive_relationships;
  
  console.log(`\n📊 关系数据统计:`);
  console.log(`   - 总关系数: ${relationships.length}`);
  
  // 2. 统计关系类型
  const typeCount: Record<string, number> = {};
  for (const r of relationships) {
    typeCount[r.relationship_type] = (typeCount[r.relationship_type] || 0) + 1;
  }
  console.log(`   - 关系类型分布:`);
  for (const [type, count] of Object.entries(typeCount)) {
    console.log(`     • ${type}: ${count}`);
  }
  
  // 3. 加载课程库缓存
  const courseCache = buildCourseLibraryCache();
  
  // 4. 提取知识点
  console.log('\n📝 提取知识点...');
  const conceptsMap = new Map<string, ExportedConcept>();
  
  for (const rel of relationships) {
    for (const courseId of [rel.source_course_id, rel.target_course_id]) {
      if (!conceptsMap.has(courseId)) {
        const courseInfo = courseCache[courseId];
        conceptsMap.set(courseId, {
          id: courseId,
          name: courseInfo?.title || courseId,
          description: courseInfo?.description || '',
          source: courseInfo?.source || rel.source_platform || rel.target_platform || 'unknown',
          subject: courseInfo?.subject || rel.subject || 'General',
          gradeLevel: courseInfo?.grade_level || rel.source_level || rel.target_level || 'unknown',
        });
      }
    }
  }
  
  const concepts = Array.from(conceptsMap.values());
  console.log(`   - 知识点总数: ${concepts.length}`);
  
  // 5. 提取依赖关系（只导出 PROGRESSES_TO 类型）
  console.log('\n🔗 提取依赖关系...');
  const dependencies: ExportedDependency[] = relationships
    .filter(r => r.relationship_type === 'PROGRESSES_TO')
    .map(r => ({
      sourceId: r.source_course_id,
      targetId: r.target_course_id,
      relationshipType: r.relationship_type,
      confidence: r.confidence,
    }));
  
  console.log(`   - 依赖关系总数: ${dependencies.length}`);
  
  // 6. 保存导出数据
  console.log('\n💾 保存导出数据...');
  
  const conceptsFile = path.join(outputDir, 'exported_concepts.json');
  const dependenciesFile = path.join(outputDir, 'exported_dependencies.json');
  
  saveJsonFile(conceptsFile, {
    exportedAt: new Date().toISOString(),
    totalCount: concepts.length,
    concepts: concepts,
  });
  
  saveJsonFile(dependenciesFile, {
    exportedAt: new Date().toISOString(),
    totalCount: dependencies.length,
    dependencies: dependencies,
  });
  
  // 7. 生成摘要报告
  const summary = {
    exportedAt: new Date().toISOString(),
    conceptsCount: concepts.length,
    dependenciesCount: dependencies.length,
    relationshipTypes: typeCount,
    sources: [...new Set(concepts.map(c => c.source))],
    subjects: [...new Set(concepts.map(c => c.subject))],
  };
  
  const summaryFile = path.join(outputDir, 'export-summary.json');
  saveJsonFile(summaryFile, summary);
  
  // 8. 输出预览
  console.log('\n📋 数据预览:');
  console.log('\n   知识点示例 (前5个):');
  concepts.slice(0, 5).forEach((c, i) => {
    console.log(`   ${i + 1}. ${c.name}`);
    console.log(`      ID: ${c.id}`);
    console.log(`      学科: ${c.subject} | 年级: ${c.gradeLevel} | 来源: ${c.source}`);
  });
  
  console.log('\n   依赖关系示例 (前5个):');
  dependencies.slice(0, 5).forEach((d, i) => {
    console.log(`   ${i + 1}. ${d.sourceId} → ${d.targetId}`);
  });
  
  console.log('\n' + '='.repeat(60));
  console.log('✅ 导出完成!');
  console.log('='.repeat(60));
  console.log(`\n📁 输出文件:`);
  console.log(`   - ${conceptsFile}`);
  console.log(`   - ${dependenciesFile}`);
  console.log(`   - ${summaryFile}`);
}

// ──────────────────────────────────────────────
// 脚本入口
// ──────────────────────────────────────────────

console.log('🔧 知识图谱数据导出工具');
console.log('   工作目录:', process.cwd());

exportFromJson();
