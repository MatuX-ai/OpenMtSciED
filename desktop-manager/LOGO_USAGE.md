# Logo 使用说明

## 📌 当前配置

项目现已使用 `matu-logo.png` 作为应用图标。

### 文件位置

- **源文件**: `docs/assets/images/matu-logo.png`
- **Web 应用**: `desktop-manager/src/assets/images/matu-logo.png`
- **Tauri 桌面图标**: `desktop-manager/src-tauri/icons/` (多种尺寸)

### 配置详情

#### 1. Web Favicon (浏览器标签页图标)

**文件**: `desktop-manager/src/index.html`

```html
<link rel="icon" type="image/png" href="assets/images/matu-logo.png">
```

这个配置会在：
- 浏览器标签页显示 matu-logo
- 书签中使用该图标
- PWA 安装时使用该图标

#### 2. Angular Assets 配置

**文件**: `desktop-manager/angular.json`

```json
{
  "assets": ["src/assets"]
}
```

这确保了 `src/assets/` 目录下的所有文件（包括 images/matu-logo.png）都会被复制到构建输出目录 `dist/desktop-manager/`。

#### 3. Tauri 桌面应用图标

**文件**: `desktop-manager/src-tauri/tauri.conf.json`

```json
{
  "bundle": {
    "icon": [
      "icons/32x32.png",
      "icons/128x128.png",
      "icons/128x128@2x.png",
      "icons/icon.icns",
      "icons/icon.ico"
    ]
  }
}
```

Tauri 使用 `src-tauri/icons/` 目录下的图标文件，这些图标会用于：
- Windows: `.ico` 文件
- macOS: `.icns` 文件
- Linux: `.png` 文件

---

## 🔄 如何更新 Logo

### 方法 1: 替换 Web 应用 Logo

如果要更新浏览器中显示的 favicon：

1. 准备新的 PNG 格式 logo（建议尺寸：512x512 或更大）
2. 替换文件：
   ```bash
   # 从 docs 目录复制
   Copy-Item "docs/assets/images/new-logo.png" -Destination "desktop-manager/src/assets/images/matu-logo.png" -Force
   ```
3. 重新构建：
   ```bash
   cd desktop-manager
   npm run build
   ```

### 方法 2: 更新 Tauri 桌面图标

如果要更新打包后的桌面应用图标，需要使用 Tauri 的图标生成工具：

1. 准备一个至少 1024x1024 的 PNG 图片
2. 运行 Tauri 图标生成命令：
   ```bash
   cd desktop-manager
   npx tauri icon path/to/your/logo.png
   ```
   
   这会自动生成所有需要的尺寸并替换 `src-tauri/icons/` 目录下的文件。

3. 重新构建桌面应用：
   ```bash
   npm run tauri:build
   ```

### 方法 3: 同时更新两者

1. 准备高质量 logo（1024x1024 PNG）
2. 更新 Tauri 图标：
   ```bash
   npx tauri icon docs/assets/images/matu-logo.png
   ```
3. 复制为 web favicon：
   ```bash
   Copy-Item "docs/assets/images/matu-logo.png" -Destination "desktop-manager/src/assets/images/matu-logo.png" -Force
   ```
4. 重新构建：
   ```bash
   npm run build
   npm run tauri:build
   ```

---

## 📐 Logo 规格要求

### Web Favicon
- **格式**: PNG（推荐）或 ICO
- **尺寸**: 至少 192x192，推荐 512x512
- **背景**: 透明或纯色
- **文件大小**: < 100KB（优化后）

### Tauri 桌面图标
- **源文件**: 至少 1024x1024 PNG
- **自动生成**: 使用 `tauri icon` 命令生成所有尺寸
- **必需尺寸**:
  - 32x32, 128x128, 256x256 (PNG)
  - .ico (Windows)
  - .icns (macOS)

---

## ✅ 验证 Logo 是否正确显示

### Web 应用测试

1. 启动开发服务器：
   ```bash
   npm run start
   ```

2. 访问 `http://localhost:4200`

3. 检查：
   - ✓ 浏览器标签页显示 matu-logo
   - ✓ 地址栏左侧显示图标
   - ✓ 添加书签时显示图标

### Tauri 桌面应用测试

1. 开发模式运行：
   ```bash
   npm run tauri:dev
   ```

2. 检查：
   - ✓ 窗口标题栏显示图标
   - ✓ 任务栏显示图标
   - ✓ Alt+Tab 切换时显示图标

3. 生产构建测试：
   ```bash
   npm run tauri:build
   ```
   
   构建完成后，安装并运行生成的安装包，检查桌面快捷方式和应用图标。

---

## 🎨 设计建议

### Logo 最佳实践

1. **简洁明了**: 避免过多细节，小尺寸下也能识别
2. **对比度高**: 确保在不同背景下都清晰可见
3. **透明背景**: PNG 格式支持透明度，适应性更好
4. **品牌一致性**: 与应用整体设计风格保持一致
5. **多尺寸测试**: 在 16x16、32x32、128x128 等尺寸下测试可读性

### 颜色考虑

- **浅色主题**: 深色或彩色 logo
- **深色主题**: 浅色或亮色 logo
- **通用方案**: 使用品牌主色调，确保在各种背景下都清晰

---

## 🔧 故障排查

### 问题 1: Logo 不显示

**可能原因**:
- 文件路径错误
- 文件不存在
- 浏览器缓存

**解决方案**:
```bash
# 1. 检查文件是否存在
Test-Path "desktop-manager/src/assets/images/matu-logo.png"

# 2. 清除浏览器缓存并硬刷新 (Ctrl + Shift + R)

# 3. 检查构建输出
Test-Path "desktop-manager/dist/desktop-manager/assets/images/matu-logo.png"
```

### 问题 2: Logo 模糊

**可能原因**:
- 原始图片分辨率太低
- 被拉伸显示

**解决方案**:
- 使用更高分辨率的源图片（至少 512x512）
- 确保 CSS 中没有强制拉伸

### 问题 3: Tauri 图标未更新

**可能原因**:
- 只更新了 web favicon，没有更新 Tauri icons
- 需要重新构建

**解决方案**:
```bash
# 1. 使用 tauri icon 命令更新所有尺寸
npx tauri icon docs/assets/images/matu-logo.png

# 2. 清理并重新构建
npm run build
npm run tauri:build
```

---

## 📝 更新历史

| 日期 | 操作 | 说明 |
|------|------|------|
| 2026-04-11 | 初始配置 | 将 docs/assets/images/matu-logo.png 集成到项目中 |
| - | - | 配置为 Web favicon |
| - | - | Tauri 图标已存在（需确认是否为同一 logo） |

---

## 💡 提示

- 保持 `docs/assets/images/matu-logo.png` 作为主源文件
- 所有其他位置的 logo 都应从这个文件复制或生成
- 更新 logo 时，记得同时更新 Web 和 Tauri 两个地方
- 使用版本控制追踪 logo 文件的变更

---

**最后更新**: 2026-04-11
