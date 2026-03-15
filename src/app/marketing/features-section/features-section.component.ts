import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';

import { MarketingLayoutComponent } from '../shared/marketing-layout/marketing-layout.component';

@Component({
  selector: 'app-features-section',
  template: `
    <app-marketing-layout>
      <div class="features-section">
        <!-- Header -->
        <div class="header-section">
          <h1>平台能力</h1>
          <p>基于真实技术栈构建的教育平台功能详解</p>
        </div>

        <!-- Main Features -->
        <section class="features-categories">
          <div class="container">
            <mat-tab-group class="features-tabs">
              <mat-tab
                *ngFor="let category of featureCategories; trackBy: trackByIndex"
                [label]="category.name"
              >
                <div class="tab-content">
                  <div class="category-intro">
                    <mat-icon>{{ category.icon }}</mat-icon>
                    <h2>{{ category.title }}</h2>
                    <p>{{ category.description }}</p>
                    <div class="tech-stack-info" *ngIf="category.techStack">
                      <mat-icon>code</mat-icon>
                      <span>技术栈：{{ category.techStack }}</span>
                    </div>
                  </div>

                  <div class="features-grid">
                    <mat-card
                      class="feature-detail-card"
                      *ngFor="let feature of category.features; trackBy: trackByIndex"
                    >
                      <mat-card-header>
                        <mat-icon mat-card-avatar>{{ feature.icon }}</mat-icon>
                        <mat-card-title>{{ feature.title }}</mat-card-title>
                        <mat-card-subtitle>{{ feature.subtitle }}</mat-card-subtitle>
                      </mat-card-header>

                      <mat-card-content>
                        <p>{{ feature.description }}</p>

                        <ul class="feature-highlights" *ngIf="feature.highlights">
                          <li *ngFor="let highlight of feature.highlights; trackBy: trackByIndex">
                            <mat-icon>check_circle</mat-icon>
                            {{ highlight }}
                          </li>
                        </ul>
                      </mat-card-content>
                    </mat-card>
                  </div>
                </div>
              </mat-tab>
            </mat-tab-group>
          </div>
        </section>

        <!-- Technical Specs -->
        <section class="tech-specs-section">
          <div class="container">
            <h2>技术规格</h2>
            <div class="specs-grid">
              <div class="spec-item" *ngFor="let spec of technicalSpecs; trackBy: trackByIndex">
                <mat-icon>{{ spec.icon }}</mat-icon>
                <h3>{{ spec.title }}</h3>
                <p>{{ spec.description }}</p>
              </div>
            </div>
          </div>
        </section>

        <!-- Integration -->
        <section class="integration-section">
          <div class="container">
            <h2>集成与兼容</h2>
            <div class="integration-logos">
              <div
                class="logo-item"
                *ngFor="let integration of integrations; trackBy: trackByIndex"
              >
                <mat-icon>{{ integration.icon }}</mat-icon>
                <span>{{ integration.name }}</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </app-marketing-layout>
  `,
  styles: [
    `
      .features-section {
        min-height: 100vh;
        padding-bottom: 80px;
      }

      .header-section {
        min-height: 300px;
        background-color: #f8fafc;
        background-image:
          linear-gradient(rgba(200, 220, 255, 0.08) 1px, transparent 1px),
          linear-gradient(90deg, rgba(200, 220, 255, 0.08) 1px, transparent 1px);
        background-size: 40px 40px;
        color: #1d2129;
        padding: 60px 0;
        text-align: center;

        h1 {
          font-size: 3rem;
          margin-bottom: 16px;
          font-weight: 700;
          color: #1d2129;
        }

        p {
          font-size: 1.25rem;
          color: #4e5969;
          max-width: 800px;
          margin: 0 auto;
        }

        @media (max-width: 768px) {
          min-height: 200px;
          padding: 40px 0;

          h1 {
            font-size: 2rem;
          }

          p {
            font-size: 1rem;
          }
        }
      }

      .features-categories {
        padding: 80px 0;
      }

      .category-intro {
        text-align: center;
        padding: 40px 24px;
        background: linear-gradient(
          135deg,
          rgba(102, 126, 234, 0.1) 0%,
          rgba(118, 75, 162, 0.1) 100%
        );
        border-radius: 12px;
        margin-bottom: 48px;

        mat-icon {
          font-size: 64px;
          width: 64px;
          height: 64px;
          color: #667eea;
          margin-bottom: 24px;
        }

        .tech-stack-info {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 12px 20px;
          background: linear-gradient(
            135deg,
            rgba(102, 126, 234, 0.1) 0%,
            rgba(118, 75, 162, 0.1) 100%
          );
          border-radius: 8px;
          color: #667eea;
          font-weight: 600;
          font-size: 0.9rem;
          margin-top: 16px;

          mat-icon {
            font-size: 20px;
            width: 20px;
            height: 20px;
            color: #667eea;
            margin-bottom: 0;
          }
        }

        h2 {
          font-size: 2.5rem;
          margin-bottom: 16px;
          color: #333;
        }

        p {
          font-size: 1.125rem;
          color: #666;
          max-width: 800px;
          margin: 0 auto;
        }
      }

      .features-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
        gap: 32px;
      }

      .feature-detail-card {
        padding: 32px;
        transition:
          transform 0.3s ease,
          box-shadow 0.3s ease;

        &:hover {
          transform: translateY(-8px);
          box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
        }

        mat-card-header {
          margin-bottom: 24px;

          mat-icon {
            color: #667eea;
          }

          mat-card-title {
            font-size: 1.5rem;
            color: #333;
          }

          mat-card-subtitle {
            color: #667eea;
            font-weight: 600;
          }
        }

        mat-card-content {
          p {
            color: #666;
            line-height: 1.8;
            margin-bottom: 24px;
          }
        }

        .feature-highlights {
          list-style: none;
          padding: 0;

          li {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 8px 0;
            color: #444;

            mat-icon {
              font-size: 20px;
              width: 20px;
              height: 20px;
              color: #4caf50;
            }
          }
        }
      }

      .features-tabs {
        ::ng-deep {
          .mat-mdc-tab-body-wrapper {
            margin-top: 32px;
          }

          .mat-mdc-tab-labels {
            justify-content: center;
          }
        }
      }

      .tech-specs-section {
        padding: 80px 0;
        background: #f8f9fa;
      }

      .tech-specs-section h2 {
        text-align: center;
        font-size: 2.5rem;
        margin-bottom: 64px;
        color: #333;
      }

      .specs-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 32px;
      }

      .spec-item {
        text-align: center;
        padding: 32px;
        background: white;
        border-radius: 12px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        transition:
          transform 0.3s ease,
          box-shadow 0.3s ease;

        &:hover {
          transform: translateY(-8px);
          box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
        }

        mat-icon {
          font-size: 64px;
          width: 64px;
          height: 64px;
          color: #667eea;
          margin-bottom: 24px;
        }

        h3 {
          font-size: 1.5rem;
          margin-bottom: 16px;
          color: #333;
        }

        p {
          color: #666;
          line-height: 1.6;
        }
      }

      .integration-section {
        padding: 80px 0;
      }

      .integration-section h2 {
        text-align: center;
        font-size: 2.5rem;
        margin-bottom: 64px;
        color: #333;
      }

      .integration-logos {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 32px;
      }

      .logo-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 32px;
        background: white;
        border-radius: 12px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        transition:
          transform 0.3s ease,
          box-shadow 0.3s ease;

        &:hover {
          transform: translateY(-8px);
          box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
        }

        mat-icon {
          font-size: 48px;
          width: 48px;
          height: 48px;
          color: #667eea;
          margin-bottom: 16px;
        }

        span {
          font-size: 1rem;
          color: #666;
          font-weight: 500;
        }
      }

      .container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 0 24px;
      }

      @media (max-width: 768px) {
        .header-section h1 {
          font-size: 2rem;
        }

        .features-grid,
        .specs-grid,
        .integration-logos {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
  imports: [CommonModule, MatCardModule, MatIconModule, MatTabsModule, MarketingLayoutComponent],
})
export class FeaturesSectionComponent implements OnInit {
  featureCategories = [
    {
      name: '数据分析',
      icon: 'analytics',
      title: '学习数据分析',
      description: '多维度采集学习行为数据，可视化呈现知识掌握情况，为教学决策提供数据支持',
      techStack: 'FastAPI + PostgreSQL + Pandas + ECharts',
      features: [
        {
          icon: 'assessment',
          title: '答题记录统计',
          subtitle: 'Data Collection',
          description: '实时记录学生答题情况，包括正确率、答题时间、尝试次数等多维度数据。',
          highlights: ['自动采集答题数据', '知识点关联分析', '错误类型分类', '历史数据对比'],
        },
        {
          icon: 'insights',
          title: '知识掌握可视化',
          subtitle: 'Knowledge Visualization',
          description: '通过热力图、雷达图等形式，直观展示各知识点的掌握程度。',
          highlights: ['知识点热力图', '能力雷达图', '成长曲线追踪', '薄弱点识别'],
        },
        {
          icon: 'trending_up',
          title: '学习进度追踪',
          subtitle: 'Progress Tracking',
          description: '记录学习轨迹，展示学习时长、完成进度和成长趋势。',
          highlights: ['学习时长统计', '课程进度展示', '成长趋势分析', '学习目标管理'],
        },
      ],
    },
    {
      name: '虚拟实验',
      icon: 'view_in_ar',
      title: '3D 虚拟实验室',
      description: '基于 Three.js 和 Vircadia 的 3D 交互式实验环境，支持电路组装等实践练习',
      techStack: 'Three.js r183 + Vircadia Web SDK + Ammo.js',
      features: [
        {
          icon: 'category',
          title: '3D 模型库',
          subtitle: 'Model Library',
          description: '256+ 精选电子元件 3D 模型，支持 LOD 多层次细节展示。',
          highlights: ['标准电子元件模型', 'LOD 轻量化优化', 'glTF 2.0 格式', '物理属性绑定'],
        },
        {
          icon: 'build',
          title: '电路组装练习',
          subtitle: 'Circuit Assembly',
          description: '拖放式交互，将元件放置到面包板并连接线路。',
          highlights: ['拖放 - 吸附交互', '2cm 精度检测', '连接关系验证', '组装步骤记录'],
        },
        {
          icon: 'lights_on',
          title: '电路仿真',
          subtitle: 'Circuit Simulation',
          description: '简化电路逻辑模拟，实现 LED 亮灭、开关控制等基础功能。',
          highlights: ['LED 亮灭效果', '开关控制', '串联并联检测', '短路提示'],
        },
      ],
    },
    {
      name: '区块链',
      icon: 'account_balance',
      title: '区块链积分存证',
      description: '基于 Hyperledger Fabric 的学习成果存证系统，保障积分记录公开透明',
      techStack: 'Hyperledger Fabric v2.5 + Go Chaincode + CouchDB',
      features: [
        {
          icon: 'paid',
          title: '积分发行与转移',
          subtitle: 'Point Management',
          description: '学习行为触发积分奖励，支持用户间积分转移。',
          highlights: ['完成任务奖励', '成就解锁奖励', '连击加成机制', '转账交易记录'],
        },
        {
          icon: 'receipt_long',
          title: '区块链存证',
          subtitle: 'On-Chain Storage',
          description: '积分交易记录上链存储，确保不可篡改和可追溯。',
          highlights: ['交易哈希生成', '区块高度记录', '时间戳认证', '分布式存储'],
        },
        {
          icon: 'search',
          title: '区块链浏览器',
          subtitle: 'Block Explorer',
          description: '查询积分交易记录，验证数字签名和交易详情。',
          highlights: ['交易记录查询', '账户余额查看', '签名验证', '区块信息展示'],
        },
      ],
    },
    {
      name: '教学辅助',
      icon: 'school',
      title: '智能化教学辅助',
      description: '基于学习数据分析，提供个性化资源推荐与学习路径规划 (开发中)',
      techStack: 'LangChain + Pandas (开发中)',
      status: 'under-development',
      features: [
        {
          icon: 'auto_awesome',
          title: '资源推荐 (规划中)',
          subtitle: 'Resource Recommendation',
          description: '根据学生薄弱环节，智能推荐练习题和学习资料。',
          highlights: ['错题针对性推荐', '难度自适应调整', '知识点关联推荐', '推荐效果追踪'],
          status: 'planned',
        },
        {
          icon: 'route',
          title: '路径规划 (规划中)',
          subtitle: 'Learning Path',
          description: '为每位学生生成个性化学习路线，优化学习效率。',
          highlights: ['起点能力评估', '目标设定建议', '最优路径生成', '动态调整优化'],
          status: 'planned',
        },
        {
          icon: 'help_center',
          title: '答疑辅助',
          subtitle: 'Q&A Assistant',
          description: '基于 AI 的常见问题自动解答，减轻教师负担。',
          highlights: ['常见问题库', '智能匹配答案', '上下文理解', '人工客服转接'],
        },
      ],
    },
  ];

  technicalSpecs = [
    {
      icon: 'cloud',
      title: '容器化部署',
      description: '基于 Docker 的容器化部署方案，支持 Docker Compose 一键启动，降低部署难度',
    },
    {
      icon: 'security',
      title: '安全保障',
      description: 'JWT 认证 + RBAC 权限管理 + 数据加密传输，遵循 OWASP Top 10 安全规范',
    },
    {
      icon: 'speed',
      title: '性能表现',
      description: 'FastAPI 异步框架 + PostgreSQL 优化查询 + Redis 缓存，平均响应时间 < 200ms',
    },
    {
      icon: 'api',
      title: '开放 API',
      description: 'RESTful API 接口 + Swagger/OpenAPI自动文档，支持第三方系统集成',
    },
    {
      icon: 'devices',
      title: '跨平台',
      description: 'Web 端 (Angular) + 移动端 (Flutter)，响应式设计适配各种设备',
    },
    {
      icon: 'language',
      title: '国际化支持',
      description: '多语言架构设计，支持中英文切换，符合 GDPR 等国际规范',
    },
  ];

  integrations = [
    { icon: 'code', name: 'REST API' },
    { icon: 'description', name: 'Swagger/OpenAPI' },
    { icon: 'data_usage', name: 'PostgreSQL' },
    { icon: 'storage', name: 'Redis' },
    { icon: 'cloud', name: 'Docker' },
    { icon: 'account_balance', name: 'Hyperledger Fabric' },
    { icon: 'view_in_ar', name: 'Three.js' },
    { icon: 'android', name: 'Flutter' },
  ];

  constructor() {}

  ngOnInit(): void {}

  trackByIndex = (index: number, _item: unknown): number => {
    return index;
  };
}
