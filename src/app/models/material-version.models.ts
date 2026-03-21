/**
 * 课件版本管理模型
 * 
 * 支持课件版本历史、版本对比、回滚功能
 */

/**
 * 课件版本
 */
export interface MaterialVersion {
  id: number;
  material_id: number;
  version_number: number;
  version_name: string;
  file_url: string;
  file_size: number;
  file_hash: string;
  changelog: string;
  created_by: number;
  created_by_name: string;
  created_at: string;
  is_current: boolean;
  download_count: number;
}

/**
 * 版本对比结果
 */
export interface VersionComparison {
  material_id: number;
  version1_id: number;
  version2_id: number;
  version1: MaterialVersion;
  version2: MaterialVersion;
  differences: VersionDifference[];
  summary: {
    file_size_change: number;
    file_size_change_percent: number;
    changelog_diff: string[];
  };
}

/**
 * 版本差异
 */
export interface VersionDifference {
  field: string;
  type: 'added' | 'removed' | 'modified';
  old_value: any;
  new_value: any;
}

/**
 * 版本历史响应
 */
export interface VersionHistoryResponse {
  material_id: number;
  material_title: string;
  total_versions: number;
  versions: MaterialVersion[];
}

/**
 * 创建版本请求
 */
export interface CreateVersionRequest {
  material_id: number;
  file: File;
  version_name: string;
  changelog: string;
  is_current?: boolean;
}

/**
 * 回滚版本请求
 */
export interface RollbackVersionRequest {
  material_id: number;
  version_id: number;
  reason?: string;
}

/**
 * 版本统计
 */
export interface VersionStatistics {
  material_id: number;
  total_versions: number;
  current_version_number: number;
  total_file_size: number;
  latest_version_created_at: string;
  version_creators: string[];
}

/**
 * 版本查询参数
 */
export interface VersionQueryParams {
  material_id: number;
  page?: number;
  page_size?: number;
  sort_by?: 'version_number' | 'created_at' | 'file_size';
  sort_order?: 'asc' | 'desc';
  created_by?: number;
  date_from?: string;
  date_to?: string;
}

/**
 * 版本分页响应
 */
export interface VersionPaginatedResponse {
  material_id: number;
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
  items: MaterialVersion[];
}

/**
 * 版本下载统计
 */
export interface VersionDownloadStats {
  version_id: number;
  version_number: string;
  download_count: number;
  last_downloaded_at: string | null;
  downloaders: VersionDownloader[];
}

/**
 * 版本下载者
 */
export interface VersionDownloader {
  user_id: number;
  user_name: string;
  downloaded_at: string;
}

/**
 * 类型守卫
 */
export function isMaterialVersion(obj: any): obj is MaterialVersion {
  return (
    obj &&
    typeof obj.id === 'number' &&
    typeof obj.material_id === 'number' &&
    typeof obj.version_number === 'number' &&
    typeof obj.version_name === 'string' &&
    typeof obj.file_url === 'string' &&
    typeof obj.is_current === 'boolean'
  );
}

export function isVersionComparison(obj: any): obj is VersionComparison {
  return (
    obj &&
    typeof obj.material_id === 'number' &&
    obj.version1 && isMaterialVersion(obj.version1) &&
    obj.version2 && isMaterialVersion(obj.version2) &&
    Array.isArray(obj.differences) &&
    obj.summary && typeof obj.summary === 'object'
  );
}
