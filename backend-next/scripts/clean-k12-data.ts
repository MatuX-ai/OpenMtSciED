/**
 * K12 学科类课程数据清理脚本
 *
 * 扫描 data/course_library/ 和 data/textbook_library/ 下的所有 JSON 文件，
 * 移除其中的 K12 学科类课程条目，只保留 STEM 非学科教育内容。
 *
 * 使用: npx ts-node scripts/clean-k12-data.ts
 * 或:   node --require ts-node/register scripts/clean-k12-data.ts
 */

import fs from 'fs';
import path from 'path';
import { isK12Academic } from '../lib/k12-filter';

const DATA_DIR = path.join(__dirname, '..', '..', 'data');
const ROOT_DIR = path.join(__dirname, '..', '..');
const COURSE_LIBRARY_DIR = path.join(DATA_DIR, 'course_library');
const TEXTBOOK_LIBRARY_DIR = path.join(DATA_DIR, 'textbook_library');

interface DataItem {
  [key: string]: unknown;
  title?: string;
  subject?: string;
  source?: string;
  grade_level?: string;
  description?: string;
  _source_file?: string;
}

function loadJsonFile(filePath: string): DataItem[] {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(content);
    if (Array.isArray(data)) return data;
    if (data.data && Array.isArray(data.data)) return data.data;
    return [];
  } catch (e) {
    console.error(`  ❌ 读取失败: ${filePath}`, e);
    return [];
  }
}

function cleanJsonFile(filePath: string): { total: number; removed: number; saved: boolean } {
  const items = loadJsonFile(filePath);
  if (items.length === 0) return { total: 0, removed: 0, saved: false };

  const beforeCount = items.length;
  const cleaned = items.filter(item => {
    const isK12 = isK12Academic(item);
    if (isK12) {
      console.log(`  🗑️  过滤: [${item.subject}] ${item.title}`);
    }
    return !isK12;
  });
  const removedCount = beforeCount - cleaned.length;

  if (removedCount > 0) {
    const backupPath = filePath + '.bak';
    fs.copyFileSync(filePath, backupPath);
    console.log(`  💾 备份已创建: ${path.basename(backupPath)}`);

    const rawContent = fs.readFileSync(filePath, 'utf-8');
    const isIndented = rawContent.includes('\n    ') || rawContent.includes('\n  ');
    fs.writeFileSync(filePath, JSON.stringify(cleaned, null, isIndented ? 2 : 0), 'utf-8');
    console.log(`  ✅ 已保存: 剩余 ${cleaned.length} 条 (移除 ${removedCount} 条)`);
    return { total: beforeCount, removed: removedCount, saved: true };
  }

  return { total: beforeCount, removed: 0, saved: false };
}

function cleanDirectory(dir: string, label: string) {
  console.log(`\n📂 ${label} (${dir})`);
  if (!fs.existsSync(dir)) {
    console.log(`  目录不存在，跳过`);
    return { totalFiles: 0, totalRemoved: 0 };
  }

  const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));
  let totalFiles = 0;
  let totalRemoved = 0;

  for (const filename of files) {
    const filePath = path.join(dir, filename);
    console.log(`\n📄 ${filename}`);
    const result = cleanJsonFile(filePath);
    if (result.saved) totalFiles++;
    totalRemoved += result.removed;
  }

  console.log(`\n📊 ${label} 汇总: 处理 ${totalFiles} 个文件, 共移除 ${totalRemoved} 条 K12 学科类课程`);
  return { totalFiles, totalRemoved };
}

function main() {
  console.log('='.repeat(60));
  console.log('🔍 K12 学科类课程数据清理工具');
  console.log('='.repeat(60));
  console.log('\n正在扫描并清理 K12 学科类课程数据...\n');

  const courseResult = cleanDirectory(COURSE_LIBRARY_DIR, '教程库 (course_library)');
  const materialResult = cleanDirectory(TEXTBOOK_LIBRARY_DIR, '课件库 (textbook_library)');

  const totalRemoved = courseResult.totalRemoved + materialResult.totalRemoved;
  const totalFiles = courseResult.totalFiles + materialResult.totalFiles;

  console.log('\n' + '='.repeat(60));
  console.log(`✅ 清理完成!`);
  console.log(`   处理文件: ${totalFiles} 个`);
  console.log(`   移除条目: ${totalRemoved} 条`);
  console.log('='.repeat(60));

  if (totalRemoved === 0) {
    console.log('\n💡 提示: 数据已干净，无需清理。运行时过滤由搜索 API 负责。');
  }
}

main();
