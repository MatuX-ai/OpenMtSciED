import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-open-source',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container">
      <h1>开源生态</h1>
      <p class="subtitle">用开源 AI 打通 STEM 学段壁垒，全球共建“STEM 知识地图”</p>

      <div class="cards-grid">
        <div class="card">
          <h3>📜 许可证与权限</h3>
          <p>本项目采用 MIT 许可证。您可以自由使用、修改和分发，甚至用于商业用途。</p>
          <a href="https://opensource.org/licenses/MIT" target="_blank">查看许可证详情</a>
        </div>

        <div class="card">
          <h3>🤝 贡献方式</h3>
          <ol>
            <li>提 Issue：报告 Bug 或提出建议</li>
            <li>发 PR：提交代码或文档改进</li>
            <li>参与讨论：在 GitHub Discussions 交流</li>
          </ol>
          <a href="https://github.com/iMato/OpenMTSciEd" target="_blank">前往 GitHub 仓库</a>
        </div>

        <div class="card">
          <h3>🛠️ 开发资源</h3>
          <p><strong>快速上手：</strong></p>
          <ul>
            <li><code>scripts/parsers</code>: 资源解析器</li>
            <li><code>backend/services</code>: 核心业务逻辑</li>
          </ul>
        </div>

        <div class="card">
          <h3>🚀 Roadmap</h3>
          <ul>
            <li>扩展 K-5 阶段课程资源</li>
            <li>支持更多类型的开源硬件</li>
            <li>多语言界面支持</li>
          </ul>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .container {
        max-width: 1000px;
        margin: 0 auto;
        padding: 40px 20px;
        text-align: center;
      }
      .subtitle {
        color: #666;
        margin-bottom: 40px;
      }
      .cards-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 30px;
        text-align: left;
      }
      .card {
        padding: 25px;
        border: 1px solid #e1e4e8;
        border-radius: 8px;
        background: white;
      }
      .card h3 {
        color: #0366d6;
        margin-top: 0;
      }
      .card a {
        color: #0366d6;
        text-decoration: none;
        font-weight: bold;
      }
      code {
        background: #f6f8fa;
        padding: 2px 5px;
        border-radius: 4px;
      }
    `,
  ],
})
export class OpenSourceComponent {}
