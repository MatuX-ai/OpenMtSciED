/**
 * Mac 风格营销首页组件
 * Apple-inspired marketing home page with Hero, Features, and CTA sections
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
}

@Component({
  selector: 'app-marketing-home-mac',
  standalone: true,
  imports: [
    CommonModule,
    MacNavbarComponent,
    MacFooterComponent,
    MacCardComponent,
    MacButtonComponent
  ],
  template: `
    <!-- Navigation -->
    <app-mac-navbar 
      brandName="iMatu"
      [navItems]="navItems">
    </app-mac-navbar>
    
    <!-- Main Content -->
    <main class="mac-home-main">
      
      <!-- Hero Section -->
      <section class="hero-section">
        <div class="container">
          <div class="hero-content">
            <h1 class="hero-title">
              塑造未来教育
              <br>
              <span class="gradient-text">赋能无限可能</span>
            </h1>
            
            <p class="hero-subtitle">
              一体化智能学习平台，融合 AI 技术，为每位学习者提供个性化体验
            </p>
            
            <div class="hero-actions">
              <button appMacButton variant="primary" size="lg" (click)="navigate('/signup')">
                免费开始
              </button>
              <button appMacButton variant="outline" size="lg" (click)="navigate('/demo')">
                预约演示
              </button>
            </div>
            
            <!-- Social Proof -->
            <div class="social-proof">
              <p>受到全球 1000+ 机构信赖</p>
              <div class="logos">
                <span>🏫</span><span>🎓</span><span>📚</span><span>💡</span><span>🚀</span>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <!-- Features Section -->
      <section class="features-section">
        <div class="container">
          <div class="section-header">
            <h2 class="section-title">为什么选择 iMatu？</h2>
            <p class="section-subtitle">
              强大功能，简约设计，只为更好的学习体验
            </p>
          </div>
          
          <div class="features-grid">
            <div *ngFor="let feature of features" class="feature-card">
              <app-mac-card variant="outlined">
                <div class="feature-icon">{{ feature.icon }}</div>
                <h3 class="feature-title">{{ feature.title }}</h3>
                <p class="feature-description">{{ feature.description }}</p>
              </app-mac-card>
            </div>
          </div>
        </div>
      </section>
      
      <!-- Stats Section -->
      <section class="stats-section">
        <div class="container">
          <div class="stats-grid">
            <div class="stat-item">
              <div class="stat-number">1000+</div>
              <div class="stat-label">合作机构</div>
            </div>
            <div class="stat-item">
              <div class="stat-number">500K+</div>
              <div class="stat-label">活跃用户</div>
            </div>
            <div class="stat-item">
              <div class="stat-number">99.9%</div>
              <div class="stat-label">服务可用性</div>
            </div>
            <div class="stat-item">
              <div class="stat-number">24/7</div>
              <div class="stat-label">技术支持</div>
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
              加入数千名满意用户的行列，立即开启您的成功之旅
            </p>
            <div class="cta-actions">
              <button appMacButton variant="primary" size="lg" (click)="navigate('/signup')">
                免费注册
              </button>
              <button appMacButton variant="secondary" size="lg" (click)="navigate('/contact')">
                联系我们
              </button>
            </div>
          </div>
        </div>
      </section>
      
    </main>
    
    <!-- Footer -->
    <app-mac-footer></app-mac-footer>
  `,
  styles: [`
    .mac-home-main {
      padding-top: 52px;
    }
    
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 24px;
    }
    
    /* Hero Section */
    .hero-section {
      padding: 120px 0;
      background: linear-gradient(135deg, rgba(0, 122, 255, 0.05) 0%, rgba(52, 199, 89, 0.05) 100%);
      min-height: 80vh;
      display: flex;
      align-items: center;
    }
    
    .hero-content {
      text-align: center;
      max-width: 800px;
      margin: 0 auto;
    }
    
    .hero-title {
      font-size: clamp(40px, 8vw, 64px);
      font-weight: 700;
      line-height: 1.1;
      margin-bottom: 24px;
      color: #1D1D1F;
    }
    
    .gradient-text {
      background: linear-gradient(135deg, #007AFF 0%, #34C759 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    
    .hero-subtitle {
      font-size: clamp(18px, 3vw, 24px);
      color: #6E6E73;
      line-height: 1.6;
      margin-bottom: 40px;
    }
    
    .hero-actions {
      display: flex;
      gap: 16px;
      justify-content: center;
      flex-wrap: wrap;
      margin-bottom: 48px;
    }
    
    .social-proof {
      p {
        font-size: 14px;
        color: #86868B;
        margin-bottom: 16px;
      }
      
      .logos {
        display: flex;
        gap: 24px;
        justify-content: center;
        font-size: 32px;
        opacity: 0.6;
      }
    }
    
    /* Features Section */
    .features-section {
      padding: 96px 0;
    }
    
    .section-header {
      text-align: center;
      margin-bottom: 64px;
      
      .section-title {
        font-size: 40px;
        font-weight: 600;
        margin-bottom: 16px;
        color: #1D1D1F;
      }
      
      .section-subtitle {
        font-size: 18px;
        color: #6E6E73;
      }
    }
    
    .features-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 32px;
    }
    
    .feature-card {
      padding: 32px;
      text-align: center;
      
      .feature-icon {
        font-size: 48px;
        margin-bottom: 16px;
      }
      
      .feature-title {
        font-size: 20px;
        font-weight: 600;
        margin-bottom: 12px;
        color: #1D1D1F;
      }
      
      .feature-description {
        font-size: 15px;
        color: #6E6E73;
        line-height: 1.6;
      }
    }
    
    /* Stats Section */
    .stats-section {
      padding: 96px 0;
      background: #F5F5F7;
    }
    
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 48px;
      text-align: center;
      
      .stat-item {
        .stat-number {
          font-size: 48px;
          font-weight: 700;
          color: #007AFF;
          margin-bottom: 8px;
        }
        
        .stat-label {
          font-size: 15px;
          color: #6E6E73;
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
        font-size: 40px;
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
      .hero-section {
        padding: 80px 0;
        min-height: auto;
      }
      
      .features-section,
      .stats-section,
      .cta-section {
        padding: 64px 0;
      }
      
      .features-grid,
      .stats-grid {
        grid-template-columns: 1fr;
        gap: 24px;
      }
      
      .hero-actions,
      .cta-actions {
        flex-direction: column;
        align-items: stretch;
      }
    }
  `]
})
export class MarketingHomeMacComponent {
  navItems = [
    { label: '功能特性', url: '/features' },
    { label: '价格方案', url: '/pricing' },
    { label: '关于我们', url: '/about' },
    { label: '联系我们', url: '/contact' },
  ];
  
  features: Feature[] = [
    {
      icon: '🎯',
      title: '个性化学习',
      description: 'AI 驱动的自适应学习路径，为每位学生量身定制学习计划'
    },
    {
      icon: '📊',
      title: '数据分析',
      description: '实时学习数据追踪，深度分析学习效果，科学决策'
    },
    {
      icon: '🤝',
      title: '协作互动',
      description: '强大的协作工具，促进师生互动，提升学习效率'
    },
    {
      icon: '📱',
      title: '多端同步',
      description: '支持 PC、平板、手机，随时随地无缝学习'
    },
    {
      icon: '🔒',
      title: '安全可靠',
      description: '企业级安全防护，保护您的数据安全'
    },
    {
      icon: '⚡',
      title: '快速部署',
      description: '开箱即用，无需复杂配置，快速上线'
    },
  ];
  
  constructor(private router: Router) {}
  
  navigate(url: string): void {
    this.router.navigateByUrl(url);
  }
}
