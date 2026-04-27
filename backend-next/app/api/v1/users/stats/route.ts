import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getTokenFromHeader, verifyToken } from '@/lib/auth';

/**
 * GET /api/v1/users/stats
 * 获取用户统计信息（管理员）
 */
export async function GET(request: Request) {
  try {
    // 验证管理员权限
    const authHeader = request.headers.get('authorization');
    const token = getTokenFromHeader(authHeader);

    if (!token) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (decoded.role !== 'admin') {
      return NextResponse.json({ error: '需要管理员权限' }, { status: 403 });
    }

    // 获取统计数据
    const [totalUsers, activeUsers, inactiveUsers, adminUsers] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { isActive: true } }),
      prisma.user.count({ where: { isActive: false } }),
      prisma.user.count({ where: { role: 'admin' } }),
    ]);

    return NextResponse.json({
      totalUsers,
      activeUsers,
      inactiveUsers,
      adminUsers,
      orgAdminUsers: 0,
    });
  } catch (error: any) {
    console.error('Get user stats error:', error);
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}
