import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { MarketingLayoutComponent } from '../shared/marketing-layout/marketing-layout.component';

@Component({
  selector: 'app-product-showcase',
  template: `
    <app-marketing-layout>
      <div class="product-showcase">
        <!-- Header -->
        <div class="hero-section">
          <div class="container">
            <h1>核心功能</h1>
            <p>基于真实技术栈构建的教育平台能力展示</p>
          </div>
        </div>

        <!-- Product Sections -->
        <section
          class="product-section"
          *ngFor="let product of products; let i = index; trackBy: trackByIndex"
        >
          <div class="container">
            <div class="product-content" [class.reverse]="i % 2 === 1">
              <div class="product-image">
                <img [src]="product.image" [alt]="product.title" class="product-img" />
              </div>
              <div class="product-info">
                <h2>
                  {{ product.title }}
                  <span class="development-status" *ngIf="product.status === 'under-development'"
                    >开发中</span
                  >
                </h2>
                <p class="description">{{ product.description }}</p>
                <div class="tech-stack-badge" *ngIf="product.techStack">
                  <i
                    class="ri-code-s-slash-line"
                    style="font-size: 16px; width: 16px; height: 16px; vertical-align: middle; margin-right: 4px;"
                  ></i>
                  {{ product.techStack }}
                </div>
                <ul class="feature-list">
                  <li *ngFor="let feature of product.features; trackBy: trackByIndex">
                    <i class="ri-check-line check-icon"></i>
                    {{ feature }}
                  </li>
                </ul>
                <button mat-raised-button color="primary" (click)="viewDetails(product)">
                  了解详情
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </app-marketing-layout>
  `,
  styles: [
    `
      .product-showcase {
        min-height: 100vh;
        padding-bottom: 80px;
      }

      // Hero Section - 浅色网格背景风格（与主页一致）
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
        position: relative;
        overflow: hidden;
        display: flex;
        align-items: center;
        justify-content: center;

        h1 {
          font-size: 3rem;
          margin-bottom: 16px;
          font-weight: 700;
          letter-spacing: -0.5px;
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

      .product-section {
        padding: 80px 0;
      }

      // 偶数区块使用浅灰背景（交替效果）
      .product-section:nth-child(even) {
        background: #f7f8fa;
      }

      .product-content {
        display: flex;
        align-items: center;
        gap: 64px;

        &.reverse {
          flex-direction: row-reverse;
        }
      }

      .product-image {
        flex: 1;
        display: flex;
        justify-content: center;
        align-items: center;

        .product-img {
          width: 100%;
          max-width: 500px;
          height: auto;
          aspect-ratio: 3/2;
          object-fit: cover;
          border-radius: 12px;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
          transition: transform 0.3s ease;

          &:hover {
            transform: scale(1.02);
          }
        }
      }

      .product-info {
        flex: 1;

        h2 {
          font-size: 2.5rem;
          margin-bottom: 24px;
          color: #1d2129;
          font-weight: 600;
        }

        .description {
          font-size: 1.125rem;
          line-height: 1.8;
          color: #4e5969;
          margin-bottom: 32px;
        }

        .tech-stack-badge {
          display: inline-block;
          padding: 8px 16px;
          background: linear-gradient(
            135deg,
            rgba(54, 207, 201, 0.1) 0%,
            rgba(35, 184, 179, 0.1) 100%
          );
          border: 1px solid rgba(54, 207, 201, 0.3);
          border-radius: 8px;
          font-size: 0.875rem;
          color: #36cfc9;
          font-weight: 600;
          margin-bottom: 16px;
        }

        .development-status {
          display: inline-block;
          padding: 6px 12px;
          background: #fff3cd;
          border: 1px solid #ffc107;
          border-radius: 6px;
          font-size: 0.8rem;
          color: #856404;
          font-weight: 600;
          margin-left: 8px;
        }

        .feature-list {
          list-style: none;
          padding: 0;
          margin-bottom: 32px;

          li {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 16px;
            font-size: 1rem;
            color: #4e5969;

            .check-icon {
              font-size: 20px;
              width: 20px;
              height: 20px;
              color: #4caf50;
              flex-shrink: 0;
            }
          }
        }
      }

      .container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 0 24px;
      }

      @media (max-width: 768px) {
        .hero-section h1 {
          font-size: 2.5rem;
        }

        .product-content {
          flex-direction: column !important;
          gap: 32px;
        }

        .product-info h2 {
          font-size: 1.75rem;
        }
      }
    `,
  ],
  imports: [CommonModule, MatButtonModule, MatIconModule, MarketingLayoutComponent],
})
export class ProductShowcaseComponent implements OnInit {
  products = [
    {
      icon: 'ri-line-chart-line',
      title: '学习数据分析',
      description:
        '多维度采集学习行为数据，通过可视化图表呈现知识掌握情况，为教学决策提供数据支持。',
      features: ['答题记录统计与分析', '学习时长追踪', '知识点正确率热力图', '个人成长曲线展示'],
      techStack: 'FastAPI + PostgreSQL + ECharts',
      image: 'https://pic.rmb.bdstatic.com/f478680eac6c04bf808c05b1f5a1b8ab.jpeg',
    },
    {
      icon: 'ri-cube-line',
      title: '3D 虚拟实验室',
      description:
        '基于 Three.js 和 Vircadia 的 3D 交互式实验环境，支持电路组装等实践练习，安全且可重复操作。',
      features: [
        '256+ 精选 3D 电子元件模型',
        '基础电路组装与连接练习',
        '简化电路逻辑仿真 (LED 亮灭)',
        '学习进度自动保存',
      ],
      techStack: 'Three.js r183 + Vircadia SDK + Ammo.js',
      image:
        'https://img1.baidu.com/it/u=1721363415,1196852948&fm=253&fmt=auto&app=138&f=JPEG?w=600&h=400',
    },
    {
      icon: 'ri-wallet-3-fill',
      title: '区块链积分存证',
      description: '基于 Hyperledger Fabric 的学习成果存证系统，保障积分记录公开透明、不可篡改。',
      features: ['学习积分发行与转移', '积分交易记录上链', '区块链浏览器查询', '数字签名验证'],
      techStack: 'Hyperledger Fabric v2.5 + Go Chaincode',
      image: 'https://p7.itc.cn/images01/20230606/8b86266d2df349b993d0d171a66432d3.jpeg',
    },
    {
      icon: 'ri-school-line',
      title: '智能化教学辅助',
      description: '基于学习数据分析，提供个性化资源推荐与学习路径规划，帮助教师精准教学。',
      features: [
        '个性化资源推荐 (开发中)',
        '学习路径规划 (开发中)',
        '薄弱环节识别',
        '教学建议生成',
      ],
      techStack: 'LangChain + Pandas (开发中)',
      status: 'under-development',
      image:
        'https://img2.baidu.com/it/u=1264672195,3523013863&fm=253&fmt=auto&app=138&f=JPEG?w=600&h=400',
    },
  ];

  constructor() {}

  ngOnInit(): void {}

  trackByIndex = (index: number, _item: unknown): number => {
    return index;
  };

  viewDetails = (_product: { title: string }): void => {
    // TODO: 实现详情查看功能
  };
}
