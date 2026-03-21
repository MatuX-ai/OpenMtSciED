import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute } from '@angular/router';
import { Subscription, forkJoin, Observable } from 'rxjs';

import {
  DashboardData,
  Organization,
  OrganizationDashboardService,
} from './organization-dashboard.service';
import { OrganizationEditDialogComponent } from './organization-edit-dialog.component';
import { 
  OrgAdminService, 
  OrgOverview, 
  CourseInfo, 
  TeacherInfo, 
  StudentInfo,
  EnrollmentStats,
  CourseStats 
} from '../../core/services/org-admin.service';

@Component({
  selector: 'app-organization-dashboard',
  template: `
    <div class="organization-dashboard">
      <!-- 页面头部 -->
      <div class="dashboard-header">
        <div class="header-content">
          <h1>
            <mat-icon>business</mat-icon>
            {{ organization?.name || '机构仪表盘' }}
          </h1>
          <div class="header-actions">
            <button mat-raised-button color="primary" (click)="openEditDialog()">
              <mat-icon>edit</mat-icon>
              编辑信息
            </button>
            <button mat-raised-button (click)="refreshData()">
              <mat-icon>refresh</mat-icon>
              刷新
            </button>
          </div>
        </div>
      </div>

      <!-- 加载状态 -->
      <div *ngIf="loading" class="loading-container">
        <mat-spinner diameter="50"></mat-spinner>
        <p>正在加载仪表盘数据...</p>
      </div>

      <!-- 主要内容区域 -->
      <div *ngIf="!loading && dashboardData" class="dashboard-content">
        <!-- 统计卡片 -->
        <div class="stats-grid">
          <mat-card class="stat-card">
            <mat-card-content>
              <div class="stat-header">
                <mat-icon class="stat-icon active">vpn_key</mat-icon>
                <h3>活跃许可证</h3>
              </div>
              <div class="stat-value">{{ dashboardData.statistics.activeLicenses }}</div>
              <div class="stat-footer">剩余: {{ dashboardData.statistics.licenseRemaining }}</div>
            </mat-card-content>
          </mat-card>

          <mat-card class="stat-card">
            <mat-card-content>
              <div class="stat-header">
                <mat-icon class="stat-icon projects">folder</mat-icon>
                <h3>项目总数</h3>
              </div>
              <div class="stat-value">{{ dashboardData.statistics.totalProjects }}</div>
              <div class="stat-footer">实时统计</div>
            </mat-card-content>
          </mat-card>

          <mat-card class="stat-card">
            <mat-card-content>
              <div class="stat-header">
                <mat-icon class="stat-icon users">people</mat-icon>
                <h3>用户总数</h3>
              </div>
              <div class="stat-value">{{ dashboardData.statistics.totalUsers }}</div>
              <div class="stat-footer">当前活跃用户</div>
            </mat-card-content>
          </mat-card>

          <mat-card class="stat-card">
            <mat-card-content>
              <div class="stat-header">
                <mat-icon class="stat-icon hardware">memory</mat-icon>
                <h3>硬件消耗</h3>
              </div>
              <div class="stat-value">{{ dashboardData.statistics.hardwareConsumption }}</div>
              <div class="stat-footer">单位: 小时</div>
            </mat-card-content>
          </mat-card>
        </div>

        <!-- 图表区域（暂未启用） -->
        <div class="charts-placeholder">
          <mat-card>
            <mat-card-content>
              <p>图表功能正在开发中...</p>
            </mat-card-content>
          </mat-card>
        </div>

        <!-- 最近活动和警报 -->
        <div class="activities-alerts-grid">
          <mat-card class="activities-card">
            <mat-card-header>
              <mat-card-title>最近活动</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="activity-list">
                <div
                  *ngFor="let activity of dashboardData.recentActivities"
                  class="activity-item"
                  [class.warning]="activity.severity === 'warning'"
                  [class.error]="activity.severity === 'error'"
                >
                  <mat-icon class="activity-icon">{{ getActivityIcon(activity.type) }}</mat-icon>
                  <div class="activity-content">
                    <div class="activity-description">{{ activity.description }}</div>
                    <div class="activity-time">{{ formatTime(activity.timestamp) }}</div>
                  </div>
                </div>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="alerts-card">
            <mat-card-header>
              <mat-card-title>系统警报</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="alert-list">
                <div
                  *ngFor="let alert of dashboardData.alerts"
                  class="alert-item"
                  [class.low]="alert.severity === 'low'"
                  [class.medium]="alert.severity === 'medium'"
                  [class.high]="alert.severity === 'high'"
                >
                  <mat-icon class="alert-icon">{{ getAlertIcon(alert.type) }}</mat-icon>
                  <div class="alert-content">
                    <div class="alert-message">{{ alert.message }}</div>
                    <div class="alert-time">{{ formatTime(alert.createdAt) }}</div>
                  </div>
                </div>
              </div>
            </mat-card-content>
          </mat-card>
        </div>
      </div>

      <!-- 错误状态 -->
      <div *ngIf="!loading && !dashboardData && error" class="error-container">
        <mat-icon class="error-icon">error</mat-icon>
        <h3>加载失败</h3>
        <p>{{ error }}</p>
        <button mat-raised-button color="primary" (click)="refreshData()">重试</button>
      </div>

      <!-- 教育场景模块：机构概览 -->
      <div *ngIf="!loading && !educationLoading && orgOverview" class="education-section">
        <div class="section-header">
          <h2 class="section-title">机构概览</h2>
          <div class="section-actions">
            <button mat-raised-button color="primary" (click)="refreshData()">
              <mat-icon>refresh</mat-icon>
              刷新数据
            </button>
          </div>
        </div>
        
        <div class="stats-grid">
          <mat-card class="stat-card">
            <mat-card-content>
              <div class="stat-header">
                <mat-icon class="stat-icon students">school</mat-icon>
                <h3>学生总数</h3>
              </div>
              <div class="stat-value">{{ orgOverview.studentCount }}</div>
              <div class="stat-footer">在读学员</div>
            </mat-card-content>
          </mat-card>

          <mat-card class="stat-card">
            <mat-card-content>
              <div class="stat-header">
                <mat-icon class="stat-icon teachers">people</mat-icon>
                <h3>教师总数</h3>
              </div>
              <div class="stat-value">{{ orgOverview.teacherCount }}</div>
              <div class="stat-footer">在职教师</div>
            </mat-card-content>
          </mat-card>

          <mat-card class="stat-card">
            <mat-card-content>
              <div class="stat-header">
                <mat-icon class="stat-icon courses">class</mat-icon>
                <h3>活跃课程</h3>
              </div>
              <div class="stat-value">{{ orgOverview.activeCourses }}</div>
              <div class="stat-footer">进行中</div>
            </mat-card-content>
          </mat-card>

          <mat-card class="stat-card">
            <mat-card-content>
              <div class="stat-header">
                <mat-icon class="stat-icon members">group</mat-icon>
                <h3>总成员</h3>
              </div>
              <div class="stat-value">{{ orgOverview.activeMembers }}</div>
              <div class="stat-footer">活跃成员</div>
            </mat-card-content>
          </mat-card>
          
          <!-- 扩展数据统计 -->
          <mat-card class="stat-card" *ngIf="enrollmentStats">
            <mat-card-content>
              <div class="stat-header">
                <mat-icon class="stat-icon enrollment">how_to_reg</mat-icon>
                <h3>总报名数</h3>
              </div>
              <div class="stat-value">{{ enrollmentStats.totalEnrollments }}</div>
              <div class="stat-footer">
                留存率: {{ enrollmentStats.retentionRate || 0 }}%
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="stat-card" *ngIf="courseStats">
            <mat-card-content>
              <div class="stat-header">
                <mat-icon class="stat-icon completion">done_all</mat-icon>
                <h3>完成率</h3>
              </div>
              <div class="stat-value">{{ courseStats.completionRate || 0 }}%</div>
              <div class="stat-footer">
                平均进度: {{ courseStats.averageProgress || 0 }}%
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="stat-card" *ngIf="orgOverview.totalRevenue">
            <mat-card-content>
              <div class="stat-header">
                <mat-icon class="stat-icon revenue">attach_money</mat-icon>
                <h3>总收入</h3>
              </div>
              <div class="stat-value">¥{{ orgOverview.totalRevenue | number }}</div>
              <div class="stat-footer">
                本月收入
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="stat-card" *ngIf="orgOverview.satisfactionRate">
            <mat-card-content>
              <div class="stat-header">
                <mat-icon class="stat-icon satisfaction">star</mat-icon>
                <h3>满意度</h3>
              </div>
              <div class="stat-value">{{ orgOverview.satisfactionRate }}%</div>
              <div class="stat-footer">
                客户评价
              </div>
            </mat-card-content>
          </mat-card>
        </div>
      </div>

      <!-- 教育模块加载状态 -->
      <div *ngIf="educationLoading" class="education-loading">
        <mat-spinner diameter="40"></mat-spinner>
        <p>正在加载教育模块数据...</p>
      </div>

      <!-- 教育场景模块：课程运营与师生管理 -->
      <div *ngIf="!loading && !educationLoading && !educationError" class="education-section">
        <mat-tab-group>
          <!-- 课程运营模块 -->
          <mat-tab label="课程运营">
            <div class="tab-content">
              <div class="tab-header">
                <h3>课程列表</h3>
                <button mat-raised-button color="primary">
                  <mat-icon>add</mat-icon>
                  添加课程
                </button>
              </div>
              <mat-card>
                <mat-card-content>
                  <table mat-table [dataSource]="courses" class="edu-table" *ngIf="courses.length > 0; else noCourses">
                    <ng-container matColumnDef="name">
                      <th mat-header-cell *matHeaderCellDef>课程名称</th>
                      <td mat-cell *matCellDef="let course">{{ course.name }}</td>
                    </ng-container>
                    <ng-container matColumnDef="category">
                      <th mat-header-cell *matHeaderCellDef>类别</th>
                      <td mat-cell *matCellDef="let course">
                        <mat-chip>{{ course.category }}</mat-chip>
                      </td>
                    </ng-container>
                    <ng-container matColumnDef="enrollmentCount">
                      <th mat-header-cell *matHeaderCellDef>报名人数</th>
                      <td mat-cell *matCellDef="let course">{{ course.enrollmentCount }}</td>
                    </ng-container>
                    <ng-container matColumnDef="actions">
                      <th mat-header-cell *matHeaderCellDef>操作</th>
                      <td mat-cell *matCellDef="let course">
                        <button mat-icon-button color="primary" [matTooltip]="'查看详情'">
                          <mat-icon>visibility</mat-icon>
                        </button>
                        <button mat-icon-button color="accent" [matTooltip]="'编辑课程'">
                          <mat-icon>edit</mat-icon>
                        </button>
                        <button mat-icon-button color="warn" [matTooltip]="'删除课程'" (click)="confirmDeleteCourse(course)">
                          <mat-icon>delete</mat-icon>
                        </button>
                      </td>
                    </ng-container>
                    
                    <ng-container matColumnDef="status">
                      <th mat-header-cell *matHeaderCellDef>状态</th>
                      <td mat-cell *matCellDef="let course">
                        <mat-chip [color]="getCourseStatusColor(course.status)" selected>
                          {{ getCourseStatusText(course.status) }}
                        </mat-chip>
                      </td>
                    </ng-container>
                    <tr mat-header-row *matHeaderRowDef="courseColumns"></tr>
                    <tr mat-row *matRowDef="let row; columns: courseColumns;"></tr>
                  </table>
                  <ng-template #noCourses>
                    <div class="empty-state">
                      <mat-icon>class</mat-icon>
                      <p>暂无课程数据</p>
                    </div>
                  </ng-template>
                </mat-card-content>
              </mat-card>
            </div>
          </mat-tab>

          <!-- 教师管理模块 -->
          <mat-tab label="教师管理">
            <div class="tab-content">
              <div class="tab-header">
                <h3>教师列表</h3>
                <button mat-raised-button color="primary">
                  <mat-icon>person_add</mat-icon>
                  添加教师
                </button>
              </div>
              <mat-card>
                <mat-card-content>
                  <table mat-table [dataSource]="teachers" class="edu-table" *ngIf="teachers.length > 0; else noTeachers">
                    <ng-container matColumnDef="name">
                      <th mat-header-cell *matHeaderCellDef>姓名</th>
                      <td mat-cell *matCellDef="let teacher">{{ teacher.name }}</td>
                    </ng-container>
                    <ng-container matColumnDef="email">
                      <th mat-header-cell *matHeaderCellDef>邮箱</th>
                      <td mat-cell *matCellDef="let teacher">{{ teacher.email }}</td>
                    </ng-container>
                    <ng-container matColumnDef="department">
                      <th mat-header-cell *matHeaderCellDef>部门</th>
                      <td mat-cell *matCellDef="let teacher">{{ teacher.department }}</td>
                    </ng-container>
                    <ng-container matColumnDef="courseCount">
                      <th mat-header-cell *matHeaderCellDef>课程数</th>
                      <td mat-cell *matCellDef="let teacher">{{ teacher.courseCount }}</td>
                    </ng-container>
                    <ng-container matColumnDef="status">
                      <th mat-header-cell *matHeaderCellDef>状态</th>
                      <td mat-cell *matCellDef="let teacher">
                        <mat-chip [color]="teacher.status === 'active' ? 'primary' : 'warn'">
                          {{ teacher.status === 'active' ? '在职' : '离职' }}
                        </mat-chip>
                      </td>
                    </ng-container>
                    <tr mat-header-row *matHeaderRowDef="teacherColumns"></tr>
                    <tr mat-row *matRowDef="let row; columns: teacherColumns;"></tr>
                  </table>
                  <ng-template #noTeachers>
                    <div class="empty-state">
                      <mat-icon>people</mat-icon>
                      <p>暂无教师数据</p>
                    </div>
                  </ng-template>
                </mat-card-content>
              </mat-card>
            </div>
          </mat-tab>

          <!-- 学员管理模块 -->
          <mat-tab label="学员管理">
            <div class="tab-content">
              <div class="tab-header">
                <h3>学员列表</h3>
                <button mat-raised-button color="primary">
                  <mat-icon>person_add</mat-icon>
                  添加学员
                </button>
              </div>
              <mat-card>
                <mat-card-content>
                  <table mat-table [dataSource]="students" class="edu-table" *ngIf="students.length > 0; else noStudents">
                    <ng-container matColumnDef="name">
                      <th mat-header-cell *matHeaderCellDef>姓名</th>
                      <td mat-cell *matCellDef="let student">{{ student.name }}</td>
                    </ng-container>
                    <ng-container matColumnDef="email">
                      <th mat-header-cell *matHeaderCellDef>邮箱</th>
                      <td mat-cell *matCellDef="let student">{{ student.email }}</td>
                    </ng-container>
                    <ng-container matColumnDef="grade">
                      <th mat-header-cell *matHeaderCellDef>年级</th>
                      <td mat-cell *matCellDef="let student">{{ student.grade }}</td>
                    </ng-container>
                    <ng-container matColumnDef="enrolledCourses">
                      <th mat-header-cell *matHeaderCellDef>已报名课程</th>
                      <td mat-cell *matCellDef="let student">{{ student.enrolledCourses }}</td>
                    </ng-container>
                    <ng-container matColumnDef="progress">
                      <th mat-header-cell *matHeaderCellDef>学习进度</th>
                      <td mat-cell *matCellDef="let student">{{ student.progress }}%</td>
                    </ng-container>
                    <tr mat-header-row *matHeaderRowDef="studentColumns"></tr>
                    <tr mat-row *matRowDef="let row; columns: studentColumns;"></tr>
                  </table>
                  <ng-template #noStudents>
                    <div class="empty-state">
                      <mat-icon>school</mat-icon>
                      <p>暂无学员数据</p>
                    </div>
                  </ng-template>
                </mat-card-content>
              </mat-card>
            </div>
          </mat-tab>
        </mat-tab-group>
      </div>
    </div>
  `,
  styles: [
    `
      .organization-dashboard {
        padding: 24px;
        max-width: 1600px;
        margin: 0 auto;
      }

      .dashboard-header {
        margin-bottom: 32px;
      }

      .header-content {
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
        gap: 16px;
      }

      .header-content h1 {
        margin: 0;
        display: flex;
        align-items: center;
        gap: 12px;
        color: #333;
        font-size: 2rem;
      }

      .header-actions {
        display: flex;
        gap: 12px;
      }

      .loading-container,
      .error-container,
      .education-loading {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 64px 24px;
        text-align: center;
      }

      .education-loading {
        padding: 40px 24px;
        margin: 32px 0;
        border-radius: 12px;
        background-color: #f8f9fa;
        border: 1px solid #e9ecef;
      }

      .education-loading p {
        margin-top: 16px;
        color: #666;
        font-size: 0.95rem;
      }

      .education-error {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 40px 24px;
        margin: 32px 0;
        border-radius: 12px;
        background-color: #fff3cd;
        border: 1px solid #ffeaa7;
        color: #856404;
      }

      .education-error mat-icon {
        font-size: 48px;
        width: 48px;
        height: 48px;
        margin-bottom: 16px;
        color: #ff9800;
      }

      .education-error button {
        margin-top: 16px;
      }

      .error-container .error-icon {
        font-size: 48px;
        width: 48px;
        height: 48px;
        color: #f44336;
        margin-bottom: 16px;
      }

      .stats-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: 24px;
        margin-bottom: 32px;
      }

      .stat-card {
        border-radius: 12px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        transition:
          transform 0.2s,
          box-shadow 0.2s;
      }

      .stat-card:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
      }

      .stat-header {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 16px;
      }

      .stat-icon {
        font-size: 28px;
        width: 28px;
        height: 28px;
        border-radius: 50%;
        padding: 12px;
        color: white;
      }

      .stat-icon.active {
        background: linear-gradient(135deg, #4caf50, #2e7d32);
      }
      .stat-icon.projects {
        background: linear-gradient(135deg, #2196f3, #1565c0);
      }
      .stat-icon.users {
        background: linear-gradient(135deg, #ff9800, #ef6c00);
      }
      .stat-icon.hardware {
        background: linear-gradient(135deg, #9c27b0, #6a1b9a);
      }
      
      .stat-icon.students {
        background: linear-gradient(135deg, #00bcd4, #00838f);
      }
      .stat-icon.teachers {
        background: linear-gradient(135deg, #ff9800, #ef6c00);
      }
      .stat-icon.courses {
        background: linear-gradient(135deg, #4caf50, #2e7d32);
      }
      .stat-icon.members {
        background: linear-gradient(135deg, #3f51b5, #283593);
      }
      .stat-icon.enrollment {
        background: linear-gradient(135deg, #e91e63, #ad1457);
      }
      .stat-icon.completion {
        background: linear-gradient(135deg, #673ab7, #4527a0);
      }
      .stat-icon.revenue {
        background: linear-gradient(135deg, #ffc107, #ff8f00);
      }
      .stat-icon.satisfaction {
        background: linear-gradient(135deg, #9c27b0, #6a1b9a);
      }

      .stat-card h3 {
        margin: 0;
        font-size: 1.1rem;
        color: #666;
        font-weight: 500;
      }

      .stat-value {
        font-size: 2.5rem;
        font-weight: 700;
        color: #333;
        margin: 8px 0;
      }

      .stat-footer {
        font-size: 0.9rem;
        color: #888;
        font-weight: 500;
      }

      .charts-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
        gap: 24px;
        margin-bottom: 32px;
      }

      .chart-card {
        border-radius: 12px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      }

      .chart-card mat-card-header {
        padding: 16px 24px 0 24px;
      }

      .chart-card mat-card-title {
        font-size: 1.2rem;
        font-weight: 600;
        color: #333;
      }

      .chart-container {
        height: 300px;
        width: 100%;
      }

      .activities-alerts-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 24px;
      }

      .activities-card,
      .alerts-card {
        border-radius: 12px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      }

      .activity-list,
      .alert-list {
        max-height: 300px;
        overflow-y: auto;
      }

      .activity-item,
      .alert-item {
        display: flex;
        align-items: flex-start;
        gap: 12px;
        padding: 16px;
        border-bottom: 1px solid #eee;
      }

      .activity-item:last-child,
      .alert-item:last-child {
        border-bottom: none;
      }

      .activity-item.warning,
      .alert-item.medium {
        background-color: #fff3e0;
      }

      .activity-item.error,
      .alert-item.high {
        background-color: #ffebee;
      }

      .activity-icon,
      .alert-icon {
        font-size: 20px;
        width: 20px;
        height: 20px;
        margin-top: 2px;
      }

      .activity-content,
      .alert-content {
        flex: 1;
      }

      .activity-description,
      .alert-message {
        font-size: 0.95rem;
        color: #333;
        margin-bottom: 4px;
      }

      .activity-time,
      .alert-time {
        font-size: 0.8rem;
        color: #888;
      }

      /* 教育场景模块样式 */
      .education-section {
        margin-top: 32px;
      }

      .section-title {
        font-size: 1.5rem;
        font-weight: 600;
        margin: 0 0 20px 0;
        color: #333;
      }

      .stat-icon.students {
        background: linear-gradient(135deg, #4caf50, #2e7d32);
      }
      .stat-icon.teachers {
        background: linear-gradient(135deg, #2196f3, #1565c0);
      }
      .stat-icon.courses {
        background: linear-gradient(135deg, #ff9800, #ef6c00);
      }
      .stat-icon.members {
        background: linear-gradient(135deg, #9c27b0, #6a1b9a);
      }

      .tab-content {
        padding: 24px 0;
      }

      .tab-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
      }

      .tab-header h3 {
        margin: 0;
        font-size: 1.2rem;
        font-weight: 600;
        color: #333;
      }

      .edu-table {
        width: 100%;
      }

      .empty-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 48px;
        color: #999;
      }

      .empty-state mat-icon {
        font-size: 48px;
        width: 48px;
        height: 48px;
        margin-bottom: 12px;
      }

      @media (max-width: 1200px) {
        .charts-grid {
          grid-template-columns: 1fr;
        }
      }

      @media (max-width: 768px) {
        .organization-dashboard {
          padding: 16px;
        }

        .header-content {
          flex-direction: column;
          align-items: flex-start;
        }

        .header-actions {
          width: 100%;
          justify-content: flex-end;
        }

        .stats-grid {
          grid-template-columns: 1fr;
        }

        .activities-alerts-grid {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDialogModule,
    MatTableModule,
    MatChipsModule,
    MatTabsModule,
    MatTooltipModule,
  ],
})
export class OrganizationDashboardComponent implements OnInit, OnDestroy {
  organization: Organization | null = null;
  dashboardData: DashboardData | null = null;
  loading = true;
  error: string | null = null;

  // 教育模块数据
  orgOverview: OrgOverview | null = null;
  courses: CourseInfo[] = [];
  teachers: TeacherInfo[] = [];
  students: StudentInfo[] = [];
  
  // 新增教育模块数据（使用强类型）
  enrollmentStats: EnrollmentStats | null = null;
  courseStats: CourseStats | null = null;
  recentActivities: Array<{
    id: number;
    type: 'enrollment' | 'course_start' | 'course_completion' | 'payment' | 'review';
    description: string;
    timestamp: string;
    user_name?: string;
  }> = [];
  alerts: Array<{
    id: number;
    type: 'license_expiring' | 'low_attendance' | 'course_full' | 'teacher_shortage' | 'payment_issue';
    message: string;
    severity: 'low' | 'medium' | 'high';
    createdAt: string;
  }> = [];
  
  // 数据加载状态
  educationLoading = false;
  educationError = false;

  // 表格列定义
  courseColumns = ['name', 'category', 'enrollmentCount', 'status', 'actions'];
  teacherColumns = ['name', 'department', 'courseCount', 'activeHours', 'performanceScore', 'status'];
  studentColumns = ['name', 'grade', 'enrolledCourses', 'progress', 'attendanceRate', 'status'];

  private subscriptions: Subscription[] = [];
  private orgId!: number;

  constructor(
    private route: ActivatedRoute,
    private dashboardService: OrganizationDashboardService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private orgAdminService: OrgAdminService
  ) {}

  ngOnInit(): void {
    this.subscriptions.push(
      this.route.params.subscribe((params) => {
        this.orgId = +params['id'];
        this.dashboardService.setCurrentOrgId(this.orgId);
        this.loadData();
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  loadData(): void {
    this.loading = true;
    this.error = null;

    this.subscriptions.push(
      this.dashboardService.getDashboardData(this.orgId).subscribe({
        next: (data) => {
          this.dashboardData = data;
          this.organization = data.organization;
          this.setupCharts();
          this.loading = false;
        },
        error: (err) => {
          this.error = err.message || '加载数据失败';
          this.loading = false;
          this.snackBar.open('加载仪表盘数据失败', '关闭', {
            duration: 3000,
            panelClass: ['error-snackbar'],
          });
        },
      })
    );

    // 加载教育模块数据
    this.loadEducationData();
  }

  /**
   * 加载教育场景模块数据
   */
  /**
   * 加载教育场景模块数据（使用新的getOrgDashboard方法一次性获取所有数据）
   */
  loadEducationData(): void {
    this.educationLoading = true;
    this.educationError = false;

    this.subscriptions.push(
      this.orgAdminService.getOrgDashboard(this.orgId).subscribe({
        next: (dashboardData) => {
          // 解构Dashboard数据
          this.orgOverview = dashboardData.overview;
          this.courses = dashboardData.courses || [];
          this.teachers = dashboardData.teachers || [];
          this.students = dashboardData.students || [];
          this.enrollmentStats = dashboardData.enrollmentStats;
          this.courseStats = dashboardData.courseStats;
          this.recentActivities = dashboardData.recentActivities || [];
          this.alerts = dashboardData.alerts || [];
          
          this.educationLoading = false;
          this.showSnackbar('教育模块数据加载成功', 'success');
        },
        error: (err) => {
          console.error('加载教育模块数据失败:', err);
          this.educationError = true;
          this.educationLoading = false;
          
          // 尝试回退到独立API调用
          this.fallbackToIndividualAPIs();
        }
      })
    );
  }

  /**
   * 回退到独立API调用（当getOrgDashboard失败时使用）
   */
  private fallbackToIndividualAPIs(): void {
    console.log('尝试使用独立API调用回退...');
    
    const requests: [
      Observable<OrgOverview>,
      Observable<CourseInfo[]>,
      Observable<TeacherInfo[]>,
      Observable<StudentInfo[]>,
      Observable<EnrollmentStats>,
      Observable<CourseStats>
    ] = [
      this.orgAdminService.getOrgOverview(this.orgId),
      this.orgAdminService.getOrgCourses(this.orgId),
      this.orgAdminService.getOrgTeachers(this.orgId),
      this.orgAdminService.getOrgStudents(this.orgId),
      this.orgAdminService.getEnrollmentStats(this.orgId),
      this.orgAdminService.getCourseStats(this.orgId)
    ];

    this.subscriptions.push(
      forkJoin<[OrgOverview, CourseInfo[], TeacherInfo[], StudentInfo[], EnrollmentStats, CourseStats]>(requests).subscribe({
        next: (results) => {
          const [overview, courses, teachers, students, enrollmentStats, courseStats] = results;
          this.orgOverview = overview;
          this.courses = courses || [];
          this.teachers = teachers || [];
          this.students = students || [];
          this.enrollmentStats = enrollmentStats;
          this.courseStats = courseStats;
          
          this.showSnackbar('教育模块数据已使用回退模式加载', 'info');
        },
        error: (err) => {
          console.error('回退模式加载失败:', err);
          this.showSnackbar('无法加载教育模块数据', 'error');
        }
      })
    );
  }

  refreshData(): void {
    this.loadData();
  }

  setupCharts(): void {
    // 图表功能暂未启用
  }

  openEditDialog(): void {
    if (!this.organization) return;

    const dialogRef = this.dialog.open(OrganizationEditDialogComponent, {
      width: '600px',
      data: { organization: this.organization },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.updateOrganization(result);
      }
    });
  }

  updateOrganization(orgData: Partial<Organization>): void {
    if (!this.organization) return;

    this.subscriptions.push(
      this.dashboardService.updateOrganization(this.orgId, orgData).subscribe({
        next: (updatedOrg) => {
          this.organization = updatedOrg;
          this.showSnackbar('机构信息更新成功', 'success');
        },
        error: (err) => {
          this.showSnackbar('更新失败: ' + err.message, 'error');
        },
      })
    );
  }

  /**
   * 显示通知消息
   */
  private showSnackbar(message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info'): void {
    const panelClassMap = {
      success: ['success-snackbar'],
      error: ['error-snackbar'],
      info: [],
      warning: ['warning-snackbar']
    };

    this.snackBar.open(message, '关闭', {
      duration: 3000,
      panelClass: panelClassMap[type],
    });
  }

  getActivityIcon(type: string): string {
    const iconMap: Record<string, string> = {
      user_login: 'login',
      project_created: 'add',
      license_used: 'vpn_key',
      hardware_access: 'memory',
      default: 'info',
    };
    return iconMap[type] || iconMap['default'];
  }

  getAlertIcon(type: string): string {
    const iconMap: Record<string, string> = {
      license_expiring: 'warning',
      hardware_limit: 'memory',
      user_limit: 'people',
      default: 'error',
    };
    return iconMap[type] || iconMap['default'];
  }

  formatTime(timestamp: string): string {
    return new Date(timestamp).toLocaleString('zh-CN');
  }

  /**
   * 获取课程状态颜色
   */
  getCourseStatusColor(status: string): string {
    const statusColors: Record<string, string> = {
      'draft': 'basic',
      'published': 'primary',
      'ongoing': 'accent',
      'completed': 'warn',
      'archived': 'basic'
    };
    return statusColors[status] || 'basic';
  }

  /**
   * 获取课程状态文本
   */
  getCourseStatusText(status: string): string {
    const statusText: Record<string, string> = {
      'draft': '草稿',
      'published': '已发布',
      'ongoing': '进行中',
      'completed': '已完成',
      'archived': '已归档'
    };
    return statusText[status] || status;
  }

  /**
   * 确认删除课程
   */
  confirmDeleteCourse(course: CourseInfo): void {
    const dialogRef = this.dialog.open(OrganizationEditDialogComponent, {
      width: '400px',
      data: {
        title: '确认删除课程',
        message: `确定要删除课程"${course.name}"吗？此操作不可恢复。`,
        confirmButtonText: '删除',
        confirmButtonColor: 'warn',
        cancelButtonText: '取消'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.deleteCourse(course.id);
      }
    });
  }

  /**
   * 删除课程
   */
  private deleteCourse(courseId: number): void {
    // 这里调用API删除课程
    this.orgAdminService.deleteCourse(courseId).subscribe({
      next: () => {
        this.showSnackbar('课程删除成功', 'success');
        // 从列表中移除已删除的课程
        this.courses = this.courses.filter(c => c.id !== courseId);
      },
      error: (err) => {
        this.showSnackbar('删除失败: ' + err.message, 'error');
      }
    });
  }

  /**
   * 获取教师状态颜色
   */
  getTeacherStatusColor(status: string): string {
    const statusColors: Record<string, string> = {
      'active': 'primary',
      'on_leave': 'accent',
      'retired': 'warn',
      'inactive': 'basic'
    };
    return statusColors[status] || 'basic';
  }

  /**
   * 获取教师状态文本
   */
  getTeacherStatusText(status: string): string {
    const statusText: Record<string, string> = {
      'active': '在职',
      'on_leave': '请假中',
      'retired': '已退休',
      'inactive': '离职'
    };
    return statusText[status] || status;
  }

  /**
   * 获取学生状态颜色
   */
  getStudentStatusColor(status: string): string {
    const statusColors: Record<string, string> = {
      'active': 'primary',
      'graduated': 'accent',
      'transferred': 'warn',
      'suspended': 'warn',
      'inactive': 'basic'
    };
    return statusColors[status] || 'basic';
  }

  /**
   * 获取学生状态文本
   */
  getStudentStatusText(status: string): string {
    const statusText: Record<string, string> = {
      'active': '在读',
      'graduated': '已毕业',
      'transferred': '已转学',
      'suspended': '已停学',
      'inactive': '已退学'
    };
    return statusText[status] || status;
  }

  /**
   * 快速添加课程
   */
  quickAddCourse(): void {
    const dialogRef = this.dialog.open(OrganizationEditDialogComponent, {
      width: '500px',
      data: {
        title: '快速添加课程',
        formConfig: {
          fields: [
            { name: 'name', label: '课程名称', type: 'text', required: true },
            { name: 'category', label: '课程类别', type: 'text', required: true },
            { name: 'capacity', label: '最大容量', type: 'number', required: true },
            { name: 'description', label: '课程描述', type: 'textarea' }
          ]
        }
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.addCourse(result);
      }
    });
  }

  /**
   * 添加新课程
   */
  private addCourse(courseData: any): void {
    // 调用API添加课程
    this.orgAdminService.createCourse(this.orgId, courseData).subscribe({
      next: (newCourse) => {
        this.showSnackbar('课程添加成功', 'success');
        this.courses = [...this.courses, newCourse];
      },
      error: (err) => {
        this.showSnackbar('添加失败: ' + err.message, 'error');
      }
    });
  }

  /**
   * 刷新教育模块数据
   */
  refreshEducationData(): void {
    this.educationLoading = true;
    this.educationError = false;
    this.loadEducationData();
  }

  /**
   * 导出报表
   */
  exportReport(): void {
    this.showSnackbar('报表导出功能正在开发中...', 'info');
    // TODO: 实现报表导出逻辑
  }
}
