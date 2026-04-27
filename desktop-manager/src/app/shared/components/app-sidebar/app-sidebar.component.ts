import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

import { ThemeService } from '../../../core/services/theme.service';

interface MenuItem {
  icon: string;
  label: string;
  route: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    RouterLink,
    RouterLinkActive
  ],
  templateUrl: './app-sidebar.component.html',
  styleUrls: ['./app-sidebar.component.scss']
})
export class SidebarComponent {
  isCollapsed = false;
  isInfoMinimized = false;
  currentTheme: 'light' | 'dark' = 'light';

  menuItems: MenuItem[] = [
    { icon: 'dashboard', label: '仪表盘', route: '/dashboard' },
    { icon: 'folder_special', label: '我的项目', route: '/my-projects' },
    { icon: 'explore', label: '资源浏览器', route: '/resource-browser' },
    { icon: 'menu_book', label: '教程库', route: '/tutorial-library' },
    { icon: 'library_books', label: '课件库', route: '/material-library' },
    { icon: 'quiz', label: '题库练习', route: '/question-practice' },
    { icon: 'insights', label: '学习统计', route: '/question-stats' },
    { icon: 'hub', label: 'STEM知识图谱', route: '/knowledge-graph' },
    { icon: 'memory', label: '硬件项目', route: '/hardware-projects' },
    { icon: 'person', label: '个人中心', route: '/profile' },
    { icon: 'settings', label: '系统设置', route: '/settings' },
  ];

  constructor(
    private router: Router,
    private themeService: ThemeService
  ) {
    this.currentTheme = this.themeService.getTheme();
    // 恢复侧边栏折叠状态
    const savedState = localStorage.getItem('sidebar-collapsed');
    if (savedState !== null) {
      this.isCollapsed = savedState === 'true';
    }
    // 恢复信息卡片折叠状态
    const infoState = localStorage.getItem('resource-info-minimized');
    if (infoState !== null) {
      this.isInfoMinimized = infoState === 'true';
    }
  }

  toggleSidebar(): void {
    this.isCollapsed = !this.isCollapsed;
    // 保存折叠状态到本地存储
    localStorage.setItem('sidebar-collapsed', String(this.isCollapsed));
  }

  toggleInfoCard(): void {
    this.isInfoMinimized = !this.isInfoMinimized;
    // 保存信息卡片折叠状态
    localStorage.setItem('resource-info-minimized', String(this.isInfoMinimized));
  }
}
