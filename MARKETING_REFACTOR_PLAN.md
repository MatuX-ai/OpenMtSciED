# 营销页面重构计划 - Mac 风格 Angular 实现

## 📋 现状分析

### 现有营销页面（Ghost CMS 已删除）
```
❌ Ghost CMS - 已完全删除
✅ Angular 营销模块 - 保留并重构成 Mac 风格
```

### 当前路由结构
```typescript
/marketing              // 首页
/marketing/education    // 教育版
/marketing/product      // 产品展示  
/marketing/pricing      // 价格方案
/marketing/contact      // 联系我们
/marketing/about        // 关于我们
/marketing/features     // 功能特性
/marketing/tech-stack   // 技术栈
/marketing/roadmap      // 路线图
```

---

## 🎯 重构目标

### 1. 设计风格
- **Mac 简约风**（Apple 设计语言）
- **Design Tokens 统一**（颜色、圆角、阴影）
- **响应式布局**（移动优先）
- **流畅动画**（细腻过渡效果）

### 2. 技术架构
- **纯 Angular 实现**（无 Ghost CMS 依赖）
- **组件化开发**（可复用组件库）
- **统一后台管理**（与 admin 模块集成）
- **性能优化**（懒加载、预加载）

### 3. 内容规划

#### 核心页面（必选）
1. **首页** (`/marketing`)
   - Hero 区域（大标题 + CTA）
   - 核心价值主张（3-4 个卖点）
   - 社会证明（用户评价/合作伙伴）
   - 行动号召区块

2. **价格方案** (`/marketing/pricing`)
   - 价格卡片网格（3 个套餐）
   - 功能对比表
   - FAQ 常见问题
   - CTA 行动区块

3. **功能特性** (`/marketing/features`)
   - 特性网格展示
   - 详细功能说明
   - 使用场景演示
   - 技术优势亮点

4. **关于我们** (`/marketing/about`)
   - 品牌故事
   - 团队介绍
   - 使命愿景
   - 时间轴/发展历程

5. **联系我们** (`/marketing/contact`)
   - 联系表单
   - 地图位置
   - 社交媒体链接
   - 客服信息

#### 可选页面（按需保留）
- `/marketing/education` - 教育版专题页
- `/marketing/product` - 产品详细展示
- `/marketing/tech-stack` - 技术栈展示
- `/marketing/roadmap` - 发展路线图

---

## 🎨 Design Tokens 迁移

### 从 Maco 主题迁移到 Angular

#### 颜色系统
```scss
// src/styles/_design-tokens.scss
$color-primary: #007AFF;          // Apple Blue
$color-success: #34C759;          // Green
$color-warning: #FF9500;          // Orange
$color-error: #FF3B30;            // Red

$color-black: #1D1D1F;
$color-gray-50: #F5F5F7;
$color-white: #FFFFFF;
```

#### 圆角系统
```scss
$radius-sm: 6px;
$radius-md: 10px;
$radius-lg: 14px;
$radius-xl: 20px;
$radius-full: 9999px;
```

#### 阴影层次
```scss
$shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.04);
$shadow-md: 0 4px 12px rgba(0, 0, 0, 0.08);
$shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.12);
$shadow-xl: 0 12px 40px rgba(0, 0, 0, 0.16);
```

---

## 🏗️ 组件架构

### 核心组件（新建）

```
src/app/shared/components/mac/
├── mac-navbar/           # Mac 风格导航栏
├── mac-footer/           # Mac 风格页脚
├── mac-hero/             # Hero 区域组件
├── mac-feature-card/     # 特性卡片
├── mac-pricing-card/     # 价格卡片
├── mac-cta-section/      # CTA 行动区块
├── mac-button/           # Apple 风格按钮
└── mac-card/             # 通用卡片容器
```

### 服务（新建）

```typescript
// src/app/core/services/marketing.service.ts
- 管理营销页面数据
- API 接口调用
- 表单提交处理
```

---

## 📝 实施步骤

### 阶段 1：基础设置（1-2 小时）
- [ ] 创建 Design Tokens SCSS 文件
- [ ] 更新全局样式变量
- [ ] 配置预加载策略

### 阶段 2：核心组件（3-4 小时）
- [ ] 实现 mac-navbar（响应式导航）
- [ ] 实现 mac-footer（多列页脚）
- [ ] 实现 mac-button（多种变体）
- [ ] 实现 mac-card（基础卡片）

### 阶段 3：页面实现（6-8 小时）
- [ ] 重构营销首页（Hero + Features + CTA）
- [ ] 重构价格页面（Pricing Cards + FAQ）
- [ ] 重构功能特性页（Feature Grid）
- [ ] 重构关于我们页（Story + Team）
- [ ] 重构联系我们页（Form + Map）

### 阶段 4：集成测试（1-2 小时）
- [ ] 响应式测试（多设备）
- [ ] 深色模式适配
- [ ] 性能优化（Lighthouse 90+）
- [ ] SEO 优化（Meta 标签）

### 阶段 5：后台集成（2-3 小时）
- [ ] 联系表单对接后台 API
- [ ] 订阅功能集成
- [ ] 数据统计埋点
- [ ] Admin 后台数据展示

---

## 🔧 技术细节

### 响应式断点
```scss
$breakpoint-sm: 640px;   // 手机横屏
$breakpoint-md: 768px;   // 平板
$breakpoint-lg: 1024px;  // 桌面
$breakpoint-xl: 1280px;  // 大屏
```

### 动画规范
```scss
$transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1);
$transition-base: 250ms cubic-bezier(0.4, 0, 0.2, 1);
$transition-slow: 350ms cubic-bezier(0.4, 0, 0.2, 1);
```

### 间距系统
```scss
$spacing-xs: 4px;
$spacing-sm: 8px;
$spacing-md: 16px;
$spacing-lg: 24px;
$spacing-xl: 32px;
$spacing-2xl: 48px;
$spacing-3xl: 64px;
$spacing-4xl: 96px;
```

---

## 📊 性能指标

### 目标分数（Google Lighthouse）
- Performance: **95+**
- Accessibility: **95+**
- Best Practices: **95+**
- SEO: **95+**

### 加载性能
- First Contentful Paint: **<1.0s**
- Time to Interactive: **<2.5s**
- Cumulative Layout Shift: **<0.05**

---

## 🎯 验收标准

### 设计要求
- ✅ Mac 风格视觉一致性
- ✅ 响应式全设备适配
- ✅ 深色模式自动切换
- ✅ 动画流畅自然

### 功能要求
- ✅ 所有页面正常访问
- ✅ 表单提交成功
- ✅ 路由跳转正确
- ✅ 后台数据同步

### 性能要求
- ✅ Lighthouse 全 95+
- ✅ 首屏加载 <1s
- ✅ 无控制台错误
- ✅ 内存泄漏检测通过

---

## 📅 预计工时

| 阶段 | 任务数 | 预计时间 |
|------|--------|----------|
| 基础设置 | 3 | 1-2 小时 |
| 核心组件 | 4 | 3-4 小时 |
| 页面实现 | 5 | 6-8 小时 |
| 集成测试 | 4 | 1-2 小时 |
| 后台集成 | 4 | 2-3 小时 |
| **总计** | **20** | **13-19 小时** |

---

## 🚀 下一步

立即开始执行：
1. 创建 Design Tokens
2. 实现核心组件
3. 重构营销页面
4. 集成后台管理

**开始开发！** 💪
