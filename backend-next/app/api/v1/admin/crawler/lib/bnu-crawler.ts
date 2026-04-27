/**
 * BNU Shanghai K12 爬虫
 * 从现有数据文件加载北师大上海 K12 课程
 */

import { registerCrawler } from './registry';
import type { CrawlerConfig, CrawlResult } from './types';
import { loadJsonFile, createSuccessResult, createErrorResult } from './utils';

async function crawlBnuShanghai(config: CrawlerConfig): Promise<CrawlResult> {
  try {
    console.log('[BNU Shanghai] Starting crawler...');
    
    const outputFile = config.output_file || 'course_library/bnu_shanghai_k12_courses.json';
    
    // 加载现有数据
    const data = loadJsonFile(outputFile);
    
    if (data.length === 0) {
      console.warn(`[BNU Shanghai] No data found in ${outputFile}`);
      return createSuccessResult(0, 0, []);
    }
    
    console.log(`[BNU Shanghai] Loaded ${data.length} courses from ${outputFile}`);
    
    return createSuccessResult(data.length, data.length, data);
  } catch (error: unknown) {
    console.error('[BNU Shanghai] Crawler error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return createErrorResult(errorMessage);
  }
}

// 注册爬虫
registerCrawler(
  'bnu_shanghai_k12',
  'BNU Shanghai K12',
  crawlBnuShanghai,
  '爬取北师大上海K12课程'
);

console.log('[BNU Shanghai] Crawler registered');
