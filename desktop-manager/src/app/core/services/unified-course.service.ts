/**
 * 统一课程服务
 * 提供课程CRUD操作、查询和统计功能
 * 支持真实API调用和模拟数据回退
 */

import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, Inject, Optional } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, retry, timeout } from 'rxjs/operators';

import {
  ApiResponse,
  CourseCategory,
  CourseChapter,
  CourseFilter,
  CourseLesson,
  CourseMaterial,
  CourseQueryParams,
  CourseReview,
  ExternalResource,
  isUnifiedCourse,
  PaginatedResponse,
  UnifiedCourse,
  UnifiedCourseCreate,
  UnifiedCourseUpdate,
} from '../../models/unified-course.models';
import { MockDataProvider, DefaultMockDataProvider } from './mock-data.provider';

interface GraphNodeData {
  id: string;
  label: string;
  type: string;
  [key: string]: unknown;
}

@Injectable({
  providedIn: 'root',
})
export class UnifiedCourseService {
  private readonly API_BASE = '/api/v1/unified-courses';
  private readonly API_TIMEOUT = 10000; // 10秒超时
  private readonly MAX_RETRIES = 3;

  constructor(
    private http: HttpClient,
    @Optional() @Inject('MockDataProvider') private mockProvider?: MockDataProvider
  ) {
    if (!this.mockProvider) {
      this.mockProvider = new DefaultMockDataProvider();
    }
  }

  // ==================== 课程CRUD操作 ====================

  /**
   * 创建课程
   * @param data 课程创建数据
   * @returns 创建的课程
   */
  createCourse(data: UnifiedCourseCreate): Observable<UnifiedCourse> {
    return this.http.post<ApiResponse<UnifiedCourse>>(`${this.API_BASE}/courses`, data).pipe(
      timeout(this.API_TIMEOUT),
      retry(this.MAX_RETRIES),
      map((response: ApiResponse<UnifiedCourse>) => {
        if (!response.data || !isUnifiedCourse(response.data)) {
          throw new Error('Invalid course data received from API');
        }
        return response.data;
      }),
      catchError((error) => {
        console.error('Failed to create course:', error);
        return this.fallbackCreateCourse(data);
      })
    );
  }

  /**
   * 获取课程详情
   * @param courseId 课程ID
   * @returns 课程详情
   */
  getCourse(courseId: number): Observable<UnifiedCourse> {
    return this.http.get<ApiResponse<UnifiedCourse>>(`${this.API_BASE}/courses/${courseId}`).pipe(
      timeout(this.API_TIMEOUT),
      retry(this.MAX_RETRIES),
      map((response: ApiResponse<UnifiedCourse>) => {
        if (!response.data || !isUnifiedCourse(response.data)) {
          throw new Error('Invalid course data received from API');
        }
        return response.data;
      }),
      catchError((error) => {
        console.error(`Failed to get course ${courseId}:`, error);
        return this.fallbackGetCourse(courseId);
      })
    );
  }

  /**
   * 获取课程列表
   * @param params 查询参数
   * @returns 课程分页列表
   */
  getCourses(params?: CourseQueryParams): Observable<PaginatedResponse<UnifiedCourse>> {
    let httpParams = new HttpParams();

    // 构建筛选参数
    if (params?.filter) {
      httpParams = this.buildFilterParams(httpParams, params.filter);
    }

    // 构建排序和分页参数
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
      .get<
        ApiResponse<PaginatedResponse<UnifiedCourse>>
      >(`${this.API_BASE}/courses`, { params: httpParams })
      .pipe(
        timeout(this.API_TIMEOUT),
        retry(this.MAX_RETRIES),
        map((response: ApiResponse<PaginatedResponse<UnifiedCourse>>) => {
          if (!response.data || !Array.isArray(response.data.items)) {
            throw new Error('Invalid course list data received from API');
          }
          return response.data;
        }),
        catchError((error) => {
          console.error('Failed to get courses:', error);
          return this.fallbackGetCourses(params);
        })
      );
  }

  /**
   * 构建筛选参数
   * @param httpParams HTTP 参数对象
   * @param filter 筛选条件
   * @returns 构建后的参数对象
   */
  private buildFilterParams(httpParams: HttpParams, filter: CourseFilter): HttpParams {
    // 参数配置映射：定义每个字段的处理规则
    type ParamType = 'array' | 'string';
    interface ParamConfig<T extends ParamType> {
      key: string;
      value: T extends 'array' ? readonly unknown[] | undefined : unknown;
      type: T;
    }

    const paramConfig: ParamConfig<'array' | 'string'>[] = [
      // 数组类型字段（需要 join 处理）
      { key: 'scenario_type', value: filter.scenario_type, type: 'array' },
      { key: 'category', value: filter.category, type: 'array' },
      { key: 'level', value: filter.level, type: 'array' },
      { key: 'status', value: filter.status, type: 'array' },
      { key: 'delivery_method', value: filter.delivery_method, type: 'array' },
      { key: 'org_id', value: filter.org_id, type: 'array' },
      { key: 'tags', value: filter.tags, type: 'array' },
      // 简单类型字段（直接转换）
      { key: 'is_free', value: filter.is_free, type: 'string' },
      { key: 'min_rating', value: filter.min_rating, type: 'string' },
      { key: 'search', value: filter.search_keyword, type: 'string' },
    ];

    // 统一处理所有参数
    paramConfig.forEach(({ key, value, type }) => {
      if (value !== undefined && value !== null) {
        const shouldInclude = type === 'array' ? (value as readonly unknown[]).length > 0 : true;
        if (shouldInclude) {
          const paramValue =
            type === 'array' ? (value as readonly unknown[]).join(',') : String(value);
          httpParams = httpParams.set(key, paramValue);
        }
      }
    });

    // 特殊处理价格区间（需要设置两个参数）
    if (filter.price_range) {
      httpParams = httpParams.set('min_price', filter.price_range.min.toString());
      httpParams = httpParams.set('max_price', filter.price_range.max.toString());
    }

    return httpParams;
  }

  /**
   * 更新课程
   * @param courseId 课程ID
   * @param data 更新数据
   * @returns 更新后的课程
   */
  updateCourse(courseId: number, data: UnifiedCourseUpdate): Observable<UnifiedCourse> {
    return this.http
      .put<ApiResponse<UnifiedCourse>>(`${this.API_BASE}/courses/${courseId}`, data)
      .pipe(
        timeout(this.API_TIMEOUT),
        retry(this.MAX_RETRIES),
        map((response: ApiResponse<UnifiedCourse>) => {
          if (!response.data || !isUnifiedCourse(response.data)) {
            throw new Error('Invalid course data received from API');
          }
          return response.data;
        }),
        catchError((error) => {
          console.error(`Failed to update course ${courseId}:`, error);
          return this.fallbackUpdateCourse(courseId, data);
        })
      );
  }

  /**
   * 删除课程（软删除）
   * @param courseId 课程 ID
   * @returns 删除结果
   */
  deleteCourse(
    courseId: number,
    soft: boolean = true
  ): Observable<{ success: boolean; message?: string }> {
    return this.http
      .delete<
        ApiResponse<{ success: boolean; message?: string }>
      >(`${this.API_BASE}/courses/${courseId}`, { params: { soft: soft.toString() } })
      .pipe(
        timeout(this.API_TIMEOUT),
        retry(this.MAX_RETRIES),
        map((response) => response.data ?? { success: true }),
        catchError((error) => {
          console.error(`Failed to delete course ${courseId}:`, error);
          return this.fallbackDeleteCourse(courseId);
        })
      );
  }

  // ==================== 课程章节管理 ====================

  /**
   * 获取课程章节列表
   * @param courseId 课程ID
   * @returns 章节列表
   */
  getCourseChapters(courseId: number): Observable<CourseChapter[]> {
    return this.http
      .get<ApiResponse<CourseChapter[]>>(`${this.API_BASE}/courses/${courseId}/chapters`)
      .pipe(
        timeout(this.API_TIMEOUT),
        retry(this.MAX_RETRIES),
        map((response: ApiResponse<CourseChapter[]>) => (response.data as CourseChapter[]) || []),
        catchError((error) => {
          console.error(`Failed to get chapters for course ${courseId}:`, error);
          return of([]);
        })
      );
  }

  /**
   * 创建章节
   * @param courseId 课程ID
   * @param data 章节数据
   * @returns 创建的章节
   */
  createChapter(courseId: number, data: Partial<CourseChapter>): Observable<CourseChapter> {
    return this.http
      .post<ApiResponse<CourseChapter>>(`${this.API_BASE}/courses/${courseId}/chapters`, data)
      .pipe(
        timeout(this.API_TIMEOUT),
        retry(this.MAX_RETRIES),
        map((response: ApiResponse<CourseChapter>) => {
          if (!response.data) {
            throw new Error('Invalid chapter data received from API');
          }
          return response.data;
        }),
        catchError((error: unknown) => {
          console.error(`Failed to create chapter for course ${courseId}:`, error);
          return throwError(() => error as Error);
        })
      );
  }

  /**
   * 更新章节
   * @param courseId 课程ID
   * @param chapterId 章节ID
   * @param data 更新数据
   * @returns 更新后的章节
   */
  updateChapter(
    courseId: number,
    chapterId: number,
    data: Partial<CourseChapter>
  ): Observable<CourseChapter> {
    return this.http
      .put<
        ApiResponse<CourseChapter>
      >(`${this.API_BASE}/courses/${courseId}/chapters/${chapterId}`, data)
      .pipe(
        timeout(this.API_TIMEOUT),
        retry(this.MAX_RETRIES),
        map((response: ApiResponse<CourseChapter>) => {
          if (!response.data) {
            throw new Error('Invalid chapter data received from API');
          }
          return response.data;
        }),
        catchError((error: unknown) => {
          console.error(`Failed to update chapter ${chapterId}:`, error);
          return throwError(() => error as Error);
        })
      );
  }

  /**
   * 删除章节
   * @param courseId 课程ID
   * @param chapterId 章节ID
   * @returns 删除结果
   */
  deleteChapter(
    courseId: number,
    chapterId: number
  ): Observable<{ success: boolean; message?: string }> {
    return this.http
      .delete<
        ApiResponse<{ success: boolean; message?: string }>
      >(`${this.API_BASE}/courses/${courseId}/chapters/${chapterId}`)
      .pipe(
        timeout(this.API_TIMEOUT),
        retry(this.MAX_RETRIES),
        map((response) => response.data ?? { success: true }),
        catchError((error: unknown) => {
          console.error(`Failed to delete chapter ${chapterId}:`, error);
          return throwError(() => error as Error);
        })
      );
  }

  // ==================== 课程课时管理 ====================

  /**
   * 获取课程课时列表
   * @param courseId 课程ID
   * @param chapterId 章节ID（可选）
   * @returns 课时列表
   */
  getCourseLessons(courseId: number, chapterId?: number): Observable<CourseLesson[]> {
    let url = `${this.API_BASE}/courses/${courseId}/lessons`;
    if (chapterId) {
      url += `?chapter_id=${chapterId}`;
    }
    return this.http.get<ApiResponse<CourseLesson[]>>(url).pipe(
      timeout(this.API_TIMEOUT),
      retry(this.MAX_RETRIES),
      map((response: ApiResponse<CourseLesson[]>) => (response.data as CourseLesson[]) || []),
      catchError((error) => {
        console.error(`Failed to get lessons for course ${courseId}:`, error);
        return of([]);
      })
    );
  }

  /**
   * 获取课时详情
   * @param courseId 课程ID
   * @param lessonId 课时ID
   * @returns 课时详情
   */
  getLesson(courseId: number, lessonId: number): Observable<CourseLesson> {
    return this.http
      .get<ApiResponse<CourseLesson>>(`${this.API_BASE}/courses/${courseId}/lessons/${lessonId}`)
      .pipe(
        timeout(this.API_TIMEOUT),
        retry(this.MAX_RETRIES),
        map((response: ApiResponse<CourseLesson>) => {
          if (!response.data) {
            throw new Error('Invalid lesson data received from API');
          }
          return response.data;
        }),
        catchError((error: unknown) => {
          console.error(`Failed to get lesson ${lessonId}:`, error);
          return throwError(() => error as Error);
        })
      );
  }

  /**
   * 创建课时
   * @param courseId 课程ID
   * @param data 课时数据
   * @returns 创建的课时
   */
  createLesson(courseId: number, data: Partial<CourseLesson>): Observable<CourseLesson> {
    return this.http
      .post<ApiResponse<CourseLesson>>(`${this.API_BASE}/courses/${courseId}/lessons`, data)
      .pipe(
        timeout(this.API_TIMEOUT),
        retry(this.MAX_RETRIES),
        map((response: ApiResponse<CourseLesson>) => {
          if (!response.data) {
            throw new Error('Invalid lesson data received from API');
          }
          return response.data;
        }),
        catchError((error: unknown) => {
          console.error(`Failed to create lesson for course ${courseId}:`, error);
          return throwError(() => error as Error);
        })
      );
  }

  /**
   * 更新课时
   * @param courseId 课程ID
   * @param lessonId 课时ID
   * @param data 更新数据
   * @returns 更新后的课时
   */
  updateLesson(
    courseId: number,
    lessonId: number,
    data: Partial<CourseLesson>
  ): Observable<CourseLesson> {
    return this.http
      .put<
        ApiResponse<CourseLesson>
      >(`${this.API_BASE}/courses/${courseId}/lessons/${lessonId}`, data)
      .pipe(
        timeout(this.API_TIMEOUT),
        retry(this.MAX_RETRIES),
        map((response: ApiResponse<CourseLesson>) => {
          if (!response.data) {
            throw new Error('Invalid lesson data received from API');
          }
          return response.data;
        }),
        catchError((error: unknown) => {
          console.error(`Failed to update lesson ${lessonId}:`, error);
          return throwError(() => error as Error);
        })
      );
  }

  /**
   * 删除课时
   * @param courseId 课程ID
   * @param lessonId 课时ID
   * @returns 删除结果
   */
  deleteLesson(
    courseId: number,
    lessonId: number
  ): Observable<{ success: boolean; message?: string }> {
    return this.http
      .delete<
        ApiResponse<{ success: boolean; message?: string }>
      >(`${this.API_BASE}/courses/${courseId}/lessons/${lessonId}`)
      .pipe(
        timeout(this.API_TIMEOUT),
        retry(this.MAX_RETRIES),
        map((response) => response.data ?? { success: true }),
        catchError((error: unknown) => {
          console.error(`Failed to delete lesson ${lessonId}:`, error);
          return throwError(() => error as Error);
        })
      );
  }

  // ==================== 课程资源管理 ====================

  /**
   * 获取课程资料列表
   * @param courseId 课程ID
   * @returns 资料列表
   */
  getCourseMaterials(courseId: number): Observable<CourseMaterial[]> {
    return this.http
      .get<ApiResponse<CourseMaterial[]>>(`${this.API_BASE}/courses/${courseId}/materials`)
      .pipe(
        timeout(this.API_TIMEOUT),
        retry(this.MAX_RETRIES),
        map((response: ApiResponse<CourseMaterial[]>) => (response.data as CourseMaterial[]) || []),
        catchError((error) => {
          console.error(`Failed to get materials for course ${courseId}:`, error);
          return of([]);
        })
      );
  }

  /**
   * 上传课程资料
   * @param courseId 课程ID
   * @param file 文件
   * @param metadata 元数据
   * @returns 上传结果
   */
  uploadCourseMaterial(
    courseId: number,
    file: File,
    metadata: Partial<CourseMaterial>
  ): Observable<CourseMaterial> {
    const formData = new FormData();
    formData.append('file', file);
    if (metadata.title) formData.append('title', metadata.title);
    if (metadata.description) formData.append('description', metadata.description);
    if (metadata.type) formData.append('type', metadata.type);

    return this.http
      .post<
        ApiResponse<CourseMaterial>
      >(`${this.API_BASE}/courses/${courseId}/materials/upload`, formData)
      .pipe(
        timeout(30000), // 30 秒超时（上传可能需要更长时间）
        retry(this.MAX_RETRIES),
        map((response: ApiResponse<CourseMaterial>) => {
          if (!response.data) {
            throw new Error('Invalid material data received from API');
          }
          return response.data;
        }),
        catchError((error: unknown) => {
          console.error(`Failed to upload material for course ${courseId}:`, error);
          return throwError(() => error as Error);
        })
      );
  }

  /**
   * 删除课程资料
   * @param courseId 课程ID
   * @param materialId 资料ID
   * @returns 删除结果
   */
  deleteCourseMaterial(
    courseId: number,
    materialId: number
  ): Observable<{ success: boolean; message?: string }> {
    return this.http
      .delete<
        ApiResponse<{ success: boolean; message?: string }>
      >(`${this.API_BASE}/courses/${courseId}/materials/${materialId}`)
      .pipe(
        timeout(this.API_TIMEOUT),
        retry(this.MAX_RETRIES),
        map((response) => response.data ?? { success: true }),
        catchError((error: unknown) => {
          console.error(`Failed to delete material ${materialId}:`, error);
          return throwError(() => error as Error);
        })
      );
  }

  // ==================== 课程评价管理 ====================

  /**
   * 获取课程评价列表
   * @param courseId 课程ID
   * @param page 页码
   * @param pageSize 每页数量
   * @returns 评价分页列表
   */
  getCourseReviews(
    courseId: number,
    page: number = 1,
    pageSize: number = 10
  ): Observable<PaginatedResponse<CourseReview>> {
    return this.http
      .get<ApiResponse<PaginatedResponse<CourseReview>>>(
        `${this.API_BASE}/courses/${courseId}/reviews`,
        {
          params: { page: page.toString(), page_size: pageSize.toString() },
        }
      )
      .pipe(
        timeout(this.API_TIMEOUT),
        retry(this.MAX_RETRIES),
        map((response: ApiResponse<PaginatedResponse<CourseReview>>) => {
          if (!response.data) {
            throw new Error('Invalid reviews data received from API');
          }
          return response.data;
        }),
        catchError((error) => {
          console.error(`Failed to get reviews for course ${courseId}:`, error);
          return of({ items: [], total: 0, page, page_size: pageSize, total_pages: 0 });
        })
      );
  }

  /**
   * 创建课程评价
   * @param courseId 课程ID
   * @param data 评价数据
   * @returns 创建的评价
   */
  createCourseReview(courseId: number, data: Partial<CourseReview>): Observable<CourseReview> {
    return this.http
      .post<ApiResponse<CourseReview>>(`${this.API_BASE}/courses/${courseId}/reviews`, data)
      .pipe(
        timeout(this.API_TIMEOUT),
        retry(this.MAX_RETRIES),
        map((response: ApiResponse<CourseReview>) => {
          if (!response.data) {
            throw new Error('Invalid review data received from API');
          }
          return response.data;
        }),
        catchError((error: unknown) => {
          console.error(`Failed to create review for course ${courseId}:`, error);
          return throwError(() => error as Error);
        })
      );
  }

  /**
   * 标记评价为有用
   * @param courseId 课程ID
   * @param reviewId 评价ID
   * @returns 更新后的评价
   */
  markReviewAsHelpful(courseId: number, reviewId: number): Observable<CourseReview> {
    return this.http
      .post<
        ApiResponse<CourseReview>
      >(`${this.API_BASE}/courses/${courseId}/reviews/${reviewId}/helpful`, {})
      .pipe(
        timeout(this.API_TIMEOUT),
        retry(this.MAX_RETRIES),
        map((response: ApiResponse<CourseReview>) => {
          if (!response.data) {
            throw new Error('Invalid review data received from API');
          }
          return response.data;
        }),
        catchError((error: unknown) => {
          console.error(`Failed to mark review ${reviewId} as helpful:`, error);
          return throwError(() => error as Error);
        })
      );
  }

  // ==================== 课程搜索和筛选 ====================

  /**
   * 搜索课程
   * @param keyword 搜索关键词
   * @param filter 筛选条件
   * @returns 课程列表
   */
  searchCourses(
    keyword: string,
    filter?: CourseFilter
  ): Observable<PaginatedResponse<UnifiedCourse>> {
    return this.getCourses({
      filter: { ...filter, search_keyword: keyword },
      page: 1,
      page_size: 20,
    });
  }

  /**
   * 获取热门课程
   * @param category 分类（可选）
   * @param limit 数量限制
   * @returns 热门课程列表
   */
  getPopularCourses(category?: string, limit: number = 10): Observable<UnifiedCourse[]> {
    return this.getCourses({
      filter: { category: category ? [category as CourseCategory] : undefined },
      sort: 'popular',
      page: 1,
      page_size: limit,
    }).pipe(map((response) => response.items));
  }

  /**
   * 获取最新课程
   * @param limit 数量限制
   * @returns 最新课程列表
   */
  getNewestCourses(limit: number = 10): Observable<UnifiedCourse[]> {
    return this.getCourses({
      sort: 'newest',
      page: 1,
      page_size: limit,
    }).pipe(map((response) => response.items));
  }

  /**
   * 获取推荐课程
   * @param userId 用户ID
   * @param limit 数量限制
   * @returns 推荐课程列表
   */
  getRecommendedCourses(userId: number, limit: number = 10): Observable<UnifiedCourse[]> {
    return this.http
      .get<ApiResponse<UnifiedCourse[]>>(`${this.API_BASE}/users/${userId}/recommended-courses`, {
        params: { limit: limit.toString() },
      })
      .pipe(
        timeout(this.API_TIMEOUT),
        retry(this.MAX_RETRIES),
        map((response: ApiResponse<UnifiedCourse[]>) => (response.data as UnifiedCourse[]) || []),
        catchError((error) => {
          console.error(`Failed to get recommended courses for user ${userId}:`, error);
          return of([]);
        })
      );
  }

  // ==================== STEM 学习路径与图谱引擎 ====================

  /**
   * 获取教程关联的知识图谱节点数据
   * @param tutorialId 教程 ID
   * @returns 图谱节点及关联关系
   */
  getTutorialGraph(tutorialId: number): Observable<GraphNodeData | null> {
    return this.http.get<ApiResponse<GraphNodeData>>(`${this.API_BASE}/${tutorialId}/graph`).pipe(
      timeout(this.API_TIMEOUT),
      map((response) => response.data ?? null),
      catchError((error) => {
        console.error(`Failed to get graph for tutorial ${tutorialId}:`, error);
        return of(null);
      })
    );
  }

  /**
   * 根据用户水平生成个性化学习路径
   * @param userProfile 用户画像（年龄、兴趣等）
   * @returns 推荐的教程序列
   */
  generateLearningPath(userProfile: Record<string, unknown>): Observable<UnifiedCourse[]> {
    return this.http
      .post<ApiResponse<UnifiedCourse[]>>(`${this.API_BASE}/path/generate`, userProfile)
      .pipe(
        timeout(15000),
        map((response) => response.data ?? []),
        catchError((error) => {
          console.error('Failed to generate learning path:', error);
          return of([]);
        })
      );
  }

  // ==================== 回退方法（模拟数据） ====================

  /**
   * 回退：创建课程
   */
  private fallbackCreateCourse(data: UnifiedCourseCreate): Observable<UnifiedCourse> {
    console.warn('Using fallback for createCourse');
    const mockCourse: UnifiedCourse = {
      id: Math.floor(Math.random() * 10000),
      course_code: `COURSE-${Date.now()}`,
      org_id: data.org_id,
      scenario_type: data.scenario_type,
      title: data.title,
      subtitle: data.subtitle,
      description: data.description,
      cover_image_url: data.cover_image_url,
      category: data.category,
      tags: data.tags,
      level: data.level,
      subject: data.subject,
      learning_objectives: data.learning_objectives,
      prerequisites: data.prerequisites,
      target_audience: data.target_audience,
      total_lessons: data.total_lessons,
      estimated_duration_hours: data.estimated_duration_hours,
      delivery_method: data.delivery_method,
      max_students: data.max_students,
      current_enrollments: 0,
      is_free: data.is_free,
      price: data.price,
      primary_teacher_id: data.primary_teacher_id,
      assistant_teacher_ids: data.assistant_teacher_ids,
      materials: data.materials as CourseMaterial[] | undefined,
      external_resources: data.external_resources as ExternalResource[] | undefined,
      visibility: data.visibility,
      is_featured: data.is_featured,
      ai_generated: data.ai_generated,
      ai_model_version: data.ai_model_version,
      ai_confidence_score: data.ai_confidence_score,
      dynamic_content: data.dynamic_content,
      status: 'draft',
      created_by: data.primary_teacher_id,
      updated_by: data.primary_teacher_id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    return of(mockCourse);
  }

  /**
   * 回退：获取课程
   */
  private fallbackGetCourse(courseId: number): Observable<UnifiedCourse> {
    console.warn(`Using fallback for getCourse ${courseId}`);
    const mockCourse: UnifiedCourse = {
      id: courseId,
      course_code: `COURSE-${courseId}`,
      org_id: 1,
      scenario_type: 'school_curriculum',
      title: '示例课程',
      description: '这是一个示例课程',
      category: 'programming',
      tags: ['示例', '测试'],
      level: 'beginner',
      learning_objectives: ['学习基础'],
      total_lessons: 10,
      estimated_duration_hours: 10,
      delivery_method: 'online',
      current_enrollments: 100,
      is_free: true,
      primary_teacher_id: 1,
      visibility: 'public',
      status: 'published',
      created_by: 1,
      updated_by: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    return of(mockCourse);
  }

  /**
   * 回退：获取课程列表
   */
  private fallbackGetCourses(
    params?: CourseQueryParams
  ): Observable<PaginatedResponse<UnifiedCourse>> {
    console.warn('Using fallback for getCourses');
    const mockCourses = this.createMockCourses();

    return of({
      items: mockCourses,
      total: mockCourses.length,
      page: params?.page ?? 1,
      page_size: params?.page_size ?? 10,
      total_pages: 1,
    });
  }

  /**
   * 创建模拟课程数据
   */
  private createMockCourses(): UnifiedCourse[] {
    return [this.createMockCourse1(), this.createMockCourse2()];
  }

  /**
   * 创建第一个模拟课程：Scratch 编程入门
   */
  private createMockCourse1(): UnifiedCourse {
    return {
      id: 1,
      course_code: 'STEM-001',
      org_id: 1,
      scenario_type: 'institution',
      title: 'Scratch 编程入门',
      description: '通过图形化编程学习计算思维，适合6-10岁儿童',
      category: 'programming',
      tags: ['Scratch', '图形化编程', '计算思维', 'STEM'],
      level: 'beginner',
      learning_objectives: [
        '掌握 Scratch 基础操作',
        '理解顺序、循环、条件等编程概念',
        '能够独立完成简单动画和游戏制作',
      ],
      total_lessons: 12,
      estimated_duration_hours: 24,
      delivery_method: 'offline',
      current_enrollments: 150,
      is_free: false,
      price: 1200,
      primary_teacher_id: 1,
      visibility: 'public',
      is_featured: true,
      status: 'published',
      created_by: 1,
      updated_by: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }

  /**
   * 创建第二个模拟课程：Arduino 机器人创客
   */
  private createMockCourse2(): UnifiedCourse {
    return {
      id: 2,
      course_code: 'STEM-002',
      org_id: 1,
      scenario_type: 'institution',
      title: 'Arduino 机器人创客',
      description: '学习 Arduino 硬件编程，制作智能机器人项目',
      category: 'ai_robotics',
      tags: ['Arduino', '机器人', '硬件编程', '创客', 'STEM'],
      level: 'intermediate',
      learning_objectives: [
        '掌握 Arduino 基础电路连接',
        '学习 C++ 编程控制硬件',
        '能够独立设计并制作机器人项目',
      ],
      total_lessons: 16,
      estimated_duration_hours: 32,
      delivery_method: 'offline',
      current_enrollments: 80,
      is_free: false,
      price: 2400,
      primary_teacher_id: 1,
      visibility: 'public',
      is_featured: true,
      status: 'published',
      created_by: 1,
      updated_by: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }

  /**
   * 回退：更新课程
   */
  private fallbackUpdateCourse(
    courseId: number,
    data: UnifiedCourseUpdate
  ): Observable<UnifiedCourse> {
    console.warn(`Using fallback for updateCourse ${courseId}`);
    return this.fallbackGetCourse(courseId).pipe(
      map(
        (course) => ({ ...course, ...data, updated_at: new Date().toISOString() }) as UnifiedCourse
      )
    );
  }

  /**
   * 回退：删除课程
   */
  private fallbackDeleteCourse(
    courseId: number
  ): Observable<{ success: boolean; message?: string }> {
    console.warn(`Using fallback for deleteCourse ${courseId}`);
    return of({ success: true, message: 'Course deleted (fallback mode)' });
  }
}
