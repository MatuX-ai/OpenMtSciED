import { NextResponse } from 'next/server';
import {
  getCrawlerConfig,
  deleteCrawlerConfig,
  unscheduleCrawler,
} from '../lib';

/**
 * GET /api/v1/admin/crawler/[id]
 * 获取单个爬虫配置
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: crawlerId } = await params;
    const config = await getCrawlerConfig(crawlerId);
    
    if (!config) {
      return NextResponse.json(
        { success: false, error: '未找到爬虫' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: config,
    });
  } catch (error: unknown) {
    console.error('Get crawler config error:', error);
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
    const deleted = await deleteCrawlerConfig(crawlerId);
    
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
