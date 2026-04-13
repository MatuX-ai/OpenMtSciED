// OpenMTSciEd Neo4j Schema 创建脚本
// 执行顺序: 1. 创建节点 2. 创建关系 3. 添加约束和索引

// ============================================
// 1. 创建示例节点
// ============================================

// 1.1 创建知识点 (KnowledgePoint)
CREATE (:KnowledgePoint {
  id: "KP-Phys-001",
  name: "牛顿第二定律",
  subject: "物理",
  grade_level: "高中",
  difficulty: 3,
  hardware_dependency: false,
  description: "F=ma,力等于质量乘以加速度"
});

CREATE (:KnowledgePoint {
  id: "KP-Bio-001",
  name: "光合作用",
  subject: "生物",
  grade_level: "初中",
  difficulty: 2,
  hardware_dependency: true,
  description: "植物利用光能将CO₂和水转化为有机物"
});

CREATE (:KnowledgePoint {
  id: "KP-Math-001",
  name: "矢量运算",
  subject: "数学",
  grade_level: "高中",
  difficulty: 3,
  hardware_dependency: false,
  description: "向量的加减法、点积、叉积"
});

// 1.2 创建课程单元 (CourseUnit)
CREATE (:CourseUnit {
  id: "OS-Unit-001",
  title: "生态系统能量流动",
  source: "OpenSciEd",
  duration_weeks: 6,
  theme: "生态系统",
  application: "设计小型生态瓶观察能量流动",
  experiment_materials: ["水生植物", "光源", "CO₂指示剂"]
});

CREATE (:CourseUnit {
  id: "OS-Unit-002",
  title: "电磁感应现象",
  source: "OpenSciEd",
  duration_weeks: 6,
  theme: "电磁学",
  application: "制作简易发电机",
  experiment_materials: ["线圈", "磁铁", "电流表"]
});

// 1.3 创建教材章节 (TextbookChapter)
CREATE (:TextbookChapter {
  id: "OST-Phys-Ch1",
  title: "牛顿运动定律",
  source: "OpenStax",
  chapter_number: 1,
  estimated_hours: 8,
  difficulty: 4,
  prerequisites: ["矢量运算", "微积分入门"]
});

CREATE (:TextbookChapter {
  id: "OST-Bio-Ch5",
  title: "生态学基础",
  source: "OpenStax",
  chapter_number: 5,
  estimated_hours: 6,
  difficulty: 3,
  prerequisites: ["细胞生物学基础", "光合作用与呼吸作用"]
});

// 1.4 创建硬件项目 (HardwareProject)
CREATE (:HardwareProject {
  id: "HP-001",
  name: "Arduino CO₂传感器",
  cost: 45.0,
  difficulty: 3,
  estimated_time: 4,
  circuit_diagram_url: "/hardware_projects/HP-001/circuit.png",
  code_url: "/hardware_projects/HP-001/code.ino"
});

CREATE (:HardwareProject {
  id: "HP-002",
  name: "简易发电机模型",
  cost: 35.0,
  difficulty: 2,
  estimated_time: 3,
  circuit_diagram_url: "/hardware_projects/HP-002/circuit.png",
  code_url: "/hardware_projects/HP-002/code.ino"
});

// 1.5 创建STEM-PBL标准步骤 (STEM_PBL_Standard)
CREATE (:STEM_PBL_Standard {
  id: "STEM-PBL-Step-1",
  phase: "问题定义",
  step_number: 1,
  activities: ["情境导入", "问题提出"]
});

CREATE (:STEM_PBL_Standard {
  id: "STEM-PBL-Step-2",
  phase: "方案设计",
  step_number: 2,
  activities: ["头脑风暴", "方案选择"]
});

CREATE (:STEM_PBL_Standard {
  id: "STEM-PBL-Step-3",
  phase: "实施验证",
  step_number: 3,
  activities: ["原型制作", "测试优化"]
});

CREATE (:STEM_PBL_Standard {
  id: "STEM-PBL-Step-4",
  phase: "展示评价",
  step_number: 4,
  activities: ["成果展示", "同伴互评"]
});

// ============================================
// 2. 创建关系
// ============================================

// 2.1 CONTAINS 关系 (课程单元包含知识点)
MATCH (cu:CourseUnit {id: "OS-Unit-001"}), (kp:KnowledgePoint {id: "KP-Bio-001"})
CREATE (cu)-[:CONTAINS]->(kp);

// 2.2 PREREQUISITE_OF 关系 (知识点是章节的先修条件)
MATCH (kp:KnowledgePoint {id: "KP-Math-001"}), (tc:TextbookChapter {id: "OST-Phys-Ch1"})
CREATE (kp)-[:PREREQUISITE_OF {confidence_score: 0.95}]->(tc);

MATCH (kp:KnowledgePoint {id: "KP-Bio-001"}), (tc:TextbookChapter {id: "OST-Bio-Ch5"})
CREATE (kp)-[:PREREQUISITE_OF {confidence_score: 0.90}]->(tc);

// 2.3 PROGRESSES_TO 关系 (课程单元递进到教材章节)
MATCH (cu:CourseUnit {id: "OS-Unit-001"}), (tc:TextbookChapter {id: "OST-Bio-Ch5"})
CREATE (cu)-[:PROGRESSES_TO {transition_type: "需过渡项目"}]->(tc);

// 2.4 CROSS_DISCIPLINE 关系 (跨学科关联)
MATCH (kp1:KnowledgePoint {id: "KP-Bio-001"}), (kp2:KnowledgePoint {id: "KP-Phys-001"})
CREATE (kp1)-[:CROSS_DISCIPLINE {relation_description: "生态系统能量流动涉及物理能量守恒"}]->(kp2);

// 2.5 HARDWARE_MAPS_TO 关系 (课程单元映射到硬件项目)
MATCH (cu:CourseUnit {id: "OS-Unit-001"}), (hp:HardwareProject {id: "HP-001"})
CREATE (cu)-[:HARDWARE_MAPS_TO {mapping_type: "直接映射"}]->(hp);

MATCH (cu:CourseUnit {id: "OS-Unit-002"}), (hp:HardwareProject {id: "HP-002"})
CREATE (cu)-[:HARDWARE_MAPS_TO {mapping_type: "直接映射"}]->(hp);

// 2.6 ALIGNS_WITH 关系 (课程单元对齐STEM-PBL标准)
MATCH (cu:CourseUnit {id: "OS-Unit-001"}), (std:STEM_PBL_Standard {id: "STEM-PBL-Step-3"})
CREATE (cu)-[:ALIGNS_WITH {alignment_score: 0.9}]->(std);

// ============================================
// 3. 验证创建结果
// ============================================

// 统计各类节点数量
MATCH (n) RETURN labels(n) AS node_type, count(*) AS count
ORDER BY count DESC;

// 统计各类关系数量
MATCH ()-[r]->() RETURN type(r) AS relationship_type, count(*) AS count
ORDER BY count DESC;

// 显示完整图谱
MATCH (n) OPTIONAL MATCH (n)-[r]-(m)
RETURN n, r, m
LIMIT 100;
