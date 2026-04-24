import { Injectable, inject } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

@Injectable()
export class HttpErrorInterceptor implements HttpInterceptor {
  private snackBar = inject(MatSnackBar);
  private router = inject(Router);

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    // 直接从localStorage读取token，避免循环依赖
    const token = localStorage.getItem('access_token');
    if (token) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
      });
    }

    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        let errorMessage = '发生未知错误';

        if (error.error instanceof ErrorEvent) {
          // 客户端错误
          errorMessage = `客户端错误: ${error.error.message}`;
        } else {
          // 服务端错误
          switch (error.status) {
            case 400:
              errorMessage = error.error?.detail || '请求参数错误';
              break;
            case 401:
              errorMessage = '未授权，请重新登录';
              localStorage.removeItem('access_token');
              this.router.navigate(['/login']);
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
              errorMessage = error.error?.detail || `请求失败: ${error.status}`;
          }
        }

        // 显示错误提示
        this.snackBar.open(errorMessage, '关闭', {
          duration: 5000,
          panelClass: ['error-snackbar'],
        });

        console.error('HTTP错误:', error);

        return throwError(() => error);
      })
    );
  }
}
