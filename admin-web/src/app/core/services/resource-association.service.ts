import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

/** 资源实体（教程 / 课件 / 硬件） */
export interface ResourceItem {
  id: string;
  title: string;
  subject: string;
  type: 'tutorial' | 'material' | 'hardware';
}

/** 资源关联实体 */
export interface Association {
  id: string;
  source_id: string;
  source_type: string;
  target_id: string;
  target_type: string;
  relevance_score: number;
}

/** 资源关联统计 */
export interface AssociationStats {
  totalAssociations: number;
  tutorialMaterialLinks: number;
  materialHardwareLinks: number;
  avgRelevance: number;
}

/** 新建资源关联请求体 */
export interface CreateAssociationRequest {
  source_type: string;
  source_id: string;
  target_type: string;
  target_id: string;
  relevance_score: number;
}

/** 关联过滤类型 */
export type AssociationFilter = 'all' | 'tutorial-material' | 'tutorial-hardware' | 'material-hardware';

/**
 * 资源关联管理服务
 * 集中封装资源关联相关 API 调用
 */
@Injectable({
  providedIn: 'root',
})
export class ResourceAssociationService {
  private http = inject(HttpClient);

  private readonly API_BASE = '/api/v1/resources/associations';

  /**
   * 获取资源关联统计信息
   */
  getStats(): Observable<AssociationStats> {
    return this.http.get<any>(`${this.API_BASE}/stats`).pipe(
      map(response => response.data || response)
    );
  }

  /**
   * 获取资源关联列表
   * @param filter 过滤类型
   */
  getAssociations(filter: AssociationFilter = 'all'): Observable<Association[]> {
    let params = new HttpParams().set('filter_type', filter);
    return this.http.get<any>(`${this.API_BASE}`, { params }).pipe(
      map(response => response.data || response || [])
    );
  }

  /**
   * 创建资源关联
   */
  createAssociation(data: CreateAssociationRequest): Observable<Association> {
    return this.http.post<Association>(`${this.API_BASE}`, data);
  }

  /**
   * 删除资源关联
   */
  deleteAssociation(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API_BASE}/${id}`);
  }
}
