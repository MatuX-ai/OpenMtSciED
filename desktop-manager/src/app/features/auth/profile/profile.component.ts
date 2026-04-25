import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { AuthService, UserInfo } from '../../../services/auth.service';

interface UserProfile {
  user_id: string;
  username: string;
  email: string;
  avatar?: string;
  grade_level?: string;
  age?: number;
  learning_preferences?: string[];
  created_at?: string;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, MatCardModule, MatButtonModule, MatIconModule, MatChipsModule],
  template: `
    <div class="profile-container">
      <!-- 页面头部 -->
      <div class="page-header">
        <div class="header-content">
          <h1 class="page-title">
            <span class="title-icon">👤</span>
            个人资料
          </h1>
          <p class="page-subtitle">管理您的个人信息和学习偏好</p>
        </div>
      </div>

      <!-- 加载状态 -->
      <div class="loading-state" *ngIf="loading">
        <div class="spinner"></div>
        <p>加载个人资料...</p>
      </div>

      <div class="profile-content" *ngIf="!loading">
        <!-- 头像和基本信息卡片 -->
        <mat-card class="profile-card">
          <div class="card-gradient"></div>
          <div class="card-content">
            <div class="avatar-section">
              <div class="avatar-wrapper">
                <div class="avatar" *ngIf="!isEditing">
                  <img *ngIf="profile.avatar" [src]="profile.avatar" alt="头像" />
                  <div *ngIf="!profile.avatar" class="avatar-placeholder">
                    {{ getInitials() }}
                  </div>
                </div>
                <div class="avatar-edit" *ngIf="isEditing">
                  <input type="file" (change)="onAvatarChange($event)" accept="image/*" hidden #fileInput />
                  <button class="btn-upload" (click)="fileInput.click()">
                    <mat-icon>camera_alt</mat-icon>
                    更换头像
                  </button>
                </div>
              </div>
              
              <div class="user-info">
                <h2 *ngIf="!isEditing">{{ profile.username || '未设置用户名' }}</h2>
                <input 
                  *ngIf="isEditing" 
                  type="text" 
                  [(ngModel)]="editForm.username" 
                  placeholder="用户名"
                  class="input-field"
                />
                <p class="email">
                  <mat-icon>email</mat-icon>
                  {{ profile.email }}
                </p>
                <p class="user-id">
                  <mat-icon>badge</mat-icon>
                  ID: {{ profile.user_id }}
                </p>
              </div>
            </div>

            <div class="action-buttons">
              <button *ngIf="!isEditing" mat-raised-button class="btn btn-primary" (click)="startEdit()">
                <mat-icon>edit</mat-icon>
                编辑资料
              </button>
              <ng-container *ngIf="isEditing">
                <button mat-raised-button class="btn btn-success" (click)="saveProfile()" [disabled]="saving">
                  <mat-icon>{{ saving ? 'hourglass_empty' : 'save' }}</mat-icon>
                  {{ saving ? '保存中...' : '保存' }}
                </button>
                <button mat-stroked-button class="btn btn-secondary" (click)="cancelEdit()">
                  <mat-icon>cancel</mat-icon>
                  取消
                </button>
              </ng-container>
            </div>
          </div>
        </mat-card>

        <!-- 详细信息网格 -->
        <div class="details-grid">
          <!-- 学习信息 -->
          <mat-card class="detail-card">
            <div class="card-icon icon-blue">
              <mat-icon>school</mat-icon>
            </div>
            <h3>学习信息</h3>
            
            <div class="detail-item" *ngIf="!isEditing">
              <label>年级水平</label>
              <span class="value">{{ profile.grade_level || '未设置' }}</span>
            </div>
            <div class="detail-item" *ngIf="isEditing">
              <label>年级水平</label>
              <select [(ngModel)]="editForm.grade_level" class="input-field">
                <option value="">请选择</option>
                <option value="小学">小学</option>
                <option value="初中">初中</option>
                <option value="高中">高中</option>
                <option value="大学">大学</option>
              </select>
            </div>

            <div class="detail-item" *ngIf="!isEditing">
              <label>年龄</label>
              <span class="value">{{ profile.age ? profile.age + ' 岁' : '未设置' }}</span>
            </div>
            <div class="detail-item" *ngIf="isEditing">
              <label>年龄</label>
              <input type="number" [(ngModel)]="editForm.age" min="5" max="100" class="input-field" />
            </div>
          </mat-card>

          <!-- 学习偏好 -->
          <mat-card class="detail-card">
            <div class="card-icon icon-purple">
              <mat-icon>target</mat-icon>
            </div>
            <h3>学习偏好</h3>
            
            <div class="preferences-list" *ngIf="!isEditing">
              <mat-chip-listbox>
                <mat-chip-option *ngFor="let pref of profile.learning_preferences" color="primary" selected>
                  {{ pref }}
                </mat-chip-option>
              </mat-chip-listbox>
              <span *ngIf="!profile.learning_preferences || profile.learning_preferences.length === 0" class="no-data">
                未设置学习偏好
              </span>
            </div>
            <div class="preferences-edit" *ngIf="isEditing">
              <label class="checkbox-label" *ngFor="let option of preferenceOptions">
                <input 
                  type="checkbox" 
                  [checked]="editForm.learning_preferences?.includes(option)"
                  (change)="togglePreference(option)"
                />
                <span>{{ option }}</span>
              </label>
            </div>
          </mat-card>

          <!-- 账户信息 -->
          <mat-card class="detail-card">
            <div class="card-icon icon-green">
              <mat-icon>security</mat-icon>
            </div>
            <h3>账户信息</h3>
            <div class="detail-item">
              <label>注册时间</label>
              <span class="value">{{ profile.created_at ? (profile.created_at | date:'yyyy-MM-dd') : '未知' }}</span>
            </div>
            <div class="detail-item">
              <label>最后登录</label>
              <span class="value">今天</span>
            </div>
          </mat-card>
        </div>

        <!-- 学习统计 -->
        <mat-card class="stats-card">
          <div class="card-icon icon-orange">
            <mat-icon>trending_up</mat-icon>
          </div>
          <h3>学习统计</h3>
          <div class="stats-grid">
            <div class="stat-item">
              <div class="stat-icon">
                <mat-icon>star</mat-icon>
              </div>
              <div class="stat-value" [class.animate-points]="pointsChanged">{{ points }}</div>
              <div class="stat-label">贡献积分</div>
            </div>
            <div class="stat-item">
              <div class="stat-icon">
                <mat-icon>check_circle</mat-icon>
              </div>
              <div class="stat-value">0</div>
              <div class="stat-label">完成课程</div>
            </div>
            <div class="stat-item">
              <div class="stat-icon">
                <mat-icon>schedule</mat-icon>
              </div>
              <div class="stat-value">0</div>
              <div class="stat-label">学习时长(小时)</div>
            </div>
            <div class="stat-item">
              <div class="stat-icon">
                <mat-icon>build</mat-icon>
              </div>
              <div class="stat-value">0</div>
              <div class="stat-label">硬件项目</div>
            </div>
          </div>
        </mat-card>

        <!-- 排行榜 -->
        <mat-card class="leaderboard-card">
          <div class="card-icon icon-gold">
            <mat-icon>emoji_events</mat-icon>
          </div>
          <h3>社区贡献排行榜</h3>
          <div class="leaderboard-list">
            <div *ngFor="let user of leaderboard; let i = index" class="leaderboard-item" [class.me]="user.user_id === profile.user_id">
              <div class="rank-badge" [class.top3]="i < 3">
                {{ i + 1 }}
              </div>
              <div class="lb-info">
                <span class="lb-name">{{ user.user_id }}</span>
                <span class="lb-label">贡献者</span>
              </div>
              <div class="lb-points">
                <mat-icon>star</mat-icon>
                {{ user.points }} 分
              </div>
            </div>
            <div *ngIf="leaderboard.length === 0" class="no-data">暂无排行数据</div>
          </div>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .profile-container {
      padding: 32px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .page-header {
      margin-bottom: 40px;
      padding-bottom: 24px;
      border-bottom: 2px solid #f0f0f0;
    }

    .header-content {
      flex: 1;
    }

    .page-title {
      font-size: 32px;
      font-weight: 700;
      margin: 0 0 8px 0;
      color: #1a1a2e;
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .title-icon {
      font-size: 36px;
    }

    .page-subtitle {
      font-size: 15px;
      color: #6c757d;
      margin: 0;
    }

    /* 加载状态 */
    .loading-state {
      text-align: center;
      padding: 80px 40px;

      .spinner {
        border: 4px solid #e9ecef;
        border-top: 4px solid #667eea;
        border-radius: 50%;
        width: 50px;
        height: 50px;
        animation: spin 1s linear infinite;
        margin: 0 auto 16px;
      }

      p {
        font-size: 15px;
        color: #6c757d;
        margin: 0;
      }
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    /* 头像卡片 */
    .profile-card {
      position: relative;
      border-radius: 16px;
      overflow: hidden;
      margin-bottom: 32px;
      border: 1px solid #e9ecef;

      .card-gradient {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 4px;
        background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
      }

      .card-content {
        padding: 32px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 32px;
      }
    }

    .avatar-section {
      display: flex;
      align-items: center;
      gap: 24px;
      flex: 1;
    }

    .avatar-wrapper {
      flex-shrink: 0;
    }

    .avatar {
      width: 100px;
      height: 100px;
      border-radius: 50%;
      overflow: hidden;
      border: 4px solid #667eea;
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
    }

    .avatar img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .avatar-placeholder {
      width: 100%;
      height: 100%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 36px;
      font-weight: bold;
    }

    .avatar-edit {
      text-align: center;
    }

    .btn-upload {
      padding: 12px 20px;
      background: white;
      border: 2px solid #667eea;
      border-radius: 12px;
      color: #667eea;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      gap: 8px;

      &:hover {
        background: #667eea;
        color: white;
      }
    }

    .user-info {
      flex: 1;
    }

    .user-info h2 {
      margin: 0 0 12px 0;
      color: #1a1a2e;
      font-size: 28px;
      font-weight: 700;
    }

    .email, .user-id {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #6c757d;
      margin: 8px 0;
      font-size: 15px;

      mat-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
      }
    }

    .user-id {
      font-size: 13px;
      color: #adb5bd;
    }

    .action-buttons {
      display: flex;
      gap: 12px;
      flex-shrink: 0;
    }

    .btn {
      padding: 10px 24px;
      border-radius: 10px;
      font-weight: 600;
      transition: all 0.2s ease;

      mat-icon {
        margin-right: 6px;
      }

      &.btn-primary {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border: none;
        box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);

        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
        }
      }

      &.btn-success {
        background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
        color: white;
        border: none;
        box-shadow: 0 4px 12px rgba(67, 233, 123, 0.3);

        &:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(67, 233, 123, 0.4);
        }

        &:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      }

      &.btn-secondary {
        background: white;
        color: #6c757d;
        border: 1px solid #e9ecef;

        &:hover {
          background: #f8f9fa;
          border-color: #667eea;
          color: #667eea;
        }
      }
    }

    /* 详细信息网格 */
    .details-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
      gap: 24px;
      margin-bottom: 32px;
    }

    .detail-card {
      position: relative;
      border-radius: 16px;
      padding: 24px;
      border: 1px solid #e9ecef;
      transition: all 0.3s ease;

      &:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
      }

      .card-icon {
        width: 48px;
        height: 48px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 16px;

        mat-icon {
          color: white;
          font-size: 24px;
          width: 24px;
          height: 24px;
        }

        &.icon-blue {
          background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
        }

        &.icon-purple {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }

        &.icon-green {
          background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
        }

        &.icon-orange {
          background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
        }

        &.icon-gold {
          background: linear-gradient(135deg, #f7971e 0%, #ffd200 100%);
        }
      }

      h3 {
        margin: 0 0 20px 0;
        color: #1a1a2e;
        font-size: 20px;
        font-weight: 600;
      }
    }

    .detail-item {
      margin-bottom: 20px;

      &:last-child {
        margin-bottom: 0;
      }

      label {
        display: block;
        color: #6c757d;
        font-size: 13px;
        font-weight: 600;
        margin-bottom: 6px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .value {
        color: #1a1a2e;
        font-size: 16px;
        font-weight: 500;
      }
    }

    .input-field {
      width: 100%;
      padding: 10px 14px;
      border: 2px solid #e9ecef;
      border-radius: 10px;
      font-size: 15px;
      transition: all 0.3s ease;

      &:focus {
        outline: none;
        border-color: #667eea;
        box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
      }
    }

    .preferences-list {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .no-data {
      color: #adb5bd;
      font-style: italic;
      font-size: 14px;
    }

    .preferences-edit {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .checkbox-label {
      display: flex;
      align-items: center;
      gap: 10px;
      cursor: pointer;
      padding: 8px 12px;
      border-radius: 8px;
      transition: all 0.2s ease;

      &:hover {
        background: #f8f9fa;
      }

      input[type="checkbox"] {
        width: 18px;
        height: 18px;
        cursor: pointer;
      }

      span {
        font-size: 15px;
        color: #495057;
      }
    }

    /* 统计卡片 */
    .stats-card {
      position: relative;
      border-radius: 16px;
      padding: 32px;
      margin-bottom: 32px;
      border: 1px solid #e9ecef;

      .card-icon {
        width: 48px;
        height: 48px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 16px;
        background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);

        mat-icon {
          color: white;
          font-size: 24px;
          width: 24px;
          height: 24px;
        }
      }

      h3 {
        margin: 0 0 24px 0;
        color: #1a1a2e;
        font-size: 20px;
        font-weight: 600;
      }
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 20px;
    }

    .stat-item {
      text-align: center;
      padding: 24px 16px;
      background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
      border-radius: 12px;
      transition: all 0.3s ease;

      &:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
      }

      .stat-icon {
        width: 40px;
        height: 40px;
        margin: 0 auto 12px;
        border-radius: 10px;
        background: white;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);

        mat-icon {
          font-size: 20px;
          width: 20px;
          height: 20px;
          color: #667eea;
        }
      }
    }

    .stat-value {
      font-size: 32px;
      font-weight: 700;
      color: #667eea;
      margin-bottom: 8px;
      transition: transform 0.3s ease;

      &.animate-points {
        animation: points-bounce 0.8s ease-in-out;
      }
    }

    @keyframes points-bounce {
      0% { transform: scale(1); }
      50% { transform: scale(1.3); color: #43e97b; }
      100% { transform: scale(1); }
    }

    .stat-label {
      color: #6c757d;
      font-size: 14px;
      font-weight: 500;
    }

    /* 排行榜 */
    .leaderboard-card {
      position: relative;
      border-radius: 16px;
      padding: 32px;
      border: 1px solid #e9ecef;

      .card-icon {
        width: 48px;
        height: 48px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 16px;
        background: linear-gradient(135deg, #f7971e 0%, #ffd200 100%);

        mat-icon {
          color: white;
          font-size: 24px;
          width: 24px;
          height: 24px;
        }
      }

      h3 {
        margin: 0 0 24px 0;
        color: #1a1a2e;
        font-size: 20px;
        font-weight: 600;
      }
    }

    .leaderboard-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .leaderboard-item {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 16px 20px;
      background: #f8f9fa;
      border-radius: 12px;
      transition: all 0.3s ease;

      &:hover {
        background: #e9ecef;
        transform: translateX(4px);
      }

      &.me {
        background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
        border: 2px solid #667eea;
      }
    }

    .rank-badge {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: #e9ecef;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      color: #6c757d;
      font-size: 14px;
      flex-shrink: 0;

      &.top3 {
        background: linear-gradient(135deg, #f7971e 0%, #ffd200 100%);
        color: white;
        box-shadow: 0 2px 8px rgba(247, 151, 30, 0.3);
      }
    }

    .lb-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .lb-name {
      font-weight: 600;
      color: #1a1a2e;
      font-size: 16px;
    }

    .lb-label {
      font-size: 13px;
      color: #6c757d;
    }

    .lb-points {
      display: flex;
      align-items: center;
      gap: 6px;
      font-weight: 700;
      color: #667eea;
      font-size: 16px;

      mat-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
      }
    }

    /* 响应式 */
    @media (max-width: 768px) {
      .profile-container {
        padding: 16px;
      }

      .profile-card .card-content {
        flex-direction: column;
      }

      .avatar-section {
        flex-direction: column;
        text-align: center;
      }

      .action-buttons {
        width: 100%;
        justify-content: center;
      }

      .details-grid {
        grid-template-columns: 1fr;
      }

      .stats-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }
  `]
})
export class ProfileComponent implements OnInit, OnDestroy {
  profile: UserProfile = {
    user_id: '',
    username: '',
    email: ''
  };

  editForm: Partial<UserProfile> = {};
  isEditing = false;
  loading = true;
  saving = false;
  points = 0;
  pointsChanged = false;
  leaderboard: Array<{ user_id: string; points: number }> = [];
  private subscription: Subscription | null = null;

  preferenceOptions = [
    '编程',
    '机器人',
    '电子制作',
    '3D打印',
    '人工智能',
    '游戏开发',
    '科学实验',
    '数学建模'
  ];

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.loadProfile();
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  loadProfile(): void {
    this.loading = true;
    
    // 订阅用户信息变化
    this.subscription = this.authService.currentUser$.subscribe((user: UserInfo | null) => {
      if (user) {
        this.profile = {
          user_id: user.id?.toString() || 'unknown',
          username: user.username || '用户',
          email: user.email || '',
          avatar: user.avatar_url,
          created_at: user.created_at
        };
        this.loadLeaderboard();
      }
      this.loading = false;
    });
  }

  async loadLeaderboard(): Promise<void> {
    try {
      // 模拟数据
      this.leaderboard = [
        { user_id: 'stem_master', points: 1250 },
        { user_id: 'science_lover', points: 980 },
        { user_id: this.profile.user_id, points: 150 },
        { user_id: 'robot_builder', points: 85 },
      ];
      this.points = this.leaderboard.find(u => u.user_id === this.profile.user_id)?.points || 0;
      
      // 触发积分动画
      this.triggerPointsAnimation();
    } catch (error) {
      console.error('加载排行榜失败:', error);
    }
  }

  startEdit(): void {
    this.editForm = { ...this.profile };
    this.isEditing = true;
  }

  cancelEdit(): void {
    this.isEditing = false;
    this.editForm = {};
  }

  saveProfile(): void {
    this.saving = true;
    
    // 模拟保存
    setTimeout(() => {
      this.profile = { ...this.profile, ...this.editForm };
      this.isEditing = false;
      this.saving = false;
      
      console.log('保存个人资料:', this.profile);
    }, 1000);
  }

  onAvatarChange(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.editForm.avatar = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  togglePreference(preference: string): void {
    if (!this.editForm.learning_preferences) {
      this.editForm.learning_preferences = [];
    }

    const index = this.editForm.learning_preferences.indexOf(preference);
    if (index > -1) {
      this.editForm.learning_preferences.splice(index, 1);
    } else {
      this.editForm.learning_preferences.push(preference);
    }
  }

  getInitials(): string {
    if (!this.profile.username) return '?';
    return this.profile.username.charAt(0).toUpperCase();
  }

  private triggerPointsAnimation(): void {
    this.pointsChanged = true;
    setTimeout(() => {
      this.pointsChanged = false;
    }, 1000);
  }
}
