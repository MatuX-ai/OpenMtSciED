/**
 * Mac 风格价格方案页面
 * Pricing page with pricing cards and FAQ
 */
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { MacNavbarComponent } from '../../shared/components/mac/mac-navbar.component';
import { MacFooterComponent } from '../../shared/components/mac/mac-footer.component';
import { MacCardComponent } from '../../shared/components/mac/mac-card.component';
import { MacButtonComponent } from '../../shared/components/mac/mac-button.component';

interface PricingPlan {
  name: string;
  price: number;
  period: string;
  description: string;
  features: string[];
  ctaText: string;
  ctaUrl: string;
  highlighted?: boolean;
}

interface FAQItem {
  question: string;
  answer: string;
}

@Component({
  selector: 'app-pricing-page-mac',
  standalone: true,
  imports: [
    CommonModule,
    MacNavbarComponent,
    MacFooterComponent,
    MacCardComponent,
    MacButtonComponent
  ],
  template: `
    <app-mac-navbar brandName="iMatu" [navItems]="navItems"></app-mac-navbar>
    
    <main class="pricing-main">
      <!-- Header Section -->
      <section class="pricing-header">
        <div class="container">
          <h1 class="header-title">简单透明的价格</h1>
          <p class="header-subtitle">
            选择适合您的方案，随时升级或降级
          </p>
        </div>
      </section>
      
      <!-- Pricing Cards -->
      <section class="pricing-cards">
        <div class="container">
          <div class="pricing-grid">
            <div *ngFor="let plan of plans" class="pricing-card-wrapper">
              <app-mac-card 
                [variant]="plan.highlighted ? 'elevated' : 'outlined'"
                class="pricing-card"
                [class.highlighted]="plan.highlighted">
                
                <div class="pricing-header">
                  <h3 class="plan-name">{{ plan.name }}</h3>
                  <p class="plan-description">{{ plan.description }}</p>
                </div>
                
                <div class="pricing-price">
                  <span class="currency">¥</span>
                  <span class="amount">{{ plan.price }}</span>
                  <span class="period">/{{ plan.period }}</span>
                </div>
                
                <ul class="plan-features">
                  <li *ngFor="let feature of plan.features">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#34C759" stroke-width="2">
                      <path d="M20 6L9 17l-5-5"/>
                    </svg>
                    <span>{{ feature }}</span>
                  </li>
                </ul>
                
                <div class="pricing-action">
                  <button 
                    appMacButton 
                    [variant]="plan.highlighted ? 'primary' : 'outline'"
                    size="lg"
                    style="width: 100%"
                    (click)="navigate(plan.ctaUrl)">
                    {{ plan.ctaText }}
                  </button>
                </div>
              </app-mac-card>
            </div>
          </div>
        </div>
      </section>
      
      <!-- Comparison Table -->
      <section class="comparison-section">
        <div class="container">
          <h2 class="section-title">功能对比</h2>
          <div class="comparison-table">
            <table>
              <thead>
                <tr>
                  <th>功能特性</th>
                  <th>基础版</th>
                  <th>专业版</th>
                  <th>企业版</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>用户数量</td>
                  <td>最多 10 人</td>
                  <td>最多 100 人</td>
                  <td>无限制</td>
                </tr>
                <tr>
                  <td>存储空间</td>
                  <td>10GB</td>
                  <td>100GB</td>
                  <td>1TB</td>
                </tr>
                <tr>
                  <td>数据分析</td>
                  <td>基础报表</td>
                  <td>高级分析</td>
                  <td>定制报告</td>
                </tr>
                <tr>
                  <td>技术支持</td>
                  <td>邮件支持</td>
                  <td>优先支持</td>
                  <td>专属客服</td>
                </tr>
                <tr>
                  <td>API 访问</td>
                  <td>❌</td>
                  <td>✅</td>
                  <td>✅</td>
                </tr>
                <tr>
                  <td>定制开发</td>
                  <td>❌</td>
                  <td>可选</td>
                  <td>✅</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>
      
      <!-- FAQ Section -->
      <section class="faq-section">
        <div class="container">
          <h2 class="section-title">常见问题</h2>
          <div class="faq-grid">
            <div *ngFor="let faq of faqs" class="faq-item">
              <h3 class="faq-question">{{ faq.question }}</h3>
              <p class="faq-answer">{{ faq.answer }}</p>
            </div>
          </div>
        </div>
      </section>
      
      <!-- CTA Section -->
      <section class="cta-section">
        <div class="container">
          <div class="cta-content">
            <h2 class="cta-title">准备好开始了吗？</h2>
            <p class="cta-description">
              立即注册，享受 14 天免费试用
            </p>
            <div class="cta-actions">
              <button appMacButton variant="primary" size="lg" (click)="navigate('/signup')">
                免费注册
              </button>
              <button appMacButton variant="secondary" size="lg" (click)="navigate('/contact')">
                联系销售
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
    
    <app-mac-footer></app-mac-footer>
  `,
  styles: [`
    .pricing-main {
      padding-top: 52px;
    }
    
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 24px;
    }
    
    /* Header Section */
    .pricing-header {
      padding: 96px 0 64px;
      text-align: center;
      
      .header-title {
        font-size: 48px;
        font-weight: 700;
        margin-bottom: 16px;
        color: #1D1D1F;
      }
      
      .header-subtitle {
        font-size: 18px;
        color: #6E6E73;
      }
    }
    
    /* Pricing Cards */
    .pricing-cards {
      padding: 64px 0;
    }
    
    .pricing-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
      gap: 32px;
    }
    
    .pricing-card-wrapper {
      height: 100%;
    }
    
    .pricing-card {
      padding: 40px;
      height: 100%;
      display: flex;
      flex-direction: column;
      
      &.highlighted {
        border-color: #007AFF;
        box-shadow: 0 8px 24px rgba(0, 122, 255, 0.15);
      }
      
      .pricing-header {
        margin-bottom: 24px;
        
        .plan-name {
          font-size: 24px;
          font-weight: 600;
          margin-bottom: 8px;
          color: #1D1D1F;
        }
        
        .plan-description {
          font-size: 14px;
          color: #6E6E73;
        }
      }
      
      .pricing-price {
        margin-bottom: 32px;
        display: flex;
        align-items: baseline;
        
        .currency {
          font-size: 24px;
          color: #1D1D1F;
        }
        
        .amount {
          font-size: 56px;
          font-weight: 700;
          color: #007AFF;
        }
        
        .period {
          font-size: 16px;
          color: #6E6E73;
          margin-left: 4px;
        }
      }
      
      .plan-features {
        list-style: none;
        padding: 0;
        margin: 0 0 32px 0;
        flex-grow: 1;
        
        li {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 0;
          font-size: 15px;
          color: #1D1D1F;
          
          svg {
            flex-shrink: 0;
          }
        }
      }
    }
    
    /* Comparison Section */
    .comparison-section {
      padding: 96px 0;
      background: #F5F5F7;
    }
    
    .section-title {
      text-align: center;
      font-size: 36px;
      font-weight: 600;
      margin-bottom: 48px;
      color: #1D1D1F;
    }
    
    .comparison-table {
      overflow-x: auto;
      
      table {
        width: 100%;
        border-collapse: collapse;
        background: white;
        border-radius: 14px;
        overflow: hidden;
        
        th, td {
          padding: 20px;
          text-align: left;
          border-bottom: 1px solid #E5E5EA;
        }
        
        th {
          background: #FAFAFA;
          font-weight: 600;
          font-size: 14px;
          color: #1D1D1F;
        }
        
        td {
          font-size: 15px;
          color: #6E6E73;
          
          &:first-child {
            font-weight: 500;
            color: #1D1D1F;
          }
        }
        
        tr:last-child td {
          border-bottom: none;
        }
      }
    }
    
    /* FAQ Section */
    .faq-section {
      padding: 96px 0;
    }
    
    .faq-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
      gap: 32px;
      
      .faq-item {
        .faq-question {
          font-size: 18px;
          font-weight: 600;
          margin-bottom: 12px;
          color: #1D1D1F;
        }
        
        .faq-answer {
          font-size: 15px;
          color: #6E6E73;
          line-height: 1.6;
        }
      }
    }
    
    /* CTA Section */
    .cta-section {
      padding: 96px 0;
    }
    
    .cta-content {
      text-align: center;
      max-width: 600px;
      margin: 0 auto;
      
      .cta-title {
        font-size: 36px;
        font-weight: 600;
        margin-bottom: 16px;
        color: #1D1D1F;
      }
      
      .cta-description {
        font-size: 18px;
        color: #6E6E73;
        margin-bottom: 32px;
      }
      
      .cta-actions {
        display: flex;
        gap: 16px;
        justify-content: center;
      }
    }
    
    @media (max-width: 768px) {
      .pricing-header {
        padding: 64px 0 48px;
      }
      
      .pricing-grid,
      .faq-grid {
        grid-template-columns: 1fr;
      }
      
      .cta-actions {
        flex-direction: column;
        align-items: stretch;
      }
    }
  `]
})
export class PricingPageMacComponent {
  navItems = [
    { label: '功能特性', url: '/features' },
    { label: '关于我们', url: '/about' },
    { label: '联系我们', url: '/contact' },
  ];
  
  plans: PricingPlan[] = [
    {
      name: '基础版',
      price: 0,
      period: '月',
      description: '适合个人和小型团队',
      features: [
        '最多 10 个用户',
        '10GB 存储空间',
        '基础报表功能',
        '邮件技术支持',
        '移动端访问'
      ],
      ctaText: '免费开始',
      ctaUrl: '/signup?plan=basic'
    },
    {
      name: '专业版',
      price: 299,
      period: '月',
      description: '适合成长型企业',
      features: [
        '最多 100 个用户',
        '100GB 存储空间',
        '高级数据分析',
        '优先技术支持',
        'API 访问权限',
        '定制报表',
        '集成第三方服务'
      ],
      ctaText: '立即试用',
      ctaUrl: '/signup?plan=pro',
      highlighted: true
    },
    {
      name: '企业版',
      price: 999,
      period: '月',
      description: '适合大型组织',
      features: [
        '无限用户数量',
        '1TB 存储空间',
        '定制分析报告',
        '专属客户经理',
        '完整 API 访问',
        '定制开发服务',
        'SLA 服务保障',
        '现场培训支持'
      ],
      ctaText: '联系销售',
      ctaUrl: '/contact-sales'
    }
  ];
  
  faqs: FAQItem[] = [
    {
      question: '可以随时升级或降级吗？',
      answer: '当然可以！您可以随时在账户设置中调整您的套餐，变更将在下个计费周期生效。'
    },
    {
      question: '支持哪些支付方式？',
      answer: '我们支持支付宝、微信支付、银行转账等多种支付方式。企业用户还可以选择对公转账。'
    },
    {
      question: '有免费试用期吗？',
      answer: '是的，所有新用户都可以享受 14 天免费试用，无需绑定信用卡。'
    },
    {
      question: '数据安全如何保障？',
      answer: '我们采用银行级加密技术，数据多重备份，并通过 ISO 27001 安全认证。'
    },
    {
      question: '提供发票吗？',
      answer: '是的，我们可以提供增值税专用发票或普通发票，具体可在购买时选择。'
    }
  ];
  
  constructor(private router: Router) {}
  
  navigate(url: string): void {
    this.router.navigateByUrl(url);
  }
}
