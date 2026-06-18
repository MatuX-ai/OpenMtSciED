/**
 * 爬虫系统启动初始化
 * 在服务器启动时自动恢复所有已配置的定时任务
 */

export async function register() {
  // 仅在 Node.js 运行时加载，避免 Edge Runtime 编译报错
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    console.log('[Instrumentation] Initializing crawler system...');
    try {
      const { initCrawlers } = await import('./app/api/v1/admin/crawler/lib');
      await initCrawlers();
      console.log('[Instrumentation] Crawler system initialized successfully');
    } catch (error) {
      console.error('[Instrumentation] Failed to initialize crawler system:', error);
    }
  }
}
