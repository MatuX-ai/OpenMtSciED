/**
 * 爬虫相关类型定义
 */

/**
 * 爬虫执行结果
 */
export interface CrawlResult {
  success: boolean;
  total_items: number;
  scraped_items: number;
  data: unknown[];
  error?: string;
}

/**
 * 爬虫配置
 */
export interface CrawlerConfig {
  id: string;
  name: string;
  description: string;
  target_url: string;
  type: 'course' | 'textbook' | 'question';
  status: 'idle' | 'running' | 'completed' | 'failed';
  progress: number;
  total_items: number;
  scraped_items: number;
  last_run: string | null;
  error_message: string | null;
  output_file?: string;
  schedule_interval?: number; // 小时
  [key: string]: unknown; // 允许额外的配置字段
}

/**
 * 爬虫处理函数类型
 */
export type CrawlerHandler = (config: CrawlerConfig) => Promise<CrawlResult> | CrawlResult;

/**
 * 爬虫信息
 */
export interface CrawlerInfo {
  id: string;
  name: string;
  handler: CrawlerHandler;
  description: string;
}

/**
 * 平台状态
 */
export interface PlatformStatus {
  platform_name: string;
  registered: boolean;
  schedule: {
    interval: string | number;
    day: string;
    time: string;
  };
  data_file_exists: boolean;
  last_updated: string | null;
  file_size: number | null;
}
