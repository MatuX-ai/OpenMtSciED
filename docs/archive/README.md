# 文档归档目录

本目录存放已废弃或已被新版替代的技术文档和报告。

## 📁 归档内容

### ArcadeDB相关（已废弃的技术栈）
项目原计划使用ArcadeDB替代Neo4j，但最终决定继续使用Neo4j，因此相关文档归档于此。

- `ARCADEDB_ADAPTER_README.md` - ArcadeDB适配器说明
- `ARCADEDB_ARCHITECTURE.md` - ArcadeDB架构设计
- `ARCADEDB_FILES_SUMMARY.md` - ArcadeDB文件总结
- `ARCADEDB_TEST_REPORT.md` - ArcadeDB测试报告
- `QUICKSTART_ARCADEDB.md` - ArcadeDB快速开始指南

### 异步数据库相关（已整合）
异步数据库功能已整合到主代码库中，独立文档不再需要。

- `ASYNC_DATABASE_COMPLETION_REPORT.md` - 异步数据库完成报告
- `ASYNC_DATABASE_GUIDE.md` - 异步数据库使用指南
- `ASYNC_DB_QUICKSTART.md` - 异步数据库快速开始

### 其他旧报告
已被新版报告替代或已过时的文档。

- `ADMIN_DATABASE_TABLES_COMPLETION.md`
- `COMPLETION_REPORT_EDUCATION_PLATFORMS.md`
- `EDUCATION_PLATFORMS_README.md`
- `HARDWARE_PROJECT_API_INTEGRATION.md`
- `HARDWARE_PROJECT_COMPLETION_REPORT.md`
- `PPO_REMOVAL_SUMMARY.md`
- `REAL_DATA_CRAWLER_COMPLETION_REPORT.md`
- `REAL_DATA_CRAWLER_USAGE.md`
- `TECH_STACK_CHANGE_NOTICE.md`

## 🔍 如何使用

这些文档仅供历史参考，**不建议**作为当前开发的依据。

如需了解最新的项目状态，请查看：
- [README.md](../README.md) - 项目概述
- [DEVELOPMENT_SUMMARY.md](../DEVELOPMENT_SUMMARY.md) - 开发总结
- [PROJECT_PROGRESS_OVERVIEW.md](../PROJECT_PROGRESS_OVERVIEW.md) - 进度总览

## 📅 归档日期

2026-04-19

## ⚠️ 注意事项

- 这些文档可能包含过时的信息
- 代码实现可能已发生重大变化
- 如需恢复某个文档到根目录，请使用git命令：
  ```bash
  git checkout HEAD~1 -- docs/archive/FILENAME.md
  mv docs/archive/FILENAME.md .
  ```
