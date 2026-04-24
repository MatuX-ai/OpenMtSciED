/**
 * 爬虫数据模型
 */

export interface CrawlerConfig {
  id: string;
  name: string;
  description: string;
  target_url: string;
  type: 'course' | 'textbook';
  status: 'idle' | 'running' | 'completed' | 'failed';
  progress: number;
  total_items: number;
  scraped_items: number;
  last_run?: string | null;
  error_message?: string | null;
  grade_level?: string;
  output_file?: string;
}

export interface CrawlResult {
  success: boolean;
  total_items: number;
  scraped_items: number;
  data: any[];
  error?: string;
}

export interface CrawlerTemplate {
  id: string;
  name: string;
  description: string;
}
