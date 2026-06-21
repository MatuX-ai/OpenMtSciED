import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

/** 课件（教材章节）实体 */
export interface TextbookChapter {
  chapter_id: string;
  title: string;
  textbook: string;
  source: string;
  grade_level: string;
  subject: string;
  chapter_url?: string;
  pdf_download_url?: string;
  prerequisites?: string[];
  key_concepts?: any[];
  exercises?: any[];
}

/** 课件查询参数 */
export interface MaterialsQueryParams {
  skip?: number;
  limit?: number;
}

/** 课件列表响应 */
export interface MaterialsListResponse {
  items: any[];
  total: number;
}

/**
 * 课件库服务
 * 集中封装课件库相关 API 调用，避免组件直接使用 HttpClient
 */
@Injectable({
  providedIn: 'root',
})
export class MaterialsService {
  private http = inject(HttpClient);

  private readonly API_BASE = '/api/v1/libraries/materials';

  /**
   * 获取课件列表
   * @param params 查询参数（分页）
   * @returns 课件列表与后端真实 total
   */
  getMaterials(params: MaterialsQueryParams = {}): Observable<MaterialsListResponse> {
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
