import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar } from '@angular/material/snack-bar';

import { MarketingLayoutComponent } from '../shared/marketing-layout/marketing-layout.component';

interface PricingPlan {
  name: string;
  price: number;
  period: string;
  description: string;
  features: string[];
  isPopular: boolean;
  icon: string;
  licenseType: 'open_source' | 'windows_local' | 'cloud_hosted';
  tokenBonus?: number; // 赠送的 Token 数量
}

@Component({
  selector: 'app-pricing-page',
  template: `
    <app-marketing-layout>
      <div class="pricing-page">
        <!-- Header -->
        <div class="header-section">
          <h1>部署方案</h1>
          <p>灵活多样的部署方式，满足不同场景需求</p>
        </div>

        <!-- Pricing Cards -->
        <section class="pricing-section">
          <div class="container">
            <div class="pricing-grid">
              <mat-card
                class="pricing-card"
                *ngFor="let plan of plans; trackBy: trackByIndex"
                [class.popular]="plan.isPopular"
              >
                <div class="popular-badge" *ngIf="plan.isPopular">
                  <i class="ri-star-fill"></i>
                  最受欢迎
                </div>

                <mat-card-header>
                  <i class="ri-{{ plan.icon }} feature-icon" mat-card-avatar></i>
                  <mat-card-title>{{ plan.name }}</mat-card-title>
                  <mat-card-subtitle>{{ plan.description }}</mat-card-subtitle>
                </mat-card-header>

                <mat-card-content>
                  <div class="price" *ngIf="plan.price > 0">
                    <span class="currency">¥</span>
                    <span class="amount">{{ plan.price }}</span>
                    <span class="period">/{{ plan.period }}</span>
                  </div>
                  <div class="free-badge" *ngIf="plan.price === 0">
                    <i class="ri-gift-fill"></i>
                    <span>完全免费</span>
                  </div>

                  <!-- Token 赠送信息 -->
                  <div class="token-bonus" *ngIf="plan.tokenBonus">
                    <mat-icon>account_balance_wallet</mat-icon>
                    <div class="token-info">
                      <span class="token-amount">+{{ plan.tokenBonus }}</span>
                      <span class="token-label">Token 赠送</span>
                    </div>
                  </div>

                  <ul class="features-list">
                    <li *ngFor="let feature of plan.features; trackBy: trackByIndex">
                      <i class="ri-check-line check-icon"></i>
                      {{ feature }}
                    </li>
                  </ul>

                  <button
                    mat-raised-button
                    color="primary"
                    class="cta-button"
                    (click)="selectPlan(plan)"
                  >
                    {{ getButtonText(plan) }}
                  </button>
                </mat-card-content>
              </mat-card>
            </div>
          </div>
        </section>

        <!-- FAQ Section -->
        <section class="faq-section">
          <div class="container">
            <h2>常见问题</h2>
            <mat-accordion>
              <mat-expansion-panel *ngFor="let faq of faqs; trackBy: trackByIndex">
                <mat-expansion-panel-header>
                  <mat-panel-title>
                    {{ faq.question }}
                  </mat-panel-title>
                </mat-expansion-panel-header>
                <p>{{ faq.answer }}</p>
              </mat-expansion-panel>
            </mat-accordion>
          </div>
        </section>

        <!-- Notice Section -->
        <section class="notice-section">
          <div class="container">
            <div class="notice-box">
              <i class="ri-information-line notice-icon"></i>
              <div class="notice-content">
                <h3>重要说明</h3>
                <ul>
                  <li>iMato 是开源教育技术项目，采用 GPL-3.0 开源协议</li>
                  <li>自主部署版本完全免费，可永久使用所有功能</li>
                  <li>云托管服务仅收取服务器成本，非盈利性质</li>
                  <li>如需定制化开发或企业支持，请通过 GitHub 联系我们</li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      </div>
    </app-marketing-layout>
  `,
  styles: [
    `
      .pricing-page {
        min-height: 100vh;
        padding-bottom: 80px;
      }

      .header-section {
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

      .header-section h1 {
        font-size: 3rem;
        margin-bottom: 16px;
      }

      .header-section p {
        font-size: 1.25rem;
        opacity: 0.9;
      }

      .pricing-section {
        padding: 80px 0;
        background: #f8f9fa;
      }

      .pricing-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
        gap: 32px;
      }

      .pricing-card {
        position: relative;
        padding: 32px;
        display: flex;
        flex-direction: column;
        height: 100%; // 确保卡片高度一致
        border: 1px solid #e0e0e0; // 统一所有卡片的边框
        border-radius: 12px;
        transition:
          transform 0.3s ease,
          box-shadow 0.3s ease;

        &:hover {
          transform: translateY(-8px);
          box-shadow: 0 16px 32px rgba(0, 0, 0, 0.15);
        }

        &.popular {
          // 移除特殊边框，保持与其他卡片一致
          transform: none; // 移除放大效果，保持对齐

          &:hover {
            transform: translateY(-8px); // hover 时与其他卡片一致的动画
          }
        }
      }

      // 卡片头部区域 - 固定高度
      mat-card-header {
        margin-bottom: 24px !important;
        flex-shrink: 0;
      }

      // 卡片内容区域 - 使用 flex 布局
      mat-card-content {
        display: flex;
        flex-direction: column;
        flex: 1;
        padding: 0 !important; // 移除默认 padding，由子元素控制
      }

      .popular-badge {
        position: absolute;
        top: 16px;
        right: 16px;
        background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
        color: white;
        padding: 8px 16px;
        border-radius: 20px;
        font-size: 0.875rem;
        font-weight: 600;
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .price {
        text-align: center;
        padding: 24px 0;
        margin: 16px 0;
        border-top: 1px solid #e0e0e0;
        border-bottom: 1px solid #e0e0e0;
        flex-shrink: 0; // 防止价格区域被压缩
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 80px; // 固定价格区域高度
      }

      .free-badge {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 12px;
        padding: 24px 0;
        margin: 16px 0;
        background: linear-gradient(135deg, #4caf50 0%, #8bc34a 100%);
        color: white;
        border-radius: 12px;
        font-size: 1.5rem;
        font-weight: 700;
        flex-shrink: 0; // 防止免费标识区域被压缩
        min-height: 56px; // 与价格区域高度一致

        mat-icon {
          font-size: 32px;
          width: 32px;
          height: 32px;
        }

        i {
          font-size: 32px;
          width: 32px;
          height: 32px;
        }
      }

      // Token 赠送区域
      .token-bonus {
        display: flex;
        align-items: center;
        gap: 16px;
        padding: 16px;
        margin: 16px 0;
        background: linear-gradient(
          135deg,
          rgba(102, 126, 234, 0.1) 0%,
          rgba(118, 75, 162, 0.1) 100%
        );
        border-radius: 12px;
        border: 2px solid #667eea;
        flex-shrink: 0;

        mat-icon {
          font-size: 32px;
          width: 32px;
          height: 32px;
          color: #667eea;
        }

        .token-info {
          display: flex;
          flex-direction: column;

          .token-amount {
            font-size: 1.5rem;
            font-weight: 700;
            color: #667eea;
          }

          .token-label {
            font-size: 0.875rem;
            color: #666;
          }
        }
      }

      .currency {
        font-size: 1.5rem;
        vertical-align: top;
        color: #666;
      }

      .amount {
        font-size: 4rem;
        font-weight: 700;
        color: #333;
      }

      .period {
        font-size: 1rem;
        color: #666;
      }

      .features-list {
        list-style: none;
        padding: 0;
        margin: 0;
        flex: 1; // 填充剩余空间，确保按钮在底部
        display: flex;
        flex-direction: column;
        justify-content: flex-start;

        li {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 0; // 减小列表项间距
          color: #444;

          mat-icon {
            color: #4caf50;
          }

          .check-icon {
            font-size: 20px;
            width: 20px;
            height: 20px;
            color: #4caf50;
            flex-shrink: 0;
          }
        }
      }

      .cta-button {
        width: 100%;
        padding: 16px;
        font-size: 1.125rem;
        margin-top: auto; // 自动推到底部，确保按钮对齐
      }

      .faq-section {
        padding: 80px 0;
      }

      .faq-section h2 {
        text-align: center;
        font-size: 2.5rem;
        margin-bottom: 48px;
        color: #333;
      }

      mat-accordion {
        max-width: 800px;
        margin: 0 auto;
      }

      mat-expansion-panel {
        margin-bottom: 16px;

        p {
          padding: 16px;
          line-height: 1.8;
          color: #666;
        }
      }

      .notice-section {
        padding: 80px 0;
        background: #f8f9fa;
      }

      .notice-box {
        max-width: 800px;
        margin: 0 auto;
        padding: 40px;
        background: white;
        border-radius: 12px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        display: flex;
        gap: 24px;
        align-items: flex-start;

        mat-icon {
          font-size: 48px;
          width: 48px;
          height: 48px;
          color: #2196f3;
          flex-shrink: 0;
        }

        .notice-icon {
          font-size: 48px;
          width: 48px;
          height: 48px;
          color: #2196f3;
          flex-shrink: 0;
        }

        .notice-content {
          flex: 1;

          h3 {
            font-size: 1.5rem;
            margin-bottom: 16px;
            color: #333;
          }

          ul {
            list-style: none;
            padding: 0;
            margin: 0;

            li {
              position: relative;
              padding-left: 24px;
              margin-bottom: 12px;
              line-height: 1.8;
              color: #666;

              &::before {
                content: '✓';
                position: absolute;
                left: 0;
                color: #4caf50;
                font-weight: bold;
              }
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
        .pricing-grid {
          grid-template-columns: 1fr;
        }

        .pricing-card.popular {
          transform: none;
        }

        .header-section h1 {
          font-size: 2rem;
        }

        .amount {
          font-size: 3rem;
        }
      }
    `,
  ],

  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatExpansionModule,
    MarketingLayoutComponent,
  ],
})
export class PricingPageComponent implements OnInit {
  plans: PricingPlan[] = [
    {
      name: '开源社区版',
      price: 0,
      period: '',
      description: '适合开发者、教育者和技术爱好者',
      features: [
        '完整源代码访问',
        '全部基础功能模块',
        'GitHub 社区支持',
        '自行部署和维护',
        '可自由定制和扩展',
        '遵循 GPL-3.0 协议',
        'AI 功能按量计费',
      ],
      licenseType: 'open_source',
      tokenBonus: 100, // 注册即送 100 Token
      isPopular: true,
      icon: 'ri-code-s-slash-line',
    },
    {
      name: 'Windows 本地版',
      price: 299,
      period: '年',
      description: '一键安装，离线使用，适合个人和学生',
      features: [
        'Windows 安装包一键安装',
        '离线运行无需网络',
        '自动更新和维护',
        '本地数据完全掌控',
        '包含 1000 Token/年',
        '邮件技术支持',
        '可使用所有 AI 功能',
      ],
      licenseType: 'windows_local',
      tokenBonus: 1000,
      isPopular: false,
      icon: 'ri-computer-line',
    },
    {
      name: '云托管版',
      price: 199,
      period: '月',
      description: '开箱即用，自动运维，适合企业和学校',
      features: [
        '免部署，注册即用',
        '自动备份与恢复',
        '系统维护与升级',
        '专业技术支持响应',
        'SSL 证书与安全加固',
        '高级数据统计分析',
        '每月赠送 1000 Token',
        '多用户协作管理',
      ],
      licenseType: 'cloud_hosted',
      tokenBonus: 1000, // 每月赠送
      isPopular: false,
      icon: 'ri-cloud-line',
    },
  ];

  faqs = [
    {
      question: '自主部署需要什么技术条件？',
      answer:
        '您需要具备基础的 Linux 服务器操作知识和 Docker 使用经验。我们提供详细的部署文档和 Docker Compose 配置文件，通常 1-2 小时即可完成部署。',
    },
    {
      question: '云托管服务什么时候上线？',
      answer:
        '云托管服务目前正在开发中，预计 2026 年 Q2 上线。您可以通过 GitHub 关注最新进展，或订阅我们的邮件通知。',
    },
    {
      question: '机构定制版包含哪些服务？',
      answer:
        '机构定制版提供品牌定制、功能定制、本地部署支持、技术培训等全方位服务。具体方案需要根据您的需求进行评估，请通过 GitHub Issues 或邮件联系我们详谈。',
    },
    {
      question: '数据安全如何保障？',
      answer:
        '自主部署版本的数据完全由您自己控制。云托管版本采用银行级别的加密技术，定期备份，并提供数据导出功能。',
    },
    {
      question: '可以后续升级或变更部署方式吗？',
      answer:
        '当然可以！您可以随时从自主部署迁移到云托管，也可以根据需要进行定制开发。我们提供数据迁移工具和迁移指南。',
    },
  ];

  constructor(private snackBar: MatSnackBar) {}

  ngOnInit(): void {}

  selectPlan(plan: PricingPlan): void {
    if (plan.price === 0 && plan.name.includes('开源')) {
      window.open('https://github.com/imatuproject/imato', '_blank');
    } else {
      this.snackBar.open(`您选择了${plan.name}，请访问 GitHub 了解更多详情`, '关闭', {
        duration: 5000,
      });
    }
  }

  getButtonText(plan: PricingPlan): string {
    if (plan.price === 0) {
      return '开始使用';
    } else if (plan.licenseType === 'windows_local') {
      return '购买 Windows 版';
    } else if (plan.licenseType === 'cloud_hosted') {
      return '订阅云托管';
    }
    return '了解详情';
  }

  trackByIndex = (index: number, _item: unknown): number => {
    return index;
  };
}
