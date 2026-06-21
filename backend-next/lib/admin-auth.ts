import { NextResponse } from 'next/server';
import { getTokenFromHeader, verifyToken } from '@/lib/auth';

export type AdminAuthResult =
  | { ok: true; userId: number; username: string }
  | { ok: false; response: NextResponse };

/**
 * 验证管理员 JWT
 */
export function requireAdmin(request: Request): AdminAuthResult {
  const authHeader = request.headers.get('authorization') || undefined;
  const token = getTokenFromHeader(authHeader);

  if (!token) {
    return {
      ok: false,
      response: NextResponse.json({ error: '未授权访问' }, { status: 401 }),
    };
  }

  const decoded = verifyToken(token);
  if (!decoded || decoded.role !== 'admin') {
    return {
      ok: false,
      response: NextResponse.json({ error: '需要管理员权限' }, { status: 403 }),
    };
  }

  return { ok: true, userId: decoded.userId, username: decoded.username };
}
