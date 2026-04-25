"""
OpenMTSciEd 学习路径生成服务 (标签规则引擎版)
基于学科、难度和年级标签进行确定性匹配
"""

import logging
from typing import List, Dict, Any, Optional
from pydantic import BaseModel
import sqlite3
import json
import os
import requests
import base64
from pathlib import Path

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# 本地数据库路径 (Tauri 桌面端共享)
DB_PATH = os.getenv("LOCAL_DB_PATH", "../../desktop-manager/openmtscied_local.db")

# Neo4j HTTP API 配置
NEO4J_URI = os.getenv("NEO4J_URI", "https://4abd5ef9.databases.neo4j.io/db/4abd5ef9/query/v2")
NEO4J_USER = os.getenv("NEO4J_USER", "4abd5ef9")
NEO4J_PASSWORD = os.getenv("NEO4J_PASSWORD", "bXebDaB8hSalBxvvB5GhHmcvudO03ilZB7qItmI0Xbs")


class LearningPathNode(BaseModel):
    node_type: str  # tutorial, courseware, hardware
    node_id: str
    title: str
    difficulty: int
    estimated_hours: float
    description: str = ""
    tags: Dict[str, Any] = {}


class TagBasedPathGenerator:
    def __init__(self, db_path: str = DB_PATH):
        self.db_path = Path(db_path)
        logger.info(f"Initialized TagBasedPathGenerator with DB: {self.db_path}")

    def _get_neo4j_headers(self):
        auth_string = f"{NEO4J_USER}:{NEO4J_PASSWORD}"
        auth_bytes = auth_string.encode('ascii')
        auth_base64 = base64.b64encode(auth_bytes).decode('ascii')
        return {
            "Content-Type": "application/json",
            "Authorization": f"Basic {auth_base64}"
        }

    def generate_path_from_graph(self, subject: str, grade_level: str, max_nodes: int = 10) -> List[LearningPathNode]:
        """从 Neo4j 知识图谱生成连贯路径"""
        nodes = []
        try:
            # 使用参数化查询防止注入
            query = """
            MATCH path = (start:CourseUnit {subject: $subject, grade_level: $grade_level})-[:PROGRESSES_TO*1..3]->(end)
            WITH nodes(path) AS path_nodes
            UNWIND path_nodes AS node
            RETURN DISTINCT node.id AS id, node.title AS title, labels(node)[0] AS type, 
                   node.subject AS subject, node.grade_level AS level
            LIMIT $max_nodes
            """
            params = {
                "subject": subject,
                "grade_level": grade_level,
                "max_nodes": max_nodes
            }
            response = requests.post(
                NEO4J_URI, 
                headers=self._get_neo4j_headers(), 
                json={"statement": query, "parameters": params}, 
                verify=False, 
                timeout=10
            )
            if response.status_code == 200:
                data = response.json()
                for row in data.get('data', []):
                    row_data = row['row']
                    nodes.append(LearningPathNode(
                        node_type=row_data[2].lower(),
                        node_id=row_data[0],
                        title=row_data[1],
                        difficulty=3, # 默认难度
                        estimated_hours=4.0,
                        tags={"source": "Neo4j Graph"}
                    ))
        except Exception as e:
            logger.error(f"Neo4j graph path generation failed: {e}")
        return nodes

    def _get_db_connection(self):
        if not self.db_path.exists():
            logger.warning(f"Local DB not found at {self.db_path}. Returning empty path.")
            return None
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        return conn

    def generate_path(self, subject: str, grade_level: str, max_nodes: int = 10) -> List[LearningPathNode]:
        """根据标签生成学习路径"""
        nodes = []
        try:
            conn = self._get_db_connection()
            if not conn:
                return []
            
            cursor = conn.cursor()
            
            # 1. 查找匹配的教程
            cursor.execute(
                "SELECT * FROM tutorials WHERE subject = ? AND grade_level LIKE ? LIMIT ?",
                (subject, f"%{grade_level}%", max_nodes // 2)
            )
            tutorials = cursor.fetchall()
            
            for t in tutorials:
                nodes.append(LearningPathNode(
                    node_type="tutorial",
                    node_id=t['id'],
                    title=t['title'],
                    difficulty=t['difficulty'],
                    estimated_hours=6.0,
                    description=t['description'],
                    tags={"source": t['source']}
                ))
            
            # 2. 查找关联的课件 (通过 kg_relations)
            if tutorials:
                tutorial_ids = [t['id'] for t in tutorials]
                placeholders = ','.join(['?' for _ in tutorial_ids])
                query = f"""
                    SELECT c.*, r.relation_type 
                    FROM coursewares c 
                    JOIN kg_relations r ON c.id = r.courseware_id 
                    WHERE r.tutorial_id IN ({placeholders})
                    LIMIT ?
                """
                cursor.execute(query, (*tutorial_ids, max_nodes // 2))
                coursewares = cursor.fetchall()
                
                for c in coursewares:
                    nodes.append(LearningPathNode(
                        node_type="courseware",
                        node_id=c['id'],
                        title=c['title'],
                        difficulty=nodes[-1].difficulty + 1 if nodes else 1,
                        estimated_hours=4.0,
                        description=f"关联类型: {c.get('relation_type', 'related')}",
                        tags={"source": c['source']}
                    ))
            
            conn.close()
            logger.info(f"Generated {len(nodes)} nodes for subject={subject}, grade={grade_level}")
            return nodes
            
        except Exception as e:
            logger.error(f"Error generating path: {str(e)}")
            return []

    def get_path_summary(self, nodes: List[LearningPathNode]) -> Dict[str, Any]:
        if not nodes:
            return {}
        return {
            "total_nodes": len(nodes),
            "total_hours": sum(n.estimated_hours for n in nodes),
            "avg_difficulty": round(sum(n.difficulty for n in nodes) / len(nodes), 2)
        }

class PathEngine:
    """
    路径引擎：支持多种策略（标签匹配、图谱推理、AI推荐）
    """
    def __init__(self, db_path: str = DB_PATH):
        self.db_path = db_path

    def generate(self, strategy: str = "tag_based", **kwargs) -> List[LearningPathNode]:
        if strategy == "tag_based":
            generator = TagBasedPathGenerator(self.db_path)
            return generator.generate_path(**kwargs)
        # TODO: 增加 graph_based 和 ai_recommended 策略
        return []

# 保持向后兼容的别名
TagBasedPathGenerator = PathEngine

if __name__ == "__main__":
    generator = TagBasedPathGenerator()
    nodes = generator.generate_path(subject="Physics", grade_level="High School")
    print(f"\n生成的路径节点数: {len(nodes)}")
    for node in nodes:
        print(f"- [{node.node_type}] {node.title} (难度: {node.difficulty})")
