import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

/** 课程查询参数 */
export interface CoursesQueryParams {
  skip?: number;
  limit?: number;
  level?: string;
  subject?: string;
  search?: string;
}

/** 课程列表响应（含后端真实 total） */
export interface CoursesListResponse {
  items: any[];
  total: number;
}

/**
 * 课程管理服务
 * 集中封装课程管理相关 API 调用，避免组件直接使用 HttpClient
 */
@Injectable({
  providedIn: 'root',
})
export class CoursesService {
  private http = inject(HttpClient);

  private readonly API_BASE = '/api/v1/admin/courses';

  /**
   * 获取课程列表
   * @param params 查询参数（分页/过滤/搜索）
   * @returns 课程列表与后端真实 total
   */
  getCourses(params: CoursesQueryParams = {}): Observable<CoursesListResponse> {
    let httpParams = new HttpParams();
    if (params.skip !== undefined) {
      httpParams = httpParams.set('skip', params.skip.toString());
    }
    if (params.limit !== undefined) {
      httpParams = httpParams.set('limit', params.limit.toString());
    }
    if (params.level) {
      httpParams = httpParams.set('level', params.level);
    }
    if (params.subject) {
      httpParams = httpParams.set('subject', params.subject);
    }
    if (params.search) {
      httpParams = httpParams.set('search', params.search);
    }

    return this.http.get<any>(`${this.API_BASE}`, { params: httpParams }).pipe(
      map(response => ({
        items: (response.data || []) as any[],
        total: response.total || 0,
      }))
    );
  }
}
