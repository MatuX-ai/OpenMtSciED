import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { requireUser } from '@/lib/user-auth';

export async function POST(request: Request) {
  const auth = requireUser(request);
  if (!auth.ok) return auth.response;

  try {
    const body = await request.json();
    const targetUserId = Number(body.target_user_id ?? body.targetUserId);
    const packageId = body.package_id != null ? Number(body.package_id) : undefined;
    const reason = (body.reason as string)?.trim();
    const evidence = (body.evidence as string)?.trim();

    if (!targetUserId || Number.isNaN(targetUserId)) {
      return NextResponse.json({ error: 'target_user_id 无效' }, { status: 400 });
    }
    if (!reason) {
      return NextResponse.json({ error: '请填写举报原因' }, { status: 400 });
    }
    if (targetUserId === auth.userId) {
      return NextResponse.json({ error: '不能举报自己' }, { status: 400 });
    }

    const report = await prisma.plagiarismReport.create({
      data: {
        reporterId: auth.userId,
        targetUserId,
        packageId,
        reason,
        evidence,
      },
    });

    return NextResponse.json(
      {
        id: report.id,
        status: report.status,
        created_at: report.createdAt.toISOString(),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Plagiarism report failed:', error);
    return NextResponse.json(
      { error: '提交举报失败', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    );
  }
}
