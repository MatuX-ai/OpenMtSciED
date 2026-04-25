# 资源关联功能说明

## 概述

本功能实现了课程、教程、课件和硬件项目之间的联动关联关系，用户可以在用户端实现以下操作：

1. **点击教程时** - 自动显示相关的课件列表
2. **点击课件时** - 自动显示所需的硬件项目列表
3. **完整学习路径** - 从教程到课件再到硬件的完整学习路径展示

## 后端API

### 新增API端点

所有API都位于 `/api/v1/resources` 前缀下：

#### 1. 获取教程相关课件
```
GET /api/v1/resources/tutorials/{tutorial_id}/related-materials
```
**参数:**
- `tutorial_id`: 教程ID
- `subject` (可选): 学科过滤

**响应示例:**
```json
{
  "success": true,
  "data": [...],
  "total": 5,
  "tutorial_id": "tutorial-123"
}
```

#### 2. 获取课件所需硬件
```
GET /api/v1/resources/materials/{material_id}/required-hardware
```
**参数:**
- `material_id`: 课件ID
- `subject` (可选): 学科过滤

**响应示例:**
```json
{
  "success": true,
  "data": [...],
  "total": 3,
  "material_id": "material-456"
}
```

#### 3. 获取完整学习路径
```
GET /api/v1/resources/learning-path/{tutorial_id}
```
**参数:**
- `tutorial_id`: 教程ID

**响应示例:**
```json
{
  "success": true,
  "data": {
    "tutorial": {...},
    "related_materials": [...],
    "required_hardware": [...]
  }
}
```

#### 4. 关键词搜索资源
```
GET /api/v1/resources/search-resources?keyword={keyword}
```
**参数:**
- `keyword`: 搜索关键词

**响应示例:**
```json
{
  "success": true,
  "data": {
    "tutorials": [...],
    "materials": [...],
    "hardware_projects": [...]
  },
  "keyword": "物理"
}
```

#### 5. 资源概览统计
```
GET /api/v1/resources/resources/summary
```

**响应示例:**
```json
{
  "success": true,
  "data": {
    "total_tutorials": 100,
    "total_materials": 200,
    "total_hardware": 50,
    "subject_distribution": {
      "物理": {"tutorials": 20, "materials": 30, "hardware": 10},
      "化学": {"tutorials": 15, "materials": 25, "hardware": 8}
    }
  }
}
```

## 前端组件

### ResourceAssociationsComponent

这是一个通用的资源关联展示组件，可以在任何地方使用。

**使用方法:**

```html
<!-- 显示教程的完整学习路径 -->
<app-resource-associations 
  [tutorialId]="'tutorial-123'"
  [showMaterials]="true"
  [showHardware]="true">
</app-resource-associations>

<!-- 仅显示课件所需硬件 -->
<app-resource-associations 
  [materialId]="'material-456'"
  [showMaterials]="false"
  [showHardware]="true">
</app-resource-associations>
```

**输入参数:**
- `tutorialId`: 教程ID（用于获取完整学习路径）
- `materialId`: 课件ID（用于获取所需硬件）
- `showMaterials`: 是否显示相关课件（默认: true）
- `showHardware`: 是否显示所需硬件（默认: true）

### 集成到现有组件

#### 教程库组件
在教程卡片中添加了"关联资源"按钮，点击后弹出对话框显示相关课件和所需硬件。

#### 课件库组件
在课件卡片中添加了"所需硬件"按钮，点击后弹出对话框显示所需硬件项目。

## 关联逻辑

目前的关联逻辑基于**学科匹配**：

1. **教程 → 课件**: 根据教程的学科字段，匹配相同学科的课件
2. **课件 → 硬件**: 根据课件的学科字段，匹配相同学科的硬件项目

未来可以扩展更智能的关联算法，如：
- 基于知识图谱的关系匹配
- 基于内容的相似度计算
- 基于用户行为的学习路径推荐

## 测试

运行测试脚本验证API功能：

```bash
cd tests
python test_resource_associations.py
```

## 文件结构

```
backend/openmtscied/modules/resources/
├── services/
│   └── association_service.py    # 关联服务实现
└── association_api.py             # 关联API路由

desktop-manager/src/app/shared/components/
└── resource-associations/
    └── resource-associations.component.ts  # 关联展示组件

desktop-manager/src/app/features/
├── tutorial-library/
│   └── tutorial-library.component.ts       # 已集成关联功能
└── material-library/
    └── material-library.component.ts       # 已集成关联功能
```

## 下一步改进

1. **智能推荐**: 使用机器学习算法优化资源推荐
2. **用户反馈**: 收集用户对关联资源的评分和反馈
3. **个性化路径**: 根据用户学习历史生成个性化学习路径
4. **可视化图谱**: 在学习路径可视化中展示资源关联关系
5. **缓存优化**: 添加Redis缓存提高API响应速度
