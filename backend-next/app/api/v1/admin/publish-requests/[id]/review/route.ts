import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import {
  approvePublishRequest,
  rejectPublishRequest,
  serializePublishRequest,
} from '@/lib/publish-package';

type RouteParams = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: RouteParams) {
  const auth = requireAdmin(request);
  if (!auth.ok) return auth.response;

  const { id: idParam } = await params;
  const id = parseInt(idParam, 10);
  if (Number.isNaN(id)) {
    return NextResponse.json({ error: '无效的 ID' }, { status: 400 });
  }

  try {
    const body = await request.json();
    const action = body.action as 'approve' | 'reject';
    const note = body.note as string | undefined;
    const featured = Boolean(body.featured);

    if (action === 'approve') {
      const updated = await approvePublishRequest(id, auth.userId, note, featured);
      return NextResponse.json({
        success: true,
        request: updated ? serializePublishRequest(updated) : null,
      });
    }

    if (action === 'reject') {
      await rejectPublishRequest(id, auth.userId, note);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: '无效的操作' }, { status: 400 });
  } catch (error) {
    console.error('Review publish request failed:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '审核失败' },
      { status: 500 }
    );
  }
}
