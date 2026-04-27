/**
 * 爬虫配置管理
 */

import * as fs from 'fs';
import * as path from 'path';
import type { CrawlerConfig } from './types';

const DATA_DIR = path.join(process.cwd(), '..', 'data');
const CRAWLER_CONFIG_FILE = path.join(DATA_DIR, 'crawler_configs.json');

/**
 * 加载所有爬虫配置
 */
export function loadConfigs(): CrawlerConfig[] {
  if (!fs.existsSync(CRAWLER_CONFIG_FILE)) {
    return [];
  }
  
  try {
    const content = fs.readFileSync(CRAWLER_CONFIG_FILE, 'utf-8');
    return JSON.parse(content);
  } catch (e) {
    console.error('Failed to load crawler configs:', e);
    return [];
  }
}

/**
 * 保存爬虫配置
 */
export function saveConfigs(configs: CrawlerConfig[]): void {
  const configDir = path.dirname(CRAWLER_CONFIG_FILE);
  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true });
  }
  
  fs.writeFileSync(CRAWLER_CONFIG_FILE, JSON.stringify(configs, null, 2), 'utf-8');
}

/**
 * 添加爬虫配置
 */
export function addCrawlerConfig(config: CrawlerConfig): void {
  const configs = loadConfigs();
  
  // 检查 ID 是否已存在
  if (configs.some(c => c.id === config.id)) {
    throw new Error(`Crawler with ID ${config.id} already exists`);
  }
  
  configs.push(config);
  saveConfigs(configs);
}

/**
 * 删除爬虫配置
 */
export function deleteCrawlerConfig(crawlerId: string): boolean {
  const configs = loadConfigs();
  const newConfigs = configs.filter(c => c.id !== crawlerId);
  
  if (newConfigs.length === configs.length) {
    return false; // 未找到
  }
  
  saveConfigs(newConfigs);
  return true;
}

/**
 * 更新爬虫配置
 */
export function updateCrawlerConfig(crawlerId: string, updates: Partial<CrawlerConfig>): boolean {
  const configs = loadConfigs();
  const index = configs.findIndex(c => c.id === crawlerId);
  
  if (index === -1) {
    return false;
  }
  
  configs[index] = { ...configs[index], ...updates };
  saveConfigs(configs);
  return true;
}

/**
 * 获取单个爬虫配置
 */
export function getCrawlerConfig(crawlerId: string): CrawlerConfig | null {
  const configs = loadConfigs();
  return configs.find(c => c.id === crawlerId) || null;
}
