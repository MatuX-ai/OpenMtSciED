import { NextResponse } from 'next/server';
import { getPlatformStatus } from '../../lib';

/**
 * GET /api/v1/admin/crawler/education-platforms/status
 * 获取教育平台状态
 */
export async function GET() {
  try {
    const platforms = getPlatformStatus();
    
    return NextResponse.json({
      success: true,
      data: platforms,
    });
  } catch (error: any) {
    console.error('Get platform status error:', error);
    return NextResponse.json(
      { error: '服务器错误', message: error.message },
      { status: 500 }
    );
  }
}
