import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatBadgeModule } from '@angular/material/badge';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatCardModule, MatIconModule, MatTooltipModule, MatBadgeModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  // 主要功能卡片
  primaryActions = [
    { 
      title: '我的项目', 
      description: '管理本地个性化课程', 
      route: '/my-projects', 
      icon: 'folder_special', 
      color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      badge: 0 
    },
    { 
      title: '每日一题', 
      description: '保持 STEM 学习手感', 
      route: '/question-practice?mode=daily', 
      icon: 'emoji_events', 
      color: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)'
    },
    { 
      title: '资源浏览器', 
      description: '教程与课件联动浏览', 
      route: '/resource-browser', 
      icon: 'explore',
      color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
    },
    { 
      title: '教程库', 
      description: '浏览和管理开源 STEM 教程', 
      route: '/tutorial-library', 
      icon: 'menu_book', 
      color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      badge: 0 
    },
    { 
      title: '课件库', 
      description: '获取 OpenStax 等经典教材', 
      route: '/material-library', 
      icon: 'library_books', 
      color: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      badge: 0 
    }
  ];

  // 辅助功能卡片
  secondaryActions = [
    { 
      title: '知识图谱', 
      description: '查看连贯学习路径', 
      route: '/knowledge-graph', 
      icon: 'hub',
      color: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      badge: 0
    },
    { 
      title: '硬件项目', 
      description: '低成本 Arduino/ESP32 实践', 
      route: '/hardware-projects', 
      icon: 'memory',
      color: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
      badge: 0
    },
    { 
      title: '系统设置', 
      description: '配置存储与 AI 选项', 
      route: '/settings', 
      icon: 'settings',
      color: 'linear-gradient(135deg, #d299c2 0%, #fef9d7 100%)',
      badge: 0
    }
  ];

  constructor(
    private router: Router
  ) {}

  ngOnInit(): void {
    // 初始化逻辑
  }

  /**
   * 导航到指定路由
   */
  navigate(route: string): void {
    void this.router.navigate([route]);
  }
}
