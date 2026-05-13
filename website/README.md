# OpenMTSciEd Website

静态HTML网站 - STEM教育资源平台前端

## 📁 目录结构

```
website/
├── index.html              # 营销首页
├── developer.html          # 开发者门户
├── dashboard.html          # 学习仪表盘
├── profile.html            # 个人中心
├── test-auth.html          # 认证测试页面
├── css/                    # 样式文件
│   ├── navbar.css         # 统一导航栏样式
│   └── ...
├── js/                     # JavaScript文件
│   ├── api-config.js      # API配置
│   ├── navbar.js          # 导航栏组件
│   └── auth.js            # 认证逻辑
├── components/             # HTML组件
│   └── navbar.html        # 导航栏模板
├── docs/                   # 文档页面
│   ├── feature-ai-path.html
│   ├── feature-hardware.html
│   ├── feature-knowledge-graph.html
│   └── feature-learning-path.html
└── vercel.json            # Vercel部署配置
```

## 🚀 本地开发

### 方法1: Python静态服务器
```bash
cd website
python -m http.server 8080
# 访问: http://localhost:8080
```

### 方法2: Node.js静态服务器
```bash
cd website
npx serve .
# 访问: http://localhost:3000
```

### 方法3: VS Code Live Server
1. 安装 "Live Server" 扩展
2. 右键 `index.html` → "Open with Live Server"

## 🔧 API配置

编辑 `js/api-config.js`:

```javascript
const API_CONFIG = {
    // 开发环境
    development: {
        baseUrl: 'http://localhost:3000',  // backend-next API地址
        timeout: 5000
    },
    // 生产环境
    production: {
        baseUrl: '',  // 使用相对路径(同域名)
        timeout: 10000
    }
};
```

**注意**: 确保backend-next服务运行在对应端口

## 📄 核心页面

### 1. 首页 (index.html)
- 项目介绍和特性展示
- 学习路径预览
- 硬件项目展示
- CTA按钮引导

### 2. 开发者门户 (developer.html)
- **概览Tab**: 平台介绍和快速开始
- **教程资源Tab**: 浏览STEM教程(API加载)
- **硬件项目Tab**: Arduino/机器人项目(API加载)
- **API文档Tab**: RESTful API参考

### 3. 学习仪表盘 (dashboard.html)
- 用户学习进度
- 推荐课程
- 成就系统

### 4. 个人中心 (profile.html)
- 用户信息管理
- 学习统计
- 设置选项

## 🎨 统一导航组件

所有页面共享统一的导航栏:

**引入方式**:
```html
<!-- 在<head>中 -->
<link rel="stylesheet" href="css/navbar.css">

<!-- 在<body>开始处 -->
<nav class="navbar" id="navbar">
    <!-- 导航内容或include components/navbar.html -->
</nav>

<!-- 在</body>前 -->
<script src="js/navbar.js"></script>
```

**功能**:
- ✅ 响应式设计(移动端汉堡菜单)
- ✅ 滚动时固定顶部
- ✅ 用户登录状态管理
- ✅ 开发者入口按钮
- ✅ 深色主题

## 🔐 用户认证

使用Supabase Auth进行用户管理:

```javascript
// 登录
await handleLogin();

// 快速体验(模拟登录)
await mockLogin();

// 退出
await handleLogout();

// 检查登录状态
const user = await getCurrentUser();
```

详见: [AUTH_USAGE.md](docs/AUTH_USAGE.md)

## 🌐 部署到Vercel

### 步骤1: 创建Vercel项目
```bash
cd website
vercel
```

### 步骤2: 配置vercel.json
已包含 `vercel.json`,配置为纯静态托管:
```json
{
  "builds": [
    {
      "src": "**/*.html",
      "use": "@vercel/static"
    }
  ]
}
```

### 步骤3: 设置环境变量(可选)
如果需要调用API,添加:
```bash
NEXT_PUBLIC_API_URL=https://your-api.vercel.app
```

### 步骤4: 自定义域名(可选)
在Vercel控制台绑定域名

## 🔗 API集成

### 获取教程列表
```javascript
const response = await fetch('http://localhost:3000/api/v1/tutorials?page=1&size=12');
const data = await response.json();
console.log(data.items);
```

### 获取硬件项目
```javascript
const response = await fetch('http://localhost:3000/api/v1/hardware-projects?difficulty=beginner');
const data = await response.json();
```

完整API文档见: [backend-next/API_DOCUMENTATION.md](../backend-next/API_DOCUMENTATION.md)

## 📱 响应式设计

支持多种设备:
- 🖥️ 桌面端: 完整导航和功能
- 📱 平板: 自适应布局
- 📲 手机: 汉堡菜单 + 垂直布局

断点:
- Desktop: > 1024px
- Tablet: 768px - 1024px
- Mobile: < 768px

## 🎯 浏览器兼容性

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

## 🛠️ 开发规范

### CSS命名
使用BEM命名规范:
```css
.navbar              /* Block */
.navbar__link        /* Element */
.navbar--scrolled    /* Modifier */
```

### JavaScript
- 使用ES6+语法
- 异步操作使用async/await
- 错误处理使用try/catch

### HTML
- 语义化标签
- ARIA无障碍属性
- 中文注释

## 📊 性能优化

- ✅ 图片懒加载
- ✅ CSS压缩
- ✅ JavaScript按需加载
- ✅ 浏览器缓存策略
- ✅ CDN加速(生产环境)

## 🐛 常见问题

### Q: API请求失败?
A: 检查backend-next服务是否运行,端口是否正确

### Q: 导航栏不显示?
A: 确认引入了`css/navbar.css`和`js/navbar.js`

### Q: 移动端菜单无法展开?
A: 检查`js/navbar.js`是否正确加载

### Q: 样式错乱?
A: 清除浏览器缓存(Ctrl+Shift+R)

## 📝 更新日志

### v2.0.0 (2026-05-13)
- ✅ 整合开发者门户(developer.html)
- ✅ 统一导航组件系统
- ✅ 前后端分离架构
- ✅ 优化API配置管理

### v1.0.0 (2026-05-01)
- ✅ 初始版本
- ✅ 基础页面结构
- ✅ 响应式设计

## 🤝 贡献指南

欢迎提交PR改进网站!

1. Fork仓库
2. 创建特性分支
3. 提交更改
4. 开启Pull Request

## 📞 联系方式

- GitHub Issues: https://github.com/MatuX-ai/OpenMtSciED/issues
- 邮箱: contact@openmtscied.org

---

**Made with ❤️ for STEM Education**
