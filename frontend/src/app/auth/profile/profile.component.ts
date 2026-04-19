import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { AuthService, UserInfo } from '../../shared/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <app-marketing-nav></app-marketing-nav>

    <div class="profile-container">
      <div class="profile-card">
        <h1>个人资料</h1>

        <div *ngIf="user" class="user-info">
          <div class="info-item">
            <label>用户名</label>
            <div class="value">{{ user.username }}</div>
          </div>

          <div class="info-item">
            <label>邮箱</label>
            <div class="value">{{ user.email }}</div>
          </div>

          <div class="info-item">
            <label>角色</label>
            <div class="value">
              <span class="badge" [class]="getRoleClass(user.role)">
                {{ getRoleText(user.role) }}
              </span>
            </div>
          </div>

          <div class="info-item">
            <label>账户状态</label>
            <div class="value">
              <span class="badge" [class]="user.is_active ? 'badge-active' : 'badge-inactive'">
                {{ user.is_active ? '活跃' : '已禁用' }}
              </span>
            </div>
          </div>
        </div>

        <div class="divider"></div>

        <h2>修改密码</h2>
        <form (ngSubmit)="onChangePassword()" #passwordForm="ngForm">
          <div class="form-group">
            <label for="oldPassword">当前密码</label>
            <input
              id="oldPassword"
              type="password"
              [(ngModel)]="passwordData.oldPassword"
              name="oldPassword"
              required
              placeholder="请输入当前密码"
              [disabled]="loading"
            />
          </div>

          <div class="form-group">
            <label for="newPassword">新密码</label>
            <input
              id="newPassword"
              type="password"
              [(ngModel)]="passwordData.newPassword"
              name="newPassword"
              required
              minlength="8"
              placeholder="请输入新密码（至少8个字符）"
              [disabled]="loading"
            />
          </div>

          <div class="form-group">
            <label for="confirmPassword">确认新密码</label>
            <input
              id="confirmPassword"
              type="password"
              [(ngModel)]="passwordData.confirmPassword"
              name="confirmPassword"
              required
              placeholder="请再次输入新密码"
              [disabled]="loading"
            />
          </div>

          <div *ngIf="errorMessage" class="error-message">
            {{ errorMessage }}
          </div>

          <div *ngIf="successMessage" class="success-message">
            {{ successMessage }}
          </div>

          <button
            type="submit"
            class="btn btn-secondary"
            [disabled]="loading || !passwordForm.form.valid || !newPasswordsMatch()"
          >
            <span *ngIf="!loading">修改密码</span>
            <span *ngIf="loading">修改中...</span>
          </button>
        </form>

        <div class="action-buttons">
          <a routerLink="/download" class="btn btn-primary">下载桌面端</a>
          <button (click)="onLogout()" class="btn btn-danger">退出登录</button>
        </div>

        <div class="footer-links">
          <p><a routerLink="/">返回首页</a></p>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        min-height: 100vh;
        background: #0f172a;
        color: #f8fafc;
      }

      .profile-container {
        display: flex;
        align-items: flex-start;
        justify-content: center;
        min-height: 100vh;
        padding: 6rem 2rem 2rem;
      }

      .profile-card {
        background: #1e293b;
        padding: 3rem;
        border-radius: 16px;
        border: 1px solid rgba(99, 102, 241, 0.2);
        width: 100%;
        max-width: 600px;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
      }

      h1 {
        font-size: 2.5rem;
        margin-bottom: 2rem;
        background: linear-gradient(135deg, #6366f1, #06b6d4);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }

      h2 {
        font-size: 1.5rem;
        margin-bottom: 1.5rem;
        color: #f8fafc;
      }

      .user-info {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      .info-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1rem;
        background: #0f172a;
        border-radius: 8px;
      }

      .info-item label {
        color: #94a3b8;
        font-size: 0.95rem;
      }

      .info-item .value {
        color: #f8fafc;
        font-weight: 600;
      }

      .badge {
        padding: 0.25rem 0.75rem;
        border-radius: 9999px;
        font-size: 0.85rem;
        font-weight: 600;
      }

      .badge-user {
        background: rgba(99, 102, 241, 0.2);
        color: #6366f1;
      }

      .badge-admin {
        background: rgba(245, 158, 11, 0.2);
        color: #f59e0b;
      }

      .badge-superuser {
        background: rgba(239, 68, 68, 0.2);
        color: #ef4444;
      }

      .badge-active {
        background: rgba(16, 185, 129, 0.2);
        color: #10b981;
      }

      .badge-inactive {
        background: rgba(239, 68, 68, 0.2);
        color: #ef4444;
      }

      .divider {
        height: 1px;
        background: rgba(99, 102, 241, 0.2);
        margin: 2rem 0;
      }

      .form-group {
        margin-bottom: 1.5rem;
      }

      label {
        display: block;
        color: #94a3b8;
        margin-bottom: 0.5rem;
        font-size: 0.95rem;
      }

      input {
        width: 100%;
        padding: 0.875rem 1rem;
        background: #0f172a;
        border: 2px solid rgba(99, 102, 241, 0.2);
        border-radius: 8px;
        color: #f8fafc;
        font-size: 1rem;
        transition: all 0.3s;
      }

      input:focus {
        outline: none;
        border-color: #6366f1;
        box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
      }

      input:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }

      input::placeholder {
        color: #475569;
      }

      .error-message {
        background: rgba(239, 68, 68, 0.1);
        border: 1px solid rgba(239, 68, 68, 0.3);
        color: #ef4444;
        padding: 0.75rem 1rem;
        border-radius: 8px;
        margin-bottom: 1.5rem;
        font-size: 0.9rem;
      }

      .success-message {
        background: rgba(16, 185, 129, 0.1);
        border: 1px solid rgba(16, 185, 129, 0.3);
        color: #10b981;
        padding: 0.75rem 1rem;
        border-radius: 8px;
        margin-bottom: 1.5rem;
        font-size: 0.9rem;
      }

      .btn {
        padding: 1rem;
        border-radius: 8px;
        font-size: 1.1rem;
        font-weight: 600;
        cursor: pointer;
        border: none;
        transition: all 0.3s;
        text-decoration: none;
        display: inline-flex;
        align-items: center;
        justify-content: center;
      }

      .btn-primary {
        background: linear-gradient(135deg, #6366f1, #8b5cf6);
        color: white;
        box-shadow: 0 10px 30px rgba(99, 102, 241, 0.3);
      }

      .btn-primary:hover {
        transform: translateY(-2px);
        box-shadow: 0 15px 40px rgba(99, 102, 241, 0.4);
      }

      .btn-secondary {
        background: linear-gradient(135deg, #10b981, #059669);
        color: white;
        box-shadow: 0 10px 30px rgba(16, 185, 129, 0.3);
        width: 100%;
      }

      .btn-secondary:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 15px 40px rgba(16, 185, 129, 0.4);
      }

      .btn-secondary:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }

      .btn-danger {
        background: linear-gradient(135deg, #ef4444, #dc2626);
        color: white;
        box-shadow: 0 10px 30px rgba(239, 68, 68, 0.3);
        flex: 1;
      }

      .btn-danger:hover {
        transform: translateY(-2px);
        box-shadow: 0 15px 40px rgba(239, 68, 68, 0.4);
      }

      .action-buttons {
        display: flex;
        gap: 1rem;
        margin-top: 2rem;
      }

      .action-buttons .btn-primary {
        flex: 1;
      }

      .footer-links {
        margin-top: 2rem;
        text-align: center;
        color: #94a3b8;
      }

      .footer-links p {
        margin: 0.5rem 0;
      }

      .footer-links a {
        color: #6366f1;
        text-decoration: none;
        transition: all 0.3s;
      }

      .footer-links a:hover {
        color: #8b5cf6;
        text-decoration: underline;
      }

      @media (max-width: 768px) {
        .profile-card {
          padding: 2rem;
        }

        h1 {
          font-size: 2rem;
        }

        .action-buttons {
          flex-direction: column;
        }
      }
    `,
  ],
})
export class ProfileComponent implements OnInit {
  user: UserInfo | null = null;
  passwordData = {
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  };
  errorMessage = '';
  successMessage = '';
  loading = false;

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    // 订阅用户信息流
    this.authService.currentUser$.subscribe((user: UserInfo | null) => {
      this.user = user;
    });
  }

  getRoleText(role: string | null): string {
    if (!role) return '普通用户';
    const roleMap: { [key: string]: string } = {
      user: '普通用户',
      admin: '管理员',
      superuser: '超级管理员',
    };
    return roleMap[role.toLowerCase()] || role;
  }

  getRoleClass(role: string | null): string {
    if (!role) return 'badge-user';
    const classMap: { [key: string]: string } = {
      user: 'badge-user',
      admin: 'badge-admin',
      superuser: 'badge-superuser',
    };
    return classMap[role.toLowerCase()] || 'badge-user';
  }

  newPasswordsMatch(): boolean {
    return (
      this.passwordData.newPassword === this.passwordData.confirmPassword &&
      this.passwordData.newPassword !== ''
    );
  }

  onChangePassword(): void {
    // 验证
    if (!this.passwordData.oldPassword || !this.passwordData.newPassword) {
      this.errorMessage = '请填写完整的密码信息';
      return;
    }

    if (this.passwordData.newPassword.length < 8) {
      this.errorMessage = '新密码长度必须至少 8 个字符';
      return;
    }

    if (!this.newPasswordsMatch()) {
      this.errorMessage = '两次输入的新密码不一致';
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.authService.changePassword(this.passwordData.oldPassword, this.passwordData.newPassword).subscribe({
      next: () => {
        this.loading = false;
        this.successMessage = '密码修改成功！';
        this.passwordData = {
          oldPassword: '',
          newPassword: '',
          confirmPassword: '',
        };
      },
      error: (error: { status: number; error?: { detail?: string } }) => {
        this.loading = false;
        if (error.status === 400 || error.status === 422) {
          this.errorMessage = error.error?.detail || '当前密码错误或新密码不符合要求';
        } else if (error.status === 401) {
          this.errorMessage = '认证失败，请重新登录';
          this.authService.logout();
          this.router.navigate(['/auth/login']);
        } else {
          this.errorMessage = '密码修改失败，请稍后重试';
        }
      },
    });
  }

  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
