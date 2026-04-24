import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalCourses: number;
  totalPlatforms: number;
  systemHealth: string;
  elementaryCourses: number;
  middleCourses: number;
  highCourses: number;
  universityCourses: number;
  lastCrawlerRun: string | null;
  crawlerStatus: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatCardModule, MatIconModule, MatProgressSpinnerModule],
  template: `
    <div class="dashboard-container">
      <div class="header">
        <h1>OpenMTSciEd Admin</h1>
        <p class="subtitle">STEM教育资源管理平台</p>
        <button mat-icon-button (click)="refreshStats()" title="刷新数据">
          <mat-icon>refresh</mat-icon>
        </button>
      </div>

      <!-- 统计卡片 -->
      <div class="stats-grid" *ngIf="!loading(); else loadingTemplate">
        <!-- 核心指标 -->
        <mat-card class="stat-card primary-card courses-card">
          <mat-card-content>
            <div class="stat-icon">
              <mat-icon>school</mat-icon>
            </div>
            <div class="stat-info">
              <div class="stat-number">{{ stats()?.totalCourses || 0 }}</div>
              <div class="stat-label">STEM课程总数</div>
              <div class="stat-subtitle">小学: {{ stats()?.elementaryCourses || 0 }} | 初中: {{ stats()?.middleCourses || 0 }} | 高中: {{ stats()?.highCourses || 0 }}</div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card primary-card crawlers-card">
          <mat-card-content>
            <div class="stat-icon">
              <mat-icon>spider_web</mat-icon>
            </div>
            <div class="stat-info">
              <div class="stat-number">{{ stats()?.totalPlatforms || 0 }}</div>
              <div class="stat-label">数据源平台</div>
              <div class="stat-subtitle">状态: {{ stats()?.crawlerStatus || '待检测' }}</div>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- 次要指标 -->
        <mat-card class="stat-card secondary-card users-card">
          <mat-card-content>
            <div class="stat-icon">
              <mat-icon>people</mat-icon>
            </div>
            <div class="stat-info">
              <div class="stat-number">{{ stats()?.totalUsers || 0 }}</div>
              <div class="stat-label">总用户数</div>
              <div class="stat-subtitle">活跃: {{ stats()?.activeUsers || 0 }}</div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card secondary-card health-card">
          <mat-card-content>
            <div class="stat-icon">
              <mat-icon [color]="stats()?.systemHealth === 'healthy' ? 'primary' : 'warn'">
                {{ stats()?.systemHealth === 'healthy' ? 'check_circle' : 'warning' }}
              </mat-icon>
            </div>
            <div class="stat-info">
              <div class="stat-number">{{ stats()?.systemHealth === 'healthy' ? '正常' : '异常' }}</div>
              <div class="stat-label">系统状态</div>
              <div class="stat-subtitle">最后同步: {{ stats()?.lastCrawlerRun ? formatDate(stats()?.lastCrawlerRun ?? null) : '未知' }}</div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- 课程分布概览 -->
      <div class="course-distribution" *ngIf="!loading()">
        <mat-card class="distribution-card">
          <mat-card-header>
            <mat-card-title>课程分布概览</mat-card-title>
            <mat-card-subtitle>按教育阶段分类</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <div class="distribution-bars">
              <div class="distribution-item">
                <div class="bar-label">小学课程</div>
                <div class="bar-container">
                  <div class="bar bar-elementary" [style.width.%]="getCoursePercentage('elementary')"></div>
                </div>
                <div class="bar-value">{{ stats()?.elementaryCourses || 0 }}</div>
              </div>
              <div class="distribution-item">
                <div class="bar-label">初中课程</div>
                <div class="bar-container">
                  <div class="bar bar-middle" [style.width.%]="getCoursePercentage('middle')"></div>
                </div>
                <div class="bar-value">{{ stats()?.middleCourses || 0 }}</div>
              </div>
              <div class="distribution-item">
                <div class="bar-label">高中课程</div>
                <div class="bar-container">
                  <div class="bar bar-high" [style.width.%]="getCoursePercentage('high')"></div>
                </div>
                <div class="bar-value">{{ stats()?.highCourses || 0 }}</div>
              </div>
              <div class="distribution-item">
                <div class="bar-label">大学课程</div>
                <div class="bar-container">
                  <div class="bar bar-university" [style.width.%]="getCoursePercentage('university')"></div>
                </div>
                <div class="bar-value">{{ stats()?.universityCourses || 0 }}</div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <ng-template #loadingTemplate>
        <div class="loading-container">
          <mat-progress-spinner mode="indeterminate"></mat-progress-spinner>
          <p>加载统计数据...</p>
        </div>
      </ng-template>


    </div>
  `,
  styles: [`
    .dashboard-container {
      padding: 24px;
      background: #f5f7fa;
      min-height: 100vh;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 32px;
    }
    .header h1 {
      margin: 0 0 8px 0;
      color: #333;
      font-size: 28px;
    }
    .subtitle {
      margin: 0;
      color: #666;
      font-size: 16px;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      margin-bottom: 32px;
    }

    .stat-card {
      transition: transform 0.2s, box-shadow 0.2s;
      cursor: default;
    }
    .stat-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 16px rgba(0,0,0,0.1);
    }

    .stat-card mat-card-content {
      display: flex;
      align-items: center;
      padding: 20px;
    }

    .stat-icon {
      margin-right: 16px;
    }
    .stat-icon mat-icon {
      font-size: 40px;
      width: 40px;
      height: 40px;
    }

    .stat-info {
      flex: 1;
    }
    .stat-number {
      font-size: 24px;
      font-weight: bold;
      color: #333;
      margin-bottom: 4px;
    }
    .stat-label {
      font-size: 14px;
      color: #666;
      margin-bottom: 2px;
    }
    .stat-subtitle {
      font-size: 12px;
      color: #999;
    }

    .users-card { border-left: 4px solid #2196F3; }
    .courses-card { border-left: 4px solid #4CAF50; }
    .crawlers-card { border-left: 4px solid #FF9800; }
    .health-card { border-left: 4px solid #9C27B0; }

    .primary-card {
      background: linear-gradient(135deg, #f5f7fa 0%, #e8eaf6 100%);
      box-shadow: 0 4px 12px rgba(0,0,0,0.08);
    }

    .secondary-card {
      opacity: 0.9;
    }

    .primary-action {
      background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
      box-shadow: 0 4px 12px rgba(33,150,243,0.15);
    }

    .primary-action:hover {
      transform: translateY(-6px);
      box-shadow: 0 8px 20px rgba(33,150,243,0.25);
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px 20px;
      color: #666;
    }

    .course-distribution {
      margin-bottom: 32px;
    }

    .distribution-card {
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .distribution-bars {
      display: flex;
      flex-direction: column;
      gap: 20px;
      padding: 20px 0;
    }

    .distribution-item {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .bar-label {
      width: 100px;
      font-size: 14px;
      color: #666;
      flex-shrink: 0;
    }

    .bar-container {
      flex: 1;
      height: 24px;
      background: #e0e0e0;
      border-radius: 12px;
      overflow: hidden;
    }

    .bar {
      height: 100%;
      border-radius: 12px;
      transition: width 0.5s ease;
    }

    .bar-elementary {
      background: linear-gradient(90deg, #4CAF50 0%, #66BB6A 100%);
    }

    .bar-middle {
      background: linear-gradient(90deg, #2196F3 0%, #42A5F5 100%);
    }

    .bar-high {
      background: linear-gradient(90deg, #FF9800 0%, #FFA726 100%);
    }

    .bar-university {
      background: linear-gradient(90deg, #9C27B0 0%, #BA68C8 100%);
    }

    .bar-university {
      background: linear-gradient(90deg, #9C27B0 0%, #BA68C8 100%);
    }

    .bar-value {
      width: 50px;
      text-align: right;
      font-weight: bold;
      font-size: 16px;
      color: #333;
      flex-shrink: 0;
    }


  `]
})
export class DashboardComponent implements OnInit {
  private router = inject(Router);
  private http = inject(HttpClient);

  readonly loading = signal<boolean>(true);
  readonly stats = signal<DashboardStats | null>(null);

  ngOnInit(): void {
    this.loadStats();
  }

  async loadStats(): Promise<void> {
    this.loading.set(true);
    try {
      // 获取用户统计
      const userStats = await firstValueFrom(
        this.http.get<any>('/api/v1/users/stats')
      );

      // 获取平台状态
      const platformStatus = await firstValueFrom(
        this.http.get<any>('/api/v1/admin/education-platforms/status')
      );

      // 获取课程统计
      const courseStatsResponse = await firstValueFrom(
        this.http.get<any>('/api/v1/admin/courses/stats')
      );
      const courseStats = courseStatsResponse.data || courseStatsResponse;

      this.stats.set({
        totalUsers: userStats.totalUsers || 0,
        activeUsers: userStats.activeUsers || 0,
        totalCourses: courseStats.total || 0,
        totalPlatforms: Object.keys(platformStatus.data || {}).length,
        systemHealth: 'healthy',
        elementaryCourses: courseStats.elementary || 0,
        middleCourses: courseStats.middle || 0,
        highCourses: courseStats.high || 0,
        universityCourses: courseStats.university || 0,
        lastCrawlerRun: null,
        crawlerStatus: '正常'
      });
    } catch (error) {
      console.error('加载统计数据失败:', error);
      // 设置默认值
      this.stats.set({
        totalUsers: 0,
        activeUsers: 0,
        totalCourses: 0,
        totalPlatforms: 0,
        systemHealth: 'error',
        elementaryCourses: 0,
        middleCourses: 0,
        highCourses: 0,
        universityCourses: 0,
        lastCrawlerRun: null,
        crawlerStatus: '异常'
      });
    } finally {
      this.loading.set(false);
    }
  }

  async refreshStats(): Promise<void> {
    await this.loadStats();
  }

  formatDate(dateString: string | null): string {
    if (!dateString) return '未知';
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));

    if (hours < 1) return '刚刚';
    if (hours < 24) return `${hours}小时前`;
    return `${Math.floor(hours / 24)}天前`;
  }

  getCoursePercentage(level: string): number {
    const stats = this.stats();
    if (!stats || !stats.totalCourses) return 0;

    let count = 0;
    if (level === 'elementary') count = stats.elementaryCourses;
    else if (level === 'middle') count = stats.middleCourses;
    else if (level === 'high') count = stats.highCourses;
    else if (level === 'university') count = stats.universityCourses;

    return (count / stats.totalCourses) * 100;
  }

  navigate(route: string): void {
    this.router.navigate([route]);
  }
}
