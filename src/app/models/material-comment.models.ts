/**
 * 课件评论与评分模型
 * 
 * 支持评论系统、星级评分、评价统计
 */

/**
 * 课件评论
 */
export interface MaterialComment {
  id: number;
  material_id: number;
  user_id: number;
  user_name: string;
  avatar_url?: string;
  user_role?: string;
  content: string;
  rating?: number; // 1-5星
  parent_id?: number; // 回复的评论ID
  reply_count: number;
  likes: number;
  is_liked: boolean;
  created_at: string;
  updated_at?: string;
  is_edited: boolean;
  replies?: MaterialComment[];
}

/**
 * 创建评论请求
 */
export interface CreateCommentRequest {
  material_id: number;
  content: string;
  rating?: number;
  parent_id?: number;
  is_anonymous?: boolean;
}

/**
 * 更新评论请求
 */
export interface UpdateCommentRequest {
  comment_id: number;
  content: string;
  rating?: number;
}

/**
 * 评论响应
 */
export interface CommentResponse {
  comment: MaterialComment;
  success: boolean;
  message: string;
}

/**
 * 评论统计
 */
export interface CommentStatistics {
  material_id: number;
  total_comments: number;
  total_replies: number;
  average_rating: number;
  rating_distribution: {
    rating: number;
    count: number;
    percentage: number;
  }[];
  most_helpful: {
    comment_id: number;
    user_name: string;
    content: string;
    likes: number;
  };
  recent_comments: MaterialComment[];
}

/**
 * 评论筛选条件
 */
export interface CommentFilter {
  material_id: number;
  rating?: number;
  sort_by?: 'newest' | 'oldest' | 'most_liked' | 'highest_rated';
  page?: number;
  page_size?: number;
}

/**
 * 评论分页响应
 */
export interface CommentPaginatedResponse {
  material_id: number;
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
  items: MaterialComment[];
}

/**
 * 点赞评论
 */
export interface LikeCommentRequest {
  comment_id: number;
  unlike?: boolean;
}

/**
 * 评论操作
 */
export interface CommentAction {
  type: 'like' | 'unlike' | 'report' | 'delete';
  comment_id: number;
  reason?: string;
}

/**
 * 评论举报
 */
export interface CommentReport {
  id: number;
  comment_id: number;
  reporter_id: number;
  reporter_name: string;
  reason: string;
  status: 'pending' | 'reviewed' | 'resolved';
  created_at: string;
  reviewed_by?: number;
  reviewed_by_name?: string;
  reviewed_at?: string;
}

/**
 * 用户评论历史
 */
export interface UserCommentHistory {
  user_id: number;
  user_name: string;
  total_comments: number;
  total_likes_received: number;
  average_rating_given: number;
  recent_comments: MaterialComment[];
}

/**
 * 类型守卫
 */
export function isMaterialComment(obj: any): obj is MaterialComment {
  return (
    obj &&
    typeof obj.id === 'number' &&
    typeof obj.material_id === 'number' &&
    typeof obj.user_id === 'number' &&
    typeof obj.content === 'string' &&
    typeof obj.created_at === 'string'
  );
}

export function isCommentStatistics(obj: any): obj is CommentStatistics {
  return (
    obj &&
    typeof obj.material_id === 'number' &&
    typeof obj.total_comments === 'number' &&
    typeof obj.average_rating === 'number' &&
    Array.isArray(obj.rating_distribution)
  );
}

export function isValidRating(rating: any): rating is number {
  return (
    typeof rating === 'number' &&
    rating >= 1 &&
    rating <= 5
  );
}
