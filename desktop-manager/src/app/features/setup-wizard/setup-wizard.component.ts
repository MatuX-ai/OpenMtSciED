import { STEPPER_GLOBAL_OPTIONS } from '@angular/cdk/stepper';
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatStepperModule } from '@angular/material/stepper';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { Router } from '@angular/router';
import { ApiConfigService } from '../../core/services/api-config.service';
import { ApiProvider, ApiConfig } from '../../core/models/api-config.model';

@Component({
  selector: 'app-setup-wizard',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatButtonModule, MatCardModule,
    MatStepperModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatIconModule, MatCheckboxModule
  ],
  providers: [{ provide: STEPPER_GLOBAL_OPTIONS, useValue: { displayDefaultIndicatorType: false } }],
  template: `
    <div class="wizard-container">
      <mat-card class="wizard-card">
        <mat-card-header>
          <mat-card-title>OpenMTSciEd 桌面端</mat-card-title>
          <mat-card-subtitle>首次使用设置</mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          <mat-stepper [linear]="false" #stepper>
            <!-- 步骤1: 欢迎 -->
            <mat-step [completed]="true">
              <ng-template matStepLabel>欢迎</ng-template>
              <div class="step-content">
                <h3>欢迎使用 OpenMTSciEd</h3>
                <p>这是一个开源的 STEM 连贯学习路径引擎。</p>
                <ul>
                  <li>打通教程库与课件库</li>
                  <li>匹配低成本硬件项目 (≤50元)</li>
                  <li>支持离线学习与本地存储</li>
                </ul>
              </div>
              <div class="step-actions">
                <button mat-raised-button color="primary" matStepperNext>开始</button>
              </div>
            </mat-step>

            <!-- 步骤2: 基本信息 -->
            <mat-step>
              <ng-template matStepLabel>基本信息</ng-template>
              <div class="step-content">
                <form class="setup-form">
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>教师姓名</mat-label>
                    <input matInput [(ngModel)]="teacherName" name="teacherName" />
                  </mat-form-field>
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>学校名称</mat-label>
                    <input matInput [(ngModel)]="schoolName" name="schoolName" />
                  </mat-form-field>
                </form>
              </div>
              <div class="step-actions">
                <button mat-button matStepperPrevious>上一步</button>
                <button mat-raised-button color="primary" matStepperNext [disabled]="!teacherName">下一步</button>
              </div>
            </mat-step>

            <!-- 步骤3: 数据存储 -->
            <mat-step>
              <ng-template matStepLabel>数据存储</ng-template>
              <div class="step-content">
                <h3>本地数据存储</h3>
                <p>您的数据将安全存储在本地：</p>
                <div class="info-box">
                  <p><strong>数据库路径：</strong></p>
                  <code>%APPDATA%\openmtscied\database.db</code>
                  <p style="margin-top: 12px;"><strong>课件存储：</strong></p>
                  <code>%APPDATA%\openmtscied\materials\</code>
                </div>
                <div class="warning-box">
                  <mat-icon>warning</mat-icon>
                  <span>建议至少预留 10GB 可用空间</span>
                </div>
              </div>
              <div class="step-actions">
                <button mat-button matStepperPrevious>上一步</button>
                <button mat-raised-button color="primary" matStepperNext>下一步</button>
              </div>
            </mat-step>

            <!-- 步骤4: AI 配置 -->
            <mat-step>
              <ng-template matStepLabel>AI 配置</ng-template>
              <div class="step-content">
                <h3>AI 助手配置（可选）</h3>
                <p>配置 AI 以获得智能教学辅助</p>
                
                <form class="api-config-form">
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>AI 提供商</mat-label>
                    <mat-select [(ngModel)]="apiProvider" name="apiProvider">
                      <mat-option value="openai">OpenAI (GPT)</mat-option>
                      <mat-option value="ollama">Ollama (本地模型)</mat-option>
                      <mat-option value="custom">自定义 API</mat-option>
                    </mat-select>
                  </mat-form-field>

                  <mat-form-field appearance="outline" class="full-width" *ngIf="apiProvider !== 'ollama'">
                    <mat-label>API Key</mat-label>
                    <input matInput [(ngModel)]="apiKey" name="apiKey" type="password" placeholder="sk-..." />
                  </mat-form-field>

                  <mat-form-field appearance="outline" class="full-width" *ngIf="apiProvider === 'ollama' || apiProvider === 'custom'">
                    <mat-label>API 地址</mat-label>
                    <input matInput [(ngModel)]="apiUrl" name="apiUrl" placeholder="http://localhost:11434" />
                  </mat-form-field>

                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>模型名称</mat-label>
                    <input matInput [(ngModel)]="apiModel" name="apiModel" placeholder="gpt-4" />
                  </mat-form-field>

                  <div class="test-section">
                    <button mat-raised-button color="accent" (click)="testApiConnection()" [disabled]="apiTestStatus === 'testing'">
                      <mat-icon>check_circle</mat-icon>
                      {{ apiTestStatus === 'testing' ? '测试中...' : '测试连接' }}
                    </button>
                    
                    <div class="test-result" *ngIf="apiTestMessage" [class]="apiTestStatus">
                      {{ apiTestMessage }}
                    </div>
                  </div>
                </form>
                
                <div class="skip-notice">
                  <mat-icon>info</mat-icon>
                  <span>可以稍后在设置中配置 AI</span>
                </div>
              </div>
              <div class="step-actions">
                <button mat-button matStepperPrevious>上一步</button>
                <button mat-raised-button color="primary" (click)="finishSetup()">进入系统</button>
              </div>
            </mat-step>
          </mat-stepper>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .wizard-container { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: #f5f7fa; padding: 20px; }
    .wizard-card { max-width: 700px; width: 100%; border-radius: 16px; box-shadow: 0 8px 32px rgba(0,0,0,0.1); }
    mat-card-header { margin-bottom: 24px; text-align: center; }
    .step-content { padding: 20px 0; min-height: 200px; }
    .setup-form, .api-config-form { display: flex; flex-direction: column; gap: 16px; margin-top: 20px; }
    .full-width { width: 100%; }
    .step-actions { display: flex; justify-content: space-between; margin-top: 24px; padding-top: 16px; border-top: 1px solid #e0e0e0; }
    .completion { text-align: center; }
    
    /* 数据存储样式 */
    .info-box { 
      background: #f0f4f8; 
      padding: 16px; 
      border-radius: 8px; 
      margin: 16px 0; 
    }
    .info-box code { 
      display: block; 
      background: #e8edf2; 
      padding: 8px; 
      border-radius: 4px; 
      font-family: monospace; 
      font-size: 13px; 
    }
    .warning-box { 
      display: flex; 
      align-items: center; 
      gap: 8px; 
      background: #fff3e0; 
      padding: 12px; 
      border-radius: 8px; 
      border-left: 4px solid #ff9800; 
      margin-top: 16px; 
    }
    
    /* API配置样式 */
    .test-section { 
      margin-top: 16px; 
      display: flex; 
      flex-direction: column; 
      gap: 12px; 
    }
    .test-result { 
      padding: 12px; 
      border-radius: 8px; 
      font-size: 14px; 
    }
    .test-result.success { 
      background: #e8f5e9; 
      color: #2e7d32; 
      border-left: 4px solid #4caf50; 
    }
    .test-result.error { 
      background: #ffebee; 
      color: #c62828; 
      border-left: 4px solid #f44336; 
    }
    .test-result.testing { 
      background: #e3f2fd; 
      color: #1565c0; 
      border-left: 4px solid #2196f3; 
    }
    .skip-notice { 
      display: flex; 
      align-items: center; 
      gap: 8px; 
      margin-top: 16px; 
      padding: 12px; 
      background: #f5f5f5; 
      border-radius: 8px; 
      color: #757575; 
      font-size: 13px; 
    }
  `]
})
export class SetupWizardComponent {
  teacherName = '';
  schoolName = '';
  
  // API配置
  apiProvider: ApiProvider = 'openai';
  apiKey = '';
  apiUrl = '';
  apiModel = 'gpt-4';
  apiTestStatus: 'idle' | 'testing' | 'success' | 'error' = 'idle';
  apiTestMessage = '';

  constructor(private router: Router, private apiConfigService: ApiConfigService) {}

  async testApiConnection(): Promise<void> {
    this.apiTestStatus = 'testing';
    this.apiTestMessage = '正在测试连接...';
    
    try {
      const result = await this.apiConfigService.testConnection({
        provider: this.apiProvider,
        apiKey: this.apiKey,
        apiUrl: this.apiUrl,
        model: this.apiModel,
        testConnection: false
      });
      
      if (result.success) {
        this.apiTestStatus = 'success';
        this.apiTestMessage = `✅ 连接成功！可用模型：${result.availableModels?.join(', ') || this.apiModel}`;
      } else {
        this.apiTestStatus = 'error';
        this.apiTestMessage = `❌ 连接失败：${result.errorMessage || '未知错误'}`;
      }
    } catch (error) {
      this.apiTestStatus = 'error';
      this.apiTestMessage = `❌ 测试出错：${error}`;
    }
  }

  async finishSetup(): Promise<void> {
    // 保存用户信息
    localStorage.setItem('user-profile', JSON.stringify({ 
      teacherName: this.teacherName, 
      schoolName: this.schoolName 
    }));
    
    // 保存API配置
    if (this.apiKey || this.apiUrl) {
      const apiConfig: ApiConfig = {
        provider: this.apiProvider,
        apiKey: this.apiKey,
        apiUrl: this.apiUrl,
        model: this.apiModel,
        testConnection: this.apiTestStatus === 'success'
      };
      await this.apiConfigService.saveConfig(apiConfig);
    }
    
    void this.router.navigate(['/dashboard']);
  }
}
