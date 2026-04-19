# OpenMTSciEd 快速参考指南

**最后更新**: 2026-04-19  
**版本**: v1.0

---

## 🚀 快速开始

### 启动后端服务
```bash
cd backend/openmtscied
python main.py
```
访问: http://localhost:8000/docs

### 启动Web前端
```bash
cd frontend
npm install
npm run dev
```
访问: http://localhost:5173

### 启动桌面应用（开发模式）
```bash
cd desktop-manager
npm install
npm run tauri dev
```

---

## 📂 核心目录说明

### 后端代码
```
backend/openmtscied/
├── api/              # FastAPI路由（5个endpoint文件）
├── models/           # Pydantic数据模型
├── services/         # 业务逻辑服务
│   ├── path_generator.py      # 学习路径生成
│   ├── hardware_projects.py   # 硬件项目管理
│   ├── blockly_service.py     # Blockly代码生成
│   └── ...
├── data/             # 本地数据存储
│   ├── knowledge_graph.json
│   ├── hardware_projects.json
│   └── ...
└── main.py           # FastAPI入口
```

### 前端代码
```
frontend/src/
├── app/
│   ├── components/
│   │   ├── learning-path/       # 学习路径可视化
│   │   ├── hardware-lab/        # 硬件实验室
│   │   └── ...
│   ├── services/                # API服务
│   └── models/                  # TypeScript模型
└── assets/                      # 静态资源
```

### 数据文件
```
data/
├── course_library/              # 课程库（JSON格式）
├── textbook_library/            # 教材库
├── knowledge_graph.json         # 知识图谱备份
├── hardware_projects.json       # 硬件项目库
├── blockly_hardware_blocks.json # Blockly积木定义
└── ai_learning_tasks.json       # AI学习任务
```

### 文档
```
docs/
├── archive/                     # 归档的旧文档
├── ARCHITECTURE.md              # 系统架构
├── KNOWLEDGE_GRAPH_ARCHITECTURE.md  # 知识图谱设计
└── ...                          # 其他技术文档
```

### 测试报告
```
backtest_reports/
├── phase_a/                     # 阶段A报告（资源获取）
├── phase_b/                     # 阶段B报告（路径生成）
├── phase_c/                     # 阶段C报告（硬件联动）
└── *.md                         # 汇总报告
```

### 工具脚本
```
tools/
├── testing/                     # 测试和检查脚本
│   ├── check_*.py              # 数据检查
│   ├── test_*.py               # 功能测试
│   └── verify_*.py             # 验证脚本
└── scrapers/                    # 爬虫脚本
    ├── scrape_openscied.py
    ├── scrape_gewulab.py
    └── ...
```

---

## 🔑 关键技术栈

| 层级 | 技术 | 版本 | 用途 |
|------|------|------|------|
| **后端** | Python | 3.12+ | 主要编程语言 |
| | FastAPI | 0.135.2 | Web框架 |
| | Pydantic | 2.12.5 | 数据验证 |
| | Neo4j | 5.x | 图数据库 |
| **前端** | Angular | 21.x | Web框架 |
| | TypeScript | 5.x | 类型安全 |
| | ECharts | 6.0.0 | 数据可视化 |
| **桌面端** | Tauri | 2.0 | 跨平台桌面应用 |
| | Rust | - | 原生模块 |
| **AI** | MiniCPM-2B | 规划中 | 智能推荐 |

---

## 📊 项目成果统计

### 数据规模
- **课程资源**: 4,740+ 个STEM课程
- **知识图谱**: 491节点 + 455关系（Neo4j）
- **硬件项目**: 30+ 个低成本项目（预算≤50元）
- **Blockly积木**: 9个硬件积木块
- **AI任务**: 2个理论-实践映射任务

### 代码统计
- **后端代码**: ~3,340行（16个文件）
- **前端代码**: ~2,600行（Angular组件）
- **测试脚本**: ~30个（位于tools/testing/）

---

## 🎯 核心功能

### 1. 知识图谱驱动的学习路径
- 基于Neo4j图数据库
- 支持K12到大学的完整路径
- 个性化推荐算法

### 2. 硬件项目联动
- Arduino/ESP32项目库
- 预算控制（≤50元）
- Blockly可视化编程
- WebUSB烧录支持

### 3. AI辅助教学
- 理论-实践自动映射
- 智能任务生成
- 学习进度跟踪

---

## 🔍 常用查询

### 查看项目进度
```bash
cat PROJECT_PROGRESS_OVERVIEW.md
```

### 查看开发总结
```bash
cat DEVELOPMENT_SUMMARY.md
```

### 查看特定阶段报告
```bash
# 阶段A：知识图谱构建
cat backtest_reports/phase_a/PHASE_A_COMPLETION_REPORT.md

# 阶段B：路径生成
cat backtest_reports/phase_b/openmtscied_t2.1_completion_report.md

# 阶段C：硬件联动
cat backtest_reports/phase_c/openmtscied_t3.1_completion_report.md
```

### 运行测试脚本
```bash
# 检查Neo4j连接
python tools/testing/verify_neo4j_connection.py

# 测试硬件项目API
python tools/testing/test_hardware_project_api.py

# 检查数据库配置
python tools/testing/check_db_url.py
```

---

## ⚙️ 环境配置

### 必需的环境变量
创建 `.env` 文件（不要提交到git）：

```bash
# Neo4j配置
NEO4J_URI=bolt://localhost:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=your_password

# 数据库URL（如使用Neon）
DATABASE_URL=postgresql://user:pass@host:5432/dbname

# API密钥（如需要）
OPENAI_API_KEY=sk-...
```

### 安装依赖
```bash
# 后端
pip install -r requirements.txt

# 前端
cd frontend
npm install

# 桌面端
cd desktop-manager
npm install
```

---

## 🐛 常见问题

### 1. Neo4j连接失败
**症状**: `SSL handshake failed`  
**解决**: 检查 `.env` 中的 `NEO4J_URI`，确保使用正确的协议（bolt://或 bolt+s://）

### 2. 前端编译错误
**症状**: `Module not found`  
**解决**: 
```bash
cd frontend
rm -rf node_modules
npm install
```

### 3. 数据库初始化失败
**症状**: 表不存在错误  
**解决**: 
```bash
python init_neon_db.py
```

### 4. 端口被占用
**症状**: `Address already in use`  
**解决**: 修改 `backend/openmtscied/main.py` 中的端口号

---

## 📞 获取帮助

### 文档
- [README.md](README.md) - 项目概述
- [DEVELOPMENT_SUMMARY.md](DEVELOPMENT_SUMMARY.md) - 开发总结
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) - 系统架构

### 清理报告
- [CLEANUP_REPORT_20260419.md](CLEANUP_REPORT_20260419.md) - 文件整理详情

### 联系团队
- **邮箱**: dev@openmtscied.org
- **GitHub**: https://github.com/MatuX-AI/OpenMTSciEd

---

## 🔄 定期维护

### 每周
- 运行测试脚本验证系统状态
- 检查Neo4j连接和数据完整性

### 每月
- 更新项目进度文档
- 清理临时文件和测试数据
- 审查并归档旧报告

### 每季度
- 全面清理项目目录
- 更新依赖包版本
- 审查.gitignore配置

---

**提示**: 本指南会随着项目发展持续更新，如发现过时信息，请及时反馈。
