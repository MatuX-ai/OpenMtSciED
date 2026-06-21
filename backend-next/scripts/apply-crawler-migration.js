// 优先从 .env.local 加载数据库连接（避免 Prisma 找不到环境变量）
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  try {
    // 1. 添加 maxItems 字段（如果不存在）
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "CrawlerConfig" ADD COLUMN IF NOT EXISTS "maxItems" INTEGER DEFAULT 100;
    `);
    console.log('✓ maxItems 字段已添加');

    // 2. 读取 JSON 配置
    const configPath = path.join(__dirname, '..', '..', 'data', 'crawler_configs.json');
    const configs = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    console.log(`✓ 从 JSON 读取 ${configs.length} 条配置`);

    // 3. 同步到数据库
    let inserted = 0, updated = 0;
    for (const cfg of configs) {
      const existing = await prisma.crawlerConfig.findUnique({ where: { id: cfg.id } });
      const data = {
        name: cfg.name,
        description: cfg.description || null,
        targetUrl: cfg.target_url || null,
        type: cfg.type || 'course',
        status: cfg.status || 'idle',
        progress: cfg.progress || 0,
        totalItems: cfg.total_items || 0,
        scrapedItems: cfg.scraped_items || 0,
        lastRun: cfg.last_run ? new Date(cfg.last_run) : null,
        errorMessage: cfg.error_message || null,
        outputFile: cfg.output_file || null,
        scheduleInterval: cfg.schedule_interval || null,
        maxItems: cfg.max_items || 100,
      };
      if (existing) {
        await prisma.crawlerConfig.update({ where: { id: cfg.id }, data });
        updated++;
      } else {
        await prisma.crawlerConfig.create({ data: { id: cfg.id, ...data } });
        inserted++;
      }
    }
    console.log(`✓ 同步完成: 新增 ${inserted}, 更新 ${updated}`);

    // 4. 验证
    const rows = await prisma.crawlerConfig.findMany({ orderBy: { id: 'asc' } });
    console.log(`\n数据库现有 ${rows.length} 条爬虫配置:`);
    rows.forEach(r => {
      console.log(`- ${r.id} | ${r.name} | 间隔=${r.scheduleInterval}h | 上限=${r.maxItems}`);
    });
  } catch (e) {
    console.error('失败：', e.message);
  } finally {
    await prisma.$disconnect();
  }
})();