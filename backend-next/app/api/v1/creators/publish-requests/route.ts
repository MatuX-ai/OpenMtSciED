import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { requireUser } from '@/lib/user-auth';
import { serializePublishRequest } from '@/lib/publish-package';

export async function GET(request: Request) {
  const auth = requireUser(request);
  if (!auth.ok) return auth.response;

  try {
    const items = await prisma.publishRequest.findMany({
      where: { userId: auth.userId },
      include: { package: { select: { title: true, subject: true } } },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    return NextResponse.json({
      items: items.map((item) => serializePublishRequest(item)),
    });
  } catch (error) {
    console.error('List user publish requests failed:', error);
    return NextResponse.json({ error: '获取发布记录失败' }, { status: 500 });
  }
}
