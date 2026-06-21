import { CronJob } from 'cron';
import { prisma } from '../../../../../lib/db';

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
  max_items?: number; // 每次抓取上限
  [key: string]: unknown;
}

// === Prisma 持久化层（取代文件存储，兼容 Vercel Serverless 只读文件系统） ===

interface DbCrawlerConfig {
  id: string;
  name: string;
  description: string | null;
  targetUrl: string | null;
  type: string;
  status: string;
  progress: number;
  totalItems: number;
  scrapedItems: number;
  lastRun: Date | null;
  errorMessage: string | null;
  outputFile: string | null;
  scheduleInterval: number | null;
  maxItems: number | null;
  createdAt: Date;
  updatedAt: Date;
}

function dbToApi(db: DbCrawlerConfig): CrawlerConfig {
  const api: CrawlerConfig = {
    id: db.id,
    name: db.name,
    description: db.description ?? undefined,
    target_url: db.targetUrl ?? undefined,
    type: db.type as CrawlerConfig['type'],
    status: db.status as CrawlerConfig['status'],
    progress: db.progress,
    total_items: db.totalItems,
    scraped_items: db.scrapedItems,
    last_run: db.lastRun ? db.lastRun.toISOString() : null,
    error_message: db.errorMessage,
    output_file: db.outputFile ?? undefined,
  };
  if (db.scheduleInterval != null) api.schedule_interval = db.scheduleInterval;
  if (db.maxItems != null) api.max_items = db.maxItems;
  return api;
}

function apiToDb(api: Partial<CrawlerConfig>): Record<string, unknown> {
  const data: Record<string, unknown> = {};
  if (api.name !== undefined) data.name = api.name;
  if (api.description !== undefined) data.description = api.description;
  if (api.target_url !== undefined) data.targetUrl = api.target_url;
  if (api.type !== undefined) data.type = api.type;
  if (api.status !== undefined) data.status = api.status;
  if (api.progress !== undefined) data.progress = api.progress;
  if (api.total_items !== undefined) data.totalItems = api.total_items;
  if (api.scraped_items !== undefined) data.scrapedItems = api.scraped_items;
  if (api.last_run !== undefined) data.lastRun = api.last_run ? new Date(api.last_run) : null;
  if (api.error_message !== undefined) data.errorMessage = api.error_message;
  if (api.output_file !== undefined) data.outputFile = api.output_file;
  if (api.schedule_interval !== undefined) data.scheduleInterval = api.schedule_interval;
  if (api.max_items !== undefined) data.maxItems = api.max_items;
  return data;
}

/**
 * 加载所有爬虫配置
 */
export async function loadConfigs(): Promise<CrawlerConfig[]> {
  try {
    const rows = await prisma.crawlerConfig.findMany({ orderBy: { id: 'asc' } });
    return rows.map(dbToApi);
  } catch (error) {
    console.error('Failed to load crawler configs from DB:', error);
    return [];
  }
}

/**
 * 添加爬虫配置
 */
export async function addCrawlerConfig(config: CrawlerConfig): Promise<void> {
  await prisma.crawlerConfig.create({
    data: { id: config.id, ...apiToDb(config) } as never,
  });
}

/**
 * 删除爬虫配置
 */
export async function deleteCrawlerConfig(crawlerId: string): Promise<boolean> {
  try {
    await prisma.crawlerConfig.delete({ where: { id: crawlerId } });
    return true;
  } catch {
    return false;
  }
}

/**
 * 更新爬虫配置
 */
export async function updateCrawlerConfig(
  crawlerId: string,
  updates: Partial<CrawlerConfig>
): Promise<void> {
  const data = apiToDb(updates);
  if (Object.keys(data).length === 0) return;
  try {
    await prisma.crawlerConfig.update({ where: { id: crawlerId }, data });
  } catch (error) {
    console.error(`Failed to update crawler config ${crawlerId}:`, error);
  }
}

/**
 * 获取单个爬虫配置
 */
export async function getCrawlerConfig(crawlerId: string): Promise<CrawlerConfig | null> {
  const row = await prisma.crawlerConfig.findUnique({ where: { id: crawlerId } });
  return row ? dbToApi(row) : null;
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
  const configs = await loadConfigs();
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
    await updateCrawlerConfig(crawlerId, {
      status: 'running',
      progress: 10,
      error_message: null,
    });
    
    console.log(`[Crawler] Starting ${config.name} (${crawlerId})`);
    
    const maxItems = config.max_items || 100;
    console.log(`[Crawler] Max items for this run: ${maxItems}`);
    
    // TODO: 实现爬虫逻辑
    // 根据爬虫ID执行不同的爬虫
    const itemsCount = 0;
    
    // if (crawlerId === 'khan_academy') {
    //   const courses = generateKhanAcademyCourses(maxItems);
    //   const outputFile = config.output_file || 'data/course_library/khan_academy_courses.json';
    //   await saveCourses(courses, outputFile);
    //   itemsCount = courses.length;
    // } else if (crawlerId === 'openstax') {
    //   const chapters = generateOpenStaxChapters(maxItems);
    //   const outputFile = config.output_file || 'data/textbook_library/openstax_chapters.json';
    //   await saveOpenStaxChapters(chapters, outputFile);
    //   itemsCount = chapters.length;
    // } else if (crawlerId === 'coursera') {
    //   const courses = generateCourseraCourses(maxItems);
    //   const outputFile = config.output_file || 'data/course_library/coursera_courses.json';
    //   await saveCourseraCourses(courses, outputFile);
    //   itemsCount = courses.length;
    // } else if (crawlerId === 'openscied') {
    //   const units = generateOpenSciEdUnits(maxItems);
    //   const outputFile = config.output_file || 'data/course_library/openscied_units.json';
    //   await saveOpenSciEdUnits(units, outputFile);
    //   itemsCount = units.length;
    // } else if (crawlerId === 'bnu_shanghai') {
    //   const courses = generateBNUCourses(maxItems);
    //   const outputFile = config.output_file || 'data/course_library/bnu_shanghai_courses.json';
    //   await saveBNUCourses(courses, outputFile);
    //   itemsCount = courses.length;
    // } else {
    //   throw new Error(`Unknown crawler: ${crawlerId}`);
    // }
    
    console.log(`[Crawler] Crawler execution not implemented yet for ${crawlerId}`);
    
    // 更新状态为完成
    await updateCrawlerConfig(crawlerId, {
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
    await updateCrawlerConfig(crawlerId, {
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
export async function getPlatformStatus() {
  const configs = await loadConfigs();
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
