# OpenMTSciEd v0.2.0 开发路线图

本 Issue 追踪 OpenMTSciEd 从 Alpha (v0.1.0) 到 Beta (v0.2.0) 的核心开发任务。

## 🎯 目标

将项目从**示例数据阶段**推进到**可用原型阶段**，实现以下里程碑：
- ✅ 用户认证系统完善（密码哈希）
- ✅ 数据库集成（PostgreSQL + Neo4j）
- ✅ 真实教育资源导入
- ✅ AI 模型基础功能可用
- ✅ 前端路径地图界面完成

---

## 📋 待办任务清单

### 🔐 安全与认证（高优先级）

- [ ] **#1 实现密码哈希** 
  - [ ] 集成 `passlib` + `bcrypt`
  - [ ] 修改 `backend/openmtscied/api/auth_api.py`
  - [ ] 添加单元测试
  - [ ] 更新 `.env.example` 添加 `SECRET_KEY`
  - **标签**: `good first issue`, `security`

- [ ] **#2 JWT Token 刷新机制**
  - [ ] 实现 access_token + refresh_token
  - [ ] 添加 token 黑名单（Redis）
  - **标签**: `enhancement`

---

### 💾 数据库集成（高优先级）

- [ ] **#3 PostgreSQL 用户数据存储**
  - [ ] 设计用户表 Schema
  - [ ] 实现 CRUD API
  - [ ] 迁移现有内存存储到数据库
  - **标签**: `backend`, `database`

- [ ] **#4 Neo4j 知识图谱数据导入**
  - [ ] 编写真实数据导入脚本
  - [ ] 执行 `scripts/graph_db/data_importer.py`
  - [ ] 验证图谱完整性（≥500 节点）
  - **标签**: `data`, `neo4j`

---

### 📚 教育资源获取（中优先级）

- [ ] **#5 OpenStax 教材解析**
  - [ ] 爬取 https://openstax.org/subjects 物理/化学章节
  - [ ] 提取章节结构、先修知识点、公式
  - [ ] 生成 `openstax_chapters.csv`
  - **标签**: `data`, `parser`, `good first issue`

- [ ] **#6 OpenSciEd 课程元数据整理**
  - [ ] 联系官方获取 API 或手动下载 PDF
  - [ ] 解析单元主题、知识点、实验清单
  - [ ] 生成 `openscied_units.csv`
  - **标签**: `data`, `parser`

- [ ] **#7 建立资源价格数据库**
  - [ ] 收集 Arduino 组件市场价格（淘宝/京东）
  - [ ] 确保所有硬件项目预算 ≤50 元
  - **标签**: `hardware`, `data`

---

### 🤖 AI 模型集成（中优先级）

- [ ] **#8 MiniCPM 虚拟导师部署**
  - [ ] 配置 `MINICPM_API_KEY`
  - [ ] 实现 `/api/v1/ai/tutor` 接口
  - [ ] 测试知识点解释功能
  - **标签**: `ai`, `backend`

- [ ] **#9 CodeLlama Blockly 代码生成**
  - [ ] 集成 CodeLlama 模型
  - [ ] 生成过渡项目图形化代码
  - [ ] 验证代码正确率 ≥95%
  - **标签**: `ai`, `blockly`

---

### 🧠 强化学习路径推荐（低优先级）

- [ ] **#10 PPO 模型训练框架**
  - [ ] 收集模拟用户行为数据
  - [ ] 训练初始 PPO 模型
  - [ ] 集成到路径生成算法
  - **标签**: `ml`, `rl`

---

### 🎨 前端开发（中优先级）

- [ ] **#11 PathMap 知识图谱可视化**
  - [ ] 使用 ECharts 绘制图谱
  - [ ] 支持节点点击查看详情
  - [ ] 实现路径高亮显示
  - **标签**: `frontend`, `angular`

- [ ] **#12 WebUSB 硬件烧录功能**
  - [ ] 实现手机直连 Arduino
  - [ ] 提供降级方案（hex 文件下载）
  - **标签**: `hardware`, `webusb`

---

### 📊 测试与优化（低优先级）

- [ ] **#13 单元测试覆盖率提升至 80%**
  - [ ] 后端 API 测试
  - [ ] 服务层逻辑测试
  - **标签**: `testing`

- [ ] **#14 性能优化**
  - [ ] Neo4j 查询优化（添加索引）
  - [ ] API 响应时间 <500ms
  - **标签**: `performance`

---

## 🏷️ 标签说明

| 标签 | 说明 | 适合人群 |
|------|------|---------|
| `good first issue` | 适合新手入门的任务 | 首次贡献者 |
| `backend` | 后端开发任务 | Python/FastAPI 开发者 |
| `frontend` | 前端开发任务 | Angular/TypeScript 开发者 |
| `data` | 数据处理任务 | 数据工程师 |
| `ai` | AI 模型集成 | ML 工程师 |
| `hardware` | 硬件相关任务 | 嵌入式开发者 |
| `documentation` | 文档改进 | 所有人 |
| `testing` | 测试相关 | QA 工程师 |

---

## 📅 预计时间线

- **Week 1-2**: 完成 #1, #3（安全与数据库基础）
- **Week 3-4**: 完成 #5, #6（教育资源导入）
- **Week 5-6**: 完成 #8, #11（AI + 前端核心功能）
- **Week 7-8**: 完成剩余任务，准备 v0.2.0 Beta 发布

---

## 🤝 如何参与

1. **选择任务**: 查看上方清单，找到感兴趣的未分配任务
2. **评论认领**: 在评论区留言 "我来处理 #X"
3. **Fork 仓库**: 创建个人分支
4. **提交 PR**: 完成后发起 Pull Request，关联本 Issue

**首次贡献？** 从标记为 `good first issue` 的任务开始！

---

## 📞 联系方式

- **技术问题**: 在本 Issue 下评论
- **邮件**: contact@imato.edu
- **GitHub Discussions**: https://github.com/iMato/OpenMTSciEd/discussions

---

**最后更新**: 2026-04-10  
**维护者**: OpenMTSciEd 核心团队
