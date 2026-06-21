# 桌面端教程库与课件库统一树状结构改造

## Context

当前桌面端有三个内容重叠的独立页面：**教程库**（/tutorial-library）、**课件库**（/material-library）和**资源浏览器**（/resource-browser，仅模拟数据）。用户需要在三者间来回切换才能找到关联的教程和课件，体验割裂。本次改造将三者合并为一个统一页面，采用**树状结构按来源组织**，让教程和课件在同一个视图中呈现层级关系。

## 目标树结构

```
全部资源
├── 📁 本地教程          (Tauri IPC: get_courses)
│   ├── 📘 Arduino入门实战
│   │   ├── 📄 课件A.pdf
│   │   └── 📄 课件B.pptx
│   └── 📘 智能小车制作
├── 📁 OpenSciEd         (Tauri IPC: browse_open_resources)
│   ├── 📘 生态系统能量流动
│   │   ├── 📄 OpenStax 生态学导论
│   │   └── 📄 TED-Ed 视频
│   └── 📘 电路基础
├── 📁 格物斯坦
├── 📁 stemcloud.cn
└── 📁 开源课件          (Tauri IPC: browse_open_materials)
    ├── 📁 OpenStax
    ├── 📁 TED-Ed
    └── 📁 PhET
```

## 实现步骤

### Task 1: 创建树结构数据模型

**文件**: `src/app/models/resource-tree.models.ts`

定义树节点类型、结构接口和来源分组常量。节点类型分6级：root → source_group → source_subgroup → tutorial → material（叶子）。

### Task 2: 创建数据聚合服务

**文件**: `src/app/core/services/resource-tree.service.ts`

核心聚合服务，职责：
- `buildTree()` - 构建根节点及各来源组骨架
- `expandSourceGroup(groupId)` - 惰性加载某来源下的教程列表
- `expandTutorial(node)` - 惰性加载某教程下的关联课件
- `searchTree(keyword)` - 搜索高亮与过滤
- 数据优先级：Tauri IPC → HTTP API → mock/empty

数据流：聚合 TauriService（本地CRUD）、UnifiedCourseService/UnifiedMaterialService（HTTP API）、ResourceAssociationService（关联查询）

### Task 3: 创建统一资源浏览器主页面

**文件**: `src/app/features/unified-resource-browser/` 目录

#### 3.1 主页面组件
- **文件**: `unified-resource-browser.component.ts`
- 左右分栏布局（左侧树面板 360px + 右侧详情面板 flex:1）
- 顶部搜索栏、刷新、全部折叠按钮
- 管理选中节点状态

#### 3.2 树面板组件（递归树）
- **文件**: `resource-tree-panel/` 下
- `resource-tree-panel.component.ts` - 树容器（含搜索过滤、展开/折叠全部）
- `tree-node.component.ts` - 递归节点渲染（缩进、图标、标签、徽标、加载指示器、操作菜单）
- 展开节点时调用 service 惰性加载子节点
- 叶子节点（课件）不可展开

#### 3.3 详情面板组件
- **文件**: `resource-detail-panel/resource-detail-panel.component.ts`
- 根据节点类型动态渲染：
  - **教程详情**: 标题、来源标签、描述、元数据（学科/学段/难度）、关联课件列表
  - **课件详情**: 文件类型图标、大小、预览/下载按钮
  - **来源组概览**: 统计卡片，该来源下的教程数量、课件数量

### Task 4: 整合CRUD操作

复用现有逻辑，不重新实现：
- **新建/编辑教程**: 复用 tutorial-library 的对话框，调用 TauriService.createCourse/updateCourse
- **上传课件**: 复用 material-library 的上传对话框，调用 TauriService.uploadMaterial
- **删除**: 调用 TauriService.deleteCourse/deleteMaterial
- **关联资源**: 复用 ResourceAssociationsComponent

### Task 5: 更新路由与导航

- **新增路由** `/resource-explorer` → UnifiedResourceBrowserComponent
- **旧路由保留** `/tutorial-library`、`/material-library`、`/resource-browser` 添加顶部 banner 提示引导到新页面
- **侧边栏**: 新增"统一资源库"导航项，旧项暂时保留但可标识为"旧版"

### Task 6: 清理旧组件（过渡期后）

过渡期结束后：
- 删除 `features/resource-browser/`（模拟数据版本）
- 旧路由重定向到 `/resource-explorer`
- 更新侧边栏移除旧导航项

## 关键文件清单

| 操作 | 文件路径 | 说明 |
|------|---------|------|
| 新增 | `src/app/models/resource-tree.models.ts` | 树节点类型定义 |
| 新增 | `src/app/core/services/resource-tree.service.ts` | 数据聚合服务 |
| 新增 | `src/app/features/unified-resource-browser/unified-resource-browser.component.ts` | 主页面 |
| 新增 | `src/app/features/unified-resource-browser/resource-tree-panel/resource-tree-panel.component.ts` | 树面板容器 |
| 新增 | `src/app/features/unified-resource-browser/resource-tree-panel/tree-node.component.ts` | 递归树节点 |
| 新增 | `src/app/features/unified-resource-browser/resource-detail-panel/resource-detail-panel.component.ts` | 详情面板 |
| 修改 | `src/app/app.routes.ts` | 新增路由 |
| 修改 | `src/app/shared/components/app-sidebar/app-sidebar.component.ts` | 更新导航 |

## 验证方式

1. **树结构加载**: 打开 `/resource-explorer`，验证左侧树正确显示各来源组节点
2. **惰性展开**: 点击来源组展开，应看到教程列表；点击教程展开，应看到关联课件
3. **CRUD操作**: 在详情面板编辑/删除本地教程或上传课件，验证树刷新正确
4. **搜索**: 输入关键词，验证树中匹配节点高亮，不匹配节点隐藏
5. **旧页面兼容**: `/tutorial-library` 等旧路由仍可正常访问
6. **构建验证**: `ng build` 无报错
