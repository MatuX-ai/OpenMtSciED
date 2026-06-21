import { NextResponse } from 'next/server';
import { getTokenFromHeader, verifyToken } from '@/lib/auth';

export type UserAuthResult =
  | { ok: true; userId: number; username: string; role: string }
  | { ok: false; response: NextResponse };

/** 验证已登录用户 JWT（任意 role） */
export function requireUser(request: Request): UserAuthResult {
  const authHeader = request.headers.get('authorization') || undefined;
  const token = getTokenFromHeader(authHeader);

  if (!token) {
    return {
      ok: false,
      response: NextResponse.json({ error: '未授权访问' }, { status: 401 }),
    };
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return {
      ok: false,
      response: NextResponse.json({ error: '无效或过期的令牌' }, { status: 401 }),
    };
  }

  return {
    ok: true,
    userId: decoded.userId,
    username: decoded.username,
    role: decoded.role,
  };
}

/** 可选认证：有 token 则解析，无 token 返回 null */
export function optionalUser(
  request: Request
): { userId: number; username: string; role: string } | null {
  const authHeader = request.headers.get('authorization') || undefined;
  const token = getTokenFromHeader(authHeader);
  if (!token) return null;
  const decoded = verifyToken(token);
  if (!decoded) return null;
  return { userId: decoded.userId, username: decoded.username, role: decoded.role };
}
