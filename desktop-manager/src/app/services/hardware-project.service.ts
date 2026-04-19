/**
 * 硬件项目API服务
 * 
 * 提供与后端硬件项目API的交互功能
 */

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { 
  HardwareProject, 
  HardwareCategory,
  HardwareProjectFilter,
  HardwareProjectStats 
} from '../models/hardware-project.models';

@Injectable({
  providedIn: 'root'
})
export class HardwareProjectService {
  private baseUrl = '/api/v1/hardware/projects';

  constructor(private http: HttpClient) {}

  /**
   * 获取硬件项目列表
   * @param filter 筛选条件
   * @param page 页码
   * @param pageSize 每页数量
   */
  getProjects(
    filter?: HardwareProjectFilter,
    page: number = 1,
    pageSize: number = 20
  ): Observable<{ projects: HardwareProject[], total: number }> {
    let params = new HttpParams()
      .set('limit', pageSize.toString())
      .set('offset', ((page - 1) * pageSize).toString());

    // 添加筛选参数
    if (filter) {
      if (filter.category) {
        params = params.set('category', filter.category);
      }
      if (filter.difficultyRange && filter.difficultyRange[0]) {
        params = params.set('difficulty', filter.difficultyRange[0].toString());
      }
      if (filter.maxBudget) {
        params = params.set('max_cost', filter.maxBudget.toString());
      }
      if (filter.keyword) {
        params = params.set('search', filter.keyword);
      }
    }

    return this.http.get<HardwareProject[]>(this.baseUrl, { params }).pipe(
      map((projects: HardwareProject[]) => ({
        projects,
        total: projects.length // 实际应用中应从分页响应中获取总数
      }))
    );
  }

  /**
   * 获取单个硬件项目详情
   * @param projectId 项目ID
   */
  getProject(projectId: string): Observable<HardwareProject> {
    return this.http.get<HardwareProject>(`${this.baseUrl}/${projectId}`);
  }

  /**
   * 创建新的硬件项目
   * @param projectData 项目数据
   */
  createProject(projectData: any): Observable<HardwareProject> {
    return this.http.post<HardwareProject>(this.baseUrl, projectData);
  }

  /**
   * 更新硬件项目
   * @param projectId 项目ID
   * @param projectData 更新数据
   */
  updateProject(projectId: string, projectData: any): Observable<HardwareProject> {
    return this.http.put<HardwareProject>(`${this.baseUrl}/${projectId}`, projectData);
  }

  /**
   * 删除硬件项目
   * @param projectId 项目ID
   */
  deleteProject(projectId: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.baseUrl}/${projectId}`);
  }

  /**
   * 获取所有项目分类
   */
  getCategories(): Observable<string[]> {
    return this.http.get<string[]>(`${this.baseUrl}/categories`);
  }

  /**
   * 获取项目统计信息
   */
  getStatistics(): Observable<HardwareProjectStats> {
    return this.http.get<HardwareProjectStats>(`${this.baseUrl}/stats/summary`);
  }

  /**
   * 根据分类获取项目
   * @param category 分类
   * @param limit 限制数量
   */
  getProjectsByCategory(category: HardwareCategory, limit: number = 10): Observable<HardwareProject[]> {
    const params = new HttpParams()
      .set('category', category)
      .set('limit', limit.toString());
    
    return this.http.get<HardwareProject[]>(this.baseUrl, { params });
  }

  /**
   * 搜索硬件项目
   * @param keyword 搜索关键词
   * @param limit 限制数量
   */
  searchProjects(keyword: string, limit: number = 10): Observable<HardwareProject[]> {
    const params = new HttpParams()
      .set('search', keyword)
      .set('limit', limit.toString());
    
    return this.http.get<HardwareProject[]>(this.baseUrl, { params });
  }
}