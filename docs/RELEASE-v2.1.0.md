# OpenMTSciEd v2.1.0 发布说明

**版本**：v2.1.0（智能课件管理 · Phase 2.5）  
**发布日期**：2026-06-21  
**代号**：Intelligent Courseware

---

## 概述

v2.1.0 将 OpenMTSciEd 桌面端从「资源浏览器」升级为 **课件智能管理与教学图谱编排平台**。本版本交付课题工作室（Topic Studio）六步向导、搜索纳入教程闭环、图谱挂接、创课分（CC）激励、发布审核与公开资源库，并 **移除 Blockly 内置编辑器**（Out of Scope）。

涉及子项目：

| 子项目 | 版本建议 | 说明 |
|--------|----------|------|
| `desktop-manager` | **0.2.0** → 建议 bump 至 **0.2.0** 或 **2.1.0** | 主交付面 |
| `backend-next` | 随 API 增量部署 | 新 Prisma 模型与路由 |
| `admin-web` | 随后台增量部署 | 发布审核、抄袭举报 |

---

## 亮点功能

### 课题工作室（Topic Studio）

- 六步向导：提出课题 → AI 大纲 → 确认教程 → 匹配资源 → 品牌化 → 保存/发布
- 本地草稿 + 可选云端同步（JWT 登录后）
- M1 大纲为规则模板 stub，后续可接 LLM proxy

### 搜索 → 纳入教程

- 全局搜索（Ctrl+K）与智能搜索面板支持「加入教程」
- 课件上传后规则版关联建议
- 引用型资源强制填写 attribution（来源 URL / 许可证）

### 图谱与编排（M2）

- 确认教程后自动挂接知识图谱节点
- 图谱节点详情反查关联教程
- 品牌模板（水印 / Logo / 页脚）+ 教学包 JSON 导出

### 创课分与创作者中心（M2）

- CC 积分：保存教程 +10、上传课件 +30、挂接图谱 +15、发布通过 +100、精选 +200 等
- `/creator-center`：等级、流水、创课榜 Top N
- 本地离线计分 + 登录后同步后端

### 发布生态（M3）

- 发布范围：私有 / 校内 / 平台公开
- 发布前版权确认 + 自动审核（元数据、attribution、重复度、新账号 7 天禁公开）
- 公开资源库 `/public-library`
- Admin：**发布审核队列**、**抄袭举报处理**、**T+7 延迟 CC 结算**

### M4 清理

- 删除 Blockly 编辑器组件与 `blockly` npm 依赖
- 硬件项目「开始编程」改为「加入课题」→ Topic Studio
- 旧 URL `/hardware-projects/:id/editor` 重定向至硬件列表

---

## 破坏性变更

| 变更 | 影响 | 应对 |
|------|------|------|
| **Blockly 编辑器移除** | 无法再打开可视化积木编程 | 使用课题工作室或教师自有 IDE；硬件项目仅作资源匹配 |
| **`/hardware-projects/:id/editor`** | 旧书签失效 | 自动 redirect 至 `/hardware-projects` |
| **产品定位** | 不再内置 Scratch/代码 IDE | 见 PRD v2.1 Out of Scope |

数据文件中的 `blockly_xml`、`language: blockly` 字段 **保留**（只读元数据），不影响运行。

---

## 新增路由（Desktop）

| 路径 | 说明 |
|------|------|
| `/topic-studio` | 课题工作室列表 |
| `/topic-studio/:draftId` | 六步向导 |
| `/creator-center` | 创作者中心 |
| `/public-library` | 公开资源库 |

## 新增路由（Admin Web）

| 路径 | 说明 |
|------|------|
| `/admin/publish-review` | 发布审核队列 |
| `/admin/plagiarism` | 抄袭举报处理 |

## 新增 API（Backend）

<details>
<summary>点击展开完整 API 列表</summary>

**Topic Studio**

- `GET/POST /api/v1/topic-studio/drafts`
- `GET/PUT/DELETE /api/v1/topic-studio/drafts/[id]`
- `POST /api/v1/topic-studio/drafts/[id]/generate-outline`
- `POST /api/v1/topic-studio/drafts/[id]/publish`

**M2**

- `POST /api/v1/knowledge-graph/nodes/link-tutorial`
- `GET /api/v1/knowledge-graph/nodes/[conceptId]/resources`
- `GET /api/v1/creators/me`
- `GET /api/v1/creators/ledger`
- `POST /api/v1/creators/award`
- `GET/POST /api/v1/creators/brand-templates`
- `POST /api/v1/resources/attributions`
- `POST /api/v1/materials/auto-link`

**M3**

- `GET /api/v1/public/library`
- `GET /api/v1/creators/leaderboard`
- `GET /api/v1/creators/publish-requests`
- `POST /api/v1/plagiarism/report`
- `GET /api/v1/admin/publish-requests`
- `POST /api/v1/admin/publish-requests/[id]/review`
- `POST /api/v1/admin/publish-requests/process-payouts`
- `GET /api/v1/admin/plagiarism`
- `POST /api/v1/admin/plagiarism/[id]/resolve`

</details>

---

## 数据库迁移

**必须**在部署 backend-next 前执行：

```bash
cd backend-next
npx prisma migrate deploy
npx prisma generate
```

新增迁移（按时间顺序）：

1. `20260621_add_topic_draft` — 课题草稿
2. `20260621_m2_creator_credits` — CC、attribution、品牌模板、图谱挂接
3. `20260621_m3_publish_ecosystem` — 教学包、发布审核、抄袭举报

---

## 部署清单

### 1. 后端

```bash
cd backend-next
npm ci
npx prisma migrate deploy
npx prisma generate
npm run build   # 若项目有 build 脚本
npm run start   # 或生产环境 pm2/docker
```

环境变量：`DATABASE_URL`、JWT 密钥等保持与现网一致。

### 2. Admin Web

```bash
cd admin-web
npm ci
npm run build
# 部署 dist/admin-web 至静态托管或反向代理
```

### 3. Desktop Manager

```bash
cd desktop-manager
npm ci
npm run build
npm run tauri:build   # 需要 Rust 工具链，产出安装包
```

开发调试：

```bash
npm run start          # 默认 :4200，proxy 至 backend
npm run tauri:dev
```

### 4. T+7 创课分结算（可选 cron）

```bash
cd backend-next
npx tsx scripts/process-credit-payouts.ts
```

或在 Admin Web → 发布审核 →「执行 T+7 积分结算」。

---

## 验收结果（2026-06-21）

| 检查项 | 结果 |
|--------|------|
| `desktop-manager` build | ✅ |
| `admin-web` build | ✅ |
| `backend-next` tsc | ✅ |
| Desktop E2E | ✅ **35/35**（6 场景） |

建议上线前人工冒烟：

1. 课题工作室走完 6 步，选「平台公开」提交  
2. Admin 审核通过 → Desktop 公开资源库可搜到  
3. Admin T+7 结算 → 创作者中心 CC +100  
4. 确认 Blockly 路由与依赖已不可用  

---

## 已知限制

- AI 大纲仍为 **规则模板**，未接 LLM  
- M2/M3 新流程 **无专属 E2E**，仅 topic-studio 基础流程有自动化测试  
- **Website** 公开库页面未在本版本实现（仅 Desktop + API）  
- **数字证书 PDF**（M3-7 P2）未实现  
- Windows 上 `prisma generate` 偶发 EPERM，需本地重跑  
- 未登录时 CC / 发布 / 公开库以 **localStorage 降级**，完整生态需 JWT + PostgreSQL  

---

## 相关文档

- [PRD v2.1 — 智能课件管理](./requirements/09-intelligent-courseware-management-v2.md)
- [开发计划 M1–M4](../.qoder/plans/intelligent-courseware-development-plan.md)
- [路线图与实现状态](./requirements/07-roadmap-and-status.md)
- [Desktop CHANGELOG](../desktop-manager/CHANGELOG.md)

---

## 升级建议版本号

打 Git tag 前建议同步 bump：

```text
desktop-manager/package.json          → "0.2.0" 或 "2.1.0"
desktop-manager/src-tauri/tauri.conf.json  → 同上
```

Tag 示例：`v2.1.0`

```bash
git tag -a v2.1.0 -m "OpenMTSciEd v2.1.0: Intelligent Courseware (Phase 2.5)"
git push origin v2.1.0
```

GitHub Release 正文可直接复制本文件「概述」至「验收结果」章节。

---

**OpenMTSciEd Team · MatuX**
