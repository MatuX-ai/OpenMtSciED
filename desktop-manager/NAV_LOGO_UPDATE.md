# 导航栏 Logo 更新说明

## 📋 更新内容

已将导航栏的品牌图标从 emoji `📚` 替换为 matu-logo.png 图片。

### 修改文件

**文件**: `desktop-manager/src/app/shared/marketing-nav/marketing-nav.component.ts`

### 变更详情

#### 修改前
```html
<div class="nav-brand">
  <span class="brand-icon">📚</span>
  <span class="brand-name">OpenMTSciEd</span>
</div>
```

```css
.brand-icon {
  font-size: 24px;
}
```

#### 修改后
```html
<div class="nav-brand">
  <img src="assets/images/matu-logo.png" alt="OpenMTSciEd Logo" class="brand-logo" />
  <span class="brand-name">OpenMTSciEd</span>
</div>
```

```css
.nav-brand {
  display: flex;
  align-items: center;
  gap: 12px;  /* 从 8px 增加到 12px，给 logo 更多空间 */
  color: white;
  font-size: 18px;
  font-weight: 600;
}

.brand-logo {
  height: 36px;        /* 固定高度，保持比例 */
  width: auto;         /* 宽度自动调整 */
  object-fit: contain; /* 保持图片完整显示 */
}
```

---

## 🎨 设计说明

### Logo 尺寸
- **高度**: 36px（与导航栏高度协调）
- **宽度**: 自动（保持原始宽高比）
- **间距**: logo 和文字之间 12px

### 样式特点
- ✅ 响应式：在不同屏幕尺寸下都能正常显示
- ✅ 保持比例：使用 `object-fit: contain` 防止变形
- ✅ 无障碍：添加了 `alt` 属性
- ✅ 视觉平衡：logo 与文字垂直居中对齐

---

## ✅ 验证步骤

### 1. 开发环境测试

```bash
cd desktop-manager
npm run start
```

访问 `http://localhost:4200`，检查：
- ✓ 导航栏左侧显示 matu-logo.png
- ✓ Logo 清晰不模糊
- ✓ Logo 与 "OpenMTSciEd" 文字对齐
- ✓ 点击导航链接时页面正常跳转

### 2. 不同页面测试

在以下页面检查导航栏 logo：
- `/setup-wizard` - 初始化向导
- `/course-library` - 教程库
- `/material-library` - 课件库

### 3. 浏览器兼容性

测试主流浏览器：
- Chrome/Edge
- Firefox
- Safari（如果可用）

---

## 🔧 调整建议

### 如果 Logo 太大或太小

修改 `.brand-logo` 的 `height` 值：

```css
.brand-logo {
  height: 32px;  /* 调小 */
  /* 或 */
  height: 40px;  /* 调大 */
  width: auto;
  object-fit: contain;
}
```

### 如果 Logo 和文字间距不合适

修改 `.nav-brand` 的 `gap` 值：

```css
.nav-brand {
  gap: 8px;   /* 调小间距 */
  /* 或 */
  gap: 16px;  /* 调大间距 */
}
```

### 如果需要圆形 Logo

添加圆角效果：

```css
.brand-logo {
  height: 36px;
  width: auto;
  object-fit: contain;
  border-radius: 50%;  /* 圆形 */
  /* 或 */
  border-radius: 8px;  /* 圆角矩形 */
}
```

### 如果需要添加阴影

```css
.brand-logo {
  height: 36px;
  width: auto;
  object-fit: contain;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
}
```

---

## 📝 相关文件

- **Logo 源文件**: `docs/assets/images/matu-logo.png`
- **Web 应用 Logo**: `desktop-manager/src/assets/images/matu-logo.png`
- **Favicon**: `desktop-manager/src/index.html` (已配置)
- **导航组件**: `desktop-manager/src/app/shared/marketing-nav/marketing-nav.component.ts`

---

## 🚀 后续优化建议

1. **响应式设计**
   - 在小屏幕设备上可以隐藏文字，只显示 logo
   - 或者减小 logo 尺寸

2. **暗黑模式支持**
   - 如果将来添加暗黑主题，可能需要调整 logo 样式
   - 可以考虑准备浅色/深色两个版本的 logo

3. **动画效果**
   - 可以添加 hover 时的轻微放大效果
   - 或者加载时的淡入动画

4. **PWA 支持**
   - 确保 logo 也用于 PWA 安装图标
   - 已在 `index.html` 中配置 favicon

---

## ⚠️ 注意事项

1. **图片路径**
   - 使用相对路径 `assets/images/matu-logo.png`
   - Angular 构建时会自动处理路径

2. **图片格式**
   - 当前使用 PNG 格式（支持透明背景）
   - 如果需要更小的文件大小，可以考虑 WebP 格式

3. **性能优化**
   - Logo 文件应该压缩优化（当前 6.4KB，已经很小）
   - 可以使用工具如 TinyPNG 进一步优化

4. **缓存问题**
   - 如果更新 logo 后浏览器仍显示旧版本
   - 清除浏览器缓存或使用硬刷新（Ctrl + Shift + R）

---

**更新日期**: 2026-04-11  
**更新人员**: AI Assistant
