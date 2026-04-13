# 构建指南

本文档提供 OpenMTSciEd Desktop Manager 的详细构建说明。

---

## 🚀 快速构建（3 步）

### 1. 安装依赖

```bash
npm install
```

### 2. 构建应用

```bash
npm run tauri:build
```

### 3. 运行应用

```bash
# Windows
.\src-tauri\target\release\app.exe

# macOS
open src-tauri/target/release/bundle/macos/OpenMTSciEd\ Desktop\ Manager.app

# Linux
./src-tauri/target/release/bundle/deb/*.deb
```

---

## 📋 详细步骤

### 前置要求

#### 必需软件

1. **Node.js 18+**
   ```bash
   # 检查版本
   node --version  # 应该 >= 18.x
   npm --version   # 应该 >= 9.x
   ```
   
   下载地址：https://nodejs.org/

2. **Rust 1.70+**
   ```bash
   # 检查版本
   rustc --version  # 应该 >= 1.70
   cargo --version
   ```
   
   安装方法：
   - Windows: 下载 https://win.rustup.rs/
   - macOS/Linux: `curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh`

#### 推荐工具

- **VS Code** - 代码编辑器
- **Git** - 版本控制

---

## 🔨 构建选项

### 开发模式（推荐用于开发）

```bash
npm run tauri:dev
```

特点：
- ✅ 热重载
- ✅ 详细的错误信息
- ✅ 开发者工具
- ❌ 体积较大
- ❌ 性能未优化

### 生产模式（推荐用于发布）

```bash
npm run tauri:build
```

特点：
- ✅ 体积优化
- ✅ 性能优化
- ✅ 代码混淆
- ❌ 构建时间较长
- ❌ 无热重载

---

## 📦 构建输出

### 可执行文件位置

```
src-tauri/target/release/
├── app.exe                    # Windows 可执行文件 (13.5 MB)
├── app.pdb                    # 调试符号 (可删除)
└── bundle/                    # 安装包目录
    ├── msi/                   # Windows Installer
    │   └── *.msi
    ├── nsis/                  # NSIS 安装程序
    │   └── *-setup.exe
    ├── macos/                 # macOS App
    │   └── *.app
    ├── dmg/                   # macOS DMG
    │   └── *.dmg
    ├── deb/                   # Debian/Ubuntu
    │   └── *.deb
    └── appimage/              # Linux AppImage
        └── *.AppImage
```

### 文件大小参考

| 文件类型 | 大小 | 用途 |
|---------|------|------|
| app.exe | ~13.5 MB | 便携版，无需安装 |
| .msi | ~15 MB | Windows 标准安装 |
| .exe (NSIS) | ~15 MB | Windows 传统安装 |
| .dmg | ~16 MB | macOS 磁盘映像 |
| .deb | ~14 MB | Debian/Ubuntu 包 |
| .AppImage | ~15 MB | Linux 通用包 |

---

## ⚙️ 配置自定义

### 修改应用名称

编辑 `src-tauri/tauri.conf.json`:

```json
{
  "productName": "你的应用名称",
  "identifier": "com.yourcompany.app-name"
}
```

### 修改应用图标

1. 准备 PNG 图片（至少 1024x1024）
2. 运行命令：
   ```bash
   npx tauri icon path/to/your/icon.png
   ```
3. 重新构建

### 修改窗口大小

编辑 `src-tauri/tauri.conf.json`:

```json
{
  "app": {
    "windows": [
      {
        "width": 1024,
        "height": 768,
        "title": "应用标题"
      }
    ]
  }
}
```

---

## 🐛 常见问题

### 问题 1: Rust 未找到

**错误信息**:
```
failed to run 'cargo metadata' command
program not found
```

**解决方案**:
```bash
# Windows PowerShell
$env:Path += ";$env:USERPROFILE\.cargo\bin"

# 永久添加（重启终端后生效）
# 将 %USERPROFILE%\.cargo\bin 添加到系统 PATH
```

### 问题 2: 找不到 index.html

**错误信息**:
```
asset not found: index.html
```

**解决方案**:
确保 `src-tauri/tauri.conf.json` 中的路径正确：
```json
{
  "build": {
    "frontendDist": "../dist/desktop-manager/browser"
  }
}
```

然后重新构建：
```bash
npm run tauri:build
```

### 问题 3: 构建速度慢

**原因**: 首次构建需要编译所有 Rust 依赖

**解决方案**:
- 使用国内镜像加速 Cargo
- 后续构建会使用缓存，速度会快很多

配置 Cargo 镜像（`~/.cargo/config.toml`）:
```toml
[source.crates-io]
replace-with = 'ustc'

[source.ustc]
registry = "git://mirrors.ustc.edu.cn/crates.io-index"
```

### 问题 4: WiX 下载失败

**错误信息**:
```
Downloading https://github.com/wixtoolset/wix3/releases/...
```

**解决方案**:

**选项 A**: 手动下载 WiX
1. 访问: https://github.com/wixtoolset/wix3/releases/tag/wix3141rtm
2. 下载 `wix314-binaries.zip`
3. 解压到 Tauri 缓存目录

**选项 B**: 跳过 MSI 打包
只使用可执行文件 `app.exe`，无需安装包

### 问题 5: TypeScript 类型错误

**解决方案**:
```bash
# 清理并重新安装
rm -rf node_modules
npm install

# 或使用 PowerShell
Remove-Item -Recurse -Force node_modules
npm install
```

---

## 🧹 清理构建

### 清理前端构建

```bash
rm -rf dist/
# 或 PowerShell
Remove-Item -Recurse -Force dist
```

### 清理 Rust 构建

```bash
cd src-tauri
cargo clean
```

### 完全清理

```bash
# 删除所有构建产物
rm -rf dist/ node_modules/ src-tauri/target/
npm install
```

---

## 📊 构建时间参考

| 阶段 | 首次构建 | 增量构建 |
|------|---------|---------|
| Angular | ~15 秒 | ~5 秒 |
| Rust 依赖 | ~5 分钟 | - |
| Rust 应用 | ~2 分钟 | ~30 秒 |
| 打包 | ~1 分钟 | ~1 分钟 |
| **总计** | **~8-10 分钟** | **~2-3 分钟** |

*注：时间因硬件配置而异*

---

## 🔍 验证构建

构建完成后，检查以下内容：

1. **可执行文件存在**
   ```bash
   ls src-tauri/target/release/app.exe
   ```

2. **应用可以启动**
   ```bash
   ./src-tauri/target/release/app.exe
   ```

3. **功能测试**
   - ✓ 导航栏显示 logo
   - ✓ 页面路由正常
   - ✓ 数据可以保存
   - ✓ 无控制台错误

---

## 🚢 发布检查清单

发布前请确认：

- [ ] 所有测试通过
- [ ] 代码已格式化 (`npm run lint`)
- [ ] 更新版本号 (`package.json` 和 `tauri.conf.json`)
- [ ] 更新 CHANGELOG.md
- [ ] 构建生产版本
- [ ] 测试安装包
- [ ] 检查应用图标
- [ ] 验证 Bundle Identifier
- [ ] 添加代码签名（可选）
- [ ] 创建 Release Notes

---

## 📞 获取帮助

如果遇到问题：

1. 查看 [README.md](README.md) 的基础说明
2. 搜索 [Issues](../../issues)
3. 提交新的 Issue，包含：
   - 操作系统版本
   - Node.js 和 Rust 版本
   - 完整的错误信息
   - 复现步骤

---

## 🔗 相关链接

- [Tauri 官方文档](https://tauri.app/)
- [Angular 官方文档](https://angular.io/)
- [Rust 官方文档](https://www.rust-lang.org/)
- [项目主页](https://open-mt-sci-ed.vercel.app/)

---

**最后更新**: 2026-04-11
