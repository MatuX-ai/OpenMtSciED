import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { serializePackage } from '@/lib/publish-package';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = (searchParams.get('q') || '').trim();
    const subject = (searchParams.get('subject') || '').trim();
    const limit = Math.min(Number(searchParams.get('limit') || 20), 100);
    const offset = Number(searchParams.get('offset') || 0);
    const featured = searchParams.get('featured') === 'true';

    const where = {
      scope: 'public',
      status: 'published',
      ...(featured ? { isFeatured: true } : {}),
      ...(subject ? { subject: { contains: subject, mode: 'insensitive' as const } } : {}),
      ...(q
        ? {
            OR: [
              { title: { contains: q, mode: 'insensitive' as const } },
              { subject: { contains: q, mode: 'insensitive' as const } },
            ],
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      prisma.tutorialPackage.findMany({
        where,
        include: { user: { select: { username: true, name: true } } },
        orderBy: [{ isFeatured: 'desc' }, { publishedAt: 'desc' }],
        skip: offset,
        take: limit,
      }),
      prisma.tutorialPackage.count({ where }),
    ]);

    return NextResponse.json({
      items: items.map((pkg) => ({
        ...serializePackage(pkg),
        user_id: pkg.userId,
        author: pkg.user.name || pkg.user.username,
      })),
      total,
      limit,
      offset,
    });
  } catch (error) {
    console.error('Public library failed:', error);
    return NextResponse.json(
      { error: '获取公开库失败', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    );
  }
}
