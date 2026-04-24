import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { AuthService, UserInfo } from '../../core/services/auth.service';

interface NavItem {
  path: string;
  icon: string;
  label: string;
}

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterOutlet,
    MatButtonModule,
    MatIconModule,
    MatToolbarModule,
    MatSidenavModule,
    MatListModule,
  ],
  template: `
    <mat-sidenav-container class="sidenav-container">
      <!-- 侧边栏 -->
      <mat-sidenav #sidenav mode="side" opened class="sidenav">
        <div class="sidenav-header">
          <h2>OpenMTSciEd</h2>
          <p>Admin</p>
        </div>

        <mat-nav-list>
          <a mat-list-item routerLink="/dashboard" routerLinkActive="active-link">
            <mat-icon matListItemIcon>dashboard</mat-icon>
            <span matListItemTitle>仪表盘</span>
          </a>

          <a mat-list-item routerLink="/admin/crawlers" routerLinkActive="active-link">
            <mat-icon matListItemIcon>extension</mat-icon>
            <span matListItemTitle>爬虫管理</span>
          </a>

          <a mat-list-item routerLink="/admin/courses" routerLinkActive="active-link">
            <mat-icon matListItemIcon>school</mat-icon>
            <span matListItemTitle>课程管理</span>
          </a>

          <a mat-list-item routerLink="/admin/education-platforms" routerLinkActive="active-link">
            <mat-icon matListItemIcon>dns</mat-icon>
            <span matListItemTitle>教育平台</span>
          </a>

          <a mat-list-item routerLink="/admin/user-management" routerLinkActive="active-link">
            <mat-icon matListItemIcon>people</mat-icon>
            <span matListItemTitle>用户管理</span>
          </a>

          <a mat-list-item routerLink="/admin/settings" routerLinkActive="active-link">
            <mat-icon matListItemIcon>settings</mat-icon>
            <span matListItemTitle>系统设置</span>
          </a>
        </mat-nav-list>
      </mat-sidenav>

      <!-- 主内容区 -->
      <mat-sidenav-content class="main-content">
        <!-- 顶部工具栏 -->
        <mat-toolbar color="primary" class="top-toolbar">
          <button mat-icon-button (click)="sidenav.toggle()" class="menu-button">
            <mat-icon>menu</mat-icon>
          </button>

          <span class="toolbar-title">{{ getTitle() }}</span>

          <span class="spacer"></span>

          <div class="user-info">
            <span class="username">{{ currentUser()?.username || '管理员' }}</span>
            <button mat-icon-button (click)="logout()">
              <mat-icon>logout</mat-icon>
            </button>
          </div>
        </mat-toolbar>

        <!-- 页面内容 -->
        <div class="page-content">
          <router-outlet></router-outlet>
        </div>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: [`
    .sidenav-container {
      height: 100vh;
    }

    .sidenav {
      width: 250px;
      background: #fff;
      border-right: 1px solid #e0e0e0;
    }

    .sidenav-header {
      padding: 20px;
      text-align: center;
      border-bottom: 1px solid #e0e0e0;
    }

    .sidenav-header h2 {
      margin: 0;
      color: #1976d2;
      font-size: 20px;
    }

    .sidenav-header p {
      margin: 5px 0 0 0;
      color: #666;
      font-size: 12px;
    }

    .active-link {
      background-color: #e3f2fd;
      color: #1976d2;
    }

    .main-content {
      display: flex;
      flex-direction: column;
      height: 100vh;
    }

    .top-toolbar {
      display: flex;
      align-items: center;
      padding: 0 20px;
    }

    .menu-button {
      margin-right: 15px;
    }

    .toolbar-title {
      font-size: 18px;
      font-weight: 500;
    }

    .spacer {
      flex: 1 1 auto;
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .username {
      font-size: 14px;
    }

    .page-content {
      flex: 1;
      overflow-y: auto;
      background: #f5f7fa;
    }

    @media (max-width: 768px) {
      .sidenav {
        width: 200px;
      }

      .username {
        display: none;
      }

      .toolbar-title {
        font-size: 16px;
      }

      .sidenav-header h2 {
        font-size: 18px;
      }

      .sidenav-header p {
        font-size: 11px;
      }
    }

    @media (max-width: 480px) {
      .sidenav {
        width: 180px;
      }

      .top-toolbar {
        padding: 0 10px;
      }

      .toolbar-title {
        font-size: 14px;
      }

      .menu-button {
        margin-right: 10px;
      }
    }
  `],
})
export class AdminLayoutComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);

  readonly currentUser = signal<UserInfo | null>(null);

  ngOnInit(): void {
    this.authService.currentUser$.subscribe((user: UserInfo | null) => {
      this.currentUser.set(user);
    });
  }

  getTitle(): string {
    const url = this.router.url;
    if (url.includes('/dashboard')) return '仪表盘';
    if (url.includes('/admin/user-management')) return '用户管理';
    if (url.includes('/admin/courses')) return '课程管理';
    if (url.includes('/admin/crawlers')) return '爬虫管理';
    if (url.includes('/admin/education-platforms')) return '教育平台';
    if (url.includes('/admin/settings')) return '系统设置';
    return 'OpenMTSciEd Admin';
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
