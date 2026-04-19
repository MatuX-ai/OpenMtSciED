# OpenMTSciEd Web 前端开发计划

## 项目定位

Web 端仅负责：**极简营销展示 + 用户注册/登录 + 桌面端下载引导**。
核心业务功能（知识图谱、路径生成、硬件编程）全部在桌面端（Tauri）完成。

---

## 技术栈

- **框架**: Angular 17+ (Standalone Components)
- **构建工具**: Vite
- **样式**: 组件内联样式（保持 STEM 暗色风格）
- **后端 API**: FastAPI (`http://localhost:8000/api/v1/auth`)

---

## 阶段一：认证系统

### 1.1 创建 Auth Service ✅
- **文件**: `frontend/src/app/shared/auth.service.ts`
- **功能**:
  - 用户登录（POST `/auth/token`）
  - 用户注册（POST `/auth/register`）
  - 获取当前用户信息（GET `/auth/me`）
  - Token 存储与读取（localStorage）
  - 用户状态流（currentUser$）
- **状态**: 已完成

### 1.2 创建登录页面
- **文件**: `frontend/src/app/auth/login/login.component.ts`
- **功能**:
  - 用户名/密码表单
  - 登录按钮与加载状态
  - 错误提示（用户名或密码错误）
  - 跳转到注册页链接
  - 登录成功后跳转到下载页
- **样式**: STEM 风格暗色主题
- **状态**: 待开发

### 1.3 创建注册页面
- **文件**: `frontend/src/app/auth/register/register.component.ts`
- **功能**:
  - 用户名/邮箱/密码表单
  - 密码确认输入
  - 表单验证（必填、邮箱格式、密码长度≥8、两次密码一致）
  - 注册按钮与加载状态
  - 错误提示（用户名已存在、邮箱已注册等）
  - 跳转到登录页链接
  - 注册成功后跳转到登录页
- **样式**: STEM 风格暗色主题
- **状态**: 待开发

### 1.4 创建个人资料页面
- **文件**: `frontend/src/app/auth/profile/profile.component.ts`
- **功能**:
  - 显示用户信息（用户名、邮箱、角色、账户状态）
  - 修改密码功能
  - 退出登录按钮
  - 返回营销首页链接
- **路由保护**: 需要登录才能访问（Auth Guard）
- **样式**: STEM 风格暗色主题
- **状态**: 待开发

### 1.5 更新导航栏
- **文件**: `frontend/src/app/shared/marketing-nav/marketing-nav.component.ts`
- **功能**:
  - 未登录状态：显示"登录"、"注册"按钮
  - 已登录状态：显示用户名、"个人资料"、"退出"按钮
  - 订阅 `AuthService.currentUser$` 实时更新状态
- **状态**: 待开发

### 1.6 更新路由配置
- **文件**: `frontend/src/app/app.routes.ts`
- **新增路由**:
  ```typescript
  { path: 'auth/login', component: LoginComponent },
  { path: 'auth/register', component: RegisterComponent },
  { path: 'auth/profile', component: ProfileComponent, canActivate: [AuthGuard] },
  ```
- **状态**: 待开发

### 1.7 创建 Auth Guard（路由守卫）
- **文件**: `frontend/src/app/shared/auth.guard.ts`
- **功能**:
  - 实现 `CanActivate` 接口
  - 检查用户是否已登录（`AuthService.isAuthenticated()`）
  - 未登录重定向到 `/auth/login`
  - 已登录允许访问
- **状态**: 待开发

---

## 阶段二：下载引导页

### 2.1 创建下载页面
- **文件**: `frontend/src/app/download/download.component.ts`
- **功能**:
  - 桌面端功能介绍（知识图谱、AI 导师、硬件编程、AR/VR 实验室等）
  - 系统自动检测（Windows/macOS/Linux）
  - 下载按钮（Windows `.exe`、macOS `.dmg`、Linux `.AppImage`）
  - 安装说明步骤
  - 系统要求说明
- **样式**: STEM 风格暗色主题，卡片式布局
- **状态**: 待开发

### 2.2 添加下载路由
- **文件**: `frontend/src/app/app.routes.ts`
- **新增路由**:
  ```typescript
  { path: 'download', component: DownloadComponent },
  ```
- **状态**: 待开发

### 2.3 导航栏添加入口
- **文件**: `frontend/src/app/shared/marketing-nav/marketing-nav.component.ts`
- **功能**:
  - 在导航栏添加"下载桌面端"按钮
  - 链接到 `/download`
- **状态**: 待开发

---

## 阶段三：首页优化

### 3.1 修改首页 CTA 按钮
- **文件**: `frontend/src/app/marketing-home/marketing-home.component.ts`
- **功能**:
  - 未登录：点击"快速开始"跳转到 `/auth/register`
  - 已登录：点击"快速开始"跳转到 `/download`
  - 订阅 `AuthService.currentUser$` 动态切换行为
- **状态**: 待开发

### 3.2 添加用户状态提示
- **文件**: `frontend/src/app/marketing-home/marketing-home.component.ts`
- **功能**:
  - 在 Hero 区域右上角显示"欢迎，{用户名}"
  - 已登录用户显示"进入下载页"快捷按钮
- **状态**: 待开发

---

## 阶段四：配置与优化

### 4.1 配置 HttpClient
- **文件**: `frontend/src/app/app.config.ts`
- **功能**:
  - 确保 `provideHttpClient()` 已添加
  - 配置全局 HTTP 拦截器（自动添加 Authorization header）
- **状态**: 待开发

### 4.2 配置 CORS
- **文件**: `src/main.py`（后端）
- **功能**:
  - 确认 `http://localhost:5173` 在 CORS 允许列表中
  - 生产环境添加实际域名
- **状态**: 待确认

### 4.3 环境变量配置
- **文件**: 
  - `frontend/src/environments/environment.ts`（开发环境）
  - `frontend/src/environments/environment.prod.ts`（生产环境）
- **功能**:
  - 配置 `API_BASE_URL`
  - 开发环境：`http://localhost:8000/api/v1`
  - 生产环境：实际后端域名
- **状态**: 待开发

### 4.4 样式统一
- **功能**:
  - 确保所有新页面使用与营销页一致的 STEM 风格
  - 暗色主题（`#0f172a` 背景）
  - 渐变色按钮（`#6366f1` → `#8b5cf6`）
  - STEM 四色系统（科学绿、技术蓝、工程黄、数学红）
- **状态**: 待实施

---

## 阶段五：测试与部署准备

### 5.1 功能测试
- **测试项**:
  - [ ] 用户注册流程（正常、重复用户名、无效邮箱、弱密码）
  - [ ] 用户登录流程（正常、错误密码、禁用账户）
  - [ ] Token 持久化（刷新页面后保持登录状态）
  - [ ] 路由守卫（未登录访问 `/auth/profile` 重定向）
  - [ ] 退出登录（清除 token、重定向到首页）
  - [ ] 响应式设计（手机、平板、桌面）
  - [ ] 跨浏览器兼容（Chrome、Edge、Firefox）
- **状态**: 待测试

### 5.2 构建配置
- **文件**: `frontend/package.json`
- **功能**:
  - 确保 `npm run build` 能成功生成静态文件
  - 检查 `dist/` 目录结构
  - 配置 Vercel/Netlify 部署脚本
- **状态**: 待实施

---

## 文件结构

```
frontend/src/app/
├── auth/
│   ├── login/
│   │   └── login.component.ts          # 登录页面
│   ├── register/
│   │   └── register.component.ts       # 注册页面
│   └── profile/
│       └── profile.component.ts        # 个人资料页面
├── download/
│   └── download.component.ts           # 下载引导页
├── marketing-home/
│   └── marketing-home.component.ts     # 营销首页（优化）
├── shared/
│   ├── marketing-nav/
│   │   └── marketing-nav.component.ts  # 导航栏（更新）
│   ├── auth.service.ts                 # 认证服务 ✅
│   └── auth.guard.ts                   # 路由守卫
└── app.routes.ts                       # 路由配置（更新）
```

---

## 开发规范

### 代码风格
- 使用 Angular 17+ 独立组件（Standalone Components）
- 使用 TypeScript 严格模式
- 组件模板使用内联 template（保持与营销页一致）
- 样式使用内联 styles（STEM 暗色主题）

### API 调用规范
- 所有 API 调用通过 `AuthService` 统一管理
- 错误处理使用 `subscribe({ error: ... })`
- 成功/加载状态使用组件内部变量管理

### 样式规范
- 主背景色：`#0f172a`
- 卡片背景：`#1e293b`
- 主文字色：`#f8fafc`
- 次要文字：`#94a3b8`
- 主色调：`#6366f1` → `#8b5cf6`（渐变）
- STEM 四色：
  - 科学（Science）：`#10b981`
  - 技术（Tech）：`#3b82f6`
  - 工程（Engineering）：`#f59e0b`
  - 数学（Math）：`#ef4444`

---

## 执行顺序

```
阶段一：认证系统（1.1 → 1.7）
    ↓
阶段二：下载引导页（2.1 → 2.3）
    ↓
阶段三：首页优化（3.1 → 3.2）
    ↓
阶段四：配置与优化（4.1 → 4.4）
    ↓
阶段五：测试与部署准备（5.1 → 5.2）
```

---

## 当前进度

- ✅ 1.1 Auth Service 已创建
- ⏳ 1.2 登录页面（下一步）
- ⬜ 其他任务待开发

---

## 备注

- 后端 API 端点参考：`src/routes/auth_routes.py`
- 登录接口：`POST /api/v1/auth/token`（FormData）
- 注册接口：`POST /api/v1/auth/register`（JSON）
- 用户信息接口：`GET /api/v1/auth/me`（需要 Bearer Token）
- 开发环境许可证检查已禁用（`DEBUG=True`）

---

**文档创建时间**: 2026-04-13  
**最后更新**: 2026-04-13  
**版本**: v1.0
