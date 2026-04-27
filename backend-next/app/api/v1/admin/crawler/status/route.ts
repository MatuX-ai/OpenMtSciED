import { NextResponse } from 'next/server';
import { loadConfigs } from '../lib';

/**
 * GET /api/v1/admin/crawler/status
 * 获取所有爬虫的状态
 */
export async function GET() {
  try {
    const configs = loadConfigs();
    
    // 只返回状态相关的信息
    const statusList = configs.map(config => ({
      id: config.id,
      name: config.name,
      status: config.status,
      progress: config.progress,
      total_items: config.total_items,
      scraped_items: config.scraped_items,
      last_run: config.last_run,
      error_message: config.error_message,
    }));
    
    return NextResponse.json({
      success: true,
      data: statusList,
    });
  } catch (error: unknown) {
    console.error('Get crawler status error:', error);
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    return NextResponse.json(
    { error: '服务器错误', message: errorMessage },
      { status: 500 }
    );
  }
}
