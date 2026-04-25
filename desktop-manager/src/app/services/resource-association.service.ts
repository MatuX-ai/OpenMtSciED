/**
 * 资源关联服务
 * 提供教程、课件、硬件之间的关联查询功能
 */

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, shareReplay, tap } from 'rxjs/operators';

import {
  RelatedMaterial,
  RequiredHardware,
  LearningPath,
  SearchResult,
  ResourceSummary,
  ApiResponse
} from '../models/resource-association.models';

@Injectable({
  providedIn: 'root'
})
export class ResourceAssociationService {
  private baseUrl = '/api/v1/resources';
  
  // 缓存
  private cache = new Map<string, any>();
  private cacheTimeout = 5 * 60 * 1000; // 5分钟缓存
  
  constructor(private http: HttpClient) {}

  /**
   * 获取教程相关的课件列表
   * @param tutorialId 教程ID
   * @param subject 学科过滤（可选）
   */
  getRelatedMaterials(
    tutorialId: string, 
    subject?: string
  ): Observable<ApiResponse<RelatedMaterial[]>> {
    const cacheKey = `materials_${tutorialId}_${subject || ''}`;
    
    // 检查缓存
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        return of(cached.data);
      }
    }

    let params = new HttpParams();
    if (subject) {
      params = params.set('subject', subject);
    }

    return this.http.get<ApiResponse<RelatedMaterial[]>>(
      `${this.baseUrl}/tutorials/${tutorialId}/related-materials`,
      { params }
    ).pipe(
      tap(response => {
        // 缓存结果
        this.cache.set(cacheKey, {
          data: response,
          timestamp: Date.now()
        });
      }),
      catchError(error => {
        console.error('获取相关课件失败:', error);
        return of({ success: false, data: [], total: 0 });
      }),
      shareReplay(1)
    );
  }

  /**
   * 获取课件所需的硬件项目列表
   * @param materialId 课件ID
   * @param subject 学科过滤（可选）
   */
  getRequiredHardware(
    materialId: string,
    subject?: string
  ): Observable<ApiResponse<RequiredHardware[]>> {
    const cacheKey = `hardware_${materialId}_${subject || ''}`;
    
    // 检查缓存
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        return of(cached.data);
      }
    }

    let params = new HttpParams();
    if (subject) {
      params = params.set('subject', subject);
    }

    return this.http.get<ApiResponse<RequiredHardware[]>>(
      `${this.baseUrl}/materials/${materialId}/required-hardware`,
      { params }
    ).pipe(
      tap(response => {
        // 缓存结果
        this.cache.set(cacheKey, {
          data: response,
          timestamp: Date.now()
        });
      }),
      catchError(error => {
        console.error('获取所需硬件失败:', error);
        return of({ success: false, data: [], total: 0 });
      }),
      shareReplay(1)
    );
  }

  /**
   * 获取完整的学习路径（教程 -> 课件 -> 硬件）
   * @param tutorialId 教程ID
   */
  getLearningPath(tutorialId: string): Observable<ApiResponse<LearningPath>> {
    const cacheKey = `path_${tutorialId}`;
    
    // 检查缓存
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        return of(cached.data);
      }
    }

    return this.http.get<ApiResponse<LearningPath>>(
      `${this.baseUrl}/learning-path/${tutorialId}`
    ).pipe(
      tap(response => {
        // 缓存结果
        this.cache.set(cacheKey, {
          data: response,
          timestamp: Date.now()
        });
      }),
      catchError(error => {
        console.error('获取学习路径失败:', error);
        return of({ 
          success: false, 
          data: { tutorial: null, related_materials: [], required_hardware: [] }
        });
      }),
      shareReplay(1)
    );
  }

  /**
   * 根据关键词搜索相关资源
   * @param keyword 搜索关键词
   */
  searchResources(keyword: string): Observable<ApiResponse<SearchResult>> {
    if (!keyword || keyword.trim().length === 0) {
      return of({ success: false, data: { tutorials: [], materials: [], hardware_projects: [] } });
    }

    const cacheKey = `search_${keyword}`;
    
    // 检查缓存
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        return of(cached.data);
      }
    }

    const params = new HttpParams().set('keyword', keyword);

    return this.http.get<ApiResponse<SearchResult>>(
      `${this.baseUrl}/search-resources`,
      { params }
    ).pipe(
      tap(response => {
        // 缓存结果
        this.cache.set(cacheKey, {
          data: response,
          timestamp: Date.now()
        });
      }),
      catchError(error => {
        console.error('搜索资源失败:', error);
        return of({ 
          success: false, 
          data: { tutorials: [], materials: [], hardware_projects: [] }
        });
      }),
      shareReplay(1)
    );
  }

  /**
   * 获取资源概览统计
   */
  getResourceSummary(): Observable<ApiResponse<ResourceSummary>> {
    const cacheKey = 'summary';
    
    // 检查缓存
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        return of(cached.data);
      }
    }

    return this.http.get<ApiResponse<ResourceSummary>>(
      `${this.baseUrl}/resources/summary`
    ).pipe(
      tap(response => {
        // 缓存结果
        this.cache.set(cacheKey, {
          data: response,
          timestamp: Date.now()
        });
      }),
      catchError(error => {
        console.error('获取资源概览失败:', error);
        return of({ 
          success: false, 
          data: {
            total_tutorials: 0,
            total_materials: 0,
            total_hardware: 0,
            subject_distribution: {}
          }
        });
      }),
      shareReplay(1)
    );
  }

  /**
   * 获取硬件项目相关的教程和课件（反向关联）
   * @param hardwareId 硬件项目ID
   * @param subject 学科过滤（可选）
   */
  getHardwareRelatedResources(
    hardwareId: string,
    subject?: string
  ): Observable<ApiResponse<{ related_tutorials: any[], related_materials: RelatedMaterial[] }>> {
    const cacheKey = `hardware_resources_${hardwareId}_${subject || ''}`;
    
    // 检查缓存
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        return of(cached.data);
      }
    }

    let params = new HttpParams();
    if (subject) {
      params = params.set('subject', subject);
    }

    return this.http.get<ApiResponse<{ related_tutorials: any[], related_materials: RelatedMaterial[] }>>(
      `${this.baseUrl}/hardware/${hardwareId}/related-resources`,
      { params }
    ).pipe(
      tap(response => {
        // 缓存结果
        this.cache.set(cacheKey, {
          data: response,
          timestamp: Date.now()
        });
      }),
      catchError(error => {
        console.error('获取硬件相关资源失败:', error);
        return of({ 
          success: false, 
          data: { related_tutorials: [], related_materials: [] }
        });
      }),
      shareReplay(1)
    );
  }

  /**
   * 清除缓存
   * @param key 缓存键（可选，不传则清除所有）
   */
  clearCache(key?: string): void {
    if (key) {
      this.cache.delete(key);
    } else {
      this.cache.clear();
    }
  }

  /**
   * 计算硬件总成本
   * @param materials 材料列表
   */
  calculateTotalCost(materials: any[]): number {
    if (!materials || materials.length === 0) {
      return 0;
    }
    
    return materials.reduce((total, item) => {
      return total + (item.unitPrice * item.quantity);
    }, 0);
  }

  /**
   * 格式化成本显示
   * @param cost 成本
   */
  formatCost(cost: number): string {
    return `¥${cost.toFixed(2)}`;
  }

  /**
   * 获取难度星级显示
   * @param difficulty 难度等级 (1-5)
   */
  getDifficultyStars(difficulty: number): string {
    const stars = '★'.repeat(difficulty);
    const emptyStars = '☆'.repeat(5 - difficulty);
    return stars + emptyStars;
  }

  /**
   * 根据学科获取颜色
   * @param subject 学科名称
   */
  getSubjectColor(subject: string): string {
    const colorMap: { [key: string]: string } = {
      '物理': '#3b82f6',
      '化学': '#10b981',
      '生物': '#f59e0b',
      '数学': '#ef4444',
      '工程': '#8b5cf6',
      '计算机': '#06b6d4',
      '地球科学': '#ec4899'
    };
    
    return colorMap[subject] || '#6366f1';
  }
}
