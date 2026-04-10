# Neo4j 知识图谱Schema设计文档

## 概述

本文档定义OpenMTSciEd知识图谱的节点类型、关系类型、约束和索引,用于存储课程库与课件库的关联网络。

## 节点类型 (Node Labels)

### 1. KnowledgePoint (知识点)

**描述**: 最小粒度的知识单元,如"牛顿第二定律"、"光合作用"

**属性**:
| 属性名 | 类型 | 必填 | 说明 | 示例 |
|--------|------|------|------|------|
| id | String | ✅ | 唯一标识符 | "KP-Phys-001" |
| name | String | ✅ | 知识点名称 | "牛顿第二定律" |
| subject | String | ✅ | 学科 | "物理" |
| grade_level | String | ✅ | 学段 | "初中" / "高中" / "大学" |
| difficulty | Integer | ✅ | 难度等级(1-5) | 3 |
| hardware_dependency | Boolean | ❌ | 是否依赖硬件实验 | false |
| description | String | ❌ | 详细描述 | "F=ma,力等于质量乘以加速度" |

**示例Cypher**:
```cypher
CREATE (:KnowledgePoint {
  id: "KP-Phys-001",
  name: "牛顿第二定律",
  subject: "物理",
  grade_level: "高中",
  difficulty: 3,
  hardware_dependency: false,
  description: "F=ma,力等于质量乘以加速度"
})
```

---

### 2. CourseUnit (课程单元)

**描述**: 课程库中的教学单元,如OpenSciEd的6周单元

**属性**:
| 属性名 | 类型 | 必填 | 说明 | 示例 |
|--------|------|------|------|------|
| id | String | ✅ | 唯一标识符 | "OS-Unit-001" |
| title | String | ✅ | 单元标题 | "生态系统能量流动" |
| source | String | ✅ | 来源库 | "OpenSciEd" / "格物斯坦" / "stemcloud.cn" |
| duration_weeks | Integer | ❌ | 持续周数 | 6 |
| theme | String | ❌ | 主题 | "生态系统" |
| application | String | ❌ | 应用场景 | "设计小型生态瓶观察能量流动" |
| experiment_materials | List<String> | ❌ | 实验材料清单 | ["水生植物", "光源"] |

**示例Cypher**:
```cypher
CREATE (:CourseUnit {
  id: "OS-Unit-001",
  title: "生态系统能量流动",
  source: "OpenSciEd",
  duration_weeks: 6,
  theme: "生态系统",
  application: "设计小型生态瓶观察能量流动"
})
```

---

### 3. TextbookChapter (教材章节)

**描述**: 课件库中的教材章节,如OpenStax的物理章节

**属性**:
| 属性名 | 类型 | 必填 | 说明 | 示例 |
|--------|------|------|------|------|
| id | String | ✅ | 唯一标识符 | "OST-Phys-Ch1" |
| title | String | ✅ | 章节标题 | "牛顿运动定律" |
| source | String | ✅ | 来源库 | "OpenStax" / "TED-Ed" |
| chapter_number | Integer | ❌ | 章节编号 | 1 |
| estimated_hours | Integer | ❌ | 预计学习时长(小时) | 8 |
| difficulty | Integer | ✅ | 难度等级(1-5) | 4 |
| prerequisites | List<String> | ❌ | 先修知识点 | ["矢量运算", "微积分入门"] |

**示例Cypher**:
```cypher
CREATE (:TextbookChapter {
  id: "OST-Phys-Ch1",
  title: "牛顿运动定律",
  source: "OpenStax",
  chapter_number: 1,
  estimated_hours: 8,
  difficulty: 4
})
```

---

### 4. HardwareProject (硬件项目)

**描述**: 低成本Arduino实践项目

**属性**:
| 属性名 | 类型 | 必填 | 说明 | 示例 |
|--------|------|------|------|------|
| id | String | ✅ | 唯一标识符 | "HP-001" |
| name | String | ✅ | 项目名称 | "Arduino CO₂传感器" |
| cost | Float | ✅ | 材料成本(元) | 45.0 |
| difficulty | Integer | ✅ | 难度等级(1-5) | 3 |
| estimated_time | Integer | ❌ | 预计完成时间(小时) | 4 |
| circuit_diagram_url | String | ❌ | 电路图URL | "/hardware_projects/HP-001/circuit.png" |
| code_url | String | ❌ | 代码URL | "/hardware_projects/HP-001/code.ino" |

**示例Cypher**:
```cypher
CREATE (:HardwareProject {
  id: "HP-001",
  name: "Arduino CO₂传感器",
  cost: 45.0,
  difficulty: 3,
  estimated_time: 4
})
```

---

### 5. STEM_PBL_Standard (STEM-PBL标准)

**描述**: 《STEM项目式学习教学标准》的流程节点

**属性**:
| 属性名 | 类型 | 必填 | 说明 | 示例 |
|--------|------|------|------|------|
| id | String | ✅ | 唯一标识符 | "STEM-PBL-Step-1" |
| phase | String | ✅ | 阶段名称 | "问题定义" |
| step_number | Integer | ✅ | 步骤编号 | 1 |
| activities | List<String> | ❌ | 活动列表 | ["情境导入", "问题提出"] |

---

## 关系类型 (Relationship Types)

### 1. CONTAINS (包含关系)

**方向**: CourseUnit → KnowledgePoint  
**含义**: 课程单元包含哪些知识点  
**属性**: 无

**示例**:
```cypher
MATCH (cu:CourseUnit {id: "OS-Unit-001"}), (kp:KnowledgePoint {id: "KP-Bio-001"})
CREATE (cu)-[:CONTAINS]->(kp)
```

---

### 2. PREREQUISITE_OF (先修关系)

**方向**: KnowledgePoint → TextbookChapter  
**含义**: 知识点是学习某章节的先修条件  
**属性**: confidence_score (Float, 置信度0-1)

**示例**:
```cypher
MATCH (kp:KnowledgePoint {id: "KP-Math-001"}), (tc:TextbookChapter {id: "OST-Phys-Ch1"})
CREATE (kp)-[:PREREQUISITE_OF {confidence_score: 0.95}]->(tc)
```

---

### 3. PROGRESSES_TO (递进关系)

**方向**: CourseUnit → TextbookChapter  
**含义**: 完成课程单元后可进阶到某教材章节  
**属性**: transition_type (String: "直接进阶" / "需过渡项目")

**示例**:
```cypher
MATCH (cu:CourseUnit {id: "OS-Unit-001"}), (tc:TextbookChapter {id: "OST-Bio-Ch5"})
CREATE (cu)-[:PROGRESSES_TO {transition_type: "需过渡项目"}]->(tc)
```

---

### 4. CROSS_DISCIPLINE (跨学科关联)

**方向**: KnowledgePoint ↔ KnowledgePoint  
**含义**: 不同学科的知识点之间的关联  
**属性**: relation_description (String: 关联说明)

**示例**:
```cypher
MATCH (kp1:KnowledgePoint {id: "KP-Bio-001"}), (kp2:KnowledgePoint {id: "KP-Chem-001"})
CREATE (kp1)-[:CROSS_DISCIPLINE {relation_description: "光合作用涉及化学反应"}]->(kp2)
```

---

### 5. HARDWARE_MAPS_TO (硬件映射)

**方向**: CourseUnit → HardwareProject  
**含义**: 课程单元对应的硬件实践项目  
**属性**: mapping_type (String: "直接映射" / "扩展项目")

**示例**:
```cypher
MATCH (cu:CourseUnit {id: "OS-Unit-001"}), (hp:HardwareProject {id: "HP-001"})
CREATE (cu)-[:HARDWARE_MAPS_TO {mapping_type: "直接映射"}]->(hp)
```

---

### 6. ALIGNS_WITH (标准对齐)

**方向**: CourseUnit → STEM_PBL_Standard  
**含义**: 课程单元符合STEM-PBL标准的哪个阶段  
**属性**: alignment_score (Float: 对齐程度0-1)

**示例**:
```cypher
MATCH (cu:CourseUnit {id: "OS-Unit-001"}), (std:STEM_PBL_Standard {id: "STEM-PBL-Step-3"})
CREATE (cu)-[:ALIGNS_WITH {alignment_score: 0.9}]->(std)
```

---

### 7. AI_COMPLEMENTARY (AI补全关联)

**方向**: KnowledgePoint → KnowledgePoint  
**含义**: 由MiniCPM模型发现的隐性关联  
**属性**: generated_by (String: "MiniCPM-2B"), confidence_score (Float)

**示例**:
```cypher
MATCH (kp1:KnowledgePoint), (kp2:KnowledgePoint)
CREATE (kp1)-[:AI_COMPLEMENTARY {
  generated_by: "MiniCPM-2B",
  confidence_score: 0.85
}]->(kp2)
```

---

## 约束 (Constraints)

### 唯一性约束

```cypher
// 知识点ID唯一
CREATE CONSTRAINT FOR (k:KnowledgePoint) REQUIRE k.id IS UNIQUE;

// 课程单元ID唯一
CREATE CONSTRAINT FOR (c:CourseUnit) REQUIRE c.id IS UNIQUE;

// 教材章节ID唯一
CREATE CONSTRAINT FOR (t:TextbookChapter) REQUIRE t.id IS UNIQUE;

// 硬件项目ID唯一
CREATE CONSTRAINT FOR (h:HardwareProject) REQUIRE h.id IS UNIQUE;

// STEM-PBL标准步骤ID唯一
CREATE CONSTRAINT FOR (s:STEM_PBL_Standard) REQUIRE s.id IS UNIQUE;
```

---

## 索引 (Indexes)

### 单属性索引

```cypher
// 知识点常用查询字段
CREATE INDEX FOR (k:KnowledgePoint) ON (k.subject);
CREATE INDEX FOR (k:KnowledgePoint) ON (k.grade_level);
CREATE INDEX FOR (k:KnowledgePoint) ON (k.difficulty);

// 课程单元查询
CREATE INDEX FOR (c:CourseUnit) ON (c.source);
CREATE INDEX FOR (c:CourseUnit) ON (c.theme);

// 教材章节查询
CREATE INDEX FOR (t:TextbookChapter) ON (t.source);
CREATE INDEX FOR (t:TextbookChapter) ON (t.difficulty);
```

### 全文索引

```cypher
// 知识点名称全文搜索
CREATE FULLTEXT INDEX knowledgePointNameIndex 
FOR (k:KnowledgePoint) ON EACH [k.name, k.description];

// 课程单元标题全文搜索
CREATE FULLTEXT INDEX courseUnitTitleIndex 
FOR (c:CourseUnit) ON EACH [c.title, c.theme];
```

### 复合索引

```cypher
// 按学科和学段快速筛选知识点
CREATE INDEX FOR (k:KnowledgePoint) ON (k.subject, k.grade_level);

// 按来源和难度筛选教材章节
CREATE INDEX FOR (t:TextbookChapter) ON (t.source, t.difficulty);
```

---

## 图谱规模预估

| 节点类型 | 数量估算 | 说明 |
|---------|---------|------|
| KnowledgePoint | 2000 | 覆盖K-12到大学核心知识点 |
| CourseUnit | 500 | OpenSciEd 200 + 格物斯坦150 + stemcloud.cn 150 |
| TextbookChapter | 800 | OpenStax 500 + TED-Ed 300 |
| HardwareProject | 200 | 每个核心知识点至少1个项目 |
| STEM_PBL_Standard | 20 | 4个阶段×5个子步骤 |
| **总计** | **~3520** | 控制在5000以内 |

| 关系类型 | 数量估算 | 说明 |
|---------|---------|------|
| CONTAINS | 4000 | 平均每单元8个知识点 |
| PREREQUISITE_OF | 3000 | 每章节3-5个先修知识点 |
| PROGRESSES_TO | 500 | 每单元对应1-2个章节 |
| CROSS_DISCIPLINE | 1000 | 跨学科关联 |
| HARDWARE_MAPS_TO | 500 | 每单元1-2个项目 |
| ALIGNS_WITH | 1000 | 每单元对齐2-3个标准步骤 |
| AI_COMPLEMENTARY | 500 | AI补全的隐性关联 |
| **总计** | **~10500** | 平均每个节点3条关系 |

---

## 典型查询示例

### 1. 查询某知识点的所有关联

```cypher
MATCH (kp:KnowledgePoint {id: "KP-Phys-001"})-[r]-(related)
RETURN kp, r, related
LIMIT 50
```

### 2. 查找某课程单元的完整学习路径

```cypher
MATCH path = (cu:CourseUnit {id: "OS-Unit-001"})
      -[:PROGRESSES_TO]->(tc:TextbookChapter)
      <-[:PREREQUISITE_OF]-(kp:KnowledgePoint)
RETURN path
```

### 3. 推荐适合某年级的硬件项目

```cypher
MATCH (cu:CourseUnit)-[:CONTAINS]->(kp:KnowledgePoint {grade_level: "初中"})
MATCH (cu)-[:HARDWARE_MAPS_TO]->(hp:HardwareProject)
WHERE hp.cost <= 50
RETURN DISTINCT hp
ORDER BY hp.difficulty ASC
```

### 4. 查找跨学科关联最强的知识点

```cypher
MATCH (kp1:KnowledgePoint)-[r:CROSS_DISCIPLINE]-(kp2:KnowledgePoint)
WHERE kp1.subject <> kp2.subject
RETURN kp1.name, kp2.name, count(r) as relation_count
ORDER BY relation_count DESC
LIMIT 10
```

---

## ER图 (实体关系图)

```
┌─────────────────┐       CONTAINS       ┌──────────────────┐
│  CourseUnit     │ --------------------> │  KnowledgePoint  │
│                 │                        │                  │
│ - id            │                        │ - id             │
│ - title         │                        │ - name           │
│ - source        │                        │ - subject        │
│ - duration_weeks│                        │ - grade_level    │
└────────┬────────┘                        └──────┬───────────┘
         │                                        │
         │ PROGRESSES_TO                          │ PREREQUISITE_OF
         │                                        │
         ▼                                        ▼
┌─────────────────┐                       ┌──────────────────┐
│ TextbookChapter │ <---------------------│  KnowledgePoint  │
│                 │   CROSS_DISCIPLINE    │                  │
│ - id            │   (双向)              │ - id             │
│ - title         │                       │ - name           │
│ - source        │                       └──────────────────┘
│ - difficulty    │
└────────┬────────┘
         │
         │ HARDWARE_MAPS_TO
         │
         ▼
┌─────────────────┐
│HardwareProject  │
│                 │
│ - id            │
│ - name          │
│ - cost          │
└─────────────────┘
```

---

## 下一步行动

1. 在Neo4j Desktop中执行`schema_creation.cypher`创建节点和关系
2. 执行`constraints_and_indexes.cypher`添加约束和索引
3. 使用`data_importer.py`批量导入CSV/JSON数据
4. 运行`validation_tests.py`验证数据完整性

---

**文档版本**: 1.0  
**最后更新**: 2026-04-09  
**维护者**: OpenMTSciEd团队
