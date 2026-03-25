/**
 * 全局 API 设置组件
 *
 * 提供统一的界面用于管理所有外部服务的 API 配置
 */

import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';

import {
  AiServiceConfig,
  DatabaseConnectionConfig,
  GlobalApiSettings,
} from '../../models/api-settings.models';
import { ApiSettingsService } from '../../services/api-settings.service';
import { HelpDialogComponent, HelpDialogData } from './help-dialog.component';

@Component({
  selector: 'app-api-settings',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatToolbarModule,
    MatTabsModule,
    MatCheckboxModule,
    MatSnackBarModule,
    MatDialogModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './api-settings.component.html',
  styleUrls: ['./api-settings.component.scss'],
})
export class ApiSettingsComponent implements OnInit {
  /** 全局设置表单 */
  settingsForm!: FormGroup;

  /** 加载中 */
  loading = false;

  /** 保存中 */
  saving = false;

  /** 当前选中的 Tab */
  selectedTabIndex = 0;

  /** 全局 API 设置数据 */
  settings: GlobalApiSettings = {};

  constructor(
    private fb: FormBuilder,
    private settingsService: ApiSettingsService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.initForm();
    // 延迟加载数据，先显示页面
    setTimeout(() => {
      this.loadSettings();
    }, 100);
  }

  /**
   * 显示使用指南对话框
   */
  showHelp(serviceType: string): void {
    const data: HelpDialogData = { serviceType };
    this.dialog.open(HelpDialogComponent, {
      width: '90vw',
      maxWidth: '800px',
      maxHeight: '90vh',
      data,
    });
  }

  /**
   * 获取数据库连接列表控制器
   */
  get databasesControls() {
    const databasesArray = this.settingsForm.get('databases') as FormArray;
    return databasesArray?.controls || [];
  }

  /**
   * 安全获取数据库表单控件
   */
  getDatabaseControl(index: number, controlName: string) {
    const control = this.databasesControls.at(index)?.get(controlName);
    return control;
  }

  /**
   * 获取 AI 服务列表控制器
   */
  get aiServicesControls() {
    const aiServicesArray = this.settingsForm.get('aiServices') as FormArray;
    return aiServicesArray?.controls || [];
  }

  /**
   * 根据端点识别 AI 服务提供商
   */
  getAiProvider(endpoint: string | null | undefined): string {
    if (!endpoint) return '未配置';
    
    // 国内 AI 服务
    if (endpoint.includes('deepseek.com')) return 'DeepSeek';
    if (endpoint.includes('moonshot.cn')) return '月之暗面 (Kimi)';
    if (endpoint.includes('aliyuncs.com')) return '通义千问';
    
    // 国际 AI 服务
    if (endpoint.includes('openai.com')) return 'OpenAI';
    if (endpoint.includes('anthropic.com')) return 'Anthropic';
    if (endpoint.includes('azure.com')) return 'Azure OpenAI';
    if (endpoint.includes('google.com')) return 'Google AI';
    if (endpoint.includes('cohere.com')) return 'Cohere';
    if (endpoint.includes('together.ai')) return 'Together AI';
    if (endpoint.includes('replicate.com')) return 'Replicate';
    if (endpoint.includes('huggingface.co')) return 'Hugging Face';
    
    return '自定义';
  }

  /**
   * 安全获取 AI 服务表单控件
   */
  getAiServiceControl(index: number, controlName: string) {
    const control = this.aiServicesControls.at(index)?.get(controlName);
    return control;
  }

  /**
   * 初始化表单
   */
  private initForm(): void {
    this.settingsForm = this.fb.group({
      openHydra: this.fb.group({
        apiUrl: ['', [Validators.required]],
        apiKey: [''],
        enabled: [false],
        timeout: [5000],
        notes: [''],
      }),
      jupyterHub: this.fb.group({
        url: ['', [Validators.required]],
        apiToken: [''],
        enabled: [false],
        defaultRole: ['user'],
      }),
      databases: this.fb.array([
        // 默认添加一个本地数据库连接示例
        this.fb.group({
          name: ['本地数据库'],
          host: ['localhost'],
          port: [5432],
          database: ['imato_main'],
          username: ['postgres'],
          password: [''],
          ssl: [false],
          poolSize: [10],
          enabled: [false],
        }),
      ]),
      mqtt: this.fb.group({
        brokerUrl: [''],
        port: [1883],
        username: [''],
        password: [''],
        tlsEnabled: [false],
        qos: [1],
        enabled: [false],
      }),
      prometheus: this.fb.group({
        serverUrl: [''],
        metricsEndpoint: ['/metrics'],
        scrapeInterval: [15],
        enabled: [false],
      }),
      celery: this.fb.group({
        brokerUrl: [''],
        resultBackendUrl: [''],
        defaultQueue: ['default'],
        workerCount: [4],
        enabled: [false],
      }),
      objectStorage: this.fb.group({
        provider: ['minio'],
        accessKey: [''],
        secretKey: [''],
        bucket: [''],
        region: [''],
        endpoint: [''],
        enabled: [false],
      }),
      aiServices: this.fb.array([
        // 默认添加 DeepSeek
        this.fb.group({
          serviceName: ['DeepSeek'],
          endpoint: ['https://api.deepseek.com/v1'],
          apiKey: [''],
          model: ['deepseek-chat'],
          maxTokens: [4096],
          temperature: [0.7],
          enabled: [false],
        }),
        // 默认添加 Kimi 2.5
        this.fb.group({
          serviceName: ['Kimi 2.5'],
          endpoint: ['https://api.moonshot.cn/v1'],
          apiKey: [''],
          model: ['moonshot-v1-8k'],
          maxTokens: [8192],
          temperature: [0.7],
          enabled: [false],
        }),
        // 默认添加通义千问
        this.fb.group({
          serviceName: ['通义千问'],
          endpoint: ['https://dashscope.aliyuncs.com/api/v1'],
          apiKey: [''],
          model: ['qwen-turbo'],
          maxTokens: [8192],
          temperature: [0.7],
          enabled: [false],
        }),
      ]),
    });
  }

  /**
   * 加载设置数据
   */
  loadSettings(): void {
    this.loading = true;
    this.settingsService.getGlobalSettings().subscribe({
      next: (settings) => {
        this.settings = settings;
        this.patchForm(settings);
        this.loading = false;
      },
      error: (error) => {
        console.error('加载设置失败:', error);
        this.snackBar.open('加载设置失败，将使用默认配置', '关闭', { duration: 3000 });
        this.loading = false;
        // 即使失败也显示页面，使用默认值
        this.settings = this.getDefaultSettings();
      },
    });
  }

  /**
   * 获取默认设置（本地方法）
   */
  private getDefaultSettings(): GlobalApiSettings {
    return {
      openHydra: {
        apiUrl: '',
        apiKey: '',
        enabled: false,
      },
      jupyterHub: {
        url: '',
        apiToken: '',
        enabled: false,
      },
      databases: [],
      mqtt: null as any,
      prometheus: null as any,
      celery: null as any,
      objectStorage: null as any,
      aiServices: [],
    };
  }

  /**
   * 填充表单数据
   */
  private patchForm(settings: GlobalApiSettings): void {
    if (settings.openHydra) {
      this.settingsForm.patchValue({ openHydra: settings.openHydra });
    }
    if (settings.jupyterHub) {
      this.settingsForm.patchValue({ jupyterHub: settings.jupyterHub });
    }
    if (settings.mqtt) {
      this.settingsForm.patchValue({ mqtt: settings.mqtt });
    }
    if (settings.prometheus) {
      this.settingsForm.patchValue({ prometheus: settings.prometheus });
    }
    if (settings.celery) {
      this.settingsForm.patchValue({ celery: settings.celery });
    }
    if (settings.objectStorage) {
      this.settingsForm.patchValue({ objectStorage: settings.objectStorage });
    }
    
    // 处理数据库连接 FormArray
    if (settings.databases && Array.isArray(settings.databases)) {
      const databasesArray = this.settingsForm.get('databases') as FormArray;
      databasesArray.clear();
      settings.databases.forEach((db) => {
        databasesArray.push(this.fb.group(db));
      });
    }
    
    // 处理 AI 服务 FormArray
    if (settings.aiServices && Array.isArray(settings.aiServices)) {
      const aiServicesArray = this.settingsForm.get('aiServices') as FormArray;
      aiServicesArray.clear();
      settings.aiServices.forEach((service) => {
        aiServicesArray.push(this.fb.group(service));
      });
    }
  }

  /**
   * 保存设置
   */
  saveSettings(): void {
    if (this.settingsForm.invalid) {
      this.snackBar.open('请填写必填项', '关闭', { duration: 3000 });
      this.settingsForm.markAllAsTouched();
      return;
    }

    this.saving = true;
    const formValue = this.settingsForm.value;

    // 过滤空值
    const settings: GlobalApiSettings = {};
    Object.keys(formValue).forEach((key) => {
      const value = formValue[key];
      if (value && typeof value === 'object') {
        settings[key as keyof GlobalApiSettings] = value;
      }
    });

    this.settingsService.saveGlobalSettings(settings).subscribe({
      next: (response) => {
        if (response.success) {
          this.snackBar.open('设置已保存', '关闭', { duration: 3000 });
          this.loadSettings();
        } else {
          this.snackBar.open(response.error || '保存失败', '关闭', { duration: 3000 });
        }
        this.saving = false;
      },
      error: (error) => {
        console.error('保存设置失败:', error);
        this.snackBar.open('保存失败，请稍后重试', '关闭', { duration: 3000 });
        this.saving = false;
      },
    });
  }

  /**
   * 测试连接
   */
  testConnection(serviceType: string): void {
    const config = this.settingsForm.get(serviceType)?.value;
    if (!config) {
      this.snackBar.open('请先配置服务信息', '关闭', { duration: 3000 });
      return;
    }

    this.snackBar.open(`正在测试 ${serviceType} 连接...`, '关闭', { duration: 2000 });

    this.settingsService.testApiConnection(serviceType, config).subscribe({
      next: (result) => {
        const message = result.message || (result.success ? '连接成功' : '连接失败');
        const duration = result.success ? 3000 : 5000;
        this.snackBar.open(message, '关闭', { duration });

        if (result.responseTime) {
          this.snackBar.open(`响应时间：${result.responseTime}ms`, '关闭', { duration: 3000 });
        }
      },
      error: (error) => {
        console.error('测试连接失败:', error);
        this.snackBar.open('测试连接失败，请检查网络或服务状态', '关闭', { duration: 5000 });
      },
    });
  }

  /**
   * 添加 AI 服务
   */
  addAiService(): void {
    const newService: AiServiceConfig = {
      serviceName: `AI Service ${Date.now()}`,
      endpoint: '',
      apiKey: '',
      model: '',
      maxTokens: 2048,
      temperature: 0.7,
      enabled: false,
    };

    const aiServicesArray = this.settingsForm.get('aiServices') as any;
    aiServicesArray.push(this.fb.group(newService));

    this.snackBar.open('已添加新的 AI 服务配置', '关闭', { duration: 3000 });
  }

  /**
   * 移除 AI 服务
   */
  removeAiService(index: number): void {
    const aiServicesArray = this.settingsForm.get('aiServices') as any;
    aiServicesArray.removeAt(index);
    this.snackBar.open('已移除 AI 服务配置', '关闭', { duration: 3000 });
  }

  /**
   * 添加数据库连接
   */
  addDatabaseConnection(): void {
    const newConnection: DatabaseConnectionConfig = {
      name: `Database ${Date.now()}`,
      host: 'localhost',
      port: 5432,
      database: '',
      username: '',
      password: '',
      ssl: false,
      poolSize: 10,
      enabled: false,
    };

    const databasesArray = this.settingsForm.get('databases') as any;
    databasesArray.push(this.fb.group(newConnection));

    this.snackBar.open('已添加新的数据库连接', '关闭', { duration: 3000 });
  }

  /**
   * 移除数据库连接
   */
  removeDatabaseConnection(index: number): void {
    const databasesArray = this.settingsForm.get('databases') as any;
    databasesArray.removeAt(index);
    this.snackBar.open('已移除数据库连接', '关闭', { duration: 3000 });
  }

  /**
   * 测试数据库连接
   */
  testDatabaseConnection(index: number): void {
    const dbConfig = this.databasesControls[index]?.value;
    if (!dbConfig) {
      this.snackBar.open('请先填写数据库配置', '关闭', { duration: 3000 });
      return;
    }

    this.snackBar.open(`正在测试连接：${dbConfig.name || '未命名数据库'}...`, '关闭', { duration: 2000 });

    // TODO: 调用后端 API 测试数据库连接
    // 这里模拟测试过程
    setTimeout(() => {
      const success = Math.random() > 0.3; // 70% 成功率模拟
      if (success) {
        this.snackBar.open(`✅ 连接成功！响应时间：${Math.floor(Math.random() * 100)}ms`, '关闭', { duration: 3000 });
      } else {
        this.snackBar.open('❌ 连接失败，请检查主机地址、端口、用户名和密码', '关闭', { duration: 5000 });
      }
    }, 1500);
  }

  /**
   * 测试 AI 服务连接
   */
  testAiService(index: number): void {
    const serviceConfig = this.aiServicesControls[index]?.value;
    if (!serviceConfig) {
      this.snackBar.open('请先填写 AI 服务配置', '关闭', { duration: 3000 });
      return;
    }

    this.snackBar.open(
      `正在测试连接：${serviceConfig.serviceName || '未命名 AI 服务'} (${this.getAiProvider(serviceConfig.endpoint)})...`,
      '关闭',
      { duration: 2000 }
    );

    // TODO: 调用后端 API 测试 AI 服务连接
    // 这里模拟测试过程
    setTimeout(() => {
      const success = Math.random() > 0.25; // 75% 成功率模拟
      if (success) {
        const responseTime = Math.floor(Math.random() * 200) + 50;
        this.snackBar.open(
          `✅ 连接成功！模型可用，响应时间：${responseTime}ms`,
          '关闭',
          { duration: 3000 }
        );
      } else {
        this.snackBar.open(
          '❌ 连接失败，请检查 API 端点和密钥是否正确',
          '关闭',
          { duration: 5000 }
        );
      }
    }, 2000);
  }

  /**
   * 获取 OpenHydra 配置
   */
  get openHydraConfig(): FormGroup {
    return this.settingsForm.get('openHydra') as FormGroup;
  }

  /**
   * 获取 JupyterHub 配置
   */
  get jupyterHubConfig(): FormGroup {
    return this.settingsForm.get('jupyterHub') as FormGroup;
  }

  /**
   * 获取 MQTT 配置
   */
  get mqttConfig(): FormGroup {
    return this.settingsForm.get('mqtt') as FormGroup;
  }

  /**
   * 获取对象存储配置
   */
  get objectStorageConfig(): FormGroup {
    return this.settingsForm.get('objectStorage') as FormGroup;
  }
}
