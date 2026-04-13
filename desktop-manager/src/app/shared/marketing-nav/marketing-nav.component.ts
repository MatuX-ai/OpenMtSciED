import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

import { TauriService } from '../../core/services/tauri.service';

@Component({
  selector: 'app-marketing-nav',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav class="marketing-nav">
      <div class="nav-container">
        <div class="nav-brand" (click)="openMarketingWebsite()" title="访问 OpenMTSciEd 官网">
          <img src="assets/images/matu-logo.png" alt="OpenMTSciEd Logo" class="brand-logo" />
          <span class="brand-name">OpenMTSciEd</span>
        </div>

        <div class="nav-links">
          <a
            routerLink="/setup-wizard"
            routerLinkActive="active"
            [routerLinkActiveOptions]="{ exact: true }"
          >
            <i class="ri-magic-line"></i>
            <span>安装向导</span>
          </a>
          <a routerLink="/tutorial-library" routerLinkActive="active">
            <i class="ri-book-open-line"></i>
            <span>教程库</span>
          </a>
          <a routerLink="/material-library" routerLinkActive="active">
            <i class="ri-folder-2-line"></i>
            <span>课件库</span>
          </a>
        </div>
      </div>
    </nav>
  `,
  styles: [
    `
      .marketing-nav {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        padding: 12px 0;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }

      .nav-container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 0 24px;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .nav-brand {
        display: flex;
        align-items: center;
        gap: 12px;
        color: white;
        font-size: 18px;
        font-weight: 600;
        cursor: pointer;
        transition: opacity 0.3s ease;
      }

      .nav-brand:hover {
        opacity: 0.85;
      }

      .brand-logo {
        height: 36px;
        width: auto;
        object-fit: contain;
      }

      .nav-links {
        display: flex;
        gap: 8px;
      }

      .nav-links a {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 8px 16px;
        color: rgba(255, 255, 255, 0.9);
        text-decoration: none;
        border-radius: 6px;
        transition: all 0.3s ease;
        font-size: 14px;
      }

      .nav-links a:hover {
        background: rgba(255, 255, 255, 0.15);
        color: white;
      }

      .nav-links a.active {
        background: rgba(255, 255, 255, 0.2);
        color: white;
        font-weight: 500;
      }

      .nav-links i {
        font-size: 16px;
      }
    `,
  ],
})
export class MarketingNavComponent {
  private readonly MARKETING_WEBSITE_URL = 'https://open-mt-sci-ed.vercel.app/';

  constructor(private tauriService: TauriService) {}

  async openMarketingWebsite(): Promise<void> {
    try {
      await this.tauriService.openUrl(this.MARKETING_WEBSITE_URL);
    } catch (error) {
      console.error('打开营销网站失败:', error);
      // 降级方案：在浏览器中打开
      window.open(this.MARKETING_WEBSITE_URL, '_blank');
    }
  }
}
