# OpenMTSciEd - 连贯学习路径引擎

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](LICENSE)
[![Python](https://img.shields.io/badge/Python-3.12+-blue.svg)](https://www.python.org/)
[![Tauri](https://img.shields.io/badge/Tauri-2.0-FFC131.svg)](https://tauri.app/)
[![Angular](https://img.shields.io/badge/Angular-18+-dd0031.svg)](https://angular.io/)

**OpenMTSciEd** 是一个基于知识图谱的 STEM 连贯学习路径引擎。它打通了教程库（如 OpenSciEd、格物斯坦）与课件库（如 OpenStax），为 K-12 到大学阶段的学生提供自适应、项目驱动的 STEM 学习体验。

## 🚀 核心特性

*   **连贯路径生成**：基于 Neo4j 知识图谱，自动生成现象驱动  理论深化  硬件实践的学习闭环。
*   **双库联动**：整合开源教程与经典教材，解决知识点跳跃问题。
*   **硬件映射**：自动匹配低成本（50元）Arduino/ESP32 硬件项目，支持 WebUSB 一键烧录。
*   **AI 辅助过渡**：利用 LLM 解释跨学段知识点关联，提供个性化 AI 导师服务。
*   **多端支持**：提供 FastAPI 后端服务、Tauri 桌面客户端及响应式 Web 营销页。

## 🏗️ 技术架构

| 模块 | 技术栈 | 说明 |
| :--- | :--- | :--- |
| **后端引擎** | Python, FastAPI, Neo4j | 路径算法、资源管理、知识图谱查询 |
| **桌面客户端** | Tauri (Rust), Angular | 本地资源管理、离线支持、硬件通信 |
| **Web 前端** | Angular, ECharts | 路径可视化地图、交互式学习界面 |
| **数据存储** | PostgreSQL, MongoDB, Supabase | 结构化数据、非结构化资源存储 |

## 📦 快速开始

### 1. 环境准备
*   Python 3.12+
*   Node.js 18+ & npm
*   Rust (用于 Tauri 开发)
*   Neo4j 数据库实例

### 2. 安装依赖
`\"ash
# 克隆仓库
git clone https://github.com/MatuX-ai/OpenMtSciED.git
cd OpenMtSciED

# 安装后端依赖
pip install -r requirements.txt

# 安装桌面端依赖
cd desktop-manager
npm install
\\\

### 3. 启动服务
`\"ash
# 启动后端 API (默认端口 8000)
python src/openmtscied/main.py

# 启动桌面客户端开发模式
cd desktop-manager
npm run tauri dev
\\\

## 📂 项目结构

`\"	ext
OpenMTSciEd/
 src/                  # Python 后端核心 (FastAPI)
    openmtscied/      # 路径引擎与 API 逻辑
    services/         # 业务服务 (Graph, Blockly, etc.)
 desktop-manager/      # Tauri + Angular 桌面客户端
 frontend/             # 独立功能前端组件
 web/marketing/        # 营销展示页面
 tools/                # 数据处理与迁移脚本
 datasets/             # 原始教程与课件数据
 docs/                 # 详细技术文档与设计规范
\\\

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
