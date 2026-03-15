# iMatuProject 样式系统快速入门指南

## 🚀 5分钟快速上手

### 1. 环境准备

```bash
# 克隆项目
git clone https://github.com/iMatuProject/design-system.git
cd design-system

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

### 2. 基础使用

```scss
// 1. 引入主样式文件
@import 'src/styles/main';

// 2. 使用 Design Tokens
.my-component {
  background-color: $color-primary;
  padding: $spacing-lg;
  border-radius: $border-radius-md;
  font-family: $font-family-system;
}

// 3. 使用 Mixins
.my-button {
  @include button-base($color-primary);
  @include button-size(large);
}
```

### 3. 快速预览

```bash
# 打开样式沙盒
npm run playground

# 或使用简化版本
npm run playground:simple
```

## 🎯 核心概念

### Design Tokens (设计令牌)
```scss
// 颜色系统
$color-primary: #2196F3;     // 主色
$color-success: #4CAF50;     // 成功色
$color-warning: #FF9800;     // 警告色

// 间距系统  
$spacing-xs: 0.25rem;        // 4px
$spacing-sm: 0.5rem;         // 8px
$spacing-md: 1rem;           // 16px
$spacing-lg: 1.5rem;         // 24px

// 字体系统
$font-size-body: 1rem;       // 16px
$font-weight-medium: 500;    // 中等字重
```

### 组件系统
```scss
// 按钮组件
.c-button {
  @include button-base($color-primary);
  
  &--secondary { @include button-base($color-secondary); }
  &--large { @include button-size(large); }
  &--small { @include button-size(small); }
}

// 卡片组件  
.c-card {
  @include card-base;
  
  &__header { /* 头部样式 */ }
  &__body { /* 主体样式 */ }
  &--elevated { /* 抬升样式 */ }
}
```

## 🔧 开发工具

### 代码检查
```bash
# 检查样式代码
npm run lint:css

# 自动修复问题
npm run lint:css-fix

# 生成详细报告
npm run lint:css-report
```

### 文档生成
```bash
# 生成样式文档
npm run docs:styles

# 启动文档服务器
npm run docs:serve

# 实时监听变化
npm run docs:watch
```

### 版本管理
```bash
# 生成变更日志
npm run changelog:generate

# 自动发布版本
npm run release:patch    # 修订版本
npm run release:minor    # 次要版本
npm run release:major    # 主要版本
```

## 🎨 实用示例

### 响应式设计
```scss
.my-responsive-component {
  // 桌面端样式
  padding: $spacing-xl;
  
  // 平板样式
  @include breakpoint(tablet) {
    padding: $spacing-lg;
  }
  
  // 移动端样式
  @include breakpoint(mobile) {
    padding: $spacing-md;
  }
}
```

### 主题切换
```scss
// 亮色主题
[data-theme="light"] {
  --background-color: #{$color-background};
  --text-color: #{$color-text-primary};
}

// 暗色主题
[data-theme="dark"] {
  --background-color: #1a1a1a;
  --text-color: #e0e0e0;
}
```

### 动画效果
```scss
.my-animated-element {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: $shadow-lg;
  }
  
  &.is-loading {
    animation: pulse 2s infinite;
  }
}
```

## 📚 学习资源

### 官方文档
- [完整样式文档](./docs/styles/README.md)
- [组件使用指南](./docs/styles/sassdoc/)
- [团队协作规范](./CONTRIBUTING_STYLES.md)

### 在线工具
- [样式沙盒环境](./docs/playground.html)
- [简化调试器](./docs/simple-playground.html)

### 开发参考
- [变更日志](./CHANGELOG_STYLES.md)
- [组件样式指南](./docs/component-style-guide.md)

## 💡 最佳实践

### ✅ 推荐做法
```scss
// 1. 始终使用 Design Tokens
.good-example {
  color: $color-primary;        // ✅ 好
  margin: $spacing-md;          // ✅ 好
}

// 2. 遵循 BEM 命名规范
.c-component {}               // ✅ 好
.c-component__element {}      // ✅ 好
.c-component--modifier {}     // ✅ 好

// 3. 使用 Mixins 提高复用性
@include flex-center;         // ✅ 好
@include button-base();       // ✅ 好
```

### ❌ 避免做法
```scss
// 1. 避免硬编码值
.bad-example {
  color: #2196F3;             // ❌ 避免
  margin: 16px;               // ❌ 避免
}

// 2. 避免深层嵌套
.parent {
  .child {
    .grandchild {
      .great-grandchild {}    // ❌ 避免 (超过3层)
    }
  }
}

// 3. 避免使用 !important
.element {
  color: red !important;      // ❌ 避免
}
```

## 🆘 常见问题

### Q: 如何添加新的 Design Token？
A: 在 `src/styles/design-tokens/` 目录下相应的文件中添加，并在 `_tokens.scss` 中导出。

### Q: 组件样式不生效怎么办？
A: 检查是否正确引入了主样式文件，确认类名遵循 BEM 规范。

### Q: 如何自定义主题？
A: 修改 `src/styles/themes/` 目录下的主题文件，或通过 CSS 自定义属性覆盖。

### Q: 文档生成失败怎么办？
A: 确保安装了所有依赖，检查 SCSS 文件语法是否正确。

## 🤝 参与贡献

欢迎参与项目贡献！

1. Fork 项目
2. 创建功能分支
3. 提交更改
4. 发起 Pull Request

详细贡献指南请查看 [CONTRIBUTING_STYLES.md](./CONTRIBUTING_STYLES.md)

---

*开始构建 beautiful 和 consistent 的用户界面吧！* 🎨✨