# OpenMTSciEd 开源部署指南

## 📦 仓库规划

### 1. 主代码仓库（OpenMTSciEd）
**用途**: 核心功能代码、后端 API、前端应用  
**地址**: https://github.com/MatuX-ai/OpenMtSciED  
**可见性**: Public（公开）  
**许可证**: MIT License

**包含内容**:
```
OpenMTSciEd/
├── backend/              # FastAPI 后端
├── frontend/             # Angular 前端
├── docs/                 # 技术文档
├── .github/              # GitHub 配置
├── README.md
├── LICENSE
├── CONTRIBUTING.md
└── ...
```

### 2. 营销展示站仓库（OpenMTSciEd-Website）
**用途**: Vercel 自动部署的静态营销页面  
**地址**: https://github.com/MatuX-ai/OpenMtSciED  
**可见性**: Public（公开）  
**部署平台**: Vercel

**包含内容**:
```
website/
├── index.html                          # 营销主页
├── docs/
│   ├── feature-knowledge-graph.html    # 知识图谱
│   ├── feature-ai-path.html            # AI 路径
│   ├── feature-hardware.html           # 硬件联动
│   └── feature-learning-path.html      # 学习路径
├── vercel.json                         # Vercel 配置
├── .gitignore
└── README.md
```

---

## 🚀 部署步骤

### 第1步：推送主代码仓库到 GitHub

```bash
cd g:\iMato\OpenMTSciEd

# 初始化 Git（如果还没有）
git init

# 添加远程仓库（替换为你的仓库地址）
git remote add origin https://github.com/MatuX-ai/OpenMtSciED.git

# 添加所有文件
git add .

# 提交
git commit -m "Initial commit: OpenMTSciEd v0.1.0 Alpha"

# 推送到 GitHub
git push -u origin main
```

### 第2步：创建营销页面仓库并部署到 Vercel

#### 2.1 推送营销页面仓库

```bash
cd g:\iMato\OpenMTSciEd\website

# 初始化 Git
git init

# 添加远程仓库
git remote add origin https://github.com/MatuX-ai/OpenMtSciED.git

# 添加文件
git add .

# 提交
git commit -m "Initial commit: Marketing website for Vercel deployment"

# 推送
git push -u origin main
```

#### 2.2 在 Vercel 上部署

1. 访问 [https://vercel.com](https://vercel.com) 并登录
2. 点击 **"Add New Project"**
3. 选择 **"Import Git Repository"**
4. 选择 `OpenMTSciEd-Website` 仓库
5. 保持默认配置（Vercel 会自动识别 `vercel.json`）
6. 点击 **"Deploy"**

部署完成后，Vercel 会提供一个域名，例如：
- `https://openmtscied-website.vercel.app`

你可以自定义域名为 `https://openmtscied.vercel.app`

---

## 🔗 仓库关联

在主项目 README 中添加营销网站链接：

```markdown
## 🌐 在线演示

- **营销展示站**: https://openmtscied.vercel.app
- **API 文档**: https://api.openmtscied.example.com/docs
```

在营销网站 README 中添加主项目链接：

```markdown
## 🔗 相关链接

- **主项目仓库**: https://github.com/MatuX-ai/OpenMtSciED
- **GitHub Issues**: https://github.com/MatuX-ai/OpenMtSciED/issues
```

---

## 📋 开源前检查清单

### 主代码仓库
- [x] LICENSE 文件（MIT）
- [x] README.md 完整
- [x] CONTRIBUTING.md 贡献指南
- [x] CODE_OF_CONDUCT.md 行为准则
- [x] SECURITY.md 安全政策
- [x] .gitignore 配置
- [ ] 移除所有硬编码密码/密钥
- [ ] 检查 `.env.example` 提供示例配置
- [ ] 更新 CHANGELOG.md
- [ ] 创建 GitHub Release（v0.1.0）

### 营销页面仓库
- [x] 静态 HTML 文件
- [x] vercel.json 配置
- [x] .gitignore
- [x] README.md
- [ ] 测试所有链接可访问
- [ ] 验证响应式设计

---

## 🎯 后续优化建议

### 1. GitHub Pages 备选方案
如果不想用 Vercel，可以使用 GitHub Pages：

```yaml
# .github/workflows/deploy.yml
name: Deploy to GitHub Pages
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: .
```

### 2. 自定义域名
在 Vercel 中绑定自定义域名：
1. 进入项目设置 → Domains
2. 添加你的域名（如 `openmtscied.org`）
3. 按照提示配置 DNS 记录

### 3. CI/CD 自动化
为主项目添加 GitHub Actions：
- 自动运行测试
- 自动构建 Docker 镜像
- 自动生成文档

---

## ❓ 常见问题

### Q: 为什么需要两个仓库？
**A**: 
- 主代码仓库包含完整的开发环境（后端+前端），适合开发者贡献代码
- 营销页面仓库是纯静态文件，便于 Vercel 快速部署和 CDN 加速

### Q: 可以合并成一个仓库吗？
**A**: 可以，但需要：
- 使用 monorepo 结构
- Vercel 配置指向 `website/` 目录
- 增加构建复杂度

### Q: Vercel 免费额度够吗？
**A**: Vercel Hobby 计划完全够用：
- 无限个人项目
- 100GB 带宽/月
- 自动 HTTPS
- 全球 CDN

---

## 📞 需要帮助？

- 提交 Issue: https://github.com/MatuX-ai/OpenMtSciED/issues
- 邮件联系: 3936318150@qq.com

---

**最后更新**: 2026-04-10
