import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="hero-section">
      <h1>OpenMTSciEd</h1>
      <p>用开源 AI 打通 STEM 学段壁垒，全球共建“STEM 知识地图”</p>
      <div class="cta-buttons">
        <button class="btn-primary" (click)="scrollTo('features')">快速开始</button>
        <button class="btn-secondary" (click)="openGitHub()">贡献代码</button>
      </div>
    </div>

    <div id="features" class="features-section">
      <h2>核心特性</h2>
      <div class="feature-grid">
        <div class="feature-card" *ngFor="let feature of features">
          <h3>{{ feature.title }}</h3>
          <p>{{ feature.desc }}</p>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .hero-section {
        text-align: center;
        padding: 100px 20px;
        background: #f5f7fa;
      }
      .cta-buttons {
        margin-top: 30px;
      }
      button {
        padding: 12px 24px;
        margin: 0 10px;
        border-radius: 6px;
        cursor: pointer;
        border: none;
        font-size: 16px;
      }
      .btn-primary {
        background: #007bff;
        color: white;
      }
      .btn-secondary {
        background: #6c757d;
        color: white;
      }
      .features-section {
        padding: 60px 20px;
      }
      .feature-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 20px;
        max-width: 1200px;
        margin: 0 auto;
      }
      .feature-card {
        padding: 20px;
        border: 1px solid #eee;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
      }
    `,
  ],
})
export class HomeComponent {
  features = [
    { title: '🕸️ 知识图谱驱动', desc: '跨库关联，逻辑清晰' },
    { title: '🤖 AI 自适应路径', desc: 'PPO 算法，千人千面' },
    { title: '🔌 硬件联动', desc: '≤50元预算，WebUSB 一键烧录' },
    { title: '📚 连贯学习路径', desc: '从小学启蒙到大学专业衔接' },
  ];

  scrollTo(id: string): void {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  }

  openGitHub(): void {
    window.open('https://github.com/iMato/OpenMTSciEd', '_blank');
  }
}
