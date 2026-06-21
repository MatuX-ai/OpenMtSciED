# admin-web 管理后台全面审计报告

**审计日期**：2026-06-19  
**审计范围**：[admin-web/](file:///g:/OpenMTSciEd/admin-web)（Angular 管理后台前端）  
**技术栈**：Angular 21.2 + Angular Material 21.2 + TypeScript 5.9  
**代码规模**：26 个 TS 文件、5 个 HTML 模板、4 个 SCSS 文件，约 7000 行代码  
**后端关联**：[backend-next/](file:///g:/OpenMTSciEd/backend-next)（Next.js）  

---

## 1. 审计概览

### 1.1 审计范围

本次审计覆盖 admin-web 中 **10 个管理模块** + **4 个基础设施文件**：

| 类别 | 文件 | 行数 |
|------|------|------|
| 主入口与路由 | `main.ts`, `app.ts`, `app.config.ts`, `app.routes.ts`, `app.html` | ~143 |
| 认证与守卫 | `auth.service.ts`, `auth.guard.ts`, `http-error.interceptor.ts` | ~189 |
| 用户管理 | `admin-user-management.component.ts/html/scss`, `user-detail-dialog.component.ts`, `bulk-import-dialog.component.ts`, `user.service.ts`, `user.models.ts` | ~1754 |
| 课程管理 | `admin-courses.component.ts` | ~722 |
| 教程管理 | `admin-tutorials.component.ts` | ~670 |
| 课件管理 | `admin-materials.component.ts` | ~460 |
| 爬虫管理 | `admin-crawlers.component.ts` | ~978 |
| 知识图谱 | `knowledge-graph-admin.component.ts` | ~289 |
| 资源关联 | `resource-associations.component.ts` | ~584 |
| 题库管理 | `admin-question-bank.component.ts` | ~423 |
| 教育平台 | `admin-education-platforms.component.ts` | ~429 |
| 系统设置 | `admin-settings.component.ts` | ~406 |
| 仪表盘 | `dashboard.component.ts` | ~427 |
| 布局 | `admin-layout.component.ts` | ~273 |

### 1.2 审计方法

- **静态代码分析**：逐文件审查 TypeScript 代码逻辑
- **架构评估**：分析组件/服务/路由组织模式
- **安全审计**：追踪认证、授权、数据存储链路
- **功能完整性检查**：验证每个组件公开的操作方法

---

## 2. 审计发现总览

| 优先级 | 数量 | 关键问题 |
|--------|------|----------|
| 🔴 P0（严重） | 3 | 硬编码凭证、权限缺失、Token 存储风险 |
| 🟠 P1（高） | 7 | 功能残缺、Mock 数据、原生 Confirm、重复代码 |
| 🟡 P2（中） | 6 | 无 Service 层、组件臃肿、OnPush、内存泄漏 |
| 🟢 P3（低） | 5 | CDN 依赖、硬编码颜色、骨架屏缺失、移动端体验 |

---

## 3. 代码结构与质量

### 3.1 ✅ 优点

1. **Standalone 架构**：所有组件均为 Standalone，无需 NgModule 冗余，紧跟 Angular 最佳实践
2. **Signal 响应式**：大部分组件使用 `signal()` API 替代传统 `BehaviorSubject`，简化变更检测
3. **懒加载路由**：所有 admin 子路由均使用 `loadComponent()` 按需加载
4. **Router 守卫**：authGuard 对受保护路由进行基础的登录校验

### 3.2 ❌ 问题

#### 🔴 问题 3.2.1：严重代码重复

以下辅助函数在多个组件中完全重复实现：

| 函数 | 出现组件数 | 出现位置 |
|------|-----------|----------|
| `formatDate()` | 4 | crawlers、user-management、user-detail-dialog、education-platforms |
| `getRoleDisplayName()` | 2 | admin-user-management、user-detail-dialog |
| `getRoleClass()` | 2 | admin-user-management、user-detail-dialog |
| `getSubjectName()` | 2 | admin-courses、admin-materials |
| `getGradeLevelName()` | 2 | admin-courses、admin-materials |
| `formatFileSize()` | 2 | bulk-import-dialog、education-platforms |
| 统计卡片布局（template + styles） | 8 | 几乎所有管理组件 |

**改进建议**：抽取共享工具函数到 `src/app/core/utils/` 目录，例如：
- `date.utils.ts`：统一 `formatDate()`
- `role.utils.ts`：统一角色映射
- `stats-card` 可复用组件

#### 🟡 问题 3.2.2：组件臃肿（违反单一职责）

| 组件 | 行数 | 问题 |
|------|------|------|
| [admin-crawlers.component.ts](file:///g:/OpenMTSciEd/admin-web/src/app/admin/crawlers/admin-crawlers.component.ts) | 977 | 模板 + 样式 + 逻辑全部内联，远超 300 行最佳线 |
| [admin-courses.component.ts](file:///g:/OpenMTSciEd/admin-web/src/app/admin/courses/admin-courses.component.ts) | 722 | 同上 |
| [admin-tutorials.component.ts](file:///g:/OpenMTSciEd/admin-web/src/app/admin/tutorials/admin-tutorials.component.ts) | 670 | 同上 |
| [bulk-import-dialog.component.ts](file:///g:/OpenMTSciEd/admin-web/src/app/admin/user-management/bulk-import-dialog.component.ts) | 676 | 同上 |

**影响**：可维护性降低、代码审查困难、测试编写受阻。

**改进建议**：
- 将模板和样式拆分为独立 HTML / SCSS 文件
- 将重复的统计卡片布局提取为共享组件
- 将表格列定义、状态映射等逻辑提取为配置对象或 Pipe

#### 🟡 问题 3.2.3：过度使用 `any` 类型

约 **20+ 处** API 调用使用 `any` 而非 TypeScript 接口：

```typescript
// dashboard.component.ts - 多处使用 any
const userStats = await firstValueFrom(
  this.http.get<any>('/api/v1/users/stats')
);
const response: any = await firstValueFrom(
  this.http.get('/api/v1/admin/crawler')
);
```

**影响**：失去 TypeScript 的类型安全优势，运行时错误无法被编译期捕获。

**改进建议**：所有 API 响应均应使用已定义的接口（如 `UserStats`, `CrawlerTask` 等）或通过 Service 封装。

#### 🟡 问题 3.2.4：API 路径硬编码

`/api/v1` 在 **11 个组件** 中硬编码出现（共约 30+ 处），例如：
- [dashboard.component.ts](file:///g:/OpenMTSciEd/admin-web/src/app/features/dashboard/dashboard.component.ts#L346)
- [admin-crawlers.component.ts](file:///g:/OpenMTSciEd/admin-web/src/app/admin/crawlers/admin-crawlers.component.ts#L710)
- [admin-courses.component.ts](file:///g:/OpenMTSciEd/admin-web/src/app/admin/courses/admin-courses.component.ts#L544)
- [user.service.ts](file:///g:/OpenMTSciEd/admin-web/src/app/core/services/user.service.ts#L46)
- [auth.service.ts](file:///g:/OpenMTSciEd/admin-web/src/app/core/services/auth.service.ts#L48)

**改进建议**：
```typescript
// src/environments/environment.ts
export const environment = {
  production: false,
  apiBase: '/api/v1',
};

// 注入使用
this.http.get(`${environment.apiBase}/users/stats`)
```

### 3.3 📋 改进总结（代码结构）

| # | 建议 | 优先级 | 工作量 |
|---|------|--------|--------|
| 1 | 抽取共享工具函数（formatDate/role utils） | P1 | 1d |
| 2 | 拆分巨型组件（crawlers → 子组件） | P2 | 2d |
| 3 | 替换 `any` 为严格类型 | P2 | 1d |
| 4 | 统一 API 路径到 environment.ts | P2 | 0.5d |

---

## 4. 功能完整性

### 4.1 ✅ 已完成功能

| 功能模块 | 状态 | 说明 |
|----------|------|------|
| 用户列表查看 | ✅ 完成 | 表格展示、搜索、角色/状态筛选 |
| 用户删除 | ✅ 完成 | 调用 `DELETE /users/:id` |
| 用户批量导入（对话框） | ✅ 完成 | 三步流程选文件→配置→结果 |
| 用户详情查看 | ✅ 完成 | 对话框展示基本信息、角色管理 UI |
| 题库 CRUD（创建/编辑/删除） | ✅ 完成 | 调用 REST API |
| 资源关联 CRUD（查看/添加/删除） | ✅ 完成 | 调用 REST API |
| 仪表盘统计 | ✅ 完成 | 调用 stats API |
| 爬虫任务浏览 | ✅ 完成 | 表格展示 |
| 教育平台状态浏览 | ✅ 完成 | 表格展示 |
| 课件库浏览+筛选 | ✅ 完成 | 表格 + 多字段筛选项 |
| 教程库浏览+筛选 | ✅ 完成 | 表格 + 多字段筛选项 |
| 知识图谱可视化 | ✅ 完成 | ECharts 力导向图 |
| 系统设置浏览+编辑 | ✅ 完成 | 多 Tab 表单 |

### 4.2 ❌ 功能缺失 / "开发中"

以下功能**只有 UI 骨架（按钮），点击仅显示 snackbar 提示"开发中"**，无实际 API 调用或后端对接：

| 模块 | 方法 | 文件:行号 |
|------|------|-----------|
| 用户管理 | `editUser()` | [admin-user-management.component.ts:228](file:///g:/OpenMTSciEd/admin-web/src/app/admin/user-management/admin-user-management.component.ts#L228) |
| 用户管理 | `exportUsers()` | [admin-user-management.component.ts:200](file:///g:/OpenMTSciEd/admin-web/src/app/admin/user-management/admin-user-management.component.ts#L200) |
| 用户管理 | `batchAction()` | [admin-user-management.component.ts:285](file:///g:/OpenMTSciEd/admin-web/src/app/admin/user-management/admin-user-management.component.ts#L285) |
| 用户详情 | `assignRole()` | [user-detail-dialog.component.ts:343](file:///g:/OpenMTSciEd/admin-web/src/app/admin/user-management/user-detail-dialog.component.ts#L343) |
| 用户详情 | `removeRole()` | [user-detail-dialog.component.ts:351](file:///g:/OpenMTSciEd/admin-web/src/app/admin/user-management/user-detail-dialog.component.ts#L351) |
| 批量导入 | `downloadSample()` | [bulk-import-dialog.component.ts:627](file:///g:/OpenMTSciEd/admin-web/src/app/admin/user-management/bulk-import-dialog.component.ts#L627) |
| 批量导入 | `downloadReport()` | [bulk-import-dialog.component.ts:663](file:///g:/OpenMTSciEd/admin-web/src/app/admin/user-management/bulk-import-dialog.component.ts#L663) |
| 课程管理 | `createCourse()` | [admin-courses.component.ts:645](file:///g:/OpenMTSciEd/admin-web/src/app/admin/courses/admin-courses.component.ts#L645) |
| 课程管理 | `editCourse()` | [admin-courses.component.ts:649](file:///g:/OpenMTSciEd/admin-web/src/app/admin/courses/admin-courses.component.ts#L649) |
| 课程管理 | `viewCourse()` | [admin-courses.component.ts:653](file:///g:/OpenMTSciEd/admin-web/src/app/admin/courses/admin-courses.component.ts#L653) |
| 课程管理 | `deleteCourse()` | [admin-courses.component.ts:657](file:///g:/OpenMTSciEd/admin-web/src/app/admin/courses/admin-courses.component.ts#L657) |
| 教程管理 | `importTutorial()` | [admin-tutorials.component.ts:599](file:///g:/OpenMTSciEd/admin-web/src/app/admin/tutorials/admin-tutorials.component.ts#L599) |
| 教程管理 | `viewTutorial()` | [admin-tutorials.component.ts:603](file:///g:/OpenMTSciEd/admin-web/src/app/admin/tutorials/admin-tutorials.component.ts#L603) |
| 教程管理 | `editTutorial()` | [admin-tutorials.component.ts:607](file:///g:/OpenMTSciEd/admin-web/src/app/admin/tutorials/admin-tutorials.component.ts#L607) |
| 教程管理 | `deleteTutorial()` | [admin-tutorials.component.ts:611](file:///g:/OpenMTSciEd/admin-web/src/app/admin/tutorials/admin-tutorials.component.ts#L611) |
| 课件管理 | `uploadMaterial()` | [admin-materials.component.ts:429](file:///g:/OpenMTSciEd/admin-web/src/app/admin/materials/admin-materials.component.ts#L429) |
| 课件管理 | `viewMaterial()` | [admin-materials.component.ts:433](file:///g:/OpenMTSciEd/admin-web/src/app/admin/materials/admin-materials.component.ts#L433) |
| 课件管理 | `deleteMaterial()` | [admin-materials.component.ts:437](file:///g:/OpenMTSciEd/admin-web/src/app/admin/materials/admin-materials.component.ts#L437) |
| 爬虫管理 | `runAllCrawlers()` | [admin-crawlers.component.ts:815](file:///g:/OpenMTSciEd/admin-web/src/app/admin/crawlers/admin-crawlers.component.ts#L815) |
| 爬虫管理 | `stopCrawler()` | [admin-crawlers.component.ts:886](file:///g:/OpenMTSciEd/admin-web/src/app/admin/crawlers/admin-crawlers.component.ts#L886) |
| 爬虫管理 | `viewLogs()` | [admin-crawlers.component.ts:893](file:///g:/OpenMTSciEd/admin-web/src/app/admin/crawlers/admin-crawlers.component.ts#L893) |
| 教育平台 | `viewPlatformDetails()` | [admin-education-platforms.component.ts:398](file:///g:/OpenMTSciEd/admin-web/src/app/admin/education-platforms/admin-education-platforms.component.ts#L398) |
| 个人资料 | `updateProfile()` | [profile.component.ts:273](file:///g:/OpenMTSciEd/admin-web/src/app/features/auth/profile/profile.component.ts#L273) |
| 资源关联 | 批量操作 Tab | [resource-associations.component.ts:233](file:///g:/OpenMTSciEd/admin-web/src/app/admin/resource-associations/resource-associations.component.ts#L233) |

**影响**：**23 个功能点**仅完成了 UI 入口，实际不可用。用户点击按钮后看到的是占位提示而非真实功能。

### 4.3 ❌ 数据真实性问题

以下数据为**硬编码 mock 或随机值**，非真实后端返回：

| 位置 | 代码 | 问题 |
|------|------|------|
| [admin-courses.component.ts:553](file:///g:/OpenMTSciEd/admin-web/src/app/admin/courses/admin-courses.component.ts#L553) | `enrolled_students: Math.floor(Math.random() * 200)` | 随机注册人数 |
| [admin-courses.component.ts:552](file:///g:/OpenMTSciEd/admin-web/src/app/admin/courses/admin-courses.component.ts#L552) | `duration_hours: 20` | 硬编码 20 小时 |
| [admin-courses.component.ts:554](file:///g:/OpenMTSciEd/admin-web/src/app/admin/courses/admin-courses.component.ts#L554) | `status: 'active'` | 全部标记为活跃 |
| [admin-crawlers.component.ts:741](file:///g:/OpenMTSciEd/admin-web/src/app/admin/crawlers/admin-crawlers.component.ts#L741) | `mockHistory` 数组 | 4 条完全硬编码的历史记录 |
| [admin-crawlers.component.ts:784](file:///g:/OpenMTSciEd/admin-web/src/app/admin/crawlers/admin-crawlers.component.ts#L784) | `mockErrors` 数组 | 2 条完全硬编码的错误日志 |
| [dashboard.component.ts:370](file:///g:/OpenMTSciEd/admin-web/src/app/features/dashboard/dashboard.component.ts#L370) | `systemHealth: 'healthy'` | 始终标记为健康 |
| [education-platforms:392](file:///g:/OpenMTSciEd/admin-web/src/app/admin/education-platforms/admin-education-platforms.component.ts#L392) | 定时任务仅切换本地布尔值 | 无 API 交互 |

---

## 5. UI/UX 设计

### 5.1 ✅ 优点

1. **Material Design 一致性**：统一使用 Angular Material 组件库，风格一致
2. **统计卡片**：每个管理页顶部均有关键数据卡片，信息层级清晰
3. **响应式基础**：移动端有媒体查询（768px/480px 断点）
4. **加载/空状态处理**：统一使用 `loading` 信号 + `empty-state` 模板片段
5. **表格数据展示**：使用 Material Table 且提供空数据提示行

### 5.2 ❌ 问题

#### 🟠 问题 5.2.1：使用浏览器原生 `confirm()` / `prompt()`

**出现位置**（共 7 处）：

| 位置 | 代码 |
|------|------|
| [admin-user-management.component.ts:237](file:///g:/OpenMTSciEd/admin-web/src/app/admin/user-management/admin-user-management.component.ts#L237) | `if (confirm('确定要删除用户...'))` |
| [admin-crawlers.component.ts:815](file:///g:/OpenMTSciEd/admin-web/src/app/admin/crawlers/admin-crawlers.component.ts#L815) | `if (confirm('确定要运行所有爬虫...'))` |
| [admin-crawlers.component.ts:822](file:///g:/OpenMTSciEd/admin-web/src/app/admin/crawlers/admin-crawlers.component.ts#L822) | `prompt('请输入抓取间隔（小时）...')` |
| [admin-crawlers.component.ts:832](file:///g:/OpenMTSciEd/admin-web/src/app/admin/crawlers/admin-crawlers.component.ts#L832) | `if (confirm('确定要删除爬虫...'))` |
| [admin-crawlers.component.ts:844](file:///g:/OpenMTSciEd/admin-web/src/app/admin/crawlers/admin-crawlers.component.ts#L844) | `const name = prompt('请输入数据源名称...')` |
| [admin-crawlers.component.ts:846](file:///g:/OpenMTSciEd/admin-web/src/app/admin/crawlers/admin-crawlers.component.ts#L846) | `const url = prompt('请输入目标网站地址...')` |
| [admin-courses.component.ts:657](file:///g:/OpenMTSciEd/admin-web/src/app/admin/courses/admin-courses.component.ts#L657) | `if (confirm('确定要删除课程...'))` |

**影响**：
- 浏览器原生 confirm/prompt **阻塞 UI 渲染**，体验割裂
- 无法统一样式/国际化
- prompt 不支持输入验证

**改进建议**：统一使用 `MatDialog` 封装确认对话框：
```typescript
this.dialog.open(ConfirmDialogComponent, {
  data: { message: `确定要删除用户 "${user.username}" 吗？此操作不可恢复！` }
}).afterClosed().subscribe(result => { if (result) { ... } });
```

#### 🟠 问题 5.2.2：未实现的功能按钮仍可点击

全部 23 个"开发中"功能都显示为**可点击状态**的按钮，用户点击后才获得 snackbar 提示"功能开发中"。这造成预期落差（affordance 与实际行为不符）。

**改进建议**：
- 对未实现功能使用 `[disabled]="true"` + `matTooltip="功能开发中"`
- 或使用 `mat-badge` 徽标标注"即将上线"

#### 🟢 问题 5.2.3：缺少骨架屏加载效果

当前所有组件仅展示圆形 spinner（`mat-progress-spinner`），没有使用 Skeleton 骨架屏。在列表大量数据场景下用户体验可以进一步优化。

#### 🟢 问题 5.2.4：移动端表格仅 overflow-x

7 个表格组件在移动端均使用 `overflow-x: auto` 滚动方式。在窄屏（<480px）下，水平滚动体验较差。

**改进建议**：在窄屏切换为卡片式布局：
```scss
@media (max-width: 480px) {
  table.mat-table { display: none; }
  .mobile-card { display: block; }
}
```

#### 🟢 问题 5.2.5：硬编码颜色

模板和样式中大量直接使用十六进制颜色（`#1976d2`, `#4CAF50`, `#e3f2fd` 等），未充分利用 Material Theme 的 CSS 变量系统。

---

## 6. 技术实现

### 6.1 ✅ 优点

1. **Angular 21 + Material 21**：使用最新稳定版框架，持续跟进社区发展
2. **HTTP 错误拦截器**：[http-error.interceptor.ts](file:///g:/OpenMTSciEd/admin-web/src/app/core/interceptors/http-error.interceptor.ts) 统一处理 http 错误并显示 snackbar
3. **路由守卫**：authGuard 保护所有受保护路由
4. **Token 自动注入**：拦截器统一注入 Authorization header
5. **懒加载路由**：管理后台所有子组件按需加载

### 6.2 ❌ 问题

#### 🟡 问题 6.2.1：缺少 Service 抽象层

**9 个组件**直接注入 `HttpClient` 而非通过 Service：

| 组件 | 文件 |
|------|------|
| DashboardComponent | [dashboard.component.ts:332](file:///g:/OpenMTSciEd/admin-web/src/app/features/dashboard/dashboard.component.ts#L332) |
| AdminCrawlersComponent | [admin-crawlers.component.ts:687](file:///g:/OpenMTSciEd/admin-web/src/app/admin/crawlers/admin-crawlers.component.ts#L687) |
| AdminCoursesComponent | [admin-courses.component.ts:503](file:///g:/OpenMTSciEd/admin-web/src/app/admin/courses/admin-courses.component.ts#L503) |
| AdminTutorialsComponent | [admin-tutorials.component.ts:466](file:///g:/OpenMTSciEd/admin-web/src/app/admin/tutorials/admin-tutorials.component.ts#L466) |
| AdminMaterialsComponent | [admin-materials.component.ts:291](file:///g:/OpenMTSciEd/admin-web/src/app/admin/materials/admin-materials.component.ts#L291) |
| AdminEducationPlatformsComponent | [admin-education-platforms.component.ts:329](file:///g:/OpenMTSciEd/admin-web/src/app/admin/education-platforms/admin-education-platforms.component.ts#L329) |
| AdminSettingsComponent | [admin-settings.component.ts:322](file:///g:/OpenMTSciEd/admin-web/src/app/admin/settings/admin-settings.component.ts#L322) |
| KnowledgeGraphAdminComponent | [knowledge-graph-admin.component.ts:94](file:///g:/OpenMTSciEd/admin-web/src/app/admin/knowledge-graph/knowledge-graph-admin.component.ts#L94) |
| ResourceAssociationsComponent | [resource-associations.component.ts:472](file:///g:/OpenMTSciEd/admin-web/src/app/admin/resource-associations/resource-associations.component.ts#L472) |

已有 `UserService` 可作参考模式。建议为每个业务域创建对应 Service：

```
src/app/core/services/
├── user.service.ts          ✅ 已有
├── crawler.service.ts       ❌ 缺失
├── course.service.ts        ❌ 缺失
├── tutorial.service.ts      ❌ 缺失
├── material.service.ts      ❌ 缺失
├── platform.service.ts      ❌ 缺失
├── settings.service.ts      ❌ 缺失
├── graph.service.ts         ❌ 缺失
├── association.service.ts   ❌ 缺失
└── question.service.ts      ❌ 缺失
```

#### 🟡 问题 6.2.2：变更检测策略未优化

仅以下组件使用了 `ChangeDetectionStrategy.OnPush`：
- [admin-user-management.component.ts:54](file:///g:/OpenMTSciEd/admin-web/src/app/admin/user-management/admin-user-management.component.ts#L54)
- [admin-education-platforms.component.ts:326](file:///g:/OpenMTSciEd/admin-web/src/app/admin/education-platforms/admin-education-platforms.component.ts#L326)

其余组件使用默认的 `Default` 策略，在大数据量表场景下影响性能。

#### 🟡 问题 6.2.3：内存泄漏风险

[knowledge-graph-admin.component.ts:182](file:///g:/OpenMTSciEd/admin-web/src/app/admin/knowledge-graph/knowledge-graph-admin.component.ts#L182)：
```typescript
window.addEventListener('resize', () => {
  if (this.chart) {
    this.chart.resize();
  }
});
```
组件销毁时未移除 resize 事件监听，造成内存泄漏。

**改进建议**：
```typescript
private onResize = () => this.chart?.resize();

ngAfterViewInit(): void {
  window.addEventListener('resize', this.onResize);
}

ngOnDestroy(): void {
  window.removeEventListener('resize', this.onResize);
  this.chart?.dispose();
}
```

#### 🟡 问题 6.2.4：无状态管理

- 无 NgRx、Signal Store、或任何集中状态管理
- 用户统计信息在各组件间重复获取
- 当前登录用户状态仅在 `auth.service.ts` 中以 BehaviorSubject 维护
- 无加载缓存机制

#### 🟢 问题 6.2.5：ECharts 通过 CDN 加载

[admin-web/src/index.html:17](file:///g:/OpenMTSciEd/admin-web/src/index.html#L17)：
```html
<script src="https://cdn.jsdelivr.net/npm/echarts@5.4.3/dist/echarts.min.js"></script>
```

- `declare var echarts: any;` 失去类型提示
- CDN 不可用时知识图谱功能完全失效
- 建议通过 npm 安装：`npm install echarts @types/echarts`

#### 🟢 问题 6.2.6：HTTP 拦截器可改进

[app.config.ts:14](file:///g:/OpenMTSciEd/admin-web/src/app/app.config.ts#L14)：
```typescript
provideHttpClient(withInterceptorsFromDi())
```

当前使用基于 Class 的拦截器（DI 方式），建议迁移到 Angular 15+ 推荐的**函数式拦截器模式**：
```typescript
provideHttpClient(
  withInterceptors([authInterceptor, errorInterceptor])
)
```

同时，拦截器 [http-error.interceptor.ts](file:///g:/OpenMTSciEd/admin-web/src/app/core/interceptors/http-error.interceptor.ts) 缺少：
- 401 跳转后回跳地址保存
- `retry` 重试机制（3 次后退等）
- 网络离线检测

#### 🟢 问题 6.2.7：测试缺失

`angular.json` 中设置 `skipTests: true` 覆盖了所有代码生成器。package.json 中无 test runner 配置。**整个 admin-web 项目无任何单元测试或 E2E 测试**。

---

## 7. 安全性 🔴（重点章节）

### 🔴 P0：问题 7.1 — mockLogin 硬编码凭证

**严重程度**：🔴 **CRITICAL**

**位置**：[login.component.ts:138-154](file:///g:/OpenMTSciEd/admin-web/src/app/features/auth/login/login.component.ts#L138-L154)

```typescript
mockLogin(): void {
  if (this.loading) return;
  this.loading = true;
  this.cdr.detectChanges();

  this.authService.login({ username: 'user', password: '12345678' }).subscribe({
    next: () => {
      this.snackBar.open('欢迎体验！已使用模拟账号登录', '关闭', { duration: 3000 });
      this.router.navigate(['/dashboard']);
    },
    error: (err: any) => {
      this.loading = false;
      this.cdr.detectChanges();
      this.snackBar.open('模拟登录失败，请确保后端服务已启动', '关闭', { duration: 3000 });
    }
  });
}
```

**风险分析**：
- 任何人可「一键登录」进入管理后台
- 密码 `12345678` 是弱密码
- 如果后端接受此凭证（且未做 `@requires_role` 限制），攻击者可获得管理权限
- 即便后端分离，前端暴露密码等效于公开攻击向量

**建议修复**：❌ 删除 `mockLogin()` 方法。✅ 如需要演示账号，应：
1. 通过环境变量控制（`enableMockLogin`），仅在 `development` 模式启用
2. 使用强随机密码环境配置，而非硬编码

**（本报告附带立即修复，详见任务 3）**

### 🔴 P0：问题 7.2 — 权限控制缺失

**位置**：[auth.guard.ts](file:///g:/OpenMTSciEd/admin-web/src/app/core/guards/auth.guard.ts)

```typescript
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;   // ← 只要有 token 就行，不检查角色
  } else {
    router.navigate(['/login']);
    return false;
  }
};
```

**风险分析**：
- 所有受保护路由统一使用 `authGuard`
- 普通 `user` 角色用户和 `admin` 角色用户能访问完全相同的 admin 路由
- 侧边栏（[admin-layout.component.ts](file:///g:/OpenMTSciEd/admin-web/src/app/core/layout/admin-layout.component.ts)）菜单对所有已登录用户可见

**建议修复**：
```typescript
// guards/role.guard.ts
export const roleGuard = (allowedRoles: string[]): CanActivateFn => {
  return (route, state) => {
    const authService = inject(AuthService);
    const user = authService.currentUserSubject.getValue();
    if (user && allowedRoles.includes(user.role || '')) {
      return true;
    }
    return inject(Router).parseUrl('/dashboard');
  };
};

// 路由配置
{ path: 'admin/user-management', canActivate: [authGuard, roleGuard(['admin'])], ... }
```

### 🔴 P0：问题 7.3 — Token 存储于 localStorage

**位置**：[auth.service.ts:41](file:///g:/OpenMTSciEd/admin-web/src/app/core/services/auth.service.ts#L41)

```typescript
const token = localStorage.getItem('access_token');
// 以及
localStorage.setItem('access_token', response.access_token);
```

**风险分析**：
- localStorage 数据可通过 XSS 攻击窃取
- Angular 模板已防范大部分 XSS，但仍有 `innerHTML`、第三方库等攻击面
- token 一旦泄露，攻击者可持久化冒充用户

**建议修复**：
- **短期**：使用 `sessionStorage`（关闭标签页过期）
- **长期**：迁移至 `HttpOnly` 安全 Cookie（后端设置），前端不再存储 token
- **同时**：添加 CSP Header 减少 XSS 攻击面

### 🟠 问题 7.4 — 错误信息泄露

**位置**：[http-error.interceptor.ts:44](file:///g:/OpenMTSciEd/admin-web/src/app/core/interceptors/http-error.interceptor.ts#L44)

```typescript
case 400:
  errorMessage = error.error?.detail || '请求参数错误';
```

后端返回的 `error.detail` 可能包含数据库错误、堆栈信息等。这些信息在生产环境不应暴露给终端用户。

**建议修复**：判断 `environment.production`：
```typescript
if (!environment.production) {
  console.error('API错误详情:', error.error?.detail);
}
errorMessage = friendlyErrorMessages[error.status] || '请求失败';
```

### 🟠 问题 7.5 — 无 CSRF 防护

当前所有 POST/PUT/DELETE 请求仅依赖 `Authorization: Bearer` header，缺少 CSRF token。虽然 Bearer token 方式对 CSRF 有一定天然防护（非浏览器自动携带），但仍建议：
- 对敏感操作（删除用户、修改设置）添加附加验证（如二次确认密码）
- 在关键端点添加 `SameSite=Strict` Cookie

### 🟡 问题 7.6 — 敏感操作无确认日志

`onDeleteUser()` 删除用户后，虽然有 snackbar 提示，但前端没有记录操作日志。建议对以下操作记录审计日志：
- 删除用户
- 修改角色
- 修改系统设置
- 运行/停止爬虫

---

## 8. 改进路线图

### 第 1 周：安全紧急修复 🚨

| 任务 | 优先级 |
|------|--------|
| CM-01：删除 mockLogin 硬编码凭证 | P0 |
| CM-02：添加 roleGuard 实现 RBAC 控制 | P0 |
| CM-03：迁移 localStorage → sessionStorage | P0 |
| CM-04：添加环境变量控制开发模式特性 | P0 |

### 第 2-3 周：功能补全 📦

| 任务 | 优先级 |
|------|--------|
| FT-01：实现用户编辑/更新 API 对接 | P1 |
| FT-02：实现课程 CRUD 完整流程 | P1 |
| FT-03：实现教程 CRUD 完整流程 | P1 |
| FT-04：实现课件 CRUD 完整流程 | P1 |
| FT-05：爬虫运行/停止/日志 API 对接 | P1 |
| FT-06：替代 confirm() 为 MatDialog 确认框 | P1 |
| FT-07：批量导入下载示例/报告功能 | P1 |
| FT-08：移除 mock 数据，对接真实 API | P1 |

### 第 4 周：架构重构 🏗️

| 任务 | 优先级 |
|------|--------|
| AR-01：抽取所有 HttpClient 调用到 Service | P2 |
| AR-02：创建共享 utils（formatDate/role/utils） | P1 |
| AR-03：拆分巨型组件为子组件 | P2 |
| AR-04：统一 OnPush 变更检测策略 | P2 |
| AR-05：修复 knowledge-graph 内存泄漏 | P2 |
| AR-06：引入 environment.ts 管理 API 路径 | P2 |

### 第 5+ 周：体验优化 🎨

| 任务 | 优先级 |
|------|--------|
| UX-01：替换 CDN ECharts 为 npm 包，添加类型定义 | P3 |
| UX-02：替换硬编码颜色为 Material Theme CSS 变量 | P3 |
| UX-03：添加移动端卡片式布局替代表格水平滚动 | P3 |
| UX-04：添加 Skeleton 骨架屏加载效果 | P3 |
| UX-05：未实现功能按钮 disable + tooltip | P2 |
| UX-06：添加请求缓存/乐观更新 | P3 |
| UX-07：补充单元测试（Jasmine/Karma） | P2 |
| UX-08：迁移到函数式 HTTP Interceptor | P3 |

---

## 9. 最佳实践建议清单

以下是针对当前代码库的具体最佳实践建议：

| # | 建议 | 涉及文件 |
|---|------|----------|
| 1 | **使用 `environment.ts` 管理 API Base URL**，避免 `/api/v1` 散落 30+ 处 | 所有组件 |
| 2 | **创建 Services 目录**（crawler.service.ts / course.service.ts 等），遵循单一职责 | 9 个组件 |
| 3 | **共享工具函数**：抽取 formatDate、roleMap、subjectMap 到 utils/ 目录 | user-management, crawlers, courses |
| 4 | **使用 `trackBy` 优化表格性能**：`*matRowDef` 应绑定 trackBy 函数 | 所有表格组件 |
| 5 | **统一 OnPush 策略**：所有组件启用 `changeDetection: ChangeDetectionStrategy.OnPush` | 8 个组件 |
| 6 | **统一错误处理形式**：通过 Interceptor 处理，组件内不重复调用 snackBar.open | 所有组件 |
| 7 | **替代 confirm()**：使用 `MatDialog` 封装的 ConfirmDialogComponent | 4 个组件 7 处 |
| 8 | **功能按钮禁用**：未完成功能 `[disabled]="true"` + `matTooltip` | 所有管理组件 |
| 9 | **严格类型**：所有 API 响应使用接口（UserStats、CrawlerTask 等），禁止 `any` | 所有组件 |
| 10 | **单元测试**：添加 Jasmine 测试覆盖核心 Service 和 Guard | 全项目 |
| 11 | **路由守卫增强**：添加 roleGuard 替换简单的 authGuard | auth.guard.ts + app.routes.ts |
| 12 | **内存泄漏检查**：组件销毁时移除 event listener / 取消订阅 | knowledge-graph-admin |
| 13 | **ECharts 通过 npm 安装**：`npm install echarts` + `import * as echarts from 'echarts'` | index.html |
| 14 | **错误信息分层**：开发环境显示 detail，生产环境显示友好消息 | http-error.interceptor.ts |
| 15 | **添加 CSP Header**：在 vercel.json 配置 `Content-Security-Policy` | vercel.json |

---

## 10. 附录

### A：API 端点一览（按组件分类）

| 模块 | API 端点 | HTTP 方法 | 使用组件 |
|------|----------|-----------|----------|
| 认证 | `/api/v1/auth/login` | POST | LoginComponent |
| 认证 | `/api/v1/auth/register` | POST | RegisterComponent |
| 认证 | `/api/v1/auth/me` | GET | AuthService |
| 用户 | `/api/v1/users` | GET | AdminUserManagementComponent |
| 用户 | `/api/v1/users/stats` | GET | DashboardComponent / AdminUserManagementComponent |
| 用户 | `/api/v1/users/:id` | GET/DELETE | UserDetailDialog / AdminUserManagement |
| 用户 | `/api/v1/auth/bulk-import` | POST | BulkImportDialogComponent |
| 课程 | `/api/v1/admin/courses` | GET | AdminCoursesComponent |
| 课程 | `/api/v1/admin/courses/stats` | GET | DashboardComponent |
| 教程 | `/api/v1/libraries/tutorials` | GET | AdminTutorialsComponent |
| 课件 | `/api/v1/libraries/materials` | GET | AdminMaterialsComponent |
| 爬虫 | `/api/v1/admin/crawler` | GET/POST/DELETE | AdminCrawlersComponent |
| 爬虫 | `/api/v1/admin/crawler/:id/run` | POST | AdminCrawlersComponent |
| 爬虫 | `/api/v1/admin/crawler/:id/schedule` | POST | AdminCrawlersComponent |
| 教育平台 | `/api/v1/admin/education-platforms` | GET | AdminEducationPlatformsComponent |
| 教育平台 | `/api/v1/admin/education-platforms/status` | GET | DashboardComponent |
| 教育平台 | `/api/v1/education-platforms/generate` | POST | AdminEducationPlatformsComponent |
| 知识图谱 | `/api/v1/admin/graph/overview` | GET | KnowledgeGraphAdminComponent |
| 资源关联 | `/api/v1/resources/associations` | GET/POST | ResourceAssociationsComponent |
| 资源关联 | `/api/v1/resources/associations/stats` | GET | ResourceAssociationsComponent |
| 资源关联 | `/api/v1/resources/associations/:id` | DELETE | ResourceAssociationsComponent |
| 题库 | `/api/v1/questions/banks` | GET/POST | AdminQuestionBankComponent |
| 题库 | `/api/v1/questions/banks/:id` | PUT/DELETE | AdminQuestionBankComponent |
| 设置 | `/api/v1/admin/settings` | GET/POST | AdminSettingsComponent |

### B：与 backend-next 的集成状态

| 集成级别 | 说明 | 模块 |
|----------|------|------|
| ✅ 真实对接 | 已有 Service 层，API 路径匹配 | 认证、用户管理、题库、资源关联 |
| ⚠️ 部分对接 | 组件直接使用 HttpClient，API 存在但未充分使用 | 课程、爬虫、教育平台、设置、知识图谱 |
| ❌ 未对接 | 仅 UI、无 API 调用 | 课件 CRUD、教程 CRUD、个人资料更新 |

---

*审计报告结束。生成工具：Qoder Code Review*  
*报告日期：2026-06-19*
