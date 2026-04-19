"""
OpenMTSciEd 学习路径生成服务 (MVP 极简版)
使用HTTP API连接Neo4j，避免Bolt协议SSL问题
"""

import logging
from typing import List, Dict, Any
from pydantic import BaseModel
import requests
import base64
import os
from pathlib import Path
from dotenv import load_dotenv

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# 加载环境变量
# __file__ = backend/openmtscied/services/path_generator.py
# parent = services, parent.parent = openmtscied, parent.parent.parent = backend, parent.parent.parent.parent = OpenMTSciEd
env_path = Path(__file__).parent.parent.parent.parent / ".env"
logger.info(f"Loading .env from: {env_path}")
loaded = load_dotenv(env_path)
logger.info(f"dotenv loaded: {loaded}")
if loaded:
    logger.info(f"NEO4J_USER from env: {os.getenv('NEO4J_USER')}")
    logger.info(f"NEO4J_PASSWORD length from env: {len(os.getenv('NEO4J_PASSWORD', '')) if os.getenv('NEO4J_PASSWORD') else 0}")


class LearningPathNode(BaseModel):
    node_type: str
    node_id: str
    title: str
    difficulty: int
    estimated_hours: float
    description: str = ""


class PathGenerator:
    def __init__(self):
        # 使用HTTP API连接Neo4j
        self.base_url = os.getenv("NEO4J_QUERY_API_URL", 
                                  "https://4abd5ef9.databases.neo4j.io/db/4abd5ef9/query/v2")
        user = os.getenv("NEO4J_USER", "4abd5ef9")
        password = os.getenv("NEO4J_PASSWORD", "password")
        
        # Debug: 打印实际使用的凭据（隐藏密码）
        logger.info(f"Neo4j User: {user}")
        logger.info(f"Neo4j Password length: {len(password)}")
        logger.info(f"Neo4J_QUERY_API_URL: {self.base_url}")
        
        # Basic Auth
        auth_string = f"{user}:{password}"
        auth_base64 = base64.b64encode(auth_string.encode('ascii')).decode('ascii')
        
        self.headers = {
            "Content-Type": "application/json",
            "Authorization": f"Basic {auth_base64}"
        }
        
        logger.info(f"Initialized PathGenerator with HTTP API: {self.base_url}")
    
    def _execute_cypher(self, query: str, params: dict = None) -> dict:
        """执行Cypher查询"""
        data = {
            "statement": query,
            "parameters": params or {}
        }
        
        try:
            response = requests.post(
                self.base_url,
                headers=self.headers,
                json=data,
                timeout=10
            )
            
            if response.status_code in [200, 202]:
                return response.json()
            else:
                logger.error(f"Neo4j query failed: HTTP {response.status_code}")
                logger.error(response.text)
                return None
        except Exception as e:
            logger.error(f"Neo4j connection error: {str(e)}")
            return None

    def generate_path(self, user, max_nodes: int = 20) -> List[LearningPathNode]:
        try:
            start_id = user.get_recommended_starting_unit()
            logger.info(f"Generating path for {user.user_id} starting from {start_id}")
            
            # 获取用户已完成的单元ID列表
            completed_unit_ids = [cu.unit_id for cu in user.completed_units] if user.completed_units else []
            logger.info(f"User has completed {len(completed_unit_ids)} units: {completed_unit_ids[:5]}")
            
            # 多跳查询：沿着PROGRESSES_TO关系查找后续课程单元，并包含跨学科关联
            query = """
            MATCH path = (start:CourseUnit {id: $start_id})-[:PROGRESSES_TO*0..4]->(cu:CourseUnit)
            WITH cu, length(path) AS depth
            WHERE NOT cu.id IN $completed_ids
            ORDER BY depth
            
            // 获取每个CourseUnit相关的知识点
            OPTIONAL MATCH (cu)-[:CONTAINS]->(kp:KnowledgePoint)
            WITH cu, depth, collect(kp) AS knowledge_points
            
            // 获取跨学科关联的知识点（通过CROSS_DISCIPLINE关系）
            OPTIONAL MATCH (kp:KnowledgePoint)-[:CROSS_DISCIPLINE]-(related_kp:KnowledgePoint)
            WHERE kp IN knowledge_points AND related_kp <> kp
            WITH cu, depth, knowledge_points, collect(DISTINCT related_kp) AS cross_discipline_kps
            
            // 获取相关的教材章节
            OPTIONAL MATCH (cu)-[:PROGRESSES_TO]->(tc:TextbookChapter)
            WITH cu, depth, knowledge_points, cross_discipline_kps, collect(DISTINCT tc) AS textbooks
            
            // 获取相关的硬件项目（通过学科匹配或HARDWARE_MAPS_TO关系）
            OPTIONAL MATCH (hp:HardwareProject)
            WHERE (hp.subject = cu.subject OR 
                   EXISTS((cu)-[:HARDWARE_MAPS_TO]->(hp)))
              AND hp.difficulty <= cu.difficulty + 1
              AND hp.total_cost <= 50
            WITH cu, depth, knowledge_points, cross_discipline_kps, textbooks, collect(DISTINCT hp) AS hardware_projects
            
            RETURN cu, depth, 
                   [kp IN knowledge_points | {id: kp.id, name: kp.name, subject: kp.subject}] AS knowledge_points,
                   [rkp IN cross_discipline_kps | {id: rkp.id, name: rkp.name, subject: rkp.subject}] AS cross_discipline_kps,
                   [tc IN textbooks | {id: tc.id, title: tc.title, subject: tc.subject}] AS textbooks,
                   [hp IN hardware_projects | {id: hp.id, title: hp.title, cost: hp.total_cost}] AS hardware_projects
            ORDER BY depth
            LIMIT $max_nodes
            """
            
            logger.info(f"Executing Neo4j query with start_id={start_id}, max_nodes={max_nodes}, completed_ids={completed_unit_ids}")
            result = self._execute_cypher(query, {
                "start_id": start_id, 
                "max_nodes": max_nodes,
                "completed_ids": completed_unit_ids
            })
            
            if not result:
                logger.warning("No results from Neo4j query")
                return []
            
            logger.info(f"Neo4j response structure: {list(result.keys())}")
            records = result.get("data", {}).get("values", [])
            logger.info(f"Found {len(records)} records")
            
            if not records:
                return []

            nodes = []
            for i, record in enumerate(records):
                logger.info(f"Processing record {i+1}/{len(records)}")
                cu = record[0]  # cu对象
                depth = record[1]
                knowledge_points = record[2]
                cross_discipline_kps = record[3]
                textbooks = record[4]
                hardware_projects = record[5]
                
                if cu:
                    # HTTP API返回的节点结构: {elementId, labels, properties}
                    props = cu.get("properties", cu)  # 兼容两种格式
                    
                    # 将grade_level字符串转换为整数难度
                    grade_level = props.get("grade_level", "middle")
                    difficulty_map = {"小学": 1, "初中": 2, "高中": 3, "大学": 4,
                                     "elementary": 1, "middle": 2, "high": 3, "university": 4}
                    difficulty = difficulty_map.get(grade_level, 2)
                    
                    # 添加课程单元节点
                    nodes.append(LearningPathNode(
                        node_type="course_unit",
                        node_id=props.get("id", "unknown"),
                        title=props.get("title", "Unknown"),
                        difficulty=difficulty,
                        estimated_hours=props.get("duration_weeks", 4) * 3,
                        description=f"学科: {props.get('subject', '未知')}"
                    ))
                
                # 添加相关的知识点
                for kp_data in knowledge_points[:2]:  # 限制每个单元最多2个知识点
                    nodes.append(LearningPathNode(
                        node_type="knowledge_point",
                        node_id=kp_data["id"],
                        title=kp_data["name"],
                        difficulty=depth + 1,
                        estimated_hours=1.5,
                        description=f"学科: {kp_data.get('subject', '未知')}"
                    ))
                
                # 添加跨学科关联的知识点
                for rkp_data in cross_discipline_kps[:2]:  # 最多2个跨学科知识点
                    nodes.append(LearningPathNode(
                        node_type="cross_discipline_kp",
                        node_id=rkp_data["id"],
                        title=f"[跨学科] {rkp_data['name']}",
                        difficulty=depth + 1,
                        estimated_hours=1.5,
                        description=f"关联学科: {rkp_data.get('subject', '未知')}"
                    ))
                
                # 添加相关的教材章节
                for tc_data in textbooks[:1]:  # 每个单元最多1个教材章节
                    nodes.append(LearningPathNode(
                        node_type="textbook_chapter",
                        node_id=tc_data["id"],
                        title=tc_data["title"],
                        difficulty=depth + 2,
                        estimated_hours=6,
                        description=f"学科: {tc_data.get('subject', '未知')}"
                    ))
                
                # 添加相关的硬件项目
                for hp_data in hardware_projects[:1]:  # 每个单元最多1个硬件项目
                    nodes.append(LearningPathNode(
                        node_type="hardware_project",
                        node_id=hp_data["id"],
                        title=hp_data["title"],
                        difficulty=depth + 1,
                        estimated_hours=4,
                        description=f"成本: ¥{hp_data.get('cost', 0)}"
                    ))
            
            logger.info(f"Generated {len(nodes)} path nodes")
            return nodes[:max_nodes]
        except Exception as e:
            logger.error(f"Error in generate_path: {str(e)}", exc_info=True)
            raise

    def get_path_summary(self, nodes: List[LearningPathNode]) -> Dict[str, Any]:
        if not nodes:
            return {}
        return {
            "total_nodes": len(nodes),
            "total_hours": sum(n.estimated_hours for n in nodes),
            "avg_difficulty": round(sum(n.difficulty for n in nodes) / len(nodes), 2)
        }
