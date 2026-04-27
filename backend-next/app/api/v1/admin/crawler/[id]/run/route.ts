import { NextResponse } from 'next/server';
import { getCrawlerConfig, executeCrawl } from '../../lib';

/**
 * POST /api/v1/admin/crawler/[id]/run
 * 运行爬虫
 */
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const crawlerId = params.id;
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
  } catch (error: any) {
    console.error('Run crawler error:', error);
    return NextResponse.json(
      { error: '服务器错误', message: error.message },
      { status: 500 }
    );
  }
}
