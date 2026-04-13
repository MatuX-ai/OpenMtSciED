import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';

interface UserProfile {
  teacherName: string;
  schoolName: string;
  subject: string;
}

interface DashboardAction {
  title: string;
  description: string;
  icon: string;
  route: string;
  color: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatCardModule, MatIconModule],
  template: `
    <div class="dashboard-container">
      <!-- 顶部用户信息栏 -->
      <div class="header">
        <div class="user-info">
          <div class="avatar">{{ getInitial() }}</div>
          <div class="user-details">
            <h2>{{ profile.teacherName || '未设置' }}</h2>
            <p>{{ profile.schoolName || '未设置学校' }} · {{ getSubjectName() }}</p>
          </div>
        </div>
        <button mat-icon-button (click)="resetSetup()" title="重新设置">
          <i class="ri-settings-3-line"></i>
        </button>
      </div>

      <!-- 欢迎区域 -->
      <div class="welcome-section">
        <h1>欢迎回来，{{ profile.teacherName || '老师' }}！</h1>
        <p>今天是 {{ currentDate }}，准备好开始今天的教学了吗？</p>
      </div>

      <!-- 功能卡片网格 -->
      <div class="action-grid">
        <mat-card
          *ngFor="let action of actions"
          class="action-card"
          [class.hover-primary]="action.color === 'primary'"
          [class.hover-accent]="action.color === 'accent'"
          [class.hover-warn]="action.color === 'warn'"
          [class.hover-info]="action.color === 'info'"
          (click)="navigate(action.route)"
        >
          <mat-card-content>
            <div class="action-icon" [ngClass]="'icon-' + action.color">
              <i class="{{ action.icon }}"></i>
            </div>
            <h3>{{ action.title }}</h3>
            <p>{{ action.description }}</p>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- 快捷统计 -->
      <div class="stats-section">
        <h3>快速统计</h3>
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon icon-primary">
              <i class="ri-flask-line"></i>
            </div>
            <div class="stat-content">
              <span class="stat-value">-</span>
              <span class="stat-label">教程总数</span>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon icon-accent">
              <i class="ri-microscope-line"></i>
            </div>
            <div class="stat-content">
              <span class="stat-value">-</span>
              <span class="stat-label">课件总数</span>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon icon-info">
              <i class="ri-database-2-line"></i>
            </div>
            <div class="stat-content">
              <span class="stat-value">SQLite</span>
              <span class="stat-label">数据库状态</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 底部信息 -->
      <div class="footer">
        <p>OpenMTSciEd Desktop Manager v0.1.0</p>
        <p>数据存储位置: {{ dataPath }}</p>
      </div>
    </div>
  `,
  styles: [
    `
      .dashboard-container {
        min-height: 100vh;
        background: linear-gradient(135deg, #f5f7fa 0%, #e8ecf1 100%);
        padding: 24px;
      }

      .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 32px;
        padding-bottom: 16px;
        border-bottom: 2px solid #e0e0e0;
      }

      .user-info {
        display: flex;
        align-items: center;
        gap: 16px;
      }

      .avatar {
        width: 56px;
        height: 56px;
        border-radius: 50%;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 24px;
        font-weight: 600;
      }

      .user-details h2 {
        margin: 0;
        font-size: 24px;
        color: #333;
      }

      .user-details p {
        margin: 4px 0 0;
        color: #666;
        font-size: 14px;
      }

      .welcome-section {
        background: white;
        padding: 32px;
        border-radius: 16px;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
        margin-bottom: 32px;
        text-align: center;
      }

      .welcome-section h1 {
        margin: 0 0 12px;
        font-size: 32px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }

      .welcome-section p {
        margin: 0;
        color: #666;
        font-size: 16px;
      }

      .action-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        gap: 20px;
        margin-bottom: 32px;
      }

      .action-card {
        cursor: pointer;
        transition: all 0.3s ease;
        border-radius: 12px;
        border: 2px solid transparent;
      }

      .action-card:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
      }

      .action-card.hover-primary:hover {
        border-color: #667eea;
      }

      .action-card.hover-accent:hover {
        border-color: #764ba2;
      }

      .action-card.hover-warn:hover {
        border-color: #f093fb;
      }

      .action-card.hover-info:hover {
        border-color: #4facfe;
      }

      mat-card-content {
        padding: 24px;
        text-align: center;
      }

      .action-icon {
        width: 64px;
        height: 64px;
        border-radius: 16px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto 16px;
        font-size: 32px;
        color: white;
      }

      .icon-primary {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      }

      .icon-accent {
        background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
      }

      .icon-warn {
        background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
      }

      .icon-info {
        background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
      }

      mat-card-content h3 {
        margin: 0 0 8px;
        font-size: 20px;
        color: #333;
      }

      mat-card-content p {
        margin: 0;
        color: #666;
        font-size: 14px;
        line-height: 1.5;
      }

      .stats-section {
        background: white;
        padding: 32px;
        border-radius: 16px;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
        margin-bottom: 32px;
      }

      .stats-section h3 {
        margin: 0 0 24px;
        font-size: 24px;
        color: #333;
      }

      .stats-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 20px;
      }

      .stat-card {
        display: flex;
        align-items: center;
        gap: 16px;
        padding: 20px;
        background: #f5f7fa;
        border-radius: 12px;
        transition: all 0.3s ease;
      }

      .stat-card:hover {
        background: #e8ecf1;
      }

      .stat-icon {
        width: 48px;
        height: 48px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 24px;
        color: white;
      }

      .stat-content {
        display: flex;
        flex-direction: column;
      }

      .stat-value {
        font-size: 24px;
        font-weight: 600;
        color: #333;
      }

      .stat-label {
        font-size: 13px;
        color: #999;
        margin-top: 4px;
      }

      .footer {
        text-align: center;
        padding: 24px;
        color: #999;
        font-size: 14px;
      }

      .footer p {
        margin: 4px 0;
      }
    `,
  ],
})
export class DashboardComponent implements OnInit {
  profile: UserProfile = {
    teacherName: '',
    schoolName: '',
    subject: '',
  };

  currentDate = '';
  dataPath = '';

  actions: DashboardAction[] = [
    {
      title: '教程管理',
      description: '创建、编辑和管理您的教程',
      icon: 'ri-flask-line',
      route: '/tutorial-library',
      color: 'primary',
    },
    {
      title: '课件管理',
      description: '上传和管理课件资料',
      icon: 'ri-microscope-line',
      route: '/material-library',
      color: 'accent',
    },
    {
      title: '知识图谱',
      description: '查看智能学习路径和关联关系',
      icon: 'ri-brain-line',
      route: '/knowledge-graph',
      color: 'info',
    },
    {
      title: '设置',
      description: '配置应用和数据库',
      icon: 'ri-tools-line',
      route: '/settings',
      color: 'warn',
    },
  ];

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.loadProfile();
    this.currentDate = new Date().toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    });
    this.dataPath = '%APPDATA%\\com.openmtscied.desktop-manager\\';
  }

  loadProfile(): void {
    try {
      const saved = localStorage.getItem('user-profile');
      if (saved) {
        this.profile = JSON.parse(saved) as UserProfile;
      }
    } catch (error) {
      console.error('加载用户配置失败:', error);
    }
  }

  getInitial(): string {
    return this.profile.teacherName.charAt(0).toUpperCase() || '?';
  }

  getSubjectName(): string {
    const subjects: { [key: string]: string } = {
      physics: '物理',
      chemistry: '化学',
      biology: '生物',
      math: '数学',
      'computer-science': '计算机科学',
      engineering: '工程技术',
      robotics: '机器人技术',
      'general-science': '综合科学',
      'stem-integrated': 'STEM 跨学科',
      other: '其他',
    };
    return subjects[this.profile.subject] || '未选择科目';
  }

  navigate(route: string): void {
    void this.router.navigate([route]);
  }

  resetSetup(): void {
    if (confirm('确定要重新设置吗？这将清除当前配置。')) {
      localStorage.removeItem('user-profile');
      void this.router.navigate(['/setup-wizard']);
    }
  }
}
