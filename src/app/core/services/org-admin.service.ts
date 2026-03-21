/**
 * 机构管理员服务
 * 提供机构管理相关API调用封装，包括机构概览、课程运营、教师管理、学员管理等
 * Phase 2增强：类型安全、真实API支持、细粒度错误处理
 */

import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of, forkJoin, throwError } from 'rxjs';
import { map, catchError, switchMap, retry, tap, timeout } from 'rxjs/operators';

import { MultiSourceLearningService } from './multi-source-learning.service';
import { environment } from '../../../environments/environment';

// 导入教育管理模型
import { 
  OrganizationStats, 
  TeacherProfile, 
  StudentProfile, 
  Course,
  LearningProgress,
  AttendanceRecord,
  StudentCourseEnrollment,
  TeacherCourseAssignment,
  ApiResponse,
  PaginatedResponse
} from '../../models/education-management.models';

// 扩展接口定义（与后端API对齐）
export interface OrgOverview {
  studentCount: number;
  teacherCount: number;
  activeCourses: number;
  activeMembers: number;
  totalRevenue?: number;
  averageAttendance?: number;
  completionRate?: number;
  satisfactionRate?: number;
}

export interface CourseInfo {
  id: number;
  org_id: number;
  name: string;
  category: string;
  enrollmentCount: number;
  capacity: number;
  status: 'draft' | 'published' | 'ongoing' | 'completed' | 'archived';
  startDate: string | null;
  endDate: string | null;
  teacherName?: string;
  progress?: number;
  revenue?: number;
}

export interface TeacherInfo {
  id: number;
  user_id: number;
  org_id: number;
  name: string;
  email: string;
  department: string;
  courseCount: number;
  totalHours: number;
  activeHours: number;
  status: 'active' | 'on_leave' | 'retired' | 'inactive';
  specialization?: string;
  employee_id?: string;
  performanceScore?: number;
}

export interface StudentInfo {
  id: number;
  user_id: number;
  org_id: number;
  name: string;
  email: string;
  grade: string;
  class_name?: string;
  enrolledCourses: number;
  progress: number;
  attendanceRate: number;
  averageScore: number;
  lastActivity: string | null;
  status: 'active' | 'graduated' | 'transferred' | 'suspended' | 'inactive';
  enrollmentDate?: string;
}

export interface EnrollmentStats {
  totalEnrollments: number;
  activeEnrollments: number;
  completedEnrollments: number;
  dropoutRate: number;
  conversionRate?: number;
  retentionRate?: number;
  churnRate?: number;
}

export interface CourseStats {
  totalCourses: number;
  activeCourses: number;
  completedCourses: number;
  averageProgress: number;
  completionRate: number;
  satisfactionRate?: number;
  revenueGenerated?: number;
}

// 机构Dashboard整体数据
export interface OrgDashboardData {
  overview: OrgOverview;
  courses: CourseInfo[];
  teachers: TeacherInfo[];
  students: StudentInfo[];
  enrollmentStats: EnrollmentStats;
  courseStats: CourseStats;
  recentActivities: Array<{
    id: number;
    type: 'enrollment' | 'course_start' | 'course_completion' | 'payment' | 'review';
    description: string;
    timestamp: string;
    user_name?: string;
  }>;
  alerts: Array<{
    id: number;
    type: 'license_expiring' | 'low_attendance' | 'course_full' | 'teacher_shortage' | 'payment_issue';
    message: string;
    severity: 'low' | 'medium' | 'high';
    createdAt: string;
  }>;
  lastUpdated: string;
}

@Injectable({
  providedIn: 'root',
})
export class OrgAdminService {
  private readonly API_BASE = environment.apiUrl + '/api/v1';
  private readonly EDUCATION_API_BASE = this.API_BASE + '/educational_institution';
  
  // 模拟数据标记（开发阶段使用）
  private useMockData = environment.production === false; // 开发环境使用模拟数据

  constructor(
    private http: HttpClient,
    private multiSourceService: MultiSourceLearningService
  ) {}

  /**
   * 获取机构概览数据
   * 优先尝试真实API，失败则回退到模拟数据
   */
  getOrgOverview(orgId: number): Observable<OrgOverview> {
    const headers = this.getAuthHeaders();
    
    // 尝试真实API
    return this.http.get<ApiResponse<OrgOverview>>(
      `${this.EDUCATION_API_BASE}/org/${orgId}/overview`,
      { headers }
    ).pipe(
      timeout(5000), // 5秒超时
      retry(2), // 失败重试2次
      map(response => {
        if (response.success && response.data) {
          return response.data;
        } else {
          throw new Error(response.message || '获取机构概览失败');
        }
      }),
      catchError(err => {
        console.warn('真实API获取机构概览失败，回退到模拟数据:', err);
        return this.getSimulatedOrgOverview(orgId);
      })
    );
  }

  /**
   * 获取机构课程列表
   */
  getOrgCourses(orgId: number): Observable<CourseInfo[]> {
    const headers = this.getAuthHeaders();
    
    return this.http.get<ApiResponse<PaginatedResponse<CourseInfo>>>(
      `${this.EDUCATION_API_BASE}/org/${orgId}/courses`,
      { headers }
    ).pipe(
      timeout(5000),
      retry(2),
      map(response => {
        if (response.success && response.data) {
          return response.data.items;
        } else {
          throw new Error(response.message || '获取课程列表失败');
        }
      }),
      catchError(err => {
        console.warn('真实API获取课程列表失败，回退到模拟数据:', err);
        return this.getSimulatedCourses(orgId);
      })
    );
  }

  /**
   * 获取课程报名统计
   */
  getEnrollmentStats(orgId: number): Observable<EnrollmentStats> {
    const headers = this.getAuthHeaders();
    
    return this.http.get<ApiResponse<EnrollmentStats>>(
      `${this.EDUCATION_API_BASE}/org/${orgId}/enrollment/stats`,
      { headers }
    ).pipe(
      timeout(5000),
      retry(2),
      map(response => {
        if (response.success && response.data) {
          return response.data;
        } else {
          throw new Error(response.message || '获取报名统计失败');
        }
      }),
      catchError(err => {
        console.warn('真实API获取报名统计失败，回退到模拟数据:', err);
        return this.getSimulatedEnrollmentStats(orgId);
      })
    );
  }

  /**
   * 获取机构教师列表
   */
  getOrgTeachers(orgId: number): Observable<TeacherInfo[]> {
    const headers = this.getAuthHeaders();
    
    return this.http.get<ApiResponse<PaginatedResponse<TeacherInfo>>>(
      `${this.EDUCATION_API_BASE}/org/${orgId}/teachers`,
      { headers }
    ).pipe(
      timeout(5000),
      retry(2),
      map(response => {
        if (response.success && response.data) {
          return response.data.items;
        } else {
          throw new Error(response.message || '获取教师列表失败');
        }
      }),
      catchError(err => {
        console.warn('真实API获取教师列表失败，回退到模拟数据:', err);
        return this.getSimulatedTeachers(orgId);
      })
    );
  }

  /**
   * 获取机构学员列表
   */
  getOrgStudents(orgId: number): Observable<StudentInfo[]> {
    const headers = this.getAuthHeaders();
    
    return this.http.get<ApiResponse<PaginatedResponse<StudentInfo>>>(
      `${this.EDUCATION_API_BASE}/org/${orgId}/students`,
      { headers }
    ).pipe(
      timeout(5000),
      retry(2),
      map(response => {
        if (response.success && response.data) {
          return response.data.items;
        } else {
          throw new Error(response.message || '获取学员列表失败');
        }
      }),
      catchError(err => {
        console.warn('真实API获取学员列表失败，回退到模拟数据:', err);
        return this.getSimulatedStudents(orgId);
      })
    );
  }

  /**
   * 获取课程统计
   */
  getCourseStats(orgId: number): Observable<CourseStats> {
    const headers = this.getAuthHeaders();
    
    return this.http.get<ApiResponse<CourseStats>>(
      `${this.EDUCATION_API_BASE}/org/${orgId}/course/stats`,
      { headers }
    ).pipe(
      timeout(5000),
      retry(2),
      map(response => {
        if (response.success && response.data) {
          return response.data;
        } else {
          throw new Error(response.message || '获取课程统计失败');
        }
      }),
      catchError(err => {
        console.warn('真实API获取课程统计失败，回退到模拟数据:', err);
        return this.getSimulatedCourseStats(orgId);
      })
    );
  }

  /**
   * 获取机构Dashboard完整数据（一次性获取所有数据，提高性能）
   */
  getOrgDashboard(orgId: number): Observable<OrgDashboardData> {
    if (this.useMockData) {
      return this.getSimulatedOrgDashboard(orgId);
    }
    
    const headers = this.getAuthHeaders();
    
    return this.http.get<ApiResponse<OrgDashboardData>>(
      `${this.EDUCATION_API_BASE}/org/${orgId}/dashboard`,
      { headers }
    ).pipe(
      timeout(10000), // 10秒超时
      retry(2),
      map(response => {
        if (response.success && response.data) {
          return response.data;
        } else {
          throw new Error(response.message || '获取机构Dashboard失败');
        }
      }),
      catchError(err => {
        console.warn('真实API获取机构Dashboard失败，回退到模拟数据:', err);
        return this.getSimulatedOrgDashboard(orgId);
      })
    );
  }

  /**
   * 创建新课程
   */
  createCourse(orgId: number, courseData: Partial<CourseInfo>): Observable<CourseInfo> {
    const headers = this.getAuthHeaders();
    
    return this.http.post<ApiResponse<CourseInfo>>(
      `${this.EDUCATION_API_BASE}/org/${orgId}/courses`,
      courseData,
      { headers }
    ).pipe(
      timeout(8000),
      map(response => {
        if (response.success && response.data) {
          return response.data;
        } else {
          throw new Error(response.message || '创建课程失败');
        }
      }),
      catchError(err => {
        console.error('创建课程失败:', err);
        return throwError(() => new Error('创建课程失败，请稍后重试'));
      })
    );
  }

  /**
   * 更新课程信息
   */
  updateCourse(orgId: number, courseId: number, courseData: Partial<CourseInfo>): Observable<CourseInfo> {
    const headers = this.getAuthHeaders();
    
    return this.http.put<ApiResponse<CourseInfo>>(
      `${this.EDUCATION_API_BASE}/org/${orgId}/courses/${courseId}`,
      courseData,
      { headers }
    ).pipe(
      timeout(8000),
      map(response => {
        if (response.success && response.data) {
          return response.data;
        } else {
          throw new Error(response.message || '更新课程失败');
        }
      }),
      catchError(err => {
        console.error('更新课程失败:', err);
        return throwError(() => new Error('更新课程失败，请稍后重试'));
      })
    );
  }

  /**
   * 添加新教师
   */
  addTeacher(orgId: number, teacherData: Partial<TeacherInfo>): Observable<TeacherInfo> {
    const headers = this.getAuthHeaders();
    
    return this.http.post<ApiResponse<TeacherInfo>>(
      `${this.EDUCATION_API_BASE}/org/${orgId}/teachers`,
      teacherData,
      { headers }
    ).pipe(
      timeout(8000),
      map(response => {
        if (response.success && response.data) {
          return response.data;
        } else {
          throw new Error(response.message || '添加教师失败');
        }
      }),
      catchError(err => {
        console.error('添加教师失败:', err);
        return throwError(() => new Error('添加教师失败，请稍后重试'));
      })
    );
  }

  /**
   * 添加新学员
   */
  addStudent(orgId: number, studentData: Partial<StudentInfo>): Observable<StudentInfo> {
    const headers = this.getAuthHeaders();
    
    return this.http.post<ApiResponse<StudentInfo>>(
      `${this.EDUCATION_API_BASE}/org/${orgId}/students`,
      studentData,
      { headers }
    ).pipe(
      timeout(8000),
      map(response => {
        if (response.success && response.data) {
          return response.data;
        } else {
          throw new Error(response.message || '添加学员失败');
        }
      }),
      catchError(err => {
        console.error('添加学员失败:', err);
        return throwError(() => new Error('添加学员失败，请稍后重试'));
      })
    );
  }

  /**
   * 更新学员学习进度
   */
  updateStudentProgress(orgId: number, studentId: number, progressData: {
    courseId: number;
    progress: number;
    attendanceRate: number;
    averageScore: number;
  }): Observable<StudentInfo> {
    const headers = this.getAuthHeaders();
    
    return this.http.put<ApiResponse<StudentInfo>>(
      `${this.EDUCATION_API_BASE}/org/${orgId}/students/${studentId}/progress`,
      progressData,
      { headers }
    ).pipe(
      timeout(8000),
      map(response => {
        if (response.success && response.data) {
          return response.data;
        } else {
          throw new Error(response.message || '更新学员进度失败');
        }
      }),
      catchError(err => {
        console.error('更新学员进度失败:', err);
        return throwError(() => new Error('更新学员进度失败，请稍后重试'));
      })
    );
  }

  /**
   * 获取多源学习整合的教师数据
   */
  getMultiSourceTeacherData(teacherId: number): Observable<any> {
    return this.multiSourceService.getUserUnifiedProgress(teacherId).pipe(
      map(response => ({
        teacher_id: teacherId,
        organizations: [],
        unified_progress: {
          total_students: 0,
          average_progress_across_orgs: response.average_score || 0,
          active_courses_count: response.in_progress_courses || 0,
          pending_assignments_count: 0
        },
        learning_sources: []
      })),
      catchError(err => {
        console.error('获取多源教师数据失败:', err);
        return of({
          teacher_id: teacherId,
          organizations: [],
          unified_progress: {
            total_students: 0,
            average_progress_across_orgs: 0,
            active_courses_count: 0,
            pending_assignments_count: 0
          },
          learning_sources: []
        });
      })
    );
  }

  private getAuthHeaders(): HttpHeaders {
    const token = typeof localStorage !== 'undefined' ? localStorage.getItem('auth_token') : null;
    return new HttpHeaders({
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    });
  }

  private getSimulatedOrgOverview(orgId: number): Observable<OrgOverview> {
    return of({
      studentCount: Math.floor(Math.random() * 500 + 100),
      teacherCount: Math.floor(Math.random() * 50 + 10),
      activeCourses: Math.floor(Math.random() * 30 + 5),
      activeMembers: Math.floor(Math.random() * 600 + 150)
    });
  }

  private getSimulatedCourses(orgId: number): Observable<CourseInfo[]> {
    const categories = ['数学', '语文', '英语', '物理', '化学'];
    return of(Array.from({ length: 5 }, (_, i) => ({
      id: i + 1, org_id: orgId, name: `${categories[i]}强化班`,
      category: categories[i], enrollmentCount: Math.floor(Math.random() * 30 + 10),
      capacity: 40, status: 'ongoing' as const, startDate: '2026-03-01',
      endDate: '2026-06-30', teacherName: `教师${i + 1}`
    })));
  }

  private getSimulatedEnrollmentStats(orgId: number): Observable<EnrollmentStats> {
    return of({
      totalEnrollments: 200, activeEnrollments: 150, completedEnrollments: 50, dropoutRate: 5
    });
  }

  private getSimulatedTeachers(orgId: number): Observable<TeacherInfo[]> {
    const names = ['张老师', '李老师', '王老师', '刘老师', '陈老师'];
    return of(Array.from({ length: 5 }, (_, i) => ({
      id: i + 1, user_id: 1000 + i, org_id: orgId, name: names[i],
      email: `teacher${i + 1}@school.edu.cn`, department: '数学组',
      courseCount: 3, totalHours: 150, activeHours: 100, status: 'active' as const
    })));
  }

  private getSimulatedStudents(orgId: number): Observable<StudentInfo[]> {
    return of(Array.from({ length: 10 }, (_, i) => ({
      id: i + 1, user_id: 2000 + i, org_id: orgId, name: `学员${i + 1}`,
      email: `student${i + 1}@school.edu.cn`, grade: '高一', class_name: '1班',
      enrolledCourses: 3, progress: 75, attendanceRate: 90, averageScore: 82,
      lastActivity: new Date().toISOString(), status: 'active' as const
    })));
  }

  private getSimulatedCourseStats(orgId: number): Observable<CourseStats> {
    return of({
      totalCourses: 15, activeCourses: 8, completedCourses: 5, averageProgress: 72, completionRate: 80
    }    );
  }

  private getSimulatedOrgDashboard(orgId: number): Observable<OrgDashboardData> {
    return forkJoin({
      overview: this.getSimulatedOrgOverview(orgId),
      courses: this.getSimulatedCourses(orgId),
      teachers: this.getSimulatedTeachers(orgId),
      students: this.getSimulatedStudents(orgId),
      enrollmentStats: this.getSimulatedEnrollmentStats(orgId),
      courseStats: this.getSimulatedCourseStats(orgId)
    }).pipe(
      map(data => ({
        ...data,
        recentActivities: [
          { id: 1, type: 'enrollment' as const, description: '新学员报名成功', timestamp: new Date().toISOString() }
        ],
        alerts: [
          { id: 1, type: 'course_full' as const, message: '英语班已满员', severity: 'medium' as const, createdAt: new Date().toISOString() }
        ],
        lastUpdated: new Date().toISOString()
      }))
    );
  }

  /**
   * 删除课程
   */
  deleteCourse(courseId: number): Observable<{ success: boolean; message?: string }> {
    const headers = this.getAuthHeaders();
    
    return this.http.delete<ApiResponse<{ success: boolean; message?: string }>>(
      `${this.EDUCATION_API_BASE}/courses/${courseId}`,
      { headers }
    ).pipe(
      timeout(5000),
      map(response => {
        if (response.success && response.data) {
          return response.data;
        } else {
          throw new Error(response.message || '删除课程失败');
        }
      }),
      catchError(err => {
        console.error('删除课程失败:', err);
        // 模拟删除成功（用于开发环境）
        if (this.useMockData) {
          return of({ success: true, message: '课程已成功删除（模拟数据）' });
        }
        return throwError(() => new Error('删除课程失败，请稍后重试'));
      })
    );
  }
}


