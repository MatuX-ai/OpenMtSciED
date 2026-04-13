import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { Router } from '@angular/router';

import { StorageInfo, TauriService } from '../../core/services/tauri.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatCardModule, MatIconModule, MatProgressBarModule],
  template: `
    <div class="settings-container">
      <div class="header">
        <button mat-icon-button (click)="goBack()">
          <i class="ri-arrow-left-line"></i>
        </button>
        <h1>设置</h1>
      </div>

      <!-- 存储空间概览 -->
      <mat-card class="storage-overview">
        <mat-card-header>
          <mat-card-title>
            <i class="ri-hard-drive-2-line"></i>
            存储空间
          </mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <div *ngIf="storageInfo" class="storage-details">
            <div class="storage-chart">
              <div class="storage-bar">
                <div
                  class="storage-used"
                  [style.width.%]="getUsedPercentage()"
                  [title]="'已用: ' + formatBytes(storageInfo.used_space)"
                ></div>
              </div>
              <div class="storage-labels">
                <span>已用: {{ formatBytes(storageInfo.used_space) }}</span>
                <span>可用: {{ formatBytes(storageInfo.free_space) }}</span>
              </div>
            </div>

            <div class="storage-stats">
              <div class="stat-item">
                <div class="stat-icon icon-primary">
                  <i class="ri-database-2-line"></i>
                </div>
                <div class="stat-content">
                  <span class="stat-label">数据库路径</span>
                  <span class="stat-value">{{ storageInfo.database_path }}</span>
                </div>
              </div>

              <div class="stat-item">
                <div class="stat-icon icon-accent">
                  <i class="ri-folder-3-line"></i>
                </div>
                <div class="stat-content">
                  <span class="stat-label">课件存储</span>
                  <span class="stat-value">{{ storageInfo.materials_path }}</span>
                </div>
              </div>

              <div class="stat-item">
                <div class="stat-icon icon-info">
                  <i class="ri-file-list-3-line"></i>
                </div>
                <div class="stat-content">
                  <span class="stat-label">课件数量</span>
                  <span class="stat-value">{{ storageInfo.material_count }} 个</span>
                </div>
              </div>

              <div class="stat-item">
                <div class="stat-icon icon-warn">
                  <i class="ri-timer-line"></i>
                </div>
                <div class="stat-content">
                  <span class="stat-label">预估增长</span>
                  <span class="stat-value">{{ storageInfo.estimated_growth }}</span>
                </div>
              </div>
            </div>
          </div>

          <div *ngIf="!storageInfo" class="loading">
            <i class="ri-loader-4-line"></i>
            <p>加载存储信息中...</p>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- 快速操作 -->
      <mat-card class="quick-actions">
        <mat-card-header>
          <mat-card-title>
            <i class="ri-tools-line"></i>
            快速操作
          </mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <div class="action-buttons">
            <button mat-raised-button color="primary" (click)="openDataFolder()">
              <i class="ri-folder-open-line"></i>
              打开数据文件夹
            </button>
            <button mat-raised-button color="accent" (click)="resetSetup()">
              <i class="ri-settings-3-line"></i>
              重新设置
            </button>
            <button mat-raised-button color="warn" (click)="confirmReset()">
              <i class="ri-delete-bin-line"></i>
              清除数据
            </button>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- 关于 -->
      <mat-card class="about-section">
        <mat-card-header>
          <mat-card-title>
            <i class="ri-information-line"></i>
            关于
          </mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <div class="about-info">
            <p><strong>版本：</strong>v0.1.0</p>
            <p><strong>技术栈：</strong>Tauri 2.0 + Angular 17 + Rust</p>
            <p><strong>许可证：</strong>MIT License</p>
            <p><strong>开源地址：</strong>https://open-mt-sci-ed.vercel.app/</p>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [
    `
      .settings-container {
        min-height: 100vh;
        background: linear-gradient(135deg, #f5f7fa 0%, #e8ecf1 100%);
        padding: 24px;
      }

      .header {
        display: flex;
        align-items: center;
        gap: 16px;
        margin-bottom: 32px;
      }

      .header h1 {
        margin: 0;
        font-size: 28px;
        color: #333;
      }

      mat-card {
        margin-bottom: 24px;
        border-radius: 12px;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
      }

      mat-card-title {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 20px;
        color: #333;
      }

      mat-card-title i {
        font-size: 24px;
        color: #667eea;
      }

      .storage-details {
        padding: 16px 0;
      }

      .storage-chart {
        margin-bottom: 24px;
      }

      .storage-bar {
        width: 100%;
        height: 24px;
        background: #e0e0e0;
        border-radius: 12px;
        overflow: hidden;
        margin-bottom: 8px;
      }

      .storage-used {
        height: 100%;
        background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
        transition: width 0.3s ease;
      }

      .storage-labels {
        display: flex;
        justify-content: space-between;
        font-size: 14px;
        color: #666;
      }

      .storage-stats {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 16px;
      }

      .stat-item {
        display: flex;
        align-items: flex-start;
        gap: 12px;
        padding: 16px;
        background: #f5f7fa;
        border-radius: 8px;
        transition: all 0.3s ease;
      }

      .stat-item:hover {
        background: #e8ecf1;
      }

      .stat-icon {
        width: 40px;
        height: 40px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 20px;
        color: white;
        flex-shrink: 0;
      }

      .icon-primary {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      }

      .icon-accent {
        background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
      }

      .icon-info {
        background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
      }

      .icon-warn {
        background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
      }

      .stat-content {
        display: flex;
        flex-direction: column;
        gap: 4px;
        min-width: 0;
      }

      .stat-label {
        font-size: 13px;
        color: #999;
      }

      .stat-value {
        font-size: 14px;
        color: #333;
        font-weight: 500;
        word-break: break-all;
      }

      .loading {
        text-align: center;
        padding: 40px;
        color: #999;
      }

      .loading i {
        font-size: 48px;
        animation: spin 1s linear infinite;
      }

      @keyframes spin {
        from {
          transform: rotate(0deg);
        }
        to {
          transform: rotate(360deg);
        }
      }

      .loading p {
        margin-top: 12px;
      }

      .action-buttons {
        display: flex;
        gap: 12px;
        flex-wrap: wrap;
        padding: 16px 0;
      }

      .action-buttons button i {
        margin-right: 8px;
      }

      .about-info {
        padding: 16px 0;
      }

      .about-info p {
        margin: 8px 0;
        color: #666;
      }

      .about-info strong {
        color: #333;
      }
    `,
  ],
})
export class SettingsComponent implements OnInit {
  storageInfo: StorageInfo | null = null;

  constructor(
    private tauriService: TauriService,
    private router: Router
  ) {}

  ngOnInit(): void {
    void this.loadStorageInfo();
  }

  async loadStorageInfo(): Promise<void> {
    try {
      this.storageInfo = await this.tauriService.getStorageInfo();
    } catch (error) {
      console.error('Failed to load storage info:', error);
    }
  }

  formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }

  getUsedPercentage(): number {
    if (!this.storageInfo) return 0;
    const total = this.storageInfo.used_space + this.storageInfo.free_space;
    if (total === 0) return 0;
    return (this.storageInfo.used_space / total) * 100;
  }

  goBack(): void {
    void this.router.navigate(['/dashboard']);
  }

  openDataFolder(): void {
    if (this.storageInfo) {
      // TODO: 使用 Tauri shell 打开文件夹
      // console.log('Open folder:', this.storageInfo.data_path);
    }
  }

  resetSetup(): void {
    if (confirm('确定要重新设置吗？这将清除当前配置。')) {
      localStorage.removeItem('user-profile');
      void this.router.navigate(['/setup-wizard']);
    }
  }

  confirmReset(): void {
    if (confirm('警告：这将清除所有本地数据，包括课程和课件。此操作不可恢复，是否继续？')) {
      // TODO: 调用 Tauri 命令清除数据
      // console.log('Reset data');
    }
  }
}
