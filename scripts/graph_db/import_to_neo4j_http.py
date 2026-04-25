"""
使用HTTP API导入数据到Neo4j Aura
绕过Bolt协议的SSL证书问题
"""

import json
import logging
from pathlib import Path
from typing import List, Dict, Any
from datetime import datetime
import requests
import base64

# 配置日志
import sys
stream_handler = logging.StreamHandler(sys.stdout)
stream_handler.encoding = 'utf-8'

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('neo4j_http_import.log', encoding='utf-8'),
        stream_handler
    ]
)
logger = logging.getLogger(__name__)


class Neo4jHTTPImporter:
    """使用HTTP API的Neo4j导入器"""
    
    def __init__(self):
        # Neo4j Aura配置
        self.base_url = "https://4abd5ef9.databases.neo4j.io/db/4abd5ef9/query/v2"
        self.username = "4abd5ef9"
        self.password = "bXebDaB8hSalBxvvB5GhHmcvudO03ilZB7qItmI0Xbs"
        
        # 创建认证header
        auth_string = f"{self.username}:{self.password}"
        auth_bytes = auth_string.encode('ascii')
        auth_base64 = base64.b64encode(auth_bytes).decode('ascii')
        
        self.headers = {
            "Content-Type": "application/json",
            "Authorization": f"Basic {auth_base64}"
        }
        
        logger.info(f"初始化HTTP导入器: {self.base_url}")
        
        # 测试连接
        if self.test_connection():
            logger.info("✅ Neo4j HTTP API连接成功")
        else:
            raise Exception("Neo4j HTTP API连接失败")
    
    def test_connection(self) -> bool:
        """测试HTTP API连接"""
        try:
            data = {"statement": "RETURN 1 AS test"}
            response = requests.post(self.base_url, headers=self.headers, json=data, timeout=10, verify=False)
            
            # 202 Accepted 或 200 OK 都表示连接成功
            if response.status_code in [200, 202]:
                result = response.json()
                if result.get("results") and len(result["results"]) > 0:
                    return True
                # 检查是否有data字段（某些Neo4j版本返回格式不同）
                if result.get("data"):
                    return True
            
            logger.error(f"连接测试失败: {response.status_code} - {response.text}")
            return False
        except Exception as e:
            logger.error(f"连接测试异常: {e}")
            return False
    
    def execute_query(self, statement: str, parameters: Dict[str, Any] = None) -> Dict:
        """执行Cypher查询"""
        try:
            data = {
                "statement": statement,
                "parameters": parameters or {}
            }
            
            response = requests.post(
                self.base_url,
                headers=self.headers,
                json=data,
                timeout=30,
                verify=False
            )
            
            # 200 OK 或 202 Accepted 都表示成功
            if response.status_code in [200, 202]:
                return response.json()
            else:
                logger.error(f"查询失败: {response.status_code} - {response.text}")
                return None
        except Exception as e:
            logger.error(f"查询异常: {e}")
            return None
    
    def create_constraints_and_indexes(self):
        """创建约束和索引"""
        logger.info("创建约束和索引...")
        
        queries = [
            "CREATE CONSTRAINT course_unit_id IF NOT EXISTS FOR (cu:CourseUnit) REQUIRE cu.id IS UNIQUE",
            "CREATE CONSTRAINT knowledge_point_id IF NOT EXISTS FOR (kp:KnowledgePoint) REQUIRE kp.id IS UNIQUE",
            "CREATE CONSTRAINT textbook_chapter_id IF NOT EXISTS FOR (tc:TextbookChapter) REQUIRE tc.id IS UNIQUE",
            "CREATE INDEX course_unit_subject IF NOT EXISTS FOR (cu:CourseUnit) ON (cu.subject)",
            "CREATE INDEX course_unit_grade IF NOT EXISTS FOR (cu:CourseUnit) ON (cu.grade_level)",
            "CREATE INDEX textbook_chapter_subject IF NOT EXISTS FOR (tc:TextbookChapter) ON (tc.subject)",
            "CREATE INDEX textbook_chapter_grade IF NOT EXISTS FOR (tc:TextbookChapter) ON (tc.grade_level)",
        ]
        
        for query in queries:
            result = self.execute_query(query)
            if result:
                logger.info(f"✅ 执行成功")
            else:
                logger.warning(f"⚠️ 执行可能失败")
        
        logger.info("约束和索引创建完成")
    
    def import_course_units(self, units: List[Dict[str, Any]]):
        """导入教程单元"""
        logger.info(f"开始导入 {len(units)} 个教程单元...")
        
        # 批量导入，每次10个
        batch_size = 10
        for i in range(0, len(units), batch_size):
            batch = units[i:i+batch_size]
            
            # 构建UNWIND查询
            cypher = """
            UNWIND $units AS unit
            MERGE (cu:CourseUnit {id: unit.unit_id})
            SET cu.title = unit.title,
                cu.source = unit.source,
                cu.grade_level = unit.grade_level,
                cu.subject = unit.subject,
                cu.duration_weeks = unit.duration_weeks,
                cu.phenomenon = unit.phenomenon,
                cu.description = unit.description,
                cu.updated_at = datetime()
            WITH cu, unit
            UNWIND unit.knowledge_points AS kp_data
            MERGE (kp:KnowledgePoint {id: kp_data.kp_id})
            SET kp.name = kp_data.name,
                kp.description = kp_data.description,
                kp.subject = unit.subject
            MERGE (cu)-[:CONTAINS]->(kp)
            """
            
            result = self.execute_query(cypher, {"units": batch})
            if result:
                logger.info(f"已导入 {min(i+batch_size, len(units))}/{len(units)} 个单元")
        
        logger.info(f"✅ 成功导入 {len(units)} 个教程单元")
    
    def import_textbook_chapters(self, chapters: List[Dict[str, Any]]):
        """导入教材章节"""
        logger.info(f"开始导入 {len(chapters)} 个教材章节...")
        
        batch_size = 10
        for i in range(0, len(chapters), batch_size):
            batch = chapters[i:i+batch_size]
            
            cypher = """
            UNWIND $chapters AS chapter
            MERGE (tc:TextbookChapter {id: chapter.chapter_id})
            SET tc.title = chapter.title,
                tc.textbook = chapter.textbook,
                tc.source = chapter.source,
                tc.grade_level = chapter.grade_level,
                tc.subject = chapter.subject,
                tc.pdf_download_url = chapter.pdf_download_url,
                tc.updated_at = datetime()
            """
            
            result = self.execute_query(cypher, {"chapters": batch})
            if result:
                logger.info(f"已导入 {min(i+batch_size, len(chapters))}/{len(chapters)} 个章节")
        
        logger.info(f"✅ 成功导入 {len(chapters)} 个教材章节")
    
    def create_progresses_to_relationships(self):
        """建立K12→大学的递进关系"""
        logger.info("建立K12→大学递进关系...")
        
        cypher = """
        MATCH (cu:CourseUnit), (tc:TextbookChapter)
        WHERE cu.subject = tc.subject
          AND cu.grade_level IN ['middle', 'high', '初中', '高中', '初中-高中']
          AND tc.grade_level = 'university'
        MERGE (cu)-[:PROGRESSES_TO {
            relevance_score: 0.8,
            explanation: cu.subject + '从K12到大学的递进学习'
        }]->(tc)
        RETURN count(*) AS relationship_count
        """
        
        result = self.execute_query(cypher)
        if result and result.get("results"):
            count = result["results"][0].get("data", [{}])[0].get("row", [0])[0]
            logger.info(f"✅ 建立了 {count} 条PROGRESSES_TO关系")
    
    def verify_import(self):
        """验证导入结果"""
        logger.info("验证导入结果...")
        
        queries = {
            "CourseUnit节点数": "MATCH (cu:CourseUnit) RETURN count(cu) AS count",
            "KnowledgePoint节点数": "MATCH (kp:KnowledgePoint) RETURN count(kp) AS count",
            "TextbookChapter节点数": "MATCH (tc:TextbookChapter) RETURN count(tc) AS count",
            "CONTAINS关系数": "MATCH ()-[:CONTAINS]->() RETURN count(*) AS count",
            "PROGRESSES_TO关系数": "MATCH ()-[:PROGRESSES_TO]->() RETURN count(*) AS count",
        }
        
        for name, query in queries.items():
            result = self.execute_query(query)
            if result and result.get("results"):
                count = result["results"][0].get("data", [{}])[0].get("row", [0])[0]
                logger.info(f"  {name}: {count}")
    
    def import_all(self):
        """执行完整导入流程"""
        try:
            # 1. 创建约束和索引
            self.create_constraints_and_indexes()
            
            # 2. 加载教程数据
            course_library_dir = Path("data/course_library")
            
            # OpenSciEd（合并初中和高中）
            openscied_file = course_library_dir / "openscied_all_units.json"
            if not openscied_file.exists():
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
                        "knowledge_points": [
                            {"kp_id": f"KP-{tutorial['tutorial_id']}-KP{i}", "name": kp, "description": ""} 
                            for i, kp in enumerate(tutorial.get("knowledge_points", []))
                        ]
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
                        "knowledge_points": [
                            {"kp_id": f"KP-{course['course_id']}-KP{i}", "name": kp, "description": ""} 
                            for i, kp in enumerate(course.get("knowledge_points", []))
                        ]
                    }
                    units.append(unit)
                self.import_course_units(units)
            
            # Khan Academy
            khan_file = course_library_dir / "khan_academy_courses.json"
            if khan_file.exists():
                with open(khan_file, 'r', encoding='utf-8') as f:
                    khan_courses = json.load(f)
                logger.info(f"加载Khan Academy: {len(khan_courses)}个课程")
                # 转换格式
                units = []
                for course in khan_courses:
                    unit = {
                        "unit_id": course["course_id"],
                        "title": course["title"],
                        "source": course["source"],
                        "grade_level": course.get("grade_level", "high"),
                        "subject": course["subject"],
                        "duration_weeks": course.get("duration_weeks", 8),
                        "phenomenon": "",
                        "description": course.get("description", ""),
                        "knowledge_points": course.get("knowledge_points", [])
                    }
                    units.append(unit)
                self.import_course_units(units)
            
            # 新增：完整STEM课程体系（含机器人和AI）
            stem_complete_file = course_library_dir / "stem_complete_with_robotics.json"
            if stem_complete_file.exists():
                with open(stem_complete_file, 'r', encoding='utf-8') as f:
                    stem_courses = json.load(f)
                logger.info(f"加载完整STEM课程: {len(stem_courses)}个课程")
                # 转换格式
                units = []
                for course in stem_courses:
                    unit = {
                        "unit_id": course["course_id"],
                        "title": course["title"],
                        "source": course.get("source", "国家课程标准"),
                        "grade_level": course.get("grade_level", "elementary"),
                        "subject": course["subject"],
                        "duration_weeks": 1,
                        "phenomenon": "",
                        "description": course.get("description", ""),
                        "knowledge_points": course.get("knowledge_points", [])
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
            
            # Coursera大学课程
            coursera_file = textbook_library_dir / "coursera_university_courses.json"
            if coursera_file.exists():
                with open(coursera_file, 'r', encoding='utf-8') as f:
                    coursera_courses = json.load(f)
                logger.info(f"加载Coursera: {len(coursera_courses)}个课程")
                # 转换为TextbookChapter格式
                chapters = []
                for course in coursera_courses:
                    chapter = {
                        "chapter_id": course["course_id"],
                        "title": course["title"],
                        "textbook": course.get("source", "Coursera"),
                        "source": course["source"],
                        "grade_level": course.get("grade_level", "university"),
                        "subject": course["subject"],
                        "chapter_url": course.get("course_url", ""),
                        "pdf_download_url": course.get("certificate_url", ""),
                        "prerequisites": [],
                        "key_concepts": course.get("knowledge_points", []),
                        "exercises": [],
                        "scraped_at": course.get("scraped_at", datetime.now().isoformat())
                    }
                    chapters.append(chapter)
                self.import_textbook_chapters(chapters)
            
            # 4. 建立递进关系
            self.create_progresses_to_relationships()
            
            # 5. 验证导入
            self.verify_import()
            
            logger.info("="*60)
            logger.info("✅ 知识图谱数据导入完成！")
            logger.info("="*60)
            
        except Exception as e:
            logger.error(f"❌ 导入失败: {e}", exc_info=True)
            raise


def main():
    """主函数"""
    logger.info("="*60)
    logger.info("OpenMTSciEd - Neo4j知识图谱数据导入开始 (HTTP API)")
    logger.info("="*60)
    
    importer = Neo4jHTTPImporter()
    importer.import_all()


if __name__ == "__main__":
    main()
