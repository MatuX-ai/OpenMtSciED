import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../shared/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <app-marketing-nav></app-marketing-nav>

    <div class="login-container">
      <div class="login-card">
        <h1>登录</h1>
        <p class="subtitle">欢迎回到 OpenMTSciEd</p>

        <form (ngSubmit)="onSubmit()" #loginForm="ngForm">
          <div class="form-group">
            <label for="username">用户名</label>
            <input
              id="username"
              type="text"
              [(ngModel)]="credentials.username"
              name="username"
              required
              placeholder="请输入用户名"
              [disabled]="loading"
            />
          </div>

          <div class="form-group">
            <label for="password">密码</label>
            <input
              id="password"
              type="password"
              [(ngModel)]="credentials.password"
              name="password"
              required
              placeholder="请输入密码"
              [disabled]="loading"
            />
          </div>

          <div *ngIf="errorMessage" class="error-message">
            {{ errorMessage }}
          </div>

          <button
            type="submit"
            class="btn btn-primary"
            [disabled]="loading || !loginForm.form.valid"
          >
            <span *ngIf="!loading">登录</span>
            <span *ngIf="loading">登录中...</span>
          </button>
        </form>

        <div class="footer-links">
          <p>还没有账户？<a routerLink="/auth/register">立即注册</a></p>
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

      .login-container {
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 100vh;
        padding: 6rem 2rem 2rem;
      }

      .login-card {
        background: #1e293b;
        padding: 3rem;
        border-radius: 16px;
        border: 1px solid rgba(99, 102, 241, 0.2);
        width: 100%;
        max-width: 450px;
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
        .login-card {
          padding: 2rem;
        }

        h1 {
          font-size: 2rem;
        }
      }
    `,
  ],
})
export class LoginComponent {
  credentials = {
    username: '',
    password: '',
  };
  errorMessage = '';
  loading = false;

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router
  ) {}

  onSubmit(): void {
    if (!this.credentials.username || !this.credentials.password) {
      this.errorMessage = '请填写完整的登录信息';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    this.authService.login(this.credentials).subscribe({
      next: () => {
        this.loading = false;
        // 登录成功后跳转到下载页
        this.router.navigate(['/download']);
      },
      error: (error: { status: number }) => {
        this.loading = false;
        if (error.status === 401) {
          this.errorMessage = '用户名或密码错误';
        } else if (error.status === 403) {
          this.errorMessage = '账户已被禁用，请联系管理员';
        } else {
          this.errorMessage = '登录失败，请稍后重试';
        }
      },
    });
  }
}
