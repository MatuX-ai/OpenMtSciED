/**
 * 共享角色工具函数
 */

import { UserRole } from '../../models/user.models';

const ROLE_DISPLAY_NAME_MAP: Record<string, string> = {
  [UserRole.USER]: '普通用户',
  [UserRole.ADMIN]: '系统管理员',
  [UserRole.ORG_ADMIN]: '机构管理员',
  [UserRole.PREMIUM]: '高级用户',
};

const ROLE_CLASS_MAP: Record<string, string> = {
  [UserRole.USER]: 'role-user',
  [UserRole.ADMIN]: 'role-admin',
  [UserRole.ORG_ADMIN]: 'role-org-admin',
  [UserRole.PREMIUM]: 'role-premium',
};

/**
 * 获取角色中文显示名称
 * @param role 角色枚举或字符串
 * @returns 角色中文名称
 */
export function getRoleDisplayName(role: UserRole | string): string {
  return ROLE_DISPLAY_NAME_MAP[role] || role;
}

/**
 * 获取角色 CSS 类名
 * @param role 角色枚举或字符串
 * @returns CSS 类名
 */
export function getRoleClass(role: UserRole | string): string {
  return ROLE_CLASS_MAP[role] || 'role-default';
}
