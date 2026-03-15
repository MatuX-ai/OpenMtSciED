import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

import { MarketingLayoutComponent } from '../shared/marketing-layout/marketing-layout.component';

@Component({
  selector: 'app-education',
  template: `
    <app-marketing-layout>
      <div class="education-page">
        <!-- Hero Section -->
        <section class="hero-section">
          <div class="container">
            <div class="hero-content">
              <h1 class="hero-title">机器人教育课程</h1>
              <p class="hero-subtitle">从入门到精通，系统化的学习路径助你成为机器人专家</p>
            </div>
          </div>
        </section>

        <!-- Course Levels Section -->
        <section class="levels-section">
          <div class="container">
            <h2 class="section-title">课程等级</h2>
            <div class="levels-grid">
              <mat-card
                class="level-card"
                *ngFor="let level of courseLevels; let i = index; trackBy: trackByIndex"
                [class]="'level-' + i"
              >
                <mat-card-header>
                  <div class="level-badge">{{ level.badge }}</div>
                  <i class="ri-{{ level.icon }} feature-icon" mat-card-avatar></i>
                  <mat-card-title>{{ level.title }}</mat-card-title>
                  <mat-card-subtitle>{{ level.subtitle }}</mat-card-subtitle>
                </mat-card-header>
                <mat-card-content>
                  <div class="level-info">
                    <div class="info-item">
                      <i class="ri-time-line info-icon"></i>
                      <span>{{ level.duration }}</span>
                    </div>
                    <div class="info-item">
                      <i class="ri-price-tag-3-line info-icon"></i>
                      <span>{{ level.price }}</span>
                    </div>
                  </div>
                  <ul class="curriculum-list">
                    <li *ngFor="let item of level.curriculum; trackBy: trackByIndex">
                      <i class="ri-check-line check-icon"></i>
                      {{ item }}
                    </li>
                  </ul>
                  <button mat-raised-button color="primary" (click)="enroll(level)">
                    {{ level.buttonText }}
                  </button>
                </mat-card-content>
              </mat-card>
            </div>
          </div>
        </section>

        <!-- Features Section -->
        <section class="features-section">
          <div class="container">
            <h2 class="section-title">教学特色</h2>
            <div class="features-grid">
              <mat-card
                class="feature-card"
                *ngFor="let feature of teachingFeatures; trackBy: trackByIndex"
              >
                <mat-card-header>
                  <i class="ri-{{ feature.icon }} feature-icon" mat-card-avatar></i>
                  <mat-card-title>{{ feature.title }}</mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  <p>{{ feature.description }}</p>
                </mat-card-content>
              </mat-card>
            </div>
          </div>
        </section>

        <!-- Projects Section -->
        <section class="projects-section">
          <div class="container">
            <h2 class="section-title">实战项目展示</h2>
            <div class="projects-grid">
              <mat-card
                class="project-card"
                *ngFor="let project of projects; trackBy: trackByIndex"
              >
                <mat-card-header>
                  <i class="ri-{{ project.icon }} feature-icon" mat-card-avatar></i>
                  <mat-card-title>{{ project.title }}</mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  <p class="project-desc">{{ project.description }}</p>
                  <div class="project-tags">
                    <span class="tag" *ngFor="let tag of project.tags; trackBy: trackByIndex">{{
                      tag
                    }}</span>
                  </div>
                </mat-card-content>
              </mat-card>
            </div>
          </div>
        </section>

        <!-- Testimonials Section - 学员学习成果 -->
        <section class="testimonials-section">
          <div class="container">
            <h2 class="section-title">学员学习成果</h2>
            <div class="testimonials-grid">
              <mat-card
                class="testimonial-card"
                *ngFor="let testimonial of learningOutcomes; trackBy: trackByIndex"
              >
                <mat-card-header>
                  <i class="ri-{{ testimonial.icon }} feature-icon" mat-card-avatar></i>
                  <mat-card-title>{{ testimonial.title }}</mat-card-title>
                  <mat-card-subtitle>{{ testimonial.level }}</mat-card-subtitle>
                </mat-card-header>
                <mat-card-content>
                  <p class="outcome-text">{{ testimonial.description }}</p>
                  <div class="outcome-skills">
                    <span
                      class="skill-tag"
                      *ngFor="let skill of testimonial.skills; trackBy: trackByIndex"
                      >{{ skill }}</span
                    >
                  </div>
                </mat-card-content>
              </mat-card>
            </div>
            <div class="disclaimer-note">
              <i class="ri-information-line note-icon"></i>
              <p>以上为课程学习目标和预期成果，实际学习效果因个人努力程度而异</p>
            </div>
          </div>
        </section>

        <!-- CTA Section -->
        <section class="cta-section">
          <div class="container">
            <h2>准备好开始学习了吗？</h2>
            <p>立即注册，开启您的机器人学习之旅</p>
            <button mat-raised-button color="accent" (click)="navigateTo('/marketing/contact')">
              免费咨询
            </button>
          </div>
        </section>
      </div>
    </app-marketing-layout>
  `,
  styleUrls: ['./education.component.scss'],
  imports: [CommonModule, MatCardModule, MatIconModule, MarketingLayoutComponent],
})
export class EducationComponent implements OnInit {
  courseLevels = [
    {
      badge: '初学者',
      icon: 'ri-book-open-fill',
      title: '基础入门课程',
      subtitle: '零基础友好，循序渐进',
      duration: '8 周 | 每周 4 小时',
      price: '免费',
      curriculum: [
        '机器人发展历史与基础知识',
        '图形化编程 Scratch 入门',
        '简单机械结构与传动原理',
        '基础传感器应用',
        '第一个机器人项目：避障小车',
      ],
      buttonText: '免费开始',
    },
    {
      badge: '进阶',
      icon: 'ri-code-s-slash-line',
      title: '进阶提升课程',
      subtitle: '掌握核心技能',
      duration: '12 周 | 每周 6 小时',
      price: '¥1,299',
      curriculum: [
        'Python/C++ 编程语言基础',
        'Arduino/ 树莓派开发',
        '电机控制与运动学基础',
        '多种传感器融合应用',
        '综合项目：智能机械臂',
        '参加省级机器人竞赛培训',
      ],
      buttonText: '立即报名',
    },
    {
      badge: '高级',
      icon: 'ri-rocket-2-fill',
      title: '高级专家课程',
      subtitle: '探索前沿技术',
      duration: '16 周 | 每周 8 小时',
      price: '¥2,999',
      curriculum: [
        'ROS 机器人操作系统',
        '计算机视觉与 OpenCV',
        '机器学习在机器人中的应用',
        'SLAM 导航与定位技术',
        '人形机器人设计与控制',
        '国家级竞赛项目指导',
        '企业认证证书',
      ],
      buttonText: '咨询报名',
    },
  ];

  teachingFeatures = [
    {
      icon: 'ri-movie-line',
      title: '视频教学',
      description: '高清视频教程，支持反复观看学习',
    },
    {
      icon: 'ri-computer-line',
      title: '在线实验',
      description: '虚拟仿真实验环境，安全实践操作',
    },
    {
      icon: 'ri-chat-3-line',
      title: '社区答疑',
      description: '专业导师在线解答，学习不迷路',
    },
    {
      icon: 'ri-projector-line',
      title: '项目实战',
      description: '真实项目驱动学习，积累作品集',
    },
    {
      icon: 'ri-trophy-fill',
      title: '竞赛辅导',
      description: '专业教练指导，冲击机器人大赛奖项',
    },
    {
      icon: 'ri-medal-fill',
      title: '权威认证',
      description: '完成课程获得行业认可的专业证书',
    },
  ];

  projects = [
    {
      icon: 'ri-car-fill',
      title: '智能避障小车',
      description: '学习超声波传感器和电机控制，制作能够自动避开障碍物的智能小车',
      tags: ['Arduino', '传感器', '基础'],
    },
    {
      icon: 'ri-robot-2',
      title: '六足机器人',
      description: '掌握多足机器人的运动学和步态规划，实现复杂地形行走',
      tags: ['树莓派', '运动控制', '进阶'],
    },
    {
      icon: 'ri-armchair-line',
      title: 'AI 视觉分拣机器人',
      description: '结合计算机视觉和机械臂控制，实现物体的识别和自动分拣',
      tags: ['OpenCV', '机械臂', '高级'],
    },
    {
      icon: 'ri-map-pin-2-line',
      title: '自主导航机器人',
      description: '应用 SLAM 技术，实现机器人的室内自主导航和路径规划',
      tags: ['ROS', 'SLAM', '高级'],
    },
    {
      icon: 'ri-home-wifi-line',
      title: '智能家居系统',
      description: '基于物联网技术，实现家庭设备的智能控制和远程监控，包括灯光、温湿度、安防等',
      tags: ['IoT', 'ESP32', '中级'],
    },
    {
      icon: 'ri-plant-fill',
      title: '智慧温室监控',
      description: '设计农业温室环境监控系统，实时监测土壤湿度、光照、温度等参数，实现自动灌溉',
      tags: ['传感器', '自动化', '中级'],
    },
  ];

  // 学习目标与预期成果（非真实用户评价）
  learningOutcomes = [
    {
      icon: 'ri-lightbulb-flash-line',
      title: '基础入门学员',
      level: '完成基础课程后',
      description:
        '能够独立完成简单的机器人组装和图形化编程，理解传感器基本原理，制作出能够自动避障的智能小车',
      skills: ['Arduino 基础', '传感器应用', '图形化编程'],
    },
    {
      icon: 'ri-line-chart-line',
      title: '进阶提升学员',
      level: '完成进阶课程后',
      description:
        '掌握 Python/C++ 编程语言，能够使用 Arduino/ 树莓派进行开发，完成智能机械臂等综合项目',
      skills: ['Python/C++', '运动控制', '项目实战'],
    },
    {
      icon: 'ri-star-smile-fill',
      title: '高级专科学员',
      level: '完成高级课程后',
      description:
        '熟悉 ROS 操作系统和计算机视觉技术，能够设计自主导航机器人，具备参加机器人大赛的能力',
      skills: ['ROS', 'SLAM', '计算机视觉'],
    },
  ];

  constructor(
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {}

  navigateTo = (path: string): void => {
    void this.router.navigateByUrl(path);
  };

  enroll = (level: { price: string; title: string }): void => {
    if (level.price === '免费') {
      void this.router.navigateByUrl('/marketing/education');
    } else {
      this.snackBar.open(`感谢您对${level.title}的兴趣，我们的课程顾问将尽快联系您`, '关闭', {
        duration: 5000,
      });
      void this.router.navigateByUrl('/marketing/contact');
    }
  };

  trackByIndex = (index: number, _item: unknown): number => {
    return index;
  };
}
