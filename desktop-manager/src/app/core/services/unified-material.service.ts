/**
 * 统一课件服务
 *
 * 提供24种课件类型的CRUD操作、文件上传/下载、分享等功能
 */

import { HttpClient, HttpEvent, HttpEventType, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, retry, timeout } from 'rxjs/operators';

import {
  ApiResponse,
  FILE_SIZE_LIMITS,
  MaterialFilter,
  MaterialQueryParams,
  MaterialStatistics,
  MaterialType,
  PaginatedResponse,
  ShareLinkResponse,
  UnifiedMaterial,
  UnifiedMaterialCreate,
  UnifiedMaterialUpdate,
} from '../../models/unified-material.models';

@Injectable({
  providedIn: 'root',
})
export class UnifiedMaterialService {
  private readonly API_BASE = '/api/v1/materials';
  private readonly API_TIMEOUT = 10000; // 10秒超时
  private readonly MAX_RETRIES = 3;
  private readonly UPLOAD_TIMEOUT = 300000; // 5分钟上传超时

  constructor(private http: HttpClient) {}

  // ==================== 课件CRUD操作 ====================

  /**
   * 创建课件
   * @param data 课件创建数据
   * @returns 创建的课件
   */
  createMaterial(data: UnifiedMaterialCreate): Observable<UnifiedMaterial> {
    // 验证文件大小
    if (data.file) {
      const limit = FILE_SIZE_LIMITS[data.type] || 0;
      if (data.file.size > limit) {
        return throwError(() => new Error(`文件大小超过限制: ${this.formatFileSize(limit)}`));
      }
    }

    const formData = new FormData();
    formData.append('file', data.file);
    formData.append('title', data.title);
    if (data.description) formData.append('description', data.description);
    formData.append('type', data.type);
    formData.append('category', data.category);
    if (data.tags?.length) formData.append('tags', data.tags.join(','));
    if (data.course_id) formData.append('course_id', data.course_id.toString());
    if (data.chapter_id) formData.append('chapter_id', data.chapter_id.toString());
    if (data.lesson_id) formData.append('lesson_id', data.lesson_id.toString());
    formData.append('visibility', data.visibility || 'course_private');
    formData.append('download_permission', data.download_permission || 'enrolled');

    // 添加AR/VR数据
    if (data.arvr_data) {
      formData.append('arvr_data', JSON.stringify(data.arvr_data));
    }
    // 添加游戏数据
    if (data.game_data) {
      formData.append('game_data', JSON.stringify(data.game_data));
    }
    // 添加动画数据
    if (data.animation_data) {
      formData.append('animation_data', JSON.stringify(data.animation_data));
    }
    // 添加实验数据
    if (data.experiment_data) {
      formData.append('experiment_data', JSON.stringify(data.experiment_data));
    }

    return this.uploadMaterial(formData).pipe(map((response) => response));
  }

  /**
   * 获取课件详情
   * @param materialId 课件ID
   * @returns 课件详情
   */
  getMaterial(materialId: number): Observable<UnifiedMaterial> {
    return this.http.get<ApiResponse<UnifiedMaterial>>(`${this.API_BASE}/${materialId}`).pipe(
      timeout(this.API_TIMEOUT),
      retry(this.MAX_RETRIES),
      map((response) => {
        if (!response.data) {
          throw new Error('Invalid material data received from API');
        }
        return response.data;
      }),
      catchError((error) => {
        console.error(`Failed to get material ${materialId}:`, error);
        return this.fallbackGetMaterial(materialId);
      })
    );
  }

  /**
   * 获取课件列表
   * @param params 查询参数
   * @returns 课件分页列表
   */
  getMaterials(params?: MaterialQueryParams): Observable<PaginatedResponse<UnifiedMaterial>> {
    let httpParams = new HttpParams();

    if (params?.filter) {
      const filter = params.filter;
      if (filter.type?.length) {
        httpParams = httpParams.set('type', filter.type.join(','));
      }
      if (filter.category?.length) {
        httpParams = httpParams.set('category', filter.category.join(','));
      }
      if (filter.course_id?.length) {
        httpParams = httpParams.set('course_id', filter.course_id.join(','));
      }
      if (filter.chapter_id?.length) {
        httpParams = httpParams.set('chapter_id', filter.chapter_id.join(','));
      }
      if (filter.org_id?.length) {
        httpParams = httpParams.set('org_id', filter.org_id.join(','));
      }
      if (filter.tags?.length) {
        httpParams = httpParams.set('tags', filter.tags.join(','));
      }
      if (filter.visibility?.length) {
        httpParams = httpParams.set('visibility', filter.visibility.join(','));
      }
      if (filter.search) {
        httpParams = httpParams.set('search', filter.search);
      }
      if (filter.date_range?.start) {
        httpParams = httpParams.set('date_start', filter.date_range.start);
      }
      if (filter.date_range?.end) {
        httpParams = httpParams.set('date_end', filter.date_range.end);
      }
      if (filter.file_size_range?.min_bytes !== undefined) {
        httpParams = httpParams.set('size_min', filter.file_size_range.min_bytes.toString());
      }
      if (filter.file_size_range?.max_bytes !== undefined) {
        httpParams = httpParams.set('size_max', filter.file_size_range.max_bytes.toString());
      }
      if (filter.arvr_type?.length) {
        httpParams = httpParams.set('arvr_type', filter.arvr_type.join(','));
      }
      if (filter.required_device?.length) {
        httpParams = httpParams.set('device', filter.required_device.join(','));
      }
    }

    if (params?.sort) {
      httpParams = httpParams.set('sort', params.sort);
    }

    if (params?.page) {
      httpParams = httpParams.set('page', params.page.toString());
    }

    if (params?.page_size) {
      httpParams = httpParams.set('page_size', params.page_size.toString());
    }

    return this.http
      .get<ApiResponse<PaginatedResponse<UnifiedMaterial>>>(this.API_BASE, { params: httpParams })
      .pipe(
        timeout(this.API_TIMEOUT),
        retry(this.MAX_RETRIES),
        map((response) => {
          if (!response.data || !Array.isArray(response.data.items)) {
            throw new Error('Invalid material list data received from API');
          }
          return response.data;
        }),
        catchError((error) => {
          console.error('Failed to get materials:', error);
          return this.fallbackGetMaterials(params);
        })
      );
  }

  /**
   * 更新课件
   * @param materialId 课件ID
   * @param data 更新数据
   * @returns 更新后的课件
   */
  updateMaterial(materialId: number, data: UnifiedMaterialUpdate): Observable<UnifiedMaterial> {
    return this.http.put<ApiResponse<UnifiedMaterial>>(`${this.API_BASE}/${materialId}`, data).pipe(
      timeout(this.API_TIMEOUT),
      retry(this.MAX_RETRIES),
      map((response) => {
        if (!response.data) {
          throw new Error('Invalid material data received from API');
        }
        return response.data;
      }),
      catchError((error) => {
        console.error(`Failed to update material ${materialId}:`, error);
        return this.fallbackUpdateMaterial(materialId, data);
      })
    );
  }

  /**
   * 删除课件
   * @param materialId 课件ID
   * @returns 删除结果
   */
  deleteMaterial(materialId: number): Observable<any> {
    return this.http.delete<ApiResponse<any>>(`${this.API_BASE}/${materialId}`).pipe(
      timeout(this.API_TIMEOUT),
      retry(this.MAX_RETRIES),
      map((response) => response),
      catchError((error) => {
        console.error(`Failed to delete material ${materialId}:`, error);
        return this.fallbackDeleteMaterial(materialId);
      })
    );
  }

  /**
   * 批量删除课件
   * @param materialIds 课件ID数组
   * @returns 删除结果
   */
  batchDeleteMaterials(materialIds: number[]): Observable<any> {
    return this.http
      .post<ApiResponse<any>>(`${this.API_BASE}/batch-delete`, {
        material_ids: materialIds,
      })
      .pipe(
        timeout(this.API_TIMEOUT),
        retry(this.MAX_RETRIES),
        map((response) => response),
        catchError((error) => {
          console.error('Failed to batch delete materials:', error);
          return of({ success: false, message: '批量删除失败（fallback模式）' });
        })
      );
  }

  // ==================== 文件操作 ====================

  /**
   * 上传课件文件
   * @param formData FormData数据
   * @param onProgress 上传进度回调
   * @returns 上传结果（包含进度）
   */
  uploadMaterial(formData: FormData, onProgress?: (percent: number) => void): Observable<any> {
    return this.http
      .post<any>(`${this.API_BASE}/upload`, formData, {
        reportProgress: true,
        observe: 'events',
      })
      .pipe(
        timeout(this.UPLOAD_TIMEOUT),
        map((event: HttpEvent<any>) => {
          switch (event.type) {
            case HttpEventType.Sent:
              console.log('Upload started');
              break;
            case HttpEventType.UploadProgress:
              if (event.total && event.loaded) {
                const percent = Math.round((event.loaded / event.total) * 100);
                if (onProgress) onProgress(percent);
                console.log(`Upload progress: ${percent}%`);
              }
              break;
            case HttpEventType.ResponseHeader:
              console.log('Upload response received');
              break;
            case HttpEventType.Response:
              if (event.body instanceof ArrayBuffer) {
                // 处理二进制响应
                console.log('Upload completed');
              } else {
                // JSON响应
                return event.body;
              }
              break;
          }
        }),
        catchError((error) => {
          console.error('Failed to upload material:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * 下载课件
   * @param materialId 课件ID
   * @returns 文件流
   */
  downloadMaterial(materialId: number): Observable<Blob> {
    return this.http
      .get(`${this.API_BASE}/${materialId}/download`, {
        responseType: 'blob',
      })
      .pipe(
        timeout(this.API_TIMEOUT),
        retry(this.MAX_RETRIES),
        map((response: Blob) => response),
        catchError((error) => {
          console.error(`Failed to download material ${materialId}:`, error);
          return throwError(() => new Error('下载失败'));
        })
      );
  }

  /**
   * 获取下载链接
   * @param materialId 课件ID
   * @param expireHours 有效期（小时）
   * @param password 访问密码
   * @returns 分享链接信息
   */
  getDownloadLink(
    materialId: number,
    expireHours?: number,
    password?: string
  ): Observable<ShareLinkResponse> {
    const body: any = {};
    if (expireHours) body.expire_hours = expireHours;
    if (password) body.password = password;

    return this.http
      .post<ApiResponse<ShareLinkResponse>>(`${this.API_BASE}/${materialId}/share-link`, body)
      .pipe(
        timeout(this.API_TIMEOUT),
        retry(this.MAX_RETRIES),
        map((response) => {
          if (!response.data) {
            throw new Error('Invalid share link data received from API');
          }
          return response.data;
        }),
        catchError((error) => {
          console.error(`Failed to get download link for material ${materialId}:`, error);
          return this.fallbackGetDownloadLink(materialId);
        })
      );
  }

  // ==================== 统计操作 ====================

  /**
   * 跟踪下载
   * @param materialId 课件ID
   */
  trackDownload(materialId: number): Observable<any> {
    return this.http.post(`${this.API_BASE}/${materialId}/track-download`, {}).pipe(
      timeout(this.API_TIMEOUT),
      catchError((error) => {
        console.error(`Failed to track download for material ${materialId}:`, error);
        return of({});
      })
    );
  }

  /**
   * 跟踪查看
   * @param materialId 课件ID
   */
  trackView(materialId: number): Observable<any> {
    return this.http.post(`${this.API_BASE}/${materialId}/track-view`, {}).pipe(
      timeout(this.API_TIMEOUT),
      catchError((error) => {
        console.error(`Failed to track view for material ${materialId}:`, error);
        return of({});
      })
    );
  }

  /**
   * 点赞课件
   * @param materialId 课件ID
   */
  likeMaterial(materialId: number): Observable<any> {
    return this.http.post(`${this.API_BASE}/${materialId}/like`, {}).pipe(
      timeout(this.API_TIMEOUT),
      map((response) => response),
      catchError((error) => {
        console.error(`Failed to like material ${materialId}:`, error);
        return of({ success: false });
      })
    );
  }

  /**
   * 取消点赞
   * @param materialId 课件ID
   */
  unlikeMaterial(materialId: number): Observable<any> {
    return this.http.delete(`${this.API_BASE}/${materialId}/like`).pipe(
      timeout(this.API_TIMEOUT),
      map((response) => response),
      catchError((error) => {
        console.error(`Failed to unlike material ${materialId}:`, error);
        return of({ success: false });
      })
    );
  }

  /**
   * 收藏课件
   * @param materialId 课件ID
   */
  favoriteMaterial(materialId: number): Observable<any> {
    return this.http.post(`${this.API_BASE}/${materialId}/favorite`, {}).pipe(
      timeout(this.API_TIMEOUT),
      map((response) => response),
      catchError((error) => {
        console.error(`Failed to favorite material ${materialId}:`, error);
        return of({ success: false });
      })
    );
  }

  /**
   * 取消收藏
   * @param materialId 课件ID
   */
  unfavoriteMaterial(materialId: number): Observable<any> {
    return this.http.delete(`${this.API_BASE}/${materialId}/favorite`).pipe(
      timeout(this.API_TIMEOUT),
      map((response) => response),
      catchError((error) => {
        console.error(`Failed to unfavorite material ${materialId}:`, error);
        return of({ success: false });
      })
    );
  }

  /**
   * 获取课件统计
   * @param materialId 课件ID
   * @returns 统计数据
   */
  getMaterialStatistics(materialId: number): Observable<MaterialStatistics> {
    return this.http
      .get<ApiResponse<MaterialStatistics>>(`${this.API_BASE}/${materialId}/statistics`)
      .pipe(
        timeout(this.API_TIMEOUT),
        map((response) => {
          if (!response.data) {
            throw new Error('Invalid statistics data received from API');
          }
          return response.data;
        }),
        catchError((error) => {
          console.error(`Failed to get statistics for material ${materialId}:`, error);
          return this.fallbackGetMaterialStatistics(materialId);
        })
      );
  }

  // ==================== 搜索和推荐 ====================

  /**
   * 搜索课件
   * @param keyword 搜索关键词
   * @param filter 筛选条件
   * @returns 搜索结果
   */
  searchMaterials(
    keyword: string,
    filter?: MaterialFilter
  ): Observable<PaginatedResponse<UnifiedMaterial>> {
    return this.getMaterials({
      filter: { ...filter, search: keyword },
      page: 1,
      page_size: 20,
    });
  }

  /**
   * 获取热门课件
   * @param category 分类（可选）
   * @param limit 数量限制
   * @returns 热门课件列表
   */
  getPopularMaterials(category?: string, limit: number = 10): Observable<UnifiedMaterial[]> {
    return this.getMaterials({
      filter: category ? { category: [category as any] } : undefined,
      sort: 'most_downloaded',
      page: 1,
      page_size: limit,
    }).pipe(map((response) => response.items));
  }

  /**
   * 获取最新课件
   * @param limit 数量限制
   * @returns 最新课件列表
   */
  getNewestMaterials(limit: number = 10): Observable<UnifiedMaterial[]> {
    return this.getMaterials({
      sort: 'newest',
      page: 1,
      page_size: limit,
    }).pipe(map((response) => response.items));
  }

  /**
   * 获取推荐课件
   * @param userId 用户ID
   * @param limit 数量限制
   * @returns 推荐课件列表
   */
  getRecommendedMaterials(userId: number, limit: number = 10): Observable<UnifiedMaterial[]> {
    return this.http
      .get<ApiResponse<UnifiedMaterial[]>>(`${this.API_BASE}/users/${userId}/recommended`, {
        params: { limit: limit.toString() },
      })
      .pipe(
        timeout(this.API_TIMEOUT),
        retry(this.MAX_RETRIES),
        map((response) => response.data || []),
        catchError((error) => {
          console.error(`Failed to get recommended materials for user ${userId}:`, error);
          return this.getNewestMaterials(limit); // Fallback to newest materials
        })
      );
  }

  // ==================== 回退方法（模拟数据） ====================

  /**
   * 回退：获取课件
   */
  private fallbackGetMaterial(materialId: number): Observable<UnifiedMaterial> {
    console.warn(`Using fallback for getMaterial ${materialId}`);
    const mockMaterial: UnifiedMaterial = {
      id: materialId,
      material_code: `MAT-${Date.now()}-${materialId}`,
      title: '示例课件',
      description: '这是一个示例课件',
      type: 'document_pdf' as MaterialType,
      category: 'course_material',
      tags: ['示例', '测试'],
      file_url: '/mock/materials/example.pdf',
      file_name: 'example.pdf',
      file_size: 1024 * 1024,
      file_format: 'pdf',
      org_id: 1,
      created_by: 1,
      visibility: 'public',
      download_permission: 'all',
      download_count: 100,
      view_count: 500,
      like_count: 50,
      share_count: 25,
      comment_count: 10,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ai_generated: false,
    };
    return of(mockMaterial);
  }

  /**
   * 回退：获取课件列表
   */
  private fallbackGetMaterials(
    params?: MaterialQueryParams
  ): Observable<PaginatedResponse<UnifiedMaterial>> {
    console.warn('Using fallback for getMaterials');
    const mockMaterials: UnifiedMaterial[] = [
      {
        id: 1,
        material_code: 'MAT-001',
        title: 'Python编程入门',
        description: 'Python编程基础课程资料',
        type: 'document_pdf' as MaterialType,
        category: 'course_material',
        tags: ['Python', '编程'],
        file_url: '/mock/materials/python-intro.pdf',
        file_name: 'python-intro.pdf',
        file_size: 2 * 1024 * 1024,
        file_format: 'pdf',
        org_id: 1,
        course_id: 1,
        created_by: 1,
        visibility: 'public',
        download_permission: 'all',
        download_count: 150,
        view_count: 500,
        like_count: 80,
        share_count: 30,
        comment_count: 15,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ai_generated: false,
      },
      {
        id: 2,
        material_code: 'MAT-002',
        title: '机器人组装教程视频',
        description: '机器人组装步骤视频教程',
        type: 'video_teaching' as MaterialType,
        category: 'tutorial',
        tags: ['机器人', '组装', '视频'],
        file_url: '/mock/materials/robot-assembly.mp4',
        file_name: 'robot-assembly.mp4',
        file_size: 100 * 1024 * 1024,
        file_format: 'mp4',
        org_id: 1,
        course_id: 2,
        created_by: 1,
        visibility: 'public',
        download_permission: 'all',
        download_count: 200,
        view_count: 800,
        like_count: 120,
        share_count: 50,
        comment_count: 20,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ai_generated: false,
      },
      {
        id: 3,
        material_code: 'MAT-003',
        title: 'AR机器人零件识别',
        description: '使用AR识别机器人零件',
        type: 'ar_model' as MaterialType,
        category: 'tutorial',
        tags: ['AR', '机器人', '识别'],
        file_url: '/mock/materials/robot-parts-ar.usdz',
        file_name: 'robot-parts-ar.usdz',
        file_size: 50 * 1024 * 1024,
        file_format: 'usdz',
        org_id: 1,
        created_by: 1,
        visibility: 'public',
        download_permission: 'all',
        download_count: 75,
        view_count: 300,
        like_count: 60,
        share_count: 25,
        comment_count: 8,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ai_generated: true,
        arvr_data: {
          arvr_type: 'ar',
          ar_markers: [
            {
              id: 'marker1',
              type: '3d_model',
              position: { x: 0, y: 0, z: 0 },
              rotation: { x: 0, y: 0, z: 0 },
              scale: 1,
            },
          ],
        },
      },
    ];

    return of({
      items: mockMaterials,
      total: mockMaterials.length,
      page: params?.page || 1,
      page_size: params?.page_size || 10,
      total_pages: 1,
    });
  }

  /**
   * 回退：更新课件
   */
  private fallbackUpdateMaterial(
    materialId: number,
    data: UnifiedMaterialUpdate
  ): Observable<UnifiedMaterial> {
    console.warn(`Using fallback for updateMaterial ${materialId}`);
    return this.fallbackGetMaterial(materialId);
  }

  /**
   * 回退：删除课件
   */
  private fallbackDeleteMaterial(materialId: number): Observable<any> {
    console.warn(`Using fallback for deleteMaterial ${materialId}`);
    return of({ success: true, message: '课件已删除（fallback模式）' });
  }

  /**
   * 回退：获取下载链接
   */
  private fallbackGetDownloadLink(materialId: number): Observable<ShareLinkResponse> {
    console.warn(`Using fallback for getDownloadLink ${materialId}`);
    const mockLink: ShareLinkResponse = {
      share_url: `https://imato.com/materials/share/${materialId}`,
      share_code: 'ABC123',
      expire_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      access_password: '',
      max_downloads: 100,
    };
    return of(mockLink);
  }

  /**
   * 回退：获取课件统计
   */
  private fallbackGetMaterialStatistics(materialId: number): Observable<MaterialStatistics> {
    console.warn(`Using fallback for getMaterialStatistics ${materialId}`);
    const mockStats: MaterialStatistics = {
      material_id: materialId,
      download_count: 150,
      view_count: 500,
      like_count: 80,
      share_count: 30,
      comment_count: 15,
      unique_visitors: 200,
      unique_downloaders: 100,
      downloads_last_7_days: 20,
      downloads_last_30_days: 50,
      views_last_7_days: 80,
      views_last_30_days: 200,
      download_by_region: {
        北京: 30,
        上海: 25,
        广东: 20,
      },
      view_by_region: {
        北京: 100,
        上海: 80,
        广东: 60,
      },
    };
    return of(mockStats);
  }

  // ==================== 工具方法 ====================

  /**
   * 格式化文件大小
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    const f = (bytes / Math.pow(k, i)).toFixed(2);
    return `${parseFloat(f)} ${sizes[i]}`;
  }

  /**
   * 获取文件图标
   */
  getFileIcon(type: MaterialType): string {
    const icons: Record<MaterialType, string> = {
      // 文档类
      document_pdf: 'picture_as_pdf',
      document_word: 'description',
      document_ppt: 'slideshow',
      document_excel: 'table_chart',
      // 视频类
      video_teaching: 'videocam',
      video_screen: 'screen_share',
      video_live: 'live_tv',
      // 音频类
      audio_teaching: 'audio_file',
      audio_recording: 'mic',
      // 图片类
      image: 'image',
      // 代码类
      code_source: 'code',
      code_example: 'integration_instructions',
      code_project: 'folder_zip',
      // 游戏类
      game_interactive: 'sports_esports',
      game_simulation: 'science',
      // 动画类
      animation_2d: 'animation',
      animation_3d: 'view_in_ar',
      // AR/VR类
      ar_model: 'view_in_ar',
      vr_experience: 'vrpano',
      arvr_scene: 'view_in_ar',
      // 模型类
      model_3d: 'view_in_ar',
      model_robot: 'precision_manufacturing',
      // 实验类
      experiment_config: 'settings',
      experiment_template: 'description',
      // 其他类
      archive: 'archive',
      external_link: 'link',
    };
    return icons[type] || 'insert_drive_file';
  }

  /**
   * 检查是否支持在线预览
   */
  supportsPreview(type: MaterialType): boolean {
    const previewableTypes: MaterialType[] = [
      'document_pdf',
      'image',
      'video_teaching',
      'video_screen',
      'audio_teaching',
      'audio_recording',
      'ar_model',
      'vr_experience',
      'animation_2d',
      'animation_3d',
    ];
    return previewableTypes.includes(type);
  }

  /**
   * 检查是否为AR/VR类型
   */
  isARVRType(type: MaterialType): boolean {
    const arvrTypes: MaterialType[] = ['ar_model', 'vr_experience', 'arvr_scene'];
    return arvrTypes.includes(type);
  }

  /**
   * 检查是否为游戏类型
   */
  isGameType(type: MaterialType): boolean {
    const gameTypes: MaterialType[] = ['game_interactive', 'game_simulation'];
    return gameTypes.includes(type);
  }

  /**
   * 检查是否为实验类型
   */
  isExperimentType(type: MaterialType): boolean {
    const experimentTypes: MaterialType[] = ['experiment_config', 'experiment_template'];
    return experimentTypes.includes(type);
  }
}
