# OpenMTSciEd - STEM 连贯学习路径引擎

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](LICENSE)
[![Python](https://img.shields.io/badge/Python-3.12+-blue.svg)](https://www.python.org/)
[![Angular](https://img.shields.io/badge/Angular-21+-red.svg)](https://angular.dev/)
[![Tauri](https://img.shields.io/badge/Tauri-2.0-FFC131.svg)](https://tauri.app/)

**OpenMTSciEd** 是一个开源的 STEM 教育辅助工具。**核心技术**是通过知识图谱打通 K12 到大学的完整教学路径，整合教程库（OpenSciEd、格物斯坦）与课件库（OpenStax），为学生生成"现象驱动 → 理论深化 → 硬件实践"的连贯学习路径。

## 🚀 核心特性

*   **K12-大学完整路径**：从小学兴趣启蒙到大学专业衔接，覆盖全学段STEM教育资源
*   **双库联动**：自动关联 K-12 现象驱动教程与大学经典教材章节
*   **低成本硬件映射**：为每个知识点匹配预算 ≤50 元的 Arduino/ESP32 实践项目
*   **知识图谱驱动**：基于 Neo4j 构建包含 500+ 节点、1000+ 关系的 STEM 知识图谱
*   **桌面端优先**：核心学习、编程与硬件烧录功能均在 Tauri 桌面应用中完成
*   **离线可用**：支持本地 SQLite 存储资源，无网络环境下依然可以学习

### 🔗 模块关联逻辑

本项目通过 **Neo4j 知识图谱** 将三大核心模块深度串联：

1.  **教程库 (Tutorial Library)**：作为 K-12 阶段的入口。图谱中的 `CourseUnit` 节点记录了 OpenSciEd、格物斯坦等平台的单元信息，并通过 `ALIGNS_WITH` 关系对齐《STEM-PBL 教学标准》。
2.  **课件库 (Courseware Library)**：提供理论深化支持。图谱通过 `PROGRESSES_TO` 关系，将初中/高中的实验教程与 OpenStax 大学的理论章节（`TextbookChapter`）相连，实现“现象→理论”的跨越。
3.  **课程管理 (Course Management)**：提供可视化调度。管理端调用图谱 API，根据用户选择的学科和学段，自动检索出包含教程、课件及硬件项目的连贯路径，并以网状图形式展示。

**数据流向**：底层资源入库 → 建立跨平台/跨学段连线 → 上层应用生成个性化学习路径。

## 📊 当前进展（2026-04-19）

### ✅ 已完成阶段

| 阶段 | 任务 | 状态 |
|------|------|------|
| **阶段A** | 资源获取与知识图谱构建 | ✅ 100% 完成 |
| **阶段B** | 学习路径原型开发 | ✅ 100% 完成 |
| **阶段C** | 硬件与课件库联动开发 | ✅ 100% 完成 |
| **阶段D** | 测试与优化 | ⏳ 进行中 |

### 🎯 核心成果

- **课程资源**: 4,740+ 个STEM课程（含编程、游戏开发、Arduino、ROS等专项课程）
- **知识图谱**: 500+ 节点，1000+ 关系（Neo4j）
- **硬件项目**: 30+ 个低成本项目（预算≤50元）
- **Blockly积木**: 9 个硬件积木块（数字/模拟/传感器/电机/通信）
- **AI任务**: 2 个理论-实践映射任务（可扩展）
- **前端组件**: PathMap可视化、WebUSB烧录、AI导师等

## 🏗️ 技术架构

| 模块 | 技术栈 | 说明 |
| :--- | :--- | :--- |
| **路径引擎** | FastAPI, SQLite | **核心服务**：基于标签匹配生成 STEM 学习路径，支持离线运行。 |
| **AI 辅助** | Python, LLM API | 统一 AI 服务：生成课程大纲、理论-实践联动解释。 |
| **桌面客户端** | Tauri (Rust), Angular | 资源管理、Blockly 编程、WebUSB 硬件烧录。 |
| **知识图谱** | Neo4j | 维护复杂的知识点先修关系与跨学科关联。 |
| **全局存储** | Neon (PostgreSQL) | 存储用户画像与长期学习进度。 |

## 📦 快速开始

### 1. 环境准备
*   Python 3.12+
*   Node.js 18+ & npm
*   Rust (用于 Tauri 开发)
*   Neo4j 数据库实例

### 2. 安装依赖
```bash
# 克隆仓库
git clone https://github.com/MatuX-ai/OpenMtSciED.git
cd OpenMtSciED

# 安装后端依赖
pip install -r requirements.txt

# 安装桌面端依赖
cd desktop-manager
npm install
```

### 3. 启动服务
```bash
# 启动后端 API (默认端口 8000)
cd backend
python -m uvicorn openmtscied.main:app --host 0.0.0.0 --port 8000 --reload

# 启动桌面客户端开发模式
cd desktop-manager
npm run tauri dev

# 启动Web前端（用户端 - http://localhost:3000）
cd frontend
npm run dev

# 启动Admin后台（管理端 - http://localhost:4200）
cd admin-web
npm start
```

## 📂 项目结构

```
OpenMTSciEd/
├── backend/openmtscied/      # Python 后端核心 (FastAPI)
│   ├── api/                  # RESTful API路由
│   ├── models/               # Pydantic数据模型
│   ├── services/             # 业务逻辑服务
│   │   ├── path_generator.py         # 路径生成服务
│   │   ├── blockly_generator.py      # Blockly代码生成
│   │   ├── hardware_blockly_blocks.py # 硬件积木块定义
│   │   ├── theory_practice_mapper.py # AI理论-实践映射
│   │   └── webusb_flash_service.py   # WebUSB烧录服务
│   └── data/                 # 数据模型
│       ├── hardware_projects.py      # 硬件项目库
│       └── transition_projects.py    # 过渡项目库
├── frontend/                 # Web前端应用（Angular）
│   └── src/app/
│       ├── auth/             # 认证模块
│       ├── path-visualization/ # 路径可视化
│       └── marketing-home/   # 营销首页
├── admin-web/                # 管理后台（Angular）
├── desktop-manager/          # Tauri + Angular 桌面客户端
├── ai-service/               # AI服务（独立服务）
├── website/                  # 营销网站
├── data/                     # 数据文件
│   ├── databases/            # 数据库文件
│   ├── course_library/       # 教程库（OpenSciEd、格物斯坦等）
│   ├── textbook_library/     # 课件库（OpenStax等）
│   ├── hardware_projects.json # 硬件项目数据
│   └── ai_learning_tasks.json # AI学习任务
├── datasets/                 # 数据集和缓存
├── scripts/                  # 数据处理与爬虫脚本
│   ├── db_management/        # 数据库管理脚本
│   ├── data_processing/      # 数据处理脚本
│   ├── scrapers/             # 资源爬取器
│   └── graph_db/             # Neo4j导入脚本
├── docs/                     # 技术文档
├── models/                   # AI模型文件
├── logs/                     # 日志文件
├── tests/                    # 测试文件
```

## 🤝 贡献指南

我们欢迎任何形式的贡献！在提交 PR 之前，请阅读 [CONTRIBUTING.md](CONTRIBUTING.md)。

1.  Fork 本仓库
2.  创建你的特性分支 (\git checkout -b feature/AmazingFeature\)
3.  提交你的改动 (\git commit -m 'Add some AmazingFeature'\)
4.  推送到分支 (\git push origin feature/AmazingFeature\)
5.  开启一个 Pull Request

## 📄 许可证

本项目采用 Apache 2.0 许可证。详见 [LICENSE](LICENSE) 文件。

## 📧 联系我们

*   项目主页: [GitHub Repository](https://github.com/MatuX-ai/OpenMtSciED)
*   联系邮箱: dev@openmtscied.org

---
*Powered by MatuX AI Team*
