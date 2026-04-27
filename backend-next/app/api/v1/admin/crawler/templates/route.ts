import { NextResponse } from 'next/server';
import { getAvailableCrawlers, initCrawlers } from '../lib';

// 初始化爬虫（只在首次请求时执行）
let crawlersInitialized = false;
async function ensureCrawlersInitialized() {
  if (!crawlersInitialized) {
    await initCrawlers();
    crawlersInitialized = true;
  }
}

/**
 * GET /api/v1/admin/crawler/templates
 * 获取所有可用的爬虫模板
 */
export async function GET() {
  try {
    await ensureCrawlersInitialized();
    
    const templates = getAvailableCrawlers();
    
    return NextResponse.json({
      success: true,
      data: templates,
    });
  } catch (error: any) {
    console.error('Get crawler templates error:', error);
    return NextResponse.json(
      { error: '服务器错误', message: error.message },
      { status: 500 }
    );
  }
}
