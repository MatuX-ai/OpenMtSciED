/**
 * 用户角色枚举
 */
export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
  ORG_ADMIN = 'org_admin',
  PREMIUM = 'premium',
}

/**
 * 用户接口
 */
export interface User {
  id: number;
  username: string | null;
  email: string;
  role: UserRole | string | null;
  is_active: boolean;
  is_superuser: boolean;
  organization_id?: number | null;
  created_at?: string;
  updated_at?: string;
}

/**
 * 用户统计信息
 */
export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  adminUsers: number;
  orgAdminUsers: number;
}

/**
 * 用户创建请求
 */
export interface UserCreate {
  username: string;
  email: string;
  password: string;
}

/**
 * 用户更新请求
 */
export interface UserUpdate {
  username?: string;
  email?: string;
  role?: UserRole | string;
  is_active?: boolean;
}

/**
 * 批量导入结果
 */
export interface BulkImportResult {
  success_count: number;
  failed_count: number;
  conflicts_count: number;
  errors: string[];
  conflicts: Record<string, ImportConflict[]>;
  imported_users: User[];
}

/**
 * 导入冲突
 */
export interface ImportConflict {
  row: number;
  field?: string;
  value?: string;
  error?: string;
  username?: string;
  email?: string;
  existing?: boolean;
}
