# OpenMTSciEd 桌面课件管理应用 - 开发计划

## 📋 项目概述

**项目名称:** OpenMTSciEd Desktop Manager  
**技术栈:** Tauri (Rust) + Angular  
**目标用户:** 非技术背景教师、教育工作者  
**核心定位:** 帮助教师快速获取和管理开源 STEM 教育资源  
**开发周期:** 6周(3个阶段)  
**安装包大小:** ~10-15MB

---

## 🎯 核心价值

### 面向教师的价值
- ✅ **零门槛使用** - 无需 Git、Docker、npm 等技术知识
- ✅ **一键获取资源** - 从 OpenSciEd、OpenStax 等开源库快速下载教程和课件
- ✅ **离线可用** - 本地课程库和课件库管理,无网络也能用
- ✅ **智能推荐** - 基于知识图谱推荐连贯学习路径
- ✅ **低成本实践** - 所有硬件项目预算≤50元,适合下沉市场

### 技术特性
- ✅ **直观界面** - 图形化文件管理和 API 配置
- ✅ **跨平台** - Windows / macOS / Linux
- ✅ **隐私保护** - 所有数据本地存储

---

## 📅 开发阶段规划

### 阶段一:基础框架与资源获取(2周)

**目标:** 完成桌面应用基础架构和开源资源获取核心功能

#### T1.1 项目初始化(2天)
**工作量:** 0.5人天

**任务清单:**
- [x] 安装 Tauri CLI 和 Rust 开发环境
- [x] 创建 Tauri + Angular 项目结构
- [x] 配置 TypeScript 和 Angular 编译
- [x] 设置 Rust 后端基础框架

**关联文件:**
```
desktop-manager/
├── src/                    # Angular 前端
│   ├── app/
│   └── environments/
├── src-tauri/              # Rust 后端
│   ├── Cargo.toml
│   ├── tauri.conf.json
│   └── src/
│       ├── main.rs
│       └── commands/
└── package.json
```

**验收标准:**
- `npm run tauri dev` 能成功启动开发服务器
- 看到空白 Angular 应用窗口

---

#### T1.2 首次使用引导(3天)
**工作量:** 0.75人天

**任务清单:**
- [ ] 设计引导流程 UI(3步)
- [ ] 步骤 1:欢迎页面(功能介绍+STEM教育理念)
- [ ] 步骤 2:AI 配置页面(可选,支持 MiniCPM/CodeLlama 等)
- [ ] 步骤 3:数据存储位置选择
- [ ] 添加表单验证和错误提示
- [ ] 保存配置到本地文件

**关联文件:**
```
src/app/features/setup-wizard/
├── setup-wizard.component.ts
├── setup-wizard.component.html
├── setup-wizard.component.scss
└── setup-wizard.service.ts
```

**API 配置表单字段:**
```typescript
interface ApiConfig {
  provider: 'minicpm' | 'codelama' | 'openai' | 'local' | 'custom';
  apiKey?: string;
  apiUrl?: string;
  model?: string;
  enableOffline: boolean; // 默认启用离线模式
}
```

**验收标准:**
- 用户能完成 3 步引导流程
- 配置能保存到本地 JSON 文件
- AI 配置为可选项,不影响基本使用

---

#### T1.3 开源教程库 - 资源获取(4天)
**工作量:** 1人天

**核心功能:** 从 OpenSciEd、格物斯坦、stemcloud.cn 等开源库获取教程

**任务清单:**
- [ ] 设计教程库界面(卡片式展示)
- [ ] 实现教程列表展示(名称、描述、学科、难度、来源)
- [ ] **实现开源资源浏览**(从 OpenSciEd/OpenStax 等获取元数据)
- [ ] **实现一键下载教程**(含实验清单、教师手册等)
- [ ] 实现本地教程管理(创建/删除/重命名)
- [ ] 添加教程封面图显示
- [ ] 实现教程详情页面(知识点、实践活动、硬件需求)

**关联文件:**
```
src/app/features/tutorial-library/
├── tutorial-library.component.ts
├── tutorial-library.component.html
├── tutorial-library.component.scss
├── tutorial-list/
│   ├── tutorial-list.component.ts
│   └── tutorial-list.component.html
├── tutorial-detail/
│   ├── tutorial-detail.component.ts
│   └── tutorial-detail.component.html
├── resource-browser/          # 新增:开源资源浏览器
│   ├── resource-browser.component.ts
│   └── resource-browser.component.html
└── tutorial.service.ts
```

**Rust 后端接口:**
```rust
// src-tauri/src/commands/tutorial.rs
#[tauri::command]
fn browse_open_resources(source: String) -> Result<Vec<Resource>, String>;

#[tauri::command]
fn download_tutorial(resource_id: String, save_path: String) -> Result<Tutorial, String>;

#[tauri::command]
fn list_local_tutorials() -> Result<Vec<Tutorial>, String>;

#[tauri::command]
fn delete_tutorial(tutorial_id: String) -> Result<(), String>;
```

**开源资源来源:**
- OpenSciEd: K-12 现象驱动单元(https://www.openscied.org/)
- 格物斯坦: 开源硬件教程
- stemcloud.cn: 全学科项目式教程

**验收标准:**
- 用户能浏览开源教程库
- 支持一键下载到本地
- 教程数据持久化到本地 SQLite 数据库
- 显示教程来源和授权协议(CC BY 4.0等)

---

#### T1.4 开源课件库 - 资源获取(4天)
**工作量:** 1人天

**核心功能:** 从 OpenStax、TED-Ed 等开源库获取理论教材和习题

**任务清单:**
- [ ] 设计课件管理界面(树形结构)
- [ ] **实现开源课件浏览**(从 OpenStax/TED-Ed 获取章节信息)
- [ ] **实现一键下载课件**(PDF、视频、习题集)
- [ ] 实现本地课件管理(上传/下载/删除)
- [ ] 支持文件类型:PDF、PPT、视频、图片
- [ ] 实现文件预览(图片、PDF)
- [ ] 文件大小限制和进度显示
- [ ] **显示课件与教程的关联**(知识图谱映射)

**关联文件:**
```
src/app/features/material-library/
├── material-library.component.ts
├── material-library.component.html
├── material-library.component.scss
├── resource-browser/          # 新增:开源课件浏览器
│   ├── resource-browser.component.ts
│   └── resource-browser.component.html
├── file-upload/
│   ├── file-upload.component.ts
│   └── file-upload.component.html
├── file-preview/
│   ├── file-preview.component.ts
│   └── file-preview.component.html
└── material.service.ts
```

**Rust 后端接口:**
```rust
// src-tauri/src/commands/material.rs
#[tauri::command]
fn browse_open_materials(source: String) -> Result<Vec<Material>, String>;

#[tauri::command]
fn download_material(material_id: String, save_path: String) -> Result<Material, String>;

#[tauri::command]
fn upload_material(tutorial_id: String, file_path: String) -> Result<Material, String>;

#[tauri::command]
fn list_local_materials(tutorial_id: String) -> Result<Vec<Material>, String>;

#[tauri::command]
fn delete_material(material_id: String) -> Result<(), String>;
```

**开源资源来源:**
- OpenStax: 大学/高中教材(CC BY 4.0)
- TED-Ed: STEM 教育视频
- STEM-PBL 教学标准: 项目式学习规范

**验收标准:**
- 用户能浏览开源课件库
- 支持一键下载到本地
- 大文件下载显示进度条
- 课件与教程自动关联(基于知识图谱)

---

#### T1.5 主界面框架(2天)
**工作量:** 0.5人天

**任务清单:**
- [ ] 设计主界面布局(侧边栏 + 内容区)
- [ ] 实现侧边栏导航(开源资源、我的教程、我的课件、学习路径、设置)
- [ ] 实现顶部工具栏(搜索、通知)
- [ ] 添加全局状态管理(Angular Service)
- [ ] 实现深色/浅色主题切换

**关联文件:**
```
src/app/
├── app.component.ts
├── app.component.html
├── app.component.scss
├── sidebar/
│   ├── sidebar.component.ts
│   └── sidebar.component.html
├── toolbar/
│   ├── toolbar.component.ts
│   └── toolbar.component.html
└── services/
    ├── theme.service.ts
    └── app-state.service.ts
```

**验收标准:**
- 界面布局完整,导航流畅
- 侧边栏能切换不同功能模块
- 主题切换功能正常

---

### 阶段二:智能推荐与体验优化(2周)

**目标:** 实现知识图谱、学习路径推荐、分类搜索等功能

#### T2.1 知识图谱与学习路径(3天)
**工作量:** 0.75人天

**核心功能:** 基于 OpenMTSciEd 需求,构建教程库与课件库的关联

**任务清单:**
- [ ] **集成 Neo4j 知识图谱**(或本地轻量级图数据库)
- [ ] **实现“教程→课件”自动关联**(如 OpenSciEd“电路基础”→OpenStax“大学物理·电路分析”)
- [ ] **生成连贯学习路径**(小学→初中→高中→大学)
- [ ] 实现路径可视化展示(ECharts 绘制知识图谱)
- [ ] 支持点击节点查看详情
- [ ] 显示硬件项目预算(≤50元)

**关联文件:**
```
src/app/features/learning-path/
├── learning-path.component.ts
├── learning-path.component.html
├── learning-path.component.scss
├── path-map/                  # 路径地图组件
│   ├── path-map.component.ts
│   └── path-map.component.html
└── knowledge-graph.service.ts
```

**数据模型:**
```typescript
interface KnowledgeNode {
  id: string;
  type: 'tutorial' | 'material';
  title: string;
  source: 'openscied' | 'openstax' | 'ted-ed' | 'gewustan';
  level: 'elementary' | 'middle' | 'high' | 'university';
  subject: string;
  hardwareBudget?: number; // 硬件预算(元)
}

interface LearningPath {
  id: string;
  name: string;
  nodes: KnowledgeNode[];
  edges: Array<{ from: string; to: string; relation: string }>;
}
```

**验收标准:**
- 知识图谱能正确关联教程和课件
- 学习路径符合“现象驱动→理论深化→实践应用”逻辑
- 路径可视化清晰易懂

---

#### T2.2 智能搜索与过滤(3天)
**工作量:** 0.75人天

**任务清单:**
- [ ] 实现全局搜索框(教程+课件)
- [ ] **支持按学科/学段/难度筛选**
- [ ] **支持按硬件预算筛选**(≤50元)
- [ ] 教程名称模糊搜索
- [ ] 课件内容关键词搜索
- [ ] 搜索结果高亮显示
- [ ] 按时间/热度排序

**关联文件:**
```
src/app/shared/components/search/
├── search-bar.component.ts
├── search-bar.component.html
├── search-bar.component.scss
└── search.service.ts
```

**Rust 后端实现:**
```rust
// src-tauri/src/commands/search.rs
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

#### T2.3 硬件项目管理(2天)
**工作量:** 0.5人天

**核心功能:** 为每个教程配套低成本硬件项目(预算≤50元)

**任务清单:**
- [ ] **设计硬件项目卡片**(电路图、材料清单、代码模板)
- [ ] **集成 Blockly 可视化编程**(生成 Arduino/ESP32 代码)
- [ ] **显示材料成本明细**(确保≤50元)
- [ ] 支持 WebUSB 直连烧录(手机/电脑)
- [ ] 项目完成度跟踪

**关联文件:**
```
src/app/features/hardware-projects/
├── hardware-project-list/
│   ├── hardware-project-list.component.ts
│   └── hardware-project-list.component.html
├── blockly-editor/            # Blockly 编辑器
│   ├── blockly-editor.component.ts
│   └── blockly-editor.component.html
└── hardware-project.service.ts
```

**验收标准:**
- 每个教程至少关联 1 个硬件项目
- 材料成本明确标注且≤50元
- Blockly 代码生成正确率≥95%

---

#### T2.4 文件预览增强(3天)
**工作量:** 0.75人天

**任务清单:**
- [ ] 集成 PDF.js 实现 PDF 预览
- [ ] 视频播放器(MP4、WebM)
- [ ] 图片画廊视图
- [ ] PPT/PPTX 在线预览(转换为图片)
- [ ] 文档缩略图生成

**关联文件:**
```
src/app/shared/components/preview/
├── pdf-preview/
│   ├── pdf-preview.component.ts
│   └── pdf-preview.component.html
├── video-preview/
│   ├── video-preview.component.ts
│   └── video-preview.component.html
└── thumbnail-generator.service.ts
```

**验收标准:**
- 支持常见文件格式预览
- 预览加载时间 < 2s
- 视频播放流畅无卡顿

---

#### T2.5 数据导入导出(2天)
**工作量:** 0.5人天

**任务清单:**
- [ ] 实现教程数据导出(JSON/ZIP,含课件)
- [ ] 实现教程数据导入
- [ ] 验证导入数据格式
- [ ] 处理导入冲突(覆盖/跳过/重命名)
- [ ] 导入进度显示
- [ ] **支持分享功能**(生成分享链接或二维码)

**关联文件:**
```
src/app/features/import-export/
├── export.service.ts
├── import.service.ts
├── export-dialog/
│   ├── export-dialog.component.ts
│   └── export-dialog.component.html
└── import-dialog/
    ├── import-dialog.component.ts
    └── import-dialog.component.html
```

**验收标准:**
- 能导出完整课程包(含课件)
- 导入时能处理数据冲突
- 大文件导入显示进度

---

### 阶段三:MVP 发布准备(2周)

**目标:** 完成核心功能测试,简化高级功能,优先发布 MVP 版本

#### T3.1 本地数据库优化(2天)
**工作量:** 0.5人天

**任务清单:**
- [x] 集成 SQLite 数据库(rusqlite)
- [ ] 设计数据库表结构(教程、课件、学习路径)
- [ ] 实现数据库迁移
- [ ] 添加索引优化查询性能
- [ ] 数据库备份功能

**关联文件:**
```
src-tauri/src/database/
├── mod.rs
├── migrations/
│   ├── 001_initial.sql
│   └── 002_add_indexes.sql
├── schema.rs
└── connection.rs
```

**数据库表结构:**
```sql
CREATE TABLE tutorials (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    cover_image TEXT,
    source TEXT, -- 'openscied', 'openstax', etc.
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
    path_data JSONB, -- 存储知识图谱数据
    created_at TIMESTAMP
);
```

**验收标准:**
- 数据库查询性能达标
- 支持数据库备份和恢复

---

#### T3.2 离线模式强化(2天)
**工作量:** 0.5人天

**核心功能:** 确保无网络环境下应用完全可用

**任务清单:**
- [ ] 检测网络连接状态
- [ ] 离线时可访问已下载教程和课件
- [ ] 离线操作队列(联网后自动同步,可选)
- [ ] 离线模式提示
- [ ] **预缓存常用资源**(首次使用时下载)

**关联文件:**
```
src/app/features/offline/
├── offline.service.ts
├── offline-queue.service.ts
└── offline-indicator/
    ├── offline-indicator.component.ts
    └── offline-indicator.component.html
```

**验收标准:**
- 断网后应用不崩溃
- 已下载资源完全可用
- 离线操作在联网后自动同步(如启用)

---

#### T3.3 ~~离线模式~~ (已合并到 T3.2)

---

#### T3.4 自动更新机制(2天)
**工作量:** 0.5人天

**任务清单:**
- [ ] 配置 Tauri 自动更新
- [ ] 设置更新检查频率
- [ ] 实现更新下载和安装
- [ ] 更新日志展示
- [ ] 用户确认更新

**关联文件:**
```
src-tauri/tauri.conf.json  # 更新配置
src/app/features/update/
├── update.service.ts
└── update-dialog/
    ├── update-dialog.component.ts
    └── update-dialog.component.html
```

**Tauri 配置:**
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

**验收标准:**
- 能检测新版本
- 用户可选择立即更新或稍后提醒
- 更新后应用正常启动

---

#### T3.5 安装包制作与签名(3天)
**工作量:** 0.75人天

**任务清单:**
- [ ] 配置 Windows 安装包(NSIS)
- [ ] 配置 macOS 安装包(DMG)
- [ ] 配置 Linux 安装包(AppImage/DEB)
- [ ] 代码签名(Windows 证书,可选)
- [ ] 安装包测试(全新安装/升级安装)
- [ ] 编写安装说明文档

**关联文件:**
```
src-tauri/tauri.conf.json  # 打包配置
scripts/
├── build-windows.ps1
├── build-macos.sh
└── build-linux.sh
docs/INSTALL_GUIDE.md
```

**打包配置:**
```json
{
  "tauri": {
    "bundle": {
      "active": true,
      "targets": ["nsis", "dmg", "appimage", "deb"],
      "identifier": "com.matux.openmtscied",
      "icon": ["icons/icon.ico", "icons/icon.png"],
      "resources": [],
      "externalBin": []
    }
  }
}
```

**验收标准:**
- 三个平台安装包都能正常生成
- 安装包大小 < 20MB
- 安装过程无错误

---

#### T3.6 测试与文档(3天)
**工作量:** 0.75人天

**任务清单:**
- [ ] **编写教师使用手册**(图文并茂,零基础友好)
- [ ] 录制操作演示视频
- [ ] 常见问题解答(FAQ)
- [ ] 内部测试(功能测试)
- [ ] **邀请 5-10 名教师试用并收集反馈**
- [ ] Bug 修复和性能优化

**关联文件:**
```
docs/
├── TEACHER_GUIDE.md           # 教师使用指南
├── FAQ.md
└── RELEASE_NOTES.md

tests/
├── e2e/
└── unit/
```

**验收标准:**
- 用户手册完整清晰,非技术人员能看懂
- 测试用例覆盖率 > 80%
- 无严重级别 Bug
- 教师反馈满意度 > 80%

---

## 📊 工作量统计

| 阶段 | 任务数 | 总工作量 | 日历时间 |
|------|--------|----------|----------|
| 阶段一 | 5 | 3.75人天 | 2周 |
| 阶段二 | 5 | 3.5人天 | 2周 |
| 阶段三 | 5 | 3.5人天 | 2周 |
| **总计** | **15** | **10.75人天** | **6周** |

---

## 🎯 MVP 核心功能清单

### 必须实现(P0)
- ✅ 开源教程浏览与下载(OpenSciEd、格物斯坦等)
- ✅ 开源课件浏览与下载(OpenStax、TED-Ed等)
- ✅ 知识图谱关联(教程→课件自动映射)
- ✅ 学习路径可视化展示
- ✅ 硬件项目管理(预算≤50元)
- ✅ 离线使用支持
- ✅ Windows/macOS/Linux 安装包

### 可选功能(P1)
- ⚠️ AI 辅助解释(MiniCPM/CodeLlama)
- ⚠️ 云端同步(后续版本)
- ⚠️ Blockly 代码生成(简化版)

### 暂缓功能(P2)
- ❌ 复杂批量操作
- ❌ PPT 在线预览
- ❌ 高级冲突解决

---

## 🛠️ 技术栈详情

### 前端
- **框架:** Angular 17+
- **UI 组件:** Angular Material
- **状态管理:** RxJS + Services
- **文件预览:** PDF.js、Video.js
- **图表:** ECharts(知识图谱可视化)
- **图标库:** Remix Icon
- **可视化编程:** Blockly(可选)

### 后端(Rust)
- **框架:** Tauri 2.0
- **数据库:** SQLite(rusqlite crate)
- **知识图谱:** Neo4j(或轻量级图数据库)
- **文件操作:** std::fs
- **HTTP 客户端:** reqwest(获取开源资源)
- **序列化:** serde、serde_json

### 构建工具
- **前端:** Angular CLI
- **后端:** Cargo
- **打包:** Tauri CLI
- **CI/CD:** GitHub Actions

---

## 📦 项目目录结构

```
desktop-manager/
├── src/                          # Angular 前端
│   ├── app/
│   │   ├── features/
│   │   │   ├── setup-wizard/        # 首次使用引导
│   │   │   ├── tutorial-library/    # 教程库(开源资源获取)
│   │   │   ├── material-library/    # 课件库(开源资源获取)
│   │   │   ├── learning-path/       # 学习路径(知识图谱)
│   │   │   ├── hardware-projects/   # 硬件项目(≤50元)
│   │   │   └── import-export/       # 导入导出
│   │   ├── shared/
│   │   │   ├── components/
│   │   │   │   ├── search/          # 全局搜索
│   │   │   │   ├── preview/         # 文件预览
│   │   │   │   └── path-map/        # 路径地图
│   │   │   └── services/            # 服务层
│   │   ├── models/                  # 数据模型
│   │   └── app.routes.ts
│   ├── assets/
│   └── environments/
├── src-tauri/                    # Rust 后端
│   ├── src/
│   │   ├── main.rs
│   │   ├── commands/              # Tauri 命令
│   │   │   ├── tutorial.rs        # 教程管理
│   │   │   ├── material.rs        # 课件管理
│   │   │   ├── search.rs          # 搜索
│   │   │   └── knowledge_graph.rs # 知识图谱
│   │   ├── database/              # 数据库层
│   │   └── utils/                 # 工具函数
│   ├── icons/
│   ├── Cargo.toml
│   └── tauri.conf.json
├── docs/                         # 文档
├── package.json
└── README.md
```

---

##  里程碑

| 日期 | 里程碑 | 交付物 |
|------|--------|--------|
| Week 1 | 基础框架完成 | 可运行的开发环境、安装向导 |
| Week 2 | 核心功能完成 | 教程库和课件库管理 |
| Week 3 | 增强功能完成 | 分类、搜索、批量操作 |
| Week 4 | 功能完善 | 预览、导入导出 |
| Week 5 | 高级功能 | 云端同步、离线模式 |
| Week 6 | 发布准备 | 安装包、文档、测试 |

---

## ✅ 验收标准

### 功能性
- [ ] 所有核心功能按需求实现
- [ ] API 配置支持主流模型提供商
- [ ] 文件操作稳定可靠
- [ ] 数据持久化正确

### 性能
- [ ] 应用启动时间 < 3s
- [ ] 文件上传速度达标
- [ ] 搜索响应时间 < 100ms
- [ ] 内存占用 < 200MB

### 用户体验
- [ ] 界面美观、操作流畅
- [ ] 错误提示清晰友好
- [ ] 支持键盘快捷键
- [ ] 响应式设计

### 稳定性
- [ ] 无崩溃和严重 Bug
- [ ] 异常处理完善
- [ ] 数据安全（防丢失）
- [ ] 自动恢复机制

---

## 🔧 开发环境要求

### 必需软件
- Node.js 18+
- Rust 1.70+
- Visual Studio 2022（Windows）/ Xcode（macOS）
- Git

### 开发命令
```bash
# 安装依赖
npm install

# 启动开发服务器
npm run tauri dev

# 构建生产版本
npm run tauri build

# 运行测试
npm test
```

---

## 📝 风险与应对

| 风险 | 概率 | 影响 | 应对措施 |
|------|------|------|----------|
| Tauri 兼容性问题 | 中 | 高 | 提前验证技术栈，准备备选方案（Electron） |
| 文件上传性能 | 中 | 中 | 实现分片上传和进度显示 |
| 跨平台差异 | 高 | 中 | 每个平台单独测试，使用条件编译 |
| 数据同步冲突 | 低 | 高 | 设计完善的冲突解决策略 |
| 安装包过大 | 低 | 低 | 优化依赖，移除无用代码 |

---

## 🎯 成功指标

### 教师体验
1. **上手难度:** 非技术背景教师 10 分钟内完成首次配置
2. **资源获取:** 从浏览到下载教程 < 3 步操作
3. **用户满意度:** 评分 > 4.5/5.0
4. **采用率:** 发布后 3 个月内下载量 > 1000

### 技术指标
1. **稳定性:** 崩溃率 < 0.1%
2. **性能:** 
   - 应用启动时间 < 3s
   - 搜索响应时间 < 100ms
   - 内存占用 < 200MB
3. **离线可用性:** 断网后核心功能 100% 可用

### 教育资源
1. **覆盖率:** OpenSciEd 6-8年级核心单元 100% 映射课件
2. **连贯性:** 每个教程至少关联 1 个课件 + 1 个硬件项目
3. **低成本:** 所有硬件项目预算≤50元

---

## 📞 联系方式

- **项目仓库：** https://github.com/MatuX-ai/OpenMtSciED
- **联系邮箱：** 3936318150@qq.com
- **问题反馈：** https://github.com/MatuX-ai/OpenMtSciED/issues

---

**文档版本:** v2.0  
**创建日期:** 2026-04-11  
**最后更新:** 2026-04-12  
**更新说明:**
- v2.0: 基于 OpenMTSciEd 核心需求重构,突出开源资源获取和教师易用性
- v1.1: 统一术语,“课程”改为“教程”

---

## 📊 计划完成情况核验(2026-04-12)

### ✅ 已完成功能

#### 阶段一:基础框架与资源获取

**T1.1 项目初始化** - ✅ 已完成
- Tauri + Angular 项目结构已建立
- 开发环境配置完成
- 可正常启动开发服务器

**T1.2 首次使用引导** - ⚠️ 部分完成
- 文件位置:`desktop-manager/src/app/features/setup-wizard/`
- 实现状态:基础框架已搭建
- **待办:**
  - [ ] 完善引导流程 UI
  - [ ] 添加 STEM 教育理念介绍

**T1.3 开源教程库** - ⚠️ 部分完成
- 文件位置:`desktop-manager/src/app/features/tutorial-library/`
- 实现状态:组件已创建,需要完善功能
- **待办:**
  - [ ] 实现开源资源浏览(OpenSciEd、格物斯坦等)
  - [ ] 实现一键下载教程
  - [ ] 添加教程详情页面(知识点、实践活动、硬件需求)

**T1.4 开源课件库** - ⚠️ 部分完成
- 文件位置:`desktop-manager/src/app/features/material-library/`
- 已实现组件:
  - ✅ material-list(课件列表)
  - ✅ material-card(课件卡片)
  - ✅ material-filter(课件筛选)
  - ✅ material-upload(课件上传)
- **待办:**
  - [ ] 实现开源课件浏览(OpenStax、TED-Ed等)
  - [ ] 实现一键下载课件
  - [ ] 完善文件预览功能(PDF、视频、图片)

**T1.5 主界面框架** - ✅ 已完成
- 侧边栏导航已实现
- 主题切换功能可用

---

#### 阶段二:智能推荐与体验优化

**T2.1 知识图谱与学习路径** - ❌ 未开始
- **待实现:**
  - [ ] 集成 Neo4j 或轻量级图数据库
  - [ ] 实现“教程→课件”自动关联
  - [ ] 生成连贯学习路径(小学→初中→高中→大学)
  - [ ] 路径可视化展示(ECharts)

**T2.2 智能搜索与过滤** - ⚠️ 部分完成
- 已实现:material-filter 组件提供基础筛选
- **待完善:**
  - [ ] 全局搜索框
  - [ ] 按学科/学段/难度/预算筛选
  - [ ] 搜索结果高亮

**T2.3 硬件项目管理** - ❌ 未开始
- **待实现:**
  - [ ] 设计硬件项目卡片(电路图、材料清单、代码模板)
  - [ ] 集成 Blockly 可视化编程
  - [ ] 显示材料成本明细(≤50元)
  - [ ] WebUSB 直连烧录

**T2.4 文件预览增强** - ⚠️ 部分完成
- 已实现:基础预览框架
- **待完善:**
  - [ ] 集成 PDF.js
  - [ ] 视频播放器优化
  - [ ] PPT/PPTX 在线预览

**T2.5 数据导入导出** - ❌ 未开始
- **待实现:**
  - [ ] 教程数据导出(JSON/ZIP)
  - [ ] 教程数据导入
  - [ ] 分享功能(生成链接或二维码)

---

#### 阶段三:MVP 发布准备

**T3.1 本地数据库优化** - ⚠️ 进行中
- SQLite 已集成
- **待完成:**
  - [ ] 设计数据库表结构(教程、课件、学习路径)
  - [ ] 数据库迁移和备份

**T3.2 离线模式强化** - ❌ 未开始
- **待实现:**
  - [ ] 网络状态检测
  - [ ] 离线操作队列
  - [ ] 预缓存常用资源

**T3.4 自动更新机制** - ❌ 未开始
- **待实现:**
  - [ ] Tauri 自动更新配置
  - [ ] 更新检查和安装

**T3.5 安装包制作与签名** - ❌ 未开始
- **待实现:**
  - [ ] Windows/macOS/Linux 打包配置
  - [ ] 代码签名
  - [ ] 安装包测试

**T3.6 测试与文档** - ⚠️ 进行中
- 已完成:开发计划文档
- **待完成:**
  - [ ] 教师使用手册(图文并茂)
  - [ ] 邀请 5-10 名教师试用
  - [ ] 功能测试
  - [ ] Bug 修复

---

### 📈 完成度统计

| 阶段 | 任务数 | 已完成 | 进行中 | 未开始 | 完成度 |
|------|--------|--------|--------|--------|--------|
| 阶段一 | 5 | 2 | 3 | 0 | 50% |
| 阶段二 | 5 | 0 | 2 | 3 | 20% |
| 阶段三 | 5 | 0 | 2 | 3 | 20% |
| **总计** | **15** | **2** | **7** | **6** | **30%** |

### 🎯 下一步重点工作

1. **实现开源资源获取**(优先级:最高)
   - [ ] 从 OpenSciEd 获取教程元数据并展示
   - [ ] 从 OpenStax 获取课件元数据并展示
   - [ ] 实现一键下载功能

2. **构建知识图谱**(优先级:高)
   - [ ] 集成轻量级图数据库
   - [ ] 实现“教程→课件”自动关联
   - [ ] 生成学习路径

3. **完善硬件项目管理**(优先级:高)
   - [ ] 设计硬件项目数据结构
   - [ ] 确保所有项目预算≤50元
   - [ ] 集成 Blockly 代码生成

4. **编写教师使用手册**(优先级:中)
   - [ ] 图文并茂,零基础友好
   - [ ] 录制操作演示视频

5. **邀请教师试用**(优先级:中)
   - [ ] 招募 5-10 名 STEM 教师
   - [ ] 收集反馈并优化

---

### 💡 建议

1. **聚焦核心价值**:优先实现“开源资源获取”和“知识图谱关联”,这是区别于其他工具的核心
2. **简化 MVP**:暂缓云端同步、复杂批量操作等功能,先发布可用版本
3. **教师参与**:尽早邀请真实教师试用,避免闭门造车
4. **低成本实践**:所有硬件项目必须严格控制预算≤50元,适合下沉市场
5. **离线优先**:确保无网络环境下应用完全可用,适应教育资源匮乏地区
