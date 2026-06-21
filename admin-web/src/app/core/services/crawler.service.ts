import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

/** 爬虫任务实体 */
export interface CrawlerTask {
  id: string;
  name: string;
  description: string;
  status: 'idle' | 'running' | 'completed' | 'failed';
  progress: number;
  total_items: number;
  scraped_items: number;
  last_run: string | null;
  next_scheduled: string | null;
  error_message: string | null;
}

/** 爬虫统计信息 */
export interface CrawlerStats {
  totalCrawlers: number;
  activeCrawlers: number;
  totalItemsScraped: number;
  lastRunTime: string | null;
}

/** 爬虫执行历史 */
export interface ExecutionRecord {
  crawlerName: string;
  startTime: string;
  endTime: string | null;
  status: 'success' | 'failed' | 'running';
  itemsScraped: number;
  duration: number;
}

/** 爬虫错误日志 */
export interface ErrorLog {
  crawlerName: string;
  timestamp: string;
  message: string;
  details?: string;
}

/** 新建爬虫请求体 */
export interface CreateCrawlerRequest {
  name: string;
  url: string;
  type: string;
  description?: string;
}

/**
 * 爬虫管理服务
 * 集中封装所有爬虫相关 API 调用，避免组件直接使用 HttpClient
 */
@Injectable({
  providedIn: 'root',
})
export class CrawlerService {
  private http = inject(HttpClient);

  private readonly API_BASE = '/api/v1/admin/crawler';

  /**
   * 获取爬虫任务列表
   */
  getCrawlerTasks(): Observable<CrawlerTask[]> {
    return this.http.get<any>(`${this.API_BASE}`).pipe(
      map(response => response.data || response || [])
    );
  }

  /**
   * 创建新的爬虫任务
   */
  createCrawler(data: CreateCrawlerRequest): Observable<CrawlerTask> {
    return this.http.post<CrawlerTask>(`${this.API_BASE}`, data);
  }

  /**
   * 删除爬虫任务
   */
  deleteCrawler(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API_BASE}/${id}`);
  }

  /**
   * 启动爬虫
   */
  runCrawler(id: string): Observable<void> {
    return this.http.post<void>(`${this.API_BASE}/${id}/run`, {});
  }

  /**
   * 设置爬虫定时任务
   * @param id 爬虫 ID
   * @param intervalHours 间隔小时数
   */
  setSchedule(id: string, intervalHours: number): Observable<void> {
    const params = new HttpParams().set('interval_hours', intervalHours.toString());
    return this.http.post<void>(`${this.API_BASE}/${id}/schedule`, {}, { params });
  }
}
