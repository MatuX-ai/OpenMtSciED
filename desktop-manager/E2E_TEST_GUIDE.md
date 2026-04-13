# Desktop Manager 端到端测试指南

## 测试环境准备

### 1. Web 版本测试（开发模式）

#### 启动开发服务器
```bash
cd desktop-manager
npm run start
```

服务器将启动在：`http://localhost:4200/`

### 2. Tauri 桌面应用测试

#### 开发模式运行
```bash
cd desktop-manager
npm run tauri:dev
```

这将同时启动 Angular 开发服务器和 Tauri 桌面窗口。

#### 生产构建测试
```bash
cd desktop-manager
npm run tauri:build
```

构建完成后，可执行文件位于：`src-tauri/target/release/bundle/`

---

## 功能测试清单

### ✅ 测试场景 1：初始化向导 (Setup Wizard)

**访问路径**: `http://localhost:4200/setup-wizard` 或应用启动时的默认页面

**测试步骤**:
1. 打开应用，应该自动跳转到初始化向导页面
2. 填写教师姓名（必填）
3. 填写学校名称（必填）
4. 选择任教学科（物理/化学/生物）
5. 点击"完成设置"按钮

**预期结果**:
- 表单验证正常工作（必填字段不能为空）
- 提交后应该保存配置（目前为 TODO，需要实现）
- 可以导航到课程库页面（目前路由已注释，需要启用）

**当前状态**: ⚠️ 部分功能待实现
- [x] UI 界面完成
- [x] 表单验证
- [ ] 配置持久化存储
- [ ] 完成后自动跳转

---

### ✅ 测试场景 2：课程库管理 (Course Library)

**访问路径**: `http://localhost:4200/course-library`

**测试步骤**:

#### 2.1 查看课程列表
1. 进入课程库页面
2. 查看现有课程列表（目前使用模拟数据）

**预期结果**:
- 显示课程卡片列表
- 每个课程显示：名称、描述、分类、创建时间
- 空状态提示（当没有课程时）

#### 2.2 创建新课程
1. 点击右上角"➕ 新建课程"按钮
2. 在对话框中填写：
   - 课程名称（必填）
   - 课程描述
   - 课程分类（物理/化学/生物）
3. 点击"保存"按钮

**预期结果**:
- 表单验证正常工作
- 调用 Tauri 后端 API 创建课程
- 成功后关闭对话框并刷新列表
- 显示成功提示消息

#### 2.3 编辑课程
1. 点击任意课程的"✏️ 编辑"按钮
2. 修改课程信息
3. 点击"保存"按钮

**预期结果**:
- 对话框预填充当前课程信息
- 更新成功后刷新列表
- 显示成功提示

#### 2.4 删除课程
1. 点击任意课程的"🗑️ 删除"按钮
2. 确认删除操作

**预期结果**:
- 弹出确认对话框
- 确认后调用 Tauri API 删除课程
- 成功后刷新列表
- 显示删除成功提示

**当前状态**: ✅ 已完成 Tauri 集成
- [x] UI 界面完成
- [x] Tauri 服务集成
- [x] CRUD 操作完整
- [x] 错误处理
- [x] 用户反馈（SnackBar）

---

### ✅ 测试场景 3：课件库管理 (Material Library)

**访问路径**: `http://localhost:4200/material-library`

**测试步骤**:

#### 3.1 查看课件列表
1. 进入课件库页面
2. 使用"选择课程"下拉框筛选课件
3. 查看课件卡片列表

**预期结果**:
- 显示课件卡片（图标、名称、文件大小、路径、创建时间）
- 可以根据课程筛选
- 显示空状态提示

#### 3.2 上传课件
1. 点击右上角"📤 上传课件"按钮
2. 在对话框中填写：
   - 课件名称（自动从文件名提取，可修改）
   - 选择所属课程（必填）
   - 选择文件（点击或拖拽）
3. 点击"上传"按钮

**预期结果**:
- 文件选择后自动填充课件名称
- 表单验证（所有字段必填）
- 调用 Tauri API 上传课件
- 成功后关闭对话框并刷新列表
- 显示上传成功提示

#### 3.3 下载课件
1. 点击课件卡片的"⬇️ 下载"按钮

**预期结果**:
- 触发文件下载（功能待实现）

#### 3.4 删除课件
1. 点击课件卡片的"🗑️ 删除"按钮
2. 确认删除操作

**预期结果**:
- 弹出确认对话框
- 确认后调用 Tauri API 删除课件
- 成功后刷新列表
- 显示删除成功提示

**当前状态**: ✅ 已完成 Tauri 集成
- [x] UI 界面完成
- [x] Tauri 服务集成
- [x] 课件列表加载
- [x] 课件上传功能
- [x] 课件删除功能
- [x] 课程筛选
- [ ] 课件下载功能（待实现）

---

## Tauri 后端 API 测试

### 课程管理 API

```rust
// 获取所有课程
GET courses -> Vec<Course>

// 创建课程
POST create_course { name, description, category } -> Course

// 更新课程
PUT update_course { id, name, description, category } -> Course

// 删除课程
DELETE delete_course { id } -> ()
```

### 课件管理 API

```rust
// 获取课件列表（可选按课程筛选）
GET materials?course_id=1 -> Vec<Material>

// 上传课件
POST upload_material { name, file_path, file_size, course_id } -> Material

// 删除课件
DELETE delete_material { id } -> ()
```

---

## 手动测试流程

### 完整用户旅程测试

1. **首次使用应用**
   ```
   启动应用 → 初始化向导 → 填写信息 → 完成设置 → 进入课程库
   ```

2. **创建第一个课程**
   ```
   课程库页面 → 点击新建 → 填写课程信息 → 保存 → 验证课程出现在列表中
   ```

3. **为课程添加课件**
   ```
   课件库页面 → 选择课程 → 点击上传 → 选择文件 → 填写信息 → 上传 → 验证课件出现
   ```

4. **管理课程内容**
   ```
   编辑课程信息 → 删除不需要的课程 → 删除课件 → 验证操作成功
   ```

---

## 自动化测试建议

### 未来可以添加的自动化测试

1. **单元测试**
   - 组件逻辑测试
   - 服务层测试
   - 工具函数测试

2. **集成测试**
   - Tauri 命令测试
   - 数据库操作测试
   - API 接口测试

3. **E2E 测试工具推荐**
   - **Playwright**: 跨浏览器 E2E 测试
   - **Cypress**: Web 应用 E2E 测试
   - **Tauri Driver**: Tauri 应用自动化测试

### Playwright 示例配置

```typescript
// e2e/tests/course.spec.ts
import { test, expect } from '@playwright/test';

test('创建新课程', async ({ page }) => {
  await page.goto('http://localhost:4200/course-library');
  
  // 点击新建课程按钮
  await page.click('button:has-text("新建课程")');
  
  // 填写表单
  await page.fill('input[placeholder="请输入课程名称"]', '测试课程');
  await page.fill('textarea', '这是一个测试课程');
  await page.selectOption('mat-select', 'physics');
  
  // 保存
  await page.click('button:has-text("保存")');
  
  // 验证课程出现在列表中
  await expect(page.locator('mat-card-title:has-text("测试课程")')).toBeVisible();
});
```

---

## 已知问题和待办事项

### Setup Wizard
- [ ] 实现配置持久化存储（LocalStorage 或 Tauri Store）
- [ ] 启用完成后的路由跳转
- [ ] 添加配置编辑功能

### Course Library
- [x] 所有功能已完成

### Material Library
- [ ] 实现真实的文件上传（目前使用模拟路径）
- [ ] 实现课件下载功能
- [ ] 添加文件预览功能
- [ ] 支持批量上传

### 通用
- [ ] 添加加载状态指示器
- [ ] 优化错误处理和用户提示
- [ ] 添加离线支持
- [ ] 性能优化（大数据量时的虚拟滚动）

---

## 测试报告模板

### 测试执行记录

**测试日期**: YYYY-MM-DD  
**测试人员**: [姓名]  
**测试环境**: 
- OS: Windows 11 / macOS / Linux
- Node.js: v18.x.x
- Tauri: v2.x.x
- Angular: v17.x.x

| 测试场景 | 状态 | 备注 |
|---------|------|------|
| 初始化向导 | ⚠️ 部分通过 | 配置存储待实现 |
| 课程创建 | ✅ 通过 | - |
| 课程编辑 | ✅ 通过 | - |
| 课程删除 | ✅ 通过 | - |
| 课件上传 | ✅ 通过 | 文件路径为模拟 |
| 课件删除 | ✅ 通过 | - |
| 课件下载 | ❌ 未实现 | 待开发 |

---

## 快速开始测试

```bash
# 1. 安装依赖
cd desktop-manager
npm install

# 2. 启动 Web 版本进行测试
npm run start

# 3. 在浏览器中访问 http://localhost:4200/

# 4. 或者启动完整的 Tauri 桌面应用
npm run tauri:dev
```

---

## 联系与支持

如有问题或建议，请联系：
- Email: 3936318150@qq.com
- 项目仓库: [GitHub Repository](https://github.com/your-repo)
