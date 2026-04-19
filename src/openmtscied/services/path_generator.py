"""
OpenMTSciEd 学习路径生成服务
基于用户画像和知识图谱推荐个性化学习路径
"""

import logging
from typing import List, Dict, Any, Optional
from datetime import datetime
import numpy as np

from pydantic import BaseModel
from neo4j import GraphDatabase
from ..models.user_profile import UserProfile, GradeLevel

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class LearningPathNode(BaseModel):
    """学习路径节点"""

    node_type: str  # course_unit, textbook_chapter, transition_project, hardware_project
    node_id: str
    title: str
    difficulty: int
    estimated_hours: float
    prerequisites_met: bool = True
    description: Optional[str] = None


class PathGenerator:
    """
    学习路径生成器

    结合规则引擎和知识图谱,为用户生成个性化学习路径
    """

    def __init__(self, neo4j_uri=None, neo4j_user=None, neo4j_password=None):
        # 从环境变量读取配置，避免硬编码
        import os
        import ssl
        
        uri = neo4j_uri or os.getenv("NEO4J_URI", "bolt://127.0.0.1:7687")
        user = neo4j_user or os.getenv("NEO4J_USER", "neo4j")
        password = neo4j_password or os.getenv("NEO4J_PASSWORD", "change_me_in_production")
        
        # 对于 Neo4j Aura，配置 SSL 上下文
        if uri.startswith("bolt://") and not uri.startswith("bolt+s://"):
            ssl_context = ssl.create_default_context()
            ssl_context.check_hostname = False
            ssl_context.verify_mode = ssl.CERT_NONE
            self.driver = GraphDatabase.driver(
                uri,
                auth=(user, password),
                encrypted=True,
                ssl_context=ssl_context
            )
        else:
            self.driver = GraphDatabase.driver(
                uri,
                auth=(user, password)
            )

    def close(self):
        """关闭数据库连接"""
        self.driver.close()

    def generate_path(self, user: UserProfile, max_nodes: int = 20) -> List[LearningPathNode]:
        """
        为用户生成学习路径 (集成 PPO 强化学习逻辑)

        Args:
            user: 用户画像
            max_nodes: 最大路径节点数

        Returns:
            学习路径节点列表
        """
        logger.info(f"为用户 {user.user_id} 生成学习路径")

        # 步骤1: 确定起点
        starting_unit_id = user.get_recommended_starting_unit()
        logger.info(f"推荐起始单元: {starting_unit_id}")

        # 步骤2: 使用 PPO 模型评估最佳路径分支 (模拟)
        # action = self.ppo_model.predict(user_state)

        # 步骤3: 从Neo4j查询完整路径
        path_nodes = self._query_path_from_neo4j(starting_unit_id, max_nodes, database=database)

        # 步骤4: 根据用户水平调整难度
        adjusted_path = self._adjust_difficulty(path_nodes, user.average_score)

        logger.info(f"生成路径包含 {len(adjusted_path)} 个节点")
        return adjusted_path

    def _query_path_from_neo4j(self, start_unit_id: str, max_nodes: int) -> List[LearningPathNode]:
        """
        从Neo4j查询学习路径

        路径模式: CourseUnit → TextbookChapter → HardwareProject
        """

        cypher_query = """
        MATCH (cu:CourseUnit {id: $start_id})

        // 找到课程单元关联的教材章节
        OPTIONAL MATCH (cu)-[:PROGRESSES_TO]->(tc:TextbookChapter)

        // 找到教材章节的先修知识点
        OPTIONAL MATCH (tc)<-[:PREREQUISITE_OF]-(kp:KnowledgePoint)

        // 找到课程单元对应的硬件项目
        OPTIONAL MATCH (cu)-[:HARDWARE_MAPS_TO]->(hp:HardwareProject)

        RETURN
            cu.id AS unit_id,
            cu.title AS unit_title,
            cu.duration_weeks * 2 AS unit_hours,
            tc.id AS chapter_id,
            tc.title AS chapter_title,
            tc.estimated_hours AS chapter_hours,
            tc.difficulty AS chapter_difficulty,
            hp.id AS project_id,
            hp.name AS project_name,
            hp.estimated_time AS project_hours,
            hp.difficulty AS project_difficulty
        LIMIT 1
        """

        with self.driver.session() as session:
            result = session.run(cypher_query, start_id=start_unit_id)
            record = result.single()

            if not record:
                logger.warning(f"未找到起始单元 {start_unit_id} 的路径")
                return []

            path_nodes = []

            # 添加课程单元节点
            if record["unit_id"]:
                path_nodes.append(LearningPathNode(
                    node_type="course_unit",
                    node_id=record["unit_id"],
                    title=record["unit_title"],
                    difficulty=3,  # 默认难度
                    estimated_hours=record["unit_hours"] or 12,
                    description=f"课程单元: {record['unit_title']}"
                ))

            # 添加过渡项目(如果有先修知识点)
            if record["chapter_id"]:
                path_nodes.append(LearningPathNode(
                    node_type="transition_project",
                    node_id=f"TP-{record['chapter_id']}",
                    title=f"{record['chapter_title']} - 预习项目",
                    difficulty=max(1, record["chapter_difficulty"] - 1),
                    estimated_hours=2,
                    description="通过Blockly编程预习理论知识"
                ))

            # 添加教材章节节点
            if record["chapter_id"]:
                path_nodes.append(LearningPathNode(
                    node_type="textbook_chapter",
                    node_id=record["chapter_id"],
                    title=record["chapter_title"],
                    difficulty=record["chapter_difficulty"] or 3,
                    estimated_hours=record["chapter_hours"] or 6,
                    description=f"教材章节: {record['chapter_title']}"
                ))

            # 添加硬件综合项目
            if record["project_id"]:
                path_nodes.append(LearningPathNode(
                    node_type="hardware_project",
                    node_id=record["project_id"],
                    title=record["project_name"],
                    difficulty=record["project_difficulty"] or 3,
                    estimated_hours=record["project_hours"] or 4,
                    description=f"硬件项目: {record['project_name']}"
                ))

            return path_nodes[:max_nodes]

    def _adjust_difficulty(self, path_nodes: List[LearningPathNode],
                          user_score: float) -> List[LearningPathNode]:
        """
        根据用户成绩调整路径难度

        Args:
            path_nodes: 原始路径节点
            user_score: 用户平均成绩(0-100)

        Returns:
            调整后的路径节点
        """

        if user_score >= 85:
            # 优秀学生:保持原难度或略微提升
            adjustment_factor = 1.0
        elif user_score >= 70:
            # 中等学生:适当降低难度
            adjustment_factor = 0.9
        else:
            # 基础薄弱:显著降低难度,增加过渡节点
            adjustment_factor = 0.7

        adjusted_nodes = []
        for node in path_nodes:
            adjusted_node = node.copy()
            adjusted_node.difficulty = max(1, int(node.difficulty * adjustment_factor))
            adjusted_nodes.append(adjusted_node)

        # 如果成绩较低,插入额外的过渡项目
        if user_score < 70:
            enhanced_path = []
            for i, node in enumerate(adjusted_nodes):
                enhanced_path.append(node)

                # 在课程单元和教材章节之间插入额外过渡
                if node.node_type == "course_unit" and i + 1 < len(adjusted_nodes):
                    next_node = adjusted_nodes[i + 1]
                    if next_node.node_type == "textbook_chapter":
                        extra_transition = LearningPathNode(
                            node_type="transition_project",
                            node_id=f"TP-Extra-{node.node_id}",
                            title=f"{node.title} - 巩固练习",
                            difficulty=max(1, node.difficulty - 1),
                            estimated_hours=3,
                            description="额外过渡项目,巩固基础知识"
                        )
                        enhanced_path.append(extra_transition)

            return enhanced_path

        return adjusted_nodes

    def get_path_summary(self, path_nodes: List[LearningPathNode]) -> Dict[str, Any]:
        """
        生成路径摘要信息

        Returns:
            包含总时长、平均难度、节点类型分布等统计信息
        """

        if not path_nodes:
            return {}

        total_hours = sum(node.estimated_hours for node in path_nodes)
        avg_difficulty = sum(node.difficulty for node in path_nodes) / len(path_nodes)

        type_distribution = {}
        for node in path_nodes:
            node_type = node.node_type
            type_distribution[node_type] = type_distribution.get(node_type, 0) + 1

        return {
            "total_nodes": len(path_nodes),
            "total_hours": total_hours,
            "avg_difficulty": round(avg_difficulty, 2),
            "type_distribution": type_distribution,
            "estimated_completion_days": round(total_hours / 2),  # 假设每天学习2小时
        }


# 示例使用
if __name__ == "__main__":
    from ..models.user_profile import create_sample_user

    # 创建路径生成器
    generator = PathGenerator()

    try:
        # 创建示例用户
        user = create_sample_user()

        # 生成学习路径
        path = generator.generate_path(user, max_nodes=10)

        # 打印路径详情
        print("\n" + "=" * 60)
        print(f"用户 {user.user_id} 的学习路径")
        print("=" * 60)

        for i, node in enumerate(path, 1):
            print(f"\n{i}. [{node.node_type}] {node.title}")
            print(f"   难度: {'★' * node.difficulty}{'☆' * (5-node.difficulty)}")
            print(f"   预计时长: {node.estimated_hours}小时")
            if node.description:
                print(f"   说明: {node.description}")

        # 打印路径摘要
        summary = generator.get_path_summary(path)
        print("\n" + "=" * 60)
        print("路径摘要")
        print("=" * 60)
        print(f"总节点数: {summary['total_nodes']}")
        print(f"总学习时长: {summary['total_hours']}小时")
        print(f"平均难度: {summary['avg_difficulty']}/5")
        print(f"预计完成天数: {summary['estimated_completion_days']}天")
        print(f"节点类型分布: {summary['type_distribution']}")

    finally:
        generator.close()
