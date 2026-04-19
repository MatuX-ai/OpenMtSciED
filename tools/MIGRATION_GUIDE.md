# 硬件项目数据模型迁移指南

## 问题说明

之前尝试使用 Alembic 执行迁移时遇到编码错误，原因是配置文件和迁移脚本中包含中文字符。现已提供替代方案。

## 解决方案

### 方案一：使用直接迁移脚本（推荐）

我们创建了一个不依赖 Alembic 的独立迁移脚本，可以直接执行。

#### 步骤 1：配置数据库连接

编辑 `.env` 文件，确保 `DATABASE_URL` 配置正确：

```bash
# 如果使用 Neon 数据库
DATABASE_URL=postgresql+asyncpg://user:password@your-neon-host.amazonaws.com:5432/openmtscied

# 或者本地 PostgreSQL
DATABASE_URL=postgresql+asyncpg://postgres:password@localhost:5432/openmtscied
```

#### 步骤 2：执行迁移脚本

```bash
cd g:\OpenMTSciEd\tools
python run_hardware_migration.py
```

脚本会自动：
1. ✅ 创建 3 个枚举类型（hardwarecategory, codelanguage, mcuetype）
2. ✅ 创建 3 个新表（hardware_project_templates, hardware_materials, code_templates）
3. ✅ 为 study_projects 表添加 7 个新字段
4. ✅ 为 peer_reviews 表添加 9 个新字段
5. ✅ 创建必要的索引

#### 步骤 3：验证迁移结果

连接数据库并检查：

```sql
-- 检查新表是否创建
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE 'hardware_%' OR table_name = 'code_templates';

-- 检查 study_projects 的新字段
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'study_projects' 
AND column_name IN ('hardware_template_id', 'mcu_type_used', 'webusb_flashed');

-- 检查 peer_reviews 的新字段
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'peer_reviews' 
AND column_name LIKE '%score%' OR column_name LIKE '%feedback%';
```

---

### 方案二：修复 Alembic 后使用（可选）

如果需要使用 Alembic，需要先完成以下设置：

#### 步骤 1：创建 Alembic 环境文件

在 `src/migrations/` 目录下创建 `env.py` 和 `script.py.mako` 文件。

#### 步骤 2：配置 alembic.ini

确保 `alembic.ini` 中的 `sqlalchemy.url` 指向正确的数据库。

#### 步骤 3：执行迁移

```bash
cd g:\OpenMTSciEd\src
alembic upgrade head
```

**注意**：此方案需要更多配置工作，建议使用方案一。

---

## 导入现有硬件项目数据

迁移完成后，可以运行数据导入脚本将 JSON 文件中的数据导入数据库：

```bash
cd g:\OpenMTSciEd\tools
python migrate_hardware_projects.py
```

**重要**：需要先修改 `migrate_hardware_projects.py` 中的 `DATABASE_URL` 配置。

---

## 常见问题

### Q1: 提示数据库连接失败

**A**: 检查以下几点：
1. 数据库服务是否正在运行
2. `.env` 文件中的 `DATABASE_URL` 是否正确
3. 防火墙是否允许连接
4. 用户名和密码是否正确

### Q2: 提示表已存在

**A**: 这是正常的。迁移脚本使用了 `IF NOT EXISTS` 和 `ADD COLUMN IF NOT EXISTS`，可以安全地重复执行。

### Q3: 枚举类型创建失败

**A**: PostgreSQL 不允许重复创建枚举类型。脚本已使用 `EXCEPTION WHEN duplicate_object` 处理此情况，可以忽略警告。

### Q4: 外键约束错误

**A**: 确保先创建了被引用的表。脚本按照正确的顺序创建表：
1. 先创建 `hardware_project_templates`
2. 再创建 `hardware_materials` 和 `code_templates`（它们引用前者）
3. 最后修改 `study_projects` 和 `peer_reviews`（它们引用新表）

---

## 回滚迁移

如果需要回滚，可以手动执行以下 SQL：

```sql
-- 删除扩展字段
ALTER TABLE peer_reviews 
DROP COLUMN IF EXISTS test_results,
DROP COLUMN IF EXISTS review_photos,
DROP COLUMN IF EXISTS improvement_suggestions,
DROP COLUMN IF EXISTS code_feedback,
DROP COLUMN IF EXISTS hardware_feedback,
DROP COLUMN IF EXISTS documentation_score,
DROP COLUMN IF EXISTS creativity_score,
DROP COLUMN IF EXISTS code_quality_score,
DROP COLUMN IF EXISTS hardware_functionality_score;

ALTER TABLE study_projects 
DROP COLUMN IF EXISTS flash_timestamp,
DROP COLUMN IF EXISTS webusb_flashed,
DROP COLUMN IF EXISTS demonstration_video_url,
DROP COLUMN IF EXISTS completion_photos,
DROP COLUMN IF EXISTS actual_cost,
DROP COLUMN IF EXISTS mcu_type_used,
DROP COLUMN IF EXISTS hardware_template_id;

-- 删除新表
DROP TABLE IF EXISTS code_templates;
DROP TABLE IF EXISTS hardware_materials;
DROP TABLE IF EXISTS hardware_project_templates;

-- 删除枚举类型
DROP TYPE IF EXISTS mcuetype;
DROP TYPE IF EXISTS codelanguage;
DROP TYPE IF EXISTS hardwarecategory;
```

---

## 下一步

迁移成功后，可以：

1. **创建 API 路由**：在 `src/routes/` 下创建 `hardware_project_routes.py`
2. **更新前端代码**：调整 TypeScript 接口以匹配新的数据结构
3. **测试功能**：验证硬件项目的 CRUD 操作
4. **导入示例数据**：运行 `migrate_hardware_projects.py` 导入现有的 14 个硬件项目

---

## 技术支持

如遇到问题，请检查：
- 日志输出中的详细错误信息
- 数据库连接配置
- Python 依赖是否安装完整（`sqlalchemy`, `asyncpg`, `pydantic`）

参考文档：
- [硬件项目数据模型设计](../docs/HARDWARE_PROJECT_DATA_MODEL.md)
- [模型定义](../src/models/hardware_project.py)
- [迁移脚本](./run_hardware_migration.py)
