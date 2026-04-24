import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, MatCardModule, MatInputModule, MatButtonModule, MatSnackBarModule],
  template: `
    <div class="login-container">
      <mat-card class="login-card">
        <mat-card-header>
          <mat-card-title>登录 OpenMTSciEd</mat-card-title>
          <mat-card-subtitle>欢迎回到桌面端管理平台</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <form (ngSubmit)="onSubmit()" #loginForm="ngForm">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>用户名</mat-label>
              <input matInput [(ngModel)]="credentials.username" name="username" required>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>密码</mat-label>
              <input matInput type="password" [(ngModel)]="credentials.password" name="password" required>
            </mat-form-field>

            <button mat-raised-button color="primary" class="full-width" [disabled]="loading || !loginForm.valid">
              {{ loading ? '登录中...' : '登录' }}
            </button>

            <div class="divider">
              <span>或</span>
            </div>

            <button mat-stroked-button color="accent" class="full-width" (click)="mockLogin()" [disabled]="loading">
              🚀 一键体验（模拟账号）
            </button>
          </form>
        </mat-card-content>
        <mat-card-actions align="end">
          <a mat-button routerLink="/register">没有账号？去注册</a>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styles: [`
    .login-container {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      background-color: #f5f7fa;
    }
    .login-card {
      width: 400px;
      padding: 20px;
    }
    .full-width {
      width: 100%;
      margin-bottom: 16px;
    }
    .divider {
      text-align: center;
      margin: 16px 0;
      position: relative;
    }
    .divider span {
      background-color: #fff;
      padding: 0 10px;
      color: #999;
      font-size: 12px;
    }
  `]
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  credentials = { username: '', password: '' };
  loading = false;

  onSubmit(): void {
    if (this.loading) return;
    this.loading = true;

    this.authService.login(this.credentials).subscribe({
      next: () => {
        this.router.navigate(['/dashboard']);
      },
      error: (err: any) => {
        this.loading = false;
        this.snackBar.open(err.error?.detail || '登录失败，请检查用户名和密码', '关闭', { duration: 3000 });
      }
    });
  }

  mockLogin(): void {
    if (this.loading) return;
    this.loading = true;
    
    this.authService.login({ username: 'user', password: '12345678' }).subscribe({
      next: () => {
        this.snackBar.open('欢迎体验！已使用模拟账号登录', '关闭', { duration: 3000 });
        this.router.navigate(['/dashboard']);
      },
      error: (err: any) => {
        this.loading = false;
        this.snackBar.open('模拟登录失败，请确保后端服务已启动', '关闭', { duration: 3000 });
      }
    });
  }
}
