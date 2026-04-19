"""
知识图谱数据导入器
将教程库和课件库的JSON数据批量导入Neo4j Aura云数据库
建立K12→大学的递进关系
"""

import os
import json
import logging
import ssl
from pathlib import Path
from typing import List, Dict, Any
from datetime import datetime

from neo4j import GraphDatabase
from neo4j.exceptions import ServiceUnavailable

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('neo4j_import.log', encoding='utf-8'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)


class Neo4jImporter:
    """Neo4j数据导入器"""
    
    def __init__(self):
        # 从配置文件读取Neo4j连接信息
        self.uri = "neo4j+s://4abd5ef9.databases.neo4j.io"
        self.username = "4abd5ef9"
        self.password = "bXebDaB8hSalBxvvB5GhHmcvudO03ilZB7qItmI0Xbs"
        self.database = "4abd5ef9"  # Neo4j Aura实例ID作为数据库名
        
        logger.info(f"连接Neo4j Aura: {self.uri}")
        
        # 创建驱动时不设置额外SSL参数（URI scheme已隐含加密）
        # 注意：neo4j+s协议已包含加密，不应手动设置encrypted或trust参数
        try:
            self.driver = GraphDatabase.driver(
                self.uri,
                auth=(self.username, self.password)
            )
            # 测试连接
            with self.driver.session(database=self.database) as session:
                result = session.run("RETURN 1 AS test")
                record = result.single()
                if record and record['test'] == 1:
                    logger.info("✅ Neo4j连接成功")
        except ServiceUnavailable as e:
            logger.error(f"❌ Neo4j服务不可用: {e}")
            logger.info("提示：请检查Neo4j Aura实例状态是否为RUNNING")
            logger.info("提示：SSL证书问题可尝试更新系统根证书")
            raise
        except Exception as e:
            logger.error(f"❌ Neo4j连接失败: {e}")
            raise
        
    def close(self):
        """关闭数据库连接"""
        self.driver.close()
        logger.info("Neo4j连接已关闭")
    
    def create_constraints_and_indexes(self):
        """创建约束和索引"""
        logger.info("创建约束和索引...")
        
        with self.driver.session(database=self.database) as session:
            # 唯一性约束
            constraints = [
                "CREATE CONSTRAINT course_unit_id IF NOT EXISTS FOR (cu:CourseUnit) REQUIRE cu.id IS UNIQUE",
                "CREATE CONSTRAINT knowledge_point_id IF NOT EXISTS FOR (kp:KnowledgePoint) REQUIRE kp.id IS UNIQUE",
                "CREATE CONSTRAINT textbook_chapter_id IF NOT EXISTS FOR (tc:TextbookChapter) REQUIRE tc.id IS UNIQUE",
                "CREATE CONSTRAINT hardware_project_id IF NOT EXISTS FOR (hp:HardwareProject) REQUIRE hp.id IS UNIQUE",
            ]
            
            for constraint in constraints:
                try:
                    session.run(constraint)
                    logger.info(f"✅ 创建约束成功")
                except Exception as e:
                    logger.warning(f"约束可能已存在: {e}")
            
            # 索引
            indexes = [
                "CREATE INDEX course_unit_subject IF NOT EXISTS FOR (cu:CourseUnit) ON (cu.subject)",
                "CREATE INDEX course_unit_grade IF NOT EXISTS FOR (cu:CourseUnit) ON (cu.grade_level)",
                "CREATE INDEX knowledge_point_name IF NOT EXISTS FOR (kp:KnowledgePoint) ON (kp.name)",
                "CREATE INDEX knowledge_point_subject IF NOT EXISTS FOR (kp:KnowledgePoint) ON (kp.subject)",
                "CREATE INDEX textbook_chapter_subject IF NOT EXISTS FOR (tc:TextbookChapter) ON (tc.subject)",
                "CREATE INDEX textbook_chapter_grade IF NOT EXISTS FOR (tc:TextbookChapter) ON (tc.grade_level)",
            ]
            
            for index in indexes:
                try:
                    session.run(index)
                    logger.info(f"✅ 创建索引成功")
                except Exception as e:
                    logger.warning(f"索引可能已存在: {e}")
        
        logger.info("约束和索引创建完成")
    
    def import_course_units(self, units: List[Dict[str, Any]]):
        """导入教程单元"""
        logger.info(f"开始导入 {len(units)} 个教程单元...")
        
        with self.driver.session(database=self.database) as session:
            batch_size = 20
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
                    cu.description = unit.description,
                    cu.teacher_guide_url = unit.teacher_guide_url,
                    cu.student_handbook_url = unit.student_handbook_url,
                    cu.unit_url = unit.unit_url,
                    cu.updated_at = datetime()
                WITH cu, unit
                UNWIND unit.knowledge_points AS kp_data
                MERGE (kp:KnowledgePoint {id: kp_data.kp_id})
                SET kp.name = kp_data.name,
                    kp.description = kp_data.description,
                    kp.subject = unit.subject,
                    kp.ngss_standard = kp_data.ngss_standard
                MERGE (cu)-[:CONTAINS]->(kp)
                """
                
                session.run(query, units=batch)
                logger.info(f"已导入 {min(i+batch_size, len(units))}/{len(units)} 个单元")
        
        logger.info(f"✅ 成功导入 {len(units)} 个教程单元")
    
    def import_textbook_chapters(self, chapters: List[Dict[str, Any]]):
        """导入教材章节"""
        logger.info(f"开始导入 {len(chapters)} 个教材章节...")
        
        with self.driver.session(database=self.database) as session:
            batch_size = 20
            for i in range(0, len(chapters), batch_size):
                batch = chapters[i:i+batch_size]
                
                query = """
                UNWIND $chapters AS chapter
                MERGE (tc:TextbookChapter {id: chapter.chapter_id})
                SET tc.title = chapter.title,
                    tc.textbook = chapter.textbook,
                    tc.source = chapter.source,
                    tc.grade_level = chapter.grade_level,
                    tc.subject = chapter.subject,
                    tc.chapter_url = chapter.chapter_url,
                    tc.pdf_download_url = chapter.pdf_download_url,
                    tc.prerequisites = chapter.prerequisites,
                    tc.updated_at = datetime()
                """
                
                session.run(query, chapters=batch)
                logger.info(f"已导入 {min(i+batch_size, len(chapters))}/{len(chapters)} 个章节")
        
        logger.info(f"✅ 成功导入 {len(chapters)} 个教材章节")
    
    def create_progresses_to_relationships(self):
        """建立K12→大学的递进关系（PROGRESSES_TO）"""
        logger.info("建立K12→大学递进关系...")
        
        with self.driver.session(database=self.database) as session:
            # 基于学科匹配建立递进关系
            query = """
            MATCH (cu:CourseUnit), (tc:TextbookChapter)
            WHERE cu.subject = tc.subject
              AND cu.grade_level IN ['middle', 'high']
              AND tc.grade_level = 'university'
            MERGE (cu)-[:PROGRESSES_TO {
                relevance_score: 0.8,
                explanation: cu.subject + '从K12到大学的递进学习'
            }]->(tc)
            RETURN count(*) AS relationship_count
            """
            
            result = session.run(query)
            record = result.single()
            if record:
                count = record['relationship_count']
                logger.info(f"✅ 建立了 {count} 条PROGRESSES_TO关系")
    
    def import_optimized_relationships(self, relationships_file: Path):
        """导入优化后的关系数据"""
        logger.info(f"从 {relationships_file} 导入优化关系...")
        
        try:
            with open(relationships_file, 'r', encoding='utf-8') as f:
                relationships_data = json.load(f)
            
            progressive_rels = relationships_data.get('progressive_relationships', [])
            similarity_rels = relationships_data.get('similarity_relationships', [])
            
            logger.info(f"加载了 {len(progressive_rels)} 条递进关系和 {len(similarity_rels)} 条相似度关系")
            
            with self.driver.session(database=self.database) as session:
                # 导入递进关系
                if progressive_rels:
                    batch_size = 50
                    for i in range(0, len(progressive_rels), batch_size):
                        batch = progressive_rels[i:i+batch_size]
                        
                        query = """
                        UNWIND $relationships AS rel
                        MATCH (source {id: rel.source_course_id})
                        MATCH (target {id: rel.target_course_id})
                        MERGE (source)-[:PROGRESSES_TO {
                            source_platform: rel.source_platform,
                            target_platform: rel.target_platform,
                            subject: rel.subject,
                            source_level: rel.source_level,
                            target_level: rel.target_level,
                            confidence: rel.confidence,
                            created_at: rel.created_at
                        }]->(target)
                        """
                        
                        session.run(query, relationships=batch)
                        logger.info(f"已导入递进关系 {min(i+batch_size, len(progressive_rels))}/{len(progressive_rels)}")
                    
                    logger.info(f"✅ 成功导入 {len(progressive_rels)} 条优化递进关系")
                
                # 导入相似度关系
                if similarity_rels:
                    batch_size = 50
                    for i in range(0, len(similarity_rels), batch_size):
                        batch = similarity_rels[i:i+batch_size]
                        
                        query = """
                        UNWIND $relationships AS rel
                        MATCH (source {id: rel.source_course_id})
                        MATCH (target {id: rel.target_course_id})
                        MERGE (source)-[:SIMILAR_TO {
                            source_platform: rel.source_platform,
                            target_platform: rel.target_platform,
                            similarity_score: rel.similarity_score,
                            subject: rel.subject,
                            created_at: rel.created_at
                        }]->(target)
                        """
                        
                        session.run(query, relationships=batch)
                        logger.info(f"已导入相似度关系 {min(i+batch_size, len(similarity_rels))}/{len(similarity_rels)}")
                    
                    logger.info(f"✅ 成功导入 {len(similarity_rels)} 条优化相似度关系")
            
        except Exception as e:
            logger.error(f"❌ 导入优化关系失败: {e}", exc_info=True)
            raise
    
    def verify_import(self):
        """验证导入结果"""
        logger.info("验证导入结果...")
        
        with self.driver.session(database=self.database) as session:
            queries = {
                "CourseUnit节点数": "MATCH (cu:CourseUnit) RETURN count(cu) AS count",
                "KnowledgePoint节点数": "MATCH (kp:KnowledgePoint) RETURN count(kp) AS count",
                "TextbookChapter节点数": "MATCH (tc:TextbookChapter) RETURN count(tc) AS count",
                "CONTAINS关系数": "MATCH ()-[:CONTAINS]->() RETURN count(*) AS count",
                "PROGRESSES_TO关系数": "MATCH ()-[:PROGRESSES_TO]->() RETURN count(*) AS count",
            }
            
            for name, query in queries.items():
                result = session.run(query)
                record = result.single()
                if record:
                    logger.info(f"  {name}: {record['count']}")
    
    def import_all(self):
        """执行完整导入流程"""
        try:
            # 1. 创建约束和索引
            self.create_constraints_and_indexes()
            
            # 2. 加载教程数据
            course_library_dir = Path("data/course_library")
            
            # OpenSciEd
            openscied_file = course_library_dir / "openscied_middle_units.json"
            if openscied_file.exists():
                with open(openscied_file, 'r', encoding='utf-8') as f:
                    openscied_units = json.load(f)
                logger.info(f"加载OpenSciEd: {len(openscied_units)}个单元")
                self.import_course_units(openscied_units)
            
            # 格物斯坦
            gewustan_file = course_library_dir / "gewustan_tutorials.json"
            if gewustan_file.exists():
                with open(gewustan_file, 'r', encoding='utf-8') as f:
                    gewustan_tutorials = json.load(f)
                logger.info(f"加载格物斯坦: {len(gewustan_tutorials)}个教程")
                # 转换为统一格式
                units = []
                for tutorial in gewustan_tutorials:
                    unit = {
                        "unit_id": tutorial["tutorial_id"],
                        "title": tutorial["title"],
                        "source": tutorial["source"],
                        "grade_level": "middle",
                        "subject": tutorial["subject"],
                        "duration_weeks": tutorial.get("duration_hours", 3),
                        "phenomenon": "",
                        "description": tutorial["description"],
                        "knowledge_points": [{"kp_id": f"KP-{tutorial['tutorial_id']}-KP{i}", "name": kp, "description": "", "ngss_standard": ""} for i, kp in enumerate(tutorial.get("knowledge_points", []))],
                        "teacher_guide_url": "",
                        "student_handbook_url": "",
                        "unit_url": tutorial.get("tutorial_url", "")
                    }
                    units.append(unit)
                self.import_course_units(units)
            
            # stemcloud.cn
            stemcloud_file = course_library_dir / "stemcloud_courses.json"
            if stemcloud_file.exists():
                with open(stemcloud_file, 'r', encoding='utf-8') as f:
                    stemcloud_courses = json.load(f)
                logger.info(f"加载stemcloud.cn: {len(stemcloud_courses)}个课程")
                # 转换格式
                units = []
                for course in stemcloud_courses:
                    unit = {
                        "unit_id": course["course_id"],
                        "title": course["title"],
                        "source": course["source"],
                        "grade_level": course.get("grade_level", "初中"),
                        "subject": course["subject"],
                        "duration_weeks": course.get("duration_hours", 3),
                        "phenomenon": "",
                        "description": course["description"],
                        "knowledge_points": [{"kp_id": f"KP-{course['course_id']}-KP{i}", "name": kp, "description": "", "ngss_standard": ""} for i, kp in enumerate(course.get("knowledge_points", []))],
                        "teacher_guide_url": "",
                        "student_handbook_url": "",
                        "unit_url": course.get("course_url", "")
                    }
                    units.append(unit)
                self.import_course_units(units)
            
            # 3. 加载课件数据
            textbook_library_dir = Path("data/textbook_library")
            openstax_file = textbook_library_dir / "openstax_chapters.json"
            if openstax_file.exists():
                with open(openstax_file, 'r', encoding='utf-8') as f:
                    openstax_chapters = json.load(f)
                logger.info(f"加载OpenStax: {len(openstax_chapters)}个章节")
                self.import_textbook_chapters(openstax_chapters)
            
            # 4. 建立递进关系
            self.create_progresses_to_relationships()
            
            # 5. 导入优化后的关系数据（如果存在）
            relationships_file = Path("data/knowledge_graph_relationships.json")
            if relationships_file.exists():
                logger.info("检测到优化后的关系数据，正在导入...")
                self.import_optimized_relationships(relationships_file)
            else:
                logger.info("未找到优化后的关系数据，跳过导入")
            
            # 6. 验证导入
            self.verify_import()
            
            logger.info("="*60)
            logger.info("✅ 知识图谱数据导入完成！")
            logger.info("="*60)
            
        except Exception as e:
            logger.error(f"❌ 导入失败: {e}", exc_info=True)
            raise
        finally:
            self.close()


def main():
    """主函数"""
    logger.info("="*60)
    logger.info("OpenMTSciEd - Neo4j知识图谱数据导入开始")
    logger.info("="*60)
    
    importer = Neo4jImporter()
    importer.import_all()


if __name__ == "__main__":
    main()
