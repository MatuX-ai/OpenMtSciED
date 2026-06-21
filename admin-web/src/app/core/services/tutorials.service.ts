import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

/** 教程实体 */
export interface Tutorial {
  tutorial_id: string;
  title: string;
  source: string;
  age_range?: string;
  subject: string;
  category?: string;
  difficulty?: number;
  duration_hours?: number;
  description: string;
  modules?: any[];
  hardware_list?: any[];
  knowledge_points?: string[];
  experiments?: any[];
  cross_discipline?: string[];
  tutorial_url?: string;
}

/** 教程查询参数 */
export interface TutorialsQueryParams {
  skip?: number;
  limit?: number;
}

/** 教程列表响应（含后端真实 total） */
export interface TutorialsListResponse {
  items: any[];
  total: number;
}

/**
 * 教程库服务
 * 集中封装教程库相关 API 调用，避免组件直接使用 HttpClient
 */
@Injectable({
  providedIn: 'root',
})
export class TutorialsService {
  private http = inject(HttpClient);

  private readonly API_BASE = '/api/v1/libraries/tutorials';

  /**
   * 获取教程列表
   * @param params 查询参数（分页）
   * @returns 教程列表与后端真实 total
   */
  getTutorials(params: TutorialsQueryParams = {}): Observable<TutorialsListResponse> {
    let httpParams = new HttpParams();
    if (params.skip !== undefined) {
      httpParams = httpParams.set('skip', params.skip.toString());
    }
    if (params.limit !== undefined) {
      httpParams = httpParams.set('limit', params.limit.toString());
    }

    return this.http.get<any>(`${this.API_BASE}`, { params: httpParams }).pipe(
      map(response => ({
        items: (response.data || []) as any[],
        total: response.total || 0,
      }))
    );
  }
}
