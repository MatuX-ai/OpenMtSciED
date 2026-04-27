import fs from 'fs';
import path from 'path';
import { CronJob } from 'cron';
import { generateKhanAcademyCourses, saveCourses } from '../../../../lib/crawlers/khan-academy-crawler';
import { generateOpenStaxChapters, saveChapters as saveOpenStaxChapters } from '../../../../lib/crawlers/openstax-crawler';
import { generateCourseraCourses, saveCourses as saveCourseraCourses } from '../../../../lib/crawlers/coursera-crawler';
import { generateOpenSciEdUnits, saveUnits as saveOpenSciEdUnits } from '../../../../lib/crawlers/openscied-crawler';
import { generateBNUCourses, saveCourses as saveBNUCourses } from '../../../../lib/crawlers/bnu-shanghai-crawler';

export interface CrawlerConfig {
  id: string;
  name: string;
  description?: string;
  target_url?: string;
  type: 'course' | 'question' | 'textbook';
  status: 'idle' | 'running' | 'completed' | 'failed';
  progress: number;
  total_items: number;
  scraped_items: number;
  last_run: string | null;
  error_message: string | null;
  output_file?: string;
  schedule_interval?: number; // hours
  [key: string]: unknown;
}

const CRAWLER_CONFIG_FILE = path.join(process.cwd(), 'data', 'crawler_configs.json');

/**
 * 加载爬虫配置
 */
export function loadConfigs(): CrawlerConfig[] {
  if (!fs.existsSync(CRAWLER_CONFIG_FILE)) {
    return [];
  }
  
  try {
    const content = fs.readFileSync(CRAWLER_CONFIG_FILE, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    console.error('Failed to load crawler configs:', error);
    return [];
  }
}

/**
 * 保存爬虫配置
 */
function saveConfigs(configs: CrawlerConfig[]): void {
  const dir = path.dirname(CRAWLER_CONFIG_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  fs.writeFileSync(CRAWLER_CONFIG_FILE, JSON.stringify(configs, null, 2), 'utf-8');
}

/**
 * 添加爬虫配置
 */
export function addCrawlerConfig(config: CrawlerConfig): void {
  const configs = loadConfigs();
  configs.push(config);
  saveConfigs(configs);
}

/**
 * 删除爬虫配置
 */
export function deleteCrawlerConfig(crawlerId: string): boolean {
  const configs = loadConfigs();
  const index = configs.findIndex(c => c.id === crawlerId);
  
  if (index === -1) {
    return false;
  }
  
  configs.splice(index, 1);
  saveConfigs(configs);
  return true;
}

/**
 * 更新爬虫配置
 */
export function updateCrawlerConfig(crawlerId: string, updates: Partial<CrawlerConfig>): void {
  const configs = loadConfigs();
  const index = configs.findIndex(c => c.id === crawlerId);
  
  if (index !== -1) {
    configs[index] = { ...configs[index], ...updates };
    saveConfigs(configs);
  }
}

/**
 * 获取单个爬虫配置
 */
export function getCrawlerConfig(crawlerId: string): CrawlerConfig | null {
  const configs = loadConfigs();
  return configs.find(c => c.id === crawlerId) || null;
}

/**
 * 获取可用的爬虫列表（从 scripts/scrapers 目录）
 */
export function getAvailableCrawlers(): Array<{ id: string; name: string; description: string }> {
  // 这里可以扫描 scripts/scrapers 目录，返回可用的爬虫
  // 暂时返回硬编码的列表，后续可以动态扫描
  return [
    { id: 'openscied', name: 'OpenSciEd Courses', description: '爬取 OpenSciEd 课程单元' },
    { id: 'openstax', name: 'OpenStax Textbooks', description: '爬取 OpenStax 教材章节' },
    { id: 'khan_academy', name: 'Khan Academy', description: '生成可汗学院 K-12 STEM 课程' },
    { id: 'coursera', name: 'Coursera STEM', description: '生成 Coursera 理工科课程' },
    { id: 'bnu_shanghai', name: 'BNU Shanghai K12', description: '爬取北师大上海K12课程' },
  ];
}

// 定时任务存储
const scheduledJobs: Map<string, CronJob> = new Map();

/**
 * 初始化爬虫（注册定时任务）
 */
export async function initCrawlers(): Promise<void> {
  const configs = loadConfigs();
  
  for (const config of configs) {
    if (config.schedule_interval && config.schedule_interval > 0) {
      scheduleCrawler(config);
    }
  }
  
  console.log(`[Crawler] Initialized ${configs.length} crawlers`);
}

/**
 * 执行爬虫任务
 */
export async function executeCrawl(config: CrawlerConfig): Promise<void> {
  const crawlerId = config.id;
  
  try {
    // 更新状态为运行中
    updateCrawlerConfig(crawlerId, {
      status: 'running',
      progress: 10,
      error_message: null,
    });
    
    console.log(`[Crawler] Starting ${config.name} (${crawlerId})`);
    
    // 根据爬虫ID执行不同的爬虫
    let itemsCount = 0;
    
    if (crawlerId === 'khan_academy') {
      // Khan Academy 课程生成
      const courses = generateKhanAcademyCourses();
      const outputFile = config.output_file || 'data/course_library/khan_academy_courses.json';
      await saveCourses(courses, outputFile);
      itemsCount = courses.length;
    } else if (crawlerId === 'openstax') {
      // OpenStax 教材章节生成
      const chapters = generateOpenStaxChapters();
      const outputFile = config.output_file || 'data/textbook_library/openstax_chapters.json';
      await saveOpenStaxChapters(chapters, outputFile);
      itemsCount = chapters.length;
    } else if (crawlerId === 'coursera') {
      // Coursera 大学课程生成
      const courses = generateCourseraCourses();
      const outputFile = config.output_file || 'data/course_library/coursera_courses.json';
      await saveCourseraCourses(courses, outputFile);
      itemsCount = courses.length;
    } else if (crawlerId === 'openscied') {
      // OpenSciEd 科学探究单元生成
      const units = generateOpenSciEdUnits();
      const outputFile = config.output_file || 'data/course_library/openscied_units.json';
      await saveOpenSciEdUnits(units, outputFile);
      itemsCount = units.length;
    } else if (crawlerId === 'bnu_shanghai') {
      // BNU Shanghai K12 课程生成
      const courses = generateBNUCourses();
      const outputFile = config.output_file || 'data/course_library/bnu_shanghai_courses.json';
      await saveBNUCourses(courses, outputFile);
      itemsCount = courses.length;
    } else {
      throw new Error(`Unknown crawler: ${crawlerId}`);
    }
    
    // 更新状态为完成
    updateCrawlerConfig(crawlerId, {
      status: 'completed',
      progress: 100,
      scraped_items: itemsCount,
      total_items: itemsCount,
      last_run: new Date().toISOString(),
    });
    
    console.log(`[Crawler] Completed ${config.name}: ${itemsCount} items`);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    // 更新状态为失败
    updateCrawlerConfig(crawlerId, {
      status: 'failed',
      error_message: errorMessage,
      last_run: new Date().toISOString(),
    });
    
    console.error(`[Crawler] Failed ${config.name}:`, errorMessage);
  }
}

/**
 * 设置爬虫定时任务
 */
export function scheduleCrawler(config: CrawlerConfig): void {
  const crawlerId = config.id;
  
  // 如果已有定时任务，先取消
  if (scheduledJobs.has(crawlerId)) {
    unscheduleCrawler(crawlerId);
  }
  
  if (!config.schedule_interval || config.schedule_interval <= 0) {
    return;
  }
  
  // 创建 cron 表达式（每 N 小时执行一次）
  const cronExpression = `0 */${config.schedule_interval} * * *`;
  
  const job = new CronJob(
    cronExpression,
    async () => {
      console.log(`[Crawler] Scheduled run: ${config.name}`);
      await executeCrawl(config);
    },
    null,
    true // 立即启动
  );
  
  scheduledJobs.set(crawlerId, job);
  console.log(`[Crawler] Scheduled ${config.name} with interval ${config.schedule_interval}h`);
}

/**
 * 取消爬虫定时任务
 */
export function unscheduleCrawler(crawlerId: string): void {
  const job = scheduledJobs.get(crawlerId);
  
  if (job) {
    job.stop();
    scheduledJobs.delete(crawlerId);
    console.log(`[Crawler] Unscheduled crawler ${crawlerId}`);
  }
}

/**
 * 获取教育平台状态
 */
export function getPlatformStatus() {
  const configs = loadConfigs();
  return configs.map(config => ({
    id: config.id,
    name: config.name,
    status: config.status,
    progress: config.progress,
    total_items: config.total_items,
    scraped_items: config.scraped_items,
    last_run: config.last_run,
    error_message: config.error_message,
  }));
}
