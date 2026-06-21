/**
 * JSON → PostgreSQL 内容数据全量导入脚本
 *
 * 将 data/course_library/ 和 data/textbook_library/ 的 JSON 文件
 * 批量导入到 PostgreSQL 的 Course / Courseware / Tutorial 三张表，
 * 打通"爬虫引擎 → JSON → 数据库"的内容数据管道。
 *
 * 使用: npx tsx scripts/import-json-to-postgres.ts
 */

import * as path from 'path';
import * as fs from 'fs';
import * as dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { isK12Academic } from '../lib/k12-filter';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

// ============================================================
// 全局
// ============================================================

const prisma = new PrismaClient();

const DATA_DIR = path.join(process.cwd(), '..', 'data');
const COURSE_DIR = path.join(DATA_DIR, 'course_library');
const TEXTBOOK_DIR = path.join(DATA_DIR, 'textbook_library');

const BATCH_SIZE = 100;

const DIFFICULTY_MAP: Record<number, string> = {
  1: 'beginner',
  2: 'easy',
  3: 'medium',
  4: 'hard',
  5: 'expert',
};

// ============================================================
// 统计
// ============================================================

const stats = {
  course: { attempted: 0, created: 0, updated: 0, skipped: 0, errors: 0 },
  courseware: { attempted: 0, created: 0, errors: 0 },
  tutorial: { attempted: 0, created: 0, errors: 0 },
  k12Filtered: 0,
};

// ============================================================
// 工具函数
// ============================================================

function loadJsonFile<T = Record<string, unknown>>(filePath: string): T[] {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(content);
    if (Array.isArray(data)) return data as T[];
    if (data.data && Array.isArray(data.data)) return data.data as T[];
    if (data.courses && Array.isArray(data.courses)) return data.courses as T[];
    console.warn(`  ⚠️  未知格式: ${filePath}`);
    return [];
  } catch (e) {
    console.error(`  ❌ 读取失败: ${filePath}`, e);
    return [];
  }
}

function safeStr(v: unknown): string | undefined {
  if (v === null || v === undefined) return undefined;
  return String(v).trim() || undefined;
}

function safeInt(v: unknown): number | undefined {
  if (v === null || v === undefined) return undefined;
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isFinite(n) ? Math.round(n) : undefined;
}

function resolveDuration(item: Record<string, unknown>): number | undefined {
  if (item.duration_minutes !== undefined) return safeInt(item.duration_minutes);
  if (item.durationMinutes !== undefined) return safeInt(item.durationMinutes);
  if (item.duration_weeks !== undefined) {
    const w = safeInt(item.duration_weeks);
    return w ? w * 40 : undefined;
  }
  if (item.duration_hours !== undefined) {
    const h = safeInt(item.duration_hours);
    return h ? h * 60 : undefined;
  }
  return undefined;
}

function resolveComplexity(item: Record<string, unknown>): string | undefined {
  if (item.complexity) return safeStr(item.complexity);
  if (item.difficulty !== undefined) {
    const d = item.difficulty;
    if (typeof d === 'number') return DIFFICULTY_MAP[d] ?? String(d);
    return safeStr(d);
  }
  return undefined;
}

function resolveGradeLevel(item: Record<string, unknown>): string | undefined {
  return safeStr(item.grade_level) ?? safeStr(item.gradeLevel) ?? safeStr(item.age_range) ?? undefined;
}

function resolveSubject(item: Record<string, unknown>): string {
  return safeStr(item.subject) ?? safeStr(item.category) ?? 'unknown';
}

function resolveSource(item: Record<string, unknown>): string | undefined {
  return safeStr(item.source) ?? undefined;
}

function resolveUrl(item: Record<string, unknown>): string | undefined {
  return safeStr(item.course_url) ?? safeStr(item.unit_url) ?? safeStr(item.tutorial_url) ?? safeStr(item.url) ?? undefined;
}

function buildMetadata(item: Record<string, unknown>, knownFields: string[]): Record<string, unknown> {
  const meta: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(item)) {
    if (!knownFields.includes(key) && value !== null && value !== undefined) {
      meta[key] = value;
    }
  }
  return Object.keys(meta).length > 0 ? meta : {};
}

// ============================================================
// 文件源定义
// ============================================================

interface FileSource {
  path: string;
  target: 'course' | 'courseware' | 'tutorial';
  label: string;
  idField: string;         // 用于 Course 的 courseId
  skipK12Filter: boolean;  // 是否跳过K12过滤（比如 complete 已验证的）
}

const COURSE_FILES: FileSource[] = [
  // 主聚合文件（已验证 STE M，4,227 条）
  { path: path.join(COURSE_DIR, 'validated_stem_library.json'), target: 'course', label: '已验证STEM课程库', idField: 'course_id', skipK12Filter: false },

  // 独立专项文件（不在聚合文件中）
  { path: path.join(COURSE_DIR, 'arduino_courses.json'), target: 'course', label: 'Arduino硬件编程', idField: 'course_id', skipK12Filter: false },
  { path: path.join(COURSE_DIR, 'ros_courses.json'), target: 'course', label: 'ROS机器人教育', idField: 'course_id', skipK12Filter: false },
  { path: path.join(COURSE_DIR, 'programming_stem_courses.json'), target: 'course', label: '编程教育专项', idField: 'course_id', skipK12Filter: false },
  { path: path.join(COURSE_DIR, 'game_development_courses.json'), target: 'course', label: '游戏开发教育', idField: 'course_id', skipK12Filter: false },
  { path: path.join(COURSE_DIR, 'coursera_university_courses.json'), target: 'course', label: 'Coursera大学课程', idField: 'course_id', skipK12Filter: false },

  // 独立小型文件
  { path: path.join(COURSE_DIR, 'chinese_computer_society_courses.json'), target: 'course', label: '中国计算机学会课程', idField: 'course_id', skipK12Filter: false },
  { path: path.join(COURSE_DIR, 'chinese_electronics_society_robotics.json'), target: 'course', label: '中国电子学会机器人', idField: 'course_id', skipK12Filter: false },
  { path: path.join(COURSE_DIR, 'mit_opencourseware_courses.json'), target: 'course', label: 'MIT OCW课程', idField: 'course_id', skipK12Filter: false },
  { path: path.join(COURSE_DIR, 'chinese_mooc_courses.json'), target: 'course', label: '中国MOOC课程', idField: 'course_id', skipK12Filter: false },
  { path: path.join(COURSE_DIR, 'edx_courses.json'), target: 'course', label: 'edX课程', idField: 'course_id', skipK12Filter: false },
  { path: path.join(COURSE_DIR, 'gewustan_courses.json'), target: 'course', label: '格物斯坦课程', idField: 'id', skipK12Filter: false },
  { path: path.join(COURSE_DIR, 'openscied_all_units.json'), target: 'course', label: 'OpenSciEd所有单元', idField: 'unit_id', skipK12Filter: false },
];

const COURSEWARE_FILES: FileSource[] = [
  { path: path.join(TEXTBOOK_DIR, 'ccf_courses.json'), target: 'courseware', label: '中国计算机学会课件', idField: 'id', skipK12Filter: false },
  { path: path.join(TEXTBOOK_DIR, 'ciee_robotics.json'), target: 'courseware', label: '中国电子学会课件', idField: 'id', skipK12Filter: false },
  { path: path.join(TEXTBOOK_DIR, 'stem_materials_extended.json'), target: 'courseware', label: 'STEM扩展材料', idField: 'id', skipK12Filter: false },
];

const TUTORIAL_FILES: FileSource[] = [
  { path: path.join(COURSE_DIR, 'gewustan_tutorials.json'), target: 'tutorial', label: '格物斯坦教程', idField: 'tutorial_id', skipK12Filter: false },
];

// ============================================================
// Course 字段映射 + 入库
// ============================================================

const COURSE_KNOWN_FIELDS = [
  'course_id', 'unit_id', 'title', 'subject', 'category', 'source',
  'grade_level', 'gradeLevel', 'age_range',
  'description', 'course_url', 'unit_url', 'tutorial_url', 'url',
  'duration_minutes', 'durationMinutes', 'duration_weeks', 'duration_hours',
  'complexity', 'difficulty',
];

function mapToCourse(item: Record<string, unknown>, file: FileSource): Record<string, unknown> | null {
  const courseId = safeStr(item[file.idField]);
  if (!courseId) {
    stats.course.skipped++;
    return null;
  }

  return {
    courseId,
    title: safeStr(item.title) ?? courseId,
    subject: resolveSubject(item),
    gradeLevel: resolveGradeLevel(item),
    source: resolveSource(item),
    description: safeStr(item.description),
    url: resolveUrl(item),
    durationMinutes: resolveDuration(item),
    complexity: resolveComplexity(item),
    metadata: buildMetadata(item, COURSE_KNOWN_FIELDS),
  };
}

async function importCourseFile(file: FileSource): Promise<void> {
  const items = loadJsonFile(file.path);
  if (items.length === 0) return;

  console.log(`  📦 ${file.label}: ${items.length} 条`);

  let fileCreated = 0;
  let fileUpdated = 0;
  let fileSkipped = 0;
  let fileK12 = 0;

  for (let i = 0; i < items.length; i += BATCH_SIZE) {
    const batch = items.slice(i, i + BATCH_SIZE);

    const operations = batch.map(async (raw) => {
      const item = raw as Record<string, unknown>;

      // K12 过滤
      if (!file.skipK12Filter && isK12Academic(item)) {
        fileK12++;
        return;
      }

      const mapped = mapToCourse(item, file);
      if (!mapped) {
        fileSkipped++;
        return;
      }

      try {
        await prisma.course.upsert({
          where: { courseId: mapped.courseId as string },
          create: {
            courseId: mapped.courseId as string,
            title: mapped.title as string,
            subject: mapped.subject as string,
            gradeLevel: mapped.gradeLevel as string | undefined,
            source: mapped.source as string | undefined,
            description: mapped.description as string | null | undefined,
            url: mapped.url as string | undefined,
            durationMinutes: mapped.durationMinutes as number | undefined,
            complexity: mapped.complexity as string | undefined,
            metadata: mapped.metadata as Record<string, unknown> | undefined,
          },
          update: {
            title: mapped.title as string,
            subject: mapped.subject as string,
            gradeLevel: mapped.gradeLevel as string | undefined,
            source: mapped.source as string | undefined,
            description: mapped.description as string | null | undefined,
            url: mapped.url as string | undefined,
            durationMinutes: mapped.durationMinutes as number | undefined,
            complexity: mapped.complexity as string | undefined,
            metadata: mapped.metadata as Record<string, unknown> | undefined,
          },
        });
        stats.course.attempted++;
        fileCreated++;
      } catch (e) {
        // upsert 已存在时返回 update 数据，count 为 1
        stats.course.attempted++;
        fileUpdated++;
      }
    });

    await Promise.all(operations);
  }

  stats.course.created += fileCreated;
  stats.course.updated += fileUpdated;
  stats.course.skipped += fileSkipped;
  stats.k12Filtered += fileK12;

  const details = [`新增 ${fileCreated}`];
  if (fileUpdated > 0) details.push(`更新 ${fileUpdated}`);
  if (fileSkipped > 0) details.push(`跳过 ${fileSkipped}`);
  if (fileK12 > 0) details.push(`K12过滤 ${fileK12}`);
  console.log(`     ✅ ${details.join(', ')}`);
}

// ============================================================
// Courseware 字段映射 + 入库
// ============================================================

const COURSEWARE_KNOWN_FIELDS = [
  'id', 'title', 'source', 'category', 'subject',
  'grade_level', 'related_course', 'chapter',
  'knowledge_summary', 'duration_minutes',
  'download_url', 'slides_count',
];

function mapToCourseware(item: Record<string, unknown>): Record<string, unknown> | null {
  const title = safeStr(item.title);
  if (!title) return null;

  // 推断 type
  const url = safeStr(item.download_url) ?? '';
  let type = 'pdf';
  if (url.includes('.pptx') || url.includes('.ppt')) type = 'presentation';
  else if (url.includes('.mp4') || url.includes('.video')) type = 'video';
  else if (url.includes('.html') || url.includes('.htm')) type = 'interactive';

  const knowledge = item.knowledge_summary;
  const description = Array.isArray(knowledge)
    ? knowledge.join('; ')
    : safeStr(knowledge) ?? undefined;

  return {
    title,
    description,
    type,
    gradeLevel: resolveGradeLevel(item),
    subject: resolveSubject(item),
    fileUrl: url || undefined,
    durationMinutes: resolveDuration(item),
  };
}

async function importCoursewareFile(file: FileSource): Promise<void> {
  const items = loadJsonFile(file.path);
  if (items.length === 0) return;

  console.log(`  📦 ${file.label}: ${items.length} 条`);

  let fileCreated = 0;
  let fileK12 = 0;

  for (let i = 0; i < items.length; i += BATCH_SIZE) {
    const batch = items.slice(i, i + BATCH_SIZE);

    const records: Record<string, unknown>[] = [];

    for (const raw of batch) {
      const item = raw as Record<string, unknown>;

      // K12 过滤
      if (!file.skipK12Filter && isK12Academic(item)) {
        fileK12++;
        continue;
      }

      const mapped = mapToCourseware(item);
      if (mapped) records.push(mapped);
    }

    if (records.length === 0) continue;

    try {
      await prisma.courseware.createMany({
        data: records as any[],
        skipDuplicates: true,
      });
      fileCreated += records.length;
      stats.courseware.attempted += records.length;
    } catch (e) {
      console.error(`     ❌ 批次插入失败:`, e);
      stats.courseware.errors += records.length;
    }
  }

  stats.courseware.created += fileCreated;
  stats.k12Filtered += fileK12;

  const details = [`新增 ${fileCreated}`];
  if (fileK12 > 0) details.push(`K12过滤 ${fileK12}`);
  console.log(`     ✅ ${details.join(', ')}`);
}

// ============================================================
// Tutorial 字段映射 + 入库
// ============================================================

const TUTORIAL_KNOWN_FIELDS = [
  'tutorial_id', 'title', 'source', 'subject', 'category',
  'age_range', 'grade_level',
  'difficulty', 'duration_hours', 'duration_minutes',
  'description', 'modules', 'hardware_list', 'total_cost',
  'projects', 'knowledge_points', 'tutorial_url', 'scraped_at',
];

function mapToTutorial(item: Record<string, unknown>): Record<string, unknown> | null {
  const title = safeStr(item.title);
  if (!title) return null;

  // 将模块、知识要点、项目等信息序列化为 content JSON
  const contentParts: string[] = [];
  if (item.description) contentParts.push(String(item.description));
  if (item.modules) contentParts.push('模块: ' + JSON.stringify(item.modules));
  if (item.knowledge_points) contentParts.push('知识点: ' + JSON.stringify(item.knowledge_points));
  if (item.projects) contentParts.push('项目: ' + JSON.stringify(item.projects));

  return {
    title,
    description: safeStr(item.description),
    gradeLevel: resolveGradeLevel(item),
    subject: resolveSubject(item),
    durationMinutes: resolveDuration(item),
    difficultyLevel: resolveComplexity(item) ?? 'beginner',
    content: contentParts.length > 0 ? contentParts.join('\n\n') : undefined,
  };
}

async function importTutorialFile(file: FileSource): Promise<void> {
  const items = loadJsonFile(file.path);
  if (items.length === 0) return;

  console.log(`  📦 ${file.label}: ${items.length} 条`);

  let fileCreated = 0;
  let fileK12 = 0;

  for (let i = 0; i < items.length; i += BATCH_SIZE) {
    const batch = items.slice(i, i + BATCH_SIZE);

    const records: Record<string, unknown>[] = [];

    for (const raw of batch) {
      const item = raw as Record<string, unknown>;

      // K12 过滤
      if (!file.skipK12Filter && isK12Academic(item)) {
        fileK12++;
        continue;
      }

      const mapped = mapToTutorial(item);
      if (mapped) records.push(mapped);
    }

    if (records.length === 0) continue;

    try {
      await prisma.tutorial.createMany({
        data: records as any[],
        skipDuplicates: true,
      });
      fileCreated += records.length;
      stats.tutorial.attempted += records.length;
    } catch (e) {
      console.error(`     ❌ 批次插入失败:`, e);
      stats.tutorial.errors += records.length;
    }
  }

  stats.tutorial.created += fileCreated;
  stats.k12Filtered += fileK12;

  const details = [`新增 ${fileCreated}`];
  if (fileK12 > 0) details.push(`K12过滤 ${fileK12}`);
  console.log(`     ✅ ${details.join(', ')}`);
}

// ============================================================
// 后置 K12 过滤（清理数据库中漏网之鱼）
// ============================================================

async function postImportK12Cleanup(): Promise<void> {
  console.log('\n🔍 后置 K12 学科类数据清理...');

  let totalRemoved = 0;

  // Course 表：批量删除
  const courses = await prisma.course.findMany({
    select: { id: true, title: true, subject: true, source: true, gradeLevel: true },
  });
  const toDelete: number[] = [];
  for (const c of courses) {
    if (isK12Academic({
      title: c.title,
      subject: c.subject,
      source: c.source ?? undefined,
      grade_level: c.gradeLevel ?? undefined,
    })) {
      toDelete.push(c.id);
    }
  }

  if (toDelete.length > 0) {
    const BATCH = 100;
    for (let i = 0; i < toDelete.length; i += BATCH) {
      const batch = toDelete.slice(i, i + BATCH);
      await prisma.course.deleteMany({ where: { id: { in: batch } } });
    }
    console.log(`  🗑️  Course: 批量移除 ${toDelete.length} 条`);
    totalRemoved += toDelete.length;
  }

  // Courseware 表：批量删除
  const coursewares = await prisma.courseware.findMany({ select: { id: true, title: true, subject: true, gradeLevel: true } });
  const cwToDelete: string[] = [];
  for (const c of coursewares) {
    if (isK12Academic({ title: c.title, subject: c.subject, grade_level: c.gradeLevel ?? undefined })) {
      cwToDelete.push(c.id);
    }
  }
  if (cwToDelete.length > 0) {
    await prisma.courseware.deleteMany({ where: { id: { in: cwToDelete } } });
    console.log(`  🗑️  Courseware: 批量移除 ${cwToDelete.length} 条`);
    totalRemoved += cwToDelete.length;
  }

  // Tutorial 表：批量删除
  const tutorials = await prisma.tutorial.findMany({ select: { id: true, title: true, subject: true, gradeLevel: true } });
  const tToDelete: string[] = [];
  for (const t of tutorials) {
    if (isK12Academic({ title: t.title, subject: t.subject, grade_level: t.gradeLevel ?? undefined })) {
      tToDelete.push(t.id);
    }
  }
  if (tToDelete.length > 0) {
    await prisma.tutorial.deleteMany({ where: { id: { in: tToDelete } } });
    console.log(`  🗑️  Tutorial: 批量移除 ${tToDelete.length} 条`);
    totalRemoved += tToDelete.length;
  }

  stats.k12Filtered += totalRemoved;
  if (totalRemoved === 0) console.log('  ✅ 数据库已干净，无 K12 内容');
}

// ============================================================
// 验证
// ============================================================

async function verifyImport(): Promise<void> {
  console.log('\n📊 验证数据库内容...');

  const [courseCount, coursewareCount, tutorialCount] = await Promise.all([
    prisma.course.count(),
    prisma.courseware.count(),
    prisma.tutorial.count(),
  ]);

  console.log(`  📚 Course:     ${courseCount} 条`);
  console.log(`  📄 Courseware: ${coursewareCount} 条`);
  console.log(`  📖 Tutorial:   ${tutorialCount} 条`);

  // 展示样本
  if (courseCount > 0) {
    const samples = await prisma.course.findMany({ take: 5, orderBy: { courseId: 'asc' } });
    console.log('\n  示例课程:');
    for (const s of samples) {
      console.log(`    - [${s.subject}] ${s.title} (${s.courseId})`);
    }
  }

  if (coursewareCount > 0) {
    const samples = await prisma.courseware.findMany({ take: 3, orderBy: { createdAt: 'desc' } });
    console.log('\n  示例课件:');
    for (const s of samples) {
      console.log(`    - [${s.subject}] ${s.title} (${s.type})`);
    }
  }

  if (tutorialCount > 0) {
    const samples = await prisma.tutorial.findMany({ take: 3, orderBy: { createdAt: 'desc' } });
    console.log('\n  示例教程:');
    for (const s of samples) {
      console.log(`    - [${s.subject}] ${s.title}`);
    }
  }
}

// ============================================================
// 主流程
// ============================================================

async function main() {
  console.log('='.repeat(64));
  console.log('🔄 JSON → PostgreSQL 内容数据导入管道');
  console.log('='.repeat(64));

  // 连接数据库
  console.log('\n🔗 连接数据库...');
  try {
    await prisma.$connect();
    console.log('   ✅ 连接成功');
  } catch (e) {
    console.error('   ❌ 连接失败:', e);
    process.exit(1);
  }

  // 先清空 Courseware / Tutorial 表，保证幂等（Course 用 upsert 所以不需要清）
  console.log('\n🧹 清空 Courseware / Tutorial 表（重新导入）...');
  try {
    await prisma.courseware.deleteMany();
    await prisma.tutorial.deleteMany();
    console.log('   ✅ 已清空');
  } catch (e) {
    console.error('   ❌ 清空失败:', e);
    process.exit(1);
  }

  // Phase 1: Course 表
  console.log('\n' + '─'.repeat(64));
  console.log('📚 Phase 1: 导入 Course 表');
  console.log('─'.repeat(64));
  for (const file of COURSE_FILES) {
    if (!fs.existsSync(file.path)) {
      console.log(`  ⏭️  文件不存在，跳过: ${path.basename(file.path)}`);
      continue;
    }
    await importCourseFile(file);
  }

  // Phase 2: Courseware 表
  console.log('\n' + '─'.repeat(64));
  console.log('📄 Phase 2: 导入 Courseware 表');
  console.log('─'.repeat(64));
  for (const file of COURSEWARE_FILES) {
    if (!fs.existsSync(file.path)) {
      console.log(`  ⏭️  文件不存在，跳过: ${path.basename(file.path)}`);
      continue;
    }
    await importCoursewareFile(file);
  }

  // Phase 3: Tutorial 表
  console.log('\n' + '─'.repeat(64));
  console.log('📖 Phase 3: 导入 Tutorial 表');
  console.log('─'.repeat(64));
  for (const file of TUTORIAL_FILES) {
    if (!fs.existsSync(file.path)) {
      console.log(`  ⏭️  文件不存在，跳过: ${path.basename(file.path)}`);
      continue;
    }
    await importTutorialFile(file);
  }

  // Phase 4: 后置 K12 过滤
  console.log('\n' + '─'.repeat(64));
  console.log('🔍 Phase 4: 后置 K12 学科内容清理');
  console.log('─'.repeat(64));
  await postImportK12Cleanup();

  // Phase 5: 验证
  console.log('\n' + '─'.repeat(64));
  console.log('✅ Phase 5: 验证导入结果');
  console.log('─'.repeat(64));
  await verifyImport();

  // 汇总报告
  console.log('\n' + '='.repeat(64));
  console.log('📋 导入报告');
  console.log('='.repeat(64));
  console.log(`  Course:     ${stats.course.created} 条新增`);
  console.log(`  Courseware: ${stats.courseware.created} 条新增`);
  console.log(`  Tutorial:   ${stats.tutorial.created} 条新增`);
  if (stats.k12Filtered > 0) {
    console.log(`  🗑️  K12已过滤: ${stats.k12Filtered} 条`);
  }
  if (stats.course.errors > 0 || stats.courseware.errors > 0 || stats.tutorial.errors > 0) {
    console.log(`  ⚠️  错误: Course ${stats.course.errors}, Courseware ${stats.courseware.errors}, Tutorial ${stats.tutorial.errors}`);
  }

  // 断开连接
  await prisma.$disconnect();
  console.log('\n👋 数据库连接已关闭');
}

main();
