# 移除 admin-web 中的 Neo4j UI 并替换为 PostgreSQL 闭包表配置

## Context（背景）

后端 (backend-next) 已完成从 Neo4j 到 PostgreSQL 闭包表 + Prisma ORM 的全面架构迁移：
- 已删除 `lib/neo4j.ts` 与 `neo4j-driver` 依赖
- 学习路径由 `lib/concept-path.ts` (递归 CTE) 实现
- 数据库存储层统一为单一 `DATABASE_URL` (Prisma 读取)
- API 响应 `GET /api/v1/admin/settings` 不再返回 `neo4j_*` 字段

但 admin-web (Angular) 中仍残留 Neo4j 配置 UI 与文案，会导致：
1. 用户在设置页面看到已不存在的"Neo4j 配置"卡片
2. 知识图谱管理页面文案错误（"实时查看 Neo4j 中的…"）
3. 类型不一致（前端接口声明 `neo4j_uri` 等字段，后端不再返回）
4. `grep -r neo4j admin-web/src` 仍有 12 处匹配

本次变更将这些 UI 与文案同步更新到 PostgreSQL 闭包表架构，保持前后端一致。

## 涉及文件清单

修改 2 个文件，共影响 12 处引用：

| 文件路径 | 引用行号 | 影响内容 |
|---------|---------|---------|
| `admin-web/src/app/admin/settings/admin-settings.component.ts` | 30-32, 184-209, 345-353 | 删除 neo4j 接口字段、UI 卡片、默认值 |
| `admin-web/src/app/admin/knowledge-graph/knowledge-graph-admin.component.ts` | 21 | 更新 mat-card-subtitle 文案 |

## Task 1: 更新 `admin-settings.component.ts`

### 1.1 移除 `SystemSettings.database` 接口的 neo4j 字段（第 24-33 行）

**修改前：**
```typescript
database?: {
  neon_host: string;
  neon_port: number;
  neon_name: string;
  neon_user: string;
  neon_password?: string;
  neo4j_uri: string;
  neo4j_username: string;
  neo4j_password?: string;
};
```

**修改后：**
```typescript
database?: {
  neon_host: string;
  neon_port: number;
  neon_name: string;
  neon_user: string;
  neon_password?: string;
  database_url: string;  // 新增：DATABASE_URL 单字段（只读展示 + 修改提示）
};
```

### 1.2 删除 "Neo4j 图数据库" 卡片（第 184-209 行）

**删除** 以下完整 `<mat-card>` 块（含 `style="margin-top: 20px;"` 的整张卡片）：

```html
<mat-card style="margin-top: 20px;">
  <mat-card-header>
    <mat-card-title>Neo4j 图数据库</mat-card-title>
    <mat-card-subtitle>配置Neo4j Aura云数据库连接参数</mat-card-subtitle>
  </mat-card-header>
  <mat-card-content>
    <!-- URI / 用户名 / 密码 三个表单字段 -->
  </mat-card-content>
</mat-card>
```

**替换为** 新的"数据库连接 URL"卡片（位置紧跟在 Neon PostgreSQL 卡片之后，保持原 `margin-top: 20px` 样式）：

```html
<mat-card style="margin-top: 20px;">
  <mat-card-header>
    <mat-card-title>PostgreSQL 闭包表连接</mat-card-title>
    <mat-card-subtitle>当前 Prisma 使用的 DATABASE_URL（修改需编辑 backend-next/.env.local 并重启服务）</mat-card-subtitle>
  </mat-card-header>
  <mat-card-content>
    <div class="form-group">
      <mat-form-field appearance="outline" class="full-width">
        <mat-label>DATABASE_URL</mat-label>
        <input matInput readonly [value]="database.database_url"
               placeholder="postgresql://user:password@host:5432/dbname">
      </mat-form-field>
    </div>
    <button mat-stroked-button color="primary" (click)="showDatabaseUrlHint()">
      <mat-icon>edit</mat-icon>
      修改
    </button>
  </mat-card-content>
</mat-card>
```

### 1.3 删除默认配置中的 neo4j 字段（第 345-354 行）

**修改前：**
```typescript
database: {
  neon_host: 'ep-raspy-shape-ao7ool7u-pooler.c-2.ap-southeast-1.aws.neon.tech',
  neon_port: 5432,
  neon_name: 'neondb',
  neon_user: 'neondb_owner',
  neon_password: '',
  neo4j_uri: 'neo4j+s://4abd5ef9.databases.neo4j.io',
  neo4j_username: '4abd5ef9',
  neo4j_password: ''
},
```

**修改后：**
```typescript
database: {
  neon_host: 'ep-raspy-shape-ao7ool7u-pooler.c-2.ap-southeast-1.aws.neon.tech',
  neon_port: 5432,
  neon_name: 'neondb',
  neon_user: 'neondb_owner',
  neon_password: '',
  database_url: 'postgresql://neondb_owner:***@ep-raspy-shape-ao7ool7u-pooler.c-2.ap-southeast-1.aws.neon.tech:5432/neondb'
},
```

### 1.4 新增 `showDatabaseUrlHint()` 方法

在 `AdminSettingsComponent` 类的 `saveSettings()` 方法之后添加：

```typescript
/**
 * 提示用户如何在后端修改 DATABASE_URL
 *
 * 注意：Prisma 默认读取 .env 而非 .env.local（已知 pitfall），
 * 因此修改后必须重启 backend-next 服务才能生效。
 */
showDatabaseUrlHint(): void {
  this.snackBar.open(
    '请在 backend-next/.env.local 中修改 DATABASE_URL 后重启服务（注意 Prisma 默认读取 .env）',
    '关闭',
    { duration: 5000 }
  );
}
```

## Task 2: 更新 `knowledge-graph-admin.component.ts`

### 2.1 更新 mat-card-subtitle 文案（第 21 行）

**修改前：**
```html
<mat-card-subtitle>实时查看 Neo4j 中的教程、课件与硬件项目关联</mat-card-subtitle>
```

**修改后：**
```html
<mat-card-subtitle>实时查看 PostgreSQL 闭包表中的知识图谱</mat-card-subtitle>
```

## 设计决策说明

### 为什么 `database_url` 是只读 + 修改按钮提示

- Prisma 在 backend-next 启动时读取 `process.env.DATABASE_URL`，运行时无法热更新
- 前端没有直接访问后端环境变量的能力
- 现有 `loadSettings()` 调用 `GET /api/v1/admin/settings`，该接口当前不返回完整 `DATABASE_URL`（出于安全考虑不返回密码段）
- 选用"只读展示 + 提示按钮"方案最符合实际架构，避免误导用户

### 为什么保留 neon_host/port/name/user/password 字段

- 这些字段仍用于显示当前 Neon PostgreSQL 实例的连接详情
- 用户可参考这些字段重建 `DATABASE_URL`
- 删除它们会破坏现有信息展示，需另开任务

### 降级方案（备注中提到）

如果 `npm run build` 报类型错误或页面渲染异常，按以下顺序排查：
1. 确认 `SystemSettings.database` 接口已正确更新（不再含 neo4j_*）
2. 确认 `settings` 对象默认值已同步
3. 确认模板中所有 `database.neo4j_*` 引用已替换
4. 如仍失败，可在接口中临时添加 `@deprecated` 注释的 neo4j 字段作为兼容层（不推荐，仅作最后手段）

## Verification（验证步骤）

### 步骤 1：源码清洁度验证

```bash
cd g:\OpenMTSciEd
grep -rni "neo4j" admin-web/src
```
**预期输出**：空（0 匹配）

### 步骤 2：类型检查与构建

```bash
cd g:\OpenMTSciEd\admin-web
npm run build
```
**预期输出**：构建成功，无 TypeScript 编译错误

### 步骤 3：运行时验证

```bash
# 终端 1
cd g:\OpenMTSciEd\backend-next
npm run dev

# 终端 2
cd g:\OpenMTSciEd\admin-web
npm start
```

**访问与检查**：

| 验证项 | URL | 期望结果 |
|--------|-----|---------|
| 设置页无 NEO4J 卡片 | http://localhost:4200/admin/settings | "数据库配置" Tab 中无"Neo4j 图数据库"卡片 |
| 新增 DATABASE_URL 卡片 | 同上 | 显示 "PostgreSQL 闭包表连接" 卡片，含只读 URL 输入框 + 修改按钮 |
| 修改按钮提示 | 点击"修改"按钮 | 弹出 snackbar 提示编辑 .env.local |
| 知识图谱文案 | http://localhost:4200/admin/knowledge-graph | 副标题为"实时查看 PostgreSQL 闭包表中的知识图谱" |
| 浏览器控制台 | F12 → Console | 无 neo4j 相关报错或警告 |

### 步骤 4：API 兼容性验证

后端响应 `GET /api/v1/admin/settings` 不再包含 `neo4j_uri` / `neo4j_username` / `neo4j_password` 字段。
前端 `loadSettings()` 使用 spread 操作符 `{ ...this.settings, ...response }`，自动忽略不存在的字段，**无需特殊兼容代码**。

## 不在本次范围

- 后端 `/api/v1/admin/settings` API 改动（已由后端迁移完成）
- 移除 `admin-web/package.json` 中的 neo4j-driver 依赖（已确认不存在）
- 修改 neon_host/port/name/user/password 字段（保留作为辅助信息）
- 修复 `loadSettings()` 中 `{ success, data }` 响应结构解析的 pre-existing bug（不在本次任务范围）
