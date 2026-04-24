# OpenMTSciEd Desktop Manager

<div align="center">

![OpenMTSciEd Logo](docs/assets/images/matu-logo.png)

**开源 STEM 教育桌面应用管理平台**

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Tauri](https://img.shields.io/badge/Tauri-2.0-FFC131?logo=tauri)](https://tauri.app/)
[![Angular](https://img.shields.io/badge/Angular-17-DD0031?logo=angular)](https://angular.io/)
[![Rust](https://img.shields.io/badge/Rust-1.94-000000?logo=rust)](https://www.rust-lang.org/)

[在线演示](https://open-mt-sci-ed.vercel.app/) | [文档](docs/) | [报告问题](../../issues)

</div>

---

## 📖 简介

OpenMTSciEd Desktop Manager 是一个基于 Tauri + Angular 的跨平台桌面应用，专为 STEM（科学、技术、工程、数学）教育设计。提供课程管理、课件库、初始化向导等核心功能。

### ✨ 主要特性

- 🎯 **教程库管理** - 创建、编辑、删除课程，支持 STEM 学科分类
- 📚 **课件库管理** - 上传、下载、管理教学课件
- 🚀 **初始化向导** - 首次使用的配置引导
- 💾 **本地数据存储** - 基于 SQLite 的离线数据管理
- 🎨 **现代化 UI** - Material Design 设计风格
- 🔒 **隐私保护** - 所有数据本地存储，无需联网
- 🌍 **跨平台** - Windows、macOS、Linux 全支持

---

## 🖼️ 截图

<div align="center">

| 初始化向导 | 教程库 | 课件库 |
|:---:|:---:|:---:|
| ![Setup Wizard](docs/screenshots/setup-wizard.png) | ![Course Library](docs/screenshots/course-library.png) | ![Material Library](docs/screenshots/material-library.png) |

</div>

---

## 🛠️ 技术栈

### 前端
- **框架**: Angular 17+
- **UI 组件**: Angular Material
- **图标**: Remix Icon
- **样式**: SCSS

### 后端
- **框架**: Tauri 2.0
- **语言**: Rust
- **数据库**: SQLite (via rusqlite)
- **插件**: 
  - `tauri-plugin-fs` - 文件系统访问
  - `tauri-plugin-dialog` - 对话框支持
  - `tauri-plugin-log` - 日志系统
  - `tauri-plugin-sql` - 数据库操作

### 开发工具
- **包管理**: npm
- **构建工具**: Angular CLI, Cargo
- **代码规范**: ESLint, Prettier
- **类型检查**: TypeScript strict mode

---

## 📋 前置要求

在开始之前，请确保你的系统已安装以下工具：

### 必需
- **Node.js** >= 18.x ([下载](https://nodejs.org/))
- **npm** >= 9.x (随 Node.js 一起安装)
- **Rust** >= 1.70 ([安装指南](https://www.rust-lang.org/tools/install))

### 可选（用于开发）
- **VS Code** - 推荐编辑器
- **Git** - 版本控制

### 检查安装

```bash
# 检查 Node.js
node --version
npm --version

# 检查 Rust
rustc --version
cargo --version
```

---

## 🚀 快速开始

### 1. 克隆仓库

```bash
git clone https://github.com/your-username/openmtscied-desktop-manager.git
cd openmtscied-desktop-manager/desktop-manager
```

### 2. 安装依赖

```bash
npm install
```

### 3. 开发模式运行

```bash
npm run tauri:dev
```

这将启动：
- Angular 开发服务器（http://localhost:4200）
- Tauri 桌面应用窗口

### 4. 生产构建

```bash
npm run tauri:build
```

构建完成后，可执行文件位于：
- **Windows**: `src-tauri/target/release/app.exe`
- **macOS**: `src-tauri/target/release/bundle/macos/OpenMTSciEd Desktop Manager.app`
- **Linux**: `src-tauri/target/release/bundle/deb/*.deb`

安装包位于：
- **Windows MSI**: `src-tauri/target/release/bundle/msi/*.msi`
- **Windows NSIS**: `src-tauri/target/release/bundle/nsis/*-setup.exe`
- **macOS DMG**: `src-tauri/target/release/bundle/dmg/*.dmg`
- **Linux AppImage**: `src-tauri/target/release/bundle/appimage/*.AppImage`

---

## 📦 可用脚本

```bash
# 开发
npm run start              # 仅启动 Angular 开发服务器
npm run tauri:dev          # 启动 Tauri 开发环境

# 构建
npm run build              # 仅构建 Angular 应用
npm run tauri:build        # 完整的生产构建

# 测试
npm run test               # 运行单元测试
npm run lint               # 代码检查

# Tauri 命令
npx tauri dev              # Tauri 开发模式
npx tauri build            # Tauri 生产构建
npx tauri icon <path>      # 生成应用图标
```

---

## 🏗️ 项目结构

```
desktop-manager/
├── src/                      # Angular 前端源码
│   ├── app/
│   │   ├── core/            # 核心服务
│   │   │   └── services/
│   │   │       └── tauri.service.ts    # Tauri 桥接服务
│   │   ├── features/        # 功能模块
│   │   │   ├── setup-wizard/           # 初始化向导
│   │   │   ├── course-library/         # 教程库
│   │   │   └── material-library/       # 课件库
│   │   ├── shared/          # 共享组件
│   │   │   └── marketing-nav/          # 导航栏
│   │   ├── app.component.ts
│   │   ├── app.routes.ts
│   │   └── app.config.ts
│   ├── assets/              # 静态资源
│   │   └── images/
│   │       └── matu-logo.png
│   └── index.html
├── src-tauri/               # Tauri Rust 后端
│   ├── icons/               # 应用图标（多尺寸）
│   ├── src/
│   │   └── main.rs          # Rust 主入口
│   ├── Cargo.toml           # Rust 依赖配置
│   └── tauri.conf.json      # Tauri 配置文件
├── docs/                    # 文档
│   └── assets/
│       └── images/
│           └── matu-logo.png
├── package.json
├── angular.json
├── tsconfig.json
└── README.md
```

---

## 🔧 配置说明

### Tauri 配置

主要配置文件：`src-tauri/tauri.conf.json`

```json
{
  "productName": "OpenMTSciEd Desktop Manager",
  "version": "0.1.0",
  "identifier": "com.openmtscied.desktop-manager",
  "build": {
    "frontendDist": "../dist/desktop-manager/browser",
    "devUrl": "http://localhost:4200",
    "beforeDevCommand": "npm run start",
    "beforeBuildCommand": "npm run build"
  }
}
```

### 修改 Bundle Identifier

如果需要发布应用，请修改 `identifier` 为你的唯一标识：

```json
"identifier": "com.yourcompany.openmtscied-desktop-manager"
```

---

## 📝 开发指南

### 添加新功能

1. **创建组件**
   ```bash
   ng generate component features/your-feature
   ```

2. **添加路由**
   在 `src/app/app.routes.ts` 中添加路由配置

3. **实现 Tauri 命令**（如需后端功能）
   - 在 `src-tauri/src/main.rs` 中定义命令
   - 在 `src/app/core/services/tauri.service.ts` 中添加调用方法

### 代码规范

项目使用严格的 TypeScript 和 ESLint 规则：

```bash
# 检查代码规范
npm run lint

# 自动修复格式问题
npx eslint --fix
```

### 调试技巧

#### 前端调试
- 使用浏览器开发者工具（F12）
- Angular DevTools 扩展

#### 后端调试
```bash
# 查看 Rust 编译错误
cd src-tauri
cargo check

# 查看详细日志
RUST_LOG=debug cargo run
```

---

## 🧪 测试

### 单元测试

```bash
npm run test
```

### E2E 测试

参考 `E2E_TEST_GUIDE.md` 了解端到端测试流程。

---

## 📚 文档

- [Logo 使用指南](LOGO_USAGE.md)
- [导航栏 Logo 更新记录](NAV_LOGO_UPDATE.md)
- [Tauri 图标更新记录](TAURI_ICON_UPDATE.md)
- [可执行文件说明](EXECUTABLE_INFO.md)
- [E2E 测试指南](E2E_TEST_GUIDE.md)

---

## 🤝 贡献指南

我们欢迎所有形式的贡献！

### 提交问题
1. 搜索现有 issues，避免重复
2. 使用 issue 模板
3. 提供详细的复现步骤

### 提交代码
1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

### 开发规范
- 遵循 TypeScript 严格模式
- 编写清晰的注释
- 添加必要的测试
- 更新相关文档

---

## 📄 许可证

本项目采用 MIT 许可证 - 详见 [LICENSE](LICENSE) 文件

---

## 👥 团队

- **开发团队**: OpenMTSciEd Team
- **联系邮箱**: [3936318150@qq.com](mailto:3936318150@qq.com)
- **项目主页**: [https://open-mt-sci-ed.vercel.app/](https://open-mt-sci-ed.vercel.app/)

---

## 🙏 致谢

感谢以下开源项目：

- [Tauri](https://tauri.app/) - 轻量级桌面应用框架
- [Angular](https://angular.io/) - 前端框架
- [Rust](https://www.rust-lang.org/) - 系统编程语言
- [Angular Material](https://material.angular.io/) - UI 组件库
- [Remix Icon](https://remixicon.com/) - 图标库

---

## 📮 联系方式

- 🌐 网站: [https://open-mt-sci-ed.vercel.app/](https://open-mt-sci-ed.vercel.app/)
- 📧 邮箱: [3936318150@qq.com](mailto:3936318150@qq.com)
- 💬 讨论: [GitHub Discussions](../../discussions)

---

<div align="center">

**⭐ 如果这个项目对你有帮助，请给我们一个 Star！**

Made with ❤️ by OpenMTSciEd Team

</div>
