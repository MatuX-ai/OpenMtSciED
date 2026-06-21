# OpenMTSciEd 需求文档

## 文档说明

本目录包含 OpenMTSciEd（Open Science & Technology Education）开放 STEM 教育资源平台的**产品需求文档（PRD）**，基于项目代码、数据资产与现有技术文档整理而成。

## 阅读顺序

1. **[项目概述](./01-project-overview.md)** — 了解项目是什么、解决什么问题
2. **[用户与场景](./02-users-and-scenarios.md)** — 明确为谁做、在什么场景下用
3. **[功能需求](./03-functional-requirements.md)** — 各模块具体功能（核心文档）
4. **[非功能需求](./04-non-functional-requirements.md)** — 质量属性与约束
5. **[数据需求](./05-data-requirements.md)** — 数据资产与存储设计
6. **[系统架构](./06-system-architecture.md)** — 子系统划分与技术选型
7. **[路线图与实现状态](./07-roadmap-and-status.md)** — 已完成 / 进行中 / 计划中
8. **[智能STEM课件管理 v2.1](./09-intelligent-courseware-management-v2.md)** — **当前主线**：课题工作室、全网搜闭环、原创激励

## 专项需求

| 文档 | 说明 | 状态 |
|------|------|------|
| **[08 - 学习路径闭包表迁移](./08-learning-path-closure-table-migration.md)** | Neo4j → Neon PostgreSQL 闭包表方案 | ✅ 已完成 |
| **[09 - 智能STEM课件管理 v2.1](./09-intelligent-courseware-management-v2.md)** | 产品定位升级、Topic Studio、激励体系 | ✅ v2.1.0 |
| **[开发计划](../../.qoder/plans/intelligent-courseware-development-plan.md)** | M1–M4 里程碑与任务分解 | ✅ v2.1.0 已交付 |
| **[v2.1.0 发布说明](./RELEASE-v2.1.0.md)** | Phase 2.5 升级、迁移与验收 | 📦 当前版本 |

## 文档约定

| 标记 | 含义 |
|------|------|
| ✅ 已实现 | 代码中已有对应实现，可验证 |
| 🔄 部分实现 | 核心功能可用，仍有缺口或待完善 |
| ⏳ 计划中 | 路线图或文档中规划，尚未实现 |
| ❌ 未实现 | 明确规划但当前不存在 |

## 子项目范围

需求文档覆盖以下子系统：

| 子项目 | 路径 | 角色 |
|--------|------|------|
| 后端 API | `backend-next/` | 统一 REST API、认证、爬虫、知识图谱 |
| 营销网站 | `website/` | 静态展示、开发者门户、轻量用户中心 |
| 桌面客户端 | `desktop-manager/` | 学生学习与资源管理主应用 |
| 管理后台 | `admin-web/` | 管理员运营与内容管理 |
| 数据资产 | `data/` | 课程、题库、知识图谱等 JSON 数据 |

## 版本信息

- **文档版本**: 2.1
- **对应产品版本**: v2.1（智能STEM课件管理主线）
- **最后更新**: 2026-06-21（新增 REQ-ICM v2.1、Topic Studio 开发计划）
