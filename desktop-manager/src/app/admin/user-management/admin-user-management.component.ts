import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnDestroy,
  OnInit,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { UserService } from '../../core/services/user.service';
import { User, UserRole } from '../../models/user.models';
import { UserDetailDialogComponent } from './user-detail-dialog.component';
import { BulkImportDialogComponent } from './bulk-import-dialog.component';

/**
 * Admin用户管理组件
 * 提供系统用户的完整管理功能
 */
@Component({
  selector: 'app-admin-user-management',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatProgressSpinnerModule,
    MatInputModule,
    MatSelectModule,
    MatTableModule,
    MatCheckboxModule,
    MatChipsModule,
  ],
  templateUrl: './admin-user-management.component.html',
  styleUrls: ['./admin-user-management.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminUserManagementComponent implements OnInit, OnDestroy {
  private userService = inject(UserService);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  private destroy$ = new Subject<void>();

  readonly loading = signal<boolean>(true);
  readonly users = signal<User[]>([]);
  readonly filteredUsers = signal<User[]>([]);
  readonly selectedTab = signal<number>(0);
  readonly searchQuery = signal<string>('');
  readonly selectedRole = signal<string>('all');
  readonly selectedStatus = signal<string>('all');
  readonly showFilterPanel = signal<boolean>(false);
  readonly selectedUsers = signal<number[]>([]);
  readonly userStats = signal<{
    totalUsers: number;
    activeUsers: number;
    inactiveUsers: number;
    adminUsers: number;
    orgAdminUsers: number;
  } | null>(null);

  // 表格列定义
  readonly displayedColumns: string[] = [
    'select',
    'id',
    'username',
    'email',
    'role',
    'status',
    'organization',
    'createdAt',
    'actions',
  ];

  ngOnInit(): void {
    this.loadUserStats();
    this.loadUsers();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * 加载用户统计数据
   */
  loadUserStats(): void {
    this.userService.getUserStats().pipe(takeUntil(this.destroy$)).subscribe({
      next: (stats) => {
        this.userStats.set(stats);
      },
      error: (error) => {
        console.error('加载用户统计失败:', error);
        this.snackBar.open('加载统计数据失败', '关闭', { duration: 3000 });
      },
    });
  }

  /**
   * 加载用户列表
   */
  loadUsers(): void {
    this.loading.set(true);
    this.userService.getUsers().pipe(takeUntil(this.destroy$)).subscribe({
      next: (users) => {
        this.users.set(users);
        this.applyFilters();
        this.loading.set(false);
      },
      error: (error) => {
        console.error('加载用户列表失败:', error);
        this.snackBar.open('加载用户列表失败', '关闭', { duration: 3000 });
        this.loading.set(false);
      },
    });
  }

  /**
   * 应用筛选条件
   */
  applyFilters(): void {
    let filtered = this.users();

    // 搜索过滤
    const query = this.searchQuery().toLowerCase();
    if (query) {
      filtered = filtered.filter(
        (user) =>
          user.username?.toLowerCase().includes(query) ||
          user.email.toLowerCase().includes(query)
      );
    }

    // 角色过滤
    const role = this.selectedRole();
    if (role && role !== 'all') {
      filtered = filtered.filter((user) => user.role === role);
    }

    // 状态过滤
    const status = this.selectedStatus();
    if (status && status !== 'all') {
      const isActive = status === 'active';
      filtered = filtered.filter((user) => user.is_active === isActive);
    }

    this.filteredUsers.set(filtered);
  }

  /**
   * 重置筛选条件
   */
  resetFilters(): void {
    this.searchQuery.set('');
    this.selectedRole.set('all');
    this.selectedStatus.set('all');
    this.applyFilters();
    this.snackBar.open('筛选已重置', '关闭', { duration: 2000 });
  }

  /**
   * 切换筛选面板
   */
  toggleFilterPanel(): void {
    this.showFilterPanel.update((v) => !v);
  }

  /**
   * 刷新数据
   */
  onRefresh(): void {
    this.loadUserStats();
    this.loadUsers();
    this.snackBar.open('数据已刷新', '关闭', { duration: 2000 });
  }

  /**
   * 导出用户数据
   */
  exportUsers(): void {
    this.snackBar.open('导出用户数据功能开发中...', '关闭', { duration: 2000 });
  }

  /**
   * 批量导入用户
   */
  importUsers(): void {
    this.dialog.open(BulkImportDialogComponent, {
      width: '700px',
      maxWidth: '90vw',
    });
  }

  /**
   * 查看用户详情
   */
  onViewUser(user: User): void {
    this.dialog.open(UserDetailDialogComponent, {
      width: '700px',
      maxWidth: '90vw',
      data: { userId: user.id },
    });
  }

  /**
   * 编辑用户
   */
  onEditUser(user: User): void {
    this.snackBar.open(`编辑用户 ${user.username} 功能开发中...`, '关闭', {
      duration: 2000,
    });
  }

  /**
   * 删除用户
   */
  onDeleteUser(user: User): void {
    if (confirm(`确定要删除用户 "${user.username}" 吗？此操作不可恢复！`)) {
      this.userService.deleteUser(user.id).pipe(takeUntil(this.destroy$)).subscribe({
        next: () => {
          this.snackBar.open('用户删除成功', '关闭', { duration: 2000 });
          this.loadUsers();
        },
        error: (error) => {
          console.error('删除用户失败:', error);
          this.snackBar.open('删除用户失败', '关闭', { duration: 3000 });
        },
      });
    }
  }

  /**
   * 切换用户选择
   */
  toggleUserSelection(userId: number): void {
    const selected = this.selectedUsers();
    const index = selected.indexOf(userId);
    if (index > -1) {
      this.selectedUsers.set(selected.filter((id) => id !== userId));
    } else {
      this.selectedUsers.set([...selected, userId]);
    }
  }

  /**
   * 全选/取消全选
   */
  toggleSelectAll(): void {
    if (this.selectedUsers().length === this.filteredUsers().length) {
      this.selectedUsers.set([]);
    } else {
      this.selectedUsers.set(this.filteredUsers().map((u) => u.id));
    }
  }

  /**
   * 批量操作用户
   */
  batchAction(action: string): void {
    const selected = this.selectedUsers();
    if (selected.length === 0) {
      this.snackBar.open('请先选择用户', '关闭', { duration: 2000 });
      return;
    }

    this.snackBar.open(`批量${action} ${selected.length} 个用户功能开发中...`, '关闭', {
      duration: 2000,
    });
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
