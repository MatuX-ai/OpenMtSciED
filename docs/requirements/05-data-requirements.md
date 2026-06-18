# 05 - 数据需求

## 1. 数据存储架构

OpenMTSciEd 采用**双数据库**架构：

| 存储 | 技术 | 用途 |
|------|------|------|
| 图数据库 | Neo4j Aura | 知识图谱、教程、课件、硬件项目、学习路径 |
| 关系数据库 | PostgreSQL (Neon) + Prisma | 用户、课程、学习记录、题库、爬虫配置 |

本地 JSON 文件（`data/`）作为**数据源与离线资产**，供爬虫输出与 Desktop 本地使用。

---

## 2. Neo4j 图数据模型

### 2.1 节点类型

| 节点 | 说明 | 规模 |
|------|------|------|
| KnowledgePoint | 知识点 | 4,623 |
| CourseUnit | 课程单元 | 2,225 |
| Question | 题目（图侧） | 1,080 |
| TextbookChapter | 教材章节 | 1,058 |
| Course | 课程 | 540 |
| Subject | 学科 | 15 |
| Tutorial | 教程 | 持续增长 |
| HardwareProject | 硬件项目 | 14 |

### 2.2 关系类型

| 关系 | 说明 | 数量 |
|------|------|------|
| PROGRESSES_TO | 先修/进阶关系（学习路径核心） | 28,380 |
| CONTAINS | 包含关系（如课程含单元） | 4,612 |
| BELONGS_TO | 归属关系（如单元归属学科） | 539 |
| RELATED_TO_SUBJECT | 与学科关联 | 154 |

### 2.3 关键属性示例

**Tutorial 节点**：
- id, title, description, grade_level, subject
- duration_minutes, difficulty_level, content
- created_at, updated_at

**HardwareProject 节点**：
- id, title, description, difficulty (beginner/intermediate/advanced)
- category (electronics/robotics/programming)
- hardware_list, related_knowledge_points, estimated_hours

---

## 3. PostgreSQL 关系模型（Prisma）

### 3.1 核心表

| 模型 | 说明 | 关键字段 |
|------|------|----------|
| User | 用户 | username, email, password, role, imatuUserId, isActive |
| Course | 课程 | courseId, title, subject, gradeLevel, source, metadata |
| LearningRecord | 学习记录 | userId, courseId, progress, score, completedAt |
| Question | 题目 | title, content, type, difficulty, subject, options, answer |
| Assignment | 作业/练习 | userId, questionId, userAnswer, isCorrect, score |
| CrawlerConfig | 爬虫配置 | id, name, type, status, progress, scheduleInterval |
| EducationPlatform | 教育平台 | platformName, source, targetUrl, lastSync, totalItems |

### 3.2 用户角色

```
role: "user" | "admin"
```

---

## 4. 本地 JSON 数据资产 (`data/`)

### 4.1 课程库 (`data/course_library/`)

| 文件 | 来源/说明 |
|------|----------|
| khan_academy_courses.json | Khan Academy K-12 STEM |
| openstax_* / openscied_* | OpenSciEd 各学段单元 |
| coursera_university_courses.json | Coursera 大学课程 |
| edx_courses.json | edX 课程 |
| mit_opencourseware_courses.json | MIT OCW |
| arduino_courses.json | Arduino 相关 |
| ros_courses.json | ROS 机器人 |
| chinese_mooc_courses.json | 中国 MOOC |
| k12_massive_courses.json | K12 大规模课程集 |
| stemcloud_courses.json | STEMCloud |
| 等 20+ 文件 | 多平台聚合 |

### 4.2 教材库 (`data/textbook_library/`)

| 文件 | 说明 |
|------|------|
| openstax_chapters.csv | OpenStax 章节 |
| stem_materials_extended.json | 扩展 STEM 教材 |
| ccf_courses.json | CCF 相关 |
| ciee_robotics.json | 机器人教材 |
| ted_ed_courses.json | TED-Ed |

### 4.3 题库 (`data/question_library/`)

| 文件 | 说明 |
|------|------|
| stem_education_questions.json | STEM 基础题库 |
| stem_education_extended.json | 扩展题库 |
| openstax_biology_questions.json | OpenStax 生物题 |
| test_openstax_questions.json | 测试题 |

### 4.4 其他数据

| 文件 | 说明 |
|------|------|
| knowledge_graph.json | 知识图谱导出/快照 |
| hardware_projects.json | 硬件项目定义 |
| resource_associations.json | 资源关联映射 |
| blockly_hardware_blocks.json | Blockly 硬件积木 |
| ai_learning_tasks.json | AI 学习任务配置 |
| transition_projects.json | 过渡/衔接项目 |
| crawler_configs.json | 爬虫配置快照 |
| user_testing/* | 用户测试数据与反馈 |

---

## 5. 数据质量要求

| ID | 要求 | 优先级 |
|----|------|--------|
| DR-1 | 课程/教程需含 title、subject，id 唯一 | P0 |
| DR-2 | 知识图谱 PROGRESSES_TO 无环或可控环 | P1 |
| DR-3 | 题目需含 answer 与 type | P0 |
| DR-4 | 爬虫输出 JSON 符合约定 schema | P1 |
| DR-5 | 导入前去重（courseId、username 等） | P1 |
| DR-6 | 元数据 JSON 字段可扩展（metadata Json） | P2 |

---

## 6. 数据采集需求

### 6.1 已支持爬虫

| 爬虫 ID | 数据源 | 输出 |
|---------|--------|------|
| khan_academy | Khan Academy | course_library/khan_academy_courses.json |
| openstax | OpenStax 教材 | textbook_library/openstax_chapters |
| coursera | Coursera | course_library/coursera_university_courses.json |

### 6.2 计划爬虫

- edX 课程爬虫
- STEMCloud 爬虫
- 其他教育平台（见 CRAWLER_MIGRATION_PROGRESS.md）

### 6.3 爬虫运行要求

- 支持手动触发与定时调度（scheduleInterval 小时）
- 记录 status、progress、errorMessage、lastRun
- 输出文件路径可配置（outputFile）

---

## 7. 数据同步与一致性

| 场景 | 策略 |
|------|------|
| 爬虫 → JSON → Neo4j/PostgreSQL | 管理员触发导入或 ETL 脚本 |
| Desktop 本地 SQLite | 与云端 API 可选同步 |
| 知识图谱更新 | Admin 知识图谱管理 + Neo4j 直接操作 |
| 学习路径依赖（计划中） | 迁移至 PostgreSQL 闭包表，见 [08 - 闭包表迁移](./08-learning-path-closure-table-migration.md) |
| 用户学习记录 | 以 PostgreSQL LearningRecord 为准 |

---

## 8. 备份与恢复

| 需求 | 状态 |
|------|------|
| Neo4j Aura 云备份 | ✅ 由 Aura 提供 |
| PostgreSQL Neon 备份 | ✅ 由 Neon 提供 |
| `data/` JSON 版本控制 | ✅ Git 管理 |
| Desktop SQLite 用户导出 | 🔄 导入/导出服务 |

---

## 相关文档

- [功能需求 — 爬虫](./03-functional-requirements.md#fr-112-爬虫与数据采集)
- [backend-next/prisma/schema.prisma](../../backend-next/prisma/schema.prisma)
- [08 - 学习路径闭包表迁移](./08-learning-path-closure-table-migration.md)
