import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { rebuildAllClosure, rebuildClosureForType } from '@/lib/concept-path';

/**
 * POST /api/v1/admin/concepts/rebuild-closure
 * 全量重建闭包表（指定 pathType 或全部）
 */
export async function POST(request: Request) {
  const auth = requireAdmin(request);
  if (!auth.ok) return auth.response;

  try {
    const body = await request.json().catch(() => ({}));
    const pathType =
      typeof body.pathType === 'string' && body.pathType.trim()
        ? body.pathType.trim()
        : undefined;

    if (pathType) {
      const stats = await rebuildClosureForType(pathType);
      return NextResponse.json({
        message: `Closure rebuilt for path_type="${pathType}"`,
        pathType,
        ...stats,
      });
    }

    const result = await rebuildAllClosure();
    return NextResponse.json({
      message: 'All closure tables rebuilt',
      ...result,
    });
  } catch (error: unknown) {
    console.error('Rebuild closure error:', error);
    const message = error instanceof Error ? error.message : '未知错误';
    return NextResponse.json({ error: '服务器错误', message }, { status: 500 });
  }
}
