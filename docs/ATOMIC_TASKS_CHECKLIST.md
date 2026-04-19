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

### T2.4 离线模式强化
**工作量:** 0.5人天 | **优先级:** P0 | **状态:** 未开始

- [ ] T2.4.1 检测网络连接状态并显示指示器
- [ ] T2.4.2 实现离线操作队列（联网后同步）
- [ ] T2.4.3 预缓存常用教程与课件资源

---

## 阶段三:MVP 发布准备(2周)

### T3.1 本地数据库优化
**工作量:** 0.5人天 | **优先级:** P0 | **状态:** 进行中

- [ ] T3.1.1 设计核心表结构 (tutorials, materials, hardware_projects)
- [ ] T3.1.2 实现数据库迁移脚本
- [ ] T3.1.3 为常用查询字段添加索引

**验收标准:**
- 数据库查询性能达标
- 支持数据库备份和恢复

---

### T3.2 安装包制作与测试
**工作量:** 0.5人天 | **优先级:** P0 | **状态:** 未开始

- [ ] T3.2.1 配置 Windows/macOS/Linux 打包脚本
- [ ] T3.2.2 编写教师使用手册 (图文并茂)
- [ ] T3.2.3 邀请 5-10 名 STEM 教师试用并收集反馈

---

## 📊 任务统计

| 阶段 | 任务数 | 总工作量 | 日历时间 |
|------|--------|----------|----------|
| 阶段一 | 4 | 3.0人天 | 2周 |
| 阶段二 | 4 | 3.0人天 | 2周 |
| 阶段三 | 2 | 1.0人天 | 1周 |
| **总计** | **10** | **7.0人天** | **5周** |

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
