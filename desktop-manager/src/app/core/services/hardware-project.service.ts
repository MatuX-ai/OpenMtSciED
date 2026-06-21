import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import {
  HardwareCategory,
  HardwareProject,
} from '../../models/hardware-project.models';

/**
 * 硬件项目服务
 * 通过 HTTP 调用后端 Next.js BFF（dev 环境通过 proxy.conf.json 代理）
 */
@Injectable({
  providedIn: 'root',
})
export class HardwareProjectService {
  private readonly API_BASE = '/api/v1';

  constructor(private http: HttpClient) {}

  /**
   * 获取硬件项目列表
   */
  getProjects(params: {
    page?: number;
    size?: number;
    category?: string;
    difficulty?: string;
    keyword?: string;
  } = {}): Observable<{
    items: any[];
    total: number;
    page: number;
    size: number;
    total_pages: number;
  }> {
    const queryParams: any = {
      page: params.page ?? 1,
      size: params.size ?? 20,
    };
    if (params.category) queryParams.category = params.category;
    if (params.difficulty) queryParams.difficulty = params.difficulty;
    if (params.keyword) queryParams.keyword = params.keyword;

    return this.http
      .get<{ items?: any[]; total?: number; page?: number; size?: number; total_pages?: number }>(
        `${this.API_BASE}/hardware-projects`,
        { params: queryParams }
      )
      .pipe(
        map((resp) => ({
          items: resp.items || [],
          total: resp.total || 0,
          page: resp.page || 1,
          size: resp.size || 20,
          total_pages: resp.total_pages || 0,
        })),
        catchError((err) => {
          console.warn('获取硬件项目失败:', err);
          return of({ items: [], total: 0, page: 1, size: 20, total_pages: 0 });
        })
      );
  }

  /** 按 ID 或 project_id 获取单个硬件项目 */
  getProjectById(projectId: string): Observable<HardwareProject | null> {
    return this.getProjects({ size: 100 }).pipe(
      map((resp) => {
        const raw = resp.items.find(
          (item) =>
            String(item.id) === projectId ||
            String(item.project_id) === projectId
        );
        return raw ? this.mapProject(raw) : null;
      })
    );
  }

  private mapProject(raw: any): HardwareProject {
    return {
      id: raw.id,
      project_id: raw.project_id || raw.id?.toString() || '',
      title: raw.title || '',
      subject: raw.subject || '',
      description: raw.description || '',
      category: (raw.category || 'electronics') as HardwareCategory,
      difficulty: this.parseDifficulty(raw.difficulty_level),
      estimated_time_hours: raw.estimated_time_hours || 0,
      total_cost: raw.total_cost ?? 0,
      materials: Array.isArray(raw.materials)
        ? raw.materials
        : Array.isArray(raw.hardware_required)
        ? raw.hardware_required.map((m: any) => ({
            name: typeof m === 'string' ? m : m.name || '',
            quantity: m.quantity || 1,
            unit: m.unit || '个',
            unitPrice: m.unitPrice || m.unit_price || 0,
          }))
        : [],
      code_templates: raw.code_templates || [],
      safety_notes: raw.safety_notes || [],
      knowledge_point_ids: raw.knowledge_point_ids || [],
    } as HardwareProject;
  }

  private parseDifficulty(level: string | number | undefined): number {
    if (typeof level === 'number') return level;
    if (!level) return 3;
    const difficultyMap: Record<string, number> = {
      beginner: 1,
      elementary: 1,
      intermediate: 3,
      medium: 3,
      advanced: 4,
      expert: 5,
    };
    return difficultyMap[level] ?? 3;
  }
}
