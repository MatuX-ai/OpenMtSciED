# Desktop Manager 快速测试指南

## 🚀 快速开始

### 1. 启动应用进行手动测试

```bash
# 进入项目目录
cd g:\iMato\desktop-manager

# 启动开发服务器（已在运行）
# 访问: http://localhost:4200/
```

### 2. 测试各个页面

#### ✅ 测试初始化向导
- **URL**: `http://localhost:4200/setup-wizard`
- **测试点**:
  - [ ] 页面正常加载
  - [ ] 表单字段显示正确
  - [ ] 必填字段验证工作
  - [ ] 可以提交表单

#### ✅ 测试统一资源库
- **URL**: `http://localhost:4200/resource-explorer`
- **旧路由兼容**（应自动重定向）:
  - `/tutorial-library` → `/resource-explorer?type=tutorial`
  - `/material-library?search=foo` → `/resource-explorer?search=foo&type=material`
  - `/resource-browser` → `/resource-explorer`
- **测试点**:
  - [ ] 左侧资源树与搜索框正常
  - [ ] 新建教程按钮可点击
  - [ ] 选中节点后右侧详情面板更新
  - [ ] 旧书签 URL 重定向后 query 参数保留

#### ✅ 测试知识图谱（三 Tab）
- **URL**: `http://localhost:4200/knowledge-graph`
- **旧路由兼容**:
  - `/path-visualization` → `/knowledge-graph?tab=path`
  - `/search-map` → `/knowledge-graph?tab=search`
- **测试点**:
  - [ ] 「学习路径图谱」「个性化路径」「知识点搜索」三个 Tab 可切换
  - [ ] 节点点击跳转到统一资源库或硬件项目

---

## 📝 手动测试检查清单

### 基础功能测试

```
✅ 应用启动
   □ 访问 http://localhost:4200/
   □ 自动重定向到 /setup-wizard
   
✅ 初始化向导
   □ 教师姓名字段
   □ 学校名称字段
   □ 学科选择下拉框
   □ 表单验证
   □ 提交按钮
   
✅ 统一资源库 (/resource-explorer)
   □ 资源树展开与搜索
   □ 新建/编辑/删除本地教程
   □ 旧路由重定向（tutorial-library、material-library、resource-browser）

✅ 知识图谱 (/knowledge-graph)
   □ 三 Tab 切换
   □ 个性化路径生成
   □ 知识点搜索
   □ 旧路由重定向（path-visualization、search-map）
```

### Tauri 桌面应用测试

```bash
# 启动完整的 Tauri 应用
npm run tauri:dev
```

**测试点**:
- [ ] 桌面窗口正常打开
- [ ] 所有 Web 功能在桌面环境中正常工作
- [ ] Tauri API 调用成功（课程和课件的 CRUD 操作）
- [ ] 文件系统操作正常
- [ ] 数据库操作正常

---

## 🔍 常见问题排查

### 问题 1: 页面无法访问
**症状**: 浏览器显示无法连接到 localhost:4200

**解决方案**:
```bash
# 检查开发服务器是否运行
# 应该看到类似输出:
# ➜  Local:   http://localhost:4200/

# 如果没有运行，重新启动
npm run start
```

### 问题 2: 样式丢失
**症状**: 页面内容显示但样式不正确

**解决方案**:
- 清除浏览器缓存
- 硬刷新页面 (Ctrl + Shift + R)
- 检查 Angular Material 主题是否正确加载

### 问题 3: Tauri 命令失败
**症状**: 课程或课件操作失败，控制台显示错误

**解决方案**:
```bash
# 检查 Rust 后端是否编译成功
cd src-tauri
cargo check

# 查看详细的错误日志
# 在浏览器开发者工具的 Console 标签中查看
```

### 问题 4: 数据不持久化
**症状**: 刷新页面后数据丢失

**说明**: 
- 当前使用模拟数据或内存存储
- Setup Wizard 的配置持久化尚未实现（TODO）
- 课程和课件数据通过 Tauri SQLite 数据库存储

---

## 🧪 自动化测试（可选）

### 安装 Puppeteer

```bash
npm install puppeteer --save-dev
```

### 运行自动化测试

```bash
node run-tests.js
# 或
node e2e-test.js
```

自动化测试覆盖：
1. 应用加载与登录页布局
2. 初始化向导表单
3. 统一资源库与旧路由重定向
4. 知识图谱三 Tab 与可视化旧路由重定向
5. 新建教程流程

---

## 📊 测试结果记录

### 测试日期: ___________

### 测试环境
- OS: Windows 11
- Node.js: v______
- Browser: Chrome/Edge/Firefox
- Tauri: v2.x.x

### 测试结果

| 模块 | 测试项 | 状态 | 备注 |
|------|--------|------|------|
| Setup Wizard | 页面加载 | □ | |
| Setup Wizard | 表单验证 | □ | |
| Resource Explorer | 页面加载 | □ | `/resource-explorer` |
| Resource Explorer | 旧路由重定向 | □ | |
| Resource Explorer | 新建教程 | □ | |
| Knowledge Graph | 三 Tab | □ | |
| Knowledge Graph | 旧路由重定向 | □ | |

### 发现的问题

1. _______________________________________
2. _______________________________________
3. _______________________________________

### 总体评价

□ 优秀 - 所有功能正常工作  
□ 良好 - 主要功能正常，有小问题  
□ 一般 - 部分功能需要修复  
□ 较差 - 多个关键问题需要解决

---

## 💡 测试建议

### 边界情况测试
1. 尝试创建空名称的课程
2. 尝试上传超大文件
3. 快速连续点击操作按钮
4. 在网络断开时操作（如果可能）
5. 同时打开多个标签页

### 用户体验测试
1. 界面是否直观易用？
2. 错误提示是否清晰？
3. 加载状态是否有反馈？
4. 操作流程是否流畅？

### 性能测试
1. 创建大量课程（50+）时的表现
2. 上传大文件时的响应
3. 页面切换速度
4. 内存使用情况

---

## 📞 获取帮助

如遇到问题：
1. 查看浏览器控制台错误信息
2. 检查终端输出
3. 查看 E2E_TEST_GUIDE.md 获取详细文档
4. 联系开发团队

---

**祝测试顺利！** 🎉
