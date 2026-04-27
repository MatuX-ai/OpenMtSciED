import { NextResponse } from 'next/server';
import {
  loadConfigs,
  addCrawlerConfig,
} from './lib';

/**
 * GET /api/v1/admin/crawler
 * 获取爬虫列表
 */
export async function GET() {
  try {
    const configs = loadConfigs();
    return NextResponse.json({
      success: true,
      data: configs,
    });
  } catch (error: unknown) {
    console.error('Get crawler list error:', error);
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    return NextResponse.json(
    { error: '服务器错误', message: errorMessage },
      { status: 500 }
    );
  }
}

/**
 * POST /api/v1/admin/crawler
 * 创建爬虫任务
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // 设置默认值
    const config = {
      id: body.id || `crawler-${Date.now()}`,
      name: body.name,
      description: body.description || '',
      target_url: body.target_url || '',
      type: body.type || 'course',
      status: 'idle' as const,
      progress: 0,
      total_items: 0,
      scraped_items: 0,
      last_run: null,
      error_message: null,
      output_file: body.output_file,
      schedule_interval: body.schedule_interval,
      ...body,
    };
    
    addCrawlerConfig(config);
    
    return NextResponse.json({
      success: true,
      message: '爬虫任务创建成功',
      data: config,
    });
  } catch (error: unknown) {
    console.error('Create crawler error:', error);
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    return NextResponse.json(
    { error: '服务器错误', message: errorMessage },
      { status: 500 }
    );
  }
}
