# OpenMTSciEd - STEM连贯学习路径引擎

> **⚠️ Alpha 版本 (v0.1.0)**: 本项目处于早期开发阶段，部分功能尚未完善。查看 [已知限制](#已知限制) 了解详情。

## 项目概述

OpenMTSciEd (Open MatuX Science Education) 是一个独立开源的STEM连贯学习路径引擎,打通课程库(OpenSciEd/格物斯坦/stemcloud.cn)与课件库(OpenStax/TED-Ed/STEM-PBL标准),形成"小学→初中→高中→大学"的连贯学习路径。

## 在线演示

- 🌐 **营销页面**: https://open-mt-sci-ed.vercel.app/
- 💻 **GitHub仓库**: https://github.com/MatuX-ai/OpenMtSciED

## 项目愿景与价值

OpenMTSciEd 致力于通过技术手段解决**教育资源不均**与**学段知识割裂**的痛点：

*   **打破学段壁垒**：利用 Neo4j 知识图谱打通 K-12 实践与大学理论，构建从"兴趣启蒙"到"专业衔接"的连贯路径。
*   **普惠教育实践**：所有硬件项目预算严格控制在 **≤50元**，并通过 WebUSB 实现手机直连烧录，让资源匮乏地区的学生也能享受前沿 STEM 教育。
*   **AI 驱动个性化**：集成 PPO 强化学习与 MiniCPM 虚拟导师，为每位学生提供自适应的学习难度调整和苏格拉底式的逻辑引导。
*   **开源生态共建**：作为 MatuX 项目的独立开源模块，我们欢迎全球开发者共同完善这张"STEM 知识地图"。

## 核心特性

- **知识图谱驱动**: 基于Neo4j构建课程库与课件库的关联网络
- **自适应学习路径**: 使用PPO强化学习算法推荐个性化学习路径
- **硬件项目联动**: 低成本Arduino项目(预算≤50元)支持WebUSB一键烧录
- **AI虚拟导师**: MiniCPM模型解释知识点衔接逻辑
- **Blockly图形化编程**: 过渡项目帮助学生理解抽象概念

## 技术架构

### 前端
- Angular 21 + TypeScript 5.9 + Sass
- ECharts知识图谱可视化
- Blockly图形化编程集成
- WebUSB硬件通信

### 后端
- FastAPI (Python 3.11)
- Neo4j图数据库
- PostgreSQL元数据存储
- MongoDB非结构化数据
- Redis缓存

### AI
- MiniCPM-2B知识点关联分析
- CodeLlama Blockly代码生成
- Stable Baselines3 PPO路径推荐

## 快速开始

### 1. 安装依赖

```bash
pip install -r requirements.txt
```

### 2. 配置环境变量

```bash
cp .env.example .env
# 编辑 .env 文件，设置您的密码和 API 密钥
```

**重要**: 请勿使用默认密码，生产环境必须修改 `.env` 中的密码。

### 3. 运行课程库元数据提取 (T1.1)

```bash
python scripts/parsers/course_library_parser.py
```

交付物:
- `data/course_library/openscied_units.csv`
- `data/course_library/gewustan_courses.json`
- `data/course_library/stemcloud_courses.json`

### 4. 运行课件库元数据提取 (T1.2)

```bash
python scripts/parsers/textbook_library_parser.py
```

交付物:
- `data/textbook_library/openstax_chapters.csv`
- `data/textbook_library/ted_ed_courses.json`
- `data/textbook_library/stem_pbl_standard.json`

## 项目结构

```
OpenMTSciEd/
├── backend/                    # 后端代码（教育引擎）
│   └── openmtscied/
│       ├── api/               # FastAPI路由
│       ├── services/          # 业务逻辑服务
│       ├── models/            # Pydantic数据模型
│       ├── rl/                # 强化学习模块
│       └── data/              # 数据集
├── frontend/                   # 前端代码（学习引擎 UI）
│   └── src/app/
│       ├── search-map/        # 知识图谱可视化
│       └── app.routes.ts      # 路由配置
├── marketing-site-only/        # 营销网站（Vercel部署）
│   ├── index.html             # 营销主页
│   └── docs/                  # 特性页面
├── scripts/                   # 脚本工具
│   ├── parsers/              # 资源解析器
│   │   ├── course_library_parser.py    # T1.1
│   │   └── textbook_library_parser.py  # T1.2
│   └── graph_db/             # 知识图谱脚本
│       ├── schema_creation.cypher      # T1.3
│       ├── constraints_and_indexes.cypher
│       ├── data_importer.py            # T1.4
│       └── validation_tests.py
├── data/                      # 数据文件
│   ├── course_library/       # 课程库元数据
│   └── textbook_library/     # 课件库元数据
├── docs/                      # 技术文档
├── reports/                   # 测试报告
├── backtest_reports/         # 回测报告
├── requirements.txt          # Python依赖
└── README.md
```

## 开发计划

### 阶段1: 资源解析与知识图谱构建 (15人天)
- [x] T1.1 课程库元数据提取
- [ ] T1.2 课件库元数据提取
- [ ] T1.3 知识图谱节点/关系建模
- [ ] T1.4 图谱数据导入与校验

### 阶段2: 学习路径原型开发 (12人天)
- [ ] T2.1 路径生成算法开发
- [ ] T2.2 过渡项目设计
- [ ] T2.3 前端路径地图界面

### 阶段3: 硬件与课件库联动开发 (14人天)
- [ ] T3.1 硬件项目库开发
- [ ] T3.2 Blockly代码生成集成
- [ ] T3.3 课件库理论映射集成

### 阶段4: 测试与优化 (9人天)
- [ ] T4.1 用户测试与反馈收集
- [ ] T4.2 性能优化与部署

## 验收标准

1. **知识图谱覆盖率**: 课程库核心单元100%映射课件库对应先修章节,跨学科关联准确率≥90%
2. **路径连贯性**: 每个课程库单元→课件库章节过渡节点有≥1个过渡项目+1个硬件综合项目
3. **硬件适配性**: 所有项目材料成本≤50元,支持Type-C直连手机(WebUSB),代码生成正确率≥95%
4. **用户体验**: 用户完成路径的平均时长较单一课程缩短30%,硬件项目完成率≥70%
5. **AI操作能力**: AI能精准执行"推荐路径、生成联动项目、解释衔接逻辑"等操作,响应延迟≤500ms

## 许可证

本项目采用MIT许可证开源。

## 已知限制

### 当前版本 (v0.1.0 Alpha)

本项目处于 **Alpha 开发阶段**，以下功能尚未完全实现：

#### 🔧 待完善的核心功能

1. **用户认证系统**
   - 密码哈希未启用（当前使用明文存储，仅用于开发测试）
   - 生产环境需集成 `passlib` + `bcrypt` 进行密码加密
   - 追踪 Issue: [#1](https://github.com/MatuX-ai/OpenMtSciED/issues/1)

2. **数据库集成**
   - 用户进度数据暂未持久化到 PostgreSQL
   - 知识图谱查询返回示例数据，需导入真实资源后启用
   - 追踪 Issue: [#2](https://github.com/MatuX-ai/OpenMtSciED/issues/2)

3. **资源解析器**
   - OpenSciEd PDF 解析逻辑为示例实现
   - 需获取真实教育资源 API 权限或手动整理数据
   - 详见 [数据获取指南](docs/DATA_ACQUISITION_GUIDE.md)

4. **AI 模型集成**
   - MiniCPM 虚拟导师接口已定义但未部署
   - CodeLlama Blockly 代码生成功能待测试
   - 需要配置 `MINICPM_API_KEY` 环境变量

5. **强化学习路径推荐**
   - PPO 模型训练框架已搭建，但缺乏真实用户数据
   - 当前使用规则引擎生成静态路径
   - 计划在 T4.1 用户测试后启动模型训练

#### 📊 数据说明

- **示例数据**: 当前所有课程库/课件库元数据均为人工构造的示例
- **真实数据获取**: 
  - OpenSciEd: 需从 https://www.openscied.org/ 手动下载或联系官方获取 API
  - OpenStax: 可从 https://openstax.org/subjects 免费获取 CC BY 4.0 教材
  - TED-Ed: 需遵守 https://ed.ted.com/ 的使用条款

#### 🚀 如何贡献

欢迎通过以下方式帮助完善项目：

- 提交 Issue 报告问题或提出功能建议
- 提交 Pull Request 贡献代码或文档
- 帮助整理和标注真实教育资源数据
- 参与用户测试和反馈

## 联系方式

- **邮箱**: 3936318150@qq.com
- **GitHub**: https://github.com/MatuX-ai/OpenMtSciED
- **在线演示**: https://open-mt-sci-ed.vercel.app/
- **Issues**: https://github.com/MatuX-ai/OpenMtSciED/issues

---

*OpenMTSciEd - 让 STEM 教育更连贯、更普惠*
