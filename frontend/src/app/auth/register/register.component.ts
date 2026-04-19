import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../shared/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <app-marketing-nav></app-marketing-nav>

    <div class="register-container">
      <div class="register-card">
        <h1>注册</h1>
        <p class="subtitle">加入 OpenMTSciEd，开启 STEM 学习之旅</p>

        <form (ngSubmit)="onSubmit()" #registerForm="ngForm">
          <div class="form-group">
            <label for="username">用户名</label>
            <input
              id="username"
              type="text"
              [(ngModel)]="userData.username"
              name="username"
              required
              minlength="3"
              maxlength="50"
              placeholder="请输入用户名（3-50个字符）"
              [disabled]="loading"
            />
          </div>

          <div class="form-group">
            <label for="email">邮箱</label>
            <input
              id="email"
              type="email"
              [(ngModel)]="userData.email"
              name="email"
              required
              placeholder="请输入邮箱地址"
              [disabled]="loading"
            />
          </div>

          <div class="form-group">
            <label for="password">密码</label>
            <input
              id="password"
              type="password"
              [(ngModel)]="userData.password"
              name="password"
              required
              minlength="8"
              placeholder="请输入密码（至少8个字符）"
              [disabled]="loading"
            />
          </div>

          <div class="form-group">
            <label for="confirmPassword">确认密码</label>
            <input
              id="confirmPassword"
              type="password"
              [(ngModel)]="confirmPassword"
              name="confirmPassword"
              required
              placeholder="请再次输入密码"
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
            class="btn btn-primary"
            [disabled]="loading || !registerForm.form.valid || !passwordsMatch()"
          >
            <span *ngIf="!loading">注册</span>
            <span *ngIf="loading">注册中...</span>
          </button>
        </form>

        <div class="footer-links">
          <p>已有账户？<a routerLink="/auth/login">立即登录</a></p>
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

      .register-container {
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 100vh;
        padding: 6rem 2rem 2rem;
      }

      .register-card {
        background: #1e293b;
        padding: 3rem;
        border-radius: 16px;
        border: 1px solid rgba(99, 102, 241, 0.2);
        width: 100%;
        max-width: 500px;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
      }

      h1 {
        font-size: 2.5rem;
        margin-bottom: 0.5rem;
        background: linear-gradient(135deg, #6366f1, #06b6d4);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }

      .subtitle {
        color: #94a3b8;
        margin-bottom: 2rem;
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
        width: 100%;
        padding: 1rem;
        border-radius: 8px;
        font-size: 1.1rem;
        font-weight: 600;
        cursor: pointer;
        border: none;
        transition: all 0.3s;
      }

      .btn-primary {
        background: linear-gradient(135deg, #6366f1, #8b5cf6);
        color: white;
        box-shadow: 0 10px 30px rgba(99, 102, 241, 0.3);
      }

      .btn-primary:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 15px 40px rgba(99, 102, 241, 0.4);
      }

      .btn-primary:disabled {
        opacity: 0.6;
        cursor: not-allowed;
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
        .register-card {
          padding: 2rem;
        }

        h1 {
          font-size: 2rem;
        }
      }
    `,
  ],
})
export class RegisterComponent {
  userData = {
    username: '',
    email: '',
    password: '',
  };
  confirmPassword = '';
  errorMessage = '';
  successMessage = '';
  loading = false;

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router
  ) {}

  passwordsMatch(): boolean {
    return this.userData.password === this.confirmPassword && this.userData.password !== '';
  }

  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  onSubmit(): void {
    // 表单验证
    if (!this.userData.username || !this.userData.email || !this.userData.password) {
      this.errorMessage = '请填写完整的注册信息';
      return;
    }

    if (this.userData.username.length < 3 || this.userData.username.length > 50) {
      this.errorMessage = '用户名长度必须在 3-50 个字符之间';
      return;
    }

    if (!this.validateEmail(this.userData.email)) {
      this.errorMessage = '请输入有效的邮箱地址';
      return;
    }

    if (this.userData.password.length < 8) {
      this.errorMessage = '密码长度必须至少 8 个字符';
      return;
    }

    if (!this.passwordsMatch()) {
      this.errorMessage = '两次输入的密码不一致';
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.authService.register(this.userData).subscribe({
      next: () => {
        this.loading = false;
        this.successMessage = '注册成功！正在跳转到登录页...';
        // 2秒后跳转到登录页
        setTimeout(() => {
          this.router.navigate(['/auth/login']);
        }, 2000);
      },
      error: (error: { status: number; error?: { detail?: string } }) => {
        this.loading = false;
        if (error.status === 400) {
          const detail = error.error?.detail;
          if (typeof detail === 'string') {
            if (detail.includes('username') || detail.includes('用户名')) {
              this.errorMessage = '用户名已存在，请选择其他用户名';
            } else if (detail.includes('email') || detail.includes('邮箱')) {
              this.errorMessage = '邮箱已被注册，请使用其他邮箱';
            } else {
              this.errorMessage = detail;
            }
          } else {
            this.errorMessage = '注册信息有误，请检查后重试';
          }
        } else if (error.status === 409) {
          this.errorMessage = '用户名或邮箱已存在';
        } else {
          this.errorMessage = '注册失败，请稍后重试';
        }
      },
    });
  }
}
