import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

interface SystemSettings {
  ai_service?: {
    enabled: boolean;
    provider: string;
    api_key?: string;
  };
  database?: {
    host: string;
    port: number;
    name: string;
  };
  storage?: {
    type: string;
    path: string;
  };
}

@Component({
  selector: 'app-admin-settings',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTabsModule,
    MatInputModule,
    MatSelectModule,
    MatSlideToggleModule,
  ],
  template: `
    <div class="admin-settings">
      <!-- 头部 -->
      <div class="header">
        <h2>
          <mat-icon>settings</mat-icon>
          系统设置
        </h2>
        <div class="header-actions">
          <button mat-stroked-button color="primary" (click)="loadSettings()">
            <mat-icon>refresh</mat-icon>
            刷新
          </button>
          <button mat-flat-button color="primary" (click)="saveSettings()" [disabled]="saving()">
            <mat-icon>save</mat-icon>
            {{ saving() ? '保存中...' : '保存设置' }}
          </button>
        </div>
      </div>

      <!-- 加载状态 -->
      <div *ngIf="loading()" class="loading-container">
        <mat-progress-spinner mode="indeterminate"></mat-progress-spinner>
        <p>加载设置...</p>
      </div>

      <!-- 设置内容 -->
      <div *ngIf="!loading()" class="settings-container">
        <mat-tab-group>
          <!-- AI服务设置 -->
          <mat-tab label="AI服务配置">
            <div class="tab-content">
              <mat-card>
                <mat-card-header>
                  <mat-card-title>AI服务提供商</mat-card-title>
                  <mat-card-subtitle>配置AI服务的提供商和API密钥</mat-card-subtitle>
                </mat-card-header>
                <mat-card-content>
                  <div class="form-group">
                    <mat-slide-toggle [(ngModel)]="aiService.enabled">
                      启用AI服务
                    </mat-slide-toggle>
                  </div>

                  <div class="form-group">
                    <mat-form-field appearance="outline" class="full-width">
                      <mat-label>AI提供商</mat-label>
                      <mat-select [(ngModel)]="aiService.provider">
                        <mat-option value="openai">OpenAI</mat-option>
                        <mat-option value="azure">Azure OpenAI</mat-option>
                        <mat-option value="anthropic">Anthropic Claude</mat-option>
                        <mat-option value="google">Google Gemini</mat-option>
                        <mat-option value="deepseek">DeepSeek</mat-option>
                        <mat-option value="qwen">通义千问</mat-option>
                        <mat-option value="local">本地模型</mat-option>
                      </mat-select>
                    </mat-form-field>
                  </div>

                  <div class="form-group">
                    <mat-form-field appearance="outline" class="full-width">
                      <mat-label>API密钥</mat-label>
                      <input matInput type="password" [(ngModel)]="aiService.api_key"
                             placeholder="输入API密钥">
                    </mat-form-field>
                  </div>
                </mat-card-content>
              </mat-card>
            </div>
          </mat-tab>

          <!-- 数据库设置 -->
          <mat-tab label="数据库配置">
            <div class="tab-content">
              <mat-card>
                <mat-card-header>
                  <mat-card-title>数据库连接</mat-card-title>
                  <mat-card-subtitle>配置数据库连接参数</mat-card-subtitle>
                </mat-card-header>
                <mat-card-content>
                  <div class="form-row">
                    <mat-form-field appearance="outline">
                      <mat-label>主机地址</mat-label>
                      <input matInput [(ngModel)]="database.host" placeholder="localhost">
                    </mat-form-field>

                    <mat-form-field appearance="outline">
                      <mat-label>端口</mat-label>
                      <input matInput type="number" [(ngModel)]="database.port" placeholder="5432">
                    </mat-form-field>
                  </div>

                  <div class="form-group">
                    <mat-form-field appearance="outline" class="full-width">
                      <mat-label>数据库名称</mat-label>
                      <input matInput [(ngModel)]="database.name" placeholder="openmtscied">
                    </mat-form-field>
                  </div>
                </mat-card-content>
              </mat-card>
            </div>
          </mat-tab>

          <!-- 存储设置 -->
          <mat-tab label="存储配置">
            <div class="tab-content">
              <mat-card>
                <mat-card-header>
                  <mat-card-title>文件存储</mat-card-title>
                  <mat-card-subtitle>配置文件存储路径和类型</mat-card-subtitle>
                </mat-card-header>
                <mat-card-content>
                  <div class="form-group">
                    <mat-form-field appearance="outline" class="full-width">
                      <mat-label>存储类型</mat-label>
                      <mat-select [(ngModel)]="storage.type">
                        <mat-option value="local">本地存储</mat-option>
                        <mat-option value="s3">AWS S3</mat-option>
                        <mat-option value="minio">MinIO</mat-option>
                      </mat-select>
                    </mat-form-field>
                  </div>

                  <div class="form-group">
                    <mat-form-field appearance="outline" class="full-width">
                      <mat-label>存储路径</mat-label>
                      <input matInput [(ngModel)]="storage.path"
                             placeholder="/data/storage">
                    </mat-form-field>
                  </div>
                </mat-card-content>
              </mat-card>
            </div>
          </mat-tab>
        </mat-tab-group>
      </div>
    </div>
  `,
  styles: [`
    .admin-settings {
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 1px solid #e0e0e0;
    }

    .header h2 {
      display: flex;
      align-items: center;
      gap: 10px;
      margin: 0;
      color: #333;
    }

    .header-actions {
      display: flex;
      gap: 10px;
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px 20px;
      color: #666;
    }

    .settings-container {
      margin-top: 20px;
    }

    .tab-content {
      padding: 20px 0;
    }

    .form-group {
      margin-bottom: 20px;
    }

    .form-row {
      display: flex;
      gap: 15px;
      margin-bottom: 20px;
    }

    .form-row mat-form-field {
      flex: 1;
    }

    .full-width {
      width: 100%;
    }

    @media (max-width: 768px) {
      .header {
        flex-direction: column;
        gap: 15px;
        align-items: stretch;
      }

      .header-actions {
        justify-content: center;
      }

      .form-row {
        flex-direction: column;
        gap: 0;
      }
    }
  `],
})
export class AdminSettingsComponent implements OnInit {
  private http = inject(HttpClient);
  private snackBar = inject(MatSnackBar);

  readonly loading = signal<boolean>(true);
  readonly saving = signal<boolean>(false);

  settings: SystemSettings = {
    ai_service: {
      enabled: false,
      provider: 'openai',
      api_key: ''
    },
    database: {
      host: 'localhost',
      port: 5432,
      name: 'openmtscied'
    },
    storage: {
      type: 'local',
      path: '/data/storage'
    }
  };

  get aiService() { return this.settings.ai_service!; }
  get database() { return this.settings.database!; }
  get storage() { return this.settings.storage!; }

  ngOnInit(): void {
    this.loadSettings();
  }

  async loadSettings(): Promise<void> {
    this.loading.set(true);
    try {
      const response = await firstValueFrom(
        this.http.get<SystemSettings>('/api/v1/admin/settings')
      );

      if (response) {
        this.settings = { ...this.settings, ...response };
      }
    } catch (error) {
      console.error('加载设置失败:', error);
      this.snackBar.open('加载设置失败，使用默认配置', '关闭', { duration: 3000 });
    } finally {
      this.loading.set(false);
    }
  }

  async saveSettings(): Promise<void> {
    this.saving.set(true);
    try {
      await firstValueFrom(
        this.http.post('/api/v1/admin/settings', this.settings)
      );

      this.snackBar.open('设置保存成功', '关闭', { duration: 2000 });
    } catch (error) {
      console.error('保存设置失败:', error);
      this.snackBar.open('保存设置失败', '关闭', { duration: 3000 });
    } finally {
      this.saving.set(false);
    }
  }
}
