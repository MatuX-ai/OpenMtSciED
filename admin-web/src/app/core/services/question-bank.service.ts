import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

/** 题库实体 */
export interface QuestionBank {
  id: number;
  name: string;
  description?: string;
  source?: string;
  subject?: string;
  level?: string;
  total_questions: number;
}

/** 新建题库请求体（部分字段可选） */
export type CreateQuestionBankRequest = Partial<QuestionBank>;

/** 更新题库请求体 */
export type UpdateQuestionBankRequest = Partial<QuestionBank>;

/**
 * 题库管理服务
 * 集中封装题库相关 API 调用，避免组件直接使用 HttpClient
 */
@Injectable({
  providedIn: 'root',
})
export class QuestionBankService {
  private http = inject(HttpClient);

  private readonly API_BASE = '/api/v1/questions/banks';

  /**
   * 获取题库列表
   */
  getBanks(): Observable<QuestionBank[]> {
    return this.http.get<any>(`${this.API_BASE}`).pipe(
      map(response => (response.data || []) as QuestionBank[])
    );
  }

  /**
   * 创建题库
   * @param data 题库数据
   */
  createBank(data: CreateQuestionBankRequest): Observable<QuestionBank> {
    return this.http.post<any>(`${this.API_BASE}`, data).pipe(
      map(response => (response.data || response) as QuestionBank)
    );
  }

  /**
   * 更新题库
   * @param id 题库 ID
   * @param data 更新数据
   */
  updateBank(id: number, data: UpdateQuestionBankRequest): Observable<QuestionBank> {
    return this.http.put<any>(`${this.API_BASE}/${id}`, data).pipe(
      map(response => (response.data || response) as QuestionBank)
    );
  }

  /**
   * 删除题库
   * @param id 题库 ID
   */
  deleteBank(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_BASE}/${id}`);
  }
}
