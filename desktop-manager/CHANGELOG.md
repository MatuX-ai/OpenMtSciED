# 更新日志

所有重要更改都将记录在此文件中。

格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/)，
版本遵循 [语义化版本](https://semver.org/lang/zh-CN/)。

---

## [未发布]

### 已添加
- 初始化向导功能（Setup Wizard）
- 课程库管理（Course Library）
- 课件库管理（Material Library）
- Tauri 桌面应用框架集成
- SQLite 本地数据库支持
- Material Design UI 组件
- 响应式导航栏
- matu-logo.png 品牌图标集成

### 已修复
- 修复 Angular 17+ 构建输出路径问题
- 修复 Tauri Bundle Identifier 配置
- 修复 TypeScript 严格模式类型错误
- 修复 ESLint 代码规范问题

### 已更改
- 更新学科分类为 STEM 标准分类
- 优化导航栏 Logo 显示
- 改进代码结构和模块化

---

## [0.1.0] - 2026-04-11

### 首次发布

#### 核心功能
- ✅ 基于 Tauri 2.0 + Angular 17 的桌面应用架构
- ✅ 课程管理系统
  - 创建、编辑、删除课程
  - STEM 学科分类（物理、化学、生物、数学等）
  - 课程描述和元数据
- ✅ 课件管理系统
  - 上传课件文件
  - 关联课程
  - 文件大小和路径管理
- ✅ 初始化向导
  - 教师信息配置
  - 学校信息设置
  - 主要教学科目选择
- ✅ 本地数据存储
  - SQLite 数据库
  - 离线可用
  - 数据持久化

#### 技术特性
- ✅ TypeScript 严格模式
- ✅ ESLint + Prettier 代码规范
- ✅ 完整的类型定义
- ✅ 异步操作处理
- ✅ 错误处理和用户反馈
- ✅ Material SnackBar 通知

#### UI/UX
- ✅ Material Design 主题
- ✅ 响应式布局
- ✅ Remix Icon 图标
- ✅ 自定义品牌图标（matu-logo.png）
- ✅ 渐变导航栏设计
- ✅ 表单验证和提示

#### 开发体验
- ✅ 热重载开发环境
- ✅ 详细的构建日志
- ✅ 代码自动格式化
- ✅ 类型安全检查
- ✅ 完整的文档

#### 文档
- ✅ README.md - 项目概述和使用指南
- ✅ BUILD.md - 详细构建说明
- ✅ CONTRIBUTING.md - 贡献指南
- ✅ LICENSE - MIT 许可证
- ✅ LOGO_USAGE.md - Logo 使用指南
- ✅ NAV_LOGO_UPDATE.md - 导航栏 Logo 更新记录
- ✅ TAURI_ICON_UPDATE.md - Tauri 图标更新记录
- ✅ EXECUTABLE_INFO.md - 可执行文件说明
- ✅ E2E_TEST_GUIDE.md - E2E 测试指南
- ✅ CHANGELOG.md - 更新日志

#### 跨平台支持
- ✅ Windows (MSI, NSIS, portable exe)
- ✅ macOS (DMG, .app)
- ✅ Linux (DEB, AppImage, RPM)

---

## 版本说明

### 语义化版本

本项目遵循语义化版本 2.0.0 规范：

- **主版本号 (MAJOR)**: 不兼容的 API 修改
- **次版本号 (MINOR)**: 向下兼容的功能性新增
- **修订号 (PATCH)**: 向下兼容的问题修正

### 发布流程

1. 更新 `package.json` 中的 version
2. 更新 `src-tauri/tauri.conf.json` 中的 version
3. 更新 CHANGELOG.md
4. 提交并打标签
5. 创建 GitHub Release
6. 上传构建产物

---

## 计划中的功能

### 短期（v0.2.x）
- [ ] 课件下载功能
- [ ] 课程导入/导出
- [ ] 数据备份和恢复
- [ ] 搜索和过滤优化
- [ ] 更多学科模板

### 中期（v0.3.x）
- [ ] 用户认证系统
- [ ] 云端同步（可选）
- [ ] 协作功能
- [ ] 统计分析
- [ ] 插件系统

### 长期（v1.0.x）
- [ ] 完整的教学管理套件
- [ ] AI 辅助功能
- [ ] 虚拟现实实验室集成
- [ ] 多语言支持
- [ ] 移动端应用

---

## 已知问题

### v0.1.0
- WiX 工具包下载可能较慢（仅影响 MSI 打包）
- 首次构建时间较长（Rust 依赖编译）
- 课件下载功能待实现

---

## 致谢

感谢以下贡献者和项目：

- Tauri 团队 - 优秀的桌面应用框架
- Angular 团队 - 强大的前端框架
- Rust 社区 - 安全的系统编程语言
- 所有开源贡献者

---

**注意**: 
- [未发布] 部分包含尚未发布的更改
- 日期格式为 YYYY-MM-DD
- 详细的技术更新请参考 Git 提交历史

[未发布]: ../../compare/v0.1.0...HEAD
[0.1.0]: ../../releases/tag/v0.1.0
