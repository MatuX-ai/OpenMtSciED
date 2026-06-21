import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatBadgeModule } from '@angular/material/badge';
import { Router } from '@angular/router';

import { LibrariesStatsService } from '../../core/services/libraries-stats.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatCardModule, MatTooltipModule, MatBadgeModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  // 主要功能卡片
  primaryActions = [
    {
      title: '课题工作室',
      description: '提出课题、AI 大纲、匹配课件与图谱',
      route: '/topic-studio',
      icon: 'ri-lightbulb-flash-line',
      color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    },
    {
      title: '我的项目',
      description: '管理本地个性化课程',
      route: '/my-projects',
      icon: 'ri-star-line',
      color: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
      badge: 0
    },
    {
      title: '创作者中心',
      description: '创课分、等级与积分流水',
      route: '/creator-center',
      icon: 'ri-medal-line',
      color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    },
    {
      title: '公开资源库',
      description: '浏览已通过审核的公开教学包',
      route: '/public-library',
      icon: 'ri-global-line',
      color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    },
    {
      title: '每日一题',
      description: '保持 STEM 学习手感',
      route: '/question-practice?mode=daily',
      icon: 'ri-trophy-line',
      color: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)'
    },
    {
      title: '统一资源库',
      description: '教程、课件与开源资源一站式浏览',
      route: '/resource-explorer',
      icon: 'ri-archive-line',
      color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      badge: 0
    }
  ];

  // 辅助功能卡片
  secondaryActions = [
    {
      title: '知识图谱',
      description: '查看连贯学习路径',
      route: '/knowledge-graph',
      icon: 'ri-share-line',
      color: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      badge: 0
    },
    {
      title: '硬件项目',
      description: '低成本 Arduino/ESP32 实践',
      route: '/hardware-projects',
      icon: 'ri-cpu-line',
      color: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
      badge: 0
    },
    {
      title: '系统设置',
      description: '配置存储与 AI 选项',
      route: '/settings',
      icon: 'ri-settings-line',
      color: 'linear-gradient(135deg, #d299c2 0%, #fef9d7 100%)',
      badge: 0
    }
  ];

  // 统计数字（fallback 当 API 不可用时显示）
  fallbackStats = { projects: 12, courses: 156, hardware: 24 };

  constructor(
    private router: Router,
    private librariesStatsService: LibrariesStatsService
  ) {}

  ngOnInit(): void {
    this.loadStats();
  }

  /**
   * 从后端加载统计数字
   */
  loadStats(): void {
    this.librariesStatsService.getStats().subscribe({
      next: (stats) => {
        // 后端字段: tutorials(教程), materials(课件), hardware(硬件项目), questions(试题)
        const courses = stats.tutorials || this.fallbackStats.courses;
        const hardware = stats.hardware || this.fallbackStats.hardware;
        // 用 questions 当 projects 的 proxy（如果后端没有 user-projects 端点）
        const projects = stats.questions || this.fallbackStats.projects;
        this.setStatNumber('stat-courses', courses);
        this.setStatNumber('stat-hardware', hardware);
        this.setStatNumber('stat-projects', projects);
      },
      error: (err) => {
        console.warn('加载统计失败，使用 fallback:', err);
      },
    });
  }

  private setStatNumber(id: string, value: number): void {
    const el = document.getElementById(id);
    if (el) {
      el.textContent = value.toLocaleString();
    }
  }

  /**
   * 导航到指定路由
   */
  navigate(route: string): void {
    const [path, queryString] = route.split('?');
    if (queryString) {
      const queryParams: Record<string, string> = {};
      queryString.split('&').forEach((pair) => {
        const [key, value] = pair.split('=');
        if (key) queryParams[key] = value || '';
      });
      void this.router.navigate([path], { queryParams });
    } else {
      void this.router.navigate([route]);
    }
  }
}
