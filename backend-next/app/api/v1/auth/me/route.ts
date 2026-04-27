import { NextResponse } from 'next/server';
import { getTokenFromHeader, verifyToken } from '@/lib/auth';
import prisma from '@/lib/db';

/**
 * GET /api/v1/auth/me
 * 获取当前登录用户信息
 */
export async function GET(request: Request) {
  try {
    // 获取 Token
    const authHeader = request.headers.get('authorization') || undefined;
    const token = getTokenFromHeader(authHeader);

    if (!token) {
      return NextResponse.json(
        { error: '未授权访问' },
        { status: 401 }
      );
    }

    // 验证 Token
    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { error: 'Token 无效' },
        { status: 401 }
      );
    }

    // 查询用户
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: '用户不存在' },
        { status: 404 }
      );
    }

    return NextResponse.json({ user });
  } catch (error: unknown) {
    console.error('Get user error:', error);
    return NextResponse.json(
      { error: 'Token 无效或已过期' },
      { status: 401 }
    );
  }
}
