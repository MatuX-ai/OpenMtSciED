"""
学习路径服务
基于知识图谱生成学习路径
"""

import logging
from typing import Dict, List, Optional, Any
from dataclasses import dataclass, field
from datetime import datetime

logger = logging.getLogger(__name__)


@dataclass
class PathNode:
    """路径节点"""
    node_id: str
    title: str
    node_type: str  # CourseUnit, TextbookChapter, KnowledgePoint
    subject: str
    difficulty: str  # beginner, intermediate, advanced, expert
    estimated_hours: float
    description: str = ""
    prerequisites: List[str] = field(default_factory=list)


@dataclass
class LearningPath:
    """学习路径"""
    user_id: str
    nodes: List[PathNode]
    total_hours: float
    generated_at: datetime = field(default_factory=datetime.now)
    path_quality_score: float = 0.0  # 路径质量评分 (0-1)
    difficulty_progression: List[str] = field(default_factory=list)  # 难度递进序列


@dataclass
class UserKnowledgeProfile:
    """用户知识画像"""
    user_id: str
    current_level: str  # beginner, intermediate, advanced
    completed_nodes: List[str] = field(default_factory=list)
    interests: List[str] = field(default_factory=list)  # 感兴趣的学科
    target_subject: Optional[str] = None  # 目标学科
    available_hours_per_week: float = 10.0  # 每周可用学习时间


class LearningPathService:
    """学习路径生成服务"""
    
    def __init__(self, neo4j_driver=None):
        """
        初始化学习路径服务
        
        Args:
            neo4j_driver: Neo4j数据库驱动（可选，用于真实查询）
        """
        self.neo4j_driver = neo4j_driver
        logger.info("LearningPathService initialized")
    
    def generate_path(
        self,
        user_profile: UserKnowledgeProfile,
        max_nodes: int = 10,
        max_hours: Optional[float] = None
    ) -> LearningPath:
        """
        生成个性化学习路径
        
        Args:
            user_profile: 用户知识画像
            max_nodes: 最大节点数
            max_hours: 最大总学时（可选）
            
        Returns:
            LearningPath: 生成的学习路径
        """
        logger.info(f"Generating learning path for user {user_profile.user_id}")
        logger.info(f"  Current level: {user_profile.current_level}")
        logger.info(f"  Target subject: {user_profile.target_subject}")
        logger.info(f"  Max nodes: {max_nodes}")
        
        # 1. 找到起点节点
        start_node = self._find_starting_node(user_profile)
        if not start_node:
            logger.warning("No suitable starting node found, using default")
            start_node = self._get_default_start_node(user_profile.current_level)
        
        # 2. 基于知识图谱构建路径
        path_nodes = self._build_path_from_graph(
            start_node=start_node,
            user_profile=user_profile,
            max_nodes=max_nodes,
            max_hours=max_hours
        )
        
        # 3. 计算路径质量指标
        total_hours = sum(node.estimated_hours for node in path_nodes)
        difficulty_seq = [node.difficulty for node in path_nodes]
        quality_score = self._calculate_path_quality(path_nodes, user_profile)
        
        # 4. 创建学习路径对象
        learning_path = LearningPath(
            user_id=user_profile.user_id,
            nodes=path_nodes,
            total_hours=total_hours,
            path_quality_score=quality_score,
            difficulty_progression=difficulty_seq
        )
        
        logger.info(f"Path generated: {len(path_nodes)} nodes, {total_hours:.1f} hours")
        logger.info(f"Quality score: {quality_score:.2f}")
        
        return learning_path
    
    def _find_starting_node(self, user_profile: UserKnowledgeProfile) -> Optional[PathNode]:
        """
        根据用户画像找到合适的起点节点
        
        策略：
        1. 如果用户有已完成节点，从最后一个完成节点的下一个节点开始
        2. 否则根据用户当前水平和兴趣选择起点
        """
        if not self.neo4j_driver:
            # 如果没有Neo4j连接，返回None，使用默认起点
            return None
        
        try:
            with self.neo4j_driver.session() as session:
                # 查找用户已完成的节点
                if user_profile.completed_nodes:
                    query = """
                    MATCH (completed {id: $last_completed})-[:PROGRESSES_TO]->(next)
                    WHERE NOT next.id IN $completed_ids
                    RETURN next
                    ORDER BY 
                        CASE next.difficulty 
                            WHEN 'beginner' THEN 1
                            WHEN 'intermediate' THEN 2
                            WHEN 'advanced' THEN 3
                            WHEN 'expert' THEN 4
                            ELSE 0
                        END ASC
                    LIMIT 1
                    """
                    result = session.run(
                        query,
                        last_completed=user_profile.completed_nodes[-1],
                        completed_ids=user_profile.completed_nodes
                    )
                    record = result.single()
                    if record:
                        return self._neo4j_record_to_path_node(record['next'])
                
                # 根据用户水平和兴趣选择起点
                query = """
                MATCH (n)
                WHERE n.difficulty = $level
                AND ($target_subject IS NULL OR n.subject = $target_subject)
                AND NOT n.id IN $completed_ids
                RETURN n
                ORDER BY rand()
                LIMIT 1
                """
                result = session.run(
                    query,
                    level=user_profile.current_level,
                    target_subject=user_profile.target_subject,
                    completed_ids=user_profile.completed_nodes
                )
                record = result.single()
                if record:
                    return self._neo4j_record_to_path_node(record['n'])
                    
        except Exception as e:
            logger.error(f"Error finding starting node: {e}")
        
        return None
    
    def _build_path_from_graph(
        self,
        start_node: PathNode,
        user_profile: UserKnowledgeProfile,
        max_nodes: int,
        max_hours: Optional[float]
    ) -> List[PathNode]:
        """
        从知识图谱构建学习路径
        
        使用广度优先搜索(BFS)遍历PROGRESSES_TO关系
        """
        if not self.neo4j_driver:
            # 模拟模式：返回简化的路径
            return self._generate_mock_path(start_node, max_nodes)
        
        try:
            with self.neo4j_driver.session() as session:
                # 使用Cypher查询找到从起点开始的路径
                query = """
                MATCH path = (start {id: $start_id})-[:PROGRESSES_TO*1..$max_depth]->(end)
                WHERE ALL(node IN nodes(path)[1..] WHERE NOT node.id IN $completed_ids)
                WITH path, length(path) AS path_length
                ORDER BY path_length ASC
                LIMIT 1
                UNWIND nodes(path) AS node
                RETURN node
                ORDER BY 
                    CASE node.difficulty 
                        WHEN 'beginner' THEN 1
                        WHEN 'intermediate' THEN 2
                        WHEN 'advanced' THEN 3
                        WHEN 'expert' THEN 4
                        ELSE 0
                    END ASC
                LIMIT $max_nodes
                """
                
                result = session.run(
                    query,
                    start_id=start_node.node_id,
                    max_depth=max_nodes,
                    completed_ids=user_profile.completed_nodes,
                    max_nodes=max_nodes
                )
                
                path_nodes = []
                total_hours = 0
                
                for record in result:
                    node = self._neo4j_record_to_path_node(record['node'])
                    
                    # 检查是否超过时间限制
                    if max_hours and (total_hours + node.estimated_hours) > max_hours:
                        break
                    
                    path_nodes.append(node)
                    total_hours += node.estimated_hours
                
                return path_nodes
                
        except Exception as e:
            logger.error(f"Error building path from graph: {e}")
            # 降级到模拟模式
            return self._generate_mock_path(start_node, max_nodes)
    
    def _generate_mock_path(self, start_node: PathNode, max_nodes: int) -> List[PathNode]:
        """
        生成模拟路径（用于测试或Neo4j不可用时）
        """
        # 定义难度级别
        difficulties = ['beginner', 'intermediate', 'advanced', 'expert']
        start_idx = difficulties.index(start_node.difficulty) if start_node.difficulty in difficulties else 0
        
        mock_nodes = [start_node]
        
        # 生成后续节点
        for i in range(1, max_nodes):
            diff_idx = min(start_idx + (i // 3), len(difficulties) - 1)
            mock_node = PathNode(
                node_id=f"mock_node_{i}",
                title=f"模拟节点 {i}",
                node_type="CourseUnit",
                subject=start_node.subject,
                difficulty=difficulties[diff_idx],
                estimated_hours=5.0 + i * 0.5,
                description=f"这是第{i}个模拟学习节点"
            )
            mock_nodes.append(mock_node)
        
        return mock_nodes
    
    def _calculate_path_quality(
        self,
        path_nodes: List[PathNode],
        user_profile: UserKnowledgeProfile
    ) -> float:
        """
        计算路径质量评分 (0-1)
        
        评估维度：
        1. 难度递进合理性 (40%)
        2. 学科相关性 (30%)
        3. 时间估算合理性 (30%)
        """
        if not path_nodes:
            return 0.0
        
        # 1. 难度递进评分
        difficulty_score = self._evaluate_difficulty_progression(path_nodes)
        
        # 2. 学科相关性评分
        subject_score = self._evaluate_subject_relevance(path_nodes, user_profile)
        
        # 3. 时间合理性评分
        time_score = self._evaluate_time_reasonableness(path_nodes, user_profile)
        
        # 加权平均
        quality = (
            difficulty_score * 0.4 +
            subject_score * 0.3 +
            time_score * 0.3
        )
        
        return min(max(quality, 0.0), 1.0)
    
    def _evaluate_difficulty_progression(self, path_nodes: List[PathNode]) -> float:
        """评估难度递进的合理性"""
        if len(path_nodes) < 2:
            return 1.0
        
        difficulty_levels = {'beginner': 1, 'intermediate': 2, 'advanced': 3, 'expert': 4}
        
        # 检查难度是否单调递增或持平
        violations = 0
        for i in range(1, len(path_nodes)):
            prev_level = difficulty_levels.get(path_nodes[i-1].difficulty, 0)
            curr_level = difficulty_levels.get(path_nodes[i].difficulty, 0)
            
            if curr_level < prev_level:
                violations += 1
        
        # 违规越少，分数越高
        violation_rate = violations / (len(path_nodes) - 1)
        return 1.0 - violation_rate
    
    def _evaluate_subject_relevance(
        self,
        path_nodes: List[PathNode],
        user_profile: UserKnowledgeProfile
    ) -> float:
        """评估学科相关性"""
        if not user_profile.interests and not user_profile.target_subject:
            return 0.8  # 没有偏好时给中等分数
        
        relevant_count = 0
        target_subjects = user_profile.interests.copy()
        if user_profile.target_subject:
            target_subjects.append(user_profile.target_subject)
        
        for node in path_nodes:
            if node.subject in target_subjects:
                relevant_count += 1
        
        return relevant_count / len(path_nodes) if path_nodes else 0.0
    
    def _evaluate_time_reasonableness(
        self,
        path_nodes: List[PathNode],
        user_profile: UserKnowledgeProfile
    ) -> float:
        """评估时间估算的合理性"""
        total_hours = sum(node.estimated_hours for node in path_nodes)
        weekly_hours = user_profile.available_hours_per_week
        
        # 理想情况下，路径应该在4-12周内完成
        ideal_min_weeks = 4
        ideal_max_weeks = 12
        
        estimated_weeks = total_hours / weekly_hours if weekly_hours > 0 else float('inf')
        
        if ideal_min_weeks <= estimated_weeks <= ideal_max_weeks:
            return 1.0
        elif estimated_weeks < ideal_min_weeks:
            # 时间太短
            return 0.7
        else:
            # 时间太长，随超出程度递减
            excess_ratio = (estimated_weeks - ideal_max_weeks) / ideal_max_weeks
            return max(0.3, 1.0 - excess_ratio * 0.5)
    
    def _neo4j_record_to_path_node(self, node_data: Dict[str, Any]) -> PathNode:
        """将Neo4j节点记录转换为PathNode对象"""
        return PathNode(
            node_id=node_data.get('id', ''),
            title=node_data.get('title', node_data.get('name', '')),
            node_type=node_data.get('labels', ['Unknown'])[0] if isinstance(node_data.get('labels'), list) else 'Unknown',
            subject=node_data.get('subject', 'General'),
            difficulty=node_data.get('difficulty', node_data.get('difficulty_level', 'beginner')),
            estimated_hours=node_data.get('duration_weeks', node_data.get('estimated_hours', 5.0)) * 3,  # 假设每周3小时
            description=node_data.get('description', ''),
            prerequisites=node_data.get('prerequisites', [])
        )
    
    def _get_default_start_node(self, level: str) -> PathNode:
        """获取默认的起点节点"""
        return PathNode(
            node_id="default_start",
            title=f"{level} 入门课程",
            node_type="CourseUnit",
            subject="General",
            difficulty=level,
            estimated_hours=10.0,
            description="默认起点节点"
        )
    

