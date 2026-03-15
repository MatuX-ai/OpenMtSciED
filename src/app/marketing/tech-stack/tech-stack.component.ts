import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';

import { MarketingLayoutComponent } from '../shared/marketing-layout/marketing-layout.component';

interface TechCategory {
  name: string;
  icon: string;
  color: string;
  technologies: Technology[];
}

interface Technology {
  name: string;
  version?: string;
  description: string;
  status: 'completed' | 'in-progress' | 'planned';
  completionRate: number;
  links?: { label: string; url: string }[];
}

@Component({
  selector: 'app-tech-stack',
  template: `
    <app-marketing-layout>
      <div class="tech-stack-page">
        <!-- Header -->
        <section class="hero-section">
          <div class="container">
            <h1 class="hero-title">技术栈详情</h1>
            <p class="hero-subtitle">透明展示项目使用的技术和框架，了解我们的技术选型</p>
          </div>
        </section>

        <!-- Tech Stack Categories -->
        <section class="categories-section">
          <div class="container">
            <mat-card class="category-card" *ngFor="let category of techCategories">
              <mat-card-header>
                <div class="category-icon" [style.background]="category.color">
                  <mat-icon>{{ category.icon }}</mat-icon>
                </div>
                <mat-card-title>{{ category.name }}</mat-card-title>
              </mat-card-header>
              <mat-card-content>
                <div class="tech-grid">
                  <div class="tech-item" *ngFor="let tech of category.technologies">
                    <div class="tech-header">
                      <h3 class="tech-name">
                        {{ tech.name }}
                        <span class="tech-version" *ngIf="tech.version">{{ tech.version }}</span>
                      </h3>
                      <span class="status-badge" [class]="'status-' + tech.status">
                        {{ getStatusText(tech.status) }}
                      </span>
                    </div>
                    <p class="tech-description">{{ tech.description }}</p>
                    <div class="progress-section">
                      <div class="progress-info">
                        <span>完成度</span>
                        <span>{{ tech.completionRate }}%</span>
                      </div>
                      <mat-progress-bar
                        mode="determinate"
                        [value]="tech.completionRate"
                      ></mat-progress-bar>
                    </div>
                    <div class="tech-links" *ngIf="tech.links">
                      <a
                        *ngFor="let link of tech.links"
                        [href]="link.url"
                        target="_blank"
                        mat-button
                        color="primary"
                      >
                        <mat-icon>link</mat-icon>
                        {{ link.label }}
                      </a>
                    </div>
                  </div>
                </div>
              </mat-card-content>
            </mat-card>
          </div>
        </section>

        <!-- Legend -->
        <section class="legend-section">
          <div class="container">
            <h3>状态说明</h3>
            <div class="legend-items">
              <div class="legend-item">
                <span class="legend-badge status-completed">已完成</span>
                <span>功能完整可用</span>
              </div>
              <div class="legend-item">
                <span class="legend-badge status-in-progress">进行中</span>
                <span>部分功能开发中</span>
              </div>
              <div class="legend-item">
                <span class="legend-badge status-planned">规划中</span>
                <span>未来版本实现</span>
              </div>
            </div>
          </div>
        </section>

        <!-- Disclaimer -->
        <section class="disclaimer-section">
          <div class="container">
            <mat-card class="disclaimer-card">
              <mat-card-content>
                <mat-icon>info</mat-icon>
                <p>
                  本页面展示的技术栈信息基于当前代码实现。部分技术处于开发阶段，实际功能和性能可能有所不同。
                </p>
              </mat-card-content>
            </mat-card>
          </div>
        </section>
      </div>
    </app-marketing-layout>
  `,
  styles: [
    `
      .tech-stack-page {
        min-height: 100vh;
        background: #f8f9fa;
        padding-bottom: 60px;
      }

      .hero-section {
        min-height: 300px; // 统一首焦图高度
        background-color: #f8fafc; // 浅灰白背景
        background-image:
          linear-gradient(rgba(200, 220, 255, 0.08) 1px, transparent 1px),
          linear-gradient(90deg, rgba(200, 220, 255, 0.08) 1px, transparent 1px);
        background-size: 40px 40px; // 网格大小
        color: #1d2129; // 黑色字体
        padding: 60px 0; // 调整上下内边距
        text-align: center;
      }

      .hero-title {
        font-size: 3rem;
        font-weight: 700;
        margin-bottom: 16px;
      }

      .hero-subtitle {
        font-size: 1.3rem;
        opacity: 0.95;
      }

      .categories-section {
        padding: 60px 0;
      }

      .category-card {
        margin-bottom: 32px;
        border-radius: 12px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
      }

      .category-card mat-card-header {
        margin-bottom: 24px;
        display: flex;
        align-items: center;
        gap: 16px;
      }

      .category-icon {
        width: 56px;
        height: 56px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;

        mat-icon {
          color: white;
          font-size: 32px;
          width: 32px;
          height: 32px;
        }
      }

      .category-card mat-card-title {
        font-size: 1.8rem;
        font-weight: 600;
      }

      .tech-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
        gap: 24px;
      }

      .tech-item {
        padding: 24px;
        background: #fafafa;
        border-radius: 8px;
        border-left: 4px solid #667eea;
        transition: all 0.3s ease;

        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
      }

      .tech-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;
      }

      .tech-name {
        font-size: 1.3rem;
        font-weight: 600;
        color: #1a1a1a;
        margin: 0;

        .tech-version {
          color: #666;
          font-size: 0.9rem;
          font-weight: 400;
          margin-left: 8px;
        }
      }

      .status-badge {
        padding: 4px 12px;
        border-radius: 16px;
        font-size: 0.8rem;
        font-weight: 600;

        &.status-completed {
          background: #e8f5e9;
          color: #2e7d32;
        }

        &.status-in-progress {
          background: #fff3e0;
          color: #ef6c00;
        }

        &.status-planned {
          background: #e3f2fd;
          color: #1976d2;
        }
      }

      .tech-description {
        color: #666;
        line-height: 1.6;
        margin-bottom: 16px;
        font-size: 0.95rem;
      }

      .progress-section {
        margin-bottom: 16px;

        .progress-info {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
          font-size: 0.9rem;
          color: #666;
        }

        mat-progress-bar {
          border-radius: 2px;
        }
      }

      .tech-links {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;

        a {
          font-size: 0.85rem;

          mat-icon {
            font-size: 16px;
            width: 16px;
            height: 16px;
            margin-right: 4px;
          }
        }
      }

      .legend-section {
        padding: 40px 0;
        background: white;
        border-top: 1px solid #e0e0e0;
      }

      .legend-section h3 {
        text-align: center;
        font-size: 1.5rem;
        margin-bottom: 24px;
        color: #333;
      }

      .legend-items {
        display: flex;
        justify-content: center;
        gap: 32px;
        flex-wrap: wrap;
      }

      .legend-item {
        display: flex;
        align-items: center;
        gap: 12px;
        color: #666;
        font-size: 0.95rem;
      }

      .legend-badge {
        padding: 4px 16px;
        border-radius: 16px;
        font-size: 0.85rem;
        font-weight: 600;

        &.status-completed {
          background: #e8f5e9;
          color: #2e7d32;
        }

        &.status-in-progress {
          background: #fff3e0;
          color: #ef6c00;
        }

        &.status-planned {
          background: #e3f2fd;
          color: #1976d2;
        }
      }

      .disclaimer-section {
        padding: 40px 0;
      }

      .disclaimer-card {
        background: #fff3cd;
        border-left: 4px solid #ffc107;

        mat-card-content {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 20px !important;

          mat-icon {
            color: #ffc107;
            font-size: 32px;
            width: 32px;
            height: 32px;
            flex-shrink: 0;
          }

          p {
            color: #856404;
            line-height: 1.6;
            margin: 0;
            font-size: 0.95rem;
          }
        }
      }

      .container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 0 24px;
      }

      @media (max-width: 768px) {
        .hero-title {
          font-size: 2rem;
        }

        .tech-grid {
          grid-template-columns: 1fr;
        }

        .legend-items {
          flex-direction: column;
          align-items: center;
          gap: 16px;
        }
      }
    `,
  ],
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatProgressBarModule,
    MarketingLayoutComponent,
  ],
})
export class TechStackComponent implements OnInit {
  techCategories: TechCategory[] = [
    {
      name: '前端技术栈',
      icon: 'code',
      color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      technologies: [
        {
          name: 'Angular',
          version: '17.3.0',
          description: '现代化的 Web 应用框架，提供组件化开发和响应式编程能力',
          status: 'completed',
          completionRate: 90,
          links: [{ label: '官方文档', url: 'https://angular.io/docs' }],
        },
        {
          name: 'Angular Material',
          version: '17.3.10',
          description: '基于 Material Design 的 UI 组件库，提供美观易用的界面组件',
          status: 'completed',
          completionRate: 95,
          links: [{ label: '组件文档', url: 'https://material.angular.io/' }],
        },
        {
          name: 'Three.js',
          version: 'r183.2',
          description: 'WebGL 3D 渲染引擎，用于虚拟实验室和 3D 模型展示',
          status: 'in-progress',
          completionRate: 50,
          links: [{ label: 'Three.js 官网', url: 'https://threejs.org/' }],
        },
        {
          name: 'RxJS',
          version: '7.8.x',
          description: '响应式编程库，用于状态管理和异步操作处理',
          status: 'completed',
          completionRate: 85,
        },
      ],
    },
    {
      name: '后端技术栈',
      icon: 'storage',
      color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      technologies: [
        {
          name: 'FastAPI',
          description: '高性能 Python Web 框架，支持异步处理和自动 API 文档生成',
          status: 'completed',
          completionRate: 80,
          links: [{ label: 'FastAPI 文档', url: 'https://fastapi.tiangolo.com/' }],
        },
        {
          name: 'PostgreSQL',
          description: '强大的开源关系型数据库，支持复杂查询和数据完整性',
          status: 'completed',
          completionRate: 85,
          links: [{ label: 'PostgreSQL 文档', url: 'https://www.postgresql.org/docs/' }],
        },
        {
          name: 'Redis',
          description: '内存数据库，用于缓存和会话管理',
          status: 'in-progress',
          completionRate: 60,
        },
        {
          name: 'JWT 认证',
          description: '基于 JSON Web Token 的身份验证机制',
          status: 'completed',
          completionRate: 90,
        },
      ],
    },
    {
      name: '区块链与 XR',
      icon: 'account_balance',
      color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      technologies: [
        {
          name: 'Hyperledger Fabric',
          description: '企业级联盟链平台，用于证书认证系统（实验阶段）',
          status: 'in-progress',
          completionRate: 60,
          links: [{ label: 'Fabric 文档', url: 'https://hyperledger-fabric.readthedocs.io/' }],
        },
        {
          name: 'Vircadia Web SDK',
          description: '开源虚拟世界 SDK，用于构建 3D 虚拟实验室',
          status: 'in-progress',
          completionRate: 40,
          links: [{ label: 'Vircadia 官网', url: 'https://vircadia.com/' }],
        },
        {
          name: 'Flutter AR',
          description: '移动端 AR 功能开发（规划中）',
          status: 'planned',
          completionRate: 30,
        },
      ],
    },
    {
      name: 'AI 与教育',
      icon: 'school',
      color: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      technologies: [
        {
          name: 'LangChain',
          description: 'AI 应用开发框架，用于智能教学助手（实验阶段）',
          status: 'in-progress',
          completionRate: 40,
          links: [{ label: 'LangChain 文档', url: 'https://python.langchain.com/' }],
        },
        {
          name: '题库系统',
          description: '基础题目管理和练习功能',
          status: 'completed',
          completionRate: 70,
        },
        {
          name: '深度知识追踪 (DKT)',
          description: '基于深度学习的学情分析（规划中）',
          status: 'planned',
          completionRate: 0,
        },
        {
          name: '自适应课程系统',
          description: '个性化学习路径推荐（规划中）',
          status: 'planned',
          completionRate: 10,
        },
      ],
    },
  ];

  constructor() {}

  ngOnInit(): void {}

  getStatusText(status: string): string {
    const statusMap = {
      completed: '已完成',
      'in-progress': '进行中',
      planned: '规划中',
    };
    return statusMap[status as keyof typeof statusMap];
  }
}
