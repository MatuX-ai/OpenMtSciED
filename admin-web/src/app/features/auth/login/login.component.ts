import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject } from '@angular/core';
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
          <mat-card-title>Admin 管理后台登录</mat-card-title>
          <mat-card-subtitle>OpenMTSciEd 系统管理平台</mat-card-subtitle>
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

            <button mat-stroked-button color="accent" class="full-width mock-login-btn" (click)="mockLogin()" [disabled]="loading">
              <span style="display: flex; align-items: center; justify-content: center; gap: 8px;">
                <span>⚡</span>
                <span>快速体验</span>
              </span>
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
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }
    .login-card {
      width: 420px;
      padding: 32px;
      border-radius: 16px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    }
    .full-width {
      width: 100%;
      margin-bottom: 16px;
    }
    .divider {
      text-align: center;
      margin: 20px 0;
      position: relative;
      color: #999;
      font-size: 14px;
    }
    .divider::before,
    .divider::after {
      content: '';
      position: absolute;
      top: 50%;
      width: 45%;
      height: 1px;
      background: linear-gradient(to right, transparent, #e0e0e0, transparent);
    }
    .divider::before {
      left: 0;
    }
    .divider::after {
      right: 0;
    }
    .divider span {
      background-color: #fff;
      padding: 0 12px;
      position: relative;
      z-index: 1;
    }
    .mock-login-btn {
      margin-top: 8px;
    }
  `]
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  private cdr = inject(ChangeDetectorRef);

  credentials = { username: '', password: '' };
  loading = false;

  onSubmit(): void {
    if (this.loading) return;
    this.loading = true;
    this.cdr.detectChanges();

    this.authService.login(this.credentials).subscribe({
      next: () => {
        this.router.navigate(['/dashboard']);
      },
      error: (err: any) => {
        this.loading = false;
        this.cdr.detectChanges();
        this.snackBar.open(err.error?.detail || '登录失败，请检查用户名和密码', '关闭', { duration: 3000 });
      }
    });
  }

  mockLogin(): void {
    if (this.loading) return;
    this.loading = true;
    this.cdr.detectChanges();

    this.authService.login({ username: 'user', password: '12345678' }).subscribe({
      next: () => {
        this.snackBar.open('欢迎体验！已使用模拟账号登录', '关闭', { duration: 3000 });
        this.router.navigate(['/dashboard']);
      },
      error: (err: any) => {
        this.loading = false;
        this.cdr.detectChanges();
        this.snackBar.open('模拟登录失败，请确保后端服务已启动', '关闭', { duration: 3000 });
      }
    });
  }
}
