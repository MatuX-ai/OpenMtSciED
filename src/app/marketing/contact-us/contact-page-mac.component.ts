/**
 * Mac 风格联系我们页面
 * Contact Us page with form and contact info
 */
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

import { MacNavbarComponent } from '../../shared/components/mac/mac-navbar.component';
import { MacFooterComponent } from '../../shared/components/mac/mac-footer.component';
import { MacCardComponent } from '../../shared/components/mac/mac-card.component';
import { MacButtonComponent } from '../../shared/components/mac/mac-button.component';

interface ContactInfo {
  icon: string;
  title: string;
  content: string;
}

@Component({
  selector: 'app-contact-page-mac',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MacNavbarComponent,
    MacFooterComponent,
    MacCardComponent,
    MacButtonComponent
  ],
  template: `
    <app-mac-navbar brandName="iMatu" [navItems]="navItems"></app-mac-navbar>
    
    <main class="contact-main">
      <!-- Header Section -->
      <section class="contact-header">
        <div class="container">
          <h1 class="header-title">联系我们</h1>
          <p class="header-subtitle">
            我们随时为您提供帮助
          </p>
        </div>
      </section>
      
      <!-- Contact Content -->
      <section class="contact-content">
        <div class="container">
          <div class="contact-grid">
            <!-- Contact Form -->
            <div class="contact-form-wrapper">
              <app-mac-card variant="outlined">
                <h2 class="form-title">发送消息</h2>
                <form [formGroup]="contactForm" (ngSubmit)="onSubmit()">
                  <div class="form-row">
                    <div class="form-group">
                      <label for="name">姓名 *</label>
                      <input 
                        type="text" 
                        id="name"
                        formControlName="name"
                        placeholder="请输入您的姓名"
                        [class.error]="isFieldInvalid('name')">
                      <div *ngIf="isFieldInvalid('name')" class="error-message">
                        请输入您的姓名
                      </div>
                    </div>
                    
                    <div class="form-group">
                      <label for="email">邮箱 *</label>
                      <input 
                        type="email" 
                        id="email"
                        formControlName="email"
                        placeholder="example@email.com"
                        [class.error]="isFieldInvalid('email')">
                      <div *ngIf="isFieldInvalid('email')" class="error-message">
                        请输入有效的邮箱地址
                      </div>
                    </div>
                  </div>
                  
                  <div class="form-row">
                    <div class="form-group">
                      <label for="phone">电话</label>
                      <input 
                        type="tel" 
                        id="phone"
                        formControlName="phone"
                        placeholder="请输入您的电话号码">
                    </div>
                    
                    <div class="form-group">
                      <label for="company">公司</label>
                      <input 
                        type="text" 
                        id="company"
                        formControlName="company"
                        placeholder="请输入公司名称">
                    </div>
                  </div>
                  
                  <div class="form-group">
                    <label for="subject">主题 *</label>
                    <select 
                      id="subject"
                      formControlName="subject"
                      [class.error]="isFieldInvalid('subject')">
                      <option value="">请选择咨询主题</option>
                      <option value="sales">销售咨询</option>
                      <option value="support">技术支持</option>
                      <option value="partnership">合作洽谈</option>
                      <option value="other">其他问题</option>
                    </select>
                    <div *ngIf="isFieldInvalid('subject')" class="error-message">
                      请选择咨询主题
                    </div>
                  </div>
                  
                  <div class="form-group">
                    <label for="message">留言内容 *</label>
                    <textarea 
                      id="message"
                      formControlName="message"
                      rows="6"
                      placeholder="请详细描述您的问题或需求..."
                      [class.error]="isFieldInvalid('message')"></textarea>
                    <div *ngIf="isFieldInvalid('message')" class="error-message">
                      请输入留言内容（至少 10 个字符）
                    </div>
                  </div>
                  
                  <button 
                    type="submit" 
                    appMacButton 
                    variant="primary" 
                    size="lg"
                    style="width: 100%"
                    [disabled]="contactForm.invalid || isSubmitting">
                    {{ isSubmitting ? '提交中...' : '发送消息' }}
                  </button>
                </form>
              </app-mac-card>
            </div>
            
            <!-- Contact Info -->
            <div class="contact-info-wrapper">
              <div class="contact-info-section">
                <h2 class="info-title">联系方式</h2>
                
                <div *ngFor="let info of contactInfo" class="contact-info-item">
                  <div class="info-icon">{{ info.icon }}</div>
                  <div class="info-content">
                    <h3>{{ info.title }}</h3>
                    <p>{{ info.content }}</p>
                  </div>
                </div>
              </div>
              
              <div class="map-section">
                <h2 class="info-title">公司地址</h2>
                <div class="map-placeholder">
                  <div class="placeholder-content">
                    <span>📍</span>
                    <p>北京市海淀区中关村大街 1 号<br>数码大厦 A 座 10 层</p>
                  </div>
                </div>
              </div>
              
              <div class="social-section">
                <h2 class="info-title">关注我们</h2>
                <div class="social-links">
                  <a href="#" class="social-link">
                    <span>💬</span>
                    <span>微信</span>
                  </a>
                  <a href="#" class="social-link">
                    <span>🧣</span>
                    <span>微博</span>
                  </a>
                  <a href="#" class="social-link">
                    <span>📱</span>
                    <span>抖音</span>
                  </a>
                  <a href="#" class="social-link">
                    <span>💼</span>
                    <span>领英</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <!-- FAQ Preview Section -->
      <section class="faq-preview-section">
        <div class="container">
          <h2 class="section-title">常见问题</h2>
          <div class="faq-grid">
            <div *ngFor="let faq of faqs" class="faq-item">
              <h3 class="faq-question">{{ faq.question }}</h3>
              <p class="faq-answer">{{ faq.answer }}</p>
            </div>
          </div>
          <div class="view-more-faq">
            <button appMacButton variant="outline" size="lg" (click)="navigate('/faq')">
              查看更多 FAQ
            </button>
          </div>
        </div>
      </section>
      
      <!-- CTA Section -->
      <section class="cta-section">
        <div class="container">
          <div class="cta-content">
            <h2 class="cta-title">需要紧急帮助？</h2>
            <p class="cta-description">
              拨打我们的 24/7 客服热线，立即获得支持
            </p>
            <div class="cta-phone">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#007AFF" stroke-width="2">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
              </svg>
              <span>400-888-9999</span>
            </div>
          </div>
        </div>
      </section>
    </main>
    
    <app-mac-footer></app-mac-footer>
  `,
  styles: [`
    .contact-main {
      padding-top: 52px;
    }
    
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 24px;
    }
    
    /* Header Section */
    .contact-header {
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
    
    /* Contact Content */
    .contact-content {
      padding: 64px 0;
    }
    
    .contact-grid {
      display: grid;
      grid-template-columns: 1.5fr 1fr;
      gap: 48px;
    }
    
    .contact-form-wrapper {
      app-mac-card {
        padding: 40px;
        
        .form-title {
          font-size: 24px;
          font-weight: 600;
          margin-bottom: 32px;
          color: #1D1D1F;
        }
      }
    }
    
    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-bottom: 20px;
      
      @media (max-width: 768px) {
        grid-template-columns: 1fr;
      }
    }
    
    .form-group {
      margin-bottom: 20px;
      
      label {
        display: block;
        font-size: 14px;
        font-weight: 500;
        margin-bottom: 8px;
        color: #1D1D1F;
      }
      
      input,
      select,
      textarea {
        width: 100%;
        padding: 12px 16px;
        font-size: 15px;
        border: 1px solid #E5E5EA;
        border-radius: 10px;
        background: white;
        transition: all 0.2s;
        
        &:focus {
          outline: none;
          border-color: #007AFF;
          box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.1);
        }
        
        &.error {
          border-color: #FF3B30;
        }
      }
      
      textarea {
        resize: vertical;
        min-height: 120px;
      }
      
      .error-message {
        font-size: 13px;
        color: #FF3B30;
        margin-top: 6px;
      }
    }
    
    .contact-info-wrapper {
      display: flex;
      flex-direction: column;
      gap: 32px;
    }
    
    .contact-info-section {
      .info-title {
        font-size: 20px;
        font-weight: 600;
        margin-bottom: 24px;
        color: #1D1D1F;
      }
      
      .contact-info-item {
        display: flex;
        gap: 16px;
        margin-bottom: 24px;
        
        .info-icon {
          font-size: 32px;
          flex-shrink: 0;
        }
        
        .info-content {
          h3 {
            font-size: 16px;
            font-weight: 600;
            margin-bottom: 4px;
            color: #1D1D1F;
          }
          
          p {
            font-size: 15px;
            color: #6E6E73;
            line-height: 1.6;
          }
        }
      }
    }
    
    .map-section {
      .info-title {
        font-size: 20px;
        font-weight: 600;
        margin-bottom: 24px;
        color: #1D1D1F;
      }
      
      .map-placeholder {
        background: #F5F5F7;
        border-radius: 14px;
        padding: 48px;
        text-align: center;
        
        .placeholder-content {
          span {
            font-size: 48px;
            display: block;
            margin-bottom: 16px;
          }
          
          p {
            font-size: 15px;
            color: #6E6E73;
            line-height: 1.6;
          }
        }
      }
    }
    
    .social-section {
      .info-title {
        font-size: 20px;
        font-weight: 600;
        margin-bottom: 24px;
        color: #1D1D1F;
      }
      
      .social-links {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 16px;
        
        .social-link {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px;
          background: #F5F5F7;
          border-radius: 10px;
          text-decoration: none;
          transition: all 0.2s;
          
          &:hover {
            background: #E5E5EA;
            transform: translateY(-2px);
          }
          
          span:first-child {
            font-size: 24px;
          }
          
          span:last-child {
            font-size: 14px;
            color: #1D1D1F;
            font-weight: 500;
          }
        }
      }
    }
    
    /* FAQ Preview Section */
    .faq-preview-section {
      padding: 96px 0;
      background: #F5F5F7;
      
      .section-title {
        text-align: center;
        font-size: 36px;
        font-weight: 600;
        margin-bottom: 48px;
        color: #1D1D1F;
      }
      
      .faq-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
        gap: 32px;
        margin-bottom: 48px;
        
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
      
      .view-more-faq {
        text-align: center;
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
      
      .cta-phone {
        display: inline-flex;
        align-items: center;
        gap: 12px;
        font-size: 32px;
        font-weight: 700;
        color: #007AFF;
      }
    }
    
    @media (max-width: 768px) {
      .contact-header {
        padding: 64px 0 48px;
      }
      
      .contact-grid {
        grid-template-columns: 1fr;
      }
      
      .faq-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class ContactPageMacComponent {
  navItems = [
    { label: '功能特性', url: '/features' },
    { label: '价格方案', url: '/pricing' },
    { label: '关于我们', url: '/about' },
  ];
  
  contactForm: FormGroup;
  isSubmitting = false;
  
  contactInfo: ContactInfo[] = [
    {
      icon: '📞',
      title: '电话咨询',
      content: '400-888-9999（工作日 9:00-18:00）'
    },
    {
      icon: '📧',
      title: '邮件咨询',
      content: 'contact@imatu.com（24 小时内回复）'
    },
    {
      icon: '💬',
      title: '在线客服',
      content: '点击右下角图标开始在线聊天'
    },
    {
      icon: '🏢',
      title: '公司地址',
      content: '北京市海淀区中关村大街 1 号数码大厦 A 座 10 层'
    }
  ];
  
  faqs = [
    {
      question: '如何申请产品演示？',
      answer: '您可以通过此页面的表单提交演示申请，我们会安排专人与您联系，为您定制专属的产品演示。'
    },
    {
      question: '技术支持响应时间多久？',
      answer: '工作时间内 2 小时内响应，非工作时间 4 小时内响应。企业版用户享有专属客服，优先处理。'
    },
    {
      question: '支持定制开发吗？',
      answer: '是的，我们提供定制开发服务。请通过表单提交您的需求，我们的技术团队会评估并提供方案。'
    }
  ];
  
  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private router: Router
  ) {
    this.contactForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      company: [''],
      subject: ['', Validators.required],
      message: ['', [Validators.required, Validators.minLength(10)]]
    });
  }
  
  isFieldInvalid(field: string): boolean {
    const control = this.contactForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }
  
  onSubmit(): void {
    if (this.contactForm.valid) {
      this.isSubmitting = true;
      
      // Simulate form submission
      setTimeout(() => {
        this.snackBar.open('消息已发送！我们会尽快与您联系', '关闭', {
          duration: 5000
        });
        this.contactForm.reset();
        this.isSubmitting = false;
      }, 1500);
    } else {
      this.snackBar.open('请填写完整信息', '关闭', {
        duration: 3000
      });
    }
  }
  
  navigate(url: string): void {
    this.router.navigateByUrl(url);
  }
}
