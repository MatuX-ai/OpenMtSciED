import { Injectable } from '@angular/core';
import { TauriService } from './tauri.service';

export interface Category {
  id: number;
  name: string;
  description?: string;
  color: string;
  icon: string;
  sort_order: number;
  created_at: string;
}

export interface CreateCategoryRequest {
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  sort_order?: number;
}

export interface UpdateCategoryRequest {
  id: number;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  sort_order?: number;
}

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  constructor(private tauriService: TauriService) {}

  // 默认分类数据（浏览器开发环境后备）
  // 注：避开K12标准学科课程，专注于非学科教育的STEM方向
  private defaultCategories: Category[] = [
    { id: 1, name: '编程开发', description: '编程语言、算法、软件项目开发', color: '#3b82f6', icon: 'code', sort_order: 1, created_at: new Date().toISOString() },
    { id: 2, name: '机器人', description: '机器人制作、编程与控制', color: '#10b981', icon: 'robot', sort_order: 2, created_at: new Date().toISOString() },
    { id: 3, name: '电子制作', description: '电路设计、电子元器件应用', color: '#f59e0b', icon: 'chip', sort_order: 3, created_at: new Date().toISOString() },
    { id: 4, name: '人工智能', description: '机器学习、计算机视觉、自然语言处理', color: '#ef4444', icon: 'brain', sort_order: 4, created_at: new Date().toISOString() },
    { id: 5, name: '物联网', description: '智能设备、传感器网络、云平台', color: '#8b5cf6', icon: 'wifi', sort_order: 5, created_at: new Date().toISOString() },
    { id: 6, name: '3D打印', description: '三维建模、3D打印技术', color: '#ec4899', icon: 'cube', sort_order: 6, created_at: new Date().toISOString() },
    { id: 7, name: '创客项目', description: 'DIY制作、创意实现', color: '#06b6d4', icon: 'tools', sort_order: 7, created_at: new Date().toISOString() },
    { id: 8, name: '科学探索', description: '趣味科学实验与探索活动', color: '#f97316', icon: 'flask', sort_order: 8, created_at: new Date().toISOString() },
  ];

  async getCategories(): Promise<Category[]> {
    try {
      const categories = await this.tauriService.invokeCommand<Category[]>('get_categories');
      // 如果返回空数组或无效数据，使用默认分类
      if (!categories || categories.length === 0) {
        return this.defaultCategories;
      }
      return categories;
    } catch (error) {
      console.warn('获取分类失败，使用默认分类:', error);
      return this.defaultCategories;
    }
  }

  async createCategory(request: CreateCategoryRequest): Promise<Category> {
    return this.tauriService.invokeCommand<Category>('create_category', request);
  }

  async updateCategory(request: UpdateCategoryRequest): Promise<Category> {
    return this.tauriService.invokeCommand<Category>('update_category', request);
  }

  async deleteCategory(id: number): Promise<void> {
    return this.tauriService.invokeCommand<void>('delete_category', id);
  }
}
