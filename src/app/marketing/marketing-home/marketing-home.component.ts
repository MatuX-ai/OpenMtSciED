import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostBinding, OnDestroy, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

import { MarketingLayoutComponent } from '../shared/marketing-layout/marketing-layout.component';

/**
 * 滚动渐入动效指令
 * 当元素进入可视区域时，添加 animate-in 类实现渐入效果
 * 基于 Intersection Observer API，无需监听滚动事件，性能更优
 */
@Component({
  selector: '[appScrollAnimate]',
  standalone: true,
  template: '<ng-content></ng-content>',
})
class ScrollAnimateDirective implements OnInit, OnDestroy {
  /**
   * 初始状态：隐藏（透明度 0，向下偏移 20px）
   * 通过 CSS 类控制，指令只负责添加 animate-in 类
   */
  @HostBinding('class.scroll-animate') scrollAnimateClass = true;

  private observer: IntersectionObserver | null = null;

  constructor(private elementRef: ElementRef) {}

  ngOnInit(): void {
    // 创建 Intersection Observer 实例
    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          // 当元素进入可视区域（交叉比例大于 0）时
          if (entry.isIntersecting) {
            // 添加 animate-in 类，触发动画
            entry.target.classList.add('animate-in');
            // 动画完成后停止观察该元素（一次性动画）
            this.observer?.unobserve(entry.target);
          }
        });
      },
      {
        // 视口可见性阈值：0 表示完全不可见，1 表示完全可见
        // 设置为 0.1 表示元素显示 10% 时触发
        threshold: 0.1,
        // 根元素边界偏移：负值延迟触发，正值提前触发
        // 这里设置 -50px，让元素进入视口 50px 后再触发
        rootMargin: '-50px',
      }
    );

    // 开始观察当前元素
    if (this.observer) {
      this.observer.observe(this.elementRef.nativeElement as Element);
    }
  }

  ngOnDestroy(): void {
    // 组件销毁时清理观察者，防止内存泄漏
    this.observer?.disconnect();
  }
}

@Component({
  selector: 'app-marketing-home',
  template: `
    <app-marketing-layout>
      <!-- Hero Section -->
      <section class="hero-section" appScrollAnimate>
        <div class="container">
          <div class="hero-content-wrapper">
            <div class="hero-content">
              <h1 class="hero-title">MatuX 机器人世界</h1>
              <p class="hero-subtitle">
                欢迎来到机器人的世界！<br />
                <span class="subtitle-secondary">
                  GPL-3.0 开源协议 · 融合 AI、区块链、XR 技术 · 共建共享未来教育
                </span>
              </p>
              <div class="hero-actions">
                <button
                  mat-raised-button
                  color="primary"
                  (click)="navigateToGitHub()"
                  aria-label="访问 MatuX GitHub 仓库"
                >
                  <i class="ri-github-fill" style="margin-right: 8px;" aria-hidden="true"></i>
                  访问 GitHub
                </button>
                <button
                  mat-stroked-button
                  color="primary"
                  (click)="navigateTo('/marketing/product')"
                  aria-label="了解 MatuX 产品特性"
                >
                  了解产品
                </button>
              </div>
            </div>
            <div class="hero-image">
              <img
                src="assets/branding/robot-mascot.png"
                alt="MatuX 机器人吉祥物"
                class="robot-image"
              />
            </div>
          </div>
        </div>
      </section>

      <!-- Education Section -->
      <section class="education-section" appScrollAnimate aria-labelledby="education-heading">
        <div class="container">
          <h2 id="education-heading" class="section-title">为什么选择 iMato？</h2>
          <div class="features-grid">
            <mat-card
              class="feature-card"
              *ngFor="let benefit of educationBenefits; trackBy: trackByIndex"
            >
              <mat-card-header>
                <i class="{{ benefit.icon }} feature-icon" mat-card-avatar aria-hidden="true"></i>
                <mat-card-title>{{ benefit.title }}</mat-card-title>
              </mat-card-header>
              <mat-card-content>
                <p>{{ benefit.description }}</p>
              </mat-card-content>
            </mat-card>
          </div>
        </div>
      </section>

      <!-- Learning Paths Section -->
      <section class="paths-section" appScrollAnimate aria-labelledby="paths-heading">
        <div class="container">
          <h2 id="paths-heading" class="section-title">学习路径</h2>
          <div class="paths-grid">
            <mat-card
              class="path-card"
              *ngFor="let path of learningPaths; let i = index; trackBy: trackByIndex"
              [class]="'path-' + i"
            >
              <mat-card-header>
                <i class="{{ path.icon }} feature-icon" mat-card-avatar aria-hidden="true"></i>
                <mat-card-title>{{ path.title }}</mat-card-title>
                <mat-card-subtitle>{{ path.subtitle }}</mat-card-subtitle>
              </mat-card-header>
              <mat-card-content>
                <ul class="path-features">
                  <li *ngFor="let feature of path.features">
                    <i [class]="'ri-check-line check-icon ' + feature.icon" aria-hidden="true"></i>
                    {{ feature.text }}
                  </li>
                </ul>
                <button
                  mat-raised-button
                  color="primary"
                  (click)="navigateTo(path.route)"
                  [attr.aria-label]="'开始学习路径：' + path.title"
                >
                  {{ path.buttonText }}
                </button>
              </mat-card-content>
            </mat-card>
          </div>
        </div>
      </section>

      <!-- Features Overview -->
      <section class="features-section" appScrollAnimate aria-labelledby="features-heading">
        <div class="container">
          <h2 id="features-heading" class="section-title">平台核心功能</h2>
          <div class="features-grid">
            <mat-card class="feature-card" *ngFor="let feature of features; trackBy: trackByIndex">
              <mat-card-header>
                <i class="{{ feature.icon }} feature-icon" mat-card-avatar aria-hidden="true"></i>
                <mat-card-title>{{ feature.title }}</mat-card-title>
              </mat-card-header>
              <mat-card-content>
                <p>{{ feature.description }}</p>
              </mat-card-content>
            </mat-card>
          </div>
        </div>
      </section>

      <!-- CTA Section -->
      <section class="cta-section" appScrollAnimate aria-labelledby="cta-heading">
        <div class="container">
          <h2 id="cta-heading" class="section-title">准备好开启机器人之旅了吗？</h2>
          <p>加入我们，与成千上万的学习者一起探索未来科技</p>
          <button
            mat-raised-button
            color="primary"
            (click)="navigateTo('/marketing/contact')"
            aria-label="立即开始，开启机器人学习之旅"
          >
            立即开始
          </button>
        </div>
      </section>
    </app-marketing-layout>
  `,
  styleUrls: ['./marketing-home.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MarketingLayoutComponent,
    ScrollAnimateDirective,
  ],
})
export class MarketingHomeComponent implements OnInit {
  educationBenefits = [
    {
      icon: 'ri-brain-line',
      title: 'AI 赋能教学',
      description: '智能化教学辅助，个性化学习路径推荐，让每个学习者都能获得专属指导',
    },
    {
      icon: 'ri-box-3-line',
      title: '虚实结合',
      description: '3D 虚拟实验室与真实硬件操作相结合，低成本高效果的实践教学体验',
    },
    {
      icon: 'ri-wallet-3-fill',
      title: '可信认证',
      description: '区块链存证学习成果，积分记录公开透明可追溯，助力升学就业',
    },
    {
      icon: 'ri-code-s-slash-line',
      title: '开源开放',
      description: 'GPL-3.0 开源协议，代码完全开放，可自由定制和二次开发',
    },
    {
      icon: 'ri-group-fill',
      title: '全球社区',
      description: '汇聚全球开发者与教育者，持续贡献优质内容，共建共享教育资源',
    },
    {
      icon: 'ri-school-line',
      title: '教育公平',
      description: '打破地域和经济壁垒，让偏远地区也能享受高质量的机器人教育',
    },
  ];

  learningPaths = [
    {
      icon: 'ri-book-open-fill',
      title: '入门基础',
      subtitle: '零基础起步，循序渐进',
      features: [
        { text: '机器人基础知识', icon: 'ri-robot-line' },
        { text: '图形化编程入门', icon: 'ri-palette-line' },
        { text: '简单机械结构', icon: 'ri-settings-3-line' },
        { text: '趣味项目实践', icon: 'ri-lightbulb-line' },
      ],
      route: '/marketing/education',
      buttonText: '开始入门',
    },
    {
      icon: 'ri-code-s-slash-line',
      title: '进阶提升',
      subtitle: '深入学习，掌握核心技能',
      features: [
        { text: 'Python/C++ 编程', icon: 'ri-code-s-slash-line' },
        { text: '传感器应用', icon: 'ri-wifi-line' },
        { text: '自动控制原理', icon: 'ri-focus-3-line' },
        { text: '综合项目开发', icon: 'ri-projector-line' },
      ],
      route: '/marketing/education',
      buttonText: '查看详情',
    },
    {
      icon: 'ri-rocket-2-fill',
      title: '高级挑战',
      subtitle: '探索前沿，创新突破',
      features: [
        { text: 'AI 视觉识别', icon: 'ri-eye-2-line' },
        { text: '机器学习应用', icon: 'ri-brain-line' },
        { text: 'ROS 机器人系统', icon: 'ri-cpu-line' },
        { text: '创新竞赛项目', icon: 'ri-trophy-line' },
      ],
      route: '/marketing/education',
      buttonText: '迎接挑战',
    },
  ];

  features = [
    {
      icon: 'ri-line-chart-line',
      title: '学习数据分析',
      description: '多维度采集学习行为数据，可视化呈现知识掌握情况，为教学决策提供支持',
    },
    {
      icon: 'ri-apps-line',
      title: '3D 虚拟实验室',
      description: '基于 Three.js 和 Vircadia 的 3D 交互式实验环境，支持电路组装练习',
    },
    {
      icon: 'ri-wallet-3-fill',
      title: '区块链积分存证',
      description: '基于 Hyperledger Fabric 的学习成果存证系统，保障积分记录公开透明',
    },
    {
      icon: 'ri-school-line',
      title: '智能化教学辅助',
      description: '基于学习数据分析，提供个性化资源推荐与学习路径规划 (开发中)',
    },
    {
      icon: 'ri-device-fill',
      title: 'Flutter 移动端',
      description: '支持 AR 基础功能的移动应用，便捷访问学习资源 (开发中)',
    },
    {
      icon: 'ri-trophy-fill',
      title: '成就与激励',
      description: '游戏化学习体验，积分奖励、连击加成、成就追踪',
    },
    {
      icon: 'ri-group-fill',
      title: '开源社区',
      description: '与全球开发者交流分享，共同参与项目建设',
    },
    {
      icon: 'ri-shield-keyhole-fill',
      title: '安全保障',
      description: 'JWT 认证、RBAC 权限管理、数据加密传输',
    },
    {
      icon: 'ri-server-line',
      title: '容器化部署',
      description: '基于 Docker 的容器化部署方案，支持 Docker Compose 一键启动',
    },
  ];

  constructor(
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {}

  navigateTo(path: string): void {
    void this.router.navigateByUrl(path);
  }

  navigateToGitHub(): void {
    window.open('https://github.com/imatuproject/imato', '_blank');
  }

  trackByIndex(index: number, _item: unknown): number {
    return index;
  }
}
