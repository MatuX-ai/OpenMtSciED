import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getLevelName } from '@/lib/creator-credits';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(Number(searchParams.get('limit') || 10), 50);
    const period = searchParams.get('period') || 'month';

    const since =
      period === 'month'
        ? new Date(new Date().getFullYear(), new Date().getMonth(), 1)
        : new Date(0);

    const profiles = await prisma.creatorProfile.findMany({
      include: { user: { select: { username: true, name: true } } },
      orderBy: { ccTotal: 'desc' },
      take: limit,
    });

    const monthly = await prisma.creditLedger.groupBy({
      by: ['userId'],
      where: {
        ccDelta: { gt: 0 },
        createdAt: { gte: since },
      },
      _sum: { ccDelta: true },
      orderBy: { _sum: { ccDelta: 'desc' } },
      take: limit,
    });

    const monthlyUserIds = monthly.map((m) => m.userId);
    const monthlyUsers = await prisma.user.findMany({
      where: { id: { in: monthlyUserIds } },
      select: { id: true, username: true, name: true },
    });
    const userMap = new Map(monthlyUsers.map((u) => [u.id, u]));

    return NextResponse.json({
      all_time: profiles.map((p, index) => ({
        rank: index + 1,
        user_id: p.userId,
        username: p.user.username,
        display_name: p.user.name || p.user.username,
        cc_total: p.ccTotal,
        level: p.level,
        level_name: getLevelName(p.level),
      })),
      monthly: monthly.map((m, index) => {
        const user = userMap.get(m.userId);
        return {
          rank: index + 1,
          user_id: m.userId,
          username: user?.username,
          display_name: user?.name || user?.username,
          cc_earned: m._sum.ccDelta ?? 0,
        };
      }),
    });
  } catch (error) {
    console.error('Leaderboard failed:', error);
    return NextResponse.json(
      { error: '获取创课榜失败', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    );
  }
}
