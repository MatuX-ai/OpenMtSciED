# 本地数据存储功能测试指南

## 已实现的功能

### 1. Rust 后端命令

#### `get_storage_info` - 获取存储信息
- **位置**: `src-tauri/src/commands/storage.rs`
- **功能**: 
  - 返回应用数据路径
  - 返回数据库路径
  - 返回课件存储路径
  - 计算磁盘总空间和可用空间
  - 统计课件数量和已用空间
  - 估算未来增长空间（基于平均每课件 10MB）

#### `get_folder_size` - 计算文件夹大小
- **位置**: `src-tauri/src/commands/storage.rs`
- **功能**: 递归计算指定文件夹的总大小

### 2. 前端服务封装

#### TauriService 新增方法
- **位置**: `src/app/core/services/tauri.service.ts`
- **方法**:
  - `getStorageInfo()`: 调用后端 `get_storage_info` 命令
  - `getFolderSize(path: string)`: 调用后端 `get_folder_size` 命令

### 3. UI 组件

#### Setup Wizard - 步骤3：数据存储
- **位置**: `src/app/features/setup-wizard/setup-wizard.component.ts`
- **功能**:
  - 显示数据库存储路径
  - 显示课件存储目录
  - 数据安全提示
  - 建议预留空间提示

#### Settings Component - 设置页面
- **位置**: `src/app/features/settings/settings.component.ts`
- **路由**: `/settings`
- **功能**:
  - 存储空间可视化进度条
  - 显示已用/可用空间
  - 显示数据库路径
  - 显示课件存储路径
  - 显示课件数量
  - 显示预估增长空间
  - 快速操作按钮（清理缓存、备份数据、打开文件夹）

### 4. 自动目录创建

应用启动时自动创建以下目录：
- `%APPDATA%\com.openmtscied.desktop-manager\` - 主数据目录
- `%APPDATA%\com.openmtscied.desktop-manager\materials\` - 课件存储目录
- `%APPDATA%\com.openmtscied.desktop-manager\backups\` - 备份目录

## 测试步骤

### 测试 1: 验证编译成功
```bash
# Rust 后端编译
cd src-tauri
cargo build --release

# Angular 前端编译
cd ..
npm run start
```

**预期结果**: 
- Rust 编译无错误
- Angular 开发服务器在 http://localhost:4200/ 正常运行

### 测试 2: 完成向导流程
1. 访问 http://localhost:4200/
2. 填写教师信息（姓名、学校、学科）
3. 进入"步骤3：数据存储"
4. 验证是否显示：
   - 数据库路径
   - 课件存储目录
   - 数据安全提示
5. 点击"进入系统"

**预期结果**:
- 所有步骤正常显示
- 路径正确显示为 Windows 格式
- 导航到仪表盘页面

### 测试 3: 访问设置页面
1. 在仪表盘中点击"设置"卡片
2. 或直接访问 http://localhost:4200/settings
3. 验证是否显示：
   - 存储空间进度条
   - 已用空间和可用空间
   - 数据库路径
   - 课件存储路径
   - 课件数量
   - 预估增长空间

**预期结果**:
- 所有存储信息正确显示
- 进度条根据实际使用情况渲染
- 路径格式正确

### 测试 4: 验证目录创建
```powershell
# 检查目录是否存在
Test-Path "$env:APPDATA\com.openmtscied.desktop-manager"
Test-Path "$env:APPDATA\com.openmtscied.desktop-manager\materials"
Test-Path "$env:APPDATA\com.openmtscied.desktop-manager\backups"
```

**预期结果**:
- 三个目录都存在
- 可以正常读写

### 测试 5: 验证数据库初始化
```powershell
# 检查数据库文件是否存在
Test-Path "$env:APPDATA\com.openmtscied.desktop-manager\openmtscied.db"
```

**预期结果**:
- 数据库文件存在
- 包含正确的表结构（courses, materials）

## 技术细节

### 依赖项
- **Rust**:
  - `fs2 = "0.4"` - 获取磁盘空间信息
  - `walkdir = "2"` - 遍历目录计算大小
  - `rusqlite` - SQLite 数据库
  - `serde` - 序列化/反序列化

- **Angular**:
  - `@angular/material` - Material Design 组件
  - `@angular/router` - 路由管理

### 数据结构

#### StorageInfo (Rust)
```rust
pub struct StorageInfo {
    pub data_path: String,
    pub database_path: String,
    pub materials_path: String,
    pub total_space: u64,
    pub free_space: u64,
    pub used_space: u64,
    pub material_count: i64,
    pub estimated_growth: String,
}
```

#### StorageInfo (TypeScript)
```typescript
export interface StorageInfo {
  data_path: string;
  database_path: string;
  materials_path: string;
  total_space: number;
  free_space: number;
  used_space: number;
  material_count: number;
  estimated_growth: string;
}
```

### 关键代码位置

1. **Rust 命令注册**: `src-tauri/src/lib.rs` (第 53-54 行)
2. **目录创建**: `src-tauri/src/lib.rs` (第 23-30 行)
3. **存储命令实现**: `src-tauri/src/commands/storage.rs`
4. **前端服务**: `src/app/core/services/tauri.service.ts` (第 132-139 行)
5. **设置页面**: `src/app/features/settings/settings.component.ts`
6. **向导步骤3**: `src/app/features/setup-wizard/setup-wizard.component.ts` (模板约 130-160 行)
7. **路由配置**: `src/app/app.routes.ts` (第 29-33 行)

## 已知问题和注意事项

1. **磁盘空间计算**: 当前使用简化算法（total = free + used），Windows 上可以使用 `GetDiskFreeSpaceEx` API 获取更精确的总空间
2. **预估增长**: 基于平均每课件 10MB 的假设，实际可能因课件类型而异
3. **编码问题**: 确保所有 TypeScript 文件使用 UTF-8 编码保存，避免中文乱码
4. **权限问题**: 应用需要读写 `%APPDATA%` 目录的权限

## 下一步改进建议

1. **添加存储清理功能**: 允许用户清理未使用的课件文件
2. **添加备份功能**: 实现数据库和课件文件的自动备份
3. **添加存储警告**: 当可用空间低于阈值时发出警告
4. **添加自定义存储路径**: 允许用户选择自定义的数据存储位置
5. **添加详细的存储分析**: 按课程分类显示存储使用情况
6. **添加压缩功能**: 对旧课件进行压缩以节省空间
