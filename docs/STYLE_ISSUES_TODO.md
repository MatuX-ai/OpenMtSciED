# 样式规范待处理问题清单

## 🎯 高优先级问题 (需要立即处理)

### 1. 剩余的 !important 声明 (约12处)

**文件位置**:
- `src/app/admin/admin.styles.scss` - 多处使用
- `shared-styles/components/modals/angular/universal-modal.component.scss` - 多处使用
- `shared-styles/animations/loading-spinners/angular/loading-spinner.component.scss` - 多处使用

**处理策略**:
```scss
// 错误示例
.element { color: red !important; }

// 正确做法 - 提高选择器特异性
.parent .element { color: red; }
// 或者使用更具体的选择器
.element.special { color: red; }
```

### 2. 媒体查询语法问题

**问题**: `media-feature-range-notation` 错误
**涉及文件**: 多个组件文件
**解决方案**: 
```scss
// 错误写法
@media (width >= 768px) { }

// 正确写法  
@media (min-width: 768px) { }
```

### 3. 选择器顺序问题

**问题**: `no-descending-specificity` 错误
**涉及文件**: toast-notification, universal-modal
**解决方案**: 重新排列选择器顺序，将通用选择器放在前面

## 📋 中优先级问题

### 1. Design Token 使用不足

**问题**: 直接使用硬编码值而非变量
**常见位置**:
- 字体大小: `font-size: 20px` → `font-size: $font-size-body-large`
- 颜色值: `color: #333` → `color: $text-primary-color`
- 间距值: `margin: 16px` → `margin: $spacing-lg`

### 2. SCSS 函数现代化

**遗留函数**:
- `darken()` → `color.adjust($color, $lightness: -$amount)`
- `lighten()` → `color.adjust($color, $lightness: $amount)`

### 3. 属性声明顺序

**问题**: `order/properties-order` 警告
**解决方案**: 按照以下顺序排列CSS属性:
1. Positioning (position, top, right, bottom, left)
2. Box Model (display, width, height, margin, padding)
3. Visual (color, background, border)
4. Typography (font-family, font-size, line-height)
5. Misc (transition, transform, z-index)

## 🔧 具体处理计划

### 第一批处理 (今天完成)
1. 修复 admin.styles.scss 中的所有 !important 声明
2. 修正 universal-modal 组件的选择器顺序
3. 更新 loading-spinner 组件的 SCSS 函数

### 第二批处理 (明天完成)
1. 处理所有媒体查询语法问题
2. 完善 Design Token 的使用
3. 优化属性声明顺序

### 第三批处理 (本周内完成)
1. 建立样式规范检查CI流程
2. 创建样式开发最佳实践文档
3. 进行团队培训和规范推广

## 📊 进度跟踪

| 问题类型 | 总数 | 已处理 | 剩余 | 完成率 |
|---------|------|--------|------|--------|
| !important 声明 | ~12 | 4 | ~8 | 33% |
| 媒体查询语法 | ~15 | 0 | ~15 | 0% |
| 选择器顺序 | ~8 | 0 | ~8 | 0% |
| Design Token 使用 | ~25 | 5 | ~20 | 20% |
| SCSS 函数现代化 | ~10 | 19 | ~0 | 100% |

## 💡 处理技巧

### 1. !important 声明替代方案
```scss
// 方案1: 提高选择器特异性
.component { color: blue; }
.parent .component { color: red; }

// 方案2: 使用更具体的选择器
.button { color: blue; }
.button.urgent { color: red; }

// 方案3: 重新组织CSS结构
.override { color: red; }
.normal { color: blue; }
```

### 2. 媒体查询标准化
```scss
// 使用项目已定义的断点变量
@media (min-width: $breakpoint-tablet) { }
@media (max-width: $breakpoint-mobile) { }

// 避免硬编码数值
@media (min-width: 768px) { } // ❌
@media (min-width: $breakpoint-tablet) { } // ✅
```

### 3. Design Token 最佳实践
```scss
// 推荐做法
.element {
  color: $text-primary-color;
  font-size: $font-size-body-medium;
  padding: $spacing-md;
  border-radius: $border-radius-sm;
}

// 避免做法
.element {
  color: #333333;
  font-size: 16px;
  padding: 16px;
  border-radius: 4px;
}
```

---
*清单更新时间: 2026年2月26日*