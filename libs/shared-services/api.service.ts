/**
 * 通用API服务
 * 封装HTTP请求，提供统一的API调用接口
 */

import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  total?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = 'http://localhost:8000/api/v1';

  constructor(private http: HttpClient) {}

  /**
   * GET请求
   */
  async get<T>(endpoint: string, params?: any): Promise<ApiResponse<T>> {
    try {
      let httpParams = new HttpParams();
      if (params) {
        Object.keys(params).forEach(key => {
          if (params[key] !== undefined && params[key] !== null) {
            httpParams = httpParams.set(key, params[key]);
          }
        });
      }

      const response = await firstValueFrom(
        this.http.get<ApiResponse<T>>(`${this.baseUrl}${endpoint}`, { params: httpParams })
      );
      return response;
    } catch (error) {
      console.error(`GET ${endpoint} failed:`, error);
      throw error;
    }
  }

  /**
   * POST请求
   */
  async post<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    try {
      const response = await firstValueFrom(
        this.http.post<ApiResponse<T>>(`${this.baseUrl}${endpoint}`, body)
      );
      return response;
    } catch (error) {
      console.error(`POST ${endpoint} failed:`, error);
      throw error;
    }
  }

  /**
   * PUT请求
   */
  async put<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    try {
      const response = await firstValueFrom(
        this.http.put<ApiResponse<T>>(`${this.baseUrl}${endpoint}`, body)
      );
      return response;
    } catch (error) {
      console.error(`PUT ${endpoint} failed:`, error);
      throw error;
    }
  }

  /**
   * DELETE请求
   */
  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    try {
      const response = await firstValueFrom(
        this.http.delete<ApiResponse<T>>(`${this.baseUrl}${endpoint}`)
      );
      return response;
    } catch (error) {
      console.error(`DELETE ${endpoint} failed:`, error);
      throw error;
    }
  }
}
