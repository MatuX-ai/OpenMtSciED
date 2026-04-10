import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { MarketingNavComponent } from '../shared/marketing-nav/marketing-nav.component';

@Component({
  selector: 'app-feature-hardware',
  standalone: true,
  imports: [CommonModule, RouterLink, MarketingNavComponent],
  template: `
    <app-marketing-nav></app-marketing-nav>

    <section class="hero">
      <h1>🔌 低成本硬件联动</h1>
      <p>预算 ≤50元，WebUSB 一键烧录，让 STEM 教育触手可及</p>
    </section>

    <div class="content">
      <a routerLink="/" class="back-link">← 返回首页</a>

      <div class="section">
        <h2>核心优势</h2>
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-number">≤¥50</div>
            <div class="stat-label">项目预算上限</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">WebUSB</div>
            <div class="stat-label">手机直连烧录</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">95%</div>
            <div class="stat-label">Blockly 代码正确率</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">70%</div>
            <div class="stat-label">硬件项目完成率</div>
          </div>
        </div>
      </div>

      <div class="section">
        <h2>项目案例</h2>
        <div class="hardware-grid">
          <div class="hardware-card">
            <div class="hardware-icon">🌡️</div>
            <h3>智能气象站</h3>
            <div class="cost">¥35</div>
            <ul class="component-list">
              <li>ESP32 开发板 (¥15)</li>
              <li>DHT11 温湿度传感器 (¥5)</li>
              <li>BMP280 气压传感器 (¥8)</li>
              <li>面包板 + 杜邦线 (¥7)</li>
            </ul>
          </div>
          <div class="hardware-card">
            <div class="hardware-icon">💡</div>
            <h3>光合作用模拟器</h3>
            <div class="cost">¥42</div>
            <ul class="component-list">
              <li>Arduino Nano (¥12)</li>
              <li>光敏电阻模块 (¥3)</li>
              <li>RGB LED 灯 (¥5)</li>
              <li>OLED 显示屏 (¥15)</li>
              <li>其他配件 (¥7)</li>
            </ul>
          </div>
          <div class="hardware-card">
            <div class="hardware-icon">🤖</div>
            <h3>智能避障小车</h3>
            <div class="cost">¥48</div>
            <ul class="component-list">
              <li>Arduino Uno (¥18)</li>
              <li>HC-SR04 超声波传感器 (¥6)</li>
              <li>SG90 舵机 (¥5)</li>
              <li>小车底盘 + 电机 (¥12)</li>
              <li>电池盒 + 开关 (¥7)</li>
            </ul>
          </div>
        </div>
      </div>

      <div class="section">
        <h2>技术栈</h2>
        <ul class="tech-list">
          <li><strong>Arduino / ESP32</strong> - 主流开源硬件平台</li>
          <li><strong>WebUSB API</strong> - 浏览器直连烧录</li>
          <li><strong>Blockly</strong> - 图形化编程编辑器</li>
          <li><strong>Python Serial</strong> - 串口通信后端</li>
          <li><strong>Supabase</strong> - 项目数据存储</li>
        </ul>
      </div>

      <div class="section">
        <h2>相关文档</h2>
        <ul class="tech-list">
          <li><a href="https://github.com/iMato/OpenMTSciEd/blob/main/docs/DATA_ACQUISITION_GUIDE.md" target="_blank" style="color: #f59e0b;">硬件材料价格数据库</a></li>
          <li><a href="https://github.com/iMato/OpenMTSciEd/blob/main/README.md" target="_blank" style="color: #f59e0b;">项目 README</a></li>
          <li><a href="https://github.com/iMato/OpenMTSciEd/blob/main/docs/ARCHITECTURE.md" target="_blank" style="color: #f59e0b;">系统架构说明</a></li>
        </ul>
      </div>
    </div>

    <footer class="footer">
      <p><strong>OpenMTSciEd</strong> - Open MatuX Science Education</p>
      <p class="footer-links">
        <a href="https://github.com/iMato/OpenMTSciEd" target="_blank">GitHub</a> ·
        <a href="mailto:contact@imato.edu">联系我们</a> ·
        MIT License
      </p>
    </footer>
  `,
  styles: [`
    :host {
      display: block;
      font-family: 'Segoe UI', system-ui, sans-serif;
      background: #0f172a;
      color: #f8fafc;
      line-height: 1.8;
    }

    .navbar {
      background: rgba(15, 23, 42, 0.95);
      backdrop-filter: blur(10px);
      padding: 1rem 2rem;
      position: fixed;
      width: 100%;
      top: 0;
      z-index: 1000;
      border-bottom: 1px solid rgba(245, 158, 11, 0.2);
    }

    .nav-content {
      max-width: 1200px;
      margin: 0 auto;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .logo {
      font-size: 1.5rem;
      font-weight: 700;
      background: linear-gradient(135deg, #f59e0b, #fbbf24);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      text-decoration: none;
    }

    .nav-links {
      display: flex;
      gap: 2rem;
      list-style: none;
      margin: 0;
      padding: 0;
    }

    .nav-links a {
      color: #94a3b8;
      text-decoration: none;
      transition: color 0.3s;
    }

    .nav-links a:hover {
      color: #f8fafc;
    }

    .hero {
      padding: 8rem 2rem 4rem;
      background: linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(16, 185, 129, 0.1));
      text-align: center;
    }

    .hero h1 {
      font-size: 3rem;
      margin-bottom: 1rem;
    }

    .hero p {
      font-size: 1.3rem;
      color: #94a3b8;
      max-width: 800px;
      margin: 0 auto;
    }

    .content {
      max-width: 1200px;
      margin: 0 auto;
      padding: 4rem 2rem;
    }

    .section {
      margin-bottom: 4rem;
    }

    .section h2 {
      font-size: 2rem;
      margin-bottom: 1.5rem;
      color: #f59e0b;
      border-left: 4px solid #f59e0b;
      padding-left: 1rem;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1.5rem;
      margin: 2rem 0;
    }

    .stat-card {
      background: #1e293b;
      padding: 1.5rem;
      border-radius: 12px;
      text-align: center;
      border: 1px solid rgba(245, 158, 11, 0.1);
    }

    .stat-number {
      font-size: 2.5rem;
      font-weight: bold;
      color: #f59e0b;
    }

    .stat-label {
      color: #94a3b8;
      margin-top: 0.5rem;
    }

    .hardware-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 2rem;
      margin: 2rem 0;
    }

    .hardware-card {
      background: #1e293b;
      border-radius: 16px;
      padding: 2rem;
      border: 1px solid rgba(245, 158, 11, 0.1);
      transition: all 0.3s;
    }

    .hardware-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 15px 35px rgba(0, 0, 0, 0.3);
      border-color: rgba(245, 158, 11, 0.3);
    }

    .hardware-icon {
      font-size: 3rem;
      margin-bottom: 1rem;
    }

    .hardware-card h3 {
      font-size: 1.3rem;
      margin-bottom: 0.5rem;
    }

    .cost {
      color: #10b981;
      font-size: 2rem;
      font-weight: bold;
      margin: 1rem 0;
    }

    .component-list {
      list-style: none;
      padding: 0;
      color: #94a3b8;
    }

    .component-list li {
      padding: 0.5rem 0;
      padding-left: 1.5rem;
      position: relative;
    }

    .component-list li::before {
      content: "•";
      position: absolute;
      left: 0;
      color: #f59e0b;
    }

    .tech-list {
      list-style: none;
      padding: 0;
    }

    .tech-list li {
      padding: 0.8rem 0;
      padding-left: 2rem;
      position: relative;
      color: #94a3b8;
    }

    .tech-list li::before {
      content: "🔧";
      position: absolute;
      left: 0;
    }

    .back-link {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      color: #f59e0b;
      text-decoration: none;
      margin-bottom: 2rem;
      padding: 0.8rem 1.5rem;
      background: #1e293b;
      border-radius: 8px;
      border: 1px solid rgba(245, 158, 11, 0.2);
      transition: all 0.3s;
    }

    .back-link:hover {
      transform: translateX(-5px);
      border-color: #f59e0b;
    }

    .footer {
      background: #1e293b;
      padding: 3rem 2rem;
      text-align: center;
      border-top: 1px solid rgba(245, 158, 11, 0.2);
      margin-top: 4rem;
    }

    .footer p {
      color: #94a3b8;
      margin: 0.5rem 0;
    }

    .footer-links a {
      color: #f59e0b;
      text-decoration: none;
    }

    .footer-links a:hover {
      text-decoration: underline;
    }

    @media (max-width: 768px) {
      .hero h1 { font-size: 2rem; }
      .nav-links { display: none; }
    }
  `]
})
export class FeatureHardwareComponent {}
