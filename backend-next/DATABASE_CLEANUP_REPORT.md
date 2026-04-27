# 数据库清理与 Prisma Schema 完整性检查报告

**生成时间**: 2026-04-26  
**项目**: OpenMTSciEd Backend Next

---

## 📊 检查结果摘要

### ✅ Prisma Schema 完整性

Prisma schema 文件 (`backend-next/prisma/schema.prisma`) **完整且有效**。

**定义的模型 (7个)**:
1. `User` - 用户表
2. `Course` - 课程表
3. `LearningRecord` - 学习记录表
4. `Question` - 题库表
5. `Assignment` - 作业/练习表
6. `CrawlerConfig` - 爬虫配置表
7. `EducationPlatform` - 教育平台表

**Schema 验证**: ✅ 通过 (`npx prisma validate`)

---

### ✅ 数据库表状态

**数据库中实际存在的表 (7个)**:
- Assignment
- Course
- CrawlerConfig
- EducationPlatform
- LearningRecord
- Question
- User

**孤立表检查**: ✅ **没有发现孤立的表**

所有数据库中的表都在 Prisma schema 中有对应的模型定义。

---

### ⚠️ 注意事项

#### 1. 缺少 `_prisma_migrations` 表

数据库中**不存在** `_prisma_migrations` 表，这表明：
- 数据库表是通过 `prisma db push` 创建的，而不是通过 `prisma migrate`
- 当前数据库**未被 Prisma Migrate 管理**

**影响**:
- ✅ 对于开发环境，使用 `db push` 是完全可行的
- ⚠️ 对于生产环境，建议使用 `prisma migrate` 来管理数据库变更历史

**建议**:
- 如果需要使用迁移功能，可以运行以下命令初始化：
  ```bash
  npx prisma migrate dev --name init
  ```
- 如果继续使用 `db push` 方式，保持现状即可

#### 2. 环境变量加载问题

Prisma CLI 命令不会自动加载 `.env.local` 文件，需要：
- 手动设置环境变量，或
- 使用 `dotenv-cli` 工具，或
- 在 PowerShell 中显式设置 `$env:DATABASE_URL`

---

## 🔧 已完成的修复

### 1. 更新了 `check-orphaned-tables.ts` 脚本

**问题**: 脚本中的模型列表是硬编码的，缺少 `CrawlerConfig` 和 `EducationPlatform`

**修复**: 
- 改为从 `schema.prisma` 文件动态读取模型列表
- 自动检测所有定义的模型
- 避免未来添加新模型时需要手动更新脚本

**文件**: `backend-next/scripts/check-orphaned-tables.ts`

### 2. 更新了 `verify-schema.ts` 脚本

**问题**: 脚本没有加载环境变量，导致 `prisma validate` 失败

**修复**:
- 添加了 `dotenv` 加载逻辑
- 自动从 `.env.local` 读取 `DATABASE_URL`
- 添加了环境变量存在性检查

**文件**: `backend-next/scripts/verify-schema.ts`

---

## 📋 推荐的后续操作

### 选项 A: 继续使用 `db push` (推荐用于开发)

```bash
# 同步 schema 到数据库
npx prisma db push

# 生成 Prisma Client
npx prisma generate
```

**优点**:
- 简单快速
- 适合开发和原型阶段
- 不需要管理迁移文件

**缺点**:
- 没有迁移历史
- 不适合团队协作和生产环境

---

### 选项 B: 切换到 `prisma migrate` (推荐用于生产)

```bash
# 1. 创建初始迁移
npx prisma migrate dev --name init

# 2. 生成 Prisma Client
npx prisma generate

# 3. 未来修改 schema 后
npx prisma migrate dev --name <描述性名称>
```

**优点**:
- 有完整的迁移历史
- 支持回滚和版本控制
- 适合团队协作和生产部署

**缺点**:
- 需要维护迁移文件
- 学习曲线稍陡

---

## 🎯 结论

### 当前状态: ✅ 健康

1. **Prisma Schema**: 完整且有效
2. **数据库表**: 与 schema 完全匹配，无孤立表
3. **数据一致性**: 良好

### 无需立即操作

当前数据库结构是健康的，没有需要清理的孤立表。您可以根据项目阶段选择合适的数据库管理策略：
- **开发阶段**: 继续使用 `db push`
- **生产准备**: 考虑迁移到 `prisma migrate`

---

## 📝 相关命令参考

```bash
# 检查孤立表
cd backend-next
npx ts-node scripts/check-orphaned-tables.ts

# 验证 schema
npx ts-node scripts/verify-schema.ts

# 同步 schema 到数据库
npx prisma db push

# 查看数据库状态
$env:DATABASE_URL='<your-db-url>'; npx prisma migrate status

# 生成 Prisma Client
npx prisma generate

# 打开 Prisma Studio (可视化数据库管理)
npx prisma studio
```

---

**报告结束**
