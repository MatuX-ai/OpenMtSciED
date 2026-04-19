import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatChipsModule } from '@angular/material/chips';

import { UserService } from '../../core/services/user.service';
import { User, UserRole } from '../../models/user.models';

/**
 * 用户详情对话框组件
 */
@Component({
  selector: 'app-user-detail-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatSelectModule,
    MatChipsModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <div class="user-detail-dialog">
      <h2 mat-dialog-title>
        <mat-icon>person</mat-icon>
        用户详情
      </h2>

      <mat-dialog-content>
        @if (loading()) {
          <div class="loading-container">
            <mat-progress-spinner mode="indeterminate" diameter="40"></mat-progress-spinner>
            <p>加载中...</p>
          </div>
        } @else if (user()) {
          <div class="user-info">
            <!-- 基本信息 -->
            <mat-card class="info-card">
              <mat-card-header>
                <mat-card-title>基本信息</mat-card-title>
              </mat-card-header>
              <mat-card-content>
                <div class="info-grid">
                  <div class="info-item">
                    <label>用户ID:</label>
                    <span>{{ user()?.id }}</span>
                  </div>
                  <div class="info-item">
                    <label>用户名:</label>
                    <span>{{ user()?.username || '-' }}</span>
                  </div>
                  <div class="info-item">
                    <label>邮箱:</label>
                    <span>{{ user()?.email }}</span>
                  </div>
                  <div class="info-item">
                    <label>角色:</label>
                    <mat-chip-set>
                      <mat-chip [class]="getRoleClass(user()?.role || 'user')">
                        {{ getRoleDisplayName(user()?.role || 'user') }}
                      </mat-chip>
                    </mat-chip-set>
                  </div>
                  <div class="info-item">
                    <label>状态:</label>
                    <mat-chip-set>
                      <mat-chip [color]="user()?.is_active ? 'primary' : 'warn'" highlighted>
                        {{ user()?.is_active ? '活跃' : '非活跃' }}
                      </mat-chip>
                    </mat-chip-set>
                  </div>
                  <div class="info-item">
                    <label>超级管理员:</label>
                    <span>{{ user()?.is_superuser ? '是' : '否' }}</span>
                  </div>
                  <div class="info-item">
                    <label>所属组织:</label>
                    <span>{{ getOrganizationName(user()?.organization_id) }}</span>
                  </div>
                  <div class="info-item">
                    <label>注册时间:</label>
                    <span>{{ formatDate(user()?.created_at) }}</span>
                  </div>
                  @if (user()?.updated_at) {
                    <div class="info-item">
                      <label>更新时间:</label>
                      <span>{{ formatDate(user()?.updated_at) }}</span>
                    </div>
                  }
                </div>
              </mat-card-content>
            </mat-card>

            <!-- 角色管理 -->
            <mat-card class="info-card">
              <mat-card-header>
                <mat-card-title>角色管理</mat-card-title>
              </mat-card-header>
              <mat-card-content>
                <div class="role-management">
                  <p class="hint-text">为用户分配或撤销角色权限</p>
                  
                  <div class="role-selector">
                    <mat-form-field appearance="outline">
                      <mat-label>选择角色</mat-label>
                      <mat-select [(ngModel)]="selectedRole">
                        <mat-option value="user">普通用户</mat-option>
                        <mat-option value="admin">系统管理员</mat-option>
                        <mat-option value="org_admin">机构管理员</mat-option>
                        <mat-option value="premium">高级用户</mat-option>
                      </mat-select>
                    </mat-form-field>

                    <button 
                      mat-flat-button 
                      color="primary"
                      (click)="assignRole()"
                      [disabled]="!selectedRole"
                    >
                      <mat-icon>add</mat-icon>
                      分配角色
                    </button>
                  </div>

                  <!-- 当前角色列表 -->
                  <div class="current-roles">
                    <h4>当前角色:</h4>
                    <mat-chip-set>
                      <mat-chip [class]="getRoleClass(user()?.role || 'user')">
                        {{ getRoleDisplayName(user()?.role || 'user') }}
                        <button matChipRemove (click)="removeRole()">
                          <mat-icon>cancel</mat-icon>
                        </button>
                      </mat-chip>
                    </mat-chip-set>
                  </div>
                </div>
              </mat-card-content>
            </mat-card>
          </div>
        }
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-button mat-dialog-close>关闭</button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .user-detail-dialog {
      min-width: 600px;
      max-width: 800px;

      h2[mat-dialog-title] {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 20px;
        color: #333;
      }

      .loading-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 40px;
        color: #666;

        p {
          margin-top: 15px;
        }
      }

      .user-info {
        display: flex;
        flex-direction: column;
        gap: 20px;
      }

      .info-card {
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        border-radius: 8px;

        mat-card-header {
          margin-bottom: 15px;
          padding-bottom: 10px;
          border-bottom: 1px solid #e0e0e0;
        }

        .info-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 15px;

          .info-item {
            display: flex;
            flex-direction: column;
            gap: 5px;

            label {
              font-size: 0.85rem;
              color: #666;
              font-weight: 500;
            }

            span {
              font-size: 1rem;
              color: #333;
            }
          }
        }
      }

      .role-management {
        .hint-text {
          color: #666;
          font-size: 0.9rem;
          margin-bottom: 15px;
        }

        .role-selector {
          display: flex;
          gap: 15px;
          align-items: flex-start;
          margin-bottom: 20px;

          mat-form-field {
            flex: 1;
          }

          button {
            display: flex;
            align-items: center;
            gap: 5px;
            align-self: flex-end;
          }
        }

        .current-roles {
          h4 {
            margin: 0 0 10px 0;
            color: #333;
            font-size: 0.95rem;
          }

          .mat-mdc-chip {
            &.role-user {
              background-color: #e3f2fd;
              color: #1976d2;
            }

            &.role-admin {
              background-color: #fce4ec;
              color: #c2185b;
            }

            &.role-org-admin {
              background-color: #f3e5f5;
              color: #7b1fa2;
            }

            &.role-premium {
              background-color: #fff3e0;
              color: #f57c00;
            }
          }
        }
      }
    }

    @media (max-width: 768px) {
      .user-detail-dialog {
        min-width: 90vw;

        .info-grid {
          grid-template-columns: 1fr !important;
        }

        .role-selector {
          flex-direction: column !important;

          button {
            width: 100%;
          }
        }
      }
    }
  `],
})
export class UserDetailDialogComponent implements OnInit {
  private userService = inject(UserService);
  private snackBar = inject(MatSnackBar);
  private dialogRef = inject(MatDialogRef<UserDetailDialogComponent>);
  private data = inject<{ userId: number }>(MAT_DIALOG_DATA);

  readonly loading = signal<boolean>(true);
  readonly user = signal<User | null>(null);
  readonly selectedRole = signal<string>('');

  ngOnInit(): void {
    this.loadUserDetail();
  }

  /**
   * 加载用户详情
   */
  loadUserDetail(): void {
    this.userService.getUser(this.data.userId).subscribe({
      next: (user) => {
        this.user.set(user);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('加载用户详情失败:', error);
        this.snackBar.open('加载用户详情失败', '关闭', { duration: 3000 });
        this.loading.set(false);
      },
    });
  }

  /**
   * 分配角色
   */
  assignRole(): void {
    const role = this.selectedRole();
    if (!role) return;

    // TODO: 调用后端API分配角色
    this.snackBar.open(`分配角色 "${this.getRoleDisplayName(role)}" 功能开发中...`, '关闭', {
      duration: 2000,
    });
  }

  /**
   * 移除角色
   */
  removeRole(): void {
    // TODO: 调用后端API移除角色
    this.snackBar.open('移除角色功能开发中...', '关闭', { duration: 2000 });
  }

  /**
   * 获取角色显示名称
   */
  getRoleDisplayName(role: UserRole | string): string {
    const roleMap: Record<string, string> = {
      user: '普通用户',
      admin: '系统管理员',
      org_admin: '机构管理员',
      premium: '高级用户',
    };
    return roleMap[role] || role;
  }

  /**
   * 获取角色样式类
   */
  getRoleClass(role: UserRole | string): string {
    const classMap: Record<string, string> = {
      user: 'role-user',
      admin: 'role-admin',
      org_admin: 'role-org-admin',
      premium: 'role-premium',
    };
    return classMap[role] || 'role-default';
  }

  /**
   * 格式化日期
   */
  formatDate(dateString: string | undefined): string {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  /**
   * 获取组织名称
   */
  getOrganizationName(orgId: number | null | undefined): string {
    if (!orgId) return '-';
    return `机构 ${orgId}`;
  }
}
