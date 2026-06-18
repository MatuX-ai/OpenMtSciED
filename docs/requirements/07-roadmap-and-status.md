# 07 - 路线图与实现状态

## 1. 开发阶段总览

| 阶段 | 名称 | 状态 | 说明 |
|------|------|------|------|
| Phase 1 | 基础建设 | ✅ 已完成 | API、Neo4j、Website、文档体系 |
| Phase 2 | 功能增强 | 🔄 进行中 | 认证、爬虫、Admin、Desktop 完善 |
| Phase 3 | 高级功能 | ⏳ 计划中 | AI、进度追踪、社区、多语言 |
| Phase 4 | 生态建设 | ⏳ 未来 | SDK、插件、商业化 |

---

## 2. Phase 1：基础建设 ✅

| 任务 | 状态 | 备注 |
|------|------|------|
| Next.js 后端搭建 | ✅ | backend-next |
| Neo4j 连接与索引 | ✅ | 6 个索引 |
| 核心 API（教程、课件、路径、推荐、硬件） | ✅ | 44+ 路由 |
| Website 静态站点 | ✅ | 前后端分离 v2.0 |
| 开发者门户整合 | ✅ | developer.html |
| 前端集成指南 | ✅ | FRONTEND_INTEGRATION_* |
| 架构优化（纯 API 后端） | ✅ | v2.0.0 |

---

## 3. Phase 2：功能增强 🔄

| 任务 | 状态 | 备注 |
|------|------|------|
| 用户认证系统 | 🔄 | JWT 登录/注册/me 已完成；资料/密码 API 部分待完善 |
| Admin Web 管理后台 | ✅ | 用户、爬虫、课程、题库等 |
| Desktop Manager 完整功能 | 🔄 | 核心模块已有，AI 路径/Blockly 待完善 |
| 爬虫系统迁移 | 🔄 | 3/5 完成（Khan、OpenStax、Coursera） |
| PostgreSQL + Prisma 用户中心 | ✅ | 2026-04-26 迁移完成 |
| 更多 Tutorial 数据 | ⏳ | 持续增长 |
| Redis 缓存层 | ⏳ | 未开始 |
| API 速率限制 | ⏳ | 未开始 |
| 错误监控 | ⏳ | 未开始 |
| Website 仪表盘真实数据 | ⏳ | 当前为模拟数据 |
| 学习路径闭包表迁移（Neo4j → PostgreSQL） | ⏳ | 见 [REQ-LP-001](./08-learning-path-closure-table-migration.md) |

### 3.1 爬虫迁移进度

| 爬虫 | 状态 |
|------|------|
| Khan Academy | ✅ |
| OpenStax | ✅ |
| Coursera | ✅ |
| edX | ⏳ |
| STEMCloud | ⏳ |

详见 [CRAWLER_MIGRATION_PROGRESS.md](../../backend-next/CRAWLER_MIGRATION_PROGRESS.md)。

### 3.2 子项目完成度估算

| 子项目 | 完成度 | 主要缺口 |
|--------|--------|----------|
| backend-next API | ~85% | 速率限制、缓存、部分 auth 端点 |
| website | ~80% | 仪表盘真实数据、头像上传 |
| desktop-manager | ~75% | AI 路径、Blockly、导入导出 |
| admin-web | ~85% | 批量导入完善 |
| 文档 | ~90% | 本需求文档系新增 |

---

## 4. Phase 3：高级功能 ⏳

| 任务 | 优先级 | 说明 |
|------|--------|------|
| AI 辅助内容生成 | P2 | ai_learning_tasks.json 已有配置雏形 |
| 学习进度追踪 | P1 | LearningRecord 模型已有，前端展示待加强 |
| 社区功能（评论、评分） | P3 | 未开始 |
| 多语言支持 (i18n) | P3 | 未开始 |
| 移动端 App | P3 | 未开始 |
| Website 成就系统 | P2 | dashboard 待改进项 |
| 学习日历与通知 | P3 | 未开始 |

---

## 5. Phase 4：生态建设 ⏳

| 任务 | 说明 |
|------|------|
| npm SDK 发布 | 供第三方 npm install |
| 插件系统 | 扩展 Desktop / API |
| 第三方集成案例 | 除 iMato 外更多示范 |
| 数据分析仪表板 | 运营数据可视化 |
| 商业化方案 | 待定 |

---

## 6. 版本历史

### v2.0.0（2026-05-13）

- 站点架构优化：前后端完全分离
- Website 静态站点整合开发者门户
- 清理 backend-next 重复前端代码
- 统一导航组件系统
- API 服务专注纯后端功能

### v1.0.0（2026-05-13）

- 初始版本发布
- 8 个核心 API 模块
- 开发者门户上线
- 前端集成指南完成
- Neo4j 索引优化

### 用户中心迁移（2026-04-26）

- Admin Web / Desktop / Website API 地址统一至 localhost:3000
- Prisma + PostgreSQL 用户体系
- JWT 认证模块

---

## 7. 已知问题与待改进

### 7.1 Website

- [ ] Dashboard 连接后端真实学习数据
- [ ] 头像上传
- [ ] 加载骨架屏
- [ ] 离线支持

### 7.2 Backend

- [ ] 生产环境 API 认证策略（当前多数端点公开）
- [ ] 统一错误响应格式
- [ ] Redis 缓存

### 7.3 Desktop Manager

- [ ] AI 个性化路径深度集成
- [ ] Blockly 编程环境完善
- [ ] 导入/导出服务完善

### 7.4 Admin Web

- [ ] 用户批量导入稳定性
- [ ] 更多爬虫接入

---

## 8. 里程碑建议

| 里程碑 | 目标日期（建议） | 交付物 |
|--------|-----------------|--------|
| M1: Phase 2 收尾 | Q3 2026 | 认证完善、edX 爬虫、Website 真实数据 |
| M2: Phase 3 启动 | Q4 2026 | 学习进度全链路、AI 路径 Beta |
| M3: SDK Preview | 2027 H1 | npm 包、示例项目 |
| M4: 社区 Beta | 2027 H2 | 评论评分、多语言 |

> 日期为建议性规划，以实际迭代为准。

---

## 9. 验收检查清单（Phase 2 收尾）

- [ ] 所有 P0 功能需求标记为 ✅
- [ ] Website profile 完整对接 auth API
- [ ] Dashboard 展示 LearningRecord 数据
- [ ] 生产环境 SECRET_KEY 非默认值
- [ ] API 文档与端点清单同步
- [ ] edX / STEMCloud 爬虫至少各 1 个可用
- [ ] Desktop 构建产物在 Win/Mac/Linux 可安装运行

---

## 相关文档

- [功能需求](./03-functional-requirements.md)
- [非功能需求](./04-non-functional-requirements.md)
- [项目 README](../../README.md)
- [PROJECT_OVERVIEW.md](../../PROJECT_OVERVIEW.md)

---

*最后更新：2026-06-18*
