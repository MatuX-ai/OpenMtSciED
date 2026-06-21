import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';

/**
 * 函数式 HTTP 错误拦截器（Angular 15+ HttpInterceptorFn）
 * 替代旧版 class-based HttpInterceptor
 */
export const httpErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const snackBar = inject(MatSnackBar);
  const router = inject(Router);

  // 直接从 sessionStorage 读取 token，避免循环依赖
  const token = sessionStorage.getItem('access_token');
  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = '发生未知错误';

      if (error.error instanceof ErrorEvent) {
        // 客户端错误
        errorMessage = `客户端错误: ${error.error.message}`;
      } else {
        // 服务端错误
        const detail = error.error?.detail;
        switch (error.status) {
          case 400:
            errorMessage = environment.production ? '请求参数错误' : (detail || '请求参数错误');
            break;
          case 401:
            errorMessage = '未授权，请重新登录';
            sessionStorage.removeItem('access_token');
            router.navigate(['/login']);
            break;
          case 403:
            errorMessage = '禁止访问，权限不足';
            break;
          case 404:
            errorMessage = '请求的资源不存在';
            break;
          case 500:
            errorMessage = '服务器内部错误';
            break;
          default:
            errorMessage = environment.production ? `请求失败` : (detail || `请求失败: ${error.status}`);
        }
      }

      // 显示错误提示
      snackBar.open(errorMessage, '关闭', {
        duration: 5000,
        panelClass: ['error-snackbar'],
      });

      console.error('HTTP错误:', error);

      return throwError(() => error);
    })
  );
};
