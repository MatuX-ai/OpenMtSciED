import { NextResponse } from 'next/server';
import { getCrawlerConfig, executeCrawl } from '../../lib';

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
