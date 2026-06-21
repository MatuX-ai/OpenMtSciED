import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { requireUser } from '@/lib/user-auth';
import { serializeLedgerEntry } from '@/lib/creator-credits';

export async function GET(request: Request) {
  const auth = requireUser(request);
  if (!auth.ok) return auth.response;

  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(Number(searchParams.get('limit') || 50), 200);
    const offset = Number(searchParams.get('offset') || 0);

    const [items, total] = await Promise.all([
      prisma.creditLedger.findMany({
        where: { userId: auth.userId },
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
      }),
      prisma.creditLedger.count({ where: { userId: auth.userId } }),
    ]);

    return NextResponse.json({
      items: items.map(serializeLedgerEntry),
      total,
      limit,
      offset,
    });
  } catch (error) {
    console.error('Get credit ledger failed:', error);
    return NextResponse.json(
      { error: '获取积分流水失败', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    );
  }
}
