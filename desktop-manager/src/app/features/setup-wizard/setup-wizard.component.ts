import { STEPPER_GLOBAL_OPTIONS } from '@angular/cdk/stepper';
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatStepperModule } from '@angular/material/stepper';
import { Router } from '@angular/router';

import {
  API_CONFIG_TEMPLATES,
  ApiConfigTemplate,
  ApiProvider,
} from '../../core/models/api-config.model';
import { ApiConfigService } from '../../core/services/api-config.service';

@Component({
  selector: 'app-setup-wizard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatCardModule,
    MatDividerModule,
    MatStepperModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
  ],
  providers: [
    {
      provide: STEPPER_GLOBAL_OPTIONS,
      useValue: { displayDefaultIndicatorType: false },
    },
  ],
  template: `
    <div class="wizard-container">
      <mat-card class="wizard-card">
        <mat-card-header>
          <mat-card-title>📚 OpenMTSciEd 桌面管理器</mat-card-title>
          <mat-card-subtitle>首次使用向导</mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          <mat-stepper [linear]="false" #stepper>
            <!-- 步骤1: 欢迎 -->
            <mat-step [completed]="true">
              <ng-template matStepLabel>欢迎</ng-template>
              <div class="step-content">
                <h3>🎓 欢迎使用 OpenMTSciEd Desktop Manager</h3>
                <p class="intro-text">专为 STEM 教育工作者设计的开源资源管理工具</p>

                <div class="philosophy-section">
                  <h4>💡 我们的教育理念</h4>
                  <ul class="philosophy-list">
                    <li><strong>现象驱动学习:</strong> 从现实现象出发,激发学生好奇心</li>
                    <li><strong>跨学科融合:</strong> 打通科学、技术、工程、数学边界</li>
                    <li><strong>低成本实践:</strong> 所有硬件项目预算 ≤50 元,适合普惠教育</li>
                    <li><strong>连贯学习路径:</strong> 小学→初中→高中→大学,循序渐进</li>
                  </ul>
                </div>

                <div class="resources-section">
                  <h4>📚 支持的开源资源</h4>
                  <div class="resource-grid">
                    <div class="resource-item">
                      <i class="ri-book-open-line"></i>
                      <span><strong>OpenSciEd</strong> - K-12 现象驱动教程</span>
                    </div>
                    <div class="resource-item">
                      <i class="ri-flask-line"></i>
                      <span><strong>格物斯坦</strong> - 开源硬件教程</span>
                    </div>
                    <div class="resource-item">
                      <i class="ri-graduation-cap-line"></i>
                      <span><strong>OpenStax</strong> - 大学/高中教材</span>
                    </div>
                    <div class="resource-item">
                      <i class="ri-video-line"></i>
                      <span><strong>TED-Ed</strong> - STEM 教育视频</span>
                    </div>
                  </div>
                </div>

                <div class="features-section">
                  <h4>✨ 核心特性</h4>
                  <ul class="feature-list">
                    <li>✅ <strong>一键获取资源</strong> - 从开源库快速下载教程和课件</li>
                    <li>✅ <strong>智能学习路径</strong> - 知识图谱自动关联教程与课件</li>
                    <li>✅ <strong>离线可用</strong> - 无需网络连接,数据本地存储</li>
                    <li>✅ <strong>隐私保护</strong> - 所有数据仅存储在您的设备上</li>
                  </ul>
                </div>
              </div>
              <div class="step-actions">
                <button mat-raised-button color="primary" matStepperNext>
                  开始设置 <i class="ri-arrow-right-line"></i>
                </button>
              </div>
            </mat-step>

            <!-- 步骤2: 基本信息 -->
            <mat-step>
              <ng-template matStepLabel>基本信息</ng-template>
              <div class="step-content">
                <h3>配置您的工作环境</h3>
                <form class="setup-form">
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>教师姓名</mat-label>
                    <input
                      matInput
                      [(ngModel)]="teacherName"
                      name="teacherName"
                      placeholder="请输入您的姓名"
                    />
                  </mat-form-field>

                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>学校/机构名称</mat-label>
                    <input
                      matInput
                      [(ngModel)]="schoolName"
                      name="schoolName"
                      placeholder="请输入学校或机构名称"
                    />
                  </mat-form-field>

                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>主要教学科目</mat-label>
                    <mat-select [(ngModel)]="subject" name="subject">
                      <mat-optgroup label="STEM 核心学科">
                        <mat-option value="physics">物理</mat-option>
                        <mat-option value="chemistry">化学</mat-option>
                        <mat-option value="biology">生物</mat-option>
                        <mat-option value="math">数学</mat-option>
                      </mat-optgroup>
                      <mat-optgroup label="技术与工程">
                        <mat-option value="computer-science">计算机科学</mat-option>
                        <mat-option value="engineering">工程技术</mat-option>
                        <mat-option value="robotics">机器人技术</mat-option>
                      </mat-optgroup>
                      <mat-optgroup label="其他学科">
                        <mat-option value="general-science">综合科学</mat-option>
                        <mat-option value="stem-integrated">STEM 跨学科</mat-option>
                        <mat-option value="other">其他</mat-option>
                      </mat-optgroup>
                    </mat-select>
                  </mat-form-field>
                </form>
              </div>
              <div class="step-actions">
                <button mat-button matStepperPrevious>上一步</button>
                <button
                  mat-raised-button
                  color="primary"
                  matStepperNext
                  [disabled]="!teacherName || !schoolName"
                >
                  下一步 <i class="ri-arrow-right-line"></i>
                </button>
              </div>
            </mat-step>

            <!-- 步骤3: AI 配置(可选) -->
            <mat-step>
              <ng-template matStepLabel>AI 配置(可选)</ng-template>
              <div class="step-content">
                <h3>🤖 配置 AI 辅助功能 (可选)</h3>
                <p class="step-desc">
                  AI 功能可以帮您解释知识点衔接、生成学习建议。<br />
                  <strong>此步骤可跳过</strong>,不影响基本使用。应用默认启用离线模式。
                </p>

                <div class="offline-badge">
                  <i class="ri-wifi-off-line"></i>
                  <span
                    ><strong>离线模式已启用</strong> - 即使不配置 AI,也能正常使用所有核心功能</span
                  >
                </div>

                <form class="setup-form">
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>选择 AI 提供商 (可选)</mat-label>
                    <mat-select
                      [(ngModel)]="selectedProvider"
                      name="provider"
                      (selectionChange)="onProviderChange()"
                    >
                      <mat-option value="none">不使用 AI (推荐)</mat-option>
                      <mat-divider></mat-divider>
                      <mat-optgroup label="开源模型 (推荐)">
                        <mat-option
                          *ngFor="let template of openSourceProviders"
                          [value]="template.provider"
                        >
                          {{ template.name }}
                        </mat-option>
                      </mat-optgroup>
                      <mat-optgroup label="商业模型">
                        <mat-option
                          *ngFor="let template of commercialProviders"
                          [value]="template.provider"
                        >
                          {{ template.name }}
                        </mat-option>
                      </mat-optgroup>
                    </mat-select>
                  </mat-form-field>

                  <ng-container *ngIf="selectedProvider !== 'none'">
                    <mat-form-field
                      appearance="outline"
                      class="full-width"
                      *ngIf="selectedProvider !== 'ollama' && selectedProvider !== 'minicpm'"
                    >
                      <mat-label>API Key</mat-label>
                      <input
                        matInput
                        [(ngModel)]="apiKey"
                        name="apiKey"
                        type="password"
                        placeholder="sk-..."
                      />
                    </mat-form-field>

                    <mat-form-field appearance="outline" class="full-width">
                      <mat-label>API URL</mat-label>
                      <input
                        matInput
                        [(ngModel)]="apiUrl"
                        name="apiUrl"
                        placeholder="https://..."
                      />
                    </mat-form-field>

                    <mat-form-field appearance="outline" class="full-width">
                      <mat-label>模型名称</mat-label>
                      <input
                        matInput
                        [(ngModel)]="selectedModel"
                        name="model"
                        placeholder="例如: MiniCPM-2B"
                      />
                    </mat-form-field>

                    <div class="test-connection-section" *ngIf="testResult">
                      <div
                        class="test-result"
                        [class.success]="testResult.success"
                        [class.error]="!testResult.success"
                      >
                        <i
                          [class]="
                            testResult.success ? 'ri-checkbox-circle-line' : 'ri-error-warning-line'
                          "
                        ></i>
                        <span>{{ testResult.message }}</span>
                      </div>
                    </div>
                  </ng-container>
                </form>
              </div>
              <div class="step-actions">
                <button mat-button matStepperPrevious>上一步</button>
                <button mat-button (click)="skipAiConfig()" *ngIf="isProviderNone() || !apiKey">
                  跳过此步骤
                </button>
                <button
                  mat-button
                  (click)="testApiConnection()"
                  [disabled]="isTestingConnection || isProviderNone()"
                  *ngIf="!isProviderNone()"
                >
                  {{ isTestingConnection ? '测试中...' : '测试连接' }}
                </button>
                <button mat-raised-button color="primary" matStepperNext>
                  下一步 <i class="ri-arrow-right-line"></i>
                </button>
              </div>
            </mat-step>

            <!-- 步骤4: 数据存储 -->
            <mat-step>
              <ng-template matStepLabel>数据存储</ng-template>
              <div class="step-content">
                <h3>配置数据存储位置</h3>
                <div class="storage-info">
                  <div class="storage-card">
                    <div class="storage-icon">
                      <i class="ri-database-2-line"></i>
                    </div>
                    <div class="storage-details">
                      <h4>本地数据库</h4>
                      <p>课程和课件数据将存储在本地 SQLite 数据库中</p>
                      <code class="storage-path">{{ dataPath }}</code>
                    </div>
                  </div>

                  <div class="storage-card">
                    <div class="storage-icon">
                      <i class="ri-folder-3-line"></i>
                    </div>
                    <div class="storage-details">
                      <h4>课件存储目录</h4>
                      <p>下载的课件文件将存储在此目录</p>
                      <code class="storage-path">{{ materialsPath }}</code>
                    </div>
                  </div>

                  <div class="storage-card">
                    <div class="storage-icon">
                      <i class="ri-shield-check-line"></i>
                    </div>
                    <div class="storage-details">
                      <h4>数据安全</h4>
                      <p>所有数据仅存储在您的本地设备上，不会上传到云端</p>
                    </div>
                  </div>
                </div>

                <div class="storage-warning">
                  <i class="ri-alert-line"></i>
                  <p>
                    <strong>提示：</strong>请确保存储驱动器有足够的可用空间。建议至少预留 10GB
                    用于存储课件资源。
                  </p>
                </div>
              </div>
              <div class="step-actions">
                <button mat-button matStepperPrevious>上一步</button>
                <button mat-raised-button color="primary" matStepperNext>
                  下一步 <i class="ri-arrow-right-line"></i>
                </button>
              </div>
            </mat-step>

            <!-- 步骤5: 完成 -->
            <mat-step>
              <ng-template matStepLabel>完成</ng-template>
              <div class="step-content completion">
                <div class="success-icon">✓</div>
                <h3>设置完成！</h3>
                <p>您已准备好开始使用 OpenMTSciEd Desktop Manager</p>
                <div class="summary">
                  <p><strong>教师：</strong>{{ teacherName }}</p>
                  <p><strong>学校：</strong>{{ schoolName }}</p>
                  <p><strong>科目：</strong>{{ getSubjectName() }}</p>
                  <p><strong>数据存储：</strong>{{ dataPath }}</p>
                </div>
              </div>
              <div class="step-actions">
                <button mat-button matStepperPrevious>上一步</button>
                <button mat-raised-button color="primary" (click)="finishSetup()">
                  进入系统 <i class="ri-rocket-line"></i>
                </button>
              </div>
            </mat-step>
          </mat-stepper>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [
    `
      .wizard-container {
        min-height: calc(100vh - 60px);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 40px 20px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      }

      .wizard-card {
        max-width: 800px;
        width: 100%;
        border-radius: 16px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
      }

      mat-card-header {
        margin-bottom: 24px;
        text-align: center;
      }

      mat-card-title {
        font-size: 24px;
        font-weight: 600;
        color: #667eea;
      }

      mat-card-subtitle {
        font-size: 14px;
        color: #666;
        margin-top: 8px;
      }

      .step-content {
        padding: 20px 0;
        min-height: 300px;
      }

      h3 {
        color: #333;
        margin-bottom: 16px;
        font-size: 20px;
      }

      p {
        color: #666;
        line-height: 1.6;
        margin-bottom: 12px;
      }

      .feature-list {
        list-style: none;
        padding: 0;
        margin: 24px 0;
      }

      .feature-list li {
        padding: 12px 0;
        color: #555;
        font-size: 15px;
        border-bottom: 1px solid #f0f0f0;
      }

      .feature-list li:last-child {
        border-bottom: none;
      }

      .setup-form {
        display: flex;
        flex-direction: column;
        gap: 16px;
        margin-top: 20px;
      }

      .full-width {
        width: 100%;
      }

      .step-actions {
        display: flex;
        justify-content: space-between;
        margin-top: 24px;
        padding-top: 16px;
        border-top: 1px solid #e0e0e0;
      }

      .completion {
        text-align: center;
        display: flex;
        flex-direction: column;
        align-items: center;
      }

      .success-icon {
        width: 80px;
        height: 80px;
        border-radius: 50%;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 40px;
        margin: 0 auto 24px;
        box-shadow: 0 4px 16px rgba(102, 126, 234, 0.3);
      }

      .summary {
        background: #f5f7fa;
        padding: 20px;
        border-radius: 8px;
        margin-top: 24px;
        text-align: left;
        width: 100%;
        max-width: 400px;
      }

      .summary p {
        margin: 8px 0;
        color: #333;
      }

      button i {
        margin-left: 8px;
      }

      ::ng-deep .mat-horizontal-stepper-header {
        pointer-events: none !important;
      }

      /* 新增样式 - STEM 教育理念 */
      .intro-text {
        font-size: 16px;
        color: #667eea;
        font-weight: 500;
        margin-bottom: 24px;
      }

      .philosophy-section,
      .resources-section,
      .features-section {
        margin: 24px 0;
        padding: 16px;
        background: #f8f9fa;
        border-radius: 8px;
      }

      .philosophy-section h4,
      .resources-section h4,
      .features-section h4 {
        margin: 0 0 12px 0;
        color: #333;
        font-size: 16px;
      }

      .philosophy-list {
        list-style: none;
        padding: 0;
        margin: 0;
      }

      .philosophy-list li {
        padding: 8px 0;
        color: #555;
        line-height: 1.6;
      }

      .resource-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 12px;
      }

      .resource-item {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 12px;
        background: white;
        border-radius: 6px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
      }

      .resource-item i {
        font-size: 24px;
        color: #667eea;
      }

      .resource-item span {
        font-size: 14px;
        color: #555;
      }

      .offline-badge {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 12px 16px;
        background: #e8f5e9;
        border-left: 4px solid #4caf50;
        border-radius: 4px;
        margin: 16px 0;
      }

      .offline-badge i {
        font-size: 20px;
        color: #4caf50;
      }

      .offline-badge span {
        font-size: 14px;
        color: #2e7d32;
      }
    `,
  ],
})
export class SetupWizardComponent implements OnInit {
  teacherName = '';
  schoolName = '';
  subject = '';
  dataPath = '';
  materialsPath = '';

  // API 配置相关
  apiTemplates: ApiConfigTemplate[] = API_CONFIG_TEMPLATES;
  openSourceProviders: ApiConfigTemplate[] = API_CONFIG_TEMPLATES.filter(
    (t) => t.provider === 'minicpm' || t.provider === 'codelama' || t.provider === 'ollama'
  );
  commercialProviders: ApiConfigTemplate[] = API_CONFIG_TEMPLATES.filter(
    (t) => t.provider !== 'minicpm' && t.provider !== 'codelama' && t.provider !== 'ollama'
  );
  selectedProvider: ApiProvider | 'none' = 'none'; // 默认不使用 AI
  apiKey = '';
  apiUrl = '';
  selectedModel = '';
  isTestingConnection = false;
  testResult: { success?: boolean; message?: string } | null = null;

  constructor(
    private router: Router,
    private apiConfigService: ApiConfigService
  ) {}

  ngOnInit(): void {
    // 设置默认存储路径
    this.dataPath = this.getDefaultDataPath();
    this.materialsPath = this.getDefaultMaterialsPath();
  }

  private getDefaultDataPath(): string {
    // 在 Tauri 环境中，使用系统 AppData 目录
    return '%APPDATA%\\com.openmtscied.desktop-manager\\';
  }

  private getDefaultMaterialsPath(): string {
    return this.getDefaultDataPath() + 'materials\\';
  }

  getSubjectName(): string {
    const subjects: { [key: string]: string } = {
      // STEM 核心学科
      physics: '物理',
      chemistry: '化学',
      biology: '生物',
      math: '数学',
      // 技术与工程
      'computer-science': '计算机科学',
      engineering: '工程技术',
      robotics: '机器人技术',
      // 其他学科
      'general-science': '综合科学',
      'stem-integrated': 'STEM 跨学科',
      other: '其他',
    };
    return subjects[this.subject] || '未选择';
  }

  skipAiConfig(): void {
    this.selectedProvider = 'none';
    this.apiKey = '';
    this.apiUrl = '';
    this.selectedModel = '';
  }

  isProviderNone(): boolean {
    return this.selectedProvider === 'none';
  }

  async finishSetup(): Promise<void> {
    // 保存用户配置到本地存储
    const profile = {
      teacherName: this.teacherName,
      schoolName: this.schoolName,
      subject: this.subject,
      enableOffline: true, // 默认启用离线模式
    };

    try {
      localStorage.setItem('user-profile', JSON.stringify(profile));

      // 仅当用户选择了 AI 提供商时才保存 API 配置
      if (this.selectedProvider && this.selectedProvider !== 'none') {
        await this.apiConfigService.saveConfig({
          provider: this.selectedProvider,
          apiKey: this.apiKey,
          apiUrl: this.apiUrl,
          model: this.selectedModel,
        });
      }
    } catch (error) {
      console.error('保存配置失败:', error);
    }

    // 导航到仪表盘
    void this.router.navigate(['/dashboard']);
  }

  onProviderChange(): void {
    const template = this.apiTemplates.find((t) => t.provider === this.selectedProvider);
    if (template) {
      this.apiUrl = template.defaultUrl;
      this.selectedModel = template.recommendedModel;
    }
  }

  async testApiConnection(): Promise<void> {
    if (this.selectedProvider === 'none') {
      return;
    }

    this.isTestingConnection = true;
    this.testResult = null;

    try {
      // 临时保存配置以进行测试
      await this.apiConfigService.saveConfig({
        provider: this.selectedProvider,
        apiKey: this.apiKey,
        apiUrl: this.apiUrl,
        model: this.selectedModel,
      });

      const result = await this.apiConfigService.testConnection();
      this.testResult = {
        success: result.success,
        message: result.success ? '连接成功！' : (result.errorMessage ?? '连接失败'),
      };
    } catch (error) {
      this.testResult = {
        success: false,
        message: '测试过程中发生错误',
      };
    } finally {
      this.isTestingConnection = false;
    }
  }
}
