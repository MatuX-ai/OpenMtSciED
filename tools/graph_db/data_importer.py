"""
OpenMTSciEd Neo4j 数据导入器
将CSV/JSON元数据批量导入Neo4j图数据库
"""

import csv
import json
import logging
from pathlib import Path
from typing import List, Dict, Any

try:
    from neo4j import GraphDatabase
except ImportError:
    print("请安装neo4j驱动: pip install neo4j")
    exit(1)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class Neo4jDataImporter:
    """Neo4j数据导入器"""

    def __init__(self, uri: str = "bolt://localhost:7687",
                 username: str = "neo4j",
                 password: str = "password"):
        self.driver = GraphDatabase.driver(uri, auth=(username, password))

    def close(self):
        """关闭数据库连接"""
        self.driver.close()

    def import_knowledge_points(self, csv_file: str):
        """导入知识点节点"""
        logger.info(f"开始导入知识点: {csv_file}")

        with open(csv_file, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            data = list(reader)

        with self.driver.session() as session:
            # 批量插入,每批100条
            batch_size = 100
            for i in range(0, len(data), batch_size):
                batch = data[i:i+batch_size]

                cypher = """
                UNWIND $batch AS row
                MERGE (k:KnowledgePoint {id: row.id})
                SET k.name = row.name,
                    k.subject = row.subject,
                    k.grade_level = row.grade_level,
                    k.difficulty = toInteger(row.difficulty),
                    k.description = row.description
                """

                session.run(cypher, batch=batch)
                logger.info(f"已导入 {min(i+batch_size, len(data))}/{len(data)} 个知识点")

        logger.info(f"知识点导入完成,共{len(data)}条")

    def import_course_units(self, json_file: str):
        """导入课程单元节点"""
        logger.info(f"开始导入课程单元: {json_file}")

        with open(json_file, 'r', encoding='utf-8') as f:
            data = json.load(f)

        with self.driver.session() as session:
            cypher = """
            UNWIND $data AS item
            MERGE (c:CourseUnit {id: item.id})
            SET c.title = item.title,
                c.source = item.source,
                c.duration_weeks = item.duration_weeks,
                c.theme = item.theme,
                c.application = item.application
            """

            session.run(cypher, data=data)

        logger.info(f"课程单元导入完成,共{len(data)}条")

    def create_relationships(self):
        """创建示例关系(实际应从数据中解析)"""
        logger.info("开始创建关系")

        with self.driver.session() as session:
            # 示例: 创建CONTAINS关系
            session.run("""
            MATCH (cu:CourseUnit {id: "OS-Unit-001"}),
                  (kp:KnowledgePoint {subject: "生物"})
            MERGE (cu)-[:CONTAINS]->(kp)
            """)

            # 示例: 创建PROGRESSES_TO关系
            session.run("""
            MATCH (cu:CourseUnit {id: "OS-Unit-001"}),
                  (tc:TextbookChapter {id: "OST-Bio-Ch5"})
            MERGE (cu)-[:PROGRESSES_TO {transition_type: "需过渡项目"}]->(tc)
            """)

        logger.info("关系创建完成")

    def validate_import(self):
        """验证导入结果"""
        logger.info("开始验证导入结果")

        with self.driver.session() as session:
            # 统计节点数量
            result = session.run("""
            MATCH (n)
            RETURN labels(n) AS node_type, count(*) AS count
            ORDER BY count DESC
            """)

            print("\n节点统计:")
            for record in result:
                print(f"  {record['node_type']}: {record['count']}")

            # 统计关系数量
            result = session.run("""
            MATCH ()-[r]->()
            RETURN type(r) AS relationship_type, count(*) AS count
            ORDER BY count DESC
            """)

            print("\n关系统计:")
            for record in result:
                print(f"  {record['relationship_type']}: {record['count']}")


def main():
    """主函数"""
    importer = Neo4jDataImporter()

    try:
        # 1. 导入知识点 (从CSV)
        # importer.import_knowledge_points("data/knowledge_points.csv")

        # 2. 导入课程单元 (从JSON)
        # importer.import_course_units("data/course_library/gewustan_courses.json")

        # 3. 创建关系
        # importer.create_relationships()

        # 4. 验证导入
        importer.validate_import()

    finally:
        importer.close()


if __name__ == "__main__":
    main()
