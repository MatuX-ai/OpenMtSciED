/**
 * 资源关联相关的类型定义
 */

// 相关课件
export interface RelatedMaterial {
  chapter_id: string;
  title: string;
  textbook: string;
  source: string;
  subject: string;
  grade_level: string;
  pdf_download_url?: string;
  chapter_url?: string;
  relevance_score?: number; // 关联度评分 (0-1)
}

// 所需硬件
export interface RequiredHardware {
  id: number;
  project_id: string;
  title: string;
  subject: string;
  description: string;
  category: string;
  difficulty: number;
  total_cost: number;
  estimated_time_hours?: number;
  materials?: MaterialItem[];
  relevance_score?: number; // 关联度评分 (0-1)
}

// 材料项
export interface MaterialItem {
  name: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  purchaseLink?: string;
  alternative?: string;
}

// 学习路径
export interface LearningPath {
  tutorial: any;
  related_materials: RelatedMaterial[];
  required_hardware: RequiredHardware[];
}

// 搜索结果
export interface SearchResult {
  tutorials: any[];
  materials: RelatedMaterial[];
  hardware_projects: RequiredHardware[];
}

// 资源概览统计
export interface ResourceSummary {
  total_tutorials: number;
  total_materials: number;
  total_hardware: number;
  subject_distribution: {
    [subject: string]: {
      tutorials: number;
      materials: number;
      hardware: number;
    };
  };
}

// API响应包装
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  total?: number;
  message?: string;
}
