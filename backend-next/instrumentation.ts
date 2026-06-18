/**
 * 爬虫系统启动初始化
 * 在服务器启动时自动恢复所有已配置的定时任务
 */
import { initCrawlers } from './app/api/v1/admin/crawler/lib';

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    console.log('[Instrumentation] Initializing crawler system...');
    try {
      await initCrawlers();
      console.log('[Instrumentation] Crawler system initialized successfully');
    } catch (error) {
      console.error('[Instrumentation] Failed to initialize crawler system:', error);
    }
  }
}
