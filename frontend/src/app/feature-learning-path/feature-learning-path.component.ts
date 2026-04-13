import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { MarketingNavComponent } from '../shared/marketing-nav/marketing-nav.component';

@Component({
  selector: 'app-feature-learning-path',
  standalone: true,
  imports: [CommonModule, RouterLink, MarketingNavComponent],
  template: `
    <app-marketing-nav></app-marketing-nav>

    <section class="hero">
      <h1>📚 连贯学习路径</h1>
      <p>小学兴趣启蒙 → 初中跨学科实践 → 高中深度探究 → 大学专业衔接</p>
    </section>

    <div class="content">
      <a routerLink="/" class="back-link">← 返回首页</a>

      <div class="section">
        <h2>路径设计原则</h2>
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-number">4</div>
            <div class="stat-label">学段覆盖</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">100%</div>
            <div class="stat-label">课程库映射率</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">30%</div>
            <div class="stat-label">学习时长缩短</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">70%</div>
            <div class="stat-label">硬件项目完成率</div>
          </div>
        </div>
      </div>

      <div class="section">
        <h2>完整学习路径</h2>
        <div class="path-timeline">
          <div class="timeline-item">
            <div class="timeline-content">
              <span class="phase">小学 · 兴趣启蒙</span>
              <h3>🔬 现象驱动单元</h3>
              <p><strong>OpenSciEd 课程库</strong></p>
              <ul class="tech-list">
                <li>6周完成一个现象探究项目</li>
                <li>如"生态系统能量流动"实验</li>
                <li>配套教师/学生手册</li>
                <li>低成本实验材料清单</li>
              </ul>
            </div>
            <div class="timeline-dot"></div>
          </div>

          <div class="timeline-item">
            <div class="timeline-content">
              <span class="phase">初中 · 跨学科实践</span>
              <h3>💻 Blockly 过渡项目</h3>
              <p><strong>图形化编程模拟</strong></p>
              <ul class="tech-list">
                <li>用变量模拟物理公式</li>
                <li>可视化理解抽象概念</li>
                <li>如欧姆定律推导模拟</li>
                <li>无需代码基础即可上手</li>
              </ul>
            </div>
            <div class="timeline-dot"></div>
          </div>

          <div class="timeline-item">
            <div class="timeline-content">
              <span class="phase">高中 · 深度探究</span>
              <h3>📖 课件库理论学习</h3>
              <p><strong>OpenStax 大学/高中教材</strong></p>
              <ul class="tech-list">
                <li>大学物理/化学/生物预习</li>
                <li>掌握微积分推导</li>
                <li>化学方程式理解</li>
                <li>典型习题练习</li>
              </ul>
            </div>
            <div class="timeline-dot"></div>
          </div>

          <div class="timeline-item">
            <div class="timeline-content">
              <span class="phase">大学 · 专业衔接</span>
              <h3>🔧 硬件综合项目</h3>
              <p><strong>跨学科应用实践</strong></p>
              <ul class="tech-list">
                <li>Arduino/ESP32 实现气象站</li>
                <li>整合物理传感器原理</li>
                <li>编程数据处理</li>
                <li>工程结构设计</li>
              </ul>
            </div>
            <div class="timeline-dot"></div>
          </div>
        </div>
      </div>

      <div class="section">
        <h2>里程碑设计</h2>
        <ul class="tech-list">
          <li><strong>完成1个课程库单元</strong> → 解锁1个课件库章节预习模块</li>
          <li><strong>完成1个课件库章节</strong> → 生成1个硬件综合项目</li>
          <li><strong>完成硬件项目</strong> → 获得作品认证 + 解锁下一路径</li>
          <li><strong>闯关式激励</strong> → 积分系统 + 成就徽章</li>
        </ul>
      </div>

      <div class="section">
        <h2>技术栈</h2>
        <ul class="tech-list">
          <li><strong>Neo4j 图数据库</strong> - 知识图谱存储与查询</li>
          <li><strong>PPO 强化学习</strong> - 路径推荐算法</li>
          <li><strong>FastAPI</strong> - 路径生成 API 服务</li>
          <li><strong>ECharts</strong> - 路径可视化展示</li>
          <li><strong>PostgreSQL</strong> - 用户进度存储</li>
        </ul>
      </div>

      <div class="section">
        <h2>相关文档</h2>
        <ul class="tech-list">
          <li><a routerLink="/feature/knowledge-graph" style="color: #06b6d4;">知识图谱驱动</a></li>
          <li><a routerLink="/feature/ai-path" style="color: #06b6d4;">AI 自适应路径</a></li>
          <li>
            <a
              href="https://github.com/iMato/OpenMTSciEd/blob/main/docs/neo4j_schema_design.md"
              target="_blank"
              style="color: #06b6d4;"
              >Neo4j Schema 设计</a
            >
          </li>
        </ul>
      </div>
    </div>

    <footer class="footer">
      <p><strong>OpenMTSciEd</strong> - Open MatuX Science Education</p>
      <p class="footer-links">
        <a href="https://github.com/iMato/OpenMTSciEd" target="_blank">GitHub</a> ·
        <a href="mailto:contact@imato.edu">联系我们</a> · MIT License
      </p>
    </footer>
  `,
  styles: [
    `
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
        border-bottom: 1px solid rgba(6, 182, 212, 0.2);
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
        background: linear-gradient(135deg, #06b6d4, #22d3ee);
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
        background: linear-gradient(135deg, rgba(6, 182, 212, 0.1), rgba(139, 92, 246, 0.1));
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
        color: #06b6d4;
        border-left: 4px solid #06b6d4;
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
        border: 1px solid rgba(6, 182, 212, 0.1);
      }

      .stat-number {
        font-size: 2.5rem;
        font-weight: bold;
        color: #06b6d4;
      }

      .stat-label {
        color: #94a3b8;
        margin-top: 0.5rem;
      }

      .path-timeline {
        position: relative;
        padding: 2rem 0;
      }

      .path-timeline::before {
        content: '';
        position: absolute;
        left: 50%;
        top: 0;
        bottom: 0;
        width: 4px;
        background: linear-gradient(180deg, #06b6d4, #8b5cf6);
        transform: translateX(-50%);
      }

      .timeline-item {
        display: flex;
        margin-bottom: 3rem;
        position: relative;
      }

      .timeline-item:nth-child(odd) {
        flex-direction: row;
      }

      .timeline-item:nth-child(even) {
        flex-direction: row-reverse;
      }

      .timeline-content {
        width: 45%;
        background: #1e293b;
        padding: 2rem;
        border-radius: 12px;
        border: 1px solid rgba(6, 182, 212, 0.2);
        position: relative;
      }

      .timeline-item:nth-child(odd) .timeline-content {
        margin-right: auto;
      }

      .timeline-item:nth-child(even) .timeline-content {
        margin-left: auto;
      }

      .timeline-dot {
        position: absolute;
        left: 50%;
        top: 2rem;
        width: 24px;
        height: 24px;
        background: #06b6d4;
        border-radius: 50%;
        transform: translateX(-50%);
        border: 4px solid #0f172a;
        z-index: 1;
      }

      .timeline-content h3 {
        color: #06b6d4;
        margin-bottom: 1rem;
      }

      .phase {
        display: inline-block;
        background: linear-gradient(135deg, #06b6d4, #8b5cf6);
        color: white;
        padding: 0.3rem 0.8rem;
        border-radius: 20px;
        font-size: 0.9rem;
        margin-bottom: 1rem;
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
        content: '📚';
        position: absolute;
        left: 0;
      }

      .back-link {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        color: #06b6d4;
        text-decoration: none;
        margin-bottom: 2rem;
        padding: 0.8rem 1.5rem;
        background: #1e293b;
        border-radius: 8px;
        border: 1px solid rgba(6, 182, 212, 0.2);
        transition: all 0.3s;
      }

      .back-link:hover {
        transform: translateX(-5px);
        border-color: #06b6d4;
      }

      .footer {
        background: #1e293b;
        padding: 3rem 2rem;
        text-align: center;
        border-top: 1px solid rgba(6, 182, 212, 0.2);
        margin-top: 4rem;
      }

      .footer p {
        color: #94a3b8;
        margin: 0.5rem 0;
      }

      .footer-links a {
        color: #06b6d4;
        text-decoration: none;
      }

      .footer-links a:hover {
        text-decoration: underline;
      }

      @media (max-width: 768px) {
        .hero h1 {
          font-size: 2rem;
        }
        .nav-links {
          display: none;
        }

        .path-timeline::before {
          left: 20px;
        }

        .timeline-item,
        .timeline-item:nth-child(even) {
          flex-direction: row;
        }

        .timeline-content {
          width: calc(100% - 60px);
          margin-left: 60px !important;
        }

        .timeline-dot {
          left: 20px;
        }
      }
    `,
  ],
})
export class FeatureLearningPathComponent {}
