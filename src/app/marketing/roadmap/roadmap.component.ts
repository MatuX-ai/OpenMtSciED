import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

import { MarketingLayoutComponent } from '../shared/marketing-layout/marketing-layout.component';

interface RoadmapPhase {
  phase: string;
  period: string;
  status: 'completed' | 'in-progress' | 'planned';
  color: string;
  features: RoadmapFeature[];
}

interface RoadmapFeature {
  name: string;
  description: string;
  status: 'completed' | 'in-progress' | 'planned';
  priority?: 'P0' | 'P1' | 'P2';
  category: 'frontend' | 'backend' | 'ai' | 'blockchain' | 'xr';
}

@Component({
  selector: 'app-roadmap',
  templateUrl: './roadmap.component.html',
  styleUrls: ['./roadmap.component.scss'],
  imports: [CommonModule, MatCardModule, MatIconModule, MarketingLayoutComponent],
})
export class RoadmapComponent implements OnInit {
  roadmapPhases: RoadmapPhase[] = [
    {
      phase: '第一阶段：基础架构搭建',
      period: '2024 Q1 - Q2',
      status: 'completed',
      color: '#4caf50',
      features: [
        {
          name: 'Angular 前端框架',
          description: '搭建 Angular 17 前端项目，配置路由和基础组件架构',
          status: 'completed',
          priority: 'P0',
          category: 'frontend',
        },
        {
          name: 'FastAPI 后端服务',
          description: '构建 RESTful API 服务，实现基础的数据 CRUD 操作',
          status: 'completed',
          priority: 'P0',
          category: 'backend',
        },
        {
          name: 'PostgreSQL 数据库',
          description: '设计数据库 schema，实现数据持久化层',
          status: 'completed',
          priority: 'P0',
          category: 'backend',
        },
        {
          name: 'JWT 认证系统',
          description: '实现用户登录、注册和权限管理功能',
          status: 'completed',
          priority: 'P0',
          category: 'backend',
        },
      ],
    },
    {
      phase: '第二阶段：核心功能开发',
      period: '2024 Q3 - Q4',
      status: 'in-progress',
      color: '#ff9800',
      features: [
        {
          name: '营销页面模块',
          description: '开发首页、产品展示、功能特性等营销页面',
          status: 'completed',
          priority: 'P1',
          category: 'frontend',
        },
        {
          name: '教育课程系统',
          description: '实现课程管理、学习进度追踪功能',
          status: 'in-progress',
          priority: 'P1',
          category: 'frontend',
        },
        {
          name: 'Three.js 3D 展示',
          description: '集成 Three.js 引擎，实现 3D 模型加载和展示',
          status: 'in-progress',
          priority: 'P1',
          category: 'xr',
        },
        {
          name: '题库与练习系统',
          description: '构建题库管理和在线练习功能',
          status: 'in-progress',
          priority: 'P1',
          category: 'frontend',
        },
        {
          name: 'Fabric 区块链实验',
          description: '搭建 Hyperledger Fabric 网络，探索区块链应用场景',
          status: 'in-progress',
          priority: 'P2',
          category: 'blockchain',
        },
      ],
    },
    {
      phase: '第三阶段：AI 能力增强',
      period: '2025 Q1 - Q2',
      status: 'planned',
      color: '#2196f3',
      features: [
        {
          name: '智能教学助手',
          description: '基于 LangChain 开发 AI 助教，提供智能答疑服务',
          status: 'planned',
          priority: 'P1',
          category: 'ai',
        },
        {
          name: '学习数据分析',
          description: '利用 AI 分析学生学习行为，生成个性化报告',
          status: 'planned',
          priority: 'P1',
          category: 'ai',
        },
        {
          name: '自适应推荐系统',
          description: '根据学生水平推荐合适的学习内容和路径',
          status: 'planned',
          priority: 'P2',
          category: 'ai',
        },
      ],
    },
    {
      phase: '第四阶段：XR 与移动扩展',
      period: '2025 Q3 - Q4',
      status: 'planned',
      color: '#2196f3',
      features: [
        {
          name: 'Vircadia 虚拟实验室',
          description: '完善虚拟实验室功能，支持多人协作实验',
          status: 'planned',
          priority: 'P1',
          category: 'xr',
        },
        {
          name: 'Flutter AR 应用',
          description: '开发移动端 AR 应用，支持实物识别和交互',
          status: 'planned',
          priority: 'P2',
          category: 'xr',
        },
        {
          name: '跨平台同步',
          description: '实现 Web、移动端数据同步和状态共享',
          status: 'planned',
          priority: 'P2',
          category: 'backend',
        },
      ],
    },
    {
      phase: '第五阶段：生态建设',
      period: '2026 Q1 及以后',
      status: 'planned',
      color: '#2196f3',
      features: [
        {
          name: '开源社区运营',
          description: '建设开发者社区，鼓励第三方贡献和插件开发',
          status: 'planned',
          priority: 'P2',
          category: 'frontend',
        },
        {
          name: 'API 开放平台',
          description: '开放 API 接口，支持第三方应用集成',
          status: 'planned',
          priority: 'P2',
          category: 'backend',
        },
        {
          name: '教育机构合作',
          description: '与学校和教育机构合作，推广实际应用',
          status: 'planned',
          priority: 'P2',
          category: 'frontend',
        },
      ],
    },
  ];

  constructor() {}

  ngOnInit(): void {}

  getPhaseIcon(status: 'completed' | 'in-progress' | 'planned'): string {
    const iconMap: Record<string, string> = {
      completed: 'ri-check-circle-fill',
      'in-progress': 'ri-time-line',
      planned: 'ri-calendar-line',
    };
    return iconMap[status] || 'ri-question-line';
  }

  getPhaseStatusText(status: 'completed' | 'in-progress' | 'planned'): string {
    const statusMap: Record<string, string> = {
      completed: '已完成',
      'in-progress': '进行中',
      planned: '规划中',
    };
    return statusMap[status] || '未知';
  }

  getFeatureStatusText(status: 'completed' | 'in-progress' | 'planned'): string {
    const statusMap: Record<string, string> = {
      completed: '完成',
      'in-progress': '开发中',
      planned: '规划',
    };
    return statusMap[status] || '未知';
  }

  getCategoryName(category: 'frontend' | 'backend' | 'ai' | 'blockchain' | 'xr'): string {
    const categoryMap: Record<string, string> = {
      frontend: '前端',
      backend: '后端',
      ai: '人工智能',
      blockchain: '区块链',
      xr: 'XR/AR/VR',
    };
    return categoryMap[category] || '其他';
  }

  get completedCount(): number {
    return this.countByStatus('completed');
  }

  get inProgressCount(): number {
    return this.countByStatus('in-progress');
  }

  get plannedCount(): number {
    return this.countByStatus('planned');
  }

  get totalCompletionRate(): number {
    const allFeatures = this.getAllFeatures();
    if (allFeatures.length === 0) return 0;

    const completed = allFeatures.filter((f) => f.status === 'completed').length;
    return Math.round((completed / allFeatures.length) * 100);
  }

  private countByStatus(status: string): number {
    return this.getAllFeatures().filter((f) => f.status === status).length;
  }

  private getAllFeatures(): RoadmapFeature[] {
    return this.roadmapPhases.flatMap((phase) => phase.features);
  }
}
