/**
 * 爬虫执行引擎
 */

import type { CrawlerConfig } from './types';
import { getCrawlerHandler } from './registry';
import { updateCrawlerConfig } from './config';

/**
 * 执行爬虫任务
 */
export async function executeCrawl(crawler: CrawlerConfig): Promise<void> {
  const crawlerId = crawler.id;
  
  try {
    // 更新状态为运行中
    updateCrawlerConfig(crawlerId, {
      status: 'running',
      progress: 10,
    });
    
    console.log(`[Crawler] Starting ${crawler.name} (${crawlerId})`);
    
    // 获取注册的爬虫处理函数
    const handler = getCrawlerHandler(crawlerId);
    
    // 执行爬虫
    const result = await handler(crawler);
    
    // 更新状态
    if (result.success) {
      updateCrawlerConfig(crawlerId, {
        status: 'completed',
        progress: 100,
        total_items: result.total_items,
        scraped_items: result.scraped_items,
        last_run: new Date().toISOString(),
        error_message: null,
      });
      console.log(`[Crawler] Completed ${crawler.name}: ${result.scraped_items} items`);
    } else {
      updateCrawlerConfig(crawlerId, {
        status: 'failed',
        progress: 0,
        last_run: new Date().toISOString(),
        error_message: result.error || 'Unknown error',
      });
      console.error(`[Crawler] Failed ${crawler.name}: ${result.error}`);
    }
  } catch (error: unknown) {
    // 更新失败状态
    const errorMessage = error instanceof Error ? error.message : String(error);
    updateCrawlerConfig(crawlerId, {
      status: 'failed',
      progress: 0,
      last_run: new Date().toISOString(),
      error_message: errorMessage,
    });
    console.error(`[Crawler] Error executing ${crawler.name}:`, error);
  }
}
