/**
 * 爬虫定时任务调度器
 */

import type { CrawlerConfig } from './types';
import { loadConfigs } from './config';
import { executeCrawl } from './executor';

// 存储定时器 ID
const scheduledTimers: Map<string, NodeJS.Timeout> = new Map();

/**
 * 为单个爬虫设置定时任务
 */
export function scheduleCrawler(crawler: CrawlerConfig): void {
  const crawlerId = crawler.id;
  const intervalHours = crawler.schedule_interval;
  
  if (!intervalHours || intervalHours <= 0) {
    return;
  }
  
  // 清除已存在的定时器
  if (scheduledTimers.has(crawlerId)) {
    clearInterval(scheduledTimers.get(crawlerId)!);
    scheduledTimers.delete(crawlerId);
  }
  
  // 转换为毫秒
  const intervalMs = intervalHours * 60 * 60 * 1000;
  
  // 设置新的定时器
  const timer = setInterval(() => {
    console.log(`[Scheduler] Running scheduled crawler: ${crawler.name}`);
    executeCrawl(crawler).catch(err => {
      console.error(`[Scheduler] Error in scheduled crawler ${crawlerId}:`, err);
    });
  }, intervalMs);
  
  scheduledTimers.set(crawlerId, timer);
  console.log(`[Scheduler] Scheduled ${crawler.name} every ${intervalHours} hours`);
}

/**
 * 取消爬虫的定时任务
 */
export function unscheduleCrawler(crawlerId: string): void {
  if (scheduledTimers.has(crawlerId)) {
    clearInterval(scheduledTimers.get(crawlerId)!);
    scheduledTimers.delete(crawlerId);
    console.log(`[Scheduler] Unscheduled crawler: ${crawlerId}`);
  }
}

/**
 * 初始化所有定时任务（服务启动时调用）
 */
export function initScheduledTasks(): void {
  const configs = loadConfigs();
  
  for (const config of configs) {
    if (config.schedule_interval && config.schedule_interval > 0) {
      scheduleCrawler(config);
    }
  }
  
  console.log(`[Scheduler] Initialized ${scheduledTimers.size} scheduled tasks`);
}

/**
 * 清除所有定时任务
 */
export function clearAllSchedules(): void {
  scheduledTimers.forEach((timer) => {
    clearInterval(timer);
  });
  scheduledTimers.clear();
  console.log('[Scheduler] Cleared all scheduled tasks');
}
