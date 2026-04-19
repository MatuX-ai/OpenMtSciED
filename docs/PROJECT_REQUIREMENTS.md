开发“分离教程库与课件库联动的STEM连贯学习路径引擎”需求
模块名称 ：OpenMtSciED,创建独立分支，可以 单独 开源
——基于OpenSciEd（教程库）与OpenStax（课件库）的整合及自适应适配  

一、核心目标

**核心技术定位：K12-大学完整教学路径知识图谱构建**

1. **首要任务 - 教学资源结构化与知识图谱构建**：
   - 从开源平台（OpenSciEd、格物斯坦、stemcloud.cn）爬取K12阶段教程资源
   - 从开源平台（OpenStax、TED-Ed）爬取大学/高中阶段课件资源
   - 解构元数据：提取主题、知识点、应用、先修关系、下载链接等关键信息
   - 构建Neo4j知识图谱：建立"教程库→课件库"的递进、跨学科、硬件映射关系
   - **确保覆盖完整学段**：小学兴趣启蒙→初中跨学科实践→高中深度探究→大学专业衔接

2. **次要任务 - 学习路径生成与硬件映射**：
   - 基于知识图谱和规则引擎生成个性化学习路径
   - 低成本硬件项目映射（预算≤50元）
   - AI辅助过渡（用LLM解释知识点跳跃）

3. **技术复用**：调用现有技术栈（Angular前端、Python后端、Neo4j知识图谱、Tauri桌面端），避免重复开发。  
4. **AI可操作**：让AI理解分离的教程库与课件库，执行"推荐路径、生成联动项目"等操作。

二、输入资源分析（结构化数据）

1. 教程库（现象驱动/项目式，侧重实践活动）

资源名称 核心特性 关键元数据（需AI提取）
OpenSciEd K-12（6-8年级为主），现象驱动单元制（每单元6周），NGSS标准对齐，含教师/学生手册、实验清单 单元主题（如“生态系统能量流动”）、知识点列表（如“光合作用化学方程式”）、跨学科关联（如“用编程模拟种群增长”）、实验材料清单（低成本替代方案）
格物斯坦开源系列 10-15岁，金属十合一教程，涵盖机械结构、电子电路、算法编程 教程模块（如“机械传动”）、硬件清单（如“齿轮组、电机”）、项目任务（如“搭建简易起重机”）
stemcloud.cn全学科教程 6大学科、15子学科、100+教程、600+课时，体系化项目式学习 教程分类（如“物理-力学”）、项目难度（1-5星）、关联硬件（如“Arduino传感器”）
2. 课件库（理论体系/知识点，侧重教材与习题）
资源名称 核心特性 关键元数据（需AI提取）
OpenStax 大学/高中，分模块经典教材（物理/化学/生物/工程），CC BY 4.0协议，含例题/习题/教师资源包 章节结构（如“大学物理·力学→牛顿运动定律”）、先修知识点（如“学习电磁学需掌握矢量运算”）、典型习题（如“用微积分推导简谐运动方程”）
《STEM-PBL教学标准》 国内首个STEM团体标准，规范课程分类、设计、项目式教学流程 课程类别（如“探究类”“设计类”）、教学流程（如“问题定义→方案设计→实施验证”）、评价标准
TED-Ed STEM课程 63个可搜索课程，围绕TED讲座，分工程与技术、科学与技术、数学等类别 课程主题（如“人工智能伦理”）、关联TED演讲、知识点摘要（如“机器学习基本概念”）
  

三、整合逻辑（AI需理解的关联规则）

1. 知识图谱构建（关联课程库与课件库）

• 节点定义：每个知识点/章节为图谱节点，属性包括：  

  • 基础属性：学段（K-12/大学）、学科（物理/化学/生物/工程）、难度等级（1-5星）、硬件依赖（如“需要Arduino传感器”）；  

  • 资源属性：所属库（课程库/课件库）、资源名称（如“OpenSciEd-生态系统能量流动”）、元数据ID（如“OS-Unit-001”）。  

• 关系定义：  

  • 递进关系：教程库知识点→课件库先修章节（如OpenSciEd“电路基础”→OpenStax“大学物理·电路分析”）；  

  • 跨学科关联：同一现象的多学科解释（如“气候变化”关联教程库“生态项目”、课件库“生物·碳循环”“化学·温室效应”）；  

  • 硬件映射：教程库项目→课件库理论（如教程库“用Arduino做气象站”→课件库“物理·传感器原理”）；  

  • 标准对齐：教程库项目→《STEM-PBL教学标准》的流程/评价（如“搭建起重机”符合“设计类”教程流程）。  

2. 学习路径生成规则（AI需执行的自适应逻辑）

• 起点选择：基于用户年龄/知识水平（通过测试题评估），从教程库的兴趣单元（如OpenSciEd“电磁感应现象”）开始；  

• 路径串联：用“教程库单元→课件库预习章节→过渡项目（Blockly编程模拟）→课件库正式章节→硬件综合项目”的逻辑串联；  

• 里程碑设计：每完成1个教程库单元，解锁1个课件库章节预习模块；每完成1个课件库章节，生成1个硬件综合项目（如“用ESP32实现简易气象站”，整合物理（传感器原理）+编程（数据处理）+工程（结构设计））；  

• 动态调整：基于用户行为数据（练习正确率、项目完成度、学习速度）使用规则引擎调整路径难度，优先推荐“硬件项目完成度高”的分支。  

四、技术实现路径（**分两阶段执行**）

### 阶段A：资源获取与知识图谱构建（当前优先级最高）

#### A1. 教程库资源爬取与元数据解构

**任务目标**：从K12开源平台获取完整教程资源，建立结构化数据库

• **OpenSciEd爬取模块**：
  - 目标网站：https://www.openscied.org/
  - 爬取范围：6-8年级核心单元（约30个单元）+ 高中扩展单元
  - 提取字段：
    ```json
    {
      "unit_id": "OS-MS-Phys-001",
      "title": "电磁感应现象",
      "grade_level": "middle", // elementary/middle/high/university
      "subject": "物理",
      "duration_weeks": 6,
      "phenomenon": "为什么手机无线充电需要特定位置？",
      "knowledge_points": [
        {
          "kp_id": "KP-Phys-EM-001",
          "name": "法拉第电磁感应定律",
          "description": "变化的磁场产生电场...",
          "ngss_standard": "MS-PS2-3"
        }
      ],
      "experiments": [
        {
          "name": "线圈感应电流实验",
          "materials": ["磁铁", "铜线圈", "LED灯"],
          "low_cost_alternatives": ["用耳机线代替铜线圈"]
        }
      ],
      "cross_discipline": ["数学·函数图像", "工程·传感器设计"],
      "teacher_guide_url": "https://www.openscied.org/.../teacher.pdf",
      "student_handbook_url": "https://www.openscied.org/.../student.pdf"
    }
    ```
  - 存储格式：JSON文件 → Neo4j节点（CourseUnit + KnowledgePoint）

• **格物斯坦爬取模块**：
  - 目标网站：http://www.gewustan.com/
  - 爬取范围：金属十合一教程（10-15岁）
  - 提取字段：教程模块、硬件清单（含单价）、项目任务、电路图URL
  - 重点：确保所有硬件项目总成本≤50元

• **stemcloud.cn整合模块**：
  - 目标：6大学科、15子学科、100+教程
  - 提取字段：教程分类、难度等级（1-5星）、关联硬件、课时数
  - 数据来源：官方API或页面爬取

#### A2. 课件库资源爬取与元数据抽取

**任务目标**：从大学/高中开源教材平台获取理论课件，保存下载链接

• **OpenStax爬取模块**：
  - 目标网站：https://openstax.org/
  - 爬取范围：大学物理/化学/生物/工程教材 + 高中AP课程
  - 提取字段：
    ```json
    {
      "chapter_id": "OSTX-UPhys-Ch03",
      "title": "牛顿运动定律",
      "textbook": "University Physics Volume 1",
      "grade_level": "university",
      "subject": "物理",
      "chapter_url": "https://openstax.org/books/university-physics-volume-1/pages/3-introduction",
      "pdf_download_url": "https://openstax.org/details/books/university-physics-volume-1",
      "prerequisites": ["矢量运算", "微积分基础"],
      "key_concepts": [
        {
          "concept": "牛顿第一定律",
          "formula": "F=ma",
          "examples": ["惯性演示实验"]
        }
      ],
      "exercises": [
        {
          "problem": "计算物体加速度...",
          "difficulty": 3,
          "solution_url": "https://openstax.org/.../solution.pdf"
        }
      ],
      "instructor_resources": {
        "slides_url": "https://openstax.org/.../slides.pptx",
        "test_bank_url": "https://openstax.org/.../testbank.zip"
      }
    }
    ```
  - **关键要求**：必须保存PDF下载链接或在线阅读URL
  - 存储格式：JSON文件 → Neo4j节点（TextbookChapter）

• **TED-Ed爬取模块**：
  - 目标网站：https://ed.ted.com/
  - 爬取范围：STEM类别课程（工程与技术、科学与技术、数学）
  - 提取字段：课程主题、视频URL、知识点摘要、讨论问题
  - 关联：与OpenStax章节建立CROSS_DISCIPLINE关系

• **STEM-PBL标准整合**：
  - 来源：《STEM-PBL教学标准》文档
  - 提取：课程类别（探究类/设计类）、教学流程、评价标准
  - 用途：作为ALIGNS_WITH关系的 target 节点

#### A3. Neo4j知识图谱构建

**任务目标**：将教程库和课件库关联，形成完整K12-大学路径

• **节点类型**（5种）：
  1. CourseUnit（教程单元）- 来自OpenSciEd/格物斯坦/stemcloud
  2. KnowledgePoint（知识点）- 从教程单元中提取
  3. TextbookChapter（教材章节）- 来自OpenStax/TED-Ed
  4. HardwareProject（硬件项目）- 预算≤50元的Arduino/ESP32项目
  5. STEM_PBL_Standard（教学标准）- 流程规范节点

• **关系类型**（7种）：
  1. **CONTAINS**：CourseUnit → KnowledgePoint（单元包含知识点）
  2. **PREREQUISITE_OF**：KnowledgePoint → KnowledgePoint（先修关系）
  3. **PROGRESSES_TO**：CourseUnit/KnowledgePoint → TextbookChapter（K12→大学递进）
     - 示例：OpenSciEd"电路基础" → OpenStax"大学物理·电路分析"
  4. **CROSS_DISCIPLINE**：KnowledgePoint ↔ KnowledgePoint（跨学科关联）
     - 示例："气候变化"关联生物"碳循环"+化学"温室效应"
  5. **HARDWARE_MAPS_TO**：KnowledgePoint → HardwareProject（理论→实践）
     - 示例："欧姆定律" → "语音控制LED灯项目"
  6. **ALIGNS_WITH**：CourseUnit → STEM_PBL_Standard（标准对齐）
  7. **AI_COMPLEMENTARY**：预留AI补全的隐性关联

• **Cypher查询示例**：
  ```cypher
  // 查询某知识点的完整学习路径（K12→大学）
  MATCH path = (kp:KnowledgePoint {id: 'KP-Phys-EM-001'})-
               [:PROGRESSES_TO*]->(chapter:TextbookChapter)
  RETURN path
  
  // 查询某教程单元关联的所有硬件项目
  MATCH (unit:CourseUnit {id: 'OS-MS-Phys-001'})-
        [:CONTAINS]->(kp:KnowledgePoint)-
        [:HARDWARE_MAPS_TO]->(hw:HardwareProject)
  WHERE hw.total_cost <= 50
  RETURN unit, kp, hw
  
  // 查询跨学科关联（如"生态系统"涉及哪些学科）
  MATCH (kp:KnowledgePoint {name: '生态系统能量流动'})-
        [:CROSS_DISCIPLINE]-(related:KnowledgePoint)
  RETURN DISTINCT related.subject
  ```

• **索引优化**：
  - 唯一约束：节点ID（5个）
  - 单属性索引：subject, grade_level, difficulty（8个）
  - 全文索引：知识点名称、课程标题（2个）
  - 复合索引：subject+grade_level, source+difficulty（2个）

### 阶段B：学习路径生成与硬件联动（依赖阶段A完成）

#### B1. 路径生成算法开发

五、阶段划分与原子任务（**按优先级重新调整**）

### 阶段A：资源获取与知识图谱构建（当前执行，预计15人天）

| 原子任务ID | 任务名称 | 技术细节 | 交付物 | 依赖关系 |
|-----------|---------|---------|--------|----------|
| **A1.1** | OpenSciEd教程爬取 | 爬取openscied.org官网，提取6-8年级+高中单元元数据，保存PDF下载链接 | openscied_units.json (30+单元) | 无 |
| **A1.2** | 格物斯坦教程爬取 | 爬取gewustan.com，提取金属十合一教程，确保硬件成本≤50元 | gewustan_tutorials.json (10+教程) | 无 |
| **A1.3** | stemcloud.cn课程整合 | 整理6大学科100+教程JSON数据，标注难度等级和关联硬件 | stemcloud_courses.json | 无 |
| **A2.1** | OpenStax课件爬取 | 爬取openstax.org，提取大学/高中教材章节，**必须保存PDF下载链接** | openstax_chapters.json (50+章节) | 无 |
| **A2.2** | TED-Ed课程爬取 | 爬取ed.ted.com STEM类别，提取视频URL和知识点摘要 | ted_ed_courses.json (63课程) | 无 |
| **A2.3** | STEM-PBL标准整理 | 解析《STEM-PBL教学标准》文档，提取课程类别和评价流程 | stem_pbl_standard.json | 无 |
| **A3.1** | Neo4j Schema设计 | 定义5种节点类型、7种关系类型、索引策略 | neo4j_schema_design.md | A1.1-A2.3完成 |
| **A3.2** | 知识图谱数据导入 | 将JSON数据批量导入Neo4j，建立递进/跨学科/硬件映射关系 | Neo4j数据库(500+节点) | A3.1完成 |
| **A3.3** | 图谱验证与优化 | Cypher查询验证关联正确率≥95%，添加全文索引优化查询速度 | validation_report.md | A3.2完成 |

### 阶段B：学习路径原型开发（依赖阶段A，预计12人天）

| 原子任务ID | 任务名称 | 技术细节 | 交付物 | 依赖关系 |
|-----------|---------|---------|--------|----------|
| B1.1 | 路径生成算法开发 | 基于用户测试题得分推荐起点，用规则引擎串联教程库→课件库内容 | path_generation_api.py | A3.3完成 |
| B1.2 | 自适应路径调整算法 | 基于用户行为数据使用规则引擎调整路径难度，实现个性化推荐 | path_adjustment_service.py | B1.1完成 |
| B2.1 | 过渡项目设计 | 为每个知识递进点设计Blockly编程项目（如"用变量模拟物理公式"） | transition_projects.json (50+项目) | B1.1完成 |
| B2.2 | 前端路径地图界面 | 用ECharts绘制知识图谱，支持点击节点查看详情（Angular） | PathMapComponent | B1.1完成 |

### 阶段C：硬件与课件库联动开发（依赖阶段A，预计14人天）

| 原子任务ID | 任务名称 | 技术细节 | 交付物 | 依赖关系 |
|-----------|---------|---------|--------|----------|
| C1.1 | 硬件项目库开发 | 为每个核心知识点设计Arduino项目（含电路图/代码/材料清单，预算≤50元） | hardware_projects/目录 (20+项目) | A3.3完成 |
| C1.2 | Blockly代码生成集成 | 调用项目现有Blockly引擎，生成项目配套图形化代码 | blockly_templates/目录 | C1.1完成 |
| C1.3 | 课件库理论映射集成 | 用MiniCPM补全教程库项目与课件库理论的关联，生成联动任务 | linked_tasks.json | C1.1、C1.2完成 |

### 阶段D：测试与优化（依赖阶段B、C，预计9人天）

| 原子任务ID | 任务名称 | 技术细节 | 交付物 | 依赖关系 |
|-----------|---------|---------|--------|----------|
| D1.1 | 用户测试（50名K-12学生） | 收集路径连贯性、硬件项目完成率反馈 | 测试报告（优化建议清单） | B2.2、C1.3完成 |
| D1.2 | 性能优化 | 优化图谱查询速度（Neo4j索引）、AI响应延迟（模型量化）、硬件通信稳定性 | 性能监控仪表盘（Grafana） | D1.1完成 |
  

六、验收标准（**分阶段量化指标**）

### 阶段A验收标准（知识图谱构建）

1. **教程库覆盖率**：
   - OpenSciEd 6-8年级核心单元≥30个，高中扩展单元≥10个
   - 格物斯坦金属十合一教程≥10个，硬件成本全部≤50元
   - stemcloud.cn课程≥100个，覆盖6大学科

2. **课件库覆盖率**：
   - OpenStax大学/高中教材章节≥50个，**100%包含PDF下载链接或在线阅读URL**
   - TED-Ed STEM课程≥63个，视频URL有效
   - STEM-PBL教学标准完整解析

3. **知识图谱质量**：
   - 节点总数≥500（CourseUnit 150+ + KnowledgePoint 200+ + TextbookChapter 100+ + HardwareProject 50+）
   - 关系总数≥1000（PROGRESSES_TO 300+ + CROSS_DISCIPLINE 200+ + HARDWARE_MAPS_TO 100+）
   - 跨学科关联准确率≥90%（人工抽检50条关系）
   - K12→大学递进关系完整性：每个OpenSciEd单元至少关联1个OpenStax章节

4. **查询性能**：
   - 单节点查询响应时间 < 100ms
   - 多跳路径查询（3跳以内）响应时间 < 500ms
   - 全文搜索响应时间 < 200ms

### 阶段B验收标准（学习路径生成）

1. **路径连贯性**：每个教程库单元→课件库章节过渡节点有≥1个过渡项目+1个硬件综合项目
2. **用户体验**：用户完成路径的平均时长较单一课程缩短30%
3. **AI操作能力**：AI能精准执行“推荐路径、解释衔接逻辑”，响应延迟≤500ms
4. **个性化推荐准确率**：基于规则引擎的路径调整准确率≥85%

### 阶段C验收标准（硬件联动）

1. **硬件适配性**：所有项目材料成本≤50元，支持Type-C直连手机（WebUSB），代码生成正确率≥95%
2. **硬件项目完成率**：用户测试中硬件项目完成率≥70%

### 阶段D验收标准（测试与优化）

1. **用户满意度**：50名K-12学生试用后评分 > 4.5/5.0
2. **系统稳定性**：崩溃率 < 0.1%，无严重级别Bug

七、风险控制（AI需注意的潜在问题）

1. 资源格式差异：用“主题-知识点-应用”三级结构统一两库元数据（如教程库“生态系统”→知识点“碳循环”→应用“用Arduino测CO₂浓度”）；  
2. 知识点衔接偏差：需自动审核知识图谱的“递进关系”（避免错误衔接，如“量子力学”不可直接关联K-12“电路基础”）；  
3. 硬件兼容性：优先选用项目现有定制Arduino板（ESP32/Arduino Nano），避免新增硬件型号；  
4. 两库分离的操作风险：用知识图谱明确两库的关联，避免AI误操作（如推荐无关的教程库项目）。  
