import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

import { MarketingLayoutComponent } from '../shared/marketing-layout/marketing-layout.component';

@Component({
  selector: 'app-about-us',
  template: `
    <app-marketing-layout>
      <div class="about-us-page">
        <!-- Hero Section -->
        <section class="hero-section">
          <div class="container">
            <h1 class="hero-title">关于 iMato</h1>
            <p class="hero-subtitle">开源教育技术平台，共建共享知识未来</p>
          </div>
        </section>

        <!-- Project History Timeline -->
        <section class="history-section">
          <div class="container">
            <h2 class="section-title">项目发展历程</h2>
            <div class="timeline">
              <div class="timeline-item" *ngFor="let item of projectHistory; trackBy: trackByIndex">
                <div class="timeline-marker">
                  <span class="marker-year">{{ getYear(item.date) }}</span>
                </div>
                <div class="timeline-content">
                  <div class="timeline-date">{{ item.date }}</div>
                  <h3 class="timeline-event">{{ item.event }}</h3>
                  <p class="timeline-description">{{ item.description }}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Contributors Section -->
        <section class="contributors-section">
          <div class="container">
            <h2 class="section-title">项目贡献者</h2>
            <div class="contributors-grid">
              <mat-card
                class="contributor-card"
                *ngFor="let contributor of contributors; trackBy: trackByIndex"
              >
                <mat-card-content>
                  <div class="contributor-icon">
                    <i class="ri-{{ contributor.icon }}"></i>
                  </div>
                  <h3 class="contributor-name">{{ contributor.name }}</h3>
                  <p class="contributor-role">{{ contributor.role }}</p>
                  <p class="contributor-bio">{{ contributor.bio }}</p>
                  <button mat-stroked-button class="github-btn" (click)="navigateToGitHub()">
                    <i class="ri-global-line" style="margin-right: 8px;"></i>
                    查看 GitHub
                  </button>
                </mat-card-content>
              </mat-card>
            </div>
            <div class="call-to-action">
              <p class="cta-text">欢迎通过 GitHub Issues 和 Pull Requests 参与项目建设</p>
              <button mat-raised-button color="primary" (click)="navigateToGitHub()">
                <i class="ri-github-fill" style="margin-right: 8px;"></i>
                贡献代码
              </button>
            </div>
          </div>
        </section>

        <!-- Values Section -->
        <section class="values-section">
          <div class="container">
            <h2 class="section-title">项目价值观</h2>
            <div class="values-grid">
              <mat-card class="value-card" *ngFor="let value of values; trackBy: trackByIndex">
                <mat-card-content>
                  <div class="value-icon">
                    <i class="ri-{{ value.icon }}"></i>
                  </div>
                  <h3 class="value-title">{{ value.title }}</h3>
                  <p class="value-description">{{ value.description }}</p>
                </mat-card-content>
              </mat-card>
            </div>
          </div>
        </section>

        <!-- License Section -->
        <section class="license-section">
          <div class="container">
            <mat-card class="license-card">
              <mat-card-content>
                <div class="license-header">
                  <i class="ri-file-text-line license-icon"></i>
                  <h3>开源协议</h3>
                </div>
                <p class="license-text">
                  本项目遵循 <strong>GPL-3.0 协议</strong>,代码公开透明，允许自由使用、修改和分发，
                  但衍生作品也必须采用相同的开源协议。
                </p>
              </mat-card-content>
            </mat-card>
          </div>
        </section>
      </div>
    </app-marketing-layout>
  `,
  styleUrls: ['./about-us.component.scss'],
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, MarketingLayoutComponent],
})
export class AboutUsComponent implements OnInit {
  // 项目发展历程 (真实时间线)
  projectHistory = [
    {
      date: '2024-01',
      event: '项目启动',
      description: 'iMato 项目在 GitHub 创建仓库，确定开源教育平台定位',
    },
    {
      date: '2024-03',
      event: '前端架构搭建',
      description: '完成 Angular 17 + Material Design 前端框架建设',
    },
    {
      date: '2024-06',
      event: '后端服务开发',
      description: 'FastAPI 微服务架构落地，实现用户认证、课程管理等核心功能',
    },
    {
      date: '2024-09',
      event: '区块链集成',
      description: '引入 Hyperledger Fabric，开发区块链积分存证系统',
    },
    {
      date: '2024-12',
      event: '3D 虚拟实验室',
      description: '集成 Three.js 和 Vircadia，实现电路组装虚拟实验',
    },
    {
      date: '2025-03',
      event: 'Flutter 移动端',
      description: '启动 Flutter 移动应用开发，支持 AR 基础功能',
    },
    {
      date: 'Now',
      event: '持续迭代',
      description: '社区驱动开发，欢迎通过 GitHub 参与贡献',
    },
  ];

  // 项目贡献者 (替代虚构的团队信息)
  contributors = [
    {
      icon: 'ri-github-fill',
      name: 'iMatuProject',
      role: '项目发起方',
      bio: '开源教育技术项目，遵循 GPL-3.0 协议',
      link: 'https://github.com/imatuproject',
    },
    // 欢迎更多贡献者加入！
    // 通过 GitHub Issues 和 Pull Requests 参与项目建设
  ];

  // 项目价值观 (替代公司介绍)
  values = [
    {
      icon: 'ri-code-s-slash-line',
      title: '开源精神',
      description: '遵循 GPL-3.0 协议，代码公开透明，共建共享',
    },
    {
      icon: 'ri-group-fill',
      title: '社区协作',
      description: '欢迎全球开发者共同参与，多元视角促进创新',
    },
    {
      icon: 'ri-school-line',
      title: '教育使命',
      description: '推动前沿技术在教育领域的普及应用，降低学习门槛',
    },
    {
      icon: 'ri-lightbulb-flash-line',
      title: '技术创新',
      description: '探索 AI、区块链、XR 等技术与教育的深度融合',
    },
  ];

  constructor() {}

  ngOnInit(): void {}

  trackByIndex(index: number, _item: unknown): number {
    return index;
  }

  getYear(dateStr: string): string {
    return dateStr.split('-')[0];
  }

  navigateToGitHub(): void {
    window.open('https://github.com/imatuproject/imato', '_blank');
  }
}
