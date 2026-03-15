# Maco Theme - Mac 风格简约 Ghost 主题

一个受 Apple 设计美学启发的现代 Ghost CMS 主题，追求极简主义、优雅和用户体验的完美结合。

## ✨ 特性

- 🍎 **Apple 设计风格** - 简约、现代、优雅的设计语言
- 📱 **完全响应式** - 在所有设备上完美运行
- 🎨 **设计系统** - 完整的 Design Token 系统
- 🌗 **深色模式支持** - 自动适配系统主题
- ⚡ **性能优化** - 懒加载、代码分割
- 🔍 **SEO 友好** - 完整的 meta 标签和结构化数据
- ♿ **无障碍访问** - 符合 WCAG 2.1 标准
- 📝 **营销页面支持** - 内置落地页组件

## 🎯 设计原则

1. **简约至上** - 少即是多，专注于内容本身
2. **清晰易读** - 优化的排版和阅读体验
3. **流畅交互** - 细腻的动画和过渡效果
4. **一致性** - 统一的设计语言和组件系统

## 📦 安装

### 方法 1: Ghost Admin (推荐)

1. 下载主题文件夹 `maco`
2. 压缩为 ZIP 文件
3. 在 Ghost Admin → Settings → Theme → Install theme 上传
4. 激活主题

### 方法 2: 手动安装

```bash
# 将主题文件夹复制到 Ghost 主题目录
cp -r maco /path/to/ghost/content/themes/

# 重启 Ghost
ghost restart
```

## 🎨 自定义

在 Ghost Admin → Settings → Theme 中可以自定义：

### 头部样式
- Header Style: Light / Dark / Transparent

### Hero 区域
- Show Hero: 启用/禁用
- Hero Title: 主标题
- Hero Subtitle: 副标题
- Hero CTA: 主要按钮
- Hero Secondary CTA: 次要按钮

### 功能开关
- Show Featured Posts: 显示精选文章
- Enable Search: 启用搜索功能
- Accent Color: 强调色

## 📁 文件结构

```
maco/
├── assets/
│   ├── css/
│   │   └── global.css      # 全局样式和设计系统
│   ├── js/
│   │   └── main.js         # JavaScript 交互
│   └── images/             # 图片资源
├── partials/
│   ├── navbar.hbs          # 导航栏
│   ├── footer.hbs          # 页脚
│   ├── post-card.hbs       # 文章卡片
│   └── pagination.hbs      # 分页
├── default.hbs             # 基础布局
├── index.hbs               # 首页
├── post.hbs                # 文章页
├── page.hbs                # 页面
├── tag.hbs                 # 标签页
├── author.hbs              # 作者页
├── error.hbs               # 404 页面
└── package.json            # 主题配置

```

## 🎯 使用示例

### 营销落地页

在 Page 中使用预定义的 CSS 类：

```html
<!-- 特性网格 -->
<div class="feature-grid">
  <div class="feature-card">
    <h4>Feature Title</h4>
    <p>Description here</p>
  </div>
</div>

<!-- 价格表 -->
<div class="pricing-table">
  <div class="pricing-card">
    <div class="pricing-name">Pro</div>
    <div class="pricing-price">$99</div>
    <ul class="pricing-features">
      <li>Feature 1</li>
      <li>Feature 2</li>
    </ul>
  </div>
</div>

<!-- CTA 区块 -->
<div class="cta-section">
  <h2 class="cta-title">Ready to Start?</h2>
  <div class="cta-actions">
    <a href="#" class="btn btn-primary">Get Started</a>
  </div>
</div>
```

## 🌈 Design Tokens

主题使用 CSS 变量实现完整的设计系统：

```css
/* 品牌色 */
--color-primary: #007AFF;     /* Apple Blue */
--color-success: #34C759;     /* Green */
--color-warning: #FF9500;     /* Orange */
--color-error: #FF3B30;       /* Red */

/* 中性色 */
--color-black: #1D1D1F;
--color-gray-50: #F5F5F7;
--color-white: #FFFFFF;

/* 圆角 */
--radius-sm: 6px;
--radius-md: 10px;
--radius-lg: 14px;
--radius-xl: 20px;

/* 阴影 */
--shadow-sm: 0 1px 2px rgba(0,0,0,0.04);
--shadow-md: 0 4px 12px rgba(0,0,0,0.08);
--shadow-lg: 0 8px 24px rgba(0,0,0,0.12);
```

## ⚙️ 开发

### 本地开发

```bash
# 启用 Ghost 开发模式
ghost run --dev

# 或手动重启
ghost restart
```

### 编译 CSS (可选)

如果使用 Sass：

```bash
# 安装依赖
npm install

# 编译 Sass
npm run build:css
```

## 🤝 浏览器支持

- Chrome (最新)
- Firefox (最新)
- Safari (最新)
- Edge (最新)
- Mobile Safari (iOS 12+)
- Chrome for Android (最新)

## 📝 更新日志

### v1.0.0 (2026-03-15)
- ✨ 初始版本发布
- 🎨 完整的 Mac 风格设计系统
- 📱 响应式布局
- ⚡ 性能优化
- 🌗 深色模式支持

## 📄 许可证

MIT License - 自由使用和修改

## 👨‍💻 作者

iMatu Development Team

## 🙏 致谢

灵感来自 Apple Inc. 的设计哲学

---

**Made with ❤️ and inspired by Apple**
