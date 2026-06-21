import prisma from '@/lib/db';

export type CreditAction =
  | 'save_tutorial'
  | 'upload_material'
  | 'link_graph'
  | 'link_resource'
  | 'apply_brand'
  | 'export_package'
  | 'publish_approved'
  | 'featured'
  | 'plagiarism_penalty';

export const CREDIT_RULES: Record<CreditAction, number> = {
  save_tutorial: 10,
  upload_material: 30,
  link_graph: 15,
  link_resource: 5,
  apply_brand: 5,
  export_package: 10,
  publish_approved: 100,
  featured: 200,
  plagiarism_penalty: -500,
};

export const LEVEL_THRESHOLDS = [
  { level: 1, name: '见习创课者', minCc: 0 },
  { level: 2, name: '活跃教师', minCc: 200 },
  { level: 3, name: '认证创作者', minCc: 800 },
  { level: 4, name: '金牌导师', minCc: 2000 },
];

export function computeLevel(ccTotal: number): number {
  if (ccTotal >= 2000) return 4;
  if (ccTotal >= 800) return 3;
  if (ccTotal >= 200) return 2;
  return 1;
}

export function getLevelName(level: number): string {
  return LEVEL_THRESHOLDS.find((t) => t.level === level)?.name ?? '见习创课者';
}

export async function getOrCreateCreatorProfile(userId: number) {
  const existing = await prisma.creatorProfile.findUnique({ where: { userId } });
  if (existing) return existing;

  return prisma.creatorProfile.create({
    data: { userId, ccTotal: 0, level: 1, badges: [] },
  });
}

export async function awardCredits(
  userId: number,
  action: CreditAction,
  options?: { refType?: string; refId?: string; note?: string }
): Promise<{ awarded: boolean; ccDelta: number; ccTotal: number; level: number }> {
  const ccDelta = CREDIT_RULES[action] ?? 0;
  if (ccDelta === 0) {
    const profile = await getOrCreateCreatorProfile(userId);
    return { awarded: false, ccDelta: 0, ccTotal: profile.ccTotal, level: profile.level };
  }

  const refType = options?.refType ?? '';
  const refId = options?.refId ?? '';

  const duplicate = await prisma.creditLedger.findFirst({
    where: { userId, action, refType, refId },
  });

  if (duplicate) {
    const profile = await getOrCreateCreatorProfile(userId);
    return { awarded: false, ccDelta: 0, ccTotal: profile.ccTotal, level: profile.level };
  }

  const profile = await getOrCreateCreatorProfile(userId);
  const ccTotal = profile.ccTotal + ccDelta;
  const level = computeLevel(ccTotal);

  await prisma.$transaction([
    prisma.creditLedger.create({
      data: {
        userId,
        action,
        ccDelta,
        refType,
        refId,
        note: options?.note,
      },
    }),
    prisma.creatorProfile.update({
      where: { userId },
      data: { ccTotal, level },
    }),
  ]);

  return { awarded: true, ccDelta, ccTotal, level };
}

export async function deductCredits(
  userId: number,
  action: CreditAction,
  options?: { refType?: string; refId?: string; note?: string }
): Promise<{ deducted: boolean; ccDelta: number; ccTotal: number; level: number }> {
  const ccDelta = CREDIT_RULES[action] ?? 0;
  if (ccDelta >= 0) {
    const profile = await getOrCreateCreatorProfile(userId);
    return { deducted: false, ccDelta: 0, ccTotal: profile.ccTotal, level: profile.level };
  }

  const refType = options?.refType ?? '';
  const refId = options?.refId ?? '';

  const duplicate = await prisma.creditLedger.findFirst({
    where: { userId, action, refType, refId },
  });
  if (duplicate) {
    const profile = await getOrCreateCreatorProfile(userId);
    return { deducted: false, ccDelta: 0, ccTotal: profile.ccTotal, level: profile.level };
  }

  const profile = await getOrCreateCreatorProfile(userId);
  const ccTotal = Math.max(0, profile.ccTotal + ccDelta);
  const level = computeLevel(ccTotal);

  await prisma.$transaction([
    prisma.creditLedger.create({
      data: {
        userId,
        action,
        ccDelta,
        refType,
        refId,
        note: options?.note,
      },
    }),
    prisma.creatorProfile.update({
      where: { userId },
      data: { ccTotal, level },
    }),
  ]);

  return { deducted: true, ccDelta, ccTotal, level };
}

export function serializeCreatorProfile(profile: {
  ccTotal: number;
  level: number;
  badges: unknown;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    cc_total: profile.ccTotal,
    level: profile.level,
    level_name: getLevelName(profile.level),
    badges: profile.badges,
    created_at: profile.createdAt.toISOString(),
    updated_at: profile.updatedAt.toISOString(),
  };
}

export function serializeLedgerEntry(entry: {
  id: number;
  action: string;
  ccDelta: number;
  refType: string | null;
  refId: string | null;
  note: string | null;
  createdAt: Date;
}) {
  return {
    id: entry.id,
    action: entry.action,
    cc_delta: entry.ccDelta,
    ref_type: entry.refType,
    ref_id: entry.refId,
    note: entry.note,
    created_at: entry.createdAt.toISOString(),
  };
}
