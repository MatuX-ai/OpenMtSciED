# OpenMTSciEd Desktop Manager - 可执行文件说明

## ✅ 构建状态

**Rust 后端编译**: ✅ 完成  
**Angular 前端构建**: ✅ 完成  
**可执行文件生成**: ✅ 完成  
**MSI 安装包**: ⏳ 等待 WiX 下载（可选）

---

## 📦 可执行文件信息

### 文件位置

```
G:\iMato\desktop-manager\src-tauri\target\release\app.exe
```

### 文件详情

- **文件名**: app.exe
- **文件大小**: 13.5 MB
- **修改时间**: 2026-04-11 17:20:08
- **版本**: 0.1.0
- **应用名称**: OpenMTSciEd Desktop Manager

---

## 🚀 如何运行

### 方法 1: 直接双击运行

1. 打开文件资源管理器
2. 导航到：`G:\iMato\desktop-manager\src-tauri\target\release\`
3. 双击 `app.exe`

### 方法 2: 命令行运行

```powershell
cd G:\iMato\desktop-manager\src-tauri\target\release
.\app.exe
```

### 方法 3: 创建快捷方式

1. 右键点击 `app.exe`
2. 选择"发送到" → "桌面快捷方式"
3. 以后可以直接从桌面启动

---

## 📁 相关文件

在同一目录下还有：

- **app.exe** (13.5 MB) - 主应用程序（Release 优化版本）
- **app.pdb** (6.2 MB) - 调试符号文件（开发用，可删除）
- **app.d** (4.1 KB) - 依赖信息文件

**建议**: 
- 日常使用只需 `app.exe`
- 可以删除 `app.pdb` 和 `app.d` 节省空间（约 6.2 MB）

---

## ✨ 功能特性

这个可执行文件包含：

### 前端（Angular）
- ✅ 初始化向导（Setup Wizard）
- ✅ 教程库管理（Course Library）
- ✅ 课件库管理（Material Library）
- ✅ 响应式 UI 设计
- ✅ Material Design 主题

### 后端（Tauri + Rust）
- ✅ SQLite 数据库集成
- ✅ 文件系统访问
- ✅ 对话框支持
- ✅ 日志系统
- ✅ 跨平台兼容

### 图标
- ✅ 使用 matu-logo.png
- ✅ 窗口标题栏显示 logo
- ✅ 任务栏显示 logo

---

## 🔍 验证应用

运行后检查：

1. **窗口标题**: 应显示 "OpenMTSciEd"
2. **导航栏**: 左侧显示 matu-logo.png
3. **页面路由**:
   - `/setup-wizard` - 初始化向导
   - `/course-library` - 教程库
   - `/material-library` - 课件库
4. **功能测试**:
   - 创建课程
   - 上传课件
   - 数据持久化

---

## 📊 性能特点

### 优势
- ✅ **体积小**: 仅 13.5 MB（包含所有依赖）
- ✅ **启动快**: Release 优化版本
- ✅ **内存占用低**: Rust 后端高效
- ✅ **无需安装**: 便携版，即点即用
- ✅ **无运行时依赖**: 不需要 Node.js、Python 等

### 对比
| 类型 | 大小 | 需要安装 | 适用场景 |
|------|------|----------|----------|
| app.exe (当前) | 13.5 MB | ❌ 否 | 个人使用、测试 |
| MSI 安装包 | ~15 MB | ✅ 是 | 正式分发、企业部署 |

---

## 🛠️ 高级用法

### 复制到其他位置

可以将 `app.exe` 复制到任何位置运行：

```powershell
# 复制到桌面
Copy-Item "G:\iMato\desktop-manager\src-tauri\target\release\app.exe" -Destination "$env:USERPROFILE\Desktop\"

# 复制到程序文件夹
Copy-Item "G:\iMato\desktop-manager\src-tauri\target\release\app.exe" -Destination "C:\Program Files\OpenMTSciEd\"
```

### 创建便携包

```powershell
# 创建便携版文件夹
New-Item -ItemType Directory -Path "OpenMTSciEd-Portable" -Force

# 复制可执行文件
Copy-Item "src-tauri\target\release\app.exe" -Destination "OpenMTSciEd-Portable\"

# 压缩打包
Compress-Archive -Path "OpenMTSciEd-Portable" -DestinationPath "OpenMTSciEd-Portable.zip"
```

---

## ⚙️ 数据存储

应用数据存储在：

### Windows
```
%APPDATA%\com.openmtscied.desktop-manager\
```

具体路径：
```
C:\Users\[用户名]\AppData\Roaming\com.openmtscied.desktop-manager\
```

包含：
- SQLite 数据库文件
- 用户上传的课件文件
- 应用配置
- 日志文件

---

## 🔄 更新应用

如果需要更新应用：

1. **重新构建**:
   ```bash
   cd G:\iMato\desktop-manager
   npm run tauri:build
   ```

2. **替换可执行文件**:
   - 新的 `app.exe` 会覆盖旧版本
   - 用户数据保持不变

---

## 🐛 故障排查

### 问题 1: 双击无反应

**解决方案**:
1. 检查是否有杀毒软件阻止
2. 右键 → "以管理员身份运行"
3. 查看事件查看器中的错误日志

### 问题 2: 窗口闪退

**解决方案**:
1. 从命令行运行查看错误信息：
   ```powershell
   .\app.exe
   ```
2. 检查日志文件：
   ```
   %APPDATA%\com.openmtscied.desktop-manager\logs\
   ```

### 问题 3: 数据丢失

**解决方案**:
1. 检查数据目录是否存在
2. 确认有写入权限
3. 查看数据库文件是否损坏

---

## 📝 注意事项

### 安全提示
- ⚠️ 这是开发版本，未经过代码签名
- ⚠️ Windows SmartScreen 可能警告"未知发布者"
- ⚠️ 点击"更多信息" → "仍要运行"即可

### 生产环境
正式发布前建议：
1. ✅ 代码签名（避免 SmartScreen 警告）
2. ✅ 创建 MSI/NSIS 安装包
3. ✅ 添加自动更新功能
4. ✅ 完善错误处理
5. ✅ 性能优化

---

## 🎯 下一步

### 选项 1: 继续使用当前版本
- 直接使用 `app.exe`
- 适合开发和测试

### 选项 2: 等待 MSI 安装包
- 继续等待 WiX 下载完成
- 获得标准 Windows 安装程序
- 适合分发给他人

### 选项 3: 手动创建安装包
我可以帮你：
- 创建 NSIS 安装脚本
- 或使用 Inno Setup
- 或制作绿色版压缩包

---

## 📞 技术支持

如有问题，请联系：
- **项目主页**: https://open-mt-sci-ed.vercel.app/
- **邮箱**: 3936318150@qq.com

---

**生成时间**: 2026-04-11 17:20  
**构建耗时**: ~6 分钟（Angular 15s + Rust 5m41s）  
**版本**: 0.1.0
