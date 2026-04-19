import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { BulkImportResult, User, UserStats } from '../../models/user.models';

/**
 * 用户管理服务
 * 提供用户相关的API调用
 */
@Injectable({
  providedIn: 'root',
})
export class UserService {
  private http = inject(HttpClient);

  private readonly API_BASE = '/api/v1';

  /**
   * 获取用户列表
   */
  getUsers(
    page: number = 1,
    limit: number = 50,
    role?: string,
    status?: string,
    search?: string
  ): Observable<User[]> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (role) {
      params = params.set('role', role);
    }
    if (status) {
      params = params.set('status', status);
    }
    if (search) {
      params = params.set('search', search);
    }

    return this.http.get<User[]>(`${this.API_BASE}/users`, { params });
  }

  /**
   * 获取用户详情
   */
  getUser(userId: number): Observable<User> {
    return this.http.get<User>(`${this.API_BASE}/users/${userId}`);
  }

  /**
   * 删除用户
   */
  deleteUser(userId: number): Observable<void> {
    return this.http.delete<void>(`${this.API_BASE}/users/${userId}`);
  }

  /**
   * 获取用户统计信息
   */
  getUserStats(): Observable<UserStats> {
    return this.http.get<UserStats>(`${this.API_BASE}/users/stats`);
  }

  /**
   * 批量导入用户
   */
  bulkImportUsers(file: File, conflictResolution: string = 'skip'): Observable<BulkImportResult> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('conflict_resolution', conflictResolution);

    return this.http.post<BulkImportResult>(`${this.API_BASE}/auth/bulk-import`, formData);
  }
}
