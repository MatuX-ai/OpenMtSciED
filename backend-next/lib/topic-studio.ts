import type { TopicDraft } from '@prisma/client';

export type TopicDraftStatus =
  | 'draft'
  | 'outline_ready'
  | 'tutorial_confirmed'
  | 'resources_matched'
  | 'branded'
  | 'published';

export interface TopicOutlineSection {
  title: string;
  duration_minutes?: number;
  activities?: string[];
  assessment?: string;
}

export interface TopicOutline {
  learning_objectives: string[];
  sections: TopicOutlineSection[];
  suggested_keywords?: string[];
}

export interface MatchedResourceItem {
  id?: string | number;
  title: string;
  type: 'material' | 'hardware' | 'tutorial' | 'external';
  source?: string;
  url?: string;
  reason?: string;
}

export function serializeTopicDraft(draft: TopicDraft) {
  return {
    id: draft.id,
    user_id: draft.userId,
    title: draft.title,
    subject: draft.subject,
    grade_level: draft.gradeLevel,
    goals: draft.goals,
    duration_hours: draft.durationHours,
    max_budget: draft.maxBudget,
    needs_hardware: draft.needsHardware,
    outline: draft.outlineJson,
    matched_resources: draft.matchedResourcesJson,
    status: draft.status,
    current_step: draft.currentStep,
    local_tutorial_id: draft.localTutorialId,
    created_at: draft.createdAt.toISOString(),
    updated_at: draft.updatedAt.toISOString(),
  };
}

export function buildStubOutline(draft: Pick<TopicDraft, 'title' | 'subject' | 'goals'>): TopicOutline {
  const goalsText = draft.goals || '掌握本课题核心概念与基本实践';
  return {
    learning_objectives: [
      `理解「${draft.title}」的核心概念`,
      `能在${draft.subject || 'STEM'}情境中应用所学`,
      goalsText.length > 20 ? goalsText.slice(0, 80) : '完成一次可展示的课堂活动',
    ],
    sections: [
      {
        title: '导入与情境',
        duration_minutes: 10,
        activities: ['展示现象或问题情境', '引导学生提出假设'],
        assessment: '观察学生参与度',
      },
      {
        title: '探究与实践',
        duration_minutes: 25,
        activities: ['分组实验或项目实践', '记录数据与现象'],
        assessment: '检查实验记录完整性',
      },
      {
        title: '总结与迁移',
        duration_minutes: 15,
        activities: ['小组汇报', '联系生活应用'],
        assessment: '简答或口头反馈',
      },
    ],
    suggested_keywords: [draft.title, draft.subject || 'STEM', '课件', '实验'],
  };
}
