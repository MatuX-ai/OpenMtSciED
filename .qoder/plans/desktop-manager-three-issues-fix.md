# 桌面端安装包三大问题修复

## Context（背景与目标）

OpenMTSciEd 桌面端安装包上线后用户报告了三个问题，截图见用户提供的图片（教程库 → 开源资源 → stemcloud.cn 子标签）：

1. **图标显示异常**：`resource-browser.component.ts` 第 53/61/69 行的 mat-tab 仅使用 emoji（🔬/⚙️/🌐），tabContent 区域（第 56/65/72 行）只显示 `<h3>` 文本标签（"K-12 现象驱动教程"等），代码中**完全没有引用任何 source 品牌 logo 图片资源**。`desktop-manager/src/assets/images/` 下只有 `matu-logo.png`，导致开源课程/课件页面没有可视化的品牌标识。
2. **开源课件库未与后端数据库连接**：`open-material-browser.component.ts` 第 325-343 行的 `loadMaterials()` 包含 TODO 注释明确要求"调用 Rust 后端"，第 451-549 行 `getMockMaterials()` 是纯前端 mock data。Rust 后端 `commands/` 下**没有 `browse_open_materials` 命令**，`db.rs` 中**没有 `open_materials` 表**。
3. **"智能全网搜索 (STEM)" 开关未生效**：`search-bar.component.ts` 第 56-60 行的 mat-slide-toggle，启用时只在关键词前加 `[SMART]` 前缀后调用 `searchService.updateFilters`，**没有真正调用任何后端 API**。`searchService.search()` 是纯前端 filter 函数。`GlobalSearchComponent`（Ctrl+K 弹窗）虽然调用了 `tauriService.smartSearch()`，但与 search-bar 完全独立没有联动。

**目标**：彻底修复三个问题，使开源课程/课件页面拥有完整 source 品牌标识，课件数据真正从 SQLite 读取，"智能全网搜索"开关联动后端 Rust 智能搜索命令。

---

## 实施计划（4 阶段）

### 阶段 1：素材与数据准备

**新建 9 个文件**：

| 路径 | 内容 |
|------|------|
| `i:\OpenMTSciEd\desktop-manager\src\assets\images\logo-openscied.svg` | OpenSciEd 品牌色 #1565c0 矩形 + 文字 |
| `i:\OpenMTSciEd\desktop-manager\src\assets\images\logo-gewustan.svg` | 格物斯坦 #ef6c00 矩形 + 中文 |
| `i:\OpenMTSciEd\desktop-manager\src\assets\images\logo-stemcloud.svg` | stemcloud.cn #2e7d32 矩形 + 文字 |
| `i:\OpenMTSciEd\desktop-manager\src\assets\images\logo-openstax.svg` | OpenStax #1565c0 圆形 + 文字 |
| `i:\OpenMTSciEd\desktop-manager\src\assets\images\logo-teded.svg` | TED-Ed #c2185b 矩形 + 文字 |
| `i:\OpenMTSciEd\desktop-manager\src\assets\images\logo-phet.svg` | PhET #2e7d32 矩形 + 文字 |
| `i:\OpenMTSciEd\desktop-manager\src-tauri\data\open_materials.json` | 8 条示例数据（openstax 3 + ted-ed 2 + phetsim 3），结构同 `open_resources.json` |
| `i:\OpenMTSciEd\desktop-manager\src\app\shared\utils\source-logo.ts` | `SOURCE_LOGO_MAP` / `SOURCE_NAME_MAP` / `getSourceLogo()` / `getSourceDisplayName()` 工具函数 |

**验证**：浏览器打开每个 SVG 能正常显示；`open_materials.json` 通过 `JSON.parse` 无错误。

---

### 阶段 2：Rust 后端实现

#### 2.1 `desktop-manager\src-tauri\src\db.rs`
在第 74 行 `open_resources` 表后追加 `open_materials` 表：
```sql
CREATE TABLE IF NOT EXISTS open_materials (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    source TEXT NOT NULL,           -- 'openstax' | 'ted-ed' | 'phetsim'
    material_type TEXT NOT NULL,    -- 'pdf' | 'ppt' | 'video' | 'interactive'
    subject TEXT NOT NULL,
    level TEXT NOT NULL,
    file_size TEXT, duration TEXT,
    download_url TEXT, preview_url TEXT, thumbnail TEXT,
    detailed_description TEXT, learning_objectives TEXT,
    language TEXT DEFAULT 'en', license TEXT, estimated_duration TEXT,
    is_downloaded BOOLEAN NOT NULL DEFAULT 0,
    local_path TEXT, downloaded_at TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
)
```
并对 `source`、`subject` 列建索引。

#### 2.2 新建 `desktop-manager\src-tauri\src\commands\open_material.rs`
参照 `resource.rs` 模式实现 4 个命令：
- `import_open_materials_from_json` — 首次启动从 `open_materials.json` 导入（用 `if exists skip` 避免重复）
- `browse_open_materials(query: MaterialQuery)` — 分页 + 筛选（WHERE 1=1 累加 + COUNT 子查询 + LIMIT/OFFSET）
- `get_open_material_detail(material_id)` — 单条详情
- `download_open_material(material_id, save_dir)` — 保存元数据到本地

#### 2.3 `desktop-manager\src-tauri\src\commands\mod.rs`
追加 `pub mod open_material;`

#### 2.4 `desktop-manager\src-tauri\src\lib.rs`
- 第 38-43 行后追加：调用 `import_open_materials_from_json`
- 第 76 行后 `invoke_handler!` 中追加 4 个新命令

**验证**：
```powershell
cd "i:\OpenMTSciEd\desktop-manager\src-tauri"; cargo check
```
无编译错误。启动应用后 console 显示 `✓ 成功导入 N 个开源课件`（N=8）。

---

### 阶段 3：前端 Service 与组件改造

#### 3.1 `desktop-manager\src\app\core\services\tauri.service.ts`
在第 223 行后追加 4 个方法：
```typescript
async importOpenMaterialsFromJson(): Promise<number>
async browseOpenMaterials(query: { source?, subject?, level?, material_type?, keyword?, page, page_size }): Promise<unknown>
async getOpenMaterialDetail(materialId: string): Promise<unknown>
async downloadOpenMaterial(materialId: string, saveDir: string): Promise<string>
```

#### 3.2 重写 `desktop-manager\src\app\features\material-library\open-material-browser\open-material-browser.component.ts`
- 删除第 325-343 行的 mock data 调用
- 删除第 451-549 行的 `getMockMaterials()`
- 注入 `TauriService`
- `loadMaterials()` 调用 `tauriService.browseOpenMaterials()`，通过 `mapToOpenMaterial()` 映射 snake_case → camelCase
- `downloadMaterial()` 调用 `tauriService.downloadOpenMaterial()`
- 模板：tab 标签 + tabContent 标题 + 卡片 source-badge 全部接入 `getSourceLogo()` / `getSourceDisplayName()`
- CSS：新增 `.tab-label-with-logo` / `.source-tab-logo` / `.source-badge-with-logo` 等

#### 3.3 修改 `desktop-manager\src\app\features\tutorial-library\resource-browser\resource-browser.component.ts`
- 第 1-12 行追加 `source-logo` 工具 import
- 第 53-77 行：移除 emoji，改为带 logo 的 mat-tab-label + tabContent 显示大 logo + 描述
- 第 159-161 行：source-badge 改为带 logo 的复合徽章
- 第 668-679 行：`getSourceName` / `getSourceClass` 内部改为调用工具函数，新增 `getSourceLogo()`
- CSS：复用 3.2 的样式类

#### 3.4 改造 `desktop-manager\src\app\shared\components\search-bar\search-bar.component.ts`
- imports 增加 `MatIconModule` / `MatProgressSpinnerModule` / `MatSnackBar` / `TauriService`
- 注入 `TauriService` 和 `MatSnackBar`
- `onSearch()` 改造：开关开启 → 调用 `tauriService.smartSearch()` 真正查询后端；关闭 → 走原 `searchService.updateFilters` 流程
- 新增 `performSmartSearch()` 私有方法，调用结果存到 `smartSearchResults` 数组
- 新增 `@Output() smartSearchTriggered` 事件供父组件订阅
- 模板：
  - 搜索框增加 prefix 图标 + hint 提示 + 聚焦阴影
  - 智能搜索开关旁加 `STEM` 徽章 + 加载指示器
  - 新增 `.smart-search-panel` 下拉面板显示结果
- CSS：聚焦效果 + panel 样式 + 结果列表样式

**验证**：
```powershell
cd "i:\OpenMTSciEd\desktop-manager"; npm run build
```
TypeScript 零错误，Angular AOT 编译通过。

启动 `npm run tauri:dev`：
- 课件库开源课件 tab 加载 8 条数据，tab/卡片显示对应 logo
- 教程库开源资源 tab tabContent/badge 显示 logo
- search-bar 开启"智能全网搜索"输入关键词，下拉面板显示结果（依赖 Rust → Next.js BFF 通畅）

---

### 阶段 4：端到端验证与重新打包

- 卸载旧版安装包
- 删除 `%APPDATA%/com.openmtscied.desktop-manager/openmtscied.db` 旧数据库（保证首次启动导入）
- 执行 `npm run tauri:build` 重新打包 MSI/NSIS
- 安装新包，验证：
  1. 教程库开源资源 tab：3 个 source tab + logo + 资源卡片列表
  2. 课件库开源课件 tab：3 个 source tab + logo + 课件卡片列表
  3. 教程库/课件库顶部 search-bar：开关联动 + 智能搜索面板
  4. Ctrl+K 全局搜索 dialog 仍可用

---

## 关键文件路径速查

| 用途 | 路径 |
|------|------|
| 数据库表结构 | `desktop-manager/src-tauri/src/db.rs` |
| Rust 命令实现（参考） | `desktop-manager/src-tauri/src/commands/resource.rs` |
| 命令注册 | `desktop-manager/src-tauri/src/lib.rs` |
| Tauri 前端服务 | `desktop-manager/src/app/core/services/tauri.service.ts` |
| 开源课件浏览器 | `desktop-manager/src/app/features/material-library/open-material-browser/open-material-browser.component.ts` |
| 开源课程浏览器 | `desktop-manager/src/app/features/tutorial-library/resource-browser/resource-browser.component.ts` |
| 页面内搜索栏 | `desktop-manager/src/app/shared/components/search-bar/search-bar.component.ts` |
| 全局搜索弹窗（不动） | `desktop-manager/src/app/shared/components/global-search/global-search.component.ts` |
| 智能搜索后端（不动） | `desktop-manager/src-tauri/src/commands/smart_search.rs` |
| 现有 JSON 数据（参考） | `desktop-manager/src-tauri/data/open_resources.json` |

---

## 不在本次范围

- 不修改 `global-search.component.ts`（保留 Ctrl+K 弹窗）
- 不修改 `smart_search.rs`（Rust 智能搜索命令已可用，仅前端未对接）
- 不修改 `resource.rs`（开源课程命令已正确实现）
- 不重写 website 端（`website/index.html` 已有完整 STEM 搜索引擎组件）
- 不重打 Next.js 后端 BFF
- 不实现"开源课件下载真实文件"（本次只下载元数据 JSON，与 `download_open_resource` 保持一致）

---

## 注意事项

- **PowerShell 命令分隔符**：用 `;` 而非 `&&`
- **Tauri 2.0**：`tauri::State<DbState>` 由 Tauri 自动注入；`tauri::State` 内部是 `Arc<Mutex<Connection>>`
- **数据库位置**：`%APPDATA%/com.openmtscied.desktop-manager/openmtscied.db`（Windows 22H2）
- **JSON 路径**：`std::env::current_dir().join("data")`（dev 模式 cwd 是 `src-tauri/`）
- **重复启动安全**：`if exists skip` 保证幂等；新表自动 `CREATE TABLE IF NOT EXISTS`
- **Angular 17 SVG 导入**：通过 `import url from './logo.svg'` 形式可被 Vite/webpack 处理为 URL
- **mock data 不物理删除**：仅从代码中移除调用，便于 git diff 和回滚
