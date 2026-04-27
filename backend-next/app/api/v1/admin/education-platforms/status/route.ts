import { NextResponse } from 'next/server';

/**
 * GET /api/v1/admin/education-platforms/status
 * 获取教育平台状态（简化版本）
 */
export async function GET() {
  try {
    // 返回简化的平台状态
    return NextResponse.json({
      success: true,
      data: {
        platforms: [],
        totalPlatforms: 0,
        activePlatforms: 0,
        lastSyncTime: null
      }
    });
  } catch (error: any) {
    console.error('Get education platforms status error:', error);
    return NextResponse.json(
      { error: '服务器错误', message: error.message },
      { status: 500 }
    );
  }
}
