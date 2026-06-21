import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { requireUser } from '@/lib/user-auth';
import {
  CREDIT_RULES,
  getOrCreateCreatorProfile,
  LEVEL_THRESHOLDS,
  serializeCreatorProfile,
} from '@/lib/creator-credits';

export async function GET(request: Request) {
  const auth = requireUser(request);
  if (!auth.ok) return auth.response;

  try {
    const profile = await getOrCreateCreatorProfile(auth.userId);

    const [draftCount, linkCount, pendingPublish, recentLedger, profileExtra] = await Promise.all([
      prisma.topicDraft.count({ where: { userId: auth.userId } }),
      prisma.conceptTutorialLink.count({ where: { userId: auth.userId } }),
      prisma.publishRequest.count({
        where: { userId: auth.userId, status: { in: ['pending', 'manual_review'] } },
      }),
      prisma.creditLedger.findMany({
        where: { userId: auth.userId },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
      prisma.creatorProfile.findUnique({ where: { userId: auth.userId } }),
    ]);

    const nextLevel = LEVEL_THRESHOLDS.find((t) => t.minCc > profile.ccTotal);

    return NextResponse.json({
      user_id: auth.userId,
      username: auth.username,
      profile: serializeCreatorProfile(profile),
      stats: {
        topic_drafts: draftCount,
        graph_links: linkCount,
        pending_publish: pendingPublish,
      },
      publish_frozen_until: profileExtra?.publishFrozenUntil?.toISOString() ?? null,
      credit_rules: CREDIT_RULES,
      level_thresholds: LEVEL_THRESHOLDS,
      next_level: nextLevel
        ? { level: nextLevel.level, name: nextLevel.name, cc_needed: nextLevel.minCc - profile.ccTotal }
        : null,
      recent_ledger: recentLedger.map((e: { id: number; action: string; ccDelta: number; note: string | null; createdAt: Date }) => ({
        id: e.id,
        action: e.action,
        cc_delta: e.ccDelta,
        note: e.note,
        created_at: e.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error('Get creator profile failed:', error);
    return NextResponse.json(
      { error: '获取创作者信息失败', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    );
  }
}
