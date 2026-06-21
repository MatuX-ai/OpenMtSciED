export type PublishScope = 'private' | 'school' | 'public';

export type CopyrightType = 'original' | 'licensed' | 'open_source';

export interface AutoReviewInput {
  title: string;
  subject?: string | null;
  gradeLevel?: string | null;
  localTutorialId?: number | null;
  outline?: {
    learning_objectives?: string[];
    sections?: unknown[];
  } | null;
  matchedResources?: Array<{
    type: string;
    title: string;
    url?: string;
    source?: string;
  }>;
  copyrightConfirmed: boolean;
  copyrightType?: string | null;
  scope: PublishScope;
  userCreatedAt: Date;
  externalResourcesWithAttribution: number;
  externalResourcesTotal: number;
  duplicateTitleCount: number;
}

export interface AutoReviewResult {
  score: number;
  passed: boolean;
  requiresManual: boolean;
  issues: string[];
  recommendations: string[];
}

export function runAutoReview(input: AutoReviewInput): AutoReviewResult {
  const issues: string[] = [];
  const recommendations: string[] = [];
  let score = 100;

  if (!input.title || input.title.trim().length < 2) {
    issues.push('标题过短');
    score -= 25;
  }

  if (!input.subject) {
    issues.push('缺少学科');
    score -= 10;
  }

  if (!input.localTutorialId) {
    issues.push('未关联本地教程');
    score -= 20;
  }

  const objectives = input.outline?.learning_objectives || [];
  if (objectives.length === 0) {
    issues.push('缺少学习目标');
    score -= 15;
  }

  if (!input.copyrightConfirmed) {
    issues.push('未完成版权确认');
    score -= 30;
  }

  if (input.externalResourcesTotal > 0) {
    const missing = input.externalResourcesTotal - input.externalResourcesWithAttribution;
    if (missing > 0) {
      issues.push(`${missing} 个外链资源缺少 attribution`);
      score -= missing * 10;
    }
  }

  if (input.duplicateTitleCount > 0) {
    issues.push('存在同标题已发布包');
    score -= 15;
  }

  const accountAgeDays =
    (Date.now() - input.userCreatedAt.getTime()) / (1000 * 60 * 60 * 24);
  if (input.scope === 'public' && accountAgeDays < 7) {
    issues.push('新账号 7 天内不可公开发布');
    score -= 40;
  }

  if ((input.matchedResources?.length || 0) < 1) {
    recommendations.push('建议至少关联 1 个课件或资源');
    score -= 5;
  }

  score = Math.max(0, Math.min(100, score));

  const passThreshold = input.scope === 'private' ? 50 : input.scope === 'school' ? 70 : 85;
  const passed = score >= passThreshold && !issues.includes('新账号 7 天内不可公开发布');

  let requiresManual = false;
  if (input.scope === 'public') {
    requiresManual = !passed || score < 95;
  } else if (input.scope === 'school') {
    requiresManual = !passed;
  } else {
    requiresManual = false;
  }

  return { score, passed, requiresManual, issues, recommendations };
}

export function resolvePublishStatus(
  scope: PublishScope,
  review: AutoReviewResult
): 'approved' | 'pending_review' | 'rejected' {
  if (scope === 'private') {
    return review.passed ? 'approved' : 'rejected';
  }
  if (review.passed && !review.requiresManual) {
    return 'approved';
  }
  if (review.score < 50) {
    return 'rejected';
  }
  return 'pending_review';
}
