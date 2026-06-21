import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * 角色路由守卫
 *
 * 限制指定路由只能被特定角色的用户访问。
 * 用法：在路由配置中 `canActivate: [authGuard, roleGuard(['admin', 'org_admin'])]`
 *
 * @param allowedRoles 允许访问的角色列表
 */
export const roleGuard = (allowedRoles: string[]): CanActivateFn => {
  return () => {
    const authService = inject(AuthService);
    const router = inject(Router);
    const user = authService.getCurrentUser();

    if (user && allowedRoles.includes(user.role || '')) {
      return true;
    }

    // 无权限时跳转到仪表盘
    router.navigate(['/dashboard']);
    return false;
  };
};
