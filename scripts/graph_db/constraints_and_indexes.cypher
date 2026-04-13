// OpenMTSciEd Neo4j 约束和索引创建脚本
// 执行此脚本前需先运行 schema_creation.cypher

// ============================================
// 1. 唯一性约束 (Unique Constraints)
// ============================================

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

// ============================================
// 2. 单属性索引 (Single-Property Indexes)
// ============================================

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

// 硬件项目查询
CREATE INDEX FOR (h:HardwareProject) ON (h.cost);
CREATE INDEX FOR (h:HardwareProject) ON (h.difficulty);

// ============================================
// 3. 全文索引 (Full-Text Indexes)
// ============================================

// 知识点名称全文搜索
CREATE FULLTEXT INDEX knowledgePointNameIndex
FOR (k:KnowledgePoint) ON EACH [k.name, k.description];

// 课程单元标题全文搜索
CREATE FULLTEXT INDEX courseUnitTitleIndex
FOR (c:CourseUnit) ON EACH [c.title, c.theme];

// ============================================
// 4. 复合索引 (Composite Indexes)
// ============================================

// 按学科和学段快速筛选知识点
CREATE INDEX FOR (k:KnowledgePoint) ON (k.subject, k.grade_level);

// 按来源和难度筛选教材章节
CREATE INDEX FOR (t:TextbookChapter) ON (t.source, t.difficulty);

// ============================================
// 5. 验证索引创建
// ============================================

// 查看所有约束
SHOW CONSTRAINTS;

// 查看所有索引
SHOW INDEXES;

// 测试查询性能
// 应该使用索引加速
PROFILE MATCH (k:KnowledgePoint {subject: "物理", grade_level: "高中"})
RETURN k;

// 测试全文搜索
PROFILE CALL db.index.fulltext.queryNodes('knowledgePointNameIndex', '牛顿')
YIELD node, score
RETURN node.name, score;
