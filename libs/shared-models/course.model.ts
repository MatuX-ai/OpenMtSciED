/**
 * 统一课程模型 (与 backend/db_models.py 及 desktop-manager/models 对齐)
 */

export interface UnifiedCourse {
  id: number;
  course_code?: string;
  title: string;
  subtitle?: string;
  description?: string;
  source?: string; // 爬虫来源或机构ID
  level?: string; // elementary, middle, high, university
  subject?: string;
  url?: string;
  metadata?: any;
  
  // 扩展字段 (来自 desktop-manager)
  category?: string;
  tags?: string[];
  learning_objectives?: string[];
  total_lessons?: number;
  estimated_duration_hours?: number;
  is_free?: boolean;
  price?: number;
  status?: string;
  created_at?: string;
  updated_at?: string;
  
  // admin-web 特定字段
  gradeLevel?: string;
  duration_hours?: number;
  enrolled_students?: number;
}

export interface CourseStats {
  totalCourses: number;
  activeCourses: number;
  totalEnrollments: number;
  categories: number;
}

export interface CourseFilter {
  search?: string;
  gradeLevel?: string;
  subject?: string;
  level?: string;
  skip?: number;
  limit?: number;
}
