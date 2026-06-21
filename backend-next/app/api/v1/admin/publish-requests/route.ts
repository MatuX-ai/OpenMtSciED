import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { requireAdmin } from '@/lib/admin-auth';
import { serializePublishRequest } from '@/lib/publish-package';

export async function GET(request: Request) {
  const auth = requireAdmin(request);
  if (!auth.ok) return auth.response;

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'manual_review';
    const limit = Math.min(Number(searchParams.get('limit') || 50), 200);

    const items = await prisma.publishRequest.findMany({
      where: status === 'all' ? {} : { status },
      include: {
        package: { select: { title: true, subject: true, scope: true } },
        user: { select: { username: true, name: true } },
      },
      orderBy: { createdAt: 'asc' },
      take: limit,
    });

    return NextResponse.json({
      items: items.map((item) => serializePublishRequest(item)),
      total: items.length,
    });
  } catch (error) {
    console.error('Admin list publish requests failed:', error);
    return NextResponse.json({ error: '获取审核队列失败' }, { status: 500 });
  }
}
