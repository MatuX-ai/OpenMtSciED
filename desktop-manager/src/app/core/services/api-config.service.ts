import { Injectable } from '@angular/core';
import { ApiConfig, ApiProvider, ApiTestResult, API_CONFIG_TEMPLATES } from '../models/api-config.model';

@Injectable({
  providedIn: 'root'
})
export class ApiConfigService {
  private readonly STORAGE_KEY = 'api-config';

  async saveConfig(config: ApiConfig): Promise<void> {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(config));
    } catch (error) {
      console.error('Failed to save API config:', error);
      throw error;
    }
  }

  async getConfig(): Promise<ApiConfig | null> {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Failed to load API config:', error);
      return null;
    }
  }

  async clearConfig(): Promise<void> {
    localStorage.removeItem(this.STORAGE_KEY);
  }

  async testConnection(config: ApiConfig): Promise<ApiTestResult> {
    try {
      // 模拟API连接测试（实际应调用真实API）
      if (!config.apiKey && config.provider !== 'ollama') {
        return {
          success: false,
          errorMessage: 'API Key不能为空'
        };
      }

      if (!config.apiUrl && config.provider === 'ollama') {
        return {
          success: false,
          errorMessage: 'Ollama地址不能为空'
        };
      }

      // 这里可以添加真实的API测试逻辑
      // 暂时返回模拟成功
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            success: true,
            responseTime: 500,
            availableModels: [config.model || 'gpt-4']
          });
        }, 1000);
      });
    } catch (error) {
      return {
        success: false,
        errorMessage: error instanceof Error ? error.message : '测试失败'
      };
    }
  }

  getConfigTemplates() {
    return API_CONFIG_TEMPLATES;
  }
}
