import { Prisma } from '@prisma/client';
import prisma from '@/lib/db';
import { awardCredits, deductCredits } from '@/lib/creator-credits';
import {
  AutoReviewInput,
  CopyrightType,
  PublishScope,
  resolvePublishStatus,
  runAutoReview,
} from '@/lib/publish-review';

const PAYOUT_DELAY_DAYS = 7;

export interface SubmitPublishInput {
  userId: number;
  topicDraftId?: number;
  localTutorialId?: number;
  title: string;
  subject?: string;
  gradeLevel?: string;
  packageJson: Record<string, unknown>;
  scope: PublishScope;
  copyrightConfirmed: boolean;
  copyrightType?: CopyrightType;
}

export function serializePackage(pkg: {
  id: number;
  userId: number;
  topicDraftId: number | null;
  localTutorialId: number | null;
  title: string;
  subject: string | null;
  gradeLevel: string | null;
  packageJson: unknown;
  scope: string;
  status: string;
  isFeatured: boolean;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  user?: { username: string; name: string | null };
}) {
  return {
    id: pkg.id,
    user_id: pkg.userId,
    topic_draft_id: pkg.topicDraftId,
    local_tutorial_id: pkg.localTutorialId,
    title: pkg.title,
    subject: pkg.subject,
    grade_level: pkg.gradeLevel,
    package_json: pkg.packageJson,
    scope: pkg.scope,
    status: pkg.status,
    is_featured: pkg.isFeatured,
    published_at: pkg.publishedAt?.toISOString() ?? null,
    author: pkg.user?.name || pkg.user?.username,
    created_at: pkg.createdAt.toISOString(),
    updated_at: pkg.updatedAt.toISOString(),
  };
}

export function serializePublishRequest(req: {
  id: number;
  packageId: number;
  userId: number;
  scope: string;
  status: string;
  copyrightConfirmed: boolean;
  copyrightType: string | null;
  autoReviewScore: number | null;
  autoReviewNotes: unknown;
  reviewerId: number | null;
  reviewNote: string | null;
  reviewedAt: Date | null;
  scheduledPayoutAt: Date | null;
  payoutStatus: string;
  payoutPaidAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  package?: { title: string; subject: string | null };
  user?: { username: string; name: string | null };
}) {
  return {
    id: req.id,
    package_id: req.packageId,
    user_id: req.userId,
    scope: req.scope,
    status: req.status,
    copyright_confirmed: req.copyrightConfirmed,
    copyright_type: req.copyrightType,
    auto_review_score: req.autoReviewScore,
    auto_review_notes: req.autoReviewNotes,
    reviewer_id: req.reviewerId,
    review_note: req.reviewNote,
    reviewed_at: req.reviewedAt?.toISOString() ?? null,
    scheduled_payout_at: req.scheduledPayoutAt?.toISOString() ?? null,
    payout_status: req.payoutStatus,
    payout_paid_at: req.payoutPaidAt?.toISOString() ?? null,
    package_title: req.package?.title,
    package_subject: req.package?.subject,
    author: req.user?.name || req.user?.username,
    created_at: req.createdAt.toISOString(),
    updated_at: req.updatedAt.toISOString(),
  };
}

async function countExternalAttributions(
  userId: number,
  resources: AutoReviewInput['matchedResources']
) {
  const external = (resources || []).filter(
    (r) => r.type === 'external' || (r.url && r.type !== 'material')
  );
  if (external.length === 0) {
    return { total: 0, withAttribution: 0 };
  }

  let withAttribution = 0;
  for (const resource of external) {
    const resourceId = String(resource.title);
    const count = await prisma.resourceAttribution.count({
      where: { userId, resourceId },
    });
    if (count > 0) withAttribution += 1;
  }

  return { total: external.length, withAttribution };
}

export async function submitPublishRequest(input: SubmitPublishInput) {
  const user = await prisma.user.findUnique({ where: { id: input.userId } });
  if (!user) throw new Error('用户不存在');

  const profile = await prisma.creatorProfile.findUnique({ where: { userId: input.userId } });
  if (profile?.publishFrozenUntil && profile.publishFrozenUntil > new Date()) {
    throw new Error('发布功能已冻结，请稍后再试');
  }

  const matchedResources =
    (input.packageJson['matched_resources'] as AutoReviewInput['matchedResources']) || [];
  const outline = input.packageJson['topic'] as AutoReviewInput['outline'];
  const topic = (input.packageJson['topic'] as Record<string, unknown>) || {};

  const duplicateTitleCount = await prisma.tutorialPackage.count({
    where: {
      userId: input.userId,
      title: input.title,
      status: { in: ['published', 'approved'] },
    },
  });

  const attribution = await countExternalAttributions(input.userId, matchedResources);

  const reviewInput: AutoReviewInput = {
    title: input.title,
    subject: input.subject,
    gradeLevel: input.gradeLevel,
    localTutorialId: input.localTutorialId,
    outline: (topic['outline'] as AutoReviewInput['outline']) || outline,
    matchedResources,
    copyrightConfirmed: input.copyrightConfirmed,
    copyrightType: input.copyrightType,
    scope: input.scope,
    userCreatedAt: user.createdAt,
    externalResourcesWithAttribution: attribution.withAttribution,
    externalResourcesTotal: attribution.total,
    duplicateTitleCount,
  };

  const autoReview = runAutoReview(reviewInput);
  const resolvedStatus = resolvePublishStatus(input.scope, autoReview);

  const packageStatus =
    resolvedStatus === 'approved'
      ? 'published'
      : resolvedStatus === 'rejected'
        ? 'rejected'
        : 'pending_review';

  const requestStatus =
    resolvedStatus === 'approved'
      ? input.scope === 'private'
        ? 'approved'
        : 'auto_passed'
      : resolvedStatus === 'rejected'
        ? 'rejected'
        : 'manual_review';

  const now = new Date();
  const scheduledPayoutAt =
    resolvedStatus === 'approved' && input.scope !== 'private'
      ? new Date(now.getTime() + PAYOUT_DELAY_DAYS * 24 * 60 * 60 * 1000)
      : null;

  const result = await prisma.$transaction(async (tx) => {
    const pkg = await tx.tutorialPackage.create({
      data: {
        userId: input.userId,
        topicDraftId: input.topicDraftId,
        localTutorialId: input.localTutorialId,
        title: input.title,
        subject: input.subject,
        gradeLevel: input.gradeLevel,
        packageJson: input.packageJson as Prisma.InputJsonValue,
        scope: input.scope,
        status: packageStatus,
        publishedAt: packageStatus === 'published' ? now : null,
      },
    });

    const request = await tx.publishRequest.create({
      data: {
        packageId: pkg.id,
        userId: input.userId,
        scope: input.scope,
        status: requestStatus,
        copyrightConfirmed: input.copyrightConfirmed,
        copyrightType: input.copyrightType,
        autoReviewScore: autoReview.score,
        autoReviewNotes: {
          issues: autoReview.issues,
          recommendations: autoReview.recommendations,
        } as Prisma.InputJsonValue,
        reviewedAt: requestStatus === 'auto_passed' || requestStatus === 'approved' ? now : null,
        scheduledPayoutAt,
        payoutStatus:
          resolvedStatus === 'approved' && input.scope !== 'private' ? 'scheduled' : 'none',
      },
    });

    if (input.topicDraftId) {
      await tx.topicDraft.update({
        where: { id: input.topicDraftId },
        data: { status: packageStatus === 'published' ? 'published' : 'branded' },
      });
    }

    return { pkg, request };
  });

  if (packageStatus === 'published' && input.scope === 'private') {
    await awardCredits(input.userId, 'save_tutorial', {
      refType: 'package',
      refId: String(result.pkg.id),
      note: `私有发布「${input.title}」`,
    });
  }

  return {
    package: serializePackage(result.pkg),
    request: serializePublishRequest(result.request),
    auto_review: autoReview,
  };
}

export async function approvePublishRequest(
  requestId: number,
  reviewerId: number,
  note?: string,
  featured = false
) {
  const request = await prisma.publishRequest.findUnique({
    where: { id: requestId },
    include: { package: true },
  });
  if (!request) throw new Error('审核请求不存在');

  const now = new Date();
  const scheduledPayoutAt = new Date(now.getTime() + PAYOUT_DELAY_DAYS * 24 * 60 * 60 * 1000);

  await prisma.$transaction([
    prisma.publishRequest.update({
      where: { id: requestId },
      data: {
        status: 'approved',
        reviewerId,
        reviewNote: note,
        reviewedAt: now,
        scheduledPayoutAt,
        payoutStatus: 'scheduled',
      },
    }),
    prisma.tutorialPackage.update({
      where: { id: request.packageId },
      data: {
        status: 'published',
        publishedAt: now,
        isFeatured: featured,
        scope: request.scope,
      },
    }),
  ]);

  if (featured) {
    await awardCredits(request.userId, 'featured', {
      refType: 'package',
      refId: String(request.packageId),
      note: `精选「${request.package.title}」`,
    });
  }

  return prisma.publishRequest.findUnique({
    where: { id: requestId },
    include: { package: true, user: true },
  });
}

export async function rejectPublishRequest(requestId: number, reviewerId: number, note?: string) {
  const request = await prisma.publishRequest.findUnique({ where: { id: requestId } });
  if (!request) throw new Error('审核请求不存在');

  await prisma.$transaction([
    prisma.publishRequest.update({
      where: { id: requestId },
      data: {
        status: 'rejected',
        reviewerId,
        reviewNote: note,
        reviewedAt: new Date(),
        payoutStatus: 'none',
      },
    }),
    prisma.tutorialPackage.update({
      where: { id: request.packageId },
      data: { status: 'rejected' },
    }),
  ]);
}

export async function processScheduledPayouts() {
  const due = await prisma.publishRequest.findMany({
    where: {
      payoutStatus: 'scheduled',
      scheduledPayoutAt: { lte: new Date() },
      status: { in: ['approved', 'auto_passed'] },
    },
    include: { package: true },
  });

  const results = [];
  for (const request of due) {
    const awarded = await awardCredits(request.userId, 'publish_approved', {
      refType: 'publish_request',
      refId: String(request.id),
      note: `发布通过「${request.package.title}」`,
    });

    await prisma.publishRequest.update({
      where: { id: request.id },
      data: { payoutStatus: 'paid', payoutPaidAt: new Date() },
    });

    results.push({ request_id: request.id, awarded });
  }

  return results;
}

export async function resolvePlagiarismReport(
  reportId: number,
  adminId: number,
  confirmed: boolean,
  adminNote?: string
) {
  const report = await prisma.plagiarismReport.findUnique({
    where: { id: reportId },
    include: { package: true },
  });
  if (!report) throw new Error('举报不存在');

  const now = new Date();
  if (confirmed) {
    const freezeUntil = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
    await prisma.$transaction([
      prisma.plagiarismReport.update({
        where: { id: reportId },
        data: { status: 'confirmed', adminId, adminNote, resolvedAt: now },
      }),
      prisma.creatorProfile.upsert({
        where: { userId: report.targetUserId },
        create: {
          userId: report.targetUserId,
          publishFrozenUntil: freezeUntil,
        },
        update: { publishFrozenUntil: freezeUntil },
      }),
    ]);

    await deductCredits(report.targetUserId, 'plagiarism_penalty', {
      refType: 'plagiarism_report',
      refId: String(reportId),
      note: '抄袭核实扣罚',
    });

    if (report.packageId) {
      await prisma.tutorialPackage.update({
        where: { id: report.packageId },
        data: { status: 'rejected' },
      });
    }
  } else {
    await prisma.plagiarismReport.update({
      where: { id: reportId },
      data: { status: 'dismissed', adminId, adminNote, resolvedAt: now },
    });
  }
}
