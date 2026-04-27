/**
 * 爬虫工具函数
 */

import * as fs from 'fs';
import * as path from 'path';
import type { CrawlResult } from './types';

// 数据目录路径
const DATA_DIR = path.join(process.cwd(), '..', 'data');

/**
 * 保存数据到 JSON 文件
 */
export function saveData(data: unknown[], outputFile: string): void {
  const outputPath = path.isAbsolute(outputFile) 
    ? outputFile 
    : path.join(DATA_DIR, outputFile);
  
  const outputDir = path.dirname(outputPath);
  
  // 确保目录存在
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  // 如果文件已存在，合并数据
  let existingData: unknown[] = [];
  if (fs.existsSync(outputPath)) {
    try {
      const content = fs.readFileSync(outputPath, 'utf-8');
      existingData = JSON.parse(content);
    } catch {
      console.warn(`Failed to read existing data from ${outputPath}`);
    }
  }
  
  existingData.push(...data);
  
  fs.writeFileSync(outputPath, JSON.stringify(existingData, null, 2), 'utf-8');
  console.log(`[Crawler] Saved ${data.length} items to ${outputPath}`);
}

/**
 * 加载 JSON 文件
 */
export function loadJsonFile(filePath: string): unknown[] {
  const fullPath = path.isAbsolute(filePath) 
    ? filePath 
    : path.join(DATA_DIR, filePath);
  
  if (!fs.existsSync(fullPath)) {
    return [];
  }
  
  try {
    const content = fs.readFileSync(fullPath, 'utf-8');
    return JSON.parse(content);
  } catch (e) {
    console.error(`Failed to load JSON file: ${fullPath}`, e);
    return [];
  }
}

/**
 * 保存 JSON 文件（覆盖）
 */
export function saveJsonFile(filePath: string, data: unknown): void {
  const fullPath = path.isAbsolute(filePath) 
    ? filePath 
    : path.join(DATA_DIR, filePath);
  
  const outputDir = path.dirname(fullPath);
  
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  fs.writeFileSync(fullPath, JSON.stringify(data, null, 2), 'utf-8');
}

/**
 * 检查文件是否存在
 */
export function fileExists(filePath: string): boolean {
  const fullPath = path.isAbsolute(filePath) 
    ? filePath 
    : path.join(DATA_DIR, filePath);
  return fs.existsSync(fullPath);
}

/**
 * 获取文件大小
 */
export function getFileSize(filePath: string): number | null {
  const fullPath = path.isAbsolute(filePath) 
    ? filePath 
    : path.join(DATA_DIR, filePath);
  
  if (!fs.existsSync(fullPath)) {
    return null;
  }
  
  const stats = fs.statSync(fullPath);
  return stats.size;
}

/**
 * 创建成功的爬取结果
 */
export function createSuccessResult(
  totalItems: number,
  scrapedItems: number,
  data: unknown[]
): CrawlResult {
  return {
    success: true,
    total_items: totalItems,
    scraped_items: scrapedItems,
    data,
  };
}

/**
 * 创建失败的爬取结果
 */
export function createErrorResult(error: string): CrawlResult {
  return {
    success: false,
    total_items: 0,
    scraped_items: 0,
    data: [],
    error,
  };
}
