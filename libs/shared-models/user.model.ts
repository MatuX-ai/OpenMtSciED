/**
 * 统一用户模型 (与 desktop-manager/models/user.models.ts 对齐)
 */

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
  ORG_ADMIN = 'org_admin',
  PREMIUM = 'premium',
}

export interface User {
  id: number;
  username: string | null;
  email: string;
  role: UserRole | string | null;
  is_active: boolean;
  is_superuser?: boolean;
  organization_id?: number | null;
  created_at?: string;
  updated_at?: string;
}

export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers?: number;
  adminUsers: number;
  orgAdminUsers?: number;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: User;
}
