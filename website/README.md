# OpenMTSciEd 营销展示站

> 用开源 AI 打通 STEM 学段壁垒，全球共建"STEM 知识地图"

## 🌐 在线访问

[https://openmtscied.vercel.app](https://openmtscied.vercel.app) *(待部署)*

## 📁 项目结构

```
.
├── index.html              # 营销主页
├── test-navbar.html        # 导航组件测试页面
├── css/
│   └── navbar.css          # 统一导航组件样式
├── js/
│   └── navbar.js           # 统一导航组件功能
├── components/
│   └── navbar.html         # 导航 HTML 模板
├── docs/
│   ├── feature-knowledge-graph.html    # 知识图谱驱动
│   ├── feature-ai-path.html            # AI 自适应路径
│   ├── feature-hardware.html           # 低成本硬件联动
│   ├── feature-learning-path.html      # 连贯学习路径
│   ├── NAVBAR_USAGE.md                 # 导航组件使用指南
│   └── NAVBAR_IMPLEMENTATION_REPORT.md # 导航组件实施报告
├── logo.png                # Logo 图片
├── favicon.png             # 网站图标
├── apple-touch-icon.png    # iOS 应用图标
└── README.md
```

## 🚀 本地开发

直接双击 `index.html` 即可在浏览器中查看，或使用任意静态服务器：

```bash
# Python
python -m http.server 8080

# Node.js
npx serve .
```

### 🧪 测试导航组件

访问 `test-navbar.html` 测试统一导航组件的所有功能：

```bash
# 启动服务器后访问
http://localhost:8080/test-navbar.html
```

## 📦 部署到 Vercel

1. Fork 或克隆此仓库
2. 在 [Vercel](https://vercel.com) 导入仓库
3. 自动部署，无需配置

## 🎨 统一导航组件

本项目使用统一的导航组件系统，确保所有页面具有一致的外观和交互体验。

### 特性
- ✅ 响应式设计（桌面端 + 移动端）
- ✅ 滚动效果（背景变化、阴影）
- ✅ 活动链接自动高亮
- ✅ 平滑滚动到锚点
- ✅ 移动端汉堡菜单
- ✅ 悬停动画效果
- ✅ **用户登录控件**（新增）
  - 登录/登出功能
  - 用户信息显示（头像 + 名称）
  - 下拉菜单（个人中心、学习仪表盘、退出登录）
  - localStorage 状态管理
  - 响应式设计

### 使用方法
详细使用说明请参考：
- 📖 [导航组件使用指南](docs/NAVBAR_USAGE.md)
- 🔐 [用户登录控件指南](docs/AUTH_USAGE.md)
- 📊 [实施报告](docs/NAVBAR_IMPLEMENTATION_REPORT.md)
- 🔧 [HTML 模板](components/navbar.html)

## 🔗 相关链接

- **主项目仓库**: https://github.com/MatuX-ai/OpenMtSciED
- **GitHub Issues**: https://github.com/MatuX-ai/OpenMtSciED/issues
- **文档**: https://github.com/MatuX-ai/OpenMtSciED/blob/main/README.md

## 📄 许可证

MIT License - 详见 [LICENSE](../LICENSE)

---

**OpenMTSciEd** - Open MatuX Science Education  
用开源技术解决教育资源不均
