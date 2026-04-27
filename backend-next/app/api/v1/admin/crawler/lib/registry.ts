/**
 * 爬虫注册系统
 * 统一管理所有爬虫任务
 */

import type { CrawlerHandler, CrawlerInfo } from './types';
import { crawlerRegistry } from './registry-store';

/**
 * 注册爬虫到全局注册表
 */
export function registerCrawler(
  crawlerId: string,
  name: string,
  handler: CrawlerHandler,
  description: string = ''
): void {
  crawlerRegistry.set(crawlerId, {
    id: crawlerId,
    name,
    handler,
    description,
  });
}

/**
 * 获取所有已注册的爬虫
 */
export function getAvailableCrawlers(): Array<Omit<CrawlerInfo, 'handler'>> {
  const crawlers: Array<Omit<CrawlerInfo, 'handler'>> = [];
  crawlerRegistry.forEach((info) => {
    const crawlerInfo = info as CrawlerInfo;
    crawlers.push({
      id: crawlerInfo.id,
      name: crawlerInfo.name,
      description: crawlerInfo.description,
    });
  });
  return crawlers;
}

/**
 * 获取指定爬虫的处理函数
 */
export function getCrawlerHandler(crawlerId: string): CrawlerHandler {
  const info = crawlerRegistry.get(crawlerId);
  if (!info) {
    throw new Error(`爬虫 ${crawlerId} 未注册`);
  }
  const crawlerInfo = info as CrawlerInfo;
  return crawlerInfo.handler;
}

/**
 * 检查爬虫是否已注册
 */
export function isCrawlerRegistered(crawlerId: string): boolean {
  return crawlerRegistry.has(crawlerId);
}

/**
 * 初始化爬虫（确保所有爬虫已注册）
 */
export async function initCrawlers(): Promise<void> {
  // 爬虫需要在调用此函数前手动导入
  console.log(`[Crawler] Total registered: ${crawlerRegistry.size}`);
}
