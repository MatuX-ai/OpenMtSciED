# Vercel 部署配置说明

## Prisma Client 生成问题解决方案

### 问题描述
在 Vercel 部署时，Prisma Client 没有被正确生成，导致运行时错误。

### 解决方案

#### 1. package.json 更新
- 添加了 `postinstall` 脚本：确保在安装依赖后自动生成 Prisma Client
- 添加了 `prisma-generate` 脚本：单独用于生成 Prisma Client
- 更新了 `build` 脚本：明确先生成 Prisma Client 再构建 Next.js 应用

#### 2. vercel.json 更新
- 更新了 `buildCommand`：确保在构建过程中按顺序执行：
  1. 安装依赖 (`npm install`)
  2. 生成 Prisma Client (`npm run prisma-generate`)
  3. 构建 Next.js 应用 (`next build`)

#### 3. Prisma Schema 更新
- 添加了明确的输出路径：`output = "../node_modules/.prisma/client"`
- 这确保了 Prisma Client 被生成到正确的位置

#### 4. ESLint 配置更新
- 忽略了 JavaScript 脚本文件，避免 lint 错误

#### 5. 数据库连接优化
- 在 `lib/db.ts` 中添加了日志配置，根据环境调整日志级别

### 部署步骤

1. 确保在 Vercel 项目中设置了必要的环境变量：
   - `DATABASE_URL`：PostgreSQL 数据库连接字符串
   - 其他必要的环境变量（参考 `.env.example`）

2. 推送到 Git 仓库后，Vercel 会自动使用新的构建命令

3. 监控构建日志，确认看到以下信息：
   ```
   🔧 开始为 Vercel 部署生成 Prisma Client...
   ✅ Prisma schema 文件存在
   📦 正在生成 Prisma Client...
   ✅ Prisma Client 生成成功
   ```

### 故障排除

如果仍然遇到问题，请检查：
1. `DATABASE_URL` 环境变量是否正确设置
2. Prisma schema 文件是否存在且语法正确
3. 构建日志中是否有 Prisma 相关的错误信息