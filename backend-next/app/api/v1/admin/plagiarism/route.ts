import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { requireAdmin } from '@/lib/admin-auth';

export async function GET(request: Request) {
  const auth = requireAdmin(request);
  if (!auth.ok) return auth.response;

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'pending';

    const items = await prisma.plagiarismReport.findMany({
      where: status === 'all' ? {} : { status },
      include: {
        reporter: { select: { username: true } },
        targetUser: { select: { username: true, name: true } },
        package: { select: { title: true } },
      },
      orderBy: { createdAt: 'asc' },
      take: 100,
    });

    return NextResponse.json({
      items: items.map((item) => ({
        id: item.id,
        package_id: item.packageId,
        package_title: item.package?.title,
        reporter: item.reporter.username,
        target_user: item.targetUser.name || item.targetUser.username,
        target_user_id: item.targetUserId,
        reason: item.reason,
        evidence: item.evidence,
        status: item.status,
        admin_note: item.adminNote,
        created_at: item.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error('Admin list plagiarism failed:', error);
    return NextResponse.json({ error: '获取举报列表失败' }, { status: 500 });
  }
}
