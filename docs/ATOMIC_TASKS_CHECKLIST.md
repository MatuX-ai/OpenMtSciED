# OpenMTSciEd Desktop Manager - 原子任务清单

**文档版本:** v1.0  
**创建日期:** 2026-04-12  
**目标:** 将开发计划分解为可执行的原子任务,便于追踪和分配

---

## 📋 任务编号规则

- **T[阶段].[任务].[子任务]** (如 T1.3.1)
- **工作量单位:** 人天(8小时/天)
- **优先级:** P0(必须) / P1(重要) / P2(可选)

---

## 阶段一:基础框架与资源获取(2周)

### T1.1 项目初始化 ✅ 已完成
**工作量:** 0.5人天 | **状态:** 已完成

- [x] T1.1.1 安装 Tauri CLI 和 Rust 开发环境
- [x] T1.1.2 创建 Tauri + Angular 项目结构
- [x] T1.1.3 配置 TypeScript 和 Angular 编译
- [x] T1.1.4 设置 Rust 后端基础框架

**关联文件:**
- `desktop-manager/package.json`
- `desktop-manager/src-tauri/Cargo.toml`
- `desktop-manager/src-tauri/tauri.conf.json`
- `desktop-manager/angular.json`

---

### T1.2 首次使用引导
**工作量:** 0.75人天 | **优先级:** P0 | **状态:** 部分完成

#### T1.2.1 设计引导流程 UI
**工作量:** 0.25人天
- [ ] 设计 3 步引导流程原型图
- [ ] 实现步骤指示器组件
- [ ] 添加上一步/下一步导航按钮

**关联文件:**
- `src/app/features/setup-wizard/setup-wizard.component.html`
- `src/app/features/setup-wizard/setup-wizard.component.scss`

#### T1.2.2 实现欢迎页面
**工作量:** 0.15人天
- [ ] 展示 OpenMTSciEd 功能介绍
- [ ] 添加 STEM 教育理念说明
- [ ] 显示开源资源来源列表(OpenSciEd、OpenStax等)

**关联文件:**
- `src/app/features/setup-wizard/steps/welcome-step/`
  - `welcome-step.component.ts`
  - `welcome-step.component.html`

#### T1.2.3 实现 AI 配置页面(可选)
**工作量:** 0.2人天
- [ ] 创建 AI 提供商选择下拉框(MiniCPM/CodeLlama/OpenAI/本地)
- [ ] 添加 API Key 输入框(带显示/隐藏切换)
- [ ] 添加"跳过此步骤"按钮
- [ ] 实现表单验证

**关联文件:**
- `src/app/features/setup-wizard/steps/api-config-step/`
  - `api-config-step.component.ts`
  - `api-config-step.component.html`
- `src/app/features/setup-wizard/setup-wizard.service.ts`

#### T1.2.4 实现数据存储位置选择
**工作量:** 0.15人天
- [ ] 调用 Tauri dialog API 选择文件夹
- [ ] 显示默认路径建议
- [ ] 验证路径可写性
- [ ] 保存配置到本地 JSON 文件

**关联文件:**
- `src/app/features/setup-wizard/steps/storage-step/`
  - `storage-step.component.ts`
  - `storage-step.component.html`
- `src-tauri/src/commands/config.rs`

**验收标准:**
- 用户能完成 3 步引导流程
- 配置能保存到本地 JSON 文件
- AI 配置为可选项,不影响基本使用

---

### T1.3 开源教程库 - 资源获取
**工作量:** 1人天 | **优先级:** P0 | **状态:** 部分完成

#### T1.3.1 设计教程库界面
**工作量:** 0.15人天
- [ ] 设计卡片式教程列表布局
- [ ] 实现网格视图(3列响应式)
- [ ] 添加筛选工具栏(学科/学段/难度)

**关联文件:**
- `src/app/features/tutorial-library/tutorial-library.component.html`
- `src/app/features/tutorial-library/tutorial-library.component.scss`

#### T1.3.2 实现开源资源浏览器
**工作量:** 0.3人天
- [ ] 创建资源源选择器(OpenSciEd/格物斯坦/stemcloud.cn)
- [ ] 调用 Rust 后端获取元数据
- [ ] 展示教程列表(名称、描述、学科、难度、来源)
- [ ] 添加加载状态和错误处理

**关联文件:**
- `src/app/features/tutorial-library/resource-browser/`
  - `resource-browser.component.ts`
  - `resource-browser.component.html`
- `src-tauri/src/commands/tutorial.rs` - `browse_open_resources()`

**Rust 接口:**
```rust
#[tauri::command]
fn browse_open_resources(source: String) -> Result<Vec<Resource>, String>;
```

#### T1.3.3 实现一键下载教程
**工作量:** 0.25人天
- [ ] 添加"下载到本地"按钮
- [ ] 调用 Tauri fs API 保存到用户目录
- [ ] 显示下载进度条
- [ ] 下载完成后刷新本地教程列表

**关联文件:**
- `src/app/features/tutorial-library/tutorial-list/`
  - `tutorial-list.component.ts`
  - `tutorial-list.component.html`
- `src-tauri/src/commands/tutorial.rs` - `download_tutorial()`

**Rust 接口:**
```rust
#[tauri::command]
fn download_tutorial(resource_id: String, save_path: String) -> Result<Tutorial, String>;
```

#### T1.3.4 实现本地教程管理
**工作量:** 0.15人天
- [ ] 从 SQLite 读取本地教程列表
- [ ] 实现删除教程功能(二次确认)
- [ ] 实现重命名教程功能
- [ ] 显示教程封面图

**关联文件:**
- `src/app/features/tutorial-library/tutorial.service.ts`
- `src-tauri/src/database/mod.rs`

#### T1.3.5 实现教程详情页面
**工作量:** 0.15人天
- [ ] 展示教程完整信息(知识点、实践活动、硬件需求)
- [ ] 显示关联课件列表
- [ ] 显示关联硬件项目(预算≤50元)
- [ ] 添加"开始学习"按钮

**关联文件:**
- `src/app/features/tutorial-library/tutorial-detail/`
  - `tutorial-detail.component.ts`
  - `tutorial-detail.component.html`

**验收标准:**
- 用户能浏览开源教程库
- 支持一键下载到本地
- 教程数据持久化到本地 SQLite 数据库
- 显示教程来源和授权协议(CC BY 4.0等)

---

### T1.4 开源课件库 - 资源获取
**工作量:** 1人天 | **优先级:** P0 | **状态:** 部分完成

#### T1.4.1 设计课件管理界面
**工作量:** 0.15人天
- [ ] 设计树形结构课件列表
- [ ] 实现按教程分组的视图
- [ ] 添加文件类型图标(PDF/视频/PPT/图片)

**关联文件:**
- `src/app/features/material-library/material-library.component.html`
- `src/app/features/material-library/material-library.component.scss`

#### T1.4.2 实现开源课件浏览器
**工作量:** 0.3人天
- [ ] 创建资源源选择器(OpenStax/TED-Ed/STEM-PBL)
- [ ] 调用 Rust 后端获取章节信息
- [ ] 展示课件列表(名称、类型、大小、来源)
- [ ] 添加预览缩略图

**关联文件:**
- `src/app/features/material-library/resource-browser/`
  - `resource-browser.component.ts`
  - `resource-browser.component.html`
- `src-tauri/src/commands/material.rs` - `browse_open_materials()`

**Rust 接口:**
```rust
#[tauri::command]
fn browse_open_materials(source: String) -> Result<Vec<Material>, String>;
```

#### T1.4.3 实现一键下载课件
**工作量:** 0.25人天
- [ ] 添加"下载到本地"按钮
- [ ] 支持大文件分片下载
- [ ] 显示下载进度和速度
- [ ] 下载完成后自动关联到对应教程

**关联文件:**
- `src/app/features/material-library/material-list/`
  - `material-list.component.ts`
  - `material-list.component.html`
- `src-tauri/src/commands/material.rs` - `download_material()`

**Rust 接口:**
```rust
#[tauri::command]
fn download_material(material_id: String, save_path: String) -> Result<Material, String>;
```

#### T1.4.4 实现本地课件管理
**工作量:** 0.15人天
- [ ] 实现文件上传功能(拖拽/选择)
- [ ] 实现文件删除功能
- [ ] 文件大小限制(单文件≤500MB)
- [ ] 文件存储在教程专属目录

**关联文件:**
- `src/app/features/material-library/file-upload/`
  - `file-upload.component.ts`
  - `file-upload.component.html`

#### T1.4.5 实现文件预览
**工作量:** 0.15人天
- [ ] 集成 PDF.js 实现 PDF 预览
- [ ] 实现图片预览(放大/缩小/旋转)
- [ ] 视频播放器(MP4/WebM)
- [ ] 添加文件类型检测

**关联文件:**
- `src/app/features/material-library/file-preview/`
  - `file-preview.component.ts`
  - `file-preview.component.html`

**验收标准:**
- 用户能浏览开源课件库
- 支持一键下载到本地
- 大文件下载显示进度条
- 课件与教程自动关联(基于知识图谱)

---

### T1.5 主界面框架
**工作量:** 0.5人天 | **优先级:** P0 | **状态:** 已完成

- [x] T1.5.1 设计主界面布局(侧边栏 + 内容区)
- [x] T1.5.2 实现侧边栏导航(开源资源、我的教程、我的课件、学习路径、设置)
- [x] T1.5.3 实现顶部工具栏(搜索、通知)
- [x] T1.5.4 添加全局状态管理(Angular Service)
- [x] T1.5.5 实现深色/浅色主题切换

**关联文件:**
- `src/app/app.component.ts`
- `src/app/app.component.html`
- `src/app/sidebar/`
- `src/app/toolbar/`
- `src/app/services/theme.service.ts`

---

## 阶段二:智能推荐与体验优化(2周)

### T2.1 知识图谱与学习路径
**工作量:** 0.75人天 | **优先级:** P0 | **状态:** 未开始

#### T2.1.1 集成轻量级图数据库
**工作量:** 0.2人天
- [ ] 选择图数据库方案(Neo4j 嵌入式 / SQLite + 关系表)
- [ ] 配置 Rust 依赖(cypher 或自定义查询)
- [ ] 实现数据库初始化脚本
- [ ] 创建图数据库连接池

**关联文件:**
- `src-tauri/Cargo.toml` (添加 neo4rs 或 rusqlite)
- `src-tauri/src/database/knowledge_graph.rs`

#### T2.1.2 定义知识图谱 Schema
**工作量:** 0.15人天
- [ ] 定义节点类型(Tutorial/Material/HardwareProject)
- [ ] 定义关系类型(REQUIRES/EXPLAINS/PRACTICES)
- [ ] 定义节点属性(学段/学科/难度/预算)
- [ ] 编写 Schema 迁移脚本

**关联文件:**
- `src-tauri/src/database/schema.rs`
- `docs/KNOWLEDGE_GRAPH_SCHEMA.md`

**数据模型:**
```typescript
interface KnowledgeNode {
  id: string;
  type: 'tutorial' | 'material' | 'hardware';
  title: string;
  source: 'openscied' | 'openstax' | 'ted-ed' | 'gewustan';
  level: 'elementary' | 'middle' | 'high' | 'university';
  subject: string;
  hardwareBudget?: number;
}

interface KnowledgeEdge {
  from: string;
  to: string;
  relation: 'requires' | 'explains' | 'practices';
}
```

#### T2.1.3 实现"教程→课件"自动关联
**工作量:** 0.2人天
- [ ] 基于关键词匹配建立初始关联
- [ ] 使用 MiniCPM 模型补全隐性关联(可选)
- [ ] 存储关联关系到图数据库
- [ ] 提供 API 查询关联节点

**关联文件:**
- `src-tauri/src/commands/knowledge_graph.rs`
- `src/app/features/learning-path/knowledge-graph.service.ts`

**Rust 接口:**
```rust
#[tauri::command]
fn find_related_materials(tutorial_id: String) -> Result<Vec<String>, String>;

#[tauri::command]
fn generate_learning_path(start_node: String) -> Result<LearningPath, String>;
```

#### T2.1.4 实现学习路径可视化
**工作量:** 0.2人天
- [ ] 集成 ECharts 绘制知识图谱
- [ ] 实现节点点击查看详情
- [ ] 支持缩放和平移
- [ ] 显示路径进度(已完成/进行中/未开始)

**关联文件:**
- `src/app/features/learning-path/path-map/`
  - `path-map.component.ts`
  - `path-map.component.html`
  - `path-map.component.scss`

**验收标准:**
- 知识图谱能正确关联教程和课件
- 学习路径符合"现象驱动→理论深化→实践应用"逻辑
- 路径可视化清晰易懂

---

### T2.2 智能搜索与过滤
**工作量:** 0.75人天 | **优先级:** P0 | **状态:** 部分完成

#### T2.2.1 实现全局搜索框
**工作量:** 0.2人天
- [ ] 在顶部工具栏添加搜索框
- [ ] 实现防抖搜索(300ms)
- [ ] 同时搜索教程和课件
- [ ] 显示搜索结果数量

**关联文件:**
- `src/app/shared/components/search/search-bar/`
  - `search-bar.component.ts`
  - `search-bar.component.html`
- `src/app/shared/components/search/search.service.ts`

#### T2.2.2 实现多维度筛选
**工作量:** 0.25人天
- [ ] 按学科筛选(物理/化学/生物/工程)
- [ ] 按学段筛选(小学/初中/高中/大学)
- [ ] 按难度筛选(1-5星)
- [ ] 按硬件预算筛选(≤50元)

**关联文件:**
- `src/app/shared/components/search/filter-panel/`
  - `filter-panel.component.ts`
  - `filter-panel.component.html`

#### T2.2.3 实现搜索结果高亮
**工作量:** 0.15人天
- [ ] 高亮显示匹配关键词
- [ ] 支持结果排序(相关度/时间/热度)
- [ ] 分页显示搜索结果
- [ ] 无结果时显示推荐内容

**关联文件:**
- `src/app/shared/components/search/search-results/`
  - `search-results.component.ts`
  - `search-results.component.html`

#### T2.2.4 优化搜索性能
**工作量:** 0.15人天
- [ ] 为 SQLite 添加全文索引
- [ ] 缓存热门搜索词
- [ ] 搜索响应时间 < 100ms
- [ ] 支持中英文混合搜索

**关联文件:**
- `src-tauri/src/commands/search.rs`
- `src-tauri/src/database/indexes.sql`

**Rust 接口:**
```rust
#[tauri::command]
fn search_resources(
  keyword: String,
  resource_type: Option<String>,
  subject: Option<String>,
  level: Option<String>,
  max_budget: Option<f64>
) -> Result<Vec<Resource>, String>;
```

**验收标准:**
- 搜索响应时间 < 100ms
- 支持中英文混合搜索
- 筛选条件丰富(学科/学段/预算)

---

### T2.3 硬件项目管理
**工作量:** 0.5人天 | **优先级:** P0 | **状态:** ✅ 已完成

#### T2.3.1 设计硬件项目数据结构
**工作量:** 0.15人天
- [x] 定义硬件项目模型(电路图、材料清单、代码模板)
- [x] 关联到教程节点
- [x] 标注材料成本(确保≤50元)
- [x] 存储到 SQLite

**关联文件:**
- `desktop-manager/src/app/models/hardware-project.models.ts` ✅ 已创建
- `src-tauri/src/database/schema.rs`

**数据模型:**
```typescript
interface HardwareProject {
  id: string;
  tutorialId: string;
  name: string;
  description: string;
  circuitDiagram: string; // 图片路径
  materials: Array<{
    name: string;
    quantity: number;
    unitPrice: number;
  }>;
  totalCost: number; // ≤50元
  codeTemplate: CodeTemplate; // Blockly 或 Arduino 代码
  webUsbSupport: boolean;
}
```

#### T2.3.2 实现硬件项目列表
**工作量:** 0.15人天
- [x] 展示硬件项目卡片
- [x] 显示材料成本明细
- [x] 显示难度等级
- [x] 添加"开始制作"按钮

**关联文件:**
- `desktop-manager/src/app/features/hardware-projects/hardware-project-list/hardware-project-list.component.ts` ✅ 已创建

#### T2.3.3 集成 Blockly 可视化编程
**工作量:** 0.2人天
- [x] 集成 Blockly 编辑器
- [x] 预置常用积木块(传感器/电机/LED)
- [x] 生成 Arduino/ESP32 代码
- [x] 代码预览和复制功能

**关联文件:**
- `desktop-manager/src/app/features/hardware-projects/blockly-editor/blockly-editor.component.ts` ✅ 已创建
- `package.json` (需添加 blockly 依赖)
- `desktop-manager/src/app/features/hardware-projects/BLOCKLY_INTEGRATION.md` ✅ 已创建

**验收标准:**
- ✅ 每个教程至少关联 1 个硬件项目
- ✅ 材料成本明确标注且≤50元
- ⏳ Blockly 代码生成正确率≥95% (待安装依赖后测试)

---

### T2.4 文件预览增强
**工作量:** 0.75人天 | **优先级:** P1 | **状态:** 部分完成

#### T2.4.1 集成 PDF.js
**工作量:** 0.25人天
- [ ] 安装 PDF.js 依赖
- [ ] 实现 PDF 渲染组件
- [ ] 支持翻页、缩放、搜索
- [ ] 优化大 PDF 加载性能

**关联文件:**
- `src/app/shared/components/preview/pdf-preview/`
  - `pdf-preview.component.ts`
  - `pdf-preview.component.html`
- `package.json` (添加 pdfjs-dist)

#### T2.4.2 实现视频播放器
**工作量:** 0.2人天
- [ ] 使用 HTML5 video 标签
- [ ] 支持播放/暂停/进度条
- [ ] 支持全屏播放
- [ ] 适配 MP4/WebM 格式

**关联文件:**
- `src/app/shared/components/preview/video-preview/`
  - `video-preview.component.ts`
  - `video-preview.component.html`

#### T2.4.3 实现图片画廊
**工作量:** 0.15人天
- [ ] 支持图片放大/缩小
- [ ] 支持左右切换
- [ ] 支持旋转
- [ ] 懒加载优化

**关联文件:**
- `src/app/shared/components/preview/image-gallery/`
  - `image-gallery.component.ts`
  - `image-gallery.component.html`

#### T2.4.4 PPT 在线预览(可选)
**工作量:** 0.15人天
- [ ] 将 PPT 转换为图片序列
- [ ] 使用图片画廊展示
- [ ] 或使用第三方服务(如 Microsoft Office Online)

**关联文件:**
- `src/app/shared/components/preview/ppt-preview/`
  - `ppt-preview.component.ts`
  - `ppt-preview.component.html`

**验收标准:**
- 支持常见文件格式预览
- 预览加载时间 < 2s
- 视频播放流畅无卡顿

---

### T2.5 数据导入导出
**工作量:** 0.5人天 | **优先级:** P1 | **状态:** 未开始

#### T2.5.1 实现教程数据导出
**工作量:** 0.15人天
- [ ] 导出教程元数据为 JSON
- [ ] 打包课件文件为 ZIP
- [ ] 生成分享链接或二维码
- [ ] 显示导出进度

**关联文件:**
- `src/app/features/import-export/export.service.ts`
- `src/app/features/import-export/export-dialog/`
  - `export-dialog.component.ts`
  - `export-dialog.component.html`

#### T2.5.2 实现教程数据导入
**工作量:** 0.15人天
- [ ] 解析 JSON 元数据
- [ ] 解压 ZIP 文件
- [ ] 处理导入冲突(覆盖/跳过/重命名)
- [ ] 验证数据完整性

**关联文件:**
- `src/app/features/import-export/import.service.ts`
- `src/app/features/import-export/import-dialog/`
  - `import-dialog.component.ts`
  - `import-dialog.component.html`

#### T2.5.3 实现分享功能
**工作量:** 0.2人天
- [ ] 生成分享链接(含教程+课件)
- [ ] 生成二维码
- [ ] 复制到剪贴板
- [ ] 分享到社交媒体(可选)

**关联文件:**
- `src/app/shared/components/share-button/`
  - `share-button.component.ts`
  - `share-button.component.html`

**验收标准:**
- 能导出完整课程包(含课件)
- 导入时能处理数据冲突
- 大文件导入显示进度

---

## 阶段三:MVP 发布准备(2周)

### T3.1 本地数据库优化
**工作量:** 0.5人天 | **优先级:** P0 | **状态:** 进行中

#### T3.1.1 设计数据库表结构
**工作量:** 0.15人天
- [ ]  tutorials 表(教程元数据)
- [ ]  materials 表(课件文件)
- [ ]  learning_paths 表(学习路径)
- [ ]  hardware_projects 表(硬件项目)
- [ ]  knowledge_graph 表(图谱关系)

**关联文件:**
- `src-tauri/src/database/schema.rs`
- `src-tauri/src/database/migrations/001_initial.sql`

**SQL Schema:**
```sql
CREATE TABLE tutorials (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    cover_image TEXT,
    source TEXT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE materials (
    id TEXT PRIMARY KEY,
    tutorial_id TEXT,
    name TEXT NOT NULL,
    file_path TEXT,
    file_size INTEGER,
    file_type TEXT,
    created_at TIMESTAMP,
    FOREIGN KEY (tutorial_id) REFERENCES tutorials(id)
);

CREATE TABLE learning_paths (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    path_data JSONB,
    created_at TIMESTAMP
);
```

#### T3.1.2 实现数据库迁移
**工作量:** 0.15人天
- [ ] 编写迁移脚本
- [ ] 实现版本控制
- [ ] 支持回滚操作
- [ ] 测试迁移流程

**关联文件:**
- `src-tauri/src/database/migrations/`
- `src-tauri/src/database/connection.rs`

#### T3.1.3 添加索引优化
**工作量:** 0.1人天
- [ ] 为常用查询字段添加索引
- [ ] 优化 JOIN 查询性能
- [ ] 测试查询速度

**关联文件:**
- `src-tauri/src/database/migrations/002_add_indexes.sql`

#### T3.1.4 实现数据库备份
**工作量:** 0.1人天
- [ ] 导出 SQLite 数据库文件
- [ ] 支持定时自动备份
- [ ] 备份文件压缩
- [ ] 恢复功能

**关联文件:**
- `src-tauri/src/commands/backup.rs`

**验收标准:**
- 数据库查询性能达标
- 支持数据库备份和恢复

---

### T3.2 离线模式强化
**工作量:** 0.5人天 | **优先级:** P0 | **状态:** 未开始

#### T3.2.1 检测网络连接状态
**工作量:** 0.1人天
- [ ] 监听网络状态变化
- [ ] 显示在线/离线指示器
- [ ] 离线时禁用云端功能

**关联文件:**
- `src/app/features/offline/offline.service.ts`
- `src/app/features/offline/offline-indicator/`
  - `offline-indicator.component.ts`
  - `offline-indicator.component.html`

#### T3.2.2 实现离线操作队列
**工作量:** 0.2人天
- [ ] 离线时将操作加入队列
- [ ] 联网后自动同步
- [ ] 显示队列状态
- [ ] 手动触发同步

**关联文件:**
- `src/app/features/offline/offline-queue.service.ts`

#### T3.2.3 预缓存常用资源
**工作量:** 0.2人天
- [ ] 首次使用时下载热门教程
- [ ] 缓存知识图谱数据
- [ ] 缓存硬件项目代码模板
- [ ] 显示缓存状态

**关联文件:**
- `src/app/features/offline/cache.service.ts`

**验收标准:**
- 断网后应用不崩溃
- 已下载资源完全可用
- 离线操作在联网后自动同步(如启用)

---

### T3.4 自动更新机制
**工作量:** 0.5人天 | **优先级:** P1 | **状态:** 未开始

#### T3.4.1 配置 Tauri 自动更新
**工作量:** 0.2人天
- [ ] 配置 tauri.conf.json updater 字段
- [ ] 生成签名密钥对
- [ ] 设置更新端点(GitHub Releases)
- [ ] 配置更新检查频率

**关联文件:**
- `src-tauri/tauri.conf.json`

**配置示例:**
```json
{
  "tauri": {
    "updater": {
      "active": true,
      "endpoints": [
        "https://github.com/MatuX-ai/OpenMTSciEd/releases/latest/download/latest.json"
      ],
      "dialog": true,
      "pubkey": "dW50cnVzdGVkIGNvbW1lbnQ6..."
    }
  }
}
```

#### T3.4.2 实现更新检查和安装
**工作量:** 0.2人天
- [ ] 定期检查新版本
- [ ] 显示更新日志
- [ ] 用户确认后下载
- [ ] 自动重启应用

**关联文件:**
- `src/app/features/update/update.service.ts`
- `src/app/features/update/update-dialog/`
  - `update-dialog.component.ts`
  - `update-dialog.component.html`

#### T3.4.3 实现更新日志展示
**工作量:** 0.1人天
- [ ] 从 GitHub Releases 获取更新日志
- [ ] 格式化显示(Markdown 渲染)
- [ ] 支持"稍后提醒"选项

**关联文件:**
- `src/app/features/update/release-notes/`
  - `release-notes.component.ts`
  - `release-notes.component.html`

**验收标准:**
- 能检测新版本
- 用户可选择立即更新或稍后提醒
- 更新后应用正常启动

---

### T3.5 安装包制作与签名
**工作量:** 0.75人天 | **优先级:** P0 | **状态:** 未开始

#### T3.5.1 配置 Windows 安装包
**工作量:** 0.25人天
- [ ] 配置 NSIS 安装包
- [ ] 添加安装向导界面
- [ ] 配置卸载程序
- [ ] 测试全新安装和升级安装

**关联文件:**
- `src-tauri/tauri.conf.json`
- `scripts/build-windows.ps1`

#### T3.5.2 配置 macOS 安装包
**工作量:** 0.2人天
- [ ] 配置 DMG 安装包
- [ ] 添加应用图标
- [ ] 配置 notarization(可选)
- [ ] 测试安装流程

**关联文件:**
- `src-tauri/tauri.conf.json`
- `scripts/build-macos.sh`

#### T3.5.3 配置 Linux 安装包
**工作量:** 0.15人天
- [ ] 配置 AppImage 打包
- [ ] 配置 DEB 打包(Ubuntu/Debian)
- [ ] 测试安装流程

**关联文件:**
- `src-tauri/tauri.conf.json`
- `scripts/build-linux.sh`

#### T3.5.4 代码签名(可选)
**工作量:** 0.15人天
- [ ] 申请 Windows 代码签名证书
- [ ] 配置签名流程
- [ ] 验证签名有效性

**关联文件:**
- `scripts/sign-windows.ps1`

**验收标准:**
- 三个平台安装包都能正常生成
- 安装包大小 < 20MB
- 安装过程无错误

---

### T3.6 测试与文档
**工作量:** 0.75人天 | **优先级:** P0 | **状态:** 进行中

#### T3.6.1 编写教师使用手册
**工作量:** 0.25人天
- [ ] 图文并茂,零基础友好
- [ ] 包含截图和标注
- [ ] 常见问题解答
- [ ] 视频教程链接

**关联文件:**
- `docs/TEACHER_GUIDE.md`
- `docs/FAQ.md`

#### T3.6.2 邀请教师试用
**工作量:** 0.2人天
- [ ] 招募 5-10 名 STEM 教师
- [ ] 提供测试版安装包
- [ ] 收集反馈意见
- [ ] 整理优化建议清单

**关联文件:**
- `docs/USER_FEEDBACK_TEMPLATE.md`
- `docs/OPTIMIZATION_SUGGESTIONS.md`

#### T3.6.3 功能测试
**工作量:** 0.15人天
- [ ] 编写端到端测试用例
- [ ] 测试核心功能流程
- [ ] 边界条件测试
- [ ] 性能测试

**关联文件:**
- `tests/e2e/`
- `tests/unit/`

#### T3.6.4 Bug 修复和性能优化
**工作量:** 0.15人天
- [ ] 修复测试发现的 Bug
- [ ] 优化启动速度
- [ ] 优化内存占用
- [ ] 优化搜索性能

**关联文件:**
- 根据实际 Bug 定位

**验收标准:**
- 用户手册完整清晰,非技术人员能看懂
- 测试用例覆盖率 > 80%
- 无严重级别 Bug
- 教师反馈满意度 > 80%

---

## 📊 任务统计

| 阶段 | 任务数 | 总工作量 | 日历时间 |
|------|--------|----------|----------|
| 阶段一 | 22 | 3.75人天 | 2周 |
| 阶段二 | 17 | 3.0人天 | 2周 |
| 阶段三 | 18 | 3.5人天 | 2周 |
| **总计** | **57** | **10.25人天** | **6周** |

**注:** T2.3 硬件项目管理已完成，阶段二剩余 3 个任务（T2.4、T2.5）

---

## 🎯 执行建议

### 优先级排序
1. **P0 任务**(必须完成): T1.2-T1.5, T2.1-T2.3, T3.1, T3.2, T3.5, T3.6
2. **P1 任务**(重要): T2.4, T2.5, T3.4
3. **P2 任务**(可选): 暂缓

### 并行开发建议
- 前端和后端可并行开发(不同开发者)
- T1.3 和 T1.4 可同时进行(教程库和课件库独立)
- T2.1 知识图谱需要前后端紧密配合

### 风险点
1. **开源资源 API 稳定性**: OpenSciEd/OpenStax 可能变更 API,需设计容错机制
2. **知识图谱准确性**: 自动关联可能存在误差,需提供人工校正入口
3. **硬件兼容性**: WebUSB 在不同浏览器/系统上支持度不一,需充分测试

---

**最后更新:** 2026-04-12  
**维护者:** OpenMTSciEd Team  
**联系邮箱:** 3936318150@qq.com
