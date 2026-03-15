/**
 * Mac 风格关于我们页面
 * About Us page with story, team, and values
 */
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { MacNavbarComponent } from '../../shared/components/mac/mac-navbar.component';
import { MacFooterComponent } from '../../shared/components/mac/mac-footer.component';
import { MacCardComponent } from '../../shared/components/mac/mac-card.component';
import { MacButtonComponent } from '../../shared/components/mac/mac-button.component';

interface TeamMember {
  name: string;
  role: string;
  avatar: string;
  bio: string;
}

interface Value {
  icon: string;
  title: string;
  description: string;
}

@Component({
  selector: 'app-about-page-mac',
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
    
    <main class="about-main">
      <!-- Hero Section -->
      <section class="about-hero">
        <div class="container">
          <h1 class="hero-title">关于 iMatu</h1>
          <p class="hero-subtitle">
            用科技赋能教育，让学习更美好
          </p>
        </div>
      </section>
      
      <!-- Story Section -->
      <section class="story-section">
        <div class="container">
          <div class="story-content">
            <h2 class="section-title">我们的故事</h2>
            <div class="story-text">
              <p>
                iMatu 成立于 2020 年，由一群热爱教育和技术的专业人士创立。
                我们看到了传统教育系统的局限性，也看到了技术带来的无限可能。
              </p>
              <p>
                我们的使命是通过创新的技术解决方案，让教育更加个性化、高效和普惠。
                我们相信，每个人都有权利获得优质的教育资源，而技术是实现这一目标的关键。
              </p>
              <p>
                经过多年发展，iMatu 已经服务全球 1000+ 教育机构，帮助数十万学习者实现他们的目标。
                但这只是开始，我们将继续努力，让更多人受益于科技与教育的融合。
              </p>
            </div>
            
            <div class="timeline">
              <div class="timeline-item">
                <div class="timeline-year">2020</div>
                <div class="timeline-content">
                  <h3>公司成立</h3>
                  <p>在北京成立研发中心，启动产品研发</p>
                </div>
              </div>
              <div class="timeline-item">
                <div class="timeline-year">2021</div>
                <div class="timeline-content">
                  <h3>产品上线</h3>
                  <p>iMatu 平台正式发布，获得首批 100+ 客户</p>
                </div>
              </div>
              <div class="timeline-item">
                <div class="timeline-year">2022</div>
                <div class="timeline-content">
                  <h3>快速成长</h3>
                  <p>用户突破 10 万，完成 A 轮融资</p>
                </div>
              </div>
              <div class="timeline-item">
                <div class="timeline-year">2023</div>
                <div class="timeline-content">
                  <h3>国际化</h3>
                  <p>进入海外市场，服务全球用户</p>
                </div>
              </div>
              <div class="timeline-item">
                <div class="timeline-year">2024</div>
                <div class="timeline-content">
                  <h3>AI 升级</h3>
                  <p>推出 AI 驱动的智能学习系统</p>
                </div>
              </div>
              <div class="timeline-item">
                <div class="timeline-year">Now</div>
                <div class="timeline-content">
                  <h3>持续创新</h3>
                  <p>引领未来教育科技发展</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <!-- Values Section -->
      <section class="values-section">
        <div class="container">
          <h2 class="section-title">我们的价值观</h2>
          <div class="values-grid">
            <div *ngFor="let value of values" class="value-item">
              <app-mac-card variant="outlined">
                <div class="value-icon">{{ value.icon }}</div>
                <h3 class="value-title">{{ value.title }}</h3>
                <p class="value-description">{{ value.description }}</p>
              </app-mac-card>
            </div>
          </div>
        </div>
      </section>
      
      <!-- Team Section -->
      <section class="team-section">
        <div class="container">
          <h2 class="section-title">核心团队</h2>
          <div class="team-grid">
            <div *ngFor="let member of teamMembers" class="team-member">
              <app-mac-card variant="default">
                <div class="member-avatar">
                  <span>{{ member.avatar }}</span>
                </div>
                <h3 class="member-name">{{ member.name }}</h3>
                <p class="member-role">{{ member.role }}</p>
                <p class="member-bio">{{ member.bio }}</p>
              </app-mac-card>
            </div>
          </div>
        </div>
      </section>
      
      <!-- CTA Section -->
      <section class="cta-section">
        <div class="container">
          <div class="cta-content">
            <h2 class="cta-title">想加入我们吗？</h2>
            <p class="cta-description">
              我们正在寻找优秀的人才，一起创造未来
            </p>
            <div class="cta-actions">
              <button appMacButton variant="primary" size="lg" (click)="navigate('/careers')">
                查看职位
              </button>
              <button appMacButton variant="secondary" size="lg" (click)="navigate('/contact')">
                联系我们
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
    
    <app-mac-footer></app-mac-footer>
  `,
  styles: [`
    .about-main {
      padding-top: 52px;
    }
    
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 24px;
    }
    
    /* Hero Section */
    .about-hero {
      padding: 96px 0;
      text-align: center;
      background: linear-gradient(135deg, rgba(0, 122, 255, 0.05) 0%, rgba(52, 199, 89, 0.05) 100%);
      
      .hero-title {
        font-size: 48px;
        font-weight: 700;
        margin-bottom: 16px;
        color: #1D1D1F;
      }
      
      .hero-subtitle {
        font-size: 18px;
        color: #6E6E73;
      }
    }
    
    /* Story Section */
    .story-section {
      padding: 96px 0;
      
      .story-content {
        max-width: 800px;
        margin: 0 auto;
        
        .section-title {
          font-size: 36px;
          font-weight: 600;
          margin-bottom: 48px;
          color: #1D1D1F;
        }
        
        .story-text {
          p {
            font-size: 16px;
            line-height: 1.8;
            color: #6E6E73;
            margin-bottom: 24px;
          }
        }
      }
      
      .timeline {
        margin-top: 64px;
        position: relative;
        
        &:before {
          content: '';
          position: absolute;
          left: 50%;
          transform: translateX(-50%);
          width: 2px;
          height: 100%;
          background: #E5E5EA;
        }
        
        .timeline-item {
          display: flex;
          gap: 32px;
          margin-bottom: 48px;
          position: relative;
          
          &:nth-child(odd) {
            flex-direction: row-reverse;
            text-align: right;
          }
          
          .timeline-year {
            font-size: 24px;
            font-weight: 700;
            color: #007AFF;
            min-width: 80px;
            position: relative;
            
            &:after {
              content: '';
              position: absolute;
              top: 50%;
              right: -12px;
              transform: translateX(50%);
              width: 12px;
              height: 12px;
              border-radius: 50%;
              background: #007AFF;
              border: 3px solid white;
              box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            }
          }
          
          .timeline-content {
            flex: 1;
            
            h3 {
              font-size: 20px;
              font-weight: 600;
              margin-bottom: 8px;
              color: #1D1D1F;
            }
            
            p {
              font-size: 15px;
              color: #6E6E73;
            }
          }
        }
      }
    }
    
    /* Values Section */
    .values-section {
      padding: 96px 0;
      background: #F5F5F7;
      
      .section-title {
        text-align: center;
        font-size: 36px;
        font-weight: 600;
        margin-bottom: 64px;
        color: #1D1D1F;
      }
      
      .values-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: 32px;
        
        .value-item {
          padding: 32px;
          text-align: center;
          
          .value-icon {
            font-size: 48px;
            margin-bottom: 16px;
          }
          
          .value-title {
            font-size: 20px;
            font-weight: 600;
            margin-bottom: 12px;
            color: #1D1D1F;
          }
          
          .value-description {
            font-size: 15px;
            color: #6E6E73;
            line-height: 1.6;
          }
        }
      }
    }
    
    /* Team Section */
    .team-section {
      padding: 96px 0;
      
      .section-title {
        text-align: center;
        font-size: 36px;
        font-weight: 600;
        margin-bottom: 64px;
        color: #1D1D1F;
      }
      
      .team-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: 32px;
        
        .team-member {
          padding: 32px;
          text-align: center;
          
          .member-avatar {
            span {
              font-size: 80px;
              display: block;
              margin-bottom: 24px;
            }
          }
          
          .member-name {
            font-size: 22px;
            font-weight: 600;
            margin-bottom: 8px;
            color: #1D1D1F;
          }
          
          .member-role {
            font-size: 15px;
            color: #007AFF;
            margin-bottom: 16px;
          }
          
          .member-bio {
            font-size: 14px;
            color: #6E6E73;
            line-height: 1.6;
          }
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
      .about-hero {
        padding: 64px 0;
      }
      
      .timeline:before {
        left: 20px;
      }
      
      .timeline-item {
        flex-direction: column !important;
        text-align: left !important;
        margin-left: 52px;
        
        .timeline-year {
          min-width: auto;
        }
        
        .timeline-year:after {
          left: -40px;
          right: auto;
          transform: none;
        }
      }
      
      .values-grid,
      .team-grid {
        grid-template-columns: 1fr;
      }
      
      .cta-actions {
        flex-direction: column;
        align-items: stretch;
      }
    }
  `]
})
export class AboutPageMacComponent {
  navItems = [
    { label: '功能特性', url: '/features' },
    { label: '价格方案', url: '/pricing' },
    { label: '联系我们', url: '/contact' },
  ];
  
  values: Value[] = [
    {
      icon: '🎯',
      title: '用户至上',
      description: '始终以用户需求为中心，创造真正有价值的产品体验'
    },
    {
      icon: '💡',
      title: '创新驱动',
      description: '拥抱变化，持续创新，引领行业发展'
    },
    {
      icon: '🤝',
      title: '诚信正直',
      description: '诚实守信，言行一致，做正确的事情'
    },
    {
      icon: '🌟',
      title: '追求卓越',
      description: '不满足于现状，不断超越自我，追求极致'
    }
  ];
  
  teamMembers: TeamMember[] = [
    {
      name: '张三',
      role: '创始人 & CEO',
      avatar: '👨‍💼',
      bio: '前某知名互联网公司高管，15 年教育行业经验'
    },
    {
      name: '李四',
      role: '联合创始人 & CTO',
      avatar: '👨‍💻',
      bio: '人工智能博士，曾任某大厂首席架构师'
    },
    {
      name: '王五',
      role: '产品副总裁',
      avatar: '👩‍🎨',
      bio: '资深产品专家，主导过多款千万级用户产品'
    },
    {
      name: '赵六',
      role: '运营副总裁',
      avatar: '👩‍💼',
      bio: '运营管理专家，擅长用户增长和品牌建设'
    }
  ];
  
  constructor(private router: Router) {}
  
  navigate(url: string): void {
    this.router.navigateByUrl(url);
  }
}
