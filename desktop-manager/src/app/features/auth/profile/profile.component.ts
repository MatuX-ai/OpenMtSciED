import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
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
  imports: [CommonModule, FormsModule],
  template: `
    <div class="profile-container">
      <div class="profile-header">
        <h1>👤 个人资料</h1>
        <p class="subtitle">管理您的个人信息和学习偏好</p>
      </div>

      <div class="profile-content" *ngIf="!loading; else loadingTemplate">
        <!-- 头像和基本信息 -->
        <div class="profile-card">
          <div class="avatar-section">
            <div class="avatar" *ngIf="!isEditing">
              <img *ngIf="profile.avatar" [src]="profile.avatar" alt="头像" />
              <div *ngIf="!profile.avatar" class="avatar-placeholder">
                {{ getInitials() }}
              </div>
            </div>
            <div class="avatar-edit" *ngIf="isEditing">
              <input type="file" (change)="onAvatarChange($event)" accept="image/*" hidden #fileInput />
              <button class="btn-upload" (click)="fileInput.click()">
                📷 更换头像
              </button>
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
              <p class="email">{{ profile.email }}</p>
              <p class="user-id">ID: {{ profile.user_id }}</p>
            </div>
          </div>

          <div class="action-buttons">
            <button *ngIf="!isEditing" class="btn btn-primary" (click)="startEdit()">
              ✏️ 编辑资料
            </button>
            <ng-container *ngIf="isEditing">
              <button class="btn btn-success" (click)="saveProfile()" [disabled]="saving">
                {{ saving ? '保存中...' : '💾 保存' }}
              </button>
              <button class="btn btn-secondary" (click)="cancelEdit()">
                ❌ 取消
              </button>
            </ng-container>
          </div>
        </div>

        <!-- 详细信息 -->
        <div class="details-grid">
          <!-- 学习信息 -->
          <div class="detail-card">
            <h3>📚 学习信息</h3>
            <div class="detail-item" *ngIf="!isEditing">
              <label>年级水平</label>
              <span>{{ profile.grade_level || '未设置' }}</span>
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
              <span>{{ profile.age ? profile.age + ' 岁' : '未设置' }}</span>
            </div>
            <div class="detail-item" *ngIf="isEditing">
              <label>年龄</label>
              <input type="number" [(ngModel)]="editForm.age" min="5" max="100" class="input-field" />
            </div>
          </div>

          <!-- 学习偏好 -->
          <div class="detail-card">
            <h3>🎯 学习偏好</h3>
            <div class="preferences-list" *ngIf="!isEditing">
              <span *ngFor="let pref of profile.learning_preferences" class="preference-tag">
                {{ pref }}
              </span>
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
                {{ option }}
              </label>
            </div>
          </div>

          <!-- 账户信息 -->
          <div class="detail-card">
            <h3>🔐 账户信息</h3>
            <div class="detail-item">
              <label>注册时间</label>
              <span>{{ profile.created_at ? (profile.created_at | date:'yyyy-MM-dd') : '未知' }}</span>
            </div>
            <div class="detail-item">
              <label>最后登录</label>
              <span>今天</span>
            </div>
          </div>
        </div>

        <!-- 统计数据 -->
        <div class="stats-card">
          <h3>📊 学习统计</h3>
          <div class="stats-grid">
            <div class="stat-item">
              <div class="stat-value">0</div>
              <div class="stat-label">完成课程</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">0</div>
              <div class="stat-label">学习时长(小时)</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">0</div>
              <div class="stat-label">获得证书</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">0</div>
              <div class="stat-label">硬件项目</div>
            </div>
          </div>
        </div>
      </div>

      <ng-template #loadingTemplate>
        <div class="loading">
          <div class="spinner"></div>
          <p>加载个人资料...</p>
        </div>
      </ng-template>
    </div>
  `,
  styles: [`
    .profile-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
    }

    .profile-header {
      margin-bottom: 2rem;
    }

    .profile-header h1 {
      font-size: 2rem;
      margin-bottom: 0.5rem;
      color: #1e293b;
    }

    .subtitle {
      color: #64748b;
      font-size: 1rem;
    }

    .profile-card {
      background: white;
      border-radius: 12px;
      padding: 2rem;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      margin-bottom: 2rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .avatar-section {
      display: flex;
      align-items: center;
      gap: 1.5rem;
    }

    .avatar {
      width: 100px;
      height: 100px;
      border-radius: 50%;
      overflow: hidden;
      border: 3px solid #6366f1;
    }

    .avatar img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .avatar-placeholder {
      width: 100%;
      height: 100%;
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 2rem;
      font-weight: bold;
    }

    .user-info h2 {
      margin: 0 0 0.5rem 0;
      color: #1e293b;
      font-size: 1.5rem;
    }

    .email {
      color: #64748b;
      margin: 0.25rem 0;
    }

    .user-id {
      color: #94a3b8;
      font-size: 0.875rem;
      margin: 0.25rem 0;
    }

    .action-buttons {
      display: flex;
      gap: 1rem;
    }

    .btn {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-size: 1rem;
      transition: all 0.3s;
    }

    .btn-primary {
      background: #6366f1;
      color: white;
    }

    .btn-primary:hover {
      background: #4f46e5;
    }

    .btn-success {
      background: #10b981;
      color: white;
    }

    .btn-success:hover:not(:disabled) {
      background: #059669;
    }

    .btn-success:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .btn-secondary {
      background: #e2e8f0;
      color: #475569;
    }

    .btn-secondary:hover {
      background: #cbd5e1;
    }

    .details-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .detail-card {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .detail-card h3 {
      margin: 0 0 1rem 0;
      color: #1e293b;
      font-size: 1.25rem;
    }

    .detail-item {
      margin-bottom: 1rem;
    }

    .detail-item label {
      display: block;
      color: #64748b;
      font-size: 0.875rem;
      margin-bottom: 0.25rem;
    }

    .detail-item span {
      color: #1e293b;
      font-size: 1rem;
    }

    .input-field {
      width: 100%;
      padding: 0.5rem;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      font-size: 1rem;
    }

    .input-field:focus {
      outline: none;
      border-color: #6366f1;
    }

    .preferences-list {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .preference-tag {
      background: #e0e7ff;
      color: #6366f1;
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
      font-size: 0.875rem;
    }

    .no-data {
      color: #94a3b8;
      font-style: italic;
    }

    .preferences-edit {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .checkbox-label {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      cursor: pointer;
    }

    .stats-card {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .stats-card h3 {
      margin: 0 0 1rem 0;
      color: #1e293b;
      font-size: 1.25rem;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 1rem;
    }

    .stat-item {
      text-align: center;
      padding: 1rem;
      background: #f8fafc;
      border-radius: 8px;
    }

    .stat-value {
      font-size: 2rem;
      font-weight: bold;
      color: #6366f1;
      margin-bottom: 0.5rem;
    }

    .stat-label {
      color: #64748b;
      font-size: 0.875rem;
    }

    .loading {
      text-align: center;
      padding: 3rem;
    }

    .spinner {
      border: 4px solid #f3f4f6;
      border-top: 4px solid #6366f1;
      border-radius: 50%;
      width: 50px;
      height: 50px;
      animation: spin 1s linear infinite;
      margin: 0 auto 1rem;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    @media (max-width: 768px) {
      .profile-card {
        flex-direction: column;
        gap: 1.5rem;
      }

      .avatar-section {
        flex-direction: column;
        text-align: center;
      }

      .action-buttons {
        width: 100%;
        justify-content: center;
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
      }
      this.loading = false;
    });
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
      
      // TODO: 调用 API 保存到后端
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
}
