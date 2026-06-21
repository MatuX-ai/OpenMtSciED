# OpenMTSciEd 子页面图标与链路修复

## Context（背景与目标）

完成第一阶段三大问题修复后，用户要求全面排查其他子页面是否仍存在两类问题：

1. **图标显示异常** —— 是否残留历史遗留图标资源未清理
2. **功能链路未通** —— 子页面是否仍走 mock data 或 API 路径错位

通过逐文件排查，发现如下问题分布：

**website 端（5 个 HTML 页面）**：
- `dashboard.html` (761 行)：4 个 stat-card + 3 条活动 + 3 条推荐**全部硬编码 mock data**，无任何 API 调用
- `developer.html` (955 行)：**API 路径严重错位** — fetch `/tutorials` 应为 `/api/v1/libraries/tutorials`；「概览」tab 缺图标
- `profile.html` (812 行)：硬编码 `http://localhost:3000/api/v1/auth`，未走 `window.API_BASE_URL`
- `login.html` (345 行)：脚本加载顺序不当（demo-account.js 在 api-config.js 之前）
- `download.html` (194 行)：倒计时占位页，无需后端

**desktop-manager 端（4 个组件）**：
- `hardware-project-list.component.ts` (683 行)：**完全使用 mock data**（3 个硬编码项目），未接 BFF
- `search-map.component.ts` (319 行)：`loadGraphData()` 永远空，`download()` 无实现
- `dashboard.component.ts` (101 行) + html：3 个统计数字硬编码 12/156/24
- `knowledge-graph.component.ts`：mock 仍保留（已 plan 过但需要加注释说明）

**图标问题排查结论**：
- 经核查，website 4 个 stat-card 的 🔬💻⚙️📊 emoji **正常显示**
- 真正缺图标的**只有 1 处**：`developer.html:614` 「概览」tab 的空 `tab-icon` span
- desktop-manager 用 RemixIcon 字体，无丢失
- `website/components/navbar.html` (100 行) 是冗余的旧版 nav 组件（每个 HTML 都内联了完整 nav）

**目标**：打通所有子页面的后端链路，清理残缺图标，统一 API 路径拼接规范。

---

## 实施计划（3 阶段）

### 阶段 A：website 端 P0 修复

#### A1. 重构 `i:\OpenMTSciEd\website\js\api-config.js`
**目标**：双常量导出，避免 `/api/v1` 前缀在每个 fetch 处重复写

```js
window.API_BASE_URL = config.baseUrl;            // http://localhost:3000（裸域名）
window.API_PREFIX  = config.baseUrl + '/api/v1'; // http://localhost:3000/api/v1
```

**验证**：浏览器 Console 打印 `window.API_PREFIX === 'http://localhost:3000/api/v1'`

#### A2. 修复 `i:\OpenMTSciEd\website\developer.html`（最关键）
- **第 614 行**：补全 `<span class="tab-icon">🏠</span>概览`
- **第 859-860 行**：fetch 改为 `API_PREFIX + '/libraries/tutorials?skip=0&limit=12'`
  - 后端 `/api/v1/libraries/tutorials` 返回结构：`{success, data, total, skip, limit}`
  - 字段读取修正：`data.items` → `data.data`，`tutorial.grade_level` → `tutorial.level`
- **第 909-910 行**：fetch 改为 `API_PREFIX + '/hardware-projects?page=1&size=12'`
  - 后端返回 `{items, total, page, size, total_pages}`，字段 `estimated_time_hours/difficulty_level/subject` 直接可用
- **第 838-840 行**：catch 块显示真实 `error.message`

**验证**：启动 backend + 静态 server，访问 `developer.html` 切到「教程资源」「硬件项目」tab，HTTP 200，真实数据展示。

#### A3. 修复 `i:\OpenMTSciEd\website\profile.html`
- **第 594 行**：`const API_BASE_URL = window.API_PREFIX + '/auth';`（替换硬编码）
- **第 645 行** `displayProfile`：后端 `/auth/me` 返回 `{user: {id, username, email, name, role, avatar}}`，适配字段（`data.full_name` → `data.name`）
- **第 696-700 行** `updateProfile`：后端无 `/me/profile` PUT 端点，改为 `PUT /api/v1/users/{id}`；若失败则保留演示模式提示

**验证**：登录后访问 `/profile`，看到真实用户名/邮箱。

#### A4. 改造 `i:\OpenMTSciEd\website\dashboard.html`（mock → 真实 API）
- **第 637-643 行** `loadStats()`：调用 `GET /api/v1/libraries/stats`
  - 4 个 stat 字段映射：`total` → 总资源量，`tutorials`/`materials`/`hardware`/`questions`
- **第 645-697 行** `loadActivities()`：调用 `GET /api/v1/libraries/tutorials?limit=3` 作为"最近浏览"代理
- **第 699-743 行** `loadRecommendations()`：调用 `GET /api/v1/hardware-projects?limit=3` 作为推荐
- 加 loading 占位（`(--)` 1.5s 后填充）

**验证**：dashboard 加载 4 个数字非 0，活动/推荐有真实数据。

#### A5. 微调 `i:\OpenMTSciEd\website\login.html`
- 把 `<script src="js/api-config.js">` 提前到 `<script src="js/demo-account.js">` 之前，确保 `window.API_BASE_URL` 已定义

#### A6. 清理冗余文件
- `i:\OpenMTSciEd\website\components\navbar.html`（100 行）—— 内部 nav 已内联到每个页面，此文件为冗余。可选删除（属"清理历史遗留图标资源"范畴）。

---

### 阶段 B：desktop-manager 端 P1 修复

#### B1. 修复 `hardware-project-list.component.ts`
- **第 446 行 constructor**：注入 `HardwareProjectService`
- **第 449-450 行** `ngOnInit`：`this.projects = this.getMockProjects()` → 改为调用 `this.loadProjects()`
- 新增 `loadProjects()` 方法：调用 `hardwareProjectService.getProjects({})`，订阅后填入 `this.projects`
- 字段映射：
  - `difficulty` (number) ← 后端 `difficulty_level` (string) → `parseDifficulty()` 字符串→星级
  - `total_cost` ← 后端未返回，前端默认 0
  - `materials` ← 后端 `hardware_required` 数组 → 格式转换
- **第 600-681 行** `getMockProjects()` 加 `@deprecated` 注释保留作为 fallback

**验证**：桌面端访问 `/hardware-projects`，不再显示"温湿度监测器"等 3 条写死数据。

#### B2. 修复 `search-map.component.ts`
- **新增** `i:\OpenMTSciEd\desktop-manager\src\app\core\services\knowledge-graph.service.ts`
  - `getGraph(): Observable<{categories, nodes, links}>` → 内部调 `learning/path` 并转换格式
- **第 219-223 行** `loadGraphData()`：注入 service，调用真实 API，把 `learning_path[]` 转为 `{categories, nodes, links}`（参考 `knowledge-graph.component.ts` 的 `mapToLearningPath`）
- **第 262-265 行** `download(id)`：调用 `GET /api/v1/tutorials/{id}` 获取 url，调用 `tauriService.openUrl(url)` 打开；详情不可用时显示"暂不支持下载"
- **第 267-294 行** `viewHardware(id)`：注入 `HardwareProjectService` 调详情，找不到则提示

**验证**：搜索图谱页面加载后图谱上有节点（≥3 个），点击节点详情面板显示，下载按钮可用。

#### B3. 修复 `dashboard.component.ts` + `dashboard.component.html`
- **新增** `i:\OpenMTSciEd\desktop-manager\src\app\core\services\libraries-stats.service.ts`
  - `getStats()` 调用 `/api/v1/libraries/stats`
- **dashboard.component.ts 第 91-93 行** `ngOnInit`：调 `LibrariesStatsService.getStats()`，把 `tutorials` `materials` `hardware` 填入组件
- **html 第 9-29 行**：3 个 `stat-number` 元素加动态 ID 用于 JS 填充
- 失败时回退到 12/156/24 + `console.warn`

**验证**：仪表盘 3 个统计数字与后端一致。

---

### 阶段 C：降级 TODO 清理（P2）

#### C1. `knowledge-graph.component.ts` 保留 mock
- `getMockLearningPaths()` 上方加注释：`// 保留作为 UI 立即可见的兜底数据`

#### C2. `my-projects.component.ts` 第 619 行
- 验证 `'user_123'` 是否仅是注释残留，若无引用则移除

#### C3. `settings.component.ts` 5 个 TODO
- 仅加 `// TODO(scope=phase-3)` 标签便于追踪，**不在本次范围实现**（导出/导入/备份/恢复是独立大功能）

---

## 关键文件路径速查

| 用途 | 路径 |
|------|------|
| API 配置 | `website/js/api-config.js` |
| 开发者门户 | `website/developer.html` |
| 学习仪表盘 | `website/dashboard.html` |
| 个人中心 | `website/profile.html` |
| 登录页 | `website/login.html` |
| 冗余旧版 nav | `website/components/navbar.html`（可选删除） |
| 硬件项目列表 | `desktop-manager/src/app/features/hardware-projects/hardware-project-list/hardware-project-list.component.ts` |
| 搜索地图 | `desktop-manager/src/app/features/search-map/search-map.component.ts` |
| 仪表盘 | `desktop-manager/src/app/features/dashboard/dashboard.component.{ts,html}` |
| 知识图谱 | `desktop-manager/src/app/features/knowledge-graph/knowledge-graph.component.ts` |
| 我的项目 | `desktop-manager/src/app/features/my-projects/my-projects.component.ts` |
| 硬件项目服务 | `desktop-manager/src/app/core/services/` (检查是否存在) |
| 知识图谱服务 | `desktop-manager/src/app/core/services/knowledge-graph.service.ts`（新建） |
| 库统计服务 | `desktop-manager/src/app/core/services/libraries-stats.service.ts`（新建） |
| 端点参考（只读） | `backend-next/app/api/v1/{libraries,tutorials,hardware-projects,knowledge-graph,auth}/` |

---

## 不在本次范围

- 不修改 `backend-next` 后端代码
- 不修改 desktop-manager `tauri.service.ts` 已有方法签名
- 不实现 `settings.component.ts` 的导出/导入/备份/恢复（独立大功能）
- 不实现 `search-map` 详情对话框（仅填充图谱数据 + 基础下载）
- 不重新设计任何 UI（仅最小化改动以修复问题）
- 不修复 `frontend-next`（营销 Angular 前端，独立项目）

---

## 注意事项

- **PowerShell 命令分隔符**：用 `;` 而非 `&&`
- **dev 环境 baseUrl**：`http://localhost:3000`（裸域名）+ `/api/v1`（统一前缀）
- **prod 环境 baseUrl**：`''`（同源），所有 fetch 自动走相对路径 `/api/v1/...`
- **降级策略**：API 失败时保留兜底 mock + Snackbar 提示，不阻塞 UI
- **图标补充**：核查发现 4 个 stat-card emoji 正常显示，真正问题在路径和数据，不在图标本身
- **desktop-manager 端**通过 `proxy.conf.json` 代理到 backend-next
- **不要破坏现有约定**：`API_BASE_URL` 和 `API_PREFIX` 两个常量都保留
- **desktop-manager 已有 `mock-data.provider.ts`**：可作为统一 mock 数据源参考
