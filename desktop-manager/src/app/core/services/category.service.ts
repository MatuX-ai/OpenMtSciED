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

  async getCategories(): Promise<Category[]> {
    return this.tauriService.invokeCommand<Category[]>('get_categories');
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
