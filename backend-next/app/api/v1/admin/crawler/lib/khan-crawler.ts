/**
 * Khan Academy 爬虫
 * 从现有数据文件加载可汗学院课程
 */

import { registerCrawler } from './registry';
import type { CrawlerConfig, CrawlResult } from './types';
import { loadJsonFile, createSuccessResult, createErrorResult } from './utils';

async function crawlKhanAcademy(config: CrawlerConfig): Promise<CrawlResult> {
  try {
    console.log('[Khan Academy] Starting crawler...');
    
    const outputFile = config.output_file || 'course_library/khan_academy_courses.json';
    
    // 加载现有数据
    const data = loadJsonFile(outputFile);
    
    if (data.length === 0) {
      console.warn(`[Khan Academy] No data found in ${outputFile}`);
      return createSuccessResult(0, 0, []);
    }
    
    console.log(`[Khan Academy] Loaded ${data.length} courses from ${outputFile}`);
    
    return createSuccessResult(data.length, data.length, data);
  } catch (error: unknown) {
    console.error('[Khan Academy] Crawler error:', error);
    return createErrorResult(error.message || 'Unknown error');
  }
}

// 注册爬虫
registerCrawler(
  'khan_academy',
  'Khan Academy Courses',
  crawlKhanAcademy,
  '生成可汗学院 K-12 STEM 课程'
);

console.log('[Khan Academy] Crawler registered');
