import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';

import { AuthService } from '../shared/auth.service';
import { MarketingNavComponent } from '../shared/marketing-nav/marketing-nav.component';

type OS = 'windows' | 'macos' | 'linux' | 'unknown';

@Component({
  selector: 'app-download',
  standalone: true,
  imports: [CommonModule, RouterLink, MarketingNavComponent],
  template: `
    <app-marketing-nav></app-marketing-nav>

    <div class="download-container">
      <div class="hero-section">
        <h1>下载 OpenMTSciEd 桌面端</h1>
        <p class="subtitle">功能完整的 STEM 学习平台，支持知识图谱、AI 导师、硬件编程、AR/VR 实验室</p>
        
        <div *ngIf="detectedOS !== 'unknown'" class="detected-os">
          <span class="os-badge">检测到你的系统: {{ getOSName(detectedOS) }}</span>
        </div>
      </div>

      <div class="download-cards">
        <!-- Windows -->
        <div class="download-card" [class.recommended]="detectedOS === 'windows'">
          <div *ngIf="detectedOS === 'windows'" class="recommended-badge">推荐</div>
          <div class="os-icon">🪟</div>
          <h3>Windows</h3>
          <p class="version">v1.0.0</p>
          <ul class="requirements">
            <li>Windows 10/11 (64-bit)</li>
            <li>4 GB RAM 最低</li>
            <li>500 MB 磁盘空间</li>
          </ul>
          <a href="#" class="btn btn-primary" (click)="onDownload('windows', $event)">
            下载 Windows 版
          </a>
          <p class="file-info">.exe 安装包 (约 85 MB)</p>
        </div>

        <!-- macOS -->
        <div class="download-card" [class.recommended]="detectedOS === 'macos'">
          <div *ngIf="detectedOS === 'macos'" class="recommended-badge">推荐</div>
          <div class="os-icon">🍎</div>
          <h3>macOS</h3>
          <p class="version">v1.0.0</p>
          <ul class="requirements">
            <li>macOS 12+ (Intel/Apple Silicon)</li>
            <li>4 GB RAM 最低</li>
            <li>500 MB 磁盘空间</li>
          </ul>
          <a href="#" class="btn btn-primary" (click)="onDownload('macos', $event)">
            下载 macOS 版
          </a>
          <p class="file-info">.dmg 安装包 (约 90 MB)</p>
        </div>

        <!-- Linux -->
        <div class="download-card" [class.recommended]="detectedOS === 'linux'">
          <div *ngIf="detectedOS === 'linux'" class="recommended-badge">推荐</div>
          <div class="os-icon">🐧</div>
          <h3>Linux</h3>
          <p class="version">v1.0.0</p>
          <ul class="requirements">
            <li>Ubuntu 20.04+ / Fedora 36+ / Arch</li>
            <li>4 GB RAM 最低</li>
            <li>500 MB 磁盘空间</li>
          </ul>
          <a href="#" class="btn btn-primary" (click)="onDownload('linux', $event)">
            下载 Linux 版
          </a>
          <p class="file-info">.AppImage 或 .deb (约 88 MB)</p>
        </div>
      </div>

      <div class="features-preview">
        <h2>桌面端核心功能</h2>
        <div class="features-grid">
          <div class="feature-item">
            <div class="feature-icon">🕸️</div>
            <h3>STEM 知识图谱</h3>
            <p>基于 Neo4j 的跨学科知识网络，可视化展示知识关联</p>
          </div>
          <div class="feature-item">
            <div class="feature-icon">🤖</div>
            <h3>AI 虚拟导师</h3>
            <p>MiniCPM 驱动的个性化学习助手，实时解答问题</p>
          </div>
          <div class="feature-item">
            <div class="feature-icon">🔌</div>
            <h3>硬件项目编程</h3>
            <p>Blockly 图形化编程 + WebUSB 手机直连烧录</p>
          </div>
          <div class="feature-item">
            <div class="feature-icon">🥽</div>
            <h3>AR/VR 实验室</h3>
            <p>沉浸式虚拟实验环境，支持手势识别交互</p>
          </div>
          <div class="feature-item">
            <div class="feature-icon">📊</div>
            <h3>学习数据看板</h3>
            <p>可视化学习进度、成就系统与行为分析</p>
          </div>
          <div class="feature-item">
            <div class="feature-icon">🔗</div>
            <h3>连贯学习路径</h3>
            <p>PPO 算法推荐个性化学习路径，从小学到大学</p>
          </div>
        </div>
      </div>

      <div class="installation-guide">
        <h2>安装说明</h2>
        <div class="guide-steps">
          <div class="step">
            <div class="step-number">1</div>
            <div class="step-content">
              <h3>下载安装包</h3>
              <p>点击上方对应系统的下载按钮，等待下载完成</p>
            </div>
          </div>
          <div class="step">
            <div class="step-number">2</div>
            <div class="step-content">
              <h3>运行安装程序</h3>
              <p>Windows: 双击 .exe 文件<br>
                 macOS: 拖拽 .app 到 Applications<br>
                 Linux: 赋予执行权限后运行 .AppImage</p>
            </div>
          </div>
          <div class="step">
            <div class="step-number">3</div>
            <div class="step-content">
              <h3>登录账户</h3>
              <p>使用 Web 端注册的账户登录，或使用 GitHub/Google 快捷登录</p>
            </div>
          </div>
          <div class="step">
            <div class="step-number">4</div>
            <div class="step-content">
              <h3>开始学习</h3>
              <p>探索知识图谱、开始 AI 对话、连接硬件设备</p>
            </div>
          </div>
        </div>
      </div>

      <div class="footer-section">
        <p>需要帮助？查看 <a href="#">常见问题</a> 或 <a href="mailto:3936318150@qq.com">联系我们</a></p>
        <a routerLink="/" class="btn btn-secondary">返回首页</a>
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        min-height: 100vh;
        background: #0f172a;
        color: #f8fafc;
      }

      .download-container {
        padding: 6rem 2rem 4rem;
        max-width: 1200px;
        margin: 0 auto;
      }

      .hero-section {
        text-align: center;
        margin-bottom: 4rem;
      }

      h1 {
        font-size: 3rem;
        margin-bottom: 1rem;
        background: linear-gradient(135deg, #6366f1, #06b6d4);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }

      .subtitle {
        font-size: 1.3rem;
        color: #94a3b8;
        max-width: 700px;
        margin: 0 auto 1.5rem;
      }

      .detected-os {
        margin-top: 1rem;
      }

      .os-badge {
        background: rgba(16, 185, 129, 0.2);
        color: #10b981;
        padding: 0.5rem 1.5rem;
        border-radius: 9999px;
        font-size: 0.95rem;
        font-weight: 600;
      }

      .download-cards {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 2rem;
        margin-bottom: 5rem;
      }

      .download-card {
        background: #1e293b;
        padding: 2.5rem;
        border-radius: 16px;
        border: 2px solid rgba(99, 102, 241, 0.1);
        text-align: center;
        position: relative;
        transition: all 0.3s;
      }

      .download-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
      }

      .download-card.recommended {
        border-color: #10b981;
        box-shadow: 0 0 30px rgba(16, 185, 129, 0.2);
      }

      .recommended-badge {
        position: absolute;
        top: -12px;
        left: 50%;
        transform: translateX(-50%);
        background: linear-gradient(135deg, #10b981, #059669);
        color: white;
        padding: 0.3rem 1rem;
        border-radius: 9999px;
        font-size: 0.85rem;
        font-weight: 600;
      }

      .os-icon {
        font-size: 4rem;
        margin-bottom: 1rem;
      }

      .download-card h3 {
        font-size: 1.8rem;
        margin-bottom: 0.5rem;
      }

      .version {
        color: #94a3b8;
        margin-bottom: 1.5rem;
      }

      .requirements {
        list-style: none;
        padding: 0;
        margin-bottom: 2rem;
        text-align: left;
      }

      .requirements li {
        color: #94a3b8;
        padding: 0.5rem 0;
        border-bottom: 1px solid rgba(99, 102, 241, 0.1);
      }

      .requirements li:last-child {
        border-bottom: none;
      }

      .btn {
        display: inline-block;
        padding: 1rem 2rem;
        border-radius: 8px;
        font-size: 1.1rem;
        font-weight: 600;
        text-decoration: none;
        transition: all 0.3s;
        cursor: pointer;
        border: none;
      }

      .btn-primary {
        background: linear-gradient(135deg, #6366f1, #8b5cf6);
        color: white;
        box-shadow: 0 10px 30px rgba(99, 102, 241, 0.3);
        width: 100%;
      }

      .btn-primary:hover {
        transform: translateY(-2px);
        box-shadow: 0 15px 40px rgba(99, 102, 241, 0.4);
      }

      .btn-secondary {
        background: #1e293b;
        color: #f8fafc;
        border: 2px solid rgba(99, 102, 241, 0.3);
      }

      .btn-secondary:hover {
        border-color: #6366f1;
        transform: translateY(-2px);
      }

      .file-info {
        margin-top: 1rem;
        color: #64748b;
        font-size: 0.85rem;
      }

      .features-preview {
        margin-bottom: 5rem;
      }

      .features-preview h2 {
        text-align: center;
        font-size: 2.5rem;
        margin-bottom: 3rem;
      }

      .features-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: 2rem;
      }

      .feature-item {
        background: #1e293b;
        padding: 2rem;
        border-radius: 12px;
        border-left: 4px solid #6366f1;
        transition: all 0.3s;
      }

      .feature-item:hover {
        transform: translateX(5px);
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
      }

      .feature-icon {
        font-size: 2.5rem;
        margin-bottom: 1rem;
      }

      .feature-item h3 {
        font-size: 1.3rem;
        margin-bottom: 0.5rem;
      }

      .feature-item p {
        color: #94a3b8;
        line-height: 1.6;
      }

      .installation-guide {
        background: #1e293b;
        padding: 3rem;
        border-radius: 16px;
        margin-bottom: 4rem;
      }

      .installation-guide h2 {
        font-size: 2rem;
        margin-bottom: 2rem;
        text-align: center;
      }

      .guide-steps {
        display: grid;
        gap: 2rem;
      }

      .step {
        display: flex;
        gap: 1.5rem;
        align-items: flex-start;
      }

      .step-number {
        width: 50px;
        height: 50px;
        border-radius: 50%;
        background: linear-gradient(135deg, #6366f1, #8b5cf6);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.5rem;
        font-weight: bold;
        flex-shrink: 0;
      }

      .step-content h3 {
        font-size: 1.3rem;
        margin-bottom: 0.5rem;
      }

      .step-content p {
        color: #94a3b8;
        line-height: 1.6;
      }

      .footer-section {
        text-align: center;
        padding: 2rem 0;
      }

      .footer-section p {
        color: #94a3b8;
        margin-bottom: 1.5rem;
      }

      .footer-section a {
        color: #6366f1;
        text-decoration: none;
      }

      .footer-section a:hover {
        text-decoration: underline;
      }

      @media (max-width: 768px) {
        h1 {
          font-size: 2rem;
        }

        .subtitle {
          font-size: 1.1rem;
        }

        .download-cards {
          grid-template-columns: 1fr;
        }

        .installation-guide {
          padding: 2rem;
        }

        .step {
          flex-direction: column;
          align-items: center;
          text-align: center;
        }
      }
    `,
  ],
})
export class DownloadComponent implements OnInit {
  detectedOS: OS = 'unknown';

  constructor(private readonly authService: AuthService) {}

  ngOnInit(): void {
    this.detectedOS = this.detectOS();
  }

  detectOS(): OS {
    const userAgent = navigator.userAgent.toLowerCase();
    if (userAgent.includes('win')) return 'windows';
    if (userAgent.includes('mac')) return 'macos';
    if (userAgent.includes('linux')) return 'linux';
    return 'unknown';
  }

  getOSName(os: OS): string {
    const names: { [key: string]: string } = {
      windows: 'Windows',
      macos: 'macOS',
      linux: 'Linux',
      unknown: '未知系统',
    };
    return names[os];
  }

  onDownload(os: OS, event: Event): void {
    event.preventDefault();
    // TODO: 实际下载链接，目前仅提示
    alert(`即将下载 ${this.getOSName(os)} 版本...\n\n桌面端正在开发中，敬请期待！`);
  }
}
