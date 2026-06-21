import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export interface LibrariesStats {
  total?: number;
  tutorials?: number;
  materials?: number;
  hardware?: number;
  questions?: number;
  bySubject?: Record<string, number>;
}

/**
 * 库统计服务
 * 调用后端 /api/v1/libraries/stats 获取资源统计
 */
@Injectable({
  providedIn: 'root',
})
export class LibrariesStatsService {
  private readonly API_BASE = '/api/v1';

  constructor(private http: HttpClient) {}

  /**
   * 获取库统计（教程/课件/硬件/试题 总数）
   * 后端返回: {success, data: {tutorials, materials, hardware, questions, total, bySubject}}
   */
  getStats(): Observable<LibrariesStats> {
    return this.http
      .get<{ success?: boolean; data?: LibrariesStats }>(`${this.API_BASE}/libraries/stats`)
      .pipe(
        map((resp) => resp?.data || {}),
        catchError((err) => {
          console.warn('获取库统计失败:', err);
          // 失败时返回空对象，UI 保持静态 fallback
          return of({} as LibrariesStats);
        })
      );
  }
}
