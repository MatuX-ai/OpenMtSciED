# STEM教程课件搜索引擎与爬虫系统 - 需求文档

## 1. 项目定位

本项目（OpenMTSciEd）是一个 **开放STEM教育资源平台**，定位为**非学科教育**领域。

### 1.1 内容范围

| 可收录（STEM非学科） | 不可收录（K12学科类） |
|---|---|
| 编程开发（Python、JavaScript、算法） | 语文（阅读理解、作文、古诗词） |
| 机器人制作（Arduino、传感器、电机控制） | 数学（算术、代数、几何、三角函数） |
| 电子制作（电路设计、焊接、PCB） | 英语（语法、单词、阅读理解） |
| 人工智能（机器学习、深度学习、AI应用） | 政治（思想品德、道德与法治） |
| 物联网（IoT、智能硬件、无线通信） | 历史（朝代、历史事件、人物） |
| 3D打印（建模、切片、打印实践） | 地理（自然地理、人文地理） |
| 创客项目（跨学科综合实践） | K12级别物理/化学/生物标准课程 |
| 科学探究（现象驱动、实验验证） | 经济学（非大学级别） |
| 无人机/智能小车（组装、编队控制） | — |
| 大学级别专业课程 | — |

### 1.2 核心原则

- 内容以 **项目/现象/探究** 为导向，而非 **考试/标准/理论** 为导向
- 鼓励动手实践（实验、搭建、编程），拒绝纯理论灌输
- 服务于教育者、开发者、学生及教育科技公司
- 资源匮乏地区的学生也能免费获取前沿STEM教育内容

---

## 2. 爬虫引擎需求

### 2.1 系统架构

```
┌─────────────────────────────────────┐
│         爬虫管理 API                 │
│  /api/v1/admin/crawler/*            │
│                                     │
│  ┌─────────┐  ┌─────────┐          │
│  │ 注册系统 │  │ 执行引擎 │          │
│  └────┬────┘  └────┬────┘          │
│       │            │               │
│  ┌────▼────────────▼────┐          │
│  │   5个爬虫处理器       │          │
│  │ OpenScied / Khan     │          │
│  │ OpenStax / Coursera  │          │
│  │ BNU Shanghai         │          │
│  └─────────┬────────────┘          │
│            │ 写入                  │
└────────────┼───────────────────────┘
             │
    ┌────────▼────────┐
    │   data/*.json   │
    │  course_library  │
    │  textbook_library│
    └────────┬────────┘
             │ 读取
    ┌────────▼────────┐
    │  搜索引擎 API    │
    │  /libraries/*   │
    └─────────────────┘
```

### 2.2 功能需求

#### FR-C1: 爬虫注册
- 支持通过注册系统将爬虫处理器注册到全局注册表
- 每个爬虫有唯一 ID、名称、描述

#### FR-C2: 爬虫执行
- 支持手动触发执行指定爬虫
- 执行过程中更新状态（idle → running → completed/failed）
- 记录执行结果（条目数、错误信息、最后运行时间）

#### FR-C3: 爬虫调度
- 支持定时任务（基于 cron 表达式）
- 支持设置调度间隔

#### FR-C4: K12过滤
- 所有爬虫在保存数据前必须调用 `isK12Academic()` 过滤
- 过滤规则见本文档 1.1 节
- 过滤日志记录被移除的条目数和内容

#### FR-C5: 数据源
目前支持的5个数据源：

| 爬虫ID | 数据源 | 级别 | 内容类型 |
|---|---|---|---|
| openscied_units | OpenSciEd | 初中/高中 | 现象驱动科学探究单元 |
| khan_academy | Khan Academy | K12+ | STEM课程（仅保留计算机/编程） |
| openstax_textbooks | OpenStax | 大学 | 教材章节（物理/化学/生物/数学） |
| coursera | Coursera | 大学 | 专业课程 |
| bnu_shanghai | 北师大/上海教育局 | 混合 | K12教育课程 |

---

## 3. 搜索引擎需求

### 3.1 系统架构

```
┌──────────────────────────────────────────────┐
│             前端展示层                        │
│  ┌──────────────────────────────────────┐    │
│  │  首页首焦图搜索组件                   │    │
│  │  - 类型筛选标签（全部/教程/课件/硬件） │    │
│  │  - 搜索输入框 + 搜索按钮              │    │
│  │  - 热门搜索关键词胶囊                 │    │
│  │  - 下拉结果面板                      │    │
│  └──────────────┬───────────────────────┘    │
│                 │ HTTP fetch                  │
├─────────────────▼────────────────────────────┤
│              API 服务层                       │
│  ┌──────────────────────────────────────┐    │
│  │  统一搜索  /libraries/search         │    │
│  │  热门搜索  /libraries/hot-searches   │    │
│  │  自动补全  /libraries/suggestions    │    │
│  │  教程列表  /libraries/tutorials      │    │
│  │  课件列表  /libraries/materials      │    │
│  └──────────────┬───────────────────────┘    │
│                 │ K12 filter                  │
├─────────────────▼────────────────────────────┤
│              数据层                           │
│  data/course_library/*.json                  │
│  data/textbook_library/*.json                │
│  data/hardware_projects.json                 │
└──────────────────────────────────────────────┘
```

### 3.2 API端点需求

#### FR-S1: 统一搜索 `/api/v1/libraries/search`
- **方法**: GET
- **参数**: `q` (关键词), `type` (all/tutorial/material/hardware), `limit`
- **功能**: 跨教程库+课件库+硬件项目联合搜索
- **评分**: 完全匹配(100分) > 前缀匹配(50分) > 子串匹配(20分) > 分词匹配(10分)
- **过滤**: 输出前经过 `isK12Academic()` 过滤
- **响应**: `{ success, data[], total, totalBeforeFilter, query, type }`

#### FR-S2: 热门搜索 `/api/v1/libraries/hot-searches`
- **方法**: GET
- **功能**: 返回预定义的STEM热门搜索关键词
- **内容**: Arduino、机器人、Python、AI、物联网、3D打印、编程入门、创客等
- **响应**: `{ success, data[{ keyword, icon, category, description }] }`

#### FR-S3: 自动补全 `/api/v1/libraries/suggestions`
- **方法**: GET
- **参数**: `q` (前缀), `limit`
- **功能**: 从教程和课件标题中匹配建议
- **过滤**: 跳过 K12 学科类标题
- **排序**: 前缀匹配 > 长度排序

#### FR-S4: 教程列表 `/api/v1/libraries/tutorials`
- **方法**: GET
- **参数**: `search`, `source`, `subject`, `skip`, `limit`
- **过滤**: 输出前经过 `filterOutK12Academic()` 过滤

#### FR-S5: 课件列表 `/api/v1/libraries/materials`
- **方法**: GET
- **参数**: `search`, `source`, `subject`, `grade_level`, `material_type`, `skip`, `limit`
- **过滤**: 输出前经过 `filterOutK12Academic()` 过滤

### 3.3 前端交互需求

#### FR-UI1: 首页搜索引擎组件
- 位于首页首焦图中心位置（标题和CTA按钮之间）
- 玻璃拟态设计，与深色主题融合

#### FR-UI2: 类型筛选标签
- 全部 / 📚教程 / 📖课件 / 🔧硬件
- 选中状态高亮（渐变背景）
- 切换时重新搜索

#### FR-UI3: 搜索框
- 大尺寸居中，圆角16px
- 聚焦时发光边框动画
- 加载热门STEM关键词作为placeholder

#### FR-UI4: 热门搜索胶囊
- 首屏加载时从API获取热门搜索词
- 点击即触发搜索
- API不可用时使用备用关键词

#### FR-UI5: 结果下拉面板
- 实时显示搜索结果（300ms防抖）
- 按资源类型展示不同颜色标签
- 显示来源、学科分类
- 点击结果跳转到对应URL
- ESC关闭、Enter触发、点击外部关闭

---

## 4. K12过滤实现规范

### 4.1 过滤模块

**文件**: `backend-next/lib/k12-filter.ts`

提供三个导出函数：
- `isK12Academic(item)` → boolean：判断单条内容是否为K12学科类
- `filterOutK12Academic(items[])` → T[]：从数组中过滤掉K12内容
- `isSTEMNonAcademic(item)` → boolean：与 `isK12Academic` 相反

### 4.2 过滤规则

| 规则 | 条件 | 动作 |
|---|---|---|
| 硬黑名单 | subject ∈ {语文, 数学, 英语, 政治, 历史, 地理, ...} | 过滤 |
| 经济学 | subject = 经济学 AND grade_level ≠ university | 过滤 |
| 物理/化学/生物 | subject ∈ {物理, 化学, 生物} AND source = khan_academy | 过滤 |
| 物理/化学/生物 | subject ∈ {物理, 化学, 生物} AND source ≠ khan_academy | 保留 |
| K12标题关键词 | title 含 作业/考试/复习/练习册/课本/教材 | 过滤 |
| 其他 | 默认 | 保留 |

### 4.3 过滤器集成点

| 集成点 | 位置 | 过滤方式 |
|---|---|---|
| 统一搜索API | `search/route.ts` 结果输出前 | `isK12Academic` 逐个判断 |
| 教程API | `tutorials/route.ts` 分页前 | `filterOutK12Academic` 批量过滤 |
| 课件API | `materials/route.ts` 分页前 | `filterOutK12Academic` 批量过滤 |
| 建议API | `suggestions/route.ts` 标题筛选时 | `isK12Academic` 跳过匹配项 |
| 爬虫保存 | Khan Academy 数据生成器 | `filterOutK12Academic` 保存前过滤 |
| 数据清理 | `scripts/clean-k12-data.ts` | 扫描并清理现有JSON文件 |

---

## 5. 数据流

```
数据采集                   数据存储                 数据消费
─────────               ──────────               ──────────
OpenSciEd ──爬虫──┐                             网站首页搜索
Khan Academy ──┬──┤                             桌面端搜索
OpenStax ──────┤  ├──→ data/*.json ──→ 搜索引擎 ──→ 开发者门户
Coursera ──────┤  │                     ↑         API查询
BNU Shanghai ──┘  │                     │
                   └── K12过滤───────────┘
                        (isK12Academic)
```

## 6. 验证方式

### 6.1 功能验证

| 测试场景 | 输入 | 预期结果 |
|---|---|---|
| 搜索K12学科 | q=数学 | totalBeforeFilter > total（部分被过滤） |
| 搜索STEM内容 | q=Arduino | total = totalBeforeFilter（全部保留） |
| 搜索物理/化学 | q=物理 | OpenSciEd保留，Khan过滤 |
| 热门搜索 | GET /hot-searches | 返回15个STEM关键词 |
| 自动补全 | q=Python | 返回Python相关建议 |

### 6.2 构建验证

```bash
cd backend-next
npx next build       # TypeScript编译 + Next.js构建
npm run dev          # 启动开发服务器
curl /api/v1/libraries/search?q=测试  # API测试
```
