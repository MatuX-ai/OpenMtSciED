# OpenMTSciEd 知识图谱构建技术方案

**文档版本**: v1.0  
**创建日期**: 2026-04-14  
**核心定位**: K12-大学完整教学路径知识图谱

---

## 一、技术架构总览

### 1.1 系统架构图

```
┌─────────────────────────────────────────────────────────────┐
│                    开源教育资源层                              │
│  OpenSciEd │ 格物斯坦 │ stemcloud.cn │ OpenStax │ TED-Ed    │
└────────────────┬────────────────────────┬───────────────────┘
                 │                        │
                 ▼                        ▼
┌─────────────────────────────────────────────────────────────┐
│                  资源爬取与解析层 (Python)                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │OpenSciEd爬虫 │  │格物斯坦爬虫  │  │ OpenStax爬虫     │  │
│  │BeautifulSoup │  │requests      │  │PDF元数据提取     │  │
│  └──────────────┘  └──────────────┘  └──────────────────┘  │
└────────────────┬────────────────────────┬───────────────────┘
                 │                        │
                 ▼                        ▼
┌─────────────────────────────────────────────────────────────┐
│              元数据结构化存储层 (JSON/CSV)                    │
│  data/course_library/  │  data/textbook_library/            │
│  - openscied_units.json│  - openstax_chapters.json          │
│  - gewustan_tutorials  │  - ted_ed_courses.json             │
│  - stemcloud_courses   │  - stem_pbl_standard.json          │
└────────────────┬────────────────────────┬───────────────────┘
                 │                        │
                 ▼                        ▼
┌─────────────────────────────────────────────────────────────┐
│              Neo4j 知识图谱引擎 (核心技术)                     │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  节点类型 (5种):                                      │   │
│  │  • CourseUnit (教程单元) - 150+                      │   │
│  │  • KnowledgePoint (知识点) - 200+                    │   │
│  │  • TextbookChapter (教材章节) - 100+                 │   │
│  │  • HardwareProject (硬件项目) - 50+                  │   │
│  │  • STEM_PBL_Standard (教学标准) - 20+                │   │
│  │                                                       │   │
│  │  关系类型 (7种):                                      │   │
│  │  • CONTAINS (包含)                                   │   │
│  │  • PREREQUISITE_OF (先修)                            │   │
│  │  • PROGRESSES_TO (递进: K12→大学) ⭐核心             │   │
│  │  • CROSS_DISCIPLINE (跨学科)                         │   │
│  │  • HARDWARE_MAPS_TO (硬件映射)                       │   │
│  │  • ALIGNS_WITH (标准对齐)                            │   │
│  │  • AI_COMPLEMENTARY (AI补全)                         │   │
│  └──────────────────────────────────────────────────────┘   │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│              FastAPI 图谱查询接口                             │
│  GET /api/v1/graph/path?kp_id=xxx  (查询学习路径)           │
│  GET /api/v1/graph/related?kp_id=xxx (查询关联资源)         │
│  POST /api/v1/graph/search (全文搜索)                       │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│              Angular 前端可视化                               │
│  ECharts 力导向图 | PathMap组件 | 交互式路径探索              │
└─────────────────────────────────────────────────────────────┘
```

---

## 二、资源爬取模块设计

### 2.1 OpenSciEd 教程爬取器

**目标网站**: https://www.openscied.org/  
**爬取范围**: 6-8年级核心单元（约30个）+ 高中扩展单元（约10个）

**技术实现**:
```python
class OpenSciEdScraper:
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 ...',
            'Accept-Language': 'en-US,en;q=0.9'
        })
    
    def scrape_unit(self, unit_url: str) -> Dict[str, Any]:
        """爬取单个单元"""
        # 1. 获取单元主页
        response = self.session.get(unit_url)
        soup = BeautifulSoup(response.text, 'lxml')
        
        # 2. 提取元数据
        unit_data = {
            'unit_id': self._extract_unit_id(soup),
            'title': self._extract_title(soup),
            'grade_level': self._extract_grade_level(soup),
            'subject': self._extract_subject(soup),
            'phenomenon': self._extract_phenomenon(soup),
            'knowledge_points': self._extract_knowledge_points(soup),
            'experiments': self._extract_experiments(soup),
            'teacher_guide_url': self._extract_pdf_url(soup, 'teacher'),
            'student_handbook_url': self._extract_pdf_url(soup, 'student')
        }
        
        # 3. 防反爬虫：随机延迟
        time.sleep(random.uniform(2, 5))
        
        return unit_data
    
    def scrape_all_units(self) -> List[Dict[str, Any]]:
        """爬取所有单元"""
        units = []
        unit_urls = self._get_unit_urls()
        
        for url in unit_urls:
            try:
                unit = self.scrape_unit(url)
                units.append(unit)
                logger.info(f"成功爬取: {unit['title']}")
            except Exception as e:
                logger.error(f"爬取失败 {url}: {e}")
        
        return units
```

**关键字段提取逻辑**:
- **单元ID**: 从URL或页面meta标签提取（如 `OS-MS-Phys-001`）
- **年级水平**: 从页面分类标签提取（`elementary`/`middle`/`high`）
- **现象驱动问题**: 从单元介绍段落提取（如"为什么手机无线充电需要特定位置？"）
- **知识点列表**: 从"Key Ideas"或"Learning Goals"部分提取
- **实验清单**: 从"Labs"或"Activities"部分提取材料和步骤
- **PDF下载链接**: 查找包含"Teacher Guide"或"Student Handbook"的<a>标签

**数据存储格式**:
```json
{
  "unit_id": "OS-MS-Phys-001",
  "title": "电磁感应现象",
  "source": "openscied",
  "grade_level": "middle",
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

---

### 2.2 OpenStax 课件爬取器

**目标网站**: https://openstax.org/  
**爬取范围**: 大学物理/化学/生物/工程教材 + 高中AP课程

**技术实现**:
```python
class OpenStaxScraper:
    def __init__(self):
        self.base_url = "https://openstax.org"
        self.session = requests.Session()
    
    def scrape_textbook(self, textbook_slug: str) -> Dict[str, Any]:
        """爬取整本教材"""
        # 1. 获取教材主页
        textbook_url = f"{self.base_url}/details/books/{textbook_slug}"
        response = self.session.get(textbook_url)
        soup = BeautifulSoup(response.text, 'lxml')
        
        # 2. 提取教材元数据
        textbook_data = {
            'textbook_id': textbook_slug,
            'title': self._extract_title(soup),
            'subject': self._extract_subject(soup),
            'grade_level': 'university',  # 或 'high_school'
            'pdf_download_url': self._extract_pdf_url(soup),
            'chapters': []
        }
        
        # 3. 爬取所有章节
        chapter_urls = self._get_chapter_urls(soup)
        for chapter_url in chapter_urls:
            chapter = self.scrape_chapter(chapter_url)
            textbook_data['chapters'].append(chapter)
            time.sleep(random.uniform(1, 3))
        
        return textbook_data
    
    def scrape_chapter(self, chapter_url: str) -> Dict[str, Any]:
        """爬取单个章节"""
        response = self.session.get(chapter_url)
        soup = BeautifulSoup(response.text, 'lxml')
        
        chapter_data = {
            'chapter_id': self._extract_chapter_id(soup),
            'title': soup.find('h1').text.strip(),
            'chapter_url': chapter_url,
            'prerequisites': self._extract_prerequisites(soup),
            'key_concepts': self._extract_key_concepts(soup),
            'exercises': self._extract_exercises(soup),
            'instructor_resources': self._extract_instructor_resources(soup)
        }
        
        return chapter_data
```

**关键要求**: 
- **必须保存PDF下载链接**：这是课件库的核心价值
- **提取先修知识点**：从章节引言或"Prerequisites"部分提取
- **提取典型习题**：从"Exercises"或"Problems"部分提取题目和难度等级

**数据存储格式**:
```json
{
  "chapter_id": "OSTX-UPhys-Ch03",
  "title": "牛顿运动定律",
  "textbook": "University Physics Volume 1",
  "source": "openstax",
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

---

## 三、Neo4j 知识图谱 Schema 设计

### 3.1 节点类型定义

#### 1. CourseUnit（教程单元）
```cypher
CREATE CONSTRAINT course_unit_id IF NOT EXISTS
FOR (cu:CourseUnit) REQUIRE cu.id IS UNIQUE;

CREATE INDEX course_unit_subject IF NOT EXISTS
FOR (cu:CourseUnit) ON (cu.subject);

CREATE INDEX course_unit_grade IF NOT EXISTS
FOR (cu:CourseUnit) ON (cu.grade_level);

// 节点属性
(:CourseUnit {
  id: "OS-MS-Phys-001",           // 唯一ID
  title: "电磁感应现象",
  source: "openscied",             // openscied/gewustan/stemcloud
  grade_level: "middle",           // elementary/middle/high/university
  subject: "物理",
  duration_weeks: 6,
  phenomenon: "为什么手机无线充电需要特定位置？",
  teacher_guide_url: "...",
  student_handbook_url: "...",
  created_at: datetime()
})
```

#### 2. KnowledgePoint（知识点）
```cypher
CREATE CONSTRAINT knowledge_point_id IF NOT EXISTS
FOR (kp:KnowledgePoint) REQUIRE kp.id IS UNIQUE;

CREATE INDEX knowledge_point_name IF NOT EXISTS
FOR (kp:KnowledgePoint) ON (kp.name);

CREATE FULLTEXT INDEX knowledge_point_search IF NOT EXISTS
FOR (kp:KnowledgePoint) ON EACH [kp.name, kp.description];

// 节点属性
(:KnowledgePoint {
  id: "KP-Phys-EM-001",
  name: "法拉第电磁感应定律",
  description: "变化的磁场产生电场...",
  subject: "物理",
  difficulty: 3,                   // 1-5星
  ngss_standard: "MS-PS2-3",      // NGSS标准对齐
  created_at: datetime()
})
```

#### 3. TextbookChapter（教材章节）
```cypher
CREATE CONSTRAINT textbook_chapter_id IF NOT EXISTS
FOR (tc:TextbookChapter) REQUIRE tc.id IS UNIQUE;

CREATE INDEX textbook_chapter_subject IF NOT EXISTS
FOR (tc:TextbookChapter) ON (tc.subject);

// 节点属性
(:TextbookChapter {
  id: "OSTX-UPhys-Ch03",
  title: "牛顿运动定律",
  textbook: "University Physics Volume 1",
  source: "openstax",
  grade_level: "university",
  subject: "物理",
  chapter_url: "...",
  pdf_download_url: "...",        // ⭐核心字段
  prerequisites: ["矢量运算", "微积分基础"],
  created_at: datetime()
})
```

#### 4. HardwareProject（硬件项目）
```cypher
CREATE CONSTRAINT hardware_project_id IF NOT EXISTS
FOR (hp:HardwareProject) REQUIRE hp.id IS UNIQUE;

CREATE INDEX hardware_project_cost IF NOT EXISTS
FOR (hp:HardwareProject) ON (hp.total_cost);

// 节点属性
(:HardwareProject {
  id: "HW-Sensor-001",
  title: "超声波测距仪",
  description: "使用HC-SR04测量距离",
  total_cost: 35.0,               // 总成本（元），必须≤50
  components: [
    {name: "Arduino Nano", quantity: 1, unit_price: 15.0},
    {name: "HC-SR04", quantity: 1, unit_price: 5.0}
  ],
  circuit_diagram_url: "...",
  code_template_url: "...",
  created_at: datetime()
})
```

#### 5. STEM_PBL_Standard（教学标准）
```cypher
CREATE CONSTRAINT stem_pbl_id IF NOT EXISTS
FOR (sp:STEM_PBL_Standard) REQUIRE sp.id IS UNIQUE;

// 节点属性
(:STEM_PBL_Standard {
  id: "PBL-Design-001",
  category: "设计类",              // 探究类/设计类/综合类
  process: ["问题定义", "方案设计", "实施验证"],
  evaluation_criteria: ["创新性", "可行性", "完成度"],
  created_at: datetime()
})
```

---

### 3.2 关系类型定义

#### 1. CONTAINS（包含关系）
```cypher
// CourseUnit → KnowledgePoint
MATCH (cu:CourseUnit {id: 'OS-MS-Phys-001'}),
      (kp:KnowledgePoint {id: 'KP-Phys-EM-001'})
CREATE (cu)-[:CONTAINS]->(kp);
```

#### 2. PREREQUISITE_OF（先修关系）
```cypher
// KnowledgePoint → KnowledgePoint
MATCH (kp1:KnowledgePoint {id: 'KP-Math-Vector-001'}),
      (kp2:KnowledgePoint {id: 'KP-Phys-EM-001'})
CREATE (kp1)-[:PREREQUISITE_OF]->(kp2);
```

#### 3. PROGRESSES_TO（递进关系：K12→大学）⭐核心
```cypher
// CourseUnit/KnowledgePoint → TextbookChapter
MATCH (cu:CourseUnit {id: 'OS-MS-Phys-001'}),
      (tc:TextbookChapter {id: 'OSTX-UPhys-Ch03'})
CREATE (cu)-[:PROGRESSES_TO {
  relevance_score: 0.85,
  explanation: "OpenSciEd电路基础为大学物理电路分析奠定实验基础"
}]->(tc);

// 或者知识点级别
MATCH (kp:KnowledgePoint {id: 'KP-Phys-Circuit-001'}),
      (tc:TextbookChapter {id: 'OSTX-UPhys-Ch03'})
CREATE (kp)-[:PROGRESSES_TO {
  relevance_score: 0.90
}]->(tc);
```

#### 4. CROSS_DISCIPLINE（跨学科关联）
```cypher
// KnowledgePoint ↔ KnowledgePoint（双向）
MATCH (kp1:KnowledgePoint {id: 'KP-Bio-CarbonCycle-001'}),
      (kp2:KnowledgePoint {id: 'KP-Chem-Greenhouse-001'})
CREATE (kp1)-[:CROSS_DISCIPLINE {
  relation_type: "同一现象的多学科解释",
  phenomenon: "气候变化"
}]->(kp2);
```

#### 5. HARDWARE_MAPS_TO（硬件映射）
```cypher
// KnowledgePoint → HardwareProject
MATCH (kp:KnowledgePoint {id: 'KP-Phys-Ohm-001'}),
      (hp:HardwareProject {id: 'HW-LED-001'})
CREATE (kp)-[:HARDWARE_MAPS_TO {
  relevance_score: 0.95,
  explanation: "通过语音控制LED灯项目实践欧姆定律"
}]->(hp);
```

#### 6. ALIGNS_WITH（标准对齐）
```cypher
// CourseUnit → STEM_PBL_Standard
MATCH (cu:CourseUnit {id: 'GWS-Course-001'}),
      (sp:STEM_PBL_Standard {id: 'PBL-Design-001'})
CREATE (cu)-[:ALIGNS_WITH]->(sp);
```

#### 7. AI_COMPLEMENTARY（AI补全关联）
```cypher
// 预留供MiniCPM自动发现的隐性关联
MATCH (kp1:KnowledgePoint), (kp2:KnowledgePoint)
WHERE kp1.subject <> kp2.subject
  AND NOT EXISTS((kp1)-[:CROSS_DISCIPLINE]-(kp2))
CREATE (kp1)-[:AI_COMPLEMENTARY {
  discovered_by: "minicpm",
  confidence: 0.75
}]->(kp2);
```

---

## 四、数据导入流程

### 4.1 批量导入脚本

```python
from neo4j import GraphDatabase

class Neo4jDataImporter:
    def __init__(self, uri="bolt://localhost:7687", user="neo4j", password="password"):
        self.driver = GraphDatabase.driver(uri, auth=(user, password))
    
    def import_course_units(self, units: List[Dict]):
        """批量导入教程单元"""
        with self.driver.session() as session:
            # 使用UNWIND批量插入，每批100条
            batch_size = 100
            for i in range(0, len(units), batch_size):
                batch = units[i:i+batch_size]
                
                query = """
                UNWIND $units AS unit
                MERGE (cu:CourseUnit {id: unit.unit_id})
                SET cu.title = unit.title,
                    cu.source = unit.source,
                    cu.grade_level = unit.grade_level,
                    cu.subject = unit.subject,
                    cu.duration_weeks = unit.duration_weeks,
                    cu.phenomenon = unit.phenomenon,
                    cu.teacher_guide_url = unit.teacher_guide_url,
                    cu.student_handbook_url = unit.student_handbook_url,
                    cu.updated_at = datetime()
                """
                session.run(query, units=batch)
                
                logger.info(f"已导入 {i+len(batch)}/{len(units)} 个单元")
    
    def import_knowledge_points(self, kps: List[Dict]):
        """批量导入知识点"""
        with self.driver.session() as session:
            query = """
            UNWIND $kps AS kp
            MERGE (node:KnowledgePoint {id: kp.kp_id})
            SET node.name = kp.name,
                node.description = kp.description,
                node.subject = kp.subject,
                node.difficulty = kp.difficulty,
                node.ngss_standard = kp.ngss_standard
            """
            session.run(query, kps=kps)
    
    def create_contains_relationships(self, relationships: List[Dict]):
        """建立CONTAINS关系"""
        with self.driver.session() as session:
            query = """
            UNWIND $rels AS rel
            MATCH (cu:CourseUnit {id: rel.unit_id}),
                  (kp:KnowledgePoint {id: rel.kp_id})
            MERGE (cu)-[:CONTAINS]->(kp)
            """
            session.run(query, rels=relationships)
    
    def create_progresses_to_relationships(self, relationships: List[Dict]):
        """建立PROGRESSES_TO关系（K12→大学）"""
        with self.driver.session() as session:
            query = """
            UNWIND $rels AS rel
            MATCH (source),
                  (target:TextbookChapter {id: rel.chapter_id})
            WHERE source.id = rel.source_id
            MERGE (source)-[:PROGRESSES_TO {
                relevance_score: rel.relevance_score,
                explanation: rel.explanation
            }]->(target)
            """
            session.run(query, rels=relationships)
    
    def close(self):
        self.driver.close()
```

### 4.2 导入顺序

1. **第一步**：导入所有节点（CourseUnit, KnowledgePoint, TextbookChapter, HardwareProject, STEM_PBL_Standard）
2. **第二步**：建立内部关系（CONTAINS, PREREQUISITE_OF）
3. **第三步**：建立跨库关系（PROGRESSES_TO, CROSS_DISCIPLINE, HARDWARE_MAPS_TO）
4. **第四步**：建立标准对齐关系（ALIGNS_WITH）
5. **第五步**：创建索引和约束（如果尚未创建）

---

## 五、Cypher 查询示例

### 5.1 查询完整学习路径（K12→大学）

```cypher
// 查询某知识点的完整学习路径
MATCH path = (kp:KnowledgePoint {id: 'KP-Phys-EM-001'})-
             [:PROGRESSES_TO*1..3]->(chapter:TextbookChapter)
RETURN path,
       length(path) AS hops,
       [node IN nodes(path) | node.title] AS path_titles
ORDER BY hops ASC
LIMIT 10;
```

### 5.2 查询某教程单元的所有关联资源

```cypher
// 查询OpenSciEd单元关联的知识点、硬件项目、大学章节
MATCH (unit:CourseUnit {id: 'OS-MS-Phys-001'})-
      [:CONTAINS]->(kp:KnowledgePoint),
      (kp)-[:HARDWARE_MAPS_TO]->(hw:HardwareProject),
      (kp)-[:PROGRESSES_TO]->(chapter:TextbookChapter)
WHERE hw.total_cost <= 50
RETURN unit.title AS unit_title,
       collect(DISTINCT kp.name) AS knowledge_points,
       collect(DISTINCT hw.title) AS hardware_projects,
       collect(DISTINCT chapter.title) AS university_chapters;
```

### 5.3 查询跨学科关联

```cypher
// 查询"生态系统"涉及哪些学科
MATCH (kp:KnowledgePoint {name: '生态系统能量流动'})-
      [:CROSS_DISCIPLINE]-(related:KnowledgePoint)
RETURN DISTINCT related.subject AS subject,
       collect(related.name) AS related_topics
ORDER BY subject;
```

### 5.4 推荐低成本硬件项目

```cypher
// 根据用户学习的知识点推荐硬件项目
MATCH (kp:KnowledgePoint {id: 'KP-Phys-Ohm-001'})-
      [:HARDWARE_MAPS_TO]->(hw:HardwareProject)
WHERE hw.total_cost <= 50
RETURN hw.title,
       hw.total_cost,
       hw.components,
       hw.circuit_diagram_url
ORDER BY hw.total_cost ASC;
```

### 5.5 全文搜索知识点

```cypher
// 使用全文索引搜索
CALL db.index.fulltext.queryNodes('knowledge_point_search', '电磁感应')
YIELD node, score
RETURN node.id, node.name, node.subject, score
ORDER BY score DESC
LIMIT 10;
```

---

## 六、性能优化策略

### 6.1 索引优化

```cypher
// 1. 唯一性约束（自动创建索引）
CREATE CONSTRAINT FOR (n:CourseUnit) REQUIRE n.id IS UNIQUE;
CREATE CONSTRAINT FOR (n:KnowledgePoint) REQUIRE n.id IS UNIQUE;
CREATE CONSTRAINT FOR (n:TextbookChapter) REQUIRE n.id IS UNIQUE;

// 2. 单属性索引（加速WHERE过滤）
CREATE INDEX FOR (n:KnowledgePoint) ON (n.subject);
CREATE INDEX FOR (n:KnowledgePoint) ON (n.difficulty);
CREATE INDEX FOR (n:TextbookChapter) ON (n.grade_level);

// 3. 全文索引（加速关键词搜索）
CREATE FULLTEXT INDEX knowledge_point_search 
FOR (n:KnowledgePoint) ON EACH [n.name, n.description];

// 4. 复合索引（加速多条件查询）
CREATE INDEX FOR (n:KnowledgePoint) ON (n.subject, n.difficulty);
```

### 6.2 查询优化技巧

1. **使用PROFILE分析查询计划**：
```cypher
PROFILE MATCH (kp:KnowledgePoint {id: 'KP-Phys-EM-001'})-
      [:PROGRESSES_TO*1..3]->(chapter:TextbookChapter)
RETURN chapter;
```

2. **限制路径长度**：避免无限递归，使用`*1..3`而非`*`

3. **提前过滤**：在MATCH之前使用WHERE减少搜索空间

4. **使用APOC插件**：对于复杂路径查询，使用`apoc.path.expandConfig()`

---

## 七、验收指标

### 7.1 数据规模

| 指标 | 目标值 | 说明 |
|------|--------|------|
| CourseUnit节点数 | ≥150 | OpenSciEd 40+ + 格物斯坦 10+ + stemcloud 100+ |
| KnowledgePoint节点数 | ≥200 | 从教程单元中提取 |
| TextbookChapter节点数 | ≥100 | OpenStax 50+ + TED-Ed 63 |
| HardwareProject节点数 | ≥50 | 预算≤50元的Arduino项目 |
| 关系总数 | ≥1000 | PROGRESSES_TO 300+ + 其他700+ |

### 7.2 查询性能

| 查询类型 | 响应时间 | 说明 |
|---------|---------|------|
| 单节点查询 | < 100ms | 通过ID直接查询 |
| 一跳关系查询 | < 200ms | 如查询某单元的知识点 |
| 多跳路径查询（3跳） | < 500ms | K12→大学完整路径 |
| 全文搜索 | < 200ms | 关键词搜索知识点 |

### 7.3 数据质量

| 指标 | 目标值 | 验证方法 |
|------|--------|---------|
| PDF下载链接有效率 | 100% | 随机抽检50个链接 |
| 跨学科关联准确率 | ≥90% | 人工审核50条关系 |
| K12→大学递进完整性 | 每个OpenSciEd单元至少关联1个OpenStax章节 | Cypher查询验证 |
| 硬件项目成本合规率 | 100% ≤50元 | 数据库查询验证 |

---

## 八、风险控制

### 8.1 反爬虫风险

**应对措施**：
- 使用`requests.Session()`保持会话
- 随机延迟2-5秒避免频繁请求
- 设置合理的User-Agent
- 考虑使用代理IP池（如需大规模爬取）

### 8.2 网站结构变化风险

**应对措施**：
- 使用CSS选择器而非硬编码XPath
- 添加异常处理和日志记录
- 定期运行爬虫验证数据完整性
- 准备手动补充数据的备选方案

### 8.3 Neo4j性能瓶颈

**应对措施**：
- 初期节点数控制在5000以内
- 添加合适的索引和约束
- 使用批量导入而非逐条插入
- 监控查询性能，必要时升级硬件

### 8.4 数据质量问题

**应对措施**：
- 爬取后立即验证关键字段（如PDF链接）
- 建立数据质量检查脚本
- 人工抽检关键关系（如PROGRESSES_TO）
- 预留AI_COMPLEMENTARY关系供后续修正

---

## 九、下一步行动

### 立即执行任务

1. **实现OpenSciEd爬虫**（A1.1任务）
   - 编写`scripts/scrapers/openscied_scraper.py`
   - 爬取30+个6-8年级单元
   - 保存到`data/course_library/openscied_units.json`

2. **实现OpenStax爬虫**（A2.1任务）
   - 编写`scripts/scrapers/openstax_scraper.py`
   - 爬取50+个大学/高中章节
   - **确保保存PDF下载链接**
   - 保存到`data/textbook_library/openstax_chapters.json`

3. **部署Neo4j环境**
   - 安装Neo4j Desktop或Docker容器
   - 执行`schema_creation.cypher`创建节点和关系
   - 测试基本查询功能

4. **开发数据导入脚本**
   - 编写`scripts/graph_db/import_from_json.py`
   - 将JSON数据批量导入Neo4j
   - 建立PROGRESSES_TO等核心关系

---

**文档维护者**: OpenMTSciEd Team  
**最后更新**: 2026-04-14
