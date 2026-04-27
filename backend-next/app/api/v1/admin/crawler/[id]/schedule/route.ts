import { NextResponse } from 'next/server';
import { getCrawlerConfig, updateCrawlerConfig, scheduleCrawler, unscheduleCrawler } from '../../lib';

/**
 * PUT /api/v1/admin/crawler/[id]/schedule
 * 设置爬虫定时任务
 */
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const crawlerId = params.id;
    const url = new URL(request.url);
    const intervalHours = parseInt(url.searchParams.get('interval_hours') || '24');
    
    const config = getCrawlerConfig(crawlerId);
    
    if (!config) {
      return NextResponse.json(
        { error: '未找到爬虫', message: `Crawler ${crawlerId} not found` },
        { status: 404 }
      );
    }
    
    // 更新配置
    updateCrawlerConfig(crawlerId, { schedule_interval: intervalHours });
    
    // 重新加载配置并设置定时任务
    const updatedConfig = getCrawlerConfig(crawlerId);
    if (updatedConfig) {
      if (intervalHours > 0) {
        scheduleCrawler(updatedConfig);
      } else {
        unscheduleCrawler(crawlerId);
      }
    }
    
    return NextResponse.json({
      success: true,
      message: `爬虫 ${config.name} 定时任务已设置为每 ${intervalHours} 小时`,
    });
  } catch (error: any) {
    console.error('Schedule crawler error:', error);
    return NextResponse.json(
      { error: '服务器错误', message: error.message },
      { status: 500 }
    );
  }
}
