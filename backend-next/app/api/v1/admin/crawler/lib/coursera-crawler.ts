/**
 * Coursera 爬虫
 * 从现有数据文件加载 Coursera 课程
 */

import { registerCrawler } from './registry';
import type { CrawlerConfig, CrawlResult } from './types';
import { loadJsonFile, createSuccessResult, createErrorResult } from './utils';

async function crawlCoursera(config: CrawlerConfig): Promise<CrawlResult> {
  try {
    console.log('[Coursera] Starting crawler...');
    
    const outputFile = config.output_file || 'course_library/coursera_university_courses.json';
    
    // 加载现有数据
    const data = loadJsonFile(outputFile);
    
    if (data.length === 0) {
      console.warn(`[Coursera] No data found in ${outputFile}`);
      return createSuccessResult(0, 0, []);
    }
    
    console.log(`[Coursera] Loaded ${data.length} courses from ${outputFile}`);
    
    return createSuccessResult(data.length, data.length, data);
  } catch (error: unknown) {
    console.error('[Coursera] Crawler error:', error);
    return createErrorResult(error.message || 'Unknown error');
  }
}

// 注册爬虫
registerCrawler(
  'coursera_stem',
  'Coursera STEM Courses',
  crawlCoursera,
  '生成 Coursera 理工科课程'
);

console.log('[Coursera] Crawler registered');
