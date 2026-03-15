# 颜色标准化映射表

## 当前问题分析

根据Stylelint检查结果，存在以下颜色相关问题：
- **color-hex-case**: 34个 - 十六进制颜色大小写不统一
- **color-hex-length**: 24个 - 长格式十六进制颜色未使用短格式
- **color-named**: 47个 - 使用了named colors (如 white, black等)

## 标准化方案

### 1. 十六进制颜色格式统一
**规则**: 所有十六进制颜色必须使用小写短格式
```
#FFFFFF → #fff
#000000 → #000
#AABBCC → #abc
```

### 2. Named Colors替换映射
将所有named colors替换为十六进制值或设计系统变量

| Named Color | 十六进制值 | 设计系统变量 | 使用场景 |
|-------------|------------|--------------|----------|
| white | #fff | $white-color 或 $background-color | 背景色、文字色 |
| black | #000 | $black-color 或 $text-primary-color | 文字色、边框色 |
| red | #f00 | $error-color | 错误状态 |
| green | #008000 | $success-color | 成功状态 |
| blue | #00f | $primary-color | 链接、主要按钮 |
| gray | #808080 | $gray-500 | 次要文字、边框 |

### 3. 设计系统变量优先使用
优先使用已有的设计系统颜色变量：

**主要品牌色**
- $primary-color: #2196f3
- $secondary-color: #9c27b0
- $success-color: #4caf50
- $warning-color: #ff9800
- $error-color: #f44336

**中性色系**
- $white-color: #fff
- $black-color: #000
- $gray-100 到 $gray-900 (不同灰度)

**语义化别名**
- $text-primary-color: #212121
- $text-secondary-color: #757575
- $background-color: #fff
- $border-color: $gray-300

## 实施步骤

### 第一步：创建颜色变量映射文件
```scss
// src/styles/color-mapping.scss
// 颜色标准化映射表

// Named Colors 到十六进制的标准映射
$color-map: (
  white: #fff,
  black: #000,
  red: #f00,
  green: #008000,
  blue: #00f,
  gray: #808080,
  // 可根据实际情况补充...
);

// 获取标准化颜色值的函数
@function get-standard-color($color) {
  @if map-has-key($color-map, $color) {
    @return map-get($color-map, $color);
  }
  @return $color;
}
```

### 第二步：批量替换策略
1. 优先替换named colors为对应的十六进制值
2. 统一十六进制颜色格式为小写短格式
3. 逐步替换为设计系统变量（长期目标）

### 第三步：验证和测试
1. 运行样式检查确认问题减少
2. 手动检查关键页面显示效果
3. 确保颜色替换不影响现有功能

## 预期效果

完成标准化后将实现：
- ✅ 统一的颜色表示格式
- ✅ 消除named colors使用
- ✅ 提高代码可维护性
- ✅ 增强团队协作一致性
- ✅ 为后续Design Token完善奠定基础