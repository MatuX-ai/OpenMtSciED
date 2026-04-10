import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { MarketingNavComponent } from '../shared/marketing-nav/marketing-nav.component';

@Component({
  selector: 'app-feature-ai-path',
  standalone: true,
  imports: [CommonModule, RouterLink, MarketingNavComponent],
  template: `
    <app-marketing-nav></app-marketing-nav>

    <section class="hero">
      <h1>🤖 AI 自适应路径</h1>
      <p>PPO 强化学习 + MiniCPM 虚拟导师，千人千面的个性化学习体验</p>
    </section>

    <div class="content">
      <a routerLink="/" class="back-link">← 返回首页</a>

      <div class="section">
        <h2>核心指标</h2>
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-number">&lt;500ms</div>
            <div class="stat-label">AI 响应延迟</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">PPO</div>
            <div class="stat-label">强化学习算法</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">2B</div>
            <div class="stat-label">MiniCPM 参数量</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">30%</div>
            <div class="stat-label">学习时长缩短</div>
          </div>
        </div>
      </div>

      <div class="section">
        <h2>工作流程</h2>
        <div class="workflow">
          <div class="workflow-step">
            <div class="step-icon">📊</div>
            <div>
              <h3>1. 用户画像分析</h3>
              <p>通过测试题评估知识水平，建立学段、学科偏好、学习速度画像</p>
            </div>
          </div>
          <div class="workflow-step">
            <div class="step-icon">🎯</div>
            <div>
              <h3>2. 起点选择</h3>
              <p>基于用户画像从课程库选择兴趣单元，如"电磁感应现象"</p>
            </div>
          </div>
          <div class="workflow-step">
            <div class="step-icon">🔗</div>
            <div>
              <h3>3. 路径生成</h3>
              <p>PPO 算法基于知识图谱生成个性化路径，串联课程库→过渡项目→课件库→硬件项目</p>
            </div>
          </div>
          <div class="workflow-step">
            <div class="step-icon">📈</div>
            <div>
              <h3>4. 动态调整</h3>
              <p>根据练习正确率、项目完成度实时调整路径难度，优先推荐高完成度分支</p>
            </div>
          </div>
        </div>
      </div>

      <div class="section">
        <h2>技术栈</h2>
        <ul class="tech-list">
          <li><strong>Stable Baselines3</strong> - PPO 强化学习框架</li>
          <li><strong>Gymnasium</strong> - 强化学习环境</li>
          <li><strong>MiniCPM-2B</strong> - 知识点解释 AI 模型</li>
          <li><strong>CodeLlama</strong> - Blockly 代码生成</li>
          <li><strong>FastAPI</strong> - AI 推理服务接口</li>
        </ul>
      </div>

      <div class="section">
        <h2>相关文档</h2>
        <ul class="tech-list">
          <li><a href="https://github.com/iMato/OpenMTSciEd/blob/main/README.md" target="_blank" style="color: #8b5cf6;">项目 README</a></li>
          <li><a href="https://github.com/iMato/OpenMTSciEd/blob/main/docs/ARCHITECTURE.md" target="_blank" style="color: #8b5cf6;">系统架构说明</a></li>
          <li><a href="https://github.com/iMato/OpenMTSciEd/blob/main/docs/INSTALLATION.md" target="_blank" style="color: #8b5cf6;">安装部署指南</a></li>
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
      border-bottom: 1px solid rgba(139, 92, 246, 0.2);
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
      background: linear-gradient(135deg, #8b5cf6, #a78bfa);
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
      background: linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(244, 114, 182, 0.1));
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
      color: #8b5cf6;
      border-left: 4px solid #8b5cf6;
      padding-left: 1rem;
    }

    .section h3 {
      font-size: 1.5rem;
      margin: 2rem 0 1rem;
      color: #f8fafc;
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
      border: 1px solid rgba(139, 92, 246, 0.1);
    }

    .stat-number {
      font-size: 2.5rem;
      font-weight: bold;
      color: #8b5cf6;
    }

    .stat-label {
      color: #94a3b8;
      margin-top: 0.5rem;
    }

    .workflow {
      background: #1e293b;
      border-radius: 12px;
      padding: 2rem;
      margin: 2rem 0;
      border: 1px solid rgba(139, 92, 246, 0.2);
    }

    .workflow-step {
      display: flex;
      align-items: center;
      gap: 1.5rem;
      margin: 1.5rem 0;
      padding: 1.5rem;
      background: rgba(139, 92, 246, 0.05);
      border-radius: 8px;
      border-left: 3px solid #8b5cf6;
    }

    .step-icon {
      font-size: 2rem;
      flex-shrink: 0;
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
      content: "🤖";
      position: absolute;
      left: 0;
    }

    .back-link {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      color: #8b5cf6;
      text-decoration: none;
      margin-bottom: 2rem;
      padding: 0.8rem 1.5rem;
      background: #1e293b;
      border-radius: 8px;
      border: 1px solid rgba(139, 92, 246, 0.2);
      transition: all 0.3s;
    }

    .back-link:hover {
      transform: translateX(-5px);
      border-color: #8b5cf6;
    }

    .footer {
      background: #1e293b;
      padding: 3rem 2rem;
      text-align: center;
      border-top: 1px solid rgba(139, 92, 246, 0.2);
      margin-top: 4rem;
    }

    .footer p {
      color: #94a3b8;
      margin: 0.5rem 0;
    }

    .footer-links a {
      color: #8b5cf6;
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
export class FeatureAiPathComponent {}
