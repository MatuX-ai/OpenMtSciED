/**
 * 统一教程库数据模型
 * 为多角色（教师、学生、机构管理员、学校管理员、教育局）提供统一的教程数据结构
 * 支持多场景：校本教程、培训机构教程、在线平台教程、AI生成教程、兴趣班
 */

// ==================== 统一课程类型定义 ====================

/** 课程场景类型 - 区分不同使用场景 */
export type CourseScenarioType =
  | 'school_curriculum' // 校本教程
  | 'school_interest' // 兴趣班
  | 'institution' // 培训机构教程
  | 'online_platform' // 在线平台教程
  | 'ai_generated' // AI生成教程
  | 'competition'; // 竞赛培训教程

/** 学习路径阶段 */
export type LearningPathStage =
  | 'elementary_intro' // 小学兴趣启蒙
  | 'middle_practice' // 初中跨学科实践
  | 'high_inquiry' // 高中深度探究
  | 'university_bridge'; // 大学专业衔接

/** 硬件预算等级 */
export type HardwareBudgetLevel = 'entry' | 'intermediate' | 'advanced';

/** 硬件依赖项 */
export interface HardwareDependency {
  name: string; // 硬件名称 (e.g., Arduino, ESP32)
  quantity: number; // 数量
  estimated_cost: number; // 预估成本
  link?: string; // 购买链接
}

/** 课程状态 */
export type CourseStatus =
  | 'draft' // 草稿
  | 'pending' // 待审核
  | 'published' // 已发布
  | 'ongoing' // 进行中
  | 'completed' // 已结束
  | 'archived'; // 已归档

/** 课程级别 */
export type CourseLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';

/** 课程分类 */
export type CourseCategory =
  | 'science'
  | 'technology'
  | 'engineering'
  | 'mathematics'
  | 'language'
  | 'arts'
  | 'sports'
  | 'social_studies'
  | 'music'
  | 'programming'
  | 'ai_robotics'
  | 'other';

/** 课程授课方式 */
export type DeliveryMethod = 'online' | 'offline' | 'hybrid' | 'self_paced';

// ==================== 统一课程核心模型 ====================

/**
 * 统一课程基本信息
 * 融合了传统课程和AI生成课程的特性
 */
export interface UnifiedCourse {
  // 基础标识
  id: number;
  course_code: string; // 课程唯一编号
  org_id: number; // 所属组织ID
  scenario_type: CourseScenarioType; // 课程场景类型

  // 元数据
  title: string; // 课程标题
  subtitle?: string; // 副标题
  description?: string; // 课程描述
  cover_image_url?: string; // 封面图片URL
  promo_video_url?: string; // 宣传视频URL

  // 分类信息
  category: CourseCategory; // 课程分类
  tags: string[]; // 课程标签
  level: CourseLevel; // 课程难度级别
  subject?: string; // 学科/主题

  // 课程详情
  learning_objectives: string[]; // 学习目标
  prerequisites?: string[]; // 先修要求
  target_audience?: string; // 目标学员

  // 时间和容量
  total_lessons: number; // 总课时数
  estimated_duration_hours: number; // 预计学时
  delivery_method: DeliveryMethod; // 授课方式
  max_students?: number; // 最大学员数
  current_enrollments: number; // 当前报名数

  // 价格信息
  is_free: boolean; // 是否免费
  price?: number; // 价格（元）
  currency?: string; // 货币类型

  // 进度安排
  enrollment_start_date?: string; // 报名开始时间
  enrollment_end_date?: string; // 报名结束时间
  course_start_date?: string; // 课程开始时间
  course_end_date?: string; // 课程结束时间
  schedule_pattern?: string; // 排课模式

  // STEM 路径引擎扩展字段
  path_stage?: LearningPathStage; // 所属学习路径阶段
  phenomenon_theme?: string; // 现象驱动主题 (e.g., "生态系统能量流动")
  hardware_dependencies?: HardwareDependency[]; // 硬件依赖清单
  budget_level?: HardwareBudgetLevel; // 预算等级
  related_material_ids?: number[]; // 关联课件库 ID
  prerequisite_course_ids?: number[]; // 先修教程 ID
  knowledge_graph_node_id?: string; // 知识图谱节点 ID

  // 教师信息
  primary_teacher_id: number; // 主讲教师ID
  assistant_teacher_ids?: number[]; // 助教ID列表

  // 课程资源
  materials?: CourseMaterial[]; // 课程资料
  external_resources?: ExternalResource[]; // 外部资源链接

  // 评价和统计
  average_rating?: number; // 平均评分（0-5）
  total_reviews?: number; // 总评价数
  completion_rate?: number; // 完成率（0-100）
  enrollment_rate?: number; // 报名转化率

  // 状态和权限
  status: CourseStatus; // 课程状态
  visibility: 'public' | 'private' | 'restricted'; // 可见性
  is_featured?: boolean; // 是否推荐

  // AI课程特有字段（AI生成课程使用）
  ai_generated?: boolean; // 是否AI生成
  ai_model_version?: string; // AI模型版本
  ai_confidence_score?: number; // AI置信度分数
  dynamic_content?: boolean; // 是否支持动态内容

  // 元数据
  created_by: number; // 创建人ID
  updated_by: number; // 更新人ID
  created_at: string; // 创建时间
  updated_at: string; // 更新时间
  published_at?: string; // 发布时间
}

// ==================== 课程资源模型 ====================

/** 课程资料 */
export interface CourseMaterial {
  id: number;
  course_id: number;
  type: 'document' | 'video' | 'audio' | 'image' | 'dataset' | 'code' | 'other';
  title: string;
  description?: string;
  file_url: string;
  file_size_bytes?: number;
  // 运行时属性（前端格式化后的显示值）
  file_size?: string;
  file_format?: string;
  is_downloadable: boolean;
  sort_order: number;
  created_at: string;
}

/** 外部资源链接 */
export interface ExternalResource {
  id: number;
  course_id: number;
  title: string;
  url: string;
  description?: string;
  resource_type: 'reference' | 'practice' | 'tool' | 'reading';
  sort_order: number;
  created_at: string;
}

// ==================== 课程章节模型 ====================

/**
 * 课程章节
 */
export interface CourseChapter {
  id: number;
  course_id: number;
  chapter_number: number;
  title: string;
  description?: string;
  estimated_minutes: number;
  lesson_count: number;
  lessons?: CourseLesson[]; // 课时列表（可选）
  is_locked?: boolean; // 是否锁定（需完成前置章节）
  unlock_condition?: string; // 解锁条件
  sort_order: number;
  created_at: string;
  updated_at: string;
}

// ==================== 课程课时模型 ====================

/**
 * 课程课时
 */
export interface CourseLesson {
  id: number;
  course_id: number;
  chapter_id?: number;
  lesson_number: number;
  title: string;
  subtitle?: string;
  description?: string;
  content_type: LessonContentType; // 课时内容类型
  content_url?: string; // 内容URL（视频、文档等）
  content_text?: string; // 文本内容
  estimated_duration_minutes: number;
  // 运行时属性（不存储在数据库中）
  duration_minutes?: number; // 实际时长（前端计算）
  completed?: boolean; // 是否完成（前端计算）

  // 学习目标和知识点
  learning_objectives: string[];
  knowledge_points: string[];

  // 课时资源
  resources: LessonResource[];
  attachments: LessonAttachment[];

  // 测验和作业
  has_quiz: boolean;
  quiz_passing_score?: number; // 测验及格分数
  has_assignment: boolean;
  assignment_due_hours?: number; // 作业截止时间（小时）

  // 权限和状态
  is_preview?: boolean; // 是否为预览课
  is_free?: boolean; // 是否免费
  is_required: boolean; // 是否必修
  sort_order: number;

  // AI课程特有
  ai_generated?: boolean;
  dynamic_content?: boolean;

  created_at: string;
  updated_at: string;
}

/** 课时内容类型 */
export type LessonContentType =
  | 'video' // 视频课
  | 'audio' // 音频课
  | 'text' // 文字课
  | 'live_stream' // 直播课
  | 'interactive' // 互动课（AR/VR等）
  | 'quiz' // 测验
  | 'assignment' // 作业
  | 'discussion' // 讨论
  | 'lab' // 实验
  | 'practice'; // 练习

/** 课时资源 */
export interface LessonResource {
  id: number;
  lesson_id: number;
  type: 'video' | 'code' | 'dataset' | 'html' | 'scratch' | 'document' | 'other';
  title?: string;
  description?: string;
  url?: string;
  content?: string;
  language?: string;
  is_required: boolean;
  created_at: string;
}

/** 课时附件 */
export interface LessonAttachment {
  id: number;
  lesson_id: number;
  title: string;
  file_url: string;
  file_size_bytes?: number;
  file_format?: string;
  sort_order: number;
  created_at: string;
}

// ==================== 课程评价模型 ====================

/**
 * 课程评价
 */
export interface CourseReview {
  id: number;
  course_id: number;
  user_id: number;
  user_name?: string; // 用户名（冗余字段用于显示）
  user_avatar?: string; // 用户头像（冗余字段用于显示）
  rating: number; // 评分（1-5星）
  title?: string;
  content?: string; // 评价内容
  pros?: string[]; // 优点
  cons?: string[]; // 缺点
  is_verified: boolean; // 是否已验证（已完成课程）
  helpful_count: number; // 有用数
  helpful_users: number[]; // 点赞用户ID列表
  reply?: ReviewReply; // 讲师回复
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
}

/** 讲师回复 */
export interface ReviewReply {
  content: string;
  replied_at: string;
}

// ==================== 课程报名模型 ====================

/**
 * 课程报名
 */
export interface CourseEnrollment {
  id: number;
  course_id: number;
  user_id: number;
  org_id: number;
  enrollment_code?: string; // 报名码

  // 报名时间
  enrolled_at: string;
  start_date?: string; // 开始学习日期
  completion_date?: string; // 完成日期

  // 进度
  progress_percentage: number; // 完成进度（0-100）
  completed_lessons: number; // 已完成课时数
  total_lessons: number; // 总课时数

  // 成绩
  average_score?: number; // 平均成绩
  final_grade?: string; // 最终等级

  // 证书
  certificate_url?: string; // 结业证书URL
  certificate_issued_at?: string;

  // 支付信息
  payment_status?: 'pending' | 'paid' | 'failed' | 'refunded';
  payment_amount?: number;
  paid_at?: string;

  // 状态
  status: EnrollmentStatus;
  is_active: boolean;

  // 元数据
  last_accessed_at?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

/** 报名状态 */
export type EnrollmentStatus =
  | 'pending' // 待确认
  | 'confirmed' // 已确认
  | 'in_progress' // 学习中
  | 'completed' // 已完成
  | 'dropped' // 已退课
  | 'suspended' // 已暂停
  | 'expired'; // 已过期

// ==================== 课程进度模型 ====================

/**
 * 学习进度记录
 */
export interface CourseProgress {
  id: number;
  enrollment_id: number;
  course_id: number;
  user_id: number;
  lesson_id: number;

  // 进度
  progress_percentage: number; // 课时进度（0-100）
  time_spent_minutes: number; // 学习时长（分钟）
  time_spent_seconds: number; // 学习时长（秒）

  // 最后活动
  last_activity_type: ProgressActivityType;
  last_activity_at: string;

  // 成绩
  quiz_score?: number;
  quiz_attempts: number;
  assignment_score?: number;

  // 状态
  status: LessonProgressStatus;

  // 笔记和反馈
  notes?: string;
  self_rating?: 'poor' | 'fair' | 'good' | 'excellent';

  // AI课程特有
  ai_adaptations?: AIAdaptation[];

  // 已完成课时ID列表
  completed_lesson_ids?: number[];

  // 运行时属性（课程级别聚合数据）
  completed_lessons?: number; // 已完成课时数
  total_lessons?: number; // 总课时数
  last_activity_date?: string; // 上次学习日期

  created_at: string;
  updated_at: string;
}

/** 进度活动类型 */
export type ProgressActivityType =
  | 'lesson_started'
  | 'lesson_completed'
  | 'quiz_taken'
  | 'assignment_submitted'
  | 'material_viewed'
  | 'note_taken';

/** 课时进度状态 */
export type LessonProgressStatus = 'not_started' | 'in_progress' | 'completed' | 'skipped';

/** AI自适应调整 */
export interface AIAdaptation {
  timestamp: string;
  adaptation_type: 'difficulty_adjust' | 'content_recommend' | 'pace_change';
  details: Record<string, unknown>;
}

// ==================== API响应接口 ====================

/** 通用API响应包装 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error_code?: string;
  pagination?: {
    total: number;
    page: number;
    page_size: number;
    total_pages: number;
  };
}

/** 分页列表响应 */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

// ==================== 课程筛选和查询模型 ====================

/**
 * 课程筛选条件
 */
export interface CourseFilter {
  scenario_type?: CourseScenarioType[];
  category?: CourseCategory[];
  level?: CourseLevel[];
  status?: CourseStatus[];
  delivery_method?: DeliveryMethod[];
  is_free?: boolean;
  org_id?: number[];
  min_rating?: number;
  tags?: string[];
  price_range?: {
    min: number;
    max: number;
  };
  search_keyword?: string;
}

/**
 * 课程排序选项
 */
export type CourseSortOption =
  | 'newest' // 最新
  | 'oldest' // 最早
  | 'popular' // 最热门
  | 'rating' // 评分最高
  | 'enrollment' // 报名最多
  | 'price_asc' // 价格从低到高
  | 'price_desc'; // 价格从高到低

/**
 * 课程查询参数
 */
export interface CourseQueryParams {
  filter?: CourseFilter;
  sort?: CourseSortOption;
  page?: number;
  page_size?: number;
}

// ==================== 创建和更新模型 ====================

/**
 * 创建课程请求
 */
export interface UnifiedCourseCreate {
  org_id: number;
  scenario_type: CourseScenarioType;
  title: string;
  subtitle?: string;
  description?: string;
  cover_image_url?: string;
  promo_video_url?: string;
  category: CourseCategory;
  tags: string[];
  level: CourseLevel;
  subject?: string;
  learning_objectives: string[];
  prerequisites?: string[];
  target_audience?: string;
  total_lessons: number;
  estimated_duration_hours: number;
  delivery_method: DeliveryMethod;
  max_students?: number;
  is_free: boolean;
  price?: number;
  currency?: string;
  enrollment_start_date?: string;
  enrollment_end_date?: string;
  course_start_date?: string;
  course_end_date?: string;
  schedule_pattern?: string;
  primary_teacher_id: number;
  assistant_teacher_ids?: number[];
  materials?: Omit<CourseMaterial, 'id' | 'course_id' | 'created_at'>[];
  external_resources?: Omit<ExternalResource, 'id' | 'course_id' | 'created_at'>[];
  visibility: 'public' | 'private' | 'restricted';
  is_featured?: boolean;
  ai_generated?: boolean;
  ai_model_version?: string;
  ai_confidence_score?: number;
  dynamic_content?: boolean;
}

/**
 * 更新课程请求
 */
export interface UnifiedCourseUpdate {
  title?: string;
  subtitle?: string;
  description?: string;
  cover_image_url?: string;
  promo_video_url?: string;
  category?: CourseCategory;
  tags?: string[];
  level?: CourseLevel;
  subject?: string;
  learning_objectives?: string[];
  prerequisites?: string[];
  target_audience?: string;
  estimated_duration_hours?: number;
  delivery_method?: DeliveryMethod;
  max_students?: number;
  is_free?: boolean;
  price?: number;
  currency?: string;
  enrollment_start_date?: string;
  enrollment_end_date?: string;
  course_start_date?: string;
  course_end_date?: string;
  schedule_pattern?: string;
  primary_teacher_id?: number;
  assistant_teacher_ids?: number[];
  materials?: Omit<CourseMaterial, 'id' | 'course_id' | 'created_at'>[];
  external_resources?: Omit<ExternalResource, 'id' | 'course_id' | 'created_at'>[];
  visibility?: 'public' | 'private' | 'restricted';
  is_featured?: boolean;
  status?: CourseStatus;
}

// ==================== 类型标签和映射 ====================

/** 课程场景类型标签 */
export const CourseScenarioTypeLabels: Record<CourseScenarioType, string> = {
  school_curriculum: '校本课程',
  school_interest: '兴趣班',
  institution: '培训机构课程',
  online_platform: '在线平台课程',
  ai_generated: 'AI生成课程',
  competition: '竞赛培训',
};

/** 课程状态标签 */
export const CourseStatusLabels: Record<CourseStatus, string> = {
  draft: '草稿',
  pending: '待审核',
  published: '已发布',
  ongoing: '进行中',
  completed: '已结束',
  archived: '已归档',
};

/** 课程级别标签 */
export const CourseLevelLabels: Record<CourseLevel, string> = {
  beginner: '初级',
  intermediate: '中级',
  advanced: '高级',
  expert: '专家',
};

/** 课程分类标签 */
export const CourseCategoryLabels: Record<CourseCategory, string> = {
  science: '科学',
  technology: '技术',
  engineering: '工程',
  mathematics: '数学',
  language: '语言',
  arts: '艺术',
  sports: '体育',
  social_studies: '社会科学',
  music: '音乐',
  programming: '编程',
  ai_robotics: 'AI与机器人',
  other: '其他',
};

/** 授课方式标签 */
export const DeliveryMethodLabels: Record<DeliveryMethod, string> = {
  online: '在线',
  offline: '线下',
  hybrid: '混合',
  self_paced: '自主学习',
};

/** 报名状态标签 */
export const EnrollmentStatusLabels: Record<EnrollmentStatus, string> = {
  pending: '待确认',
  confirmed: '已确认',
  in_progress: '学习中',
  completed: '已完成',
  dropped: '已退课',
  suspended: '已暂停',
  expired: '已过期',
};

// ==================== 类型守卫函数 ====================

/**
 * 检查对象是否为统一课程
 */
export function isUnifiedCourse(obj: unknown): obj is UnifiedCourse {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    typeof obj.id === 'number' &&
    'course_code' in obj &&
    typeof obj.course_code === 'string' &&
    'org_id' in obj &&
    typeof obj.org_id === 'number' &&
    'scenario_type' in obj &&
    typeof obj.scenario_type === 'string'
  );
}

/**
 * 检查课程场景类型是否有效
 */
export function isValidCourseScenarioType(type: string): type is CourseScenarioType {
  return [
    'school_curriculum',
    'school_interest',
    'institution',
    'online_platform',
    'ai_generated',
    'competition',
  ].includes(type);
}

/**
 * 检查课程状态是否有效
 */
export function isValidCourseStatus(status: string): status is CourseStatus {
  return ['draft', 'pending', 'published', 'ongoing', 'completed', 'archived'].includes(status);
}

/**
 * 检查报名状态是否有效
 */
export function isValidEnrollmentStatus(status: string): status is EnrollmentStatus {
  return [
    'pending',
    'confirmed',
    'in_progress',
    'completed',
    'dropped',
    'suspended',
    'expired',
  ].includes(status);
}
