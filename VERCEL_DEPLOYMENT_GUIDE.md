# OpenMTSciEd Vercel 部署指南

## 📦 部署内容

### 1. Web 营销首页
- **目录**: `website/`
- **类型**: 静态 HTML
- **URL**: https://openmtscied.vercel.app

### 2. Admin 管理后台
- **目录**: `admin-web/`
- **类型**: Angular 应用
- **URL**: https://openmtscied-admin.vercel.app

---

## 🚀 部署步骤

### 方式一：Vercel CLI（推荐）

#### 1. 安装 Vercel CLI
```bash
npm install -g vercel
```

#### 2. 登录 Vercel
```bash
vercel login
```

#### 3. 部署 Web 首页
```bash
cd website
vercel --prod
```

#### 4. 部署 Admin 后台
```bash
cd admin-web
vercel --prod
```

---

### 方式二：Vercel Dashboard

#### 1. 访问 https://vercel.com/dashboard

#### 2. Import Git Repository
- 选择 GitHub 仓库: `MatuX-ai/OpenMtSciED`

#### 3. 配置 Web 首页
```
Project Name: openmtscied
Root Directory: website
Framework Preset: Other
Build Command: (留空)
Output Directory: .
```

#### 4. 配置 Admin 后台
```
Project Name: openmtscied-admin
Root Directory: admin-web
Framework Preset: Angular
Build Command: ng build --configuration production
Output Directory: dist/admin-web/browser
Install Command: npm install
```

---

## ⚙️ 配置文件

### website/vercel.json
```json
{
  "buildCommand": null,
  "outputDirectory": ".",
  "devCommand": "npx serve .",
  "installCommand": null,
  "framework": null
}
```

### admin-web/vercel.json
```json
{
  "buildCommand": "ng build --configuration production",
  "outputDirectory": "dist/admin-web/browser",
  "framework": "angular",
  "installCommand": "npm install",
  "devCommand": "ng serve",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

---

## 🔧 环境变量配置

### Admin 后台需要配置 API 地址

在 Vercel Dashboard → Settings → Environment Variables 添加：

```env
API_BASE_URL=https://your-backend-url.com
```

或在代码中修改 `admin-web/src/environments/environment.prod.ts`:

```typescript
export const environment = {
  production: true,
  apiUrl: 'https://your-backend-url.com/api/v1'
};
```

---

## 🔄 自动部署

### Git Push 触发部署

Vercel 已连接 GitHub，每次 push 到 main 分支会自动触发部署：

```bash
git add .
git commit -m "update: 更新内容"
git push origin main
```

**注意**: 
- `website/` 和 `admin-web/` 需要分别创建 Vercel 项目
- 或者使用 monorepo 配置（高级）

---

## 📊 部署后验证

### 1. 检查构建日志
访问 Vercel Dashboard 查看部署状态

### 2. 访问网站
- Web 首页: https://openmtscied.vercel.app
- Admin 后台: https://openmtscied-admin.vercel.app

### 3. 测试功能
- 页面加载正常
- 路由跳转正常
- API 调用正常（如已配置后端）

---

## ⚠️ 常见问题

### Q1: Angular 构建失败？
**A**: 检查 Node.js 版本，建议使用 18+
```bash
node --version  # 应 >= 18
```

### Q2: 路由 404 错误？
**A**: vercel.json 中已配置 rewrites，确保配置正确

### Q3: 构建超时？
**A**: Angular 构建较慢，Vercel 免费层限制 60 秒
- 优化: 减少依赖包大小
- 或升级到 Pro 计划

### Q4: 如何自定义域名？
**A**: Vercel Dashboard → Settings → Domains → Add Domain

---

## 💰 成本

### Vercel Hobby Plan（免费）
- ✅ 无限个人项目
- ✅ 自动 HTTPS
- ✅ 全球 CDN
- ✅ 每月 100GB 带宽
- ✅ 自动部署

**完全免费！** 🎉

---

## 🎯 下一步

### 桌面端打包
```bash
cd desktop-manager
npm run tauri build
```

生成安装包后：
1. 上传到 GitHub Releases
2. 或分享给用户直接安装

---

## 📞 支持

- Vercel 文档: https://vercel.com/docs
- Angular 部署: https://angular.io/guide/deployment

---

*最后更新: 2026-04-25*
