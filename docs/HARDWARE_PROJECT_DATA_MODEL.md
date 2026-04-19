# 硬件项目数据模型完善方案

## 概述

本文档详细说明了 OpenMTSciEd 项目中硬件项目相关数据模型的差距分析、设计方案和迁移策略。

## 1. 差距分析

### 1.1 现有问题

通过审查 `src/models/collaboration.py` 中的 `StudyProject` 和 `PeerReview` 模型，以及前端/桌面端的 TypeScript 接口定义，发现以下关键差距：

#### 1.1.1 StudyProject 模型缺失字段

| 需求 | 前端/桌面端要求 | 当前数据库状态 |
|------|----------------|---------------|
| 硬件项目模板关联 | `tutorialId` / 项目模板引用 | ❌ 缺失 |
| 材料清单管理 | `materials: MaterialItem[]` | ❌ 缺失 |
| 代码模板存储 | `codeTemplate: CodeTemplate` | ❌ 缺失 |
| WebUSB 支持状态 | `webUsbSupport: boolean` | ❌ 缺失 |
| MCU 类型 | Arduino/ESP32 等类型 | ❌ 缺失 |
| 实际成本追踪 | `totalCost` 计算 | ❌ 缺失 |
| 电路图路径 | `circuitDiagram?: string` | ❌ 缺失 |
| 完成照片 | 项目成果展示 | ❌ 缺失 |
| 演示视频 | 项目演示URL | ❌ 缺失 |

#### 1.1.2 PeerReview 模型缺失字段

| 需求 | 前端/桌面端要求 | 当前数据库状态 |
|------|----------------|---------------|
| 硬件功能评分 | 专项评分维度 | ❌ 缺失 |
| 代码质量评分 | 专项评分维度 | ❌ 缺失 |
| 创意评分 | 专项评分维度 | ❌ 缺失 |
| 文档完整性评分 | 专项评分维度 | ❌ 缺失 |
| 硬件实现反馈 | 详细反馈文本 | ❌ 缺失 |
| 代码质量反馈 | 详细反馈文本 | ❌ 缺失 |
| 审查附件 | 照片、测试结果 | ❌ 缺失 |

#### 1.1.3 缺少独立的硬件项目模板表

- 目前硬件项目仅存储在 JSON 文件（`data/hardware_projects.json`）中
- 无法通过数据库进行高效查询、过滤和关联
- 缺乏版本控制和权限管理
- 无法统计使用次数和评价

### 1.2 影响范围

- **前端应用** (`frontend/src`): WebUSB 烧录、项目浏览功能受影响
- **桌面管理器** (`desktop-manager/src`): 硬件项目浏览器、材料清单显示受影响
- **后端 API**: 缺少硬件项目的 CRUD 接口
- **协作学习**: 同伴审查无法针对硬件项目进行专项评估

## 2. 数据库设计方案

### 2.1 新增数据表

#### 2.1.1 hardware_project_templates（硬件项目模板表）

**用途**: 存储标准化的硬件项目模板，所有项目预算控制在50元以内

**核心字段**:

```python
id: Integer (PK, autoincrement)
project_id: String(50) (unique, index)  # 如 "HW-Sensor-001"
title: String(200) (not null)
category: Enum (hardwarecategory) (index)  # electronics/robotics/iot/etc.
difficulty: Integer (1-5) (not null)
subject: String(50) (not null)  # 物理/化学/生物/工程
description: Text (not null)
learning_objectives: JSON (default=[])
estimated_time_hours: Float (not null)
total_cost: Float (not null, ≤50)
budget_verified: Boolean (default=False)
mcu_type: Enum (mcuetype)  # arduino_nano/esp32/etc.
wiring_instructions: Text
circuit_diagram_path: String(500)
safety_notes: JSON (default=[])
common_issues: JSON (default=[])
teaching_guide: Text
webusb_support: Boolean (default=False)
supported_boards: JSON (default=[])
knowledge_point_ids: JSON (default=[])
thumbnail_path: String(500)
demo_video_url: String(500)
is_active: Boolean (default=True)
is_featured: Boolean (default=False)
usage_count: Integer (default=0)
average_rating: Float (default=0.0)
review_count: Integer (default=0)
created_at: DateTime (timezone=True)
updated_at: DateTime (timezone=True)
created_by: Integer (FK -> users.id)
```

**索引**:
- `idx_hw_template_category`: 按分类快速查询
- `idx_hw_template_difficulty`: 按难度筛选
- `idx_hw_template_subject`: 按学科筛选
- `idx_hw_template_cost`: 按成本范围查询

**关系**:
- `materials`: One-to-Many with `hardware_materials`
- `code_templates`: One-to-Many with `code_templates`
- `study_projects`: One-to-Many with `study_projects`
- `creator`: Many-to-One with `users`

---

#### 2.1.2 hardware_materials（硬件材料清单项表）

**用途**: 存储每个硬件项目所需的材料详细信息

**核心字段**:

```python
id: Integer (PK, autoincrement)
template_id: Integer (FK -> hardware_project_templates.id, index, not null)
name: String(200) (not null)
quantity: Integer (not null, default=1)
unit: String(20) (default="个")
unit_price: Float (not null)
subtotal: Float (auto-calculated: quantity * unit_price)
supplier_link: String(500)
alternative_suggestion: Text
component_type: String(50)  # 传感器/执行器/主控板等
created_at: DateTime (timezone=True)
```

**索引**:
- `idx_hw_material_template`: 按模板ID查询所有材料

**关系**:
- `template`: Many-to-One with `hardware_project_templates`

**业务规则**:
- 同一模板中同名材料只能有一条记录（可通过唯一约束实现）
- `subtotal` 应在插入/更新时自动计算

---

#### 2.1.3 code_templates（代码模板表）

**用途**: 存储硬件项目的代码示例，支持多种编程语言

**核心字段**:

```python
id: Integer (PK, autoincrement)
hardware_template_id: Integer (FK -> hardware_project_templates.id, index)
study_project_id: Integer (FK -> study_projects.id, index)
language: Enum (codelanguage) (not null)  # arduino/python/blockly/scratch
title: String(200)
code: Text (not null)
description: Text
dependencies: JSON (default=[])
pin_configurations: JSON (default=[])
version: Integer (default=1)
is_primary: Boolean (default=False)
created_at: DateTime (timezone=True, index)
updated_at: DateTime (timezone=True)
created_by: Integer (FK -> users.id)
```

**索引**:
- `idx_code_hw_template`: 按硬件模板查询代码
- `idx_code_study_project`: 按学习项目查询提交的代码
- `idx_code_language`: 按编程语言筛选

**关系**:
- `hardware_template`: Many-to-One with `hardware_project_templates`
- `study_project`: Many-to-One with `study_projects`
- `creator`: Many-to-One with `users`

**设计说明**:
- 同时关联 `hardware_template_id` 和 `study_project_id`
  - 如果 `hardware_template_id` 有值，表示这是模板代码
  - 如果 `study_project_id` 有值，表示这是学生提交的代码
  - 两者可以都为空（独立的代码片段）

---

### 2.2 扩展现有数据表

#### 2.2.1 study_projects 表扩展字段

在现有的 `study_projects` 表中添加以下字段：

```python
# 硬件项目关联
hardware_template_id: Integer (FK -> hardware_project_templates.id, index)

# 硬件项目特定字段
mcu_type_used: Enum (mcuetype)  # 实际使用的微控制器类型
actual_cost: Float  # 实际花费（元）
completion_photos: JSON (default=[])  # 完成照片路径列表
demonstration_video_url: String(500)  # 演示视频URL

# WebUSB 相关
webusb_flashed: Boolean (default=False)  # 是否已通过 WebUSB 烧录
flash_timestamp: DateTime (timezone=True)  # 烧录时间戳
```

**关系扩展**:
```python
hardware_template: relationship("HardwareProjectTemplate", back_populates="study_projects")
```

**to_dict() 方法扩展**:
需要在序列化时包含新字段，特别是嵌套的 `hardware_template` 对象。

---

#### 2.2.2 peer_reviews 表扩展字段

在现有的 `peer_reviews` 表中添加以下字段：

```python
# 硬件项目特定审查字段
hardware_functionality_score: Integer (0-100)  # 硬件功能评分
code_quality_score: Integer (0-100)  # 代码质量评分
creativity_score: Integer (0-100)  # 创意评分
documentation_score: Integer (0-100)  # 文档完整性评分

# 审查详情
hardware_feedback: Text  # 硬件实现反馈
code_feedback: Text  # 代码质量反馈
improvement_suggestions: JSON (default=[])  # 改进建议列表

# 审查附件
review_photos: JSON (default=[])  # 审查时拍摄的照片
test_results: JSON (default={})  # 测试结果数据
```

**to_dict() 方法扩展**:
需要在序列化时包含新的评分维度和反馈内容。

---

### 2.3 枚举类型定义

#### 2.3.1 HardwareCategory（硬件项目分类）

```python
class HardwareCategory(str, enum.Enum):
    ELECTRONICS = "electronics"      # 电子电路
    ROBOTICS = "robotics"            # 机器人
    IOT = "iot"                      # 物联网
    MECHANICAL = "mechanical"        # 机械结构
    SMART_HOME = "smart_home"        # 智能家居
    SENSOR = "sensor"                # 传感器应用
    COMMUNICATION = "communication"  # 通信技术
```

#### 2.3.2 CodeLanguage（编程语言类型）

```python
class CodeLanguage(str, enum.Enum):
    ARDUINO = "arduino"   # Arduino C++
    PYTHON = "python"     # MicroPython
    BLOCKLY = "blockly"   # Blockly 可视化编程
    SCRATCH = "scratch"   # Scratch
```

#### 2.3.3 MCUType（微控制器类型）

```python
class MCUType(str, enum.Enum):
    ARDUINO_NANO = "arduino_nano"
    ARDUINO_UNO = "arduino_uno"
    ESP32 = "esp32"
    ESP8266 = "esp8266"
    RASPBERRY_PI_PICO = "raspberry_pi_pico"
```

---

## 3. 实体关系图 (ER Diagram)

```
┌─────────────────────────┐
│  hardware_project_      │
│  templates              │
│                         │
│  - id (PK)             │◄────┐
│  - project_id (UK)     │     │
│  - title               │     │
│  - category (enum)     │     │ 1:N
│  - difficulty          │     │
│  - total_cost          │     │
│  - mcu_type (enum)     │     │
│  - webusb_support      │     │
│  - created_by (FK)     │     │
└────────┬────────────────┘     │
         │                      │
         │ 1:N                  │
         ▼                      │
┌─────────────────────────┐     │
│  hardware_materials     │     │
│                         │     │
│  - id (PK)             │     │
│  - template_id (FK)    │─────┘
│  - name                │
│  - quantity            │
│  - unit_price          │
│  - subtotal            │
└─────────────────────────┘

         ┌──────────────────┐
         │  code_templates  │
         │                  │
         │  - id (PK)       │
         │  - hardware_     │────► hardware_project_templates
         │    template_id   │
         │    (FK)          │
         │  - study_project_│────► study_projects
         │    id (FK)       │
         │  - language(enum)│
         │  - code          │
         └──────────────────┘

┌─────────────────────────┐
│  study_projects         │
│                         │
│  - id (PK)             │
│  - hardware_template_  │────► hardware_project_templates
│    id (FK)             │
│  - mcu_type_used(enum) │
│  - actual_cost         │
│  - webusb_flashed      │
│  - flash_timestamp     │
└────────┬────────────────┘
         │
         │ 1:N
         ▼
┌─────────────────────────┐
│  peer_reviews           │
│                         │
│  - id (PK)             │
│  - project_id (FK)     │────► study_projects
│  - hardware_functional │
│    ity_score           │
│  - code_quality_score  │
│  - creativity_score    │
│  - documentation_score │
│  - hardware_feedback   │
│  - code_feedback       │
└─────────────────────────┘
```

---

## 4. 迁移策略

### 4.1 Alembic 迁移脚本

已创建迁移脚本：`src/migrations/versions/add_hardware_project_tables.py`

**执行步骤**:

```bash
# 1. 确保数据库连接配置正确
# 编辑 .env 文件中的 DATABASE_URL

# 2. 生成迁移脚本（如果尚未创建）
cd src
alembic revision --autogenerate -m "add_hardware_project_tables"

# 3. 执行迁移
alembic upgrade head

# 4. 验证迁移结果
alembic current
```

**注意事项**:
- 迁移脚本会创建新的枚举类型（PostgreSQL）
- 对于 MySQL，需要调整枚举类型的创建方式
- 建议在测试环境先验证迁移脚本

---

### 4.2 数据迁移脚本

已创建数据迁移脚本：`tools/migrate_hardware_projects.py`

**功能**:
- 读取 `data/hardware_projects.json` 文件
- 将 JSON 数据转换为数据库记录
- 自动映射分类和 MCU 类型
- 创建材料清单项

**执行步骤**:

```bash
# 1. 修改脚本中的数据库连接配置
# 编辑 tools/migrate_hardware_projects.py 中的 DATABASE_URL

# 2. 执行迁移
cd tools
python migrate_hardware_projects.py

# 3. 验证数据导入
# 连接数据库查询 hardware_project_templates 表
```

**映射规则**:

| JSON 分类 | 数据库枚举值 |
|----------|-------------|
| 传感器 | `sensor` |
| 电机控制 | `robotics` |
| 物联网 | `iot` |
| 智能家居 | `smart_home` |
| 化学/农业 | `sensor` |
| 生物/工程 | `robotics` |
| 物理/电子 | `electronics` |
| 工程/机器人 | `robotics` |
| 物理/机械 | `mechanical` |
| 化学/环保 | `sensor` |
| 生物/医疗 | `sensor` |
| 工程/能源 | `electronics` |

---

### 4.3 回滚策略

如果需要回滚迁移：

```bash
# 回滚到上一个版本
alembic downgrade -1

# 或者完全回滚
alembic downgrade base
```

迁移脚本已包含 `downgrade()` 函数，会：
1. 删除扩展字段
2. 删除新创建的表
3. 删除枚举类型

---

## 5. API 设计建议

### 5.1 硬件项目模板 API

```python
# GET /api/v1/hardware/templates
# 列出所有硬件项目模板（支持分页、过滤）
Query params:
  - category: 分类筛选
  - difficulty: 难度筛选
  - subject: 学科筛选
  - max_cost: 最大成本
  - keyword: 关键词搜索

# GET /api/v1/hardware/templates/{template_id}
# 获取单个硬件项目模板详情（包含材料和代码）

# POST /api/v1/hardware/templates
# 创建新的硬件项目模板（需要管理员权限）

# PUT /api/v1/hardware/templates/{template_id}
# 更新硬件项目模板

# DELETE /api/v1/hardware/templates/{template_id}
# 删除硬件项目模板（软删除，设置 is_active=False）

# GET /api/v1/hardware/templates/{template_id}/materials
# 获取模板的材料清单

# GET /api/v1/hardware/templates/{template_id}/codes
# 获取模板的代码示例
```

### 5.2 学习项目与硬件项目关联 API

```python
# POST /api/v1/study-projects/{project_id}/link-hardware
# 将学习项目关联到硬件项目模板
Body: { "hardware_template_id": 123 }

# POST /api/v1/study-projects/{project_id}/webusb-flash
# 记录 WebUSB 烧录事件
Body: { "timestamp": "2026-04-13T10:00:00Z" }

# POST /api/v1/study-projects/{project_id}/upload-completion
# 上传项目完成照片/视频
Form data: photos[], video_url
```

### 5.3 同伴审查 API 扩展

```python
# POST /api/v1/peer-reviews
# 创建同伴审查（支持硬件项目专项评分）
Body: {
  "project_id": 456,
  "reviewee_id": 789,
  "score": 85,
  "hardware_functionality_score": 90,
  "code_quality_score": 80,
  "creativity_score": 85,
  "documentation_score": 85,
  "hardware_feedback": "...",
  "code_feedback": "...",
  "improvement_suggestions": ["...", "..."],
  "review_photos": ["url1", "url2"],
  "test_results": {...}
}
```

---

## 6. 前端/桌面端集成建议

### 6.1 TypeScript 接口对齐

确保前端的 TypeScript 接口与数据库模型一致：

```typescript
// desktop-manager/src/app/models/hardware-project.models.ts

export interface HardwareProject {
  id: string;              // 对应 database id
  projectId: string;       // 对应 project_id
  title: string;           // 对应 title
  category: HardwareCategory;
  difficulty: number;
  // ... 其他字段
  materials: MaterialItem[];  // 从 hardware_materials 表加载
  codeTemplate?: CodeTemplate; // 从 code_templates 表加载
  webUsbSupport: boolean;  // 对应 webusb_support
}
```

### 6.2 数据加载策略

**硬件项目列表页**:
- 只加载模板基本信息（不加载材料和代码）
- 使用分页和懒加载

**硬件项目详情页**:
- 加载完整信息（包括材料和代码）
- 缓存到本地存储以提高性能

**学习项目创建页**:
- 提供硬件项目模板选择器
- 选择后自动填充材料清单和代码模板

---

## 7. 性能优化建议

### 7.1 数据库索引

已为以下字段创建索引：
- `hardware_project_templates.category`
- `hardware_project_templates.difficulty`
- `hardware_project_templates.subject`
- `hardware_project_templates.total_cost`
- `hardware_materials.template_id`
- `code_templates.hardware_template_id`
- `code_templates.study_project_id`
- `code_templates.language`
- `study_projects.hardware_template_id`

### 7.2 查询优化

**常见查询场景**:

```python
# 1. 按分类和难度筛选项目
SELECT * FROM hardware_project_templates
WHERE category = 'sensor' AND difficulty <= 3
ORDER BY total_cost ASC;

# 2. 获取项目及其材料清单（JOIN）
SELECT t.*, m.*
FROM hardware_project_templates t
LEFT JOIN hardware_materials m ON t.id = m.template_id
WHERE t.project_id = 'HW-Sensor-001';

# 3. 统计每个分类的项目数量
SELECT category, COUNT(*) as count
FROM hardware_project_templates
WHERE is_active = true
GROUP BY category;

# 4. 查找最常用（usage_count 最高）的项目
SELECT * FROM hardware_project_templates
ORDER BY usage_count DESC
LIMIT 10;
```

### 7.3 缓存策略

- **Redis 缓存**: 缓存热门硬件项目模板（TTL: 1小时）
- **CDN 缓存**: 缓存电路图、缩略图等静态资源
- **前端缓存**: 使用 Angular/Ionic 的 HTTP 拦截器实现客户端缓存

---

## 8. 安全性考虑

### 8.1 权限控制

- **查看硬件项目模板**: 所有认证用户
- **创建/编辑模板**: 仅管理员或教师角色
- **删除模板**: 仅管理员（软删除）
- **提交学习项目**: 认证用户且属于相关学习小组
- **同伴审查**: 仅学习小组成员

### 8.2 输入验证

- 验证 `total_cost` ≤ 50 元
- 验证 `difficulty` 在 1-5 范围内
- 验证材料清单的 `unit_price` > 0
- 验证代码模板的 `language` 为有效枚举值

### 8.3 SQL 注入防护

- 使用 SQLAlchemy ORM 的参数化查询
- 避免拼接 SQL 字符串
- 对用户输入的搜索关键词进行转义

---

## 9. 测试建议

### 9.1 单元测试

```python
# tests/test_hardware_project_models.py

def test_create_hardware_template():
    """测试创建硬件项目模板"""
    template = HardwareProjectTemplate(
        project_id="TEST-001",
        title="测试项目",
        category=HardwareCategory.SENSOR,
        difficulty=2,
        subject="物理",
        description="测试描述",
        estimated_time_hours=2.0,
        total_cost=30.0,
    )
    assert template.total_cost <= 50

def test_calculate_material_subtotal():
    """测试材料小计自动计算"""
    material = HardwareMaterial(
        template_id=1,
        name="电阻",
        quantity=10,
        unit_price=0.5,
    )
    # 应在 before_insert 事件中自动计算
    assert material.subtotal == 5.0
```

### 9.2 集成测试

```python
# tests/test_hardware_api.py

async def test_list_hardware_templates(client):
    """测试列出硬件项目模板 API"""
    response = await client.get("/api/v1/hardware/templates?category=sensor")
    assert response.status_code == 200
    data = response.json()
    assert len(data) > 0
    assert all(t["category"] == "sensor" for t in data)

async def test_create_study_project_with_hardware(client):
    """测试创建关联硬件项目的学习项目"""
    payload = {
        "title": "我的超声波测距仪",
        "group_id": 1,
        "hardware_template_id": 1,
    }
    response = await client.post("/api/v1/study-projects", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["hardware_template_id"] == 1
```

---

## 10. 后续优化方向

### 10.1 短期优化（1-2周）

1. **实现硬件项目 API**: 创建完整的 CRUD 接口
2. **前端集成**: 更新 Angular 组件以使用新的数据模型
3. **WebUSB 烧录集成**: 实现烧录事件记录和状态追踪
4. **数据迁移**: 执行 JSON 到数据库的迁移

### 10.2 中期优化（1-2月）

1. **推荐系统**: 基于用户历史推荐合适的硬件项目
2. **材料采购链接**: 集成电商平台 API，提供一键购买
3. **社区贡献**: 允许用户上传自创的硬件项目模板
4. **项目 fork 功能**: 基于现有模板创建变体项目

### 10.3 长期优化（3-6月）

1. **AR/VR 集成**: 3D 电路图和接线指导
2. **AI 代码审查**: 自动分析学生代码质量
3. **硬件仿真**: 在线电路仿真器，无需实物即可测试
4. **供应链优化**: 基于地区推荐最优材料供应商

---

## 11. 总结

本次数据模型完善方案解决了以下核心问题：

✅ **添加了硬件项目模板表**，实现了标准化项目管理  
✅ **扩展了 StudyProject 模型**，支持硬件项目关联和 WebUSB 追踪  
✅ **扩展了 PeerReview 模型**，支持硬件项目专项审查  
✅ **设计了材料清单和代码模板表**，支持详细的技术文档管理  
✅ **提供了完整的迁移脚本**，确保平滑过渡  
✅ **给出了 API 设计和前端集成建议**，便于后续开发  

通过这些改进，OpenMTSciEd 平台将能够：
- 更好地支持低成本 STEM 硬件教育
- 提供更丰富的项目管理和协作功能
- 实现 WebUSB 烧录的全流程追踪
- 支持更细致的同伴审查和反馈

---

## 附录：文件清单

| 文件路径 | 说明 |
|---------|------|
| `src/models/hardware_project.py` | 新增的硬件项目数据模型 |
| `src/models/collaboration.py` | 更新的协作学习模型（已修改） |
| `src/migrations/versions/add_hardware_project_tables.py` | Alembic 迁移脚本 |
| `tools/migrate_hardware_projects.py` | JSON 数据迁移脚本 |
| `docs/HARDWARE_PROJECT_DATA_MODEL.md` | 本文档 |
