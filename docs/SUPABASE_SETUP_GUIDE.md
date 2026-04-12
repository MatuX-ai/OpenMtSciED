# Supabase 数据库配置指南

本文档说明如何将教材库和课程库配置到 Supabase，并在本地开发和 Vercel 部署环境中使用。

## 📋 目录

- [前置要求](#前置要求)
- [步骤 1: 在 Supabase 上创建项目](#步骤-1-在-supabase-上创建项目)
- [步骤 2: 执行数据库迁移](#步骤-2-执行数据库迁移)
- [步骤 3: 获取连接信息](#步骤-3-获取连接信息)
- [步骤 4: 配置本地开发环境](#步骤-4-配置本地开发环境)
- [步骤 5: 配置 Vercel 部署环境](#步骤-5-配置-vercel-部署环境)
- [步骤 6: 验证连接](#步骤-6-验证连接)
- [故障排查](#故障排查)

---

## 前置要求

1. **Supabase 账号**: 注册于 https://supabase.com
2. **Node.js 20+** 和 **Python 3.11+**
3. **Vercel 账号** (用于生产部署)

---

## 步骤 1: 在 Supabase 上创建项目

1. 登录 [Supabase Dashboard](https://app.supabase.com)
2. 点击 **"New Project"**
3. 填写项目信息：
   - **Name**: `imatuproject` (或你喜欢的名称)
   - **Database Password**: 设置一个强密码（**务必保存！**）
   - **Region**: 选择离用户最近的区域（推荐 `Asia Pacific (Singapore)` 或 `US East`）
4. 点击 **"Create new project"**
5. 等待项目初始化完成（约2-3分钟）

---

## 步骤 2: 执行数据库迁移

### 方法 A: 通过 SQL Editor（推荐）

1. 在 Supabase Dashboard 中，进入 **SQL Editor**
2. 点击 **"New query"**
3. 复制并粘贴之前生成的 SQL 脚本（包含以下表）：
   - `courses` - 课程表
   - `materials` - 课件/教材表
   - `open_resources` - 开源资源表
   - `resource_tags` - 资源标签表
   - 相关索引、触发器和视图
4. 点击 **"Run"** 执行
5. 确认所有表和索引创建成功

### 方法 B: 通过命令行工具

```bash
# 安装 Supabase CLI
npm install -g supabase

# 登录
supabase login

# 链接到你的项目
supabase link --project-ref your-project-id

# 推送迁移
supabase db push
```

---

## 步骤 3: 获取连接信息

在 Supabase Dashboard 中：

1. 进入 **Settings** → **Database**
2. 找到 **"Connection string"** 部分
3. 选择 **"URI"** 标签页
4. 复制 **Transaction mode** 或 **Session mode** 的连接字符串

格式如下：
```
postgresql://postgres:[YOUR-PASSWORD]@db.xxxxxxxx.supabase.co:5432/postgres
```

**重要**：将 `[YOUR-PASSWORD]` 替换为你在步骤1中设置的数据库密码。

---

## 步骤 4: 配置本地开发环境

### 4.1 创建后端环境变量文件

在 `backend/` 目录下创建 `.env` 文件：

```bash
cd backend
cp .env.example .env
```

编辑 `.env` 文件，更新以下变量：

```env
# Supabase 数据库配置
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.xxxxxxxx.supabase.co:5432/postgres

# 应用配置
APP_NAME=iMato AI Service
DEBUG=True  # 开发环境设为 True
HOST=0.0.0.0
PORT=8000

# JWT配置
SECRET_KEY=dev-secret-key-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# CORS配置
ALLOWED_ORIGINS=http://localhost:4200,http://localhost:8000

# Neo4j（可选，如不使用可禁用）
NEO4J_ENABLED=False
```

### 4.2 安装依赖

```bash
cd backend
pip install -r requirements.txt
```

确保安装了 `asyncpg`（异步 PostgreSQL 驱动）：
```bash
pip install asyncpg
```

### 4.3 启动后端服务

```bash
cd backend
python main.py
```

你应该看到类似输出：
```
INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:     Database connected successfully
```

### 4.4 验证数据库连接

访问健康检查端点：
```bash
curl http://localhost:8000/health
```

或在浏览器中打开：
```
http://localhost:8000/docs
```

测试 `/api/v1/admin/settings/database/test` 端点。

---

## 步骤 5: 配置 Vercel 部署环境

### 5.1 添加环境变量到 Vercel

1. 登录 [Vercel Dashboard](https://vercel.com)
2. 进入你的项目
3. 导航到 **Settings** → **Environment Variables**
4. 添加以下变量（**Production**, **Preview**, **Development** 三个环境都需要）：

| 变量名 | 值 | 环境 |
|--------|-----|------|
| `DATABASE_URL` | `postgresql://postgres:[PASSWORD]@db.xxxxxxxx.supabase.co:5432/postgres` | All |
| `SECRET_KEY` | 生成一个随机字符串（至少32字符） | All |
| `ALLOWED_ORIGINS` | `https://your-app.vercel.app` | Production |
| `DEBUG` | `False` | Production |
| `NEO4J_ENABLED` | `False` | All |

**生成 SECRET_KEY**:
```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

### 5.2 配置 Vercel 构建命令

在项目根目录创建或更新 `vercel.json`:

```json
{
  "buildCommand": "cd backend && pip install -r requirements.txt && cd .. && ng build --configuration production",
  "outputDirectory": "dist/browser",
  "installCommand": "npm install",
  "framework": "angular",
  "regions": ["sin1"],
  "env": {
    "NODE_ENV": "production"
  }
}
```

### 5.3 重新部署

推送代码后，Vercel 会自动重新部署：
```bash
git add .
git commit -m "Configure Supabase database connection"
git push origin main
```

---

## 步骤 6: 验证连接

### 本地验证

运行数据库健康检查脚本：

```bash
cd backend
python -c "
import asyncio
from utils.supabase_client import check_database_health

async def test():
    result = await check_database_health()
    print(f'Status: {result[\"status\"]}')
    print(f'Response Time: {result[\"response_time_ms\"]}ms')
    if result.get('error'):
        print(f'Error: {result[\"error\"]}')

asyncio.run(test())
"
```

期望输出：
```
Status: healthy
Response Time: 45.23ms
```

### Vercel 验证

1. 部署完成后，访问你的 Vercel URL
2. 打开浏览器开发者工具（F12）
3. 检查 Console 是否有数据库连接错误
4. 尝试加载课程或资源页面，确认数据正常显示

---

## 故障排查

### 问题 1: 连接超时

**症状**: `Connection timed out` 或 `could not connect to server`

**解决方案**:
1. 检查 Supabase 项目是否处于活跃状态
2. 确认防火墙未阻止出站连接到端口 5432
3. 验证 `DATABASE_URL` 中的主机地址和密码正确
4. 在 Supabase Dashboard 的 **Settings** → **Database** 中检查连接限制

### 问题 2: 认证失败

**症状**: `password authentication failed for user "postgres"`

**解决方案**:
1. 确认密码正确（注意特殊字符需要 URL 编码）
2. 在 Supabase Dashboard 重置数据库密码
3. 更新所有环境的 `DATABASE_URL`

### 问题 3: 表不存在

**症状**: `relation "courses" does not exist`

**解决方案**:
1. 确认已执行步骤 2 的数据库迁移脚本
2. 在 Supabase SQL Editor 中检查表是否存在：
   ```sql
   SELECT table_name FROM information_schema.tables 
   WHERE table_schema = 'public';
   ```
3. 如果表不存在，重新执行迁移脚本

### 问题 4: Vercel 部署后无法连接

**症状**: 本地正常，但 Vercel 部署后连接失败

**解决方案**:
1. 确认已在 Vercel Dashboard 添加了所有必需的环境变量
2. 检查 `ALLOWED_ORIGINS` 包含你的 Vercel 域名
3. 查看 Vercel 函数日志：
   ```bash
   vercel logs <deployment-url>
   ```
4. 确认 Supabase 允许来自 Vercel IP 范围的连接（默认允许）

### 问题 5: 连接池耗尽

**症状**: `too many connections for role "postgres"`

**解决方案**:
1. 在 Supabase Dashboard 增加连接限制
2. 使用连接池器如 PgBouncer（Supabase 已内置）
3. 在代码中使用 `NullPool`（Vercel serverless 环境必需）
4. 优化代码确保会话正确关闭

---

## 🔐 安全最佳实践

1. **永远不要提交 `.env` 文件到版本控制**
   - 已添加到 `.gitignore`
   - 使用 `.env.example` 作为模板

2. **定期轮换密钥**
   - 每90天更换一次 `SECRET_KEY`
   - 每次泄露风险时立即更换

3. **使用环境变量管理敏感信息**
   - 不在代码中硬编码密码或密钥
   - 使用 Vercel 的环境变量加密功能

4. **限制数据库访问**
   - 在 Supabase 中启用 RLS（Row Level Security）
   - 仅授予必要的权限

5. **监控数据库活动**
   - 启用 Supabase 的日志功能
   - 定期检查异常连接

---

## 📚 相关资源

- [Supabase 官方文档](https://supabase.com/docs)
- [PostgreSQL 连接字符串格式](https://www.postgresql.org/docs/current/libpq-connect.html)
- [Vercel 环境变量管理](https://vercel.com/docs/concepts/projects/environment-variables)
- [SQLAlchemy 异步支持](https://docs.sqlalchemy.org/en/20/orm/extensions/asyncio.html)

---

## 🆘 需要帮助？

如有问题，请：
1. 查看本指南的故障排查部分
2. 检查 Supabase Dashboard 的日志
3. 联系项目维护者：3936318150@qq.com
4. 访问项目开源页面：https://open-mt-sci-ed.vercel.app/
