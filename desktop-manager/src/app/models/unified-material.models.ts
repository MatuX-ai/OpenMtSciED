/**
 * 统一课件库数据模型
 *
 * 支持24种课件类型，包括文档、视频、音频、图片、代码、游戏、动画、AR/VR、模型、实验等
 */

// ==================== 课件类型定义 ====================

/**
 * 文档类课件类型
 */
export type MaterialTypeDocument =
  | 'document_pdf' // PDF文档
  | 'document_word' // Word文档
  | 'document_ppt' // PPT演示
  | 'document_excel'; // Excel表格

/**
 * 视频类课件类型
 */
export type MaterialTypeVideo =
  | 'video_teaching' // 教学视频
  | 'video_screen' // 录屏视频
  | 'video_live'; // 课程直播

/**
 * 音频类课件类型
 */
export type MaterialTypeAudio =
  | 'audio_teaching' // 音频课件
  | 'audio_recording'; // 录音内容

/**
 * 图片类课件类型
 */
export type MaterialTypeImage = 'image'; // 图片资料

/**
 * 代码类课件类型
 */
export type MaterialTypeCode =
  | 'code_source' // 源代码
  | 'code_example' // 代码示例
  | 'code_project'; // 项目文件

/**
 * 游戏类课件类型
 */
export type MaterialTypeGame =
  | 'game_interactive' // 交互式教育游戏
  | 'game_simulation'; // 仿真模拟游戏

/**
 * 动画类课件类型
 */
export type MaterialTypeAnimation =
  | 'animation_2d' // 2D动画课件
  | 'animation_3d'; // 3D动画课件

/**
 * AR/VR类课件类型
 */
export type MaterialTypeARVR =
  | 'ar_model' // AR增强现实课件
  | 'vr_experience' // VR虚拟现实体验
  | 'arvr_scene'; // AR/VR场景文件

/**
 * 模型类课件类型
 */
export type MaterialTypeModel =
  | 'model_3d' // 3D模型文件
  | 'model_robot'; // 机器人模型文件

/**
 * 实验类课件类型
 */
export type MaterialTypeExperiment =
  | 'experiment_config' // 实验配置文件
  | 'experiment_template'; // 实验模板文件

/**
 * 其他类课件类型
 */
export type MaterialTypeOther =
  | 'archive' // 压缩包
  | 'external_link'; // 外部链接

/**
 * 所有课件类型（24种）
 */
export type MaterialType =
  | MaterialTypeDocument
  | MaterialTypeVideo
  | MaterialTypeAudio
  | MaterialTypeImage
  | MaterialTypeCode
  | MaterialTypeGame
  | MaterialTypeAnimation
  | MaterialTypeARVR
  | MaterialTypeModel
  | MaterialTypeExperiment
  | MaterialTypeOther;

// ==================== 课件分类定义 ====================

/**
 * 课件分类
 */
export type MaterialCategory =
  | 'course_material' // 课程资料
  | 'reference_material' // 参考资料
  | 'assignment_material' // 作业材料
  | 'exam_material' // 考试材料
  | 'project_template' // 项目模板
  | 'tutorial' // 教程
  | 'resource_library'; // 资源库

// ==================== 权限定义 ====================

/**
 * 课件可见性
 */
export type MaterialVisibility =
  | 'public' // 公开（所有人可见）
  | 'org_private' // 机构私有（仅本机构可见）
  | 'course_private' // 课程私有（仅课程学员可见）
  | 'teacher_private'; // 教师私有（仅教师自己可见）

/**
 * 课件下载权限
 */
export type MaterialDownloadPermission =
  | 'all' // 所有人可下载
  | 'enrolled' // 已报名学员可下载
  | 'teacher' // 教师可下载
  | 'admin'; // 管理员可下载

// ==================== AR/VR 相关定义 ====================

/**
 * AR/VR类型
 */
export type ARVRType = 'ar' | 'vr' | 'mixed';

/**
 * AR追踪类型
 */
export type ARTrackingType = 'image' | 'plane' | 'point' | 'world';

/**
 * VR交互模式
 */
export type VRInteractionMode = 'gaze' | 'controller' | 'hand';

/**
 * AR标记
 */
export interface ARMarker {
  id: string;
  type: 'image' | 'text' | '3d_model';
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  scale: number;
  trigger_action?: string;
}

/**
 * 性能要求
 */
export interface PerformanceRequirement {
  min_memory_mb: number;
  min_storage_mb: number;
  gpu_required: boolean;
  recommended_gpu?: string;
  frame_rate_target: number;
}

// ==================== 游戏/模拟相关定义 ====================

/**
 * 游戏类型
 */
export type GameType = 'interactive' | 'simulation';

/**
 * 游戏引擎
 */
export type GameEngine = 'phaser' | 'threejs' | 'unity' | 'custom';

/**
 * 游戏配置
 */
export interface GameConfig {
  max_players?: number;
  scoring_enabled?: boolean;
  time_limit_seconds?: number;
  difficulty_levels?: string[];
}

/**
 * 仿真配置
 */
export interface SimulationConfig {
  physics_engine?: string;
  simulation_type?: 'robot' | 'physics' | 'chemistry' | 'biology';
  parameter_ranges?: Record<string, [number, number]>;
  data_logging_enabled?: boolean;
  export_formats?: string[];
}

// ==================== 实验相关定义 ====================

/**
 * 实验类型
 */
export type ExperimentType = 'config' | 'template';

/**
 * 实验领域
 */
export type ExperimentDomain =
  | 'robot'
  | 'physics'
  | 'chemistry'
  | 'biology'
  | 'math'
  | 'programming';

/**
 * 实验配置Schema
 */
export interface ExperimentConfigSchema {
  experiment_type: ExperimentType;
  domain: ExperimentDomain;
  parameters: Record<
    string,
    {
      type: 'number' | 'string' | 'boolean' | 'select';
      required: boolean;
      min?: number;
      max?: number;
      default: any;
      description?: string;
      options?: string[];
    }
  >;
}

/**
 * 模板元数据
 */
export interface TemplateMetadata {
  experiment_count?: number;
  difficulty_levels?: string[];
  estimated_duration_minutes?: number;
  required_equipment?: string[];
}

// ==================== 统一课件主接口 ====================

/**
 * 统一课件接口
 */
export interface UnifiedMaterial {
  // 基础信息
  id: number;
  material_code: string;
  title: string;
  description?: string;
  type: MaterialType;
  category: MaterialCategory;
  tags: string[];

  // 文件信息
  file_url: string;
  file_name: string;
  file_size: number; // bytes
  file_format: string;
  thumbnail_url?: string;

  // 关联信息
  course_id?: number;
  course_title?: string;
  chapter_id?: number;
  chapter_title?: string;
  lesson_id?: number;
  lesson_title?: string;
  org_id: number;
  org_name?: string;
  created_by: number;
  created_by_name?: string;
  updated_by?: number;
  updated_by_name?: string;

  // 访问控制
  visibility: MaterialVisibility;
  download_permission: MaterialDownloadPermission;

  // 使用统计
  download_count: number;
  view_count: number;
  like_count: number;
  share_count: number;
  comment_count: number;

  // 时间戳
  created_at: string;
  updated_at: string;
  published_at?: string;

  // AI增强信息
  ai_generated: boolean;
  ai_summary?: string;
  ai_tags?: string[];

  // 运行时属性
  material_type?: string; // 用于AR/VR预览组件

  // AR/VR 特有属性
  arvr_data?: ARVRMaterialData;

  // 游戏特有属性
  game_data?: GameMaterialData;

  // 动画特有属性
  animation_data?: AnimationMaterialData;

  // 实验特有属性
  experiment_data?: ExperimentMaterialData;
}

// ==================== AR/VR 扩展接口 ====================

/**
 * AR/VR课件扩展数据
 */
export interface ARVRMaterialData {
  arvr_type: ARVRType;

  // AR 特有
  ar_markers?: ARMarker[];
  ar_tracking_type?: ARTrackingType;
  ar_anchor_count?: number;

  // VR 特有
  vr_interaction_mode?: VRInteractionMode;
  vr_spatial_audio?: boolean;
  vr_haptics?: boolean;

  // 共同属性
  required_device?: 'mobile' | 'tablet' | 'vr_headset' | 'ar_glasses';
  performance_requirements?: PerformanceRequirement;
}

// ==================== 游戏扩展接口 ====================

/**
 * 游戏课件扩展数据
 */
export interface GameMaterialData {
  game_type: GameType;
  game_engine?: GameEngine;

  // 交互式游戏
  game_config?: GameConfig;

  // 仿真模拟
  simulation_config?: SimulationConfig;

  // 游戏统计
  game_stats_enabled?: boolean;
  leaderboard_enabled?: boolean;
  achievement_system?: boolean;
}

// ==================== 动画扩展接口 ====================

/**
 * 动画课件扩展数据
 */
export interface AnimationMaterialData {
  animation_type: '2d' | '3d';
  frame_count?: number;
  duration_seconds?: number;
  frame_rate?: number;
  supports_export_gif?: boolean;
}

// ==================== 实验扩展接口 ====================

/**
 * 实验课件扩展数据
 */
export interface ExperimentMaterialData {
  experiment_type: ExperimentType;
  experiment_domain?: ExperimentDomain;

  // 配置文件
  config_schema?: ExperimentConfigSchema;
  default_parameters?: Record<string, any>;
  parameter_descriptions?: Record<string, string>;

  // 模板文件
  template_metadata?: TemplateMetadata;

  // 实验相关
  experiment_submission_enabled?: boolean;
  auto_grading_enabled?: boolean;
  report_template?: string;
}

// ==================== 课件创建/更新接口 ====================

/**
 * 课件创建数据
 */
export interface UnifiedMaterialCreate {
  material_code: string;
  title: string;
  description?: string;
  type: MaterialType;
  category: MaterialCategory;
  tags?: string[];
  file: File;
  course_id?: number;
  chapter_id?: number;
  lesson_id?: number;
  visibility?: MaterialVisibility;
  download_permission?: MaterialDownloadPermission;

  // AR/VR 数据（可选）
  arvr_data?: ARVRMaterialData;

  // 游戏数据（可选）
  game_data?: GameMaterialData;

  // 动画数据（可选）
  animation_data?: AnimationMaterialData;

  // 实验数据（可选）
  experiment_data?: ExperimentMaterialData;
}

/**
 * 课件更新数据
 */
export interface UnifiedMaterialUpdate {
  title?: string;
  description?: string;
  tags?: string[];
  visibility?: MaterialVisibility;
  download_permission?: MaterialDownloadPermission;

  // AR/VR 数据（可选）
  arvr_data?: Partial<ARVRMaterialData>;

  // 游戏数据（可选）
  game_data?: Partial<GameMaterialData>;

  // 动画数据（可选）
  animation_data?: Partial<AnimationMaterialData>;

  // 实验数据（可选）
  experiment_data?: Partial<ExperimentMaterialData>;
}

// ==================== 查询和筛选接口 ====================

/**
 * 课件筛选条件
 */
export interface MaterialFilter {
  type?: MaterialType[];
  category?: MaterialCategory[];
  course_id?: number[];
  chapter_id?: number[];
  org_id?: number[];
  tags?: string[];
  search?: string;
  visibility?: MaterialVisibility[];
  created_by?: number[];

  // 高级筛选
  date_range?: {
    start?: string;
    end?: string;
  };
  file_size_range?: {
    min_bytes?: number;
    max_bytes?: number;
  };

  // AR/VR 筛选
  arvr_type?: ARVRType[];
  required_device?: string[];
}

/**
 * 课件查询参数
 */
export interface MaterialQueryParams {
  filter?: MaterialFilter;
  sort?: MaterialSortOption;
  page?: number;
  page_size?: number;
}

/**
 * 课件排序选项
 */
export type MaterialSortOption =
  | 'newest' // 最新上传
  | 'oldest' // 最早上传
  | 'most_downloaded' // 最多下载
  | 'most_viewed' // 最多查看
  | 'most_liked' // 最多点赞
  | 'name_asc' // 名称升序
  | 'name_desc' // 名称降序
  | 'size_asc' // 大小升序
  | 'size_desc'; // 大小降序

// ==================== API响应接口 ====================

/**
 * API响应包装
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error_code?: string;
  pagination?: {
    current_page: number;
    total_pages: number;
    total_items: number;
    items_per_page: number;
  };
}

/**
 * 分页响应
 */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

// ==================== 分享相关接口 ====================

/**
 * 分享链接响应
 */
export interface ShareLinkResponse {
  share_url: string;
  share_code: string;
  expire_at: string;
  access_password?: string;
  max_downloads?: number;
}

// ==================== 统计相关接口 ====================

/**
 * 课件统计
 */
export interface MaterialStatistics {
  material_id: number;
  download_count: number;
  view_count: number;
  like_count: number;
  share_count: number;
  comment_count: number;
  unique_visitors: number;
  unique_downloaders: number;

  // 聚合统计
  total_likes?: number; // 总点赞数
  total_shares?: number; // 总分享数
  total_comments?: number; // 总评论数
  total_views?: number; // 总浏览数
  total_size?: number; // 总大小（字节）
  total_downloads?: number; // 总下载次数
  total_materials?: number; // 总课件数

  // 时间统计
  downloads_last_7_days: number;
  downloads_last_30_days: number;
  views_last_7_days: number;
  views_last_30_days: number;

  // 地理统计
  download_by_region: Record<string, number>;
  view_by_region: Record<string, number>;
}

// ==================== 游戏统计接口 ====================

/**
 * 游戏统计数据
 */
export interface GameStatistics {
  material_id: number;
  total_plays: number;
  unique_players: number;
  average_completion_rate: number;
  average_time_seconds: number;
  leaderboard?: GameLeaderboard;
}

/**
 * 游戏排行榜
 */
export interface GameLeaderboard {
  top_players: Array<{
    user_id: number;
    user_name: string;
    score: number;
    completion_time_seconds: number;
    completed_at: string;
  }>;
  total_players: number;
}

// ==================== 实验结果接口 ====================

/**
 * 实验提交
 */
export interface ExperimentSubmission {
  id: number;
  material_id: number;
  user_id: number;
  user_name: string;
  submitted_at: string;

  // 提交的参数
  parameters: Record<string, any>;

  // 实验结果
  results: Record<string, any>;
  score?: number;
  grade?: string;
  feedback?: string;

  // 附带文件
  attached_files?: Array<{
    file_name: string;
    file_url: string;
    file_size: number;
  }>;
}

// ==================== 类型守卫函数 ====================

/**
 * 检查是否为文档类课件类型
 */
export function isDocumentType(type: MaterialType): type is MaterialTypeDocument {
  return ['document_pdf', 'document_word', 'document_ppt', 'document_excel'].includes(
    type as MaterialTypeDocument
  );
}

/**
 * 检查是否为视频类课件类型
 */
export function isVideoType(type: MaterialType): type is MaterialTypeVideo {
  return ['video_teaching', 'video_screen', 'video_live'].includes(type as MaterialTypeVideo);
}

/**
 * 检查是否为音频类课件类型
 */
export function isAudioType(type: MaterialType): type is MaterialTypeAudio {
  return ['audio_teaching', 'audio_recording'].includes(type as MaterialTypeAudio);
}

/**
 * 检查是否为游戏类课件类型
 */
export function isGameType(type: MaterialType): type is MaterialTypeGame {
  return ['game_interactive', 'game_simulation'].includes(type as MaterialTypeGame);
}

/**
 * 检查是否为动画类课件类型
 */
export function isAnimationType(type: MaterialType): type is MaterialTypeAnimation {
  return ['animation_2d', 'animation_3d'].includes(type as MaterialTypeAnimation);
}

/**
 * 检查是否为AR/VR类课件类型
 */
export function isARVRType(type: MaterialType): type is MaterialTypeARVR {
  return ['ar_model', 'vr_experience', 'arvr_scene'].includes(type as MaterialTypeARVR);
}

/**
 * 检查是否为实验类课件类型
 */
export function isExperimentType(type: MaterialType): type is MaterialTypeExperiment {
  return ['experiment_config', 'experiment_template'].includes(type as MaterialTypeExperiment);
}

/**
 * 检查是否为模型类课件类型
 */
export function isModelType(type: MaterialType): type is MaterialTypeModel {
  return ['model_3d', 'model_robot'].includes(type as MaterialTypeModel);
}

/**
 * 验证课件类型是否有效
 */
export function isValidMaterialType(type: string): type is MaterialType {
  const allTypes: MaterialType[] = [
    // 文档类 (4)
    'document_pdf',
    'document_word',
    'document_ppt',
    'document_excel',
    // 视频类 (3)
    'video_teaching',
    'video_screen',
    'video_live',
    // 音频类 (2)
    'audio_teaching',
    'audio_recording',
    // 图片类 (1)
    'image',
    // 代码类 (3)
    'code_source',
    'code_example',
    'code_project',
    // 游戏类 (2)
    'game_interactive',
    'game_simulation',
    // 动画类 (2)
    'animation_2d',
    'animation_3d',
    // AR/VR类 (3)
    'ar_model',
    'vr_experience',
    'arvr_scene',
    // 模型类 (2)
    'model_3d',
    'model_robot',
    // 实验类 (2)
    'experiment_config',
    'experiment_template',
    // 其他类 (2)
    'archive',
    'external_link',
  ];

  return allTypes.includes(type as MaterialType);
}

// ==================== 文件大小限制配置 ====================

/**
 * 文件大小限制（bytes）
 */
export const FILE_SIZE_LIMITS: Record<MaterialType, number> = {
  // 文档类
  document_pdf: 50 * 1024 * 1024, // 50MB
  document_word: 25 * 1024 * 1024, // 25MB
  document_ppt: 100 * 1024 * 1024, // 100MB
  document_excel: 25 * 1024 * 1024, // 25MB

  // 视频类
  video_teaching: 2 * 1024 * 1024 * 1024, // 2GB
  video_screen: 2 * 1024 * 1024 * 1024, // 2GB
  video_live: 0, // 直播无大小限制

  // 音频类
  audio_teaching: 500 * 1024, // 500KB
  audio_recording: 500 * 1024, // 500KB

  // 图片类
  image: 20 * 1024 * 1024, // 20MB

  // 代码类
  code_source: 50 * 1024 * 1024, // 50MB
  code_example: 10 * 1024 * 1024, // 10MB
  code_project: 100 * 1024 * 1024, // 100MB

  // 游戏类
  game_interactive: 50 * 1024 * 1024, // 50MB
  game_simulation: 100 * 1024 * 1024, // 100MB

  // 动画类
  animation_2d: 500 * 1024 * 1024, // 500MB
  animation_3d: 2 * 1024 * 1024 * 1024, // 2GB

  // AR/VR类
  ar_model: 500 * 1024 * 1024, // 500MB
  vr_experience: 5 * 1024 * 1024 * 1024, // 5GB
  arvr_scene: 2 * 1024 * 1024 * 1024, // 2GB

  // 模型类
  model_3d: 100 * 1024 * 1024, // 100MB
  model_robot: 100 * 1024 * 1024, // 100MB

  // 实验类
  experiment_config: 1 * 1024 * 1024, // 1MB
  experiment_template: 5 * 1024 * 1024, // 5MB

  // 其他类
  archive: 500 * 1024 * 1024, // 500MB
  external_link: 0, // 外部链接无大小限制
};

// ==================== 课件类型标签 ====================

/**
 * 课件类型显示标签（中文）
 */
export const MaterialTypeLabels: Record<MaterialType, string> = {
  // 文档类
  document_pdf: 'PDF文档',
  document_word: 'Word文档',
  document_ppt: 'PPT演示',
  document_excel: 'Excel表格',

  // 视频类
  video_teaching: '教学视频',
  video_screen: '录屏视频',
  video_live: '课程直播',

  // 音频类
  audio_teaching: '音频课件',
  audio_recording: '录音内容',

  // 图片类
  image: '图片资料',

  // 代码类
  code_source: '源代码',
  code_example: '代码示例',
  code_project: '项目文件',

  // 游戏类
  game_interactive: '交互游戏',
  game_simulation: '仿真模拟',

  // 动画类
  animation_2d: '2D动画',
  animation_3d: '3D动画',

  // AR/VR类
  ar_model: 'AR模型',
  vr_experience: 'VR体验',
  arvr_scene: 'AR/VR场景',

  // 模型类
  model_3d: '3D模型',
  model_robot: '机器人模型',

  // 实验类
  experiment_config: '实验配置',
  experiment_template: '实验模板',

  // 其他类
  archive: '压缩包',
  external_link: '外部链接',
};

/**
 * 课件分类显示标签（中文）
 */
export const MaterialCategoryLabels: Record<MaterialCategory, string> = {
  course_material: '课程资料',
  reference_material: '参考资料',
  assignment_material: '作业材料',
  exam_material: '考试材料',
  project_template: '项目模板',
  tutorial: '教程',
  resource_library: '资源库',
};

/**
 * 可见性显示标签（中文）
 */
export const MaterialVisibilityLabels: Record<MaterialVisibility, string> = {
  public: '公开',
  org_private: '机构私有',
  course_private: '课程私有',
  teacher_private: '教师私有',
};

/**
 * 下载权限显示标签（中文）
 */
export const MaterialDownloadPermissionLabels: Record<MaterialDownloadPermission, string> = {
  all: '所有人',
  enrolled: '已报名学员',
  teacher: '教师',
  admin: '管理员',
};
