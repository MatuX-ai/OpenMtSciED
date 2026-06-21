import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

/** 平台状态实体 */
export interface PlatformStatus {
  id: string;
  platform_name: string;
  source: string;
  target_url: string;
  type: string;
  output_file: string;
  status: string;
  last_run: string | null;
  total_items: number;
  error_message: string | null;
}

/** 平台信息（含调度配置） */
export interface PlatformInfo {
  name: string;
  schedule_config: {
    interval: string;
    day: string;
    time: string;
  };
}

/** 生成平台请求体 */
export interface GeneratePlatformRequest {
  platform_name?: string;
}

/**
 * 教育平台管理服务
 * 集中封装教育平台数据生成与状态查询相关 API 调用，避免组件直接使用 HttpClient
 */
@Injectable({
  providedIn: 'root',
})
export class EducationPlatformsService {
  private http = inject(HttpClient);

  private readonly API_ADMIN = '/api/v1/admin/education-platforms';
  private readonly API_GENERATE = '/api/v1/education-platforms/generate';

  /**
   * 获取所有已注册平台的状态
   */
  getPlatforms(): Observable<PlatformStatus[]> {
    return this.http.get<any>(`${this.API_ADMIN}`).pipe(
      map(response => (response.data || []) as PlatformStatus[])
    );
  }

  /**
   * 触发生成所有平台数据
   */
  generateAllPlatforms(): Observable<void> {
    return this.http.post<void>(`${this.API_GENERATE}`, {});
  }

  /**
   * 触发生成单个平台数据
   * @param platformName 平台名称
   */
  generatePlatform(platformName: string): Observable<void> {
    const body: GeneratePlatformRequest = { platform_name: platformName };
    return this.http.post<void>(`${this.API_GENERATE}`, body);
  }
}
