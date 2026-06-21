import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { resolvePlagiarismReport } from '@/lib/publish-package';

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
    const confirmed = Boolean(body.confirmed);
    const adminNote = body.admin_note || body.adminNote;

    await resolvePlagiarismReport(id, auth.userId, confirmed, adminNote);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Resolve plagiarism failed:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '处理失败' },
      { status: 500 }
    );
  }
}
