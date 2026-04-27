# OpenMTSciEd Backend (Next.js 版本)

## 📊 迁移进度

### ✅ 已完成
- [x] Next.js 项目初始化
- [x] 项目目录结构创建
- [x] Prisma 数据库模型定义（7个模型）
- [x] 核心库文件（db.ts, neo4j.ts, auth.ts）
- [x] 健康检查 API
- [x] 环境变量配置
- [x] **Markdown 导出 API** ✨ 新增
- [x] **爬虫服务框架** ✨ 新增
- [x] **Khan Academy 爬虫** ✨ 新增（已测试通过）
- [x] 数据库同步到 Neon PostgreSQL

### 🚧 进行中
- [ ] OpenSciEd 爬虫迁移
- [ ] OpenStax 爬虫迁移
- [ ] Coursera 爬虫迁移
- [ ] BNU Shanghai K12 爬虫迁移

### 📅 待开始
- [ ] 学习路径 API
- [ ] 题库系统 API
- [ ] 知识图谱 API
- [ ] 资源关联 API

## 🚀 快速开始

### 1. 安装依赖
```bash
cd backend-next
npm install
```

### 2. 配置环境变量
```bash
cp .env.example .env.local
# 编辑 .env.local 填入实际值
```

### 3. 数据库迁移
```bash
# 生成 Prisma 客户端
npx prisma generate

# 同步数据库结构（已完成）
npx prisma db push
```

### 4. 测试 Khan Academy 爬虫
```bash
npx tsx scripts/test-khan-crawler.ts
```

### 4. 启动开发服务器
```bash
npm run dev
```

访问：http://localhost:3000/api/health

## 📁 项目结构

```
backend-next/
├── app/
│   ├── api/
│   │   ├── health/route.ts          # 健康检查
│   │   ├── v1/
│   │   │   ├── auth/                # 认证相关
│   │   │   ├── users/               # 用户管理
│   │   │   ├── admin/
│   │   │   │   ├── crawler/         # 爬虫管理 ✨
│   │   │   │   ├── export/          # 导出功能 ✨
│   │   │   │   └── courses/         # 课程管理
│   │   │   ├── learning/            # 学习功能
│   │   │   └── education-platforms/ # 教育平台
│   │   └── route.ts                 # API 根路径
│   ├── lib/
│   │   └── crawlers/                # 爬虫实现 ✨
│   │       └── khan-academy-crawler.ts
│   ├── layout.tsx
│   └── page.tsx
├── lib/
│   ├── db.ts                        # PostgreSQL (Prisma)
│   ├── neo4j.ts                     # Neo4j 图数据库
│   └── auth.ts                      # JWT 认证
├── scripts/                         # 工具脚本 ✨
│   ├── check-db-tables.ts           # 数据库表检查
│   ├── verify-schema.ts             # Schema 验证
│   └── test-khan-crawler.ts         # 爬虫测试
├── prisma/
│   └── schema.prisma                # 数据库模型（7个）
├── data/                            # 数据文件
│   └── course_library/              # 课程数据
└── package.json
```

## 🔧 技术栈

- **框架**: Next.js 14 (App Router)
- **语言**: TypeScript
- **数据库**: PostgreSQL (Prisma ORM) - Neon 云数据库
- **图数据库**: Neo4j
- **认证**: JWT + bcrypt
- **定时任务**: cron
- **部署**: Vercel（原生支持）

### 新增依赖
- `cron` - 定时任务调度
- `pg` - PostgreSQL 客户端
- `dotenv` - 环境变量加载

## 📝 API 文档

### 认证
- `POST /api/v1/auth/login` - 用户登录
- `POST /api/v1/auth/register` - 用户注册
- `GET /api/v1/auth/me` - 获取当前用户信息

### 用户管理
- `GET /api/v1/users` - 获取用户列表
- `GET /api/v1/users/:id` - 获取用户详情
- `PUT /api/v1/users/:id` - 更新用户信息
- `DELETE /api/v1/users/:id` - 删除用户

### 学习功能
- `GET /api/v1/learning/path` - 获取学习路径
- `GET /api/v1/learning/questions` - 获取题目
- `POST /api/v1/learning/submit` - 提交答案

### 管理功能
- `GET /api/v1/admin/settings` - 系统设置
- `POST /api/v1/admin/crawler` - 创建爬虫任务
- `POST /api/v1/admin/crawler/:id/run` - 运行爬虫 ✨
- `GET /api/v1/admin/crawler` - 获取爬虫列表
- `POST /api/v1/admin/export/markdown` - 导出 Markdown ✨
- `GET /api/v1/admin/education-platforms` - 教育平台列表
- `GET /api/v1/admin/graph` - 知识图谱查询

## ⚙️ Vercel 部署

1. 连接 GitHub 仓库
2. Root Directory: `backend-next`
3. Framework Preset: Next.js
4. 添加环境变量
5. 部署！

## 🔄 与 Python 后端对比

| 功能 | Python FastAPI | Next.js |
|------|---------------|---------|
| 依赖管理 | pip/requirements.txt | npm/package.json |
| 路由定义 | 装饰器 | 文件系统路由 |
| 数据库 | SQLAlchemy | Prisma ORM |
| 部署 | 复杂（Serverless） | 简单（原生支持） |
| 冷启动 | 慢 | 快 |
| 类型安全 | 可选 | 强制 TypeScript |
| 爬虫框架 | APScheduler | cron |
| 导出功能 | ✅ | ✅ 已迁移 |

## 📌 重要更新

### 2026-04-26 重大更新
✅ **完成基础架构迁移**
- Markdown 导出功能已在 Node.js 中实现
- 爬虫服务框架搭建完成
- Khan Academy 爬虫成功迁移并测试通过
- Prisma schema 完善（新增 CrawlerConfig 和 EducationPlatform 模型）
- 数据库已成功同步到 Neon PostgreSQL

📄 **新增文档**
- `MIGRATION_COMPLETION_REPORT.md` - 详细完成报告
- `QUICK_START_GUIDE.md` - 快速开始指南
- `CRAWLER_MIGRATION_PROGRESS.md` - 爬虫迁移进度
- `SESSION_SUMMARY.md` - 会话总结

⏳ **下一步计划**
- 迁移剩余 4 个爬虫（OpenSciEd, OpenStax, Coursera, BNU Shanghai）
- 安装额外依赖（axios, cheerio, puppeteer）
- 前端集成新 API
