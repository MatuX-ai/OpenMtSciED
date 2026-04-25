import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, MatCardModule, MatInputModule, MatButtonModule, MatSnackBarModule],
  template: `
    <div class="register-container">
      <mat-card class="register-card">
        <mat-card-header>
          <mat-card-title>注册新账号</mat-card-title>
          <mat-card-subtitle>加入 OpenMTSciEd 桌面端管理平台</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <form (ngSubmit)="onSubmit()" #registerForm="ngForm">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>用户名</mat-label>
              <input matInput [(ngModel)]="data.username" name="username" required>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>邮箱</mat-label>
              <input matInput type="email" [(ngModel)]="data.email" name="email" required>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>密码</mat-label>
              <input matInput type="password" [(ngModel)]="data.password" name="password" required>
            </mat-form-field>

            <button mat-raised-button color="primary" class="full-width" [disabled]="loading || !registerForm.valid">
              {{ loading ? '注册中...' : '注册' }}
            </button>
          </form>
        </mat-card-content>
        <mat-card-actions align="end">
          <a mat-button routerLink="/login">已有账号？去登录</a>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styles: [`
    .register-container {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      background-color: #f5f7fa;
    }
    .register-card {
      width: 400px;
      padding: 20px;
    }
    .full-width {
      width: 100%;
      margin-bottom: 16px;
    }
  `]
})
export class RegisterComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  data = { username: '', email: '', password: '' };
  loading = false;

  onSubmit(): void {
    if (this.loading) return;
    this.loading = true;

    this.authService.register(this.data).subscribe({
      next: () => {
        this.snackBar.open('注册成功！请登录', '关闭', { duration: 3000 });
        this.router.navigate(['/login']);
      },
      error: (err: any) => {
        this.loading = false;
        this.snackBar.open(err.error?.detail || '注册失败，请重试', '关闭', { duration: 3000 });
      }
    });
  }
}
