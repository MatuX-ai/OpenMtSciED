import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
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
    { icon: 'ri-dashboard-line', label: '仪表盘', route: '/dashboard' },
    { icon: 'ri-lightbulb-flash-line', label: '课题工作室', route: '/topic-studio' },
    { icon: 'ri-medal-line', label: '创作者中心', route: '/creator-center' },
    { icon: 'ri-global-line', label: '公开资源库', route: '/public-library' },
    { icon: 'ri-folder-shield-2-line', label: '我的项目', route: '/my-projects' },
    { icon: 'ri-archive-line', label: '统一资源库', route: '/resource-explorer' },
    { icon: 'ri-question-line', label: '题库练习', route: '/question-practice' },
    { icon: 'ri-line-chart-line', label: '学习统计', route: '/question-stats' },
    { icon: 'ri-share-line', label: 'STEM知识图谱', route: '/knowledge-graph' },
    { icon: 'ri-cpu-line', label: '硬件项目', route: '/hardware-projects' },
    { icon: 'ri-user-line', label: '个人中心', route: '/profile' },
    { icon: 'ri-settings-3-line', label: '系统设置', route: '/settings' },
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
