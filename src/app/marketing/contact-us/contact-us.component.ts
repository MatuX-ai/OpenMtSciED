/* eslint-disable @typescript-eslint/unbound-method */
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';

import { MarketingLayoutComponent } from '../shared/marketing-layout/marketing-layout.component';

@Component({
  selector: 'app-contact-us',
  template: `
    <app-marketing-layout>
      <div class="contact-us">
        <!-- Hero Header -->
        <section class="hero-header">
          <div class="container">
            <div class="hero-content">
              <h1>联系我们</h1>
              <p class="hero-subtitle">我们随时为您服务，期待听到您的声音</p>
            </div>
          </div>
        </section>

        <!-- Contact Content -->
        <section class="contact-section">
          <div class="container">
            <div class="contact-grid">
              <!-- Contact Form -->
              <div class="contact-form">
                <h2>在线客服</h2>
                <div class="chat-container">
                  <div class="chat-messages">
                    <div class="message bot-message">
                      <div class="message-avatar">
                        <i class="ri-customer-service-2-fill"></i>
                      </div>
                      <div class="message-content">
                        <div class="message-bubble">
                          <p>您好！我是 iMato 智能助手，很高兴为您服务！👋</p>
                          <p>请问有什么可以帮助您的吗？</p>
                        </div>
                        <div class="message-time">刚刚</div>
                      </div>
                    </div>

                    <div class="message bot-message">
                      <div class="message-avatar">
                        <i class="ri-customer-service-2-fill"></i>
                      </div>
                      <div class="message-content">
                        <div class="message-bubble">
                          <p>您可以向我咨询：</p>
                          <ul class="quick-questions">
                            <li
                              *ngFor="let question of quickQuestions"
                              (click)="askQuestion(question)"
                            >
                              {{ question }}
                            </li>
                          </ul>
                        </div>
                        <div class="message-time">刚刚</div>
                      </div>
                    </div>

                    <div class="message" *ngFor="let msg of messages; trackBy: trackByIndex">
                      <div class="message-avatar" [class.user-avatar]="msg.type === 'user'">
                        <i
                          class="ri-{{
                            msg.type === 'user' ? 'user-smile-line' : 'customer-service-2-fill'
                          }}"
                        ></i>
                      </div>
                      <div class="message-content" [class.user-content]="msg.type === 'user'">
                        <div class="message-bubble" [class.user-bubble]="msg.type === 'user'">
                          <p [innerHTML]="getFormattedContent(msg.content)"></p>
                        </div>
                        <div class="message-time">{{ msg.time }}</div>
                      </div>
                    </div>

                    <div class="message bot-message" *ngIf="isSending">
                      <div class="message-avatar">
                        <i class="ri-customer-service-2-fill"></i>
                      </div>
                      <div class="message-content">
                        <div class="message-bubble">
                          <p>正在输入...</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="chat-input-container">
                    <mat-form-field appearance="outline" class="chat-input-field">
                      <input
                        matInput
                        [(ngModel)]="messageInput"
                        (keyup.enter)="sendMessage()"
                        placeholder="请输入您的问题..."
                      />
                    </mat-form-field>
                    <button
                      mat-raised-button
                      color="primary"
                      class="send-message-btn"
                      (click)="sendMessage()"
                      [disabled]="!messageInput || isSending"
                    >
                      <i *ngIf="!isSending" class="ri-send-plane-fill"></i>
                      <i *ngIf="isSending" class="ri-time-line loading-icon"></i>
                    </button>
                  </div>
                </div>

                <div class="service-hours">
                  <i class="ri-time-line"></i>
                  <span>服务时间：周一至周五 9:00-18:00（工作日）</span>
                </div>
              </div>

              <!-- Contact Info -->
              <div class="contact-info">
                <h2>联系方式</h2>

                <div class="info-card" *ngFor="let info of contactInfo">
                  <i class="ri-{{ info.icon }} info-icon"></i>
                  <div>
                    <h3>{{ info.title }}</h3>
                    <p>{{ info.content }}</p>
                  </div>
                </div>

                <div class="social-links">
                  <h3>关注我们</h3>
                  <p class="social-description">
                    iMato 是一个开源教育平台项目，欢迎贡献代码和提出建议
                  </p>
                  <div class="social-icons">
                    <a
                      href="https://github.com/imatupro"
                      target="_blank"
                      mat-icon-button
                      class="social-icon-btn social-github"
                      title="GitHub"
                    >
                      <i class="ri-github-fill"></i>
                    </a>
                    <a
                      href="https://www.facebook.com/imatupro"
                      target="_blank"
                      mat-icon-button
                      class="social-icon-btn social-facebook"
                      title="Facebook"
                    >
                      <i class="ri-facebook-circle-fill"></i>
                    </a>
                    <a
                      href="https://twitter.com/imatupro"
                      target="_blank"
                      mat-icon-button
                      class="social-icon-btn social-x"
                      title="X (Twitter)"
                    >
                      <i class="ri-twitter-x-fill"></i>
                    </a>
                    <div class="wechat-container" matTooltip="微信扫码关注">
                      <button mat-icon-button class="social-icon-btn social-wechat">
                        <i class="ri-wechat-fill"></i>
                      </button>
                      <div class="wechat-qrcode">
                        <div class="qrcode-placeholder">
                          <i class="ri-qr-code-line"></i>
                          <span>扫码关注公众号</span>
                        </div>
                        <p>imatupro</p>
                      </div>
                    </div>
                  </div>
                  <p class="github-note">通过 GitHub Issues 联系我们，提交问题和建议</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </app-marketing-layout>
  `,
  styles: [
    `
      .contact-us {
        min-height: 100vh;
        padding-bottom: 80px;
      }

      .hero-header {
        min-height: 300px;
        background-color: #f8fafc;
        background-image:
          linear-gradient(rgba(200, 220, 255, 0.08) 1px, transparent 1px),
          linear-gradient(90deg, rgba(200, 220, 255, 0.08) 1px, transparent 1px);
        background-size: 40px 40px;
        color: #1d2129;
        padding: 60px 0;
        text-align: center;

        &::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23999999" fill-opacity="0.05"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E');
          opacity: 0.3;
        }

        .hero-content {
          position: relative;
          z-index: 1;
        }

        h1 {
          font-size: 3rem;
          margin-bottom: 16px;
          font-weight: 700;
          color: #1d2129;
        }

        .hero-subtitle {
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

          .hero-subtitle {
            font-size: 1rem;
          }
        }
      }

      .contact-section {
        padding: 80px 0;
      }

      .contact-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 64px;
      }

      .contact-form {
        h2 {
          font-size: 2rem;
          margin-bottom: 32px;
          color: #333;
          font-weight: 600;
        }

        .chat-container {
          background: white;
          border-radius: 16px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
          overflow: hidden;
          border: 1px solid #e0e0e0;
        }

        .chat-messages {
          height: 400px;
          overflow-y: auto;
          padding: 24px;
          background: #f9f9f9;

          .message {
            display: flex;
            margin-bottom: 20px;
            animation: slideIn 0.3s ease;

            @keyframes slideIn {
              from {
                opacity: 0;
                transform: translateY(10px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }

            &.bot-message {
              .message-avatar {
                width: 40px;
                height: 40px;
                border-radius: 50%;
                background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
                display: flex;
                align-items: center;
                justify-content: center;
                margin-right: 12px;
                flex-shrink: 0;

                i {
                  color: white;
                  font-size: 20px;
                }
              }

              .message-content {
                flex: 1;

                .message-bubble {
                  background: white;
                  padding: 16px;
                  border-radius: 12px;
                  border-top-left-radius: 4px;
                  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
                  border: 1px solid #e0e0e0;

                  p {
                    margin: 0 0 8px 0;
                    color: #333;
                    line-height: 1.6;

                    &:last-child {
                      margin-bottom: 0;
                    }
                  }

                  .quick-questions {
                    margin: 12px 0 0 0;
                    padding-left: 20px;
                    color: #666;

                    li {
                      margin-bottom: 6px;
                      color: #1e3a8a;
                      cursor: pointer;
                      transition: color 0.2s ease;

                      &:hover {
                        color: #3b82f6;
                      }
                    }
                  }
                }

                .message-time {
                  font-size: 0.75rem;
                  color: #999;
                  margin-top: 6px;
                  padding-left: 4px;
                }
              }
            }

            &.user-message {
              flex-direction: row-reverse;

              .message-avatar {
                width: 40px;
                height: 40px;
                border-radius: 50%;
                background: linear-gradient(135deg, #4caf50 0%, #8bc34a 100%);
                display: flex;
                align-items: center;
                justify-content: center;
                margin-left: 12px;
                flex-shrink: 0;

                i {
                  color: white;
                  font-size: 20px;
                }
              }

              .message-content {
                flex: 1;
                display: flex;
                flex-direction: column;
                align-items: flex-end;

                .message-bubble {
                  background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
                  padding: 16px;
                  border-radius: 12px;
                  border-top-right-radius: 4px;
                  box-shadow: 0 2px 8px rgba(30, 58, 138, 0.3);

                  p {
                    margin: 0;
                    color: white;
                    line-height: 1.6;
                  }
                }

                .message-time {
                  font-size: 0.75rem;
                  color: #999;
                  margin-top: 6px;
                  padding-right: 4px;
                }
              }
            }
          }
        }

        .chat-input-container {
          display: flex;
          gap: 12px;
          padding: 20px;
          background: white;
          border-top: 1px solid #e0e0e0;

          .chat-input-field {
            flex: 1;

            ::ng-deep {
              .mat-form-field-wrapper {
                margin: 0;
              }

              .mat-form-field-outline {
                color: #e0e0e0;
              }

              .mat-input-element {
                padding: 12px 16px;
              }
            }
          }

          .send-message-btn {
            width: 48px;
            height: 48px;
            border-radius: 8px;
            background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s ease;

            &:hover:not(:disabled) {
              transform: translateY(-2px);
              box-shadow: 0 8px 20px rgba(30, 58, 138, 0.4);
            }

            &:disabled {
              opacity: 0.6;
              cursor: not-allowed;
            }

            i {
              font-size: 20px;
              color: white;

              &.loading-icon {
                animation: spin 1s linear infinite;
              }
            }
          }
        }

        .service-hours {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 16px;
          background: #f5f5f5;
          color: #666;
          font-size: 0.9rem;
          border-top: 1px solid #e0e0e0;

          i {
            color: #1e3a8a;
          }
        }

        button {
          @keyframes spin {
            0% {
              transform: rotate(0deg);
            }
            100% {
              transform: rotate(360deg);
            }
          }
        }
      }

      .contact-info {
        h2 {
          font-size: 2rem;
          margin-bottom: 32px;
          color: #333;
        }
      }

      .info-card {
        display: flex;
        align-items: flex-start;
        gap: 24px;
        padding: 28px;
        margin-bottom: 24px;
        background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
        border-radius: 16px;
        transition:
          transform 0.3s ease,
          box-shadow 0.3s ease;
        border: 1px solid #eaeaea;

        &:hover {
          transform: translateY(-6px);
          box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
        }

        mat-icon {
          font-size: 48px;
          width: 48px;
          height: 48px;
          color: #1e3a8a;
          flex-shrink: 0;
        }

        .info-icon {
          font-size: 48px;
          width: 48px;
          height: 48px;
          color: #1e3a8a;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        h3 {
          font-size: 1.3rem;
          margin-bottom: 8px;
          color: #333;
          font-weight: 600;
        }

        p {
          color: #666;
          line-height: 1.7;
          font-size: 1rem;
        }
      }

      .social-links {
        margin-top: 48px;
        padding: 40px;
        background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
        border-radius: 16px;
        text-align: center;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
        border: 1px solid #eaeaea;

        h3 {
          font-size: 1.6rem;
          margin-bottom: 16px;
          color: #333;
          font-weight: 600;
        }

        .social-description {
          color: #666;
          font-size: 1rem;
          line-height: 1.6;
          margin-bottom: 32px;
        }

        .social-icons {
          display: flex;
          justify-content: center;
          gap: 12px;
          margin-bottom: 20px;
          flex-wrap: wrap;
        }

        .social-icon-btn {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: white;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          transition: all 0.3s ease;
          border: 2px solid #e0e0e0;

          i {
            font-size: 28px;
          }

          &:hover {
            transform: translateY(-4px);
            box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
          }

          &.social-github:hover {
            border-color: #333;
            background: #333;
            i {
              color: white;
            }
          }

          &.social-facebook:hover {
            border-color: #1877f2;
            background: #1877f2;
            i {
              color: white;
            }
          }

          &.social-x:hover {
            border-color: #000;
            background: #000;
            i {
              color: white;
            }
          }

          &.social-wechat:hover {
            border-color: #07c160;
            background: #07c160;
            i {
              color: white;
            }
          }
        }

        .wechat-container {
          position: relative;

          .wechat-qrcode {
            position: absolute;
            bottom: 70px;
            left: 50%;
            transform: translateX(-50%) scale(0.8);
            background: white;
            padding: 20px;
            border-radius: 12px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
            opacity: 0;
            visibility: hidden;
            transition: all 0.3s ease;
            z-index: 100;
            min-width: 200px;
            border: 1px solid #e0e0e0;

            .qrcode-placeholder {
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              padding: 20px;
              background: #f8f9fa;
              border-radius: 8px;

              i {
                font-size: 64px;
                color: #1e3a8a;
                margin-bottom: 12px;
              }

              span {
                color: #666;
                font-size: 0.9rem;
              }
            }

            p {
              text-align: center;
              margin-top: 12px;
              color: #333;
              font-weight: 600;
              font-size: 0.95rem;
            }
          }

          &:hover .wechat-qrcode {
            opacity: 1;
            visibility: visible;
            transform: translateX(-50%) scale(1);
          }
        }

        .github-note {
          color: #888;
          font-size: 0.9rem;
          margin-top: 20px;
          line-height: 1.5;
        }

        a {
          text-decoration: none;
        }
      }

      .container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 0 24px;
      }

      @media (max-width: 768px) {
        .contact-grid {
          grid-template-columns: 1fr;
          gap: 48px;
        }

        .header-section h1 {
          font-size: 2rem;
        }
      }
    `,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MarketingLayoutComponent,
  ],
})
export class ContactUsComponent implements OnInit {
  messageInput = '';
  isSending = false;
  messages: Array<{
    type: 'bot' | 'user';
    content: string;
    time: string;
  }> = [];

  contactInfo = [
    {
      icon: 'mail-send-fill',
      title: '电子邮件',
      content: 'imatupro@example.com', // 示例邮箱，需替换为真实联系邮箱
    },
    {
      icon: 'global-line',
      title: '项目官网',
      content: 'https://github.com/imatupro', // GitHub 组织地址
    },
    {
      icon: 'code-s-slash-line',
      title: '开源仓库',
      content: 'github.com/imatupro/imato', // 项目仓库地址
    },
    {
      icon: 'file-text-line',
      title: '文档中心',
      content: '查看项目 docs 目录获取技术文档',
    },
  ];

  quickQuestions = ['产品功能介绍', '价格方案详情', '技术对接问题', '合作洽谈'];

  botResponses: { [key: string]: string } = {
    产品功能介绍:
      'iMato 是一个智能化教学辅助平台，提供机器人教育课程、虚拟实验室、区块链积分存证等功能。我们的平台采用先进的技术栈，包括 Angular、Flutter、Go 等，为您提供优质的学习和管理体验。',
    价格方案详情:
      '我们提供多种部署方案：\n• 自主部署版：完全免费，适合有技术能力的开发者\n• 云托管版：¥199/月，开箱即用\n• 机构定制版：面议，为学校和教育机构提供定制服务\n\n具体详情请查看我们的价格页面。',
    技术对接问题:
      '我们提供完善的 API 文档和技术支持。您可以通过 GitHub Issues 提交技术问题，我们的技术团队会在 24 小时内响应。同时，我们也提供付费的技术咨询服务。',
    合作洽谈:
      '非常感谢您的合作意向！我们欢迎各类合作，包括但不限于：\n• 教育机构合作\n• 技术合作伙伴\n• 渠道代理商\n\n请您留下联系方式，我们的商务团队会尽快与您联系。',
    default:
      '感谢您的咨询！我已经记录了您的问题，会尽快为您转接人工客服。您也可以留下联系方式，我们会通过邮件或电话回复您。',
  };

  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit = (): void => {};

  sendMessage = (): void => {
    if (!this.messageInput.trim() || this.isSending) {
      return;
    }

    const userMessage = this.messageInput.trim();

    // Add user message
    this.messages.push({
      type: 'user',
      content: userMessage,
      time: this.getCurrentTime(),
    });

    this.messageInput = '';
    this.isSending = true;

    // Simulate bot response
    setTimeout(() => {
      const botResponse = this.getBotResponse(userMessage);
      this.messages.push({
        type: 'bot',
        content: botResponse,
        time: this.getCurrentTime(),
      });
      this.isSending = false;
    }, 1000);
  };

  getBotResponse = (message: string): string => {
    const lowerMessage = message.toLowerCase();

    for (const [keyword, response] of Object.entries(this.botResponses)) {
      if (lowerMessage.includes(keyword.toLowerCase())) {
        return response;
      }
    }

    return this.botResponses['default'];
  };

  askQuestion = (question: string): void => {
    this.messageInput = question;
    this.sendMessage();
  };

  getCurrentTime = (): string => {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  getFormattedContent = (content: string): string => {
    return content.replace(/\n/g, '<br>');
  };

  trackByIndex = (index: number, _item: unknown): number => {
    return index;
  };
}
