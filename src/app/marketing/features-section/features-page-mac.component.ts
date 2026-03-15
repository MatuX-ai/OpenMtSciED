/**
 * Mac 风格功能特性页面
 * Features showcase page with detailed feature grid
 */
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { MacNavbarComponent } from '../../shared/components/mac/mac-navbar.component';
import { MacFooterComponent } from '../../shared/components/mac/mac-footer.component';
import { MacCardComponent } from '../../shared/components/mac/mac-card.component';
import { MacButtonComponent } from '../../shared/components/mac/mac-button.component';

interface Feature {
  icon: string;
  title: string;
  description: string;
  details: string[];
}

@Component({
  selector: 'app-features-page-mac',
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
    
    <main class="features-main">
      <!-- Header Section -->
      <section class="features-header">
        <div class="container">
          <h1 class="header-title">强大功能，简约设计</h1>
          <p class="header-subtitle">
            为现代教育而生的完整功能体系
          </p>
        </div>
      </section>
      
      <!-- Features Grid -->
      <section class="features-grid-section">
        <div class="container">
          <div class="features-grid">
            <div *ngFor="let feature of features" class="feature-item">
              <app-mac-card variant="outlined">
                <div class="feature-icon">{{ feature.icon }}</div>
                <h3 class="feature-title">{{ feature.title }}</h3>
                <p class="feature-description">{{ feature.description }}</p>
                <ul class="feature-details">
                  <li *ngFor="let detail of feature.details">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#007AFF" stroke-width="2">
                      <path d="M20 6L9 17l-5-5"/>
                    </svg>
                    <span>{{ detail }}</span>
                  </li>
                </ul>
              </app-mac-card>
            </div>
          </div>
        </div>
      </section>
      
      <!-- Detailed Feature Showcase -->
      <section class="showcase-section">
        <div class="container">
          <div class="showcase-item">
            <div class="showcase-content">
              <h2 class="showcase-title">个性化学习路径</h2>
              <p class="showcase-description">
                AI 驱动的自适应学习系统，根据每个学生的学习进度、理解能力和兴趣偏好，
                智能生成专属学习路径，让学习更高效。
              </p>
              <ul class="showcase-list">
                <li>智能评估学生当前水平</li>
                <li>动态调整学习内容和难度</li>
                <li>实时追踪学习进度</li>
                <li>预测学习效果并优化路径</li>
              </ul>
            </div>
            <div class="showcase-visual">
              <div class="placeholder-box">
                <span>🎯</span>
                <p>个性化学习路径演示</p>
              </div>
            </div>
          </div>
          
          <div class="showcase-item reverse">
            <div class="showcase-content">
              <h2 class="showcase-title">深度数据分析</h2>
              <p class="showcase-description">
                全方位的学习数据分析看板，帮助教师和管理者深入了解教学效果，
                基于数据做出科学决策。
              </p>
              <ul class="showcase-list">
                <li>实时学习数据可视化</li>
                <li>多维度成绩分析报表</li>
                <li>学习行为趋势分析</li>
                <li>预测性预警系统</li>
              </ul>
            </div>
            <div class="showcase-visual">
              <div class="placeholder-box">
                <span>📊</span>
                <p>数据分析看板演示</p>
              </div>
            </div>
          </div>
          
          <div class="showcase-item">
            <div class="showcase-content">
              <h2 class="showcase-title">无缝协作互动</h2>
              <p class="showcase-description">
                强大的在线协作工具，打破时空限制，让师生互动、生生互动更加便捷高效。
              </p>
              <ul class="showcase-list">
                <li>实时在线讨论区</li>
                <li>小组项目协作空间</li>
                <li>作业互评与反馈</li>
                <li>视频会议集成</li>
              </ul>
            </div>
            <div class="showcase-visual">
              <div class="placeholder-box">
                <span>🤝</span>
                <p>协作互动演示</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <!-- Benefits Section -->
      <section class="benefits-section">
        <div class="container">
          <h2 class="section-title">为什么选择 iMatu？</h2>
          <div class="benefits-grid">
            <div class="benefit-item">
              <div class="benefit-number">10x</div>
              <h3 class="benefit-title">学习效率提升</h3>
              <p class="benefit-description">
                通过个性化学习和智能推荐，学生学习效率平均提升 10 倍
              </p>
            </div>
            <div class="benefit-item">
              <div class="benefit-number">90%</div>
              <h3 class="benefit-title">时间节省</h3>
              <p class="benefit-description">
                自动化作业批改和数据分析，为教师节省 90% 的重复工作时间
              </p>
            </div>
            <div class="benefit-item">
              <div class="benefit-number">99.9%</div>
              <h3 class="benefit-title">系统可用性</h3>
              <p class="benefit-description">
                企业级架构设计，保证 99.9% 的服务可用性
              </p>
            </div>
            <div class="benefit-item">
              <div class="benefit-number">24/7</div>
              <h3 class="benefit-title">全天候支持</h3>
              <p class="benefit-description">
                专业技术团队 24/7 在线，随时解决您的问题
              </p>
            </div>
          </div>
        </div>
      </section>
      
      <!-- CTA Section -->
      <section class="cta-section">
        <div class="container">
          <div class="cta-content">
            <h2 class="cta-title">想亲身体验吗？</h2>
            <p class="cta-description">
              立即开始 14 天免费试用，体验未来教育的魅力
            </p>
            <div class="cta-actions">
              <button appMacButton variant="primary" size="lg" (click)="navigate('/signup')">
                免费注册
              </button>
              <button appMacButton variant="outline" size="lg" (click)="navigate('/demo')">
                预约演示
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
    
    <app-mac-footer></app-mac-footer>
  `,
  styles: [`
    .features-main {
      padding-top: 52px;
    }
    
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 24px;
    }
    
    /* Header Section */
    .features-header {
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
    
    /* Features Grid */
    .features-grid-section {
      padding: 64px 0;
    }
    
    .features-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
      gap: 32px;
      
      .feature-item {
        padding: 32px;
        
        .feature-icon {
          font-size: 48px;
          margin-bottom: 16px;
        }
        
        .feature-title {
          font-size: 22px;
          font-weight: 600;
          margin-bottom: 12px;
          color: #1D1D1F;
        }
        
        .feature-description {
          font-size: 15px;
          color: #6E6E73;
          line-height: 1.6;
          margin-bottom: 20px;
        }
        
        .feature-details {
          list-style: none;
          padding: 0;
          margin: 0;
          
          li {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 8px 0;
            font-size: 14px;
            color: #1D1D1F;
            
            svg {
              flex-shrink: 0;
            }
          }
        }
      }
    }
    
    /* Showcase Section */
    .showcase-section {
      padding: 96px 0;
      background: #F5F5F7;
      
      .showcase-item {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 64px;
        align-items: center;
        margin-bottom: 96px;
        
        &:last-child {
          margin-bottom: 0;
        }
        
        &.reverse {
          direction: rtl;
          
          > * {
            direction: ltr;
          }
        }
        
        .showcase-content {
          .showcase-title {
            font-size: 32px;
            font-weight: 600;
            margin-bottom: 16px;
            color: #1D1D1F;
          }
          
          .showcase-description {
            font-size: 16px;
            color: #6E6E73;
            line-height: 1.6;
            margin-bottom: 24px;
          }
          
          .showcase-list {
            list-style: none;
            padding: 0;
            margin: 0;
            
            li {
              display: flex;
              align-items: center;
              gap: 12px;
              padding: 12px 0;
              font-size: 15px;
              color: #1D1D1F;
              
              &:before {
                content: '✓';
                color: #34C759;
                font-weight: bold;
              }
            }
          }
        }
        
        .showcase-visual {
          .placeholder-box {
            background: white;
            border-radius: 14px;
            padding: 48px;
            text-align: center;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
            
            span {
              font-size: 64px;
              display: block;
              margin-bottom: 16px;
            }
            
            p {
              font-size: 14px;
              color: #86868B;
            }
          }
        }
      }
    }
    
    /* Benefits Section */
    .benefits-section {
      padding: 96px 0;
    }
    
    .section-title {
      text-align: center;
      font-size: 36px;
      font-weight: 600;
      margin-bottom: 64px;
      color: #1D1D1F;
    }
    
    .benefits-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 48px;
      
      .benefit-item {
        text-align: center;
        
        .benefit-number {
          font-size: 56px;
          font-weight: 700;
          color: #007AFF;
          margin-bottom: 16px;
        }
        
        .benefit-title {
          font-size: 20px;
          font-weight: 600;
          margin-bottom: 12px;
          color: #1D1D1F;
        }
        
        .benefit-description {
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
      .features-header {
        padding: 64px 0 48px;
      }
      
      .features-grid {
        grid-template-columns: 1fr;
      }
      
      .showcase-item {
        grid-template-columns: 1fr !important;
        gap: 32px !important;
        margin-bottom: 64px !important;
        
        &.reverse {
          direction: ltr;
        }
      }
      
      .cta-actions {
        flex-direction: column;
        align-items: stretch;
      }
    }
  `]
})
export class FeaturesPageMacComponent {
  navItems = [
    { label: '价格方案', url: '/pricing' },
    { label: '关于我们', url: '/about' },
    { label: '联系我们', url: '/contact' },
  ];
  
  features: Feature[] = [
    {
      icon: '🎯',
      title: '个性化学习',
      description: 'AI 驱动的自适应学习系统，为每位学生量身定制学习路径',
      details: [
        '智能水平评估',
        '动态难度调整',
        '兴趣导向推荐',
        '学习进度追踪'
      ]
    },
    {
      icon: '📊',
      title: '数据分析',
      description: '全方位的数据分析看板，深度洞察教学效果',
      details: [
        '实时数据可视化',
        '多维度报表',
        '趋势分析',
        '预测性预警'
      ]
    },
    {
      icon: '🤝',
      title: '协作互动',
      description: '强大的在线协作工具，促进师生深度互动',
      details: [
        '在线讨论区',
        '小组协作',
        '作业互评',
        '视频会议'
      ]
    },
    {
      icon: '📱',
      title: '多端同步',
      description: '跨平台无缝体验，随时随地学习',
      details: [
        'PC/Mac/Web',
        'iOS/Android',
        '平板适配',
        '离线模式'
      ]
    },
    {
      icon: '🔒',
      title: '安全可靠',
      description: '企业级安全防护，保障数据安全',
      details: [
        '端到端加密',
        '多重备份',
        '权限管理',
        '合规认证'
      ]
    },
    {
      icon: '⚡',
      title: '快速部署',
      description: '开箱即用，无需复杂配置',
      details: [
        '一键部署',
        '零配置启动',
        '快速迁移',
        '即时上线'
      ]
    }
  ];
  
  constructor(private router: Router) {}
  
  navigate(url: string): void {
    this.router.navigateByUrl(url);
  }
}
