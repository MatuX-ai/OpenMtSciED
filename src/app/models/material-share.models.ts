/**
 * 课件分享与权限管理模型
 * 
 * 支持生成分享链接、权限控制、分享统计
 */

/**
 * 分享链接
 */
export interface ShareLink {
  id: number;
  material_id: number;
  share_token: string;
  share_url: string;
  created_by: number;
  created_by_name: string;
  title: string;
  description?: string;
  permissions: SharePermissions;
  expiration_type: 'never' | 'days' | 'hours' | 'count';
  expiration_value: number;
  expires_at?: string;
  is_active: boolean;
  access_count: number;
  download_count: number;
  view_count: number;
  created_at: string;
  last_accessed_at?: string;
}

/**
 * 分享权限
 */
export interface SharePermissions {
  can_view: boolean;
  can_download: boolean;
  can_comment: boolean;
  can_edit: boolean;
  can_share: boolean;
}

/**
 * 创建分享链接请求
 */
export interface CreateShareLinkRequest {
  material_id: number;
  title?: string;
  description?: string;
  permissions: SharePermissions;
  expiration_type: 'never' | 'days' | 'hours' | 'count';
  expiration_value: number;
  max_access_count?: number;
  max_download_count?: number;
  password?: string;
}

/**
 * 更新分享链接请求
 */
export interface UpdateShareLinkRequest {
  share_id: number;
  title?: string;
  description?: string;
  permissions?: SharePermissions;
  is_active?: boolean;
  expiration_type?: 'never' | 'days' | 'hours' | 'count';
  expiration_value?: number;
}

/**
 * 访问记录
 */
export interface ShareAccessRecord {
  id: number;
  share_id: number;
  material_id: number;
  accessed_by: number;
  accessed_by_name: string;
  accessed_by_email?: string;
  ip_address?: string;
  user_agent?: string;
  accessed_at: string;
  action: 'view' | 'download';
}

/**
 * 分享统计
 */
export interface ShareStatistics {
  material_id: number;
  total_links: number;
  active_links: number;
  total_accesses: number;
  total_downloads: number;
  total_views: number;
  most_accessed_link: {
    share_id: number;
    title: string;
    access_count: number;
  };
  access_trends: {
    date: string;
    views: number;
    downloads: number;
  }[];
}

/**
 * 权限预设
 */
export interface SharePermissionPreset {
  name: string;
  label: string;
  description: string;
  permissions: SharePermissions;
}

/**
 * 访问验证
 */
export interface ShareAccessValidation {
  is_valid: boolean;
  is_active: boolean;
  is_expired: boolean;
  is_password_protected: boolean;
  remaining_accesses?: number;
  remaining_downloads?: number;
  expires_at?: string;
  material?: {
    id: number;
    title: string;
    file_url: string;
  };
}

/**
 * 密码验证请求
 */
export interface PasswordValidationRequest {
  share_token: string;
  password: string;
}

/**
 * 分享链接响应
 */
export interface ShareLinkResponse {
  share_link: ShareLink;
  share_url: string;
  success: boolean;
  message: string;
}

/**
 * 我的分享
 */
export interface MySharesResponse {
  user_id: number;
  total_shares: number;
  active_shares: number;
  total_accesses: number;
  shares: ShareLink[];
}

/**
 * 权限检查
 */
export interface PermissionCheck {
  material_id: number;
  user_id: number;
  can_view: boolean;
  can_download: boolean;
  can_comment: boolean;
  can_edit: boolean;
  can_share: boolean;
  can_delete: boolean;
  is_owner: boolean;
}

/**
 * 类型守卫
 */
export function isShareLink(obj: any): obj is ShareLink {
  return (
    obj &&
    typeof obj.id === 'number' &&
    typeof obj.material_id === 'number' &&
    typeof obj.share_token === 'string' &&
    typeof obj.share_url === 'string' &&
    typeof obj.is_active === 'boolean'
  );
}

export function isSharePermissions(obj: any): obj is SharePermissions {
  return (
    obj &&
    typeof obj.can_view === 'boolean' &&
    typeof obj.can_download === 'boolean' &&
    typeof obj.can_comment === 'boolean' &&
    typeof obj.can_edit === 'boolean' &&
    typeof obj.can_share === 'boolean'
  );
}

export function isShareLinkResponse(obj: any): obj is ShareLinkResponse {
  return (
    obj &&
    isShareLink(obj.share_link) &&
    typeof obj.share_url === 'string' &&
    typeof obj.success === 'boolean' &&
    typeof obj.message === 'string'
  );
}

export function isShareAccessValidation(obj: any): obj is ShareAccessValidation {
  return (
    obj &&
    typeof obj.is_valid === 'boolean' &&
    typeof obj.is_active === 'boolean' &&
    typeof obj.is_expired === 'boolean' &&
    typeof obj.is_password_protected === 'boolean'
  );
}
