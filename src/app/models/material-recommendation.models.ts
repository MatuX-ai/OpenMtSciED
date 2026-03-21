/**
 * 课件AI推荐系统数据模型
 * Material Recommendation Models
 * 用于支持基于用户行为和内容分析的智能推荐
 */

import { Material } from './material.models';

/**
 * 推荐原因枚举
 * Recommendation Reason Enum
 */
export enum RecommendationReason {
  /** 基于用户学习偏好 */
  PREFERENCE_BASED = 'preference_based',
  /** 基于学科相关性 */
  SUBJECT_RELATED = 'subject_related',
  /** 基于热门程度 */
  POPULARITY = 'popularity',
  /** 基于相似用户行为 */
  COLLABORATIVE_FILTERING = 'collaborative_filtering',
  /** 基于内容相似度 */
  CONTENT_SIMILARITY = 'content_similarity',
  /** 编辑精选 */
  EDITOR_PICK = 'editor_pick',
  /** 新发布 */
  NEW_ARRIVAL = 'new_arrival'
}

/**
 * 推荐项
 * Recommendation Item
 */
export interface MaterialRecommendation {
  /** 推荐ID */
  id: string;
  /** 课件ID */
  materialId: string;
  /** 课件详情 */
  material: Material;
  /** 推荐理由 */
  reason: RecommendationReason;
  /** 推荐理由描述 */
  reasonText: string;
  /** 推荐分数 (0-100) */
  score: number;
  /** 预测匹配度 */
  matchPercentage: number;
  /** 预计学习时长（分钟） */
  estimatedDuration: number;
  /** 创建时间 */
  createdAt: Date;
}

/**
 * 推荐结果集合
 * Recommendation Result Set
 */
export interface RecommendationResult {
  /** 用户ID */
  userId: string;
  /** 推荐列表 */
  recommendations: MaterialRecommendation[];
  /** 总数 */
  total: number;
  /** 页码 */
  page: number;
  /** 每页数量 */
  pageSize: number;
}

/**
 * 用户偏好画像
 * User Preference Profile
 */
export interface UserPreferenceProfile {
  /** 用户ID */
  userId: string;
  /** 偏好学科列表 */
  preferredSubjects: string[];
  /** 偏好难度级别 */
  preferredDifficulty: 'beginner' | 'intermediate' | 'advanced';
  /** 偏好类型列表 */
  preferredTypes: string[];
  /** 学习目标 */
  learningGoals: string[];
  /** 最后更新时间 */
  lastUpdated: Date;
}

/**
 * 推荐配置
 * Recommendation Configuration
 */
export interface RecommendationConfig {
  /** 最大推荐数量 */
  maxRecommendations: number;
  /** 最低推荐分数 */
  minScore: number;
  /** 是否包含已学习的课件 */
  includeLearned: boolean;
  /** 推荐原因权重配置 */
  reasonWeights: {
    [key in RecommendationReason]: number;
  };
}

/**
 * 推荐反馈
 * Recommendation Feedback
 */
export interface RecommendationFeedback {
  /** 反馈ID */
  id: string;
  /** 推荐项ID */
  recommendationId: string;
  /** 用户ID */
  userId: string;
  /** 课件ID */
  materialId: string;
  /** 反馈类型：like/dislike/view/skip */
  feedbackType: 'like' | 'dislike' | 'view' | 'skip';
  /** 时间戳 */
  timestamp: Date;
}

/**
 * 推荐统计信息
 * Recommendation Statistics
 */
export interface RecommendationStatistics {
  /** 用户ID */
  userId: string;
  /** 推荐总数 */
  totalRecommendations: number;
  /** 接受率 */
  acceptanceRate: number;
  /** 跳过率 */
  skipRate: number;
  /** 点赞率 */
  likeRate: number;
  /** 平均学习时长（分钟） */
  avgStudyDuration: number;
  /** 按推荐原因的统计 */
  reasonStatistics: {
    [key in RecommendationReason]: {
      count: number;
      acceptanceRate: number;
    };
  };
  /** 统计时间范围 */
  periodStart: Date;
  periodEnd: Date;
}

/**
 * 推荐历史记录
 * Recommendation History
 */
export interface RecommendationHistory {
  /** 历史记录ID */
  id: string;
  /** 用户ID */
  userId: number;
  /** 推荐列表 */
  recommendations: MaterialRecommendation[];
  /** 生成时间 */
  generatedAt: Date;
}

/**
 * 类型守卫：检查是否为有效的推荐原因
 * Type Guard: Check if valid recommendation reason
 */
export function isValidRecommendationReason(value: string): value is RecommendationReason {
  return Object.values(RecommendationReason).includes(value as RecommendationReason);
}

/**
 * 类型守卫：检查是否为有效的反馈类型
 * Type Guard: Check if valid feedback type
 */
export function isValidFeedbackType(value: string): value is RecommendationFeedback['feedbackType'] {
  return ['like', 'dislike', 'view', 'skip'].includes(value);
}
