/**
 * API 配置相关类型定义
 */

/**
 * AI 服务提供商类型
 */
export type ApiProvider =
  | 'openai'
  | 'ollama'
  | 'deepseek'
  | 'qwen'
  | 'kimi'
  | 'mgl'
  | 'minicpm' // 新增:MiniCPM 开源模型
  | 'codelama' // 新增:CodeLlama 开源模型
  | 'matux-cloud' // MatuX 云服务
  | 'custom';

/**
 * API 配置接口
 */
export interface ApiConfig {
  /** 服务提供商 */
  provider: ApiProvider;

  /** API Key（OpenAI 等需要） */
  apiKey?: string;

  /** API 基础 URL */
  apiUrl?: string;

  /** 模型名称 */
  model?: string;

  /** 是否已测试连接 */
  testConnection: boolean;

  /** 最后测试时间 */
  lastTestTime?: Date;

  /** 配置创建时间 */
  createdAt?: Date;

  /** 配置更新时间 */
  updatedAt?: Date;
}

/**
 * API 连接测试结果
 */
export interface ApiTestResult {
  /** 是否成功 */
  success: boolean;

  /** 响应时间（毫秒） */
  responseTime?: number;

  /** 错误消息 */
  errorMessage?: string;

  /** 可用模型列表 */
  availableModels?: string[];
}

/**
 * API 配置验证结果
 */
export interface ApiConfigValidation {
  /** 是否有效 */
  isValid: boolean;

  /** 错误字段 */
  errors: {
    provider?: string;
    apiKey?: string;
    apiUrl?: string;
    model?: string;
  };
}

/**
 * 预设的 API 配置模板
 */
export interface ApiConfigTemplate {
  /** 模板 ID */
  id: string;

  /** 模板名称 */
  name: string;

  /** 提供商 */
  provider: ApiProvider;

  /** 默认 API URL */
  defaultUrl: string;

  /** 推荐模型 */
  recommendedModel: string;

  /** 描述 */
  description: string;

  /** 文档链接 */
  docUrl?: string;
}

/**
 * 常用 API 配置模板
 */
export const API_CONFIG_TEMPLATES: ApiConfigTemplate[] = [
  {
    id: 'minicpm-local',
    name: 'MiniCPM (推荐)',
    provider: 'minicpm',
    defaultUrl: 'http://localhost:8080/v1',
    recommendedModel: 'MiniCPM-2B',
    description: '面壁智能开源的小尺寸高性能模型,适合本地部署',
    docUrl: 'https://github.com/OpenBMB/MiniCPM',
  },
  {
    id: 'codelama-local',
    name: 'CodeLlama (代码专用)',
    provider: 'codelama',
    defaultUrl: 'http://localhost:8080/v1',
    recommendedModel: 'CodeLlama-7b',
    description: 'Meta 开源的代码生成模型,适合编程辅助',
    docUrl: 'https://github.com/facebookresearch/codellama',
  },
  {
    id: 'openai-gpt4',
    name: 'OpenAI GPT-4',
    provider: 'openai',
    defaultUrl: 'https://api.openai.com/v1',
    recommendedModel: 'gpt-4-turbo',
    description: 'OpenAI 官方 API,支持 GPT-4 和 GPT-3.5 系列模型',
    docUrl: 'https://platform.openai.com/docs/api-reference',
  },
  {
    id: 'openai-gpt35',
    name: 'OpenAI GPT-3.5',
    provider: 'openai',
    defaultUrl: 'https://api.openai.com/v1',
    recommendedModel: 'gpt-3.5-turbo',
    description: '性价比高的快速响应模型',
    docUrl: 'https://platform.openai.com/docs/api-reference',
  },
  {
    id: 'deepseek-chat',
    name: 'DeepSeek 深度求索',
    provider: 'deepseek',
    defaultUrl: 'https://api.deepseek.com/v1',
    recommendedModel: 'deepseek-chat',
    description: '国产高性能大语言模型,支持中英文对话',
    docUrl: 'https://platform.deepseek.com/',
  },
  {
    id: 'qwen-turbo',
    name: '通义千问 (Qwen)',
    provider: 'qwen',
    defaultUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    recommendedModel: 'qwen-turbo',
    description: '阿里巴巴通义实验室研发的通用大语言模型',
    docUrl: 'https://help.aliyun.com/zh/dashscope/',
  },
  {
    id: 'kimi-moonshot',
    name: 'Kimi 智能助手 (Moonshot)',
    provider: 'kimi',
    defaultUrl: 'https://api.moonshot.cn/v1',
    recommendedModel: 'moonshot-v1-8k',
    description: '月之暗面开发的长上下文大模型',
    docUrl: 'https://platform.moonshot.cn/',
  },
  {
    id: 'mgl-chat',
    name: 'MGL 模型',
    provider: 'mgl',
    defaultUrl: 'https://api.mgl.com/v1',
    recommendedModel: 'mgl-chat-latest',
    description: 'MGL 高性能生成式语言模型',
    docUrl: 'https://mgl.com/',
  },
  {
    id: 'ollama-local',
    name: 'Ollama 本地',
    provider: 'ollama',
    defaultUrl: 'http://localhost:11434',
    recommendedModel: 'llama2',
    description: '本地运行的开源模型,无需 API Key',
    docUrl: 'https://ollama.ai/',
  },
  {
    id: 'matux-cloud',
    name: 'MatuX 云服务',
    provider: 'matux-cloud',
    defaultUrl: 'http://localhost:8000/api/v1/ai/chat',
    recommendedModel: 'matux-v1',
    description: 'MatuX 提供的云端大模型服务，支持多种模型选择',
    docUrl: '',
  },
  {
    id: 'custom',
    name: '自定义 API',
    provider: 'custom',
    defaultUrl: '',
    recommendedModel: '',
    description: '兼容 OpenAI 格式的其他 API 服务',
  },
];
