/**
 * OpenStax 爬虫
 * 从现有数据文件加载 OpenStax 教材章节
 */

import { registerCrawler } from './registry';
import type { CrawlerConfig, CrawlResult } from './types';
import { loadJsonFile, createSuccessResult, createErrorResult } from './utils';

async function crawlOpenStax(config: CrawlerConfig): Promise<CrawlResult> {
  try {
    console.log('[OpenStax] Starting crawler...');
    
    const outputFile = config.output_file || 'textbook_library/openstax_chapters.json';
    
    // 加载现有数据
    const data = loadJsonFile(outputFile);
    
    if (data.length === 0) {
      console.warn(`[OpenStax] No data found in ${outputFile}`);
      return createSuccessResult(0, 0, []);
    }
    
    console.log(`[OpenStax] Loaded ${data.length} chapters from ${outputFile}`);
    
    return createSuccessResult(data.length, data.length, data);
  } catch (error: unknown) {
    console.error('[OpenStax] Crawler error:', error);
    return createErrorResult(error.message || 'Unknown error');
  }
}

// 注册爬虫
registerCrawler(
  'openstax_textbooks',
  'OpenStax Textbooks',
  crawlOpenStax,
  '爬取 OpenStax 教材章节'
);

console.log('[OpenStax] Crawler registered');
