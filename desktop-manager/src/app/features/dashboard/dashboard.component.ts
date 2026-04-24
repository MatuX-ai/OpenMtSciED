import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { NetworkStatusService } from '../../core/services/network-status.service';
import { ThemeService } from '../../core/services/theme.service';
import { ShortcutService } from '../../core/services/shortcut.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatCardModule, MatIconModule, MatTooltipModule],
  template: `
    <div class="dashboard-container">
      <!-- 网络状态指示器 -->
      <div class="network-status" [class.online]="isOnline" [class.offline]="!isOnline">
        <mat-icon>{{ isOnline ? 'wifi' : 'wifi_off' }}</mat-icon>
        <span>{{ isOnline ? '在线' : '离线模式' }}</span>
        <button mat-button size="small" (click)="checkNetwork()" *ngIf="!isOnline">
          重新检查
        </button>
      </div>

      <div class="header">
        <h1>OpenMTSciEd 桌面端</h1>
        <div class="header-actions">
          <button mat-icon-button (click)="toggleTheme()" [matTooltip]="currentTheme === 'light' ? '切换到深色模式' : '切换到浅色模式'">
            <mat-icon>{{ currentTheme === 'light' ? 'dark_mode' : 'light_mode' }}</mat-icon>
          </button>
          <button mat-button (click)="resetSetup()">重新设置</button>
        </div>
      </div>

      <div class="action-grid">
        <mat-card *ngFor="let action of actions" class="action-card" (click)="navigate(action.route)">
          <mat-card-content>
            <h3>{{ action.title }}</h3>
            <p>{{ action.description }}</p>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container { padding: 24px; background: #f5f7fa; min-height: 100vh; }
    .network-status {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 16px;
      border-radius: 20px;
      margin-bottom: 16px;
      font-size: 14px;
      font-weight: 500;
    }
    .network-status.online {
      background: #e8f5e9;
      color: #2e7d32;
    }
    .network-status.offline {
      background: #ffebee;
      color: #c62828;
    }
    .network-status mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }
    .network-status button {
      margin-left: auto;
      font-size: 12px;
    }
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; }
    .header-actions {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .action-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 20px; }
    .action-card { cursor: pointer; transition: transform 0.2s; border-radius: 12px; }
    .action-card:hover { transform: translateY(-4px); box-shadow: 0 8px 24px rgba(0,0,0,0.1); }
    mat-card-content { padding: 24px; text-align: center; }
    h3 { margin: 0 0 8px; color: #333; }
    p { margin: 0; color: #666; font-size: 14px; }
  `]
})
export class DashboardComponent implements OnInit, OnDestroy {
  actions = [
    { title: '资源浏览器', description: '教程与课件联动浏览', route: '/resource-browser' },
    { title: '教程库', description: '浏览和管理开源 STEM 教程', route: '/tutorial-library' },
    { title: '课件库', description: '获取 OpenStax 等经典教材', route: '/material-library' },
    { title: '知识图谱', description: '查看连贯学习路径', route: '/knowledge-graph' },
    { title: '硬件项目', description: '低成本 Arduino/ESP32 实践', route: '/hardware-projects' },
    { title: '用户管理', description: '管理系统用户和权限', route: '/admin/user-management' },
    { title: '系统设置', description: '配置存储与 AI 选项', route: '/settings' },
  ];

  isOnline = true;
  currentTheme: 'light' | 'dark' = 'light';
  private subscription?: Subscription;

  constructor(
    private router: Router,
    private networkStatusService: NetworkStatusService,
    private themeService: ThemeService,
    private shortcutService: ShortcutService
  ) {}

  ngOnInit(): void {
    this.isOnline = this.networkStatusService.isOnline();
    this.currentTheme = this.themeService.getTheme();
    
    // 订阅网络状态变化
    this.subscription = this.networkStatusService.status$.subscribe(status => {
      this.isOnline = status.isOnline;
    });

    // 注册全局快捷键
    this.registerShortcuts();
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  /**
   * 注册快捷键
   */
  private registerShortcuts(): void {
    // Ctrl+T - 切换主题
    this.shortcutService.register({
      key: 't',
      ctrl: true,
      description: '切换主题',
      action: () => this.toggleTheme()
    });

    // Ctrl+R - 重新检查网络
    this.shortcutService.register({
      key: 'r',
      ctrl: true,
      description: '重新检查网络',
      action: () => this.checkNetwork()
    });

    // F1 - 显示快捷键帮助
    this.shortcutService.register({
      key: 'F1',
      description: '显示快捷键帮助',
      action: () => this.showShortcutHelp()
    });
  }

  /**
   * 显示快捷键帮助
   */
  private showShortcutHelp(): void {
    const shortcuts = this.shortcutService.getAllShortcuts();
    const helpText = shortcuts.map(s => {
      const modifiers = [];
      if (s.ctrl) modifiers.push('Ctrl');
      if (s.shift) modifiers.push('Shift');
      if (s.alt) modifiers.push('Alt');
      return `${modifiers.join('+')}+${s.key}: ${s.description}`;
    }).join('\n');

    alert(`快捷键列表:\n\n${helpText || '暂无注册的快捷键'}`);
  }

  async checkNetwork(): Promise<void> {
    await this.networkStatusService.checkNetworkStatus();
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
    this.currentTheme = this.themeService.getTheme();
  }

  navigate(route: string): void {
    void this.router.navigate([route]);
  }

  resetSetup(): void {
    if (confirm('确定要重置配置吗？')) {
      localStorage.removeItem('user-profile');
      void this.router.navigate(['/setup-wizard']);
    }
  }
}
