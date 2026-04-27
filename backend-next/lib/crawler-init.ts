/**
 * 爬虫系统初始化
 * 在服务器启动时调用，初始化所有定时任务
 */

import { initScheduledTasks } from '../app/api/v1/admin/crawler/lib/scheduler';
import { initCrawlers } from '../app/api/v1/admin/crawler/lib/registry';

let initialized = false;

/**
 * 初始化爬虫系统
 */
export async function initCrawlerSystem(): Promise<void> {
  if (initialized) {
    console.log('[Crawler System] Already initialized');
    return;
  }
  
  try {
    console.log('[Crawler System] Initializing...');
    
    // 注册所有爬虫
    await initCrawlers();
    
    // 初始化定时任务
    initScheduledTasks();
    
    initialized = true;
    console.log('[Crawler System] Initialized successfully');
  } catch (error) {
    console.error('[Crawler System] Initialization failed:', error);
    throw error;
  }
}
