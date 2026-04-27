import { NextResponse } from 'next/server';
import {
  getCrawlerConfig,
  deleteCrawlerConfig,
  updateCrawlerConfig,
  executeCrawl,
  scheduleCrawler,
  unscheduleCrawler,
} from '../lib';

/**
 * POST /api/v1/admin/crawler/[id]/run
 * 运行爬虫
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: crawlerId } = await params;
    const config = getCrawlerConfig(crawlerId);
    
    if (!config) {
      return NextResponse.json(
        { error: '未找到爬虫', message: `Crawler ${crawlerId} not found` },
        { status: 404 }
      );
    }
    
    // 在后台执行爬虫
    executeCrawl(config).catch((err) => {
      console.error(`[API] Error running crawler ${crawlerId}:`, err);
    });
    
    return NextResponse.json({
      success: true,
      message: `爬虫 ${config.name} 已启动`,
    });
  } catch (error: unknown) {
    console.error('Run crawler error:', error);
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    return NextResponse.json(
      { error: '服务器错误', message: errorMessage },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/v1/admin/crawler/[id]/schedule
 * 设置爬虫定时任务
 */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: crawlerId } = await params;
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
  } catch (error: unknown) {
    console.error('Schedule crawler error:', error);
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    return NextResponse.json(
      { error: '服务器错误', message: errorMessage },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/v1/admin/crawler/[id]
 * 删除爬虫
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: crawlerId } = await params;
    
    // 取消定时任务
    unscheduleCrawler(crawlerId);
    
    // 删除配置
    const deleted = deleteCrawlerConfig(crawlerId);
    
    if (!deleted) {
      return NextResponse.json(
        { error: '未找到爬虫', message: `Crawler ${crawlerId} not found` },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: `爬虫已删除`,
    });
  } catch (error: unknown) {
    console.error('Delete crawler error:', error);
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    return NextResponse.json(
      { error: '服务器错误', message: errorMessage },
      { status: 500 }
    );
  }
}
