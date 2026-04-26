# OpenMTSciEd Backend (Next.js 版本)

##  迁移进度

### ✅ 已完成
- [x] Next.js 项目初始化
- [x] 项目目录结构创建
- [x] Prisma 数据库模型定义
- [x] 核心库文件（db.ts, neo4j.ts, auth.ts）
- [x] 健康检查 API
- [x] 环境变量配置模板

### 🚧 进行中
- [ ] 依赖安装（npm install）
- [ ] 登录/注册 API
- [ ] 用户管理 API
- [ ] CORS 中间件配置

### 📅 待开始
- [ ] 学习路径 API
- [ ] 题库系统 API
- [ ] 爬虫管理 API
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
npx prisma generate
npx prisma db push
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
│   │   │   ├── learning/            # 学习功能
│   │   │   └── admin/               # 管理功能
│   │   └── route.ts                 # API 根路径
│   ├── layout.tsx
│   └── page.tsx
├── lib/
│   ├── db.ts                        # PostgreSQL (Prisma)
│   ├── neo4j.ts                     # Neo4j 图数据库
│   └── auth.ts                      # JWT 认证
├── prisma/
│   └── schema.prisma                # 数据库模型
└── package.json
```

## 🔧 技术栈

- **框架**: Next.js 14 (App Router)
- **语言**: TypeScript
- **数据库**: PostgreSQL (Prisma ORM)
- **图数据库**: Neo4j
- **认证**: JWT + bcrypt
- **部署**: Vercel（原生支持）

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
- `POST /api/v1/admin/crawler` - 爬虫任务
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

## 📌 注意事项

1. 所有 API 保持与 Python 版本相同的路径和响应格式
2. Neo4j 查询逻辑需要逐步迁移
3. 爬虫功能可能保留 Python 实现，通过 HTTP 调用
4. 确保 CORS 配置正确，允许前端域名访问

## 🎯 下一步

1. 完成依赖安装
2. 实现登录/注册 API
3. 配置 CORS 中间件
4. 测试 API 端点
5. 部署到 Vercel
