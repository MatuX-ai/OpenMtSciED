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

export interface TopicDraftInput {
  title: string;
  subject?: string;
  grade_level?: string;
  goals?: string;
  duration_hours?: number;
  max_budget?: number;
  needs_hardware?: boolean;
}

export interface TopicDraft {
  /** 本地 ID，格式 local-xxx 或 remote-{id} */
  id: string;
  remoteId?: number;
  title: string;
  subject?: string;
  grade_level?: string;
  goals?: string;
  duration_hours?: number;
  max_budget?: number;
  needs_hardware?: boolean;
  outline?: TopicOutline;
  matched_resources?: MatchedResourceItem[];
  status: TopicDraftStatus;
  current_step: number;
  local_tutorial_id?: number;
  created_at: string;
  updated_at: string;
}

export const GRADE_LEVEL_OPTIONS = [
  { value: 'elementary', label: '小学' },
  { value: 'middle', label: '初中' },
  { value: 'high', label: '高中' },
  { value: 'university', label: '大学' },
];

export const SUBJECT_OPTIONS = [
  '编程开发',
  '机器人',
  '电子制作',
  '人工智能',
  '物联网',
  '物理',
  '化学',
  '生物',
  '科学探索',
  '创客项目',
];

export const TOPIC_STUDIO_STEPS = [
  '提出课题',
  'AI 教程大纲',
  '确认教程',
  '匹配资源',
  '品牌化',
  '保存发布',
];
