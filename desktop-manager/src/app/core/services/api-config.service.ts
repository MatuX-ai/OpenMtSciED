import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

import { ApiConfig, ApiConfigValidation, ApiTestResult } from '../models/api-config.model';

import { TauriService } from './tauri.service';

/**
 * API 配置管理服务
 * 负责管理 AI API 配置的保存、读取、测试和验证
 */
@Injectable({
  providedIn: 'root',
})
export class ApiConfigService {
  private readonly CONFIG_STORAGE_KEY = 'api-config';

  // 当前 API 配置
  private currentConfig$ = new BehaviorSubject<ApiConfig | null>(null);

  // 配置加载状态
  private isLoading$ = new BehaviorSubject<boolean>(false);

  constructor(private tauriService: TauriService) {
    // 初始化时加载配置
    void this.loadConfig();
  }

  /**
   * 获取当前 API 配置（Observable）
   */
  getConfig(): Observable<ApiConfig | null> {
    return this.currentConfig$.asObservable();
  }

  /**
   * 获取当前 API 配置（同步）
   */
  getCurrentConfig(): ApiConfig | null {
    return this.currentConfig$.getValue();
  }

  /**
   * 获取加载状态
   */
  getLoadingStatus(): Observable<boolean> {
    return this.isLoading$.asObservable();
  }

  /**
   * 从本地存储加载配置
   */
  async loadConfig(): Promise<void> {
    this.isLoading$.next(true);
    try {
      const config = await this.tauriService.getApiConfig();
      this.currentConfig$.next(config);
    } catch (error) {
      console.error('Failed to load API config:', error);
      this.currentConfig$.next(null);
    } finally {
      this.isLoading$.next(false);
    }
  }

  /**
   * 保存 API 配置
   */
  async saveConfig(config: Partial<ApiConfig>): Promise<void> {
    this.isLoading$.next(true);
    try {
      // 验证配置
      const validation = this.validateConfig(config);
      if (!validation.isValid) {
        throw new Error(this.getValidationErrorMessage(validation));
      }

      // 保存到后端
      await this.tauriService.saveApiConfig({
        provider: config.provider ?? 'openai',
        api_key: config.apiKey,
        api_url: config.apiUrl,
        model: config.model,
      });

      // 更新本地状态
      const currentConfig = this.currentConfig$.getValue();
      const updatedConfig: ApiConfig = {
        ...(currentConfig ?? {}),
        ...config,
        testConnection: false,
        updatedAt: new Date(),
        createdAt: currentConfig?.createdAt ?? new Date(),
      } as ApiConfig;

      this.currentConfig$.next(updatedConfig);

      // 自动测试连接
      if (config.provider && config.apiKey) {
        await this.testConnection();
      }
    } catch (error) {
      console.error('Failed to save API config:', error);
      throw error;
    } finally {
      this.isLoading$.next(false);
    }
  }

  /**
   * 测试 API 连接
   */
  async testConnection(): Promise<ApiTestResult> {
    const config = this.currentConfig$.getValue();
    if (!config?.provider) {
      return {
        success: false,
        errorMessage: '未配置 API',
      };
    }

    this.isLoading$.next(true);
    try {
      const result = await this.tauriService.testApiConnection({
        provider: config.provider,
        api_key: config.apiKey,
        api_url: config.apiUrl,
        model: config.model,
      });

      // 更新配置中的测试状态
      if (result.success) {
        const updatedConfig: ApiConfig = {
          ...config,
          testConnection: true,
          lastTestTime: new Date(),
        };
        this.currentConfig$.next(updatedConfig);
      }

      return result;
    } catch (error) {
      console.error('API connection test failed:', error);
      return {
        success: false,
        errorMessage: error instanceof Error ? error.message : '连接测试失败',
      };
    } finally {
      this.isLoading$.next(false);
    }
  }

  /**
   * 删除 API 配置
   */
  async deleteConfig(): Promise<void> {
    this.isLoading$.next(true);
    try {
      await this.tauriService.deleteApiConfig();
      this.currentConfig$.next(null);
    } catch (error) {
      console.error('Failed to delete API config:', error);
      throw error;
    } finally {
      this.isLoading$.next(false);
    }
  }

  /**
   * 验证 API 配置
   */
  validateConfig(config: Partial<ApiConfig>): ApiConfigValidation {
    const errors: ApiConfigValidation['errors'] = {};

    this.validateProvider(config, errors);
    this.validateApiKey(config, errors);
    this.validateApiUrl(config, errors);
    this.validateModel(config, errors);

    const isValid = Object.keys(errors).length === 0;
    return {
      isValid,
      errors,
    };
  }

  /**
   * 验证提供商
   */
  private validateProvider(
    config: Partial<ApiConfig>,
    errors: ApiConfigValidation['errors']
  ): void {
    if (!config.provider) {
      errors.provider = '请选择 API 提供商';
    }
  }

  /**
   * 验证 API Key
   */
  private validateApiKey(config: Partial<ApiConfig>, errors: ApiConfigValidation['errors']): void {
    if (config.provider === 'openai' && !config.apiKey) {
      errors.apiKey = '请输入 API Key';
    } else if (config.apiKey && config.apiKey.length < 10) {
      errors.apiKey = 'API Key 格式不正确';
    }
  }

  /**
   * 验证 API URL
   */
  private validateApiUrl(config: Partial<ApiConfig>, errors: ApiConfigValidation['errors']): void {
    if (config.provider === 'custom' && !config.apiUrl) {
      errors.apiUrl = '请输入 API URL';
    } else if (config.apiUrl && !this.isValidUrl(config.apiUrl)) {
      errors.apiUrl = 'URL 格式不正确';
    }
  }

  /**
   * 验证模型名称
   */
  private validateModel(config: Partial<ApiConfig>, errors: ApiConfigValidation['errors']): void {
    if (config.provider === 'openai' && !config.model) {
      errors.model = '请选择模型';
    }
  }

  /**
   * 检查是否已配置 API
   */
  isConfigured(): boolean {
    const config = this.currentConfig$.getValue();
    return !!config?.provider;
  }

  /**
   * 检查配置是否已测试通过
   */
  isTested(): boolean {
    const config = this.currentConfig$.getValue();
    return !!config?.testConnection;
  }

  /**
   * 获取配置显示名称
   */
  getConfigDisplayName(): string {
    const config = this.currentConfig$.getValue();
    if (!config) return '未配置';

    switch (config.provider) {
      case 'openai':
        return `OpenAI (${config.model ?? 'GPT'})`;
      case 'ollama':
        return `Ollama (${config.model ?? '本地模型'})`;
      case 'custom':
        return '自定义 API';
      default:
        return '未知';
    }
  }

  /**
   * 获取验证错误消息
   */
  private getValidationErrorMessage(validation: ApiConfigValidation): string {
    const messages: string[] = [];
    if (validation.errors.provider) messages.push(validation.errors.provider);
    if (validation.errors.apiKey) messages.push(validation.errors.apiKey);
    if (validation.errors.apiUrl) messages.push(validation.errors.apiUrl);
    if (validation.errors.model) messages.push(validation.errors.model);
    return messages.join('；');
  }

  /**
   * 验证 URL 格式
   */
  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }
}
