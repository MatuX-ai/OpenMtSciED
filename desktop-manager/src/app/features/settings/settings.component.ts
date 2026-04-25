import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';

import { ImportExportService } from '../../core/services/import-export.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatCardModule, MatSnackBarModule, MatIconModule],
  template: `
    <div class="settings-container">
      <!-- 页面头部 -->
      <div class="page-header">
        <div class="header-content">
          <button mat-icon-button class="back-btn" (click)="goBack()">
            <mat-icon>arrow_back</mat-icon>
          </button>
          <div class="header-text">
            <h1 class="page-title">
              <span class="title-icon">⚙️</span>
              系统设置
            </h1>
            <p class="page-subtitle">管理您的应用配置和数据</p>
          </div>
        </div>
      </div>

      <!-- 设置卡片网格 -->
      <div class="settings-grid">
        <!-- 重置向导 -->
        <mat-card class="setting-card">
          <div class="card-gradient gradient-purple"></div>
          <mat-card-header>
            <div class="card-icon icon-purple">
              <mat-icon>settings_backup_restore</mat-icon>
            </div>
            <mat-card-title>重置向导</mat-card-title>
            <mat-card-subtitle>重新配置 AI 或存储路径</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <p class="card-description">
              如果您需要重新配置 AI 模型或更改数据存储路径，请点击下方按钮重新运行设置向导。
            </p>
          </mat-card-content>
          <mat-card-actions>
            <button mat-raised-button class="action-btn btn-purple" (click)="resetSetup()">
              <mat-icon>refresh</mat-icon>
              重新运行设置向导
            </button>
          </mat-card-actions>
        </mat-card>

        <!-- 数据导入导出 -->
        <mat-card class="setting-card">
          <div class="card-gradient gradient-blue"></div>
          <mat-card-header>
            <div class="card-icon icon-blue">
              <mat-icon>import_export</mat-icon>
            </div>
            <mat-card-title>数据导入导出</mat-card-title>
            <mat-card-subtitle>管理教程和课件数据</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <p class="card-description">
              导出或导入您的教程库和课件清单，支持 JSON 和 CSV 格式。
            </p>
          </mat-card-content>
          <mat-card-actions class="card-actions-grid">
            <button mat-stroked-button class="action-btn btn-blue" (click)="exportCourses()">
              <mat-icon>download</mat-icon>
              导出教程库
            </button>
            <button mat-stroked-button class="action-btn btn-blue" (click)="importCourses()">
              <mat-icon>upload</mat-icon>
              导入教程库
            </button>
            <button mat-stroked-button class="action-btn btn-blue" (click)="exportMaterials()">
              <mat-icon>description</mat-icon>
              导出课件清单
            </button>
          </mat-card-actions>
        </mat-card>

        <!-- 数据库备份 -->
        <mat-card class="setting-card">
          <div class="card-gradient gradient-green"></div>
          <mat-card-header>
            <div class="card-icon icon-green">
              <mat-icon>backup</mat-icon>
            </div>
            <mat-card-title>数据库管理</mat-card-title>
            <mat-card-subtitle>备份和恢复数据库</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <p class="card-description">
              定期备份您的数据库以防止数据丢失，也可以从备份中恢复数据。
            </p>
          </mat-card-content>
          <mat-card-actions class="card-actions-grid">
            <button mat-stroked-button class="action-btn btn-green" (click)="backupDatabase()">
              <mat-icon>cloud_upload</mat-icon>
              备份数据库
            </button>
            <button mat-stroked-button class="action-btn btn-orange" (click)="restoreDatabase()">
              <mat-icon>restore</mat-icon>
              恢复数据库
            </button>
          </mat-card-actions>
        </mat-card>

        <!-- 关于 -->
        <mat-card class="setting-card about-card">
          <div class="card-gradient gradient-orange"></div>
          <mat-card-header>
            <div class="card-icon icon-orange">
              <mat-icon>info</mat-icon>
            </div>
            <mat-card-title>关于 OpenMTSciEd</mat-card-title>
            <mat-card-subtitle>应用信息</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <div class="about-content">
              <div class="about-item">
                <span class="about-label">版本</span>
                <span class="about-value badge">v0.1.0 (MVP)</span>
              </div>
              <div class="about-item">
                <span class="about-label">技术栈</span>
                <span class="about-value">Tauri 2.0 + Angular 17</span>
              </div>
              <div class="about-item">
                <span class="about-label">数据库</span>
                <span class="about-value">SQLite (本地)</span>
              </div>
              <div class="about-item">
                <span class="about-label">开源协议</span>
                <span class="about-value">MIT License</span>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .settings-container {
      padding: 32px;
      max-width: 1400px;
      margin: 0 auto;
    }

    /* 页面头部 */
    .page-header {
      margin-bottom: 40px;
      padding-bottom: 24px;
      border-bottom: 2px solid #f0f0f0;
    }

    .header-content {
      display: flex;
      align-items: center;
      gap: 20px;
    }

    .back-btn {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      background: #f8f9fa;
      transition: all 0.3s ease;

      &:hover {
        background: #e9ecef;
        transform: translateX(-4px);
      }

      mat-icon {
        font-size: 24px;
        width: 24px;
        height: 24px;
      }
    }

    .header-text {
      flex: 1;
    }

    .page-title {
      font-size: 32px;
      font-weight: 700;
      margin: 0 0 8px 0;
      color: #1a1a2e;
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .title-icon {
      font-size: 36px;
    }

    .page-subtitle {
      font-size: 15px;
      color: #6c757d;
      margin: 0;
    }

    /* 设置卡片网格 */
    .settings-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
      gap: 24px;
    }

    .setting-card {
      position: relative;
      border-radius: 16px;
      overflow: hidden;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      border: 1px solid #e9ecef;
      background: white;

      &:hover {
        transform: translateY(-8px);
        box-shadow: 0 12px 32px rgba(0, 0, 0, 0.12);

        .card-gradient {
          opacity: 1;
        }
      }
    }

    .card-gradient {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      opacity: 0;
      transition: opacity 0.3s ease;

      &.gradient-purple {
        background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
      }

      &.gradient-blue {
        background: linear-gradient(90deg, #4facfe 0%, #00f2fe 100%);
      }

      &.gradient-green {
        background: linear-gradient(90deg, #43e97b 0%, #38f9d7 100%);
      }

      &.gradient-orange {
        background: linear-gradient(90deg, #fa709a 0%, #fee140 100%);
      }
    }

    mat-card-header {
      padding: 24px 24px 16px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .card-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 12px;

      mat-icon {
        color: white;
        font-size: 24px;
        width: 24px;
        height: 24px;
      }

      &.icon-purple {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      }

      &.icon-blue {
        background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
      }

      &.icon-green {
        background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
      }

      &.icon-orange {
        background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
      }
    }

    mat-card-title {
      font-size: 20px;
      font-weight: 600;
      color: #1a1a2e;
      margin: 0;
    }

    mat-card-subtitle {
      font-size: 13px;
      color: #6c757d;
      margin: 0;
    }

    mat-card-content {
      padding: 0 24px 16px;
    }

    .card-description {
      font-size: 14px;
      color: #495057;
      line-height: 1.6;
      margin: 0;
    }

    mat-card-actions {
      padding: 20px 24px 24px;
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
    }

    .card-actions-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
      gap: 12px;
      padding: 20px 24px 24px;
    }

    .action-btn {
      min-height: 44px;
      border-radius: 12px;
      font-weight: 500;
      font-size: 14px;
      padding: 12px 16px;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      overflow: hidden;

      mat-icon {
        margin-right: 8px;
        font-size: 18px;
        width: 18px;
        height: 18px;
      }

      &.btn-purple {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border: none;
        box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);

        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
        }

        &:active {
          transform: translateY(0);
        }
      }

      &.btn-blue {
        border: 2px solid #4facfe;
        color: #4facfe;
        background: white;

        &:hover {
          background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
          color: white;
          border-color: transparent;
          box-shadow: 0 4px 12px rgba(79, 172, 254, 0.3);
          transform: translateY(-2px);
        }

        &:active {
          transform: translateY(0);
        }
      }

      &.btn-green {
        border: 2px solid #43e97b;
        color: #2ecc71;
        background: white;

        &:hover {
          background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
          color: white;
          border-color: transparent;
          box-shadow: 0 4px 12px rgba(67, 233, 123, 0.3);
          transform: translateY(-2px);
        }

        &:active {
          transform: translateY(0);
        }
      }

      &.btn-orange {
        border: 2px solid #fa709a;
        color: #fa709a;
        background: white;

        &:hover {
          background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
          color: white;
          border-color: transparent;
          box-shadow: 0 4px 12px rgba(250, 112, 154, 0.3);
          transform: translateY(-2px);
        }

        &:active {
          transform: translateY(0);
        }
      }
    }

    /* 关于卡片 */
    .about-card {
      grid-column: 1 / -1;
    }

    .about-content {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 16px;
    }

    .about-item {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .about-label {
      font-size: 12px;
      font-weight: 600;
      color: #6c757d;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .about-value {
      font-size: 15px;
      color: #1a1a2e;
      font-weight: 500;
    }

    .badge {
      display: inline-block;
      padding: 4px 12px;
      background: rgba(102, 126, 234, 0.1);
      color: #667eea;
      border-radius: 20px;
      font-size: 13px;
      font-weight: 600;
    }

    /* 响应式 */
    @media (max-width: 768px) {
      .settings-container {
        padding: 16px;
      }

      .settings-grid {
        grid-template-columns: 1fr;
      }

      .about-content {
        grid-template-columns: 1fr;
      }

      .page-title {
        font-size: 24px;
      }
    }
  `]
})
export class SettingsComponent {
  constructor(
    private router: Router,
    private importExportService: ImportExportService,
    private snackBar: MatSnackBar
  ) {}

  goBack(): void {
    void this.router.navigate(['/dashboard']);
  }

  resetSetup(): void {
    if (confirm('确定要重置配置吗？')) {
      localStorage.removeItem('user-profile');
      void this.router.navigate(['/setup-wizard']);
    }
  }

  exportCourses(): void {
    // TODO: 实现导出功能
    this.snackBar.open('教程库导出功能开发中', '关闭', { duration: 3000 });
  }

  importCourses(): void {
    // TODO: 实现导入功能
    this.snackBar.open('教程库导入功能开发中', '关闭', { duration: 3000 });
  }

  exportMaterials(): void {
    // TODO: 实现导出功能
    this.snackBar.open('课件清单导出功能开发中', '关闭', { duration: 3000 });
  }

  backupDatabase(): void {
    // TODO: 实现备份功能
    this.snackBar.open('数据库备份功能开发中', '关闭', { duration: 3000 });
  }

  restoreDatabase(): void {
    // TODO: 实现恢复功能
    this.snackBar.open('数据库恢复功能开发中', '关闭', { duration: 3000 });
  }
}
