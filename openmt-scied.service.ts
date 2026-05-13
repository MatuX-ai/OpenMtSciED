import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Tutorial {
  id: string;
  title: string;
  description: string;
  grade_level: string;
  subject: string;
  duration_minutes: number;
  difficulty_level: string;
  created_at?: string;
}

export interface TutorialListResponse {
  items: Tutorial[];
  total: number;
  page: number;
  size: number;
  total_pages: number;
}

export interface Courseware {
  id: string;
  title: string;
  description: string;
  type: string;
  grade_level: string;
  subject: string;
  difficulty_level: string;
  file_url: string;
  thumbnail_url: string;
  duration_minutes: number;
  knowledge_points: Array<{id: string; name: string}>;
  created_at?: string;
}

export interface HardwareProject {
  id: string;
  title: string;
  description: string;
  difficulty_level: string;
  category: string;
  subject: string;
  estimated_time_hours: number;
  thumbnail_url: string;
  hardware_required: Array<{id: string; name: string; quantity: number}>;
  knowledge_points: Array<{id: string; name: string}>;
  created_at?: string;
}

export interface LearningPathNode {
  id: string;
  type: string;
  resource_id: string;
  title: string;
  prerequisites: string[];
  next_steps: string[];
  estimated_time_minutes: number;
  difficulty_level?: string;
}

export interface LearningPath {
  path_id: string;
  nodes: LearningPathNode[];
  estimated_duration_hours: number;
  difficulty_progression: string;
  message?: string;
}

export interface Recommendation {
  id: string;
  title: string;
  description: string;
  subject: string;
  grade_level: string;
  difficulty_level: string;
  type: string;
  recommendation_reason: string;
  score: number;
}

@Injectable({
  providedIn: 'root'
})
export class OpenMtSciEdService {
  private baseUrl = environment.openMtSciEdApiUrl;

  constructor(private http: HttpClient) {}

  // ==================== 教程管理 ====================

  /**
   * 获取教程列表
   */
  getTutorials(
    page: number = 1,
    size: number = 20,
    subject?: string,
    gradeLevel?: string
  ): Observable<TutorialListResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (subject) {
      params = params.set('subject', subject);
    }
    if (gradeLevel) {
      params = params.set('grade_level', gradeLevel);
    }

    return this.http.get<TutorialListResponse>(`${this.baseUrl}/tutorials`, { params });
  }

  /**
   * 获取教程详情
   */
  getTutorialById(id: string): Observable<Tutorial> {
    return this.http.get<Tutorial>(`${this.baseUrl}/tutorials/${id}`);
  }

  /**
   * 创建教程
   */
  createTutorial(tutorial: Partial<Tutorial>): Observable<any> {
    return this.http.post(`${this.baseUrl}/tutorials`, tutorial);
  }

  /**
   * 更新教程
   */
  updateTutorial(id: string, tutorial: Partial<Tutorial>): Observable<any> {
    return this.http.put(`${this.baseUrl}/tutorials/${id}`, tutorial);
  }

  /**
   * 删除教程
   */
  deleteTutorial(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/tutorials/${id}`);
  }

  // ==================== 课件管理 ====================

  /**
   * 获取课件列表
   */
  getCoursewares(
    page: number = 1,
    size: number = 20,
    subject?: string,
    gradeLevel?: string,
    type?: string
  ): Observable<{items: Courseware[]; total: number; page: number; size: number; total_pages: number}> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (subject) params = params.set('subject', subject);
    if (gradeLevel) params = params.set('grade_level', gradeLevel);
    if (type) params = params.set('type', type);

    return this.http.get<any>(`${this.baseUrl}/coursewares`, { params });
  }

  /**
   * 创建课件
   */
  createCourseware(courseware: Partial<Courseware>): Observable<any> {
    return this.http.post(`${this.baseUrl}/coursewares`, courseware);
  }

  // ==================== 知识图谱 - 学习路径 ====================

  /**
   * 生成学习路径
   */
  generateLearningPath(
    userId: number,
    currentGrade: string,
    subjects: string[],
    learningGoals?: string[]
  ): Observable<LearningPath> {
    const body = {
      user_id: userId,
      current_grade: currentGrade,
      subjects,
      learning_goals: learningGoals || []
    };

    return this.http.post<LearningPath>(`${this.baseUrl}/knowledge-graph/path`, body);
  }

  /**
   * 获取用户学习进度
   */
  getUserProgress(userId: number): Observable<any> {
    const params = new HttpParams().set('user_id', userId.toString());
    return this.http.get(`${this.baseUrl}/knowledge-graph/path`, { params });
  }

  // ==================== 知识图谱 - 资源推荐 ====================

  /**
   * 获取个性化推荐
   */
  getRecommendations(
    userId: number,
    limit: number = 10,
    subjects?: string[]
  ): Observable<{user_id: number; recommendations: Recommendation[]; strategy: string; message: string}> {
    const body = {
      user_id: userId,
      limit,
      subjects: subjects || []
    };

    return this.http.post<any>(`${this.baseUrl}/knowledge-graph/recommend`, body);
  }

  /**
   * 获取课件推荐
   */
  getCoursewareRecommendations(
    userId: number,
    subject?: string,
    limit: number = 10
  ): Observable<any> {
    let params = new HttpParams()
      .set('user_id', userId.toString())
      .set('limit', limit.toString());

    if (subject) {
      params = params.set('subject', subject);
    }

    return this.http.get(`${this.baseUrl}/knowledge-graph/recommend`, { params });
  }

  // ==================== 硬件项目管理 ====================

  /**
   * 获取硬件项目列表
   */
  getHardwareProjects(
    page: number = 1,
    size: number = 20,
    difficulty?: string,
    category?: string,
    subject?: string
  ): Observable<{items: HardwareProject[]; total: number; page: number; size: number; total_pages: number}> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (difficulty) params = params.set('difficulty', difficulty);
    if (category) params = params.set('category', category);
    if (subject) params = params.set('subject', subject);

    return this.http.get<any>(`${this.baseUrl}/hardware-projects`, { params });
  }

  /**
   * 创建硬件项目
   */
  createHardwareProject(project: Partial<HardwareProject>): Observable<any> {
    return this.http.post(`${this.baseUrl}/hardware-projects`, project);
  }
}
