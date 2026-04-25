import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Subscription } from 'rxjs';

import { SidebarComponent } from './shared/components/app-sidebar/app-sidebar.component';
import { ShortcutService } from './core/services/shortcut.service';
import { GlobalSearchService } from './core/services/global-search.service';
import { ThemeService } from './core/services/theme.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, MatSidenavModule, MatButtonModule, MatIconModule, MatTooltipModule, SidebarComponent],
  template: `
    <div class="app-layout">
      <app-sidebar></app-sidebar>
      <main class="main-content">
        <!-- 顶部导航栏 -->
        <div class="top-navbar">
          <div class="navbar-left">
            <h1 class="page-title">👋 欢迎回来</h1>
            <div class="network-status" [class.online]="isOnline" [class.offline]="!isOnline">
              <mat-icon>{{ isOnline ? 'wifi' : 'wifi_off' }}</mat-icon>
              <span>{{ isOnline ? '在线' : '离线' }}</span>
            </div>
          </div>
          <div class="navbar-right">
            <button mat-icon-button (click)="openGlobalSearch()" matTooltip="全局搜索 (Ctrl+K)">
              <mat-icon>search</mat-icon>
            </button>
            <button mat-icon-button (click)="toggleTheme()" [matTooltip]="currentTheme === 'light' ? '切换到深色模式' : '切换到浅色模式'">
              <mat-icon>{{ currentTheme === 'light' ? 'dark_mode' : 'light_mode' }}</mat-icon>
            </button>
          </div>
        </div>
        <div class="content-wrapper">
          <router-outlet></router-outlet>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .app-layout {
      display: flex;
      height: 100vh;
      overflow: hidden;
    }
    
    .main-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      background: var(--bg-primary, #f5f7fa);
    }

    .top-navbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 32px;
      background: var(--bg-secondary, #ffffff);
      border-bottom: 1px solid var(--border-color, #e0e0e0);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
      z-index: 10;
    }

    .navbar-left {
      display: flex;
      align-items: center;
      gap: 20px;
    }

    .page-title {
      font-size: 24px;
      font-weight: 700;
      margin: 0;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .network-status {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      border-radius: 20px;
      font-size: 13px;
      font-weight: 500;
      transition: all 0.3s ease;

      &.online {
        background: rgba(67, 233, 123, 0.1);
        color: #2ecc71;

        mat-icon {
          font-size: 16px;
          width: 16px;
          height: 16px;
        }
      }

      &.offline {
        background: rgba(255, 107, 107, 0.1);
        color: #ff6b6b;

        mat-icon {
          font-size: 16px;
          width: 16px;
          height: 16px;
        }
      }
    }

    .navbar-right {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .content-wrapper {
      flex: 1;
      overflow-y: auto;
    }
  `]
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'OpenMTSciEd Desktop Manager';
  currentTheme: 'light' | 'dark' = 'light';
  isOnline: boolean = navigator.onLine;
  private subscription?: Subscription;
  private onlineListener?: () => void;
  private offlineListener?: () => void;

  constructor(
    private shortcutService: ShortcutService,
    private globalSearchService: GlobalSearchService,
    private themeService: ThemeService
  ) {}

  ngOnInit(): void {
    this.currentTheme = this.themeService.getTheme();
    this.registerShortcuts();
    this.registerNetworkListeners();
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
    // 清理网络监听器
    if (this.onlineListener) {
      window.removeEventListener('online', this.onlineListener);
    }
    if (this.offlineListener) {
      window.removeEventListener('offline', this.offlineListener);
    }
  }

  private registerNetworkListeners(): void {
    this.onlineListener = () => {
      this.isOnline = true;
    };
    this.offlineListener = () => {
      this.isOnline = false;
    };
    window.addEventListener('online', this.onlineListener);
    window.addEventListener('offline', this.offlineListener);
  }

  private registerShortcuts(): void {
    // Ctrl+K - 打开全局搜索
    this.shortcutService.register({
      key: 'k',
      ctrl: true,
      description: '打开全局搜索',
      action: () => this.openGlobalSearch()
    });

    // Ctrl+T - 切换主题
    this.shortcutService.register({
      key: 't',
      ctrl: true,
      description: '切换主题',
      action: () => this.toggleTheme()
    });
  }

  openGlobalSearch(): void {
    this.globalSearchService.openSearch();
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
    this.currentTheme = this.themeService.getTheme();
  }
}
