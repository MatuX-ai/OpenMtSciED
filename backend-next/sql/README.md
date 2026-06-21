# SQL 脚本 — 学习路径闭包表

Neon PostgreSQL 兼容的独立 SQL 交付物，与应用层 [`lib/concept-path.ts`](../lib/concept-path.ts) 逻辑等价。

## 文件说明

| 文件 | 用途 |
|------|------|
| `schema.sql` | 建表、索引、外键、CHECK 约束（幂等） |
| `queries.sql` | 核心只读查询：前置依赖、后续节点、路径链条 |
| `maintenance.sql` | 插入/删除依赖、闭包维护、`rebuild_closure()` 函数 |
| `migrate-data.sql` | 数据导入模板与验证 SQL |

## 快速使用

```bash
cd backend-next

# 1. 初始化表结构
psql "$DATABASE_URL" -f sql/schema.sql

# 2. 维护函数（可选，Neon Console 也可执行）
psql "$DATABASE_URL" -f sql/maintenance.sql

# 3. 推荐：TypeScript 迁移（幂等）
npx tsx scripts/export-from-json.ts
npx tsx scripts/migrate-knowledge-graph.ts
npx tsx scripts/verify-closure.ts
```

## 闭包表算法

**插入边 (pre → dep)**：环检测 → 写 `concept_dependency` → 自引用 → 直接路径 → `ancestors_of(pre) × descendants_of(dep)`。

**删除边 (MVP)**：删除 `concept_dependency` 行 → `SELECT rebuild_closure(path_type)` 全量重建。

**查询**：只读操作扫描 `concept_path` 索引，无需递归 CTE。

详见 [`docs/requirements/08-learning-path-closure-table-migration.md`](../../docs/requirements/08-learning-path-closure-table-migration.md)。
