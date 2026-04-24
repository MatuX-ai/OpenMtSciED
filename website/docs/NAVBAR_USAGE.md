# 统一导航组件使用指南

## 概述

OpenMTSciEd 网站使用统一的导航组件，确保所有页面具有一致的外观和交互体验。

## 文件结构

```
website/
├── css/
│   └── navbar.css          # 导航样式
├── js/
│   └── navbar.js           # 导航交互功能
├── components/
│   └── navbar.html         # 导航 HTML 模板（参考）
└── docs/
    └── NAVBAR_USAGE.md     # 本文档
```

## 使用方法

### 1. 在 HTML 文件中引入必要的文件

在 `<head>` 标签中添加 CSS 文件：

```html
<head>
    <!-- 其他 head 内容 -->
    <link rel="stylesheet" href="css/navbar.css">
</head>
```

在 `</body>` 标签前添加 JavaScript 文件：

```html
<body>
    <!-- 页面内容 -->
    
    <script src="js/navbar.js"></script>
</body>
```

### 2. 添加导航 HTML 结构

在 `<body>` 标签的开始处添加导航栏：

```html
<body>
    <!-- 导航栏 -->
    <nav class="navbar" id="navbar">
        <div class="navbar-container">
            <!-- Logo -->
            <a href="index.html" class="navbar-logo">
                <img src="logo.png" alt="OpenMTSciEd Logo" class="navbar-logo-icon">
                <span>OpenMTSciEd</span>
            </a>

            <!-- 移动端菜单按钮 -->
            <button class="navbar-toggle" id="navbarToggle" aria-label="切换菜单">
                <span class="navbar-toggle-icon"></span>
                <span class="navbar-toggle-icon"></span>
                <span class="navbar-toggle-icon"></span>
            </button>

            <!-- 导航链接 -->
            <ul class="navbar-links" id="navbarLinks">
                <li><a href="index.html#features">核心特性</a></li>
                <li><a href="index.html#path">学习路径</a></li>
                <li><a href="index.html#hardware">硬件项目</a></li>
                <li><a href="index.html#community">社区</a></li>
                <li><a href="https://github.com/MatuX-ai/OpenMtSciED" target="_blank">GitHub</a></li>
            </ul>
        </div>
    </nav>

    <!-- 页面其他内容 -->
</body>
```

### 3. 调整页面内容的上边距

由于导航栏是固定定位的，需要为页面内容添加顶部边距：

```css
/* 在主样式文件中添加 */
body {
    padding-top: 80px; /* 根据导航栏高度调整 */
}

/* 或者为第一个 section 添加 */
.hero, .main-content {
    margin-top: 80px;
}
```

## 自定义导航链接

根据不同页面，可以自定义导航链接：

### 主页 (index.html)

```html
<ul class="navbar-links" id="navbarLinks">
    <li><a href="#features">核心特性</a></li>
    <li><a href="#path">学习路径</a></li>
    <li><a href="#hardware">硬件项目</a></li>
    <li><a href="#community">社区</a></li>
    <li><a href="https://github.com/MatuX-ai/OpenMtSciED" target="_blank">GitHub</a></li>
</ul>
```

### 子页面 (docs/*.html)

```html
<ul class="navbar-links" id="navbarLinks">
    <li><a href="../index.html#features">核心特性</a></li>
    <li><a href="../index.html#path">学习路径</a></li>
    <li><a href="../index.html#hardware">硬件项目</a></li>
    <li><a href="../index.html#community">社区</a></li>
    <li><a href="https://github.com/MatuX-ai/OpenMtSciED" target="_blank">GitHub</a></li>
</ul>
```

## 功能特性

### 1. 响应式设计
- 桌面端：水平导航菜单
- 移动端（≤768px）：汉堡菜单，侧滑显示

### 2. 滚动效果
- 滚动超过 50px 时，导航栏背景变深并添加阴影
- 导航栏高度略微缩小

### 3. 活动链接高亮
- 自动检测当前页面，高亮对应的导航链接
- 主页锚点链接根据滚动位置动态高亮

### 4. 平滑滚动
- 点击锚点链接时平滑滚动到目标位置
- 自动计算导航栏高度，确保目标元素不被遮挡

### 5. 移动端优化
- 点击链接后自动关闭菜单
- 打开菜单时禁止背景滚动
- 汉堡菜单动画效果

## CSS 变量

可以通过 CSS 变量自定义导航栏颜色：

```css
:root {
    --primary-color: #6366f1;      /* 主色调 */
    --accent-color: #06b6d4;       /* 强调色 */
    --text-primary: #f8fafc;       /* 主要文字颜色 */
    --text-secondary: #94a3b8;     /* 次要文字颜色 */
}
```

## 注意事项

1. **文件路径**：确保 CSS 和 JS 文件的路径正确
2. **Logo 图片**：确保 `logo.png` 文件存在且路径正确
3. **z-index**：导航栏使用 z-index: 1000，确保其他元素的 z-index 不超过此值
4. **ID 唯一性**：确保 `navbar`、`navbarToggle`、`navbarLinks` 等 ID 在页面中唯一

## 故障排除

### 导航栏不显示
- 检查 CSS 文件是否正确引入
- 检查浏览器控制台是否有错误

### 移动端菜单不工作
- 检查 JavaScript 文件是否正确引入
- 确认 ID 名称与 JavaScript 中的一致

### 活动链接不高亮
- 检查当前页面文件名是否与链接匹配
- 确认 JavaScript 文件在 DOM 加载后执行

## 示例代码

完整的 HTML 页面示例：

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>页面标题 - OpenMTSciEd</title>
    <link rel="stylesheet" href="css/navbar.css">
    <style>
        /* 页面其他样式 */
        body {
            padding-top: 80px;
        }
    </style>
</head>
<body>
    <!-- 导航栏 -->
    <nav class="navbar" id="navbar">
        <div class="navbar-container">
            <a href="index.html" class="navbar-logo">
                <img src="logo.png" alt="OpenMTSciEd Logo" class="navbar-logo-icon">
                <span>OpenMTSciEd</span>
            </a>
            <button class="navbar-toggle" id="navbarToggle" aria-label="切换菜单">
                <span class="navbar-toggle-icon"></span>
                <span class="navbar-toggle-icon"></span>
                <span class="navbar-toggle-icon"></span>
            </button>
            <ul class="navbar-links" id="navbarLinks">
                <li><a href="index.html#features">核心特性</a></li>
                <li><a href="index.html#path">学习路径</a></li>
                <li><a href="index.html#hardware">硬件项目</a></li>
                <li><a href="index.html#community">社区</a></li>
                <li><a href="https://github.com/MatuX-ai/OpenMtSciED" target="_blank">GitHub</a></li>
            </ul>
        </div>
    </nav>

    <!-- 页面内容 -->
    <main>
        <h1>页面内容</h1>
    </main>

    <script src="js/navbar.js"></script>
</body>
</html>
```

## 更新日志

- **v1.0** (2026-04-19): 初始版本，包含基础导航功能和响应式设计
