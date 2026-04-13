import { Injectable } from '@angular/core';

import { ApiConfig, ApiTestResult } from '../models/api-config.model';

// Tauri 命令参数类型
interface CourseData {
  name: string;
  description: string;
  category: string;
}

interface UpdateCourseData extends CourseData {
  id: number;
}

interface MaterialData {
  name: string;
  file_path: string;
  file_size: number;
  course_id: number;
}

interface DeleteData {
  id: number;
}

interface GetMaterialsData {
  course_id: number;
}

interface GetFolderSizeData {
  path: string;
}

// Tauri 命令返回类型
export interface StorageInfo {
  data_path: string;
  database_path: string;
  materials_path: string;
  total_space: number;
  free_space: number;
  used_space: number;
  material_count: number;
  estimated_growth: string;
}

// API 配置相关接口（与 Rust 后端交互）
export interface SaveApiConfigRequest {
  provider: string;
  api_key?: string;
  api_url?: string;
  model?: string;
}

export interface TestApiConnectionRequest {
  provider: string;
  api_key?: string;
  api_url?: string;
  model?: string;
}

declare global {
  interface Window {
    __TAURI__?: {
      core: {
        invoke: <T>(command: string, args?: unknown) => Promise<T>;
      };
    };
  }
}

@Injectable({
  providedIn: 'root',
})
export class TauriService {
  private isTauri(): boolean {
    return typeof window.__TAURI__ !== 'undefined';
  }

  async invokeCommand<T>(command: string, args?: unknown): Promise<T> {
    if (!this.isTauri()) {
      console.warn('Not running in Tauri environment');
      return Promise.resolve({} as T);
    }

    try {
      if (!window.__TAURI__) {
        throw new Error('Tauri is not available');
      }
      return await window.__TAURI__.core.invoke<T>(command, args);
    } catch (error) {
      console.error(`Tauri command ${command} failed:`, error);
      throw error;
    }
  }

  // 课程管理
  async getCourses(): Promise<unknown[]> {
    return this.invokeCommand<unknown[]>('get_courses');
  }

  async createCourse(name: string, description: string, category: string): Promise<unknown> {
    const data: CourseData = { name, description, category };
    return this.invokeCommand<unknown>('create_course', data);
  }

  async updateCourse(
    id: number,
    name: string,
    description: string,
    category: string
  ): Promise<unknown> {
    const data: UpdateCourseData = { id, name, description, category };
    return this.invokeCommand<unknown>('update_course', data);
  }

  async deleteCourse(id: number): Promise<void> {
    const data: DeleteData = { id };
    return this.invokeCommand<void>('delete_course', data);
  }

  // 课件管理
  async getMaterials(courseId: number): Promise<unknown[]> {
    const data: GetMaterialsData = { course_id: courseId };
    return this.invokeCommand<unknown[]>('get_materials', data);
  }

  async uploadMaterial(
    name: string,
    filePath: string,
    fileSize: number,
    courseId: number
  ): Promise<unknown> {
    const data: MaterialData = {
      name,
      file_path: filePath,
      file_size: fileSize,
      course_id: courseId,
    };
    return this.invokeCommand<unknown>('upload_material', data);
  }

  async deleteMaterial(id: number): Promise<void> {
    const data: DeleteData = { id };
    return this.invokeCommand<void>('delete_material', data);
  }

  // 存储管理
  async getStorageInfo(): Promise<StorageInfo> {
    return this.invokeCommand<StorageInfo>('get_storage_info');
  }

  async getFolderSize(path: string): Promise<number> {
    const data: GetFolderSizeData = { path };
    return this.invokeCommand<number>('get_folder_size', data);
  }

  // API 配置管理
  async saveApiConfig(config: SaveApiConfigRequest): Promise<void> {
    return this.invokeCommand<void>('save_api_config', config);
  }

  async getApiConfig(): Promise<ApiConfig | null> {
    return this.invokeCommand<ApiConfig | null>('get_api_config');
  }

  async testApiConnection(config: TestApiConnectionRequest): Promise<ApiTestResult> {
    return this.invokeCommand<ApiTestResult>('test_api_connection', config);
  }

  async deleteApiConfig(): Promise<void> {
    return this.invokeCommand<void>('delete_api_config');
  }

  // 工具功能
  async openUrl(url: string): Promise<void> {
    return this.invokeCommand<void>('open_url', { url });
  }

  // 开源资源管理
  async importResourcesFromJson(): Promise<number> {
    return this.invokeCommand<number>('import_resources_from_json');
  }

  async browseOpenResources(query: {
    source?: string;
    subject?: string;
    level?: string;
    keyword?: string;
    page: number;
    page_size: number;
  }): Promise<unknown> {
    return this.invokeCommand<unknown>('browse_open_resources', query);
  }

  async getResourceDetail(resourceId: string): Promise<unknown> {
    return this.invokeCommand<unknown>('get_resource_detail', { resource_id: resourceId });
  }

  async downloadOpenResource(resourceId: string, saveDir: string): Promise<string> {
    return this.invokeCommand<string>('download_open_resource', {
      resource_id: resourceId,
      save_dir: saveDir,
    });
  }

  async getLocalResources(): Promise<unknown[]> {
    return this.invokeCommand<unknown[]>('get_local_resources');
  }

  async getResourceTags(resourceId: string): Promise<string[]> {
    return this.invokeCommand<string[]>('get_resource_tags', { resource_id: resourceId });
  }

  async browseResourcesByTag(tag: string, page: number, pageSize: number): Promise<unknown> {
    return this.invokeCommand<unknown>('browse_resources_by_tag', {
      tag,
      page,
      page_size: pageSize,
    });
  }
}
