import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService, UserInfo } from '../../../core/services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSnackBarModule,
  ],
  template: `
    <div class="profile-container">
      <div class="profile-header">
        <h1>个人资料</h1>
        <p>管理您的账户信息</p>
      </div>

      <div class="loading" *ngIf="loading">
        <mat-icon class="spinner">sync</mat-icon>
        <p>加载中...</p>
      </div>

      <mat-card class="profile-card" *ngIf="!loading && user">
        <mat-card-content>
          <div class="avatar-section">
            <div class="avatar">
              {{ getInitials() }}
            </div>
            <div class="user-basic-info">
              <h2>{{ user.username }}</h2>
              <p class="email">{{ user.email }}</p>
              <div class="badges">
                <span class="badge" [class.admin]="user.is_superuser">
                  {{ user.is_superuser ? '管理员' : '用户' }}
                </span>
                <span class="badge" [class.active]="user.is_active">
                  {{ user.is_active ? '活跃' : '非活跃' }}
                </span>
              </div>
            </div>
          </div>

          <form (ngSubmit)="updateProfile()" class="profile-form">
            <div class="form-row">
              <mat-form-field appearance="outline" class="form-field">
                <mat-label>用户名</mat-label>
                <input matInput [(ngModel)]="editForm.username" name="username" readonly />
              </mat-form-field>

              <mat-form-field appearance="outline" class="form-field">
                <mat-label>邮箱</mat-label>
                <input matInput [(ngModel)]="editForm.email" name="email" type="email" />
              </mat-form-field>
            </div>

            <div class="form-actions">
              <button mat-button type="button" (click)="resetForm()">重置</button>
              <button mat-raised-button color="primary" type="submit" [disabled]="!hasChanges()">
                保存更改
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .profile-container {
      max-width: 800px;
      margin: 0 auto;
      padding: 2rem;
    }

    .profile-header {
      margin-bottom: 2rem;
    }

    .profile-header h1 {
      margin: 0 0 0.5rem 0;
      font-size: 2rem;
      color: #1976d2;
    }

    .profile-header p {
      margin: 0;
      color: #666;
    }

    .loading {
      text-align: center;
      padding: 3rem;
    }

    .spinner {
      font-size: 48px;
      animation: spin 1s linear infinite;
      color: #1976d2;
    }

    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    .profile-card {
      padding: 2rem;
    }

    .avatar-section {
      display: flex;
      align-items: center;
      gap: 2rem;
      margin-bottom: 2rem;
      padding-bottom: 2rem;
      border-bottom: 1px solid #e0e0e0;
    }

    .avatar {
      width: 100px;
      height: 100px;
      border-radius: 50%;
      background: linear-gradient(135deg, #1976d2, #42a5f5);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 2.5rem;
      font-weight: bold;
      color: white;
      flex-shrink: 0;
    }

    .user-basic-info h2 {
      margin: 0 0 0.5rem 0;
      font-size: 1.5rem;
    }

    .email {
      margin: 0 0 1rem 0;
      color: #666;
    }

    .badges {
      display: flex;
      gap: 0.5rem;
    }

    .badge {
      padding: 0.25rem 0.75rem;
      border-radius: 16px;
      font-size: 0.875rem;
      background: #e0e0e0;
      color: #666;
    }

    .badge.admin {
      background: #1976d2;
      color: white;
    }

    .badge.active {
      background: #4caf50;
      color: white;
    }

    .profile-form {
      margin-top: 1rem;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .form-field {
      width: 100%;
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      margin-top: 1.5rem;
    }

    @media (max-width: 768px) {
      .profile-container {
        padding: 1rem;
      }

      .avatar-section {
        flex-direction: column;
        text-align: center;
      }

      .form-row {
        grid-template-columns: 1fr;
      }

      .form-actions {
        flex-direction: column;
      }

      .form-actions button {
        width: 100%;
      }
    }
  `],
})
export class ProfileComponent implements OnInit {
  private authService = inject(AuthService);
  private snackBar = inject(MatSnackBar);

  user: UserInfo | null = null;
  loading = true;
  editForm = {
    username: '',
    email: '',
  };
  originalForm = {
    username: '',
    email: '',
  };

  ngOnInit(): void {
    this.authService.currentUser$.subscribe((user) => {
      this.user = user;
      if (user) {
        this.editForm.username = user.username;
        this.editForm.email = user.email;
        this.originalForm.username = user.username;
        this.originalForm.email = user.email;
      }
      this.loading = false;
    });
  }

  getInitials(): string {
    if (!this.user || !this.user.username) return 'U';
    return this.user.username.charAt(0).toUpperCase();
  }

  hasChanges(): boolean {
    return (
      this.editForm.username !== this.originalForm.username ||
      this.editForm.email !== this.originalForm.email
    );
  }

  resetForm(): void {
    if (this.user) {
      this.editForm.username = this.user.username;
      this.editForm.email = this.user.email;
    }
  }

  updateProfile(): void {
    // TODO: 调用后端API更新用户信息
    // 目前仅显示提示
    this.snackBar.open('个人资料更新功能开发中...', '关闭', {
      duration: 3000,
    });

    // 更新本地状态
    this.originalForm.username = this.editForm.username;
    this.originalForm.email = this.editForm.email;

    this.snackBar.open('保存成功（演示模式）', '关闭', {
      duration: 2000,
    });
  }
}
