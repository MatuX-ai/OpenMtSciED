/**
 * 图书馆数据加载模块
 *
 * 统一数据加载逻辑，供搜索引擎各 API 使用。
 * 避免多个 API 文件重复实现相同的 JSON 加载逻辑。
 */

import fs from 'fs';
import path from 'path';

/** 数据根目录 */
export const DATA_DIR = path.join(process.cwd(), '..', 'data');

/** 课程库目录 */
export const COURSE_LIBRARY_DIR = path.join(DATA_DIR, 'course_library');

/** 课件库目录 */
export const TEXTBOOK_LIBRARY_DIR = path.join(DATA_DIR, 'textbook_library');

/** 试题库目录 */
export const QUESTION_LIBRARY_DIR = path.join(DATA_DIR, 'question_library');

/**
 * 从目录加载所有 JSON 文件
 * @param dir 目标目录
 * @param excludePatterns 排除文件名模式（子串匹配，向后兼容）
 * @param exactExcludes 排除精确文件名（推荐，避免模糊匹配误伤）
 */
export function loadJsonFiles<T>(
  dir: string,
  excludePatterns: string[] = [],
  exactExcludes: string[] = []
): (T & { _source_file: string })[] {
  const allData: (T & { _source_file: string })[] = [];
  if (!fs.existsSync(dir)) return allData;

  const files = fs.readdirSync(dir).filter(f => {
    if (!f.endsWith('.json')) return false;
    // 精确排除优先级最高
    if (exactExcludes.length > 0 && exactExcludes.includes(f)) return false;
    // 向后兼容子串排除
    if (excludePatterns.some(p => f.includes(p))) return false;
    return true;
  });

  for (const filename of files) {
    try {
      const filePath = path.join(dir, filename);
      const content = fs.readFileSync(filePath, 'utf-8');
      const data = JSON.parse(content);
      if (Array.isArray(data)) {
        allData.push(...data.map((item: T) => ({ ...item, _source_file: filename })));
      } else if (data.data && Array.isArray(data.data)) {
        allData.push(...data.data.map((item: T) => ({ ...item, _source_file: filename })));
      } else {
        allData.push({ ...(data as T), _source_file: filename });
      }
    } catch (e) {
      console.error(`Failed to load file ${filename}:`, e);
    }
  }
  return allData;
}

/**
 * 加载单个 JSON 文件（数组格式）
 */
export function loadJsonArray<T>(filePath: string): T[] {
  try {
    if (!fs.existsSync(filePath)) return [];
    const content = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(content);
    if (Array.isArray(data)) return data;
    if (data.data && Array.isArray(data.data)) return data.data;
    return [];
  } catch (e) {
    console.error(`Failed to load ${filePath}:`, e);
    return [];
  }
}

/**
 * 从目录加载所有 JSON 文件中的标题（用于建议搜索）
 */
export function loadAllTitles(
  dir: string,
  excludePatterns: string[] = [],
  exactExcludes: string[] = []
): string[] {
  const titles: string[] = [];
  if (!fs.existsSync(dir)) return titles;

  const files = fs.readdirSync(dir).filter(f => {
    if (!f.endsWith('.json')) return false;
    if (exactExcludes.length > 0 && exactExcludes.includes(f)) return false;
    if (excludePatterns.some(p => f.includes(p))) return false;
    return true;
  });

  for (const filename of files) {
    try {
      const filePath = path.join(dir, filename);
      const content = fs.readFileSync(filePath, 'utf-8');
      const data = JSON.parse(content);
      const items = Array.isArray(data) ? data : (data.data || []);
      for (const item of items) {
        if (item.title) {
          titles.push(item.title);
        } else if (item.content) {
          titles.push(item.content);
        }
      }
    } catch (e) {
      // skip errors
    }
  }
  return titles;
}
