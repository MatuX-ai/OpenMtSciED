# 后端迁移快速指南

## 🚀 立即执行的步骤

### 1. 同步数据库 (必须)

```bash
cd backend-next

# 确保 .env.local 文件存在并包含 DATABASE_URL
# 如果不存在，复制 .env.example 并修改
cp .env.example .env.local

# 编辑 .env.local，设置正确的数据库连接字符串
# DATABASE_URL="postgresql://user:password@host/dbname"

# 同步数据库结构
npx prisma db push

# 或者创建迁移文件（推荐用于生产环境）
npx prisma migrate dev --name add_crawler_and_platform_models

# 生成 Prisma Client
npx prisma generate
```

### 2. 测试新API端点

```bash
# 启动后端服务
npm run dev

# 在另一个终端测试 Markdown 导出 API
curl -X POST http://localhost:3000/api/v1/admin/export/markdown \
  -H "Content-Type: application/json" \
  -d '{
    "title": "测试课程",
    "content": [
      {
        "title": "模块1",
        "description": "测试描述",
        "estimated_hours": 2
      }
    ]
  }'
```

### 3. 检查数据库表

```bash
# 运行孤立表检查脚本
npx tsx scripts/check-db-tables.ts
```

---

## 📦 下一步：迁移Python爬虫

### 准备工作

安装Node.js爬虫所需的依赖：

```bash
npm install puppeteer cheerio axios node-fetch
npm install @types/puppeteer @types/cheerio
```

### 迁移示例：OpenSciEd爬虫

#### Python原始代码位置
`scripts/scrapers/openscied_scraper.py`

#### Node.js实现模板

创建文件：`backend-next/app/lib/crawlers/openscied-crawler.ts`

```typescript
import axios from 'axios';
import * as cheerio from 'cheerio';
import fs from 'fs';
import path from 'path';

interface OpenSciEdUnit {
  id: string;
  title: string;
  grade_level: string;
  description: string;
  url: string;
}

export async function crawlOpenSciEd(gradeLevel: string = 'middle'): Promise<OpenSciEdUnit[]> {
  const units: OpenSciEdUnit[] = [];
  
  try {
    // 获取单元列表页面
    const response = await axios.get(`https://www.openscied.org/${gradeLevel}-courses/`);
    const $ = cheerio.load(response.data);
    
    // 解析页面内容
    $('article').each((index, element) => {
      const title = $(element).find('h2').text().trim();
      const description = $(element).find('.entry-summary').text().trim();
      const url = $(element).find('a').attr('href');
      
      if (title && url) {
        units.push({
          id: `openscied-${gradeLevel}-${index}`,
          title,
          grade_level: gradeLevel,
          description,
          url,
        });
      }
    });
    
    console.log(`✅ Crawled ${units.length} units for ${gradeLevel}`);
  } catch (error) {
    console.error('❌ Error crawling OpenSciEd:', error);
  }
  
  return units;
}

export async function saveUnits(units: OpenSciEdUnit[], outputFile: string): Promise<void> {
  const dir = path.dirname(outputFile);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  fs.writeFileSync(outputFile, JSON.stringify(units, null, 2), 'utf-8');
  console.log(`💾 Saved ${units.length} units to ${outputFile}`);
}
```

#### 在lib.ts中注册爬虫

编辑 `backend-next/app/api/v1/admin/crawler/lib.ts`：

```typescript
import { crawlOpenSciEd, saveUnits } from '../../../lib/crawlers/openscied-crawler';

// 在 executeCrawl 函数中添加实际逻辑
export async function executeCrawl(config: CrawlerConfig): Promise<void> {
  const crawlerId = config.id;
  
  try {
    updateCrawlerConfig(crawlerId, {
      status: 'running',
      progress: 10,
      error_message: null,
    });
    
    console.log(`[Crawler] Starting ${config.name} (${crawlerId})`);
    
    // 根据爬虫ID执行不同的爬虫
    let result;
    if (crawlerId === 'openscied') {
      const gradeLevel = (config as any).grade_level || 'middle';
      const units = await crawlOpenSciEd(gradeLevel);
      const outputFile = config.output_file || 'data/course_library/openscied_units.json';
      await saveUnits(units, outputFile);
      result = { success: true, items: units.length };
    } 
    // else if (crawlerId === 'openstax') { ... }
    // else if (crawlerId === 'khan_academy') { ... }
    else {
      throw new Error(`Unknown crawler: ${crawlerId}`);
    }
    
    updateCrawlerConfig(crawlerId, {
      status: 'completed',
      progress: 100,
      scraped_items: result.items,
      last_run: new Date().toISOString(),
    });
    
    console.log(`[Crawler] Completed ${config.name}`);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    updateCrawlerConfig(crawlerId, {
      status: 'failed',
      error_message: errorMessage,
      last_run: new Date().toISOString(),
    });
    
    console.error(`[Crawler] Failed ${config.name}:`, errorMessage);
  }
}
```

---

## 🔧 常见问题解决

### 问题1: DATABASE_URL未找到

**解决方案**:
```bash
# 检查 .env.local 文件是否存在
ls -la .env.local

# 如果不存在，创建它
cp .env.example .env.local

# 编辑文件，设置正确的数据库URL
nano .env.local
```

### 问题2: Prisma迁移失败

**解决方案**:
```bash
# 重置数据库（警告：会删除所有数据）
npx prisma migrate reset

# 或者手动删除迁移历史
rm -rf prisma/migrations
npx prisma migrate dev --name init
```

### 问题3: 爬虫定时任务不执行

**解决方案**:
```typescript
// 检查 lib.ts 中的 initCrawlers 是否被调用
// 在 server startup 时调用
import { initCrawlers } from './app/api/v1/admin/crawler/lib';

// 在 app/layout.tsx 或 middleware 中初始化
await initCrawlers();
```

### 问题4: TypeScript类型错误

**解决方案**:
```bash
# 重新生成类型定义
npx prisma generate

# 清除缓存并重新编译
rm -rf .next
npm run build
```

---

## 📊 监控和日志

### 查看爬虫状态

```bash
# 查询数据库中的爬虫配置
psql $DATABASE_URL -c "SELECT id, name, status, progress FROM \"CrawlerConfig\";"
```

### 日志位置

- 开发模式：控制台输出
- 生产模式：查看 Next.js 日志文件

---

## 🎯 里程碑检查清单

- [ ] 数据库已同步新schema
- [ ] Markdown导出API测试通过
- [ ] 至少迁移1个Python爬虫到Node.js
- [ ] 爬虫定时任务正常工作
- [ ] 运行孤立表检查脚本
- [ ] 所有新功能添加到前端界面

---

## 📚 参考资料

- [Prisma文档](https://www.prisma.io/docs)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)
- [Puppeteer文档](https://pptr.dev/)
- [Cheerio文档](https://cheerio.js.org/)

---

**最后更新**: 2026-04-26
