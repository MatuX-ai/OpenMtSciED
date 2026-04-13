"""
AI-Edu 智能推荐系统数据模型
支持用户画像、课程特征、推荐记录等功能
"""

import enum

from sqlalchemy import (
    JSON,
    Boolean,
    Column,
    DateTime,
    Enum as SQLEnum,
    Float,
    ForeignKey,
    Index,
    Integer,
    String,
    Text,
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from database.db import Base


class LearningStyle(str, enum.Enum):
    """学习风格枚举"""

    VISUAL = "visual"  # 视觉型（偏好视频、图表）
    AUDITORY = "auditory"  # 听觉型（偏好讲解、讨论）
    KINESTHETIC = "kinesthetic"  # 动觉型（偏好实践、操作）
    READING = "reading"  # 读写型（偏好阅读、笔记）


class SkillLevel(str, enum.Enum):
    """技能水平枚举"""

    BEGINNER = "beginner"  # 初学者
    INTERMEDIATE = "intermediate"  # 中级
    ADVANCED = "advanced"  # 高级
    EXPERT = "expert"  # 专家


class UserLearningProfile(Base):
    """用户学习画像表"""

    __tablename__ = "user_learning_profiles"

    id = Column(Integer, primary_key=True, autoincrement=True)

    # 基础信息
    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False,
        unique=True,
        index=True,
        comment="用户 ID",
    )
    grade_level = Column(String(20), comment="年级水平（如 G1-G12）")
    age_group = Column(String(20), comment="年龄段（如 6-8 岁，9-12 岁）")

    # 学习风格
    learning_style = Column(
        SQLEnum(LearningStyle), default=LearningStyle.VISUAL, comment="学习风格"
    )
    preferred_content_type = Column(
        String(50), default="video", comment="偏好内容类型（video/text/interactive）"
    )

    # 能力维度（JSON 存储多维度评估）
    ability_dimensions = Column(JSON, default=dict, comment="能力维度评估")
    # 示例结构:
    # {
    #     "logical_reasoning": {"score": 75, "level": "intermediate"},
    #     "math_foundation": {"score": 80, "level": "advanced"},
    #     "programming_logic": {"score": 65, "level": "intermediate"},
    #     "creativity": {"score": 85, "level": "advanced"}
    # }

    # 兴趣偏好（JSON 存储）
    interest_preferences = Column(JSON, default=list, comment="兴趣偏好列表")
    # 示例结构:
    # [
    #     {"category": "game_development", "interest_score": 90},
    #     {"category": "robotics", "interest_score": 85},
    #     {"category": "data_science", "interest_score": 70}
    # ]

    # 知识掌握程度（JSON 存储知识点掌握情况）
    knowledge_mastery = Column(JSON, default=dict, comment="知识点掌握程度")
    # 示例结构:
    # {
    #     "python_basics": 0.8,      # 掌握度 80%
    #     "loops": 0.9,              # 掌握度 90%
    #     "functions": 0.6,          # 掌握度 60%
    #     "data_structures": 0.4     # 掌握度 40%
    # }

    # 学习统计
    total_study_time_minutes = Column(Integer, default=0, comment="总学习时长（分钟）")
    completed_courses_count = Column(Integer, default=0, comment="完成课程数")
    average_quiz_score = Column(Float, default=0.0, comment="平均测验分数")
    current_streak_days = Column(Integer, default=0, comment="当前连续学习天数")
    longest_streak_days = Column(Integer, default=0, comment="最长连续学习天数")

    # 学习目标
    learning_goals = Column(JSON, default=list, comment="学习目标列表")
    # 示例结构:
    # [
    #     {"goal": "learn_python_basics", "target_date": "2026-06-30", "progress": 0.6},
    #     {"goal": "build_first_game", "target_date": "2026-12-31", "progress": 0.2}
    # ]

    # 推荐权重配置（JSON 存储）
    recommendation_weights = Column(JSON, default=dict, comment="推荐算法权重配置")
    # 示例结构:
    # {
    #     "difficulty_match": 0.3,    # 难度匹配权重
    #     "interest_match": 0.3,      # 兴趣匹配权重
    #     "skill_improvement": 0.2,   # 技能提升权重
    #     "popularity": 0.1,          # 热门程度权重
    #     "diversity": 0.1            # 多样性权重
    # }

    # 时间戳
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # 关系
    user = relationship("User", backref="learning_profile")
    recommendations = relationship(
        "RecommendationRecord", back_populates="user_profile"
    )

    # 索引
    __table_args__ = (
        Index("idx_user_profile_user", "user_id"),
        Index("idx_user_profile_grade", "grade_level"),
    )

    def to_dict(self):
        """转换为字典"""
        return {
            "id": self.id,
            "user_id": self.user_id,
            "grade_level": self.grade_level,
            "age_group": self.age_group,
            "learning_style": (
                self.learning_style.value if self.learning_style else None
            ),
            "preferred_content_type": self.preferred_content_type,
            "ability_dimensions": self.ability_dimensions,
            "interest_preferences": self.interest_preferences,
            "knowledge_mastery": self.knowledge_mastery,
            "total_study_time_minutes": self.total_study_time_minutes,
            "completed_courses_count": self.completed_courses_count,
            "average_quiz_score": self.average_quiz_score,
            "current_streak_days": self.current_streak_days,
            "longest_streak_days": self.longest_streak_days,
            "learning_goals": self.learning_goals,
            "recommendation_weights": self.recommendation_weights,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }


class CourseFeature(Base):
    """课程特征表"""

    __tablename__ = "course_features"

    id = Column(Integer, primary_key=True, autoincrement=True)

    # 关联信息
    course_id = Column(Integer, nullable=False, index=True, comment="课程 ID")
    lesson_id = Column(Integer, nullable=True, comment="课时 ID（可选）")

    # 难度标签
    difficulty_level = Column(Integer, default=1, comment="难度等级（1-5）")
    difficulty_description = Column(String(100), comment="难度描述（如'适合零基础'）")

    # 知识点标签
    knowledge_points = Column(JSON, default=list, comment="知识点标签列表")
    # 示例：["python_basics", "variables", "data_types"]

    # 技能分类
    skill_categories = Column(JSON, default=list, comment="技能分类列表")
    # 示例：["programming", "logic", "problem_solving"]

    # 先修要求
    prerequisites = Column(JSON, default=list, comment="先修课程 ID 列表")
    # 示例：[1, 5, 8]

    # 后续课程
    next_courses = Column(JSON, default=list, comment="后续推荐课程 ID 列表")

    # 内容特征
    content_type = Column(
        String(50), default="video", comment="内容类型（video/text/interactive/mixed）"
    )
    estimated_duration_minutes = Column(Integer, default=30, comment="预计时长（分钟）")
    language = Column(String(20), default="zh-CN", comment="语言")

    # 质量指标
    average_rating = Column(Float, default=0.0, comment="平均评分（0-5）")
    completion_rate = Column(Float, default=0.0, comment="完成率（0-1）")
    student_count = Column(Integer, default=0, comment="学习人数")

    # 热门标签
    tags = Column(JSON, default=list, comment="标签列表")
    # 示例：["AI", "beginner-friendly", "popular", "new"]

    # 元数据
    course_metadata = Column(JSON, default=dict, comment="额外元数据")

    # 时间戳
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # 索引
    __table_args__ = (
        Index("idx_course_feature_course", "course_id"),
        Index("idx_course_feature_difficulty", "difficulty_level"),
        Index("idx_course_feature_skills", "skill_categories", postgresql_using="gin"),
    )

    def to_dict(self):
        """转换为字典"""
        return {
            "id": self.id,
            "course_id": self.course_id,
            "lesson_id": self.lesson_id,
            "difficulty_level": self.difficulty_level,
            "difficulty_description": self.difficulty_description,
            "knowledge_points": self.knowledge_points,
            "skill_categories": self.skill_categories,
            "prerequisites": self.prerequisites,
            "next_courses": self.next_courses,
            "content_type": self.content_type,
            "estimated_duration_minutes": self.estimated_duration_minutes,
            "language": self.language,
            "average_rating": self.average_rating,
            "completion_rate": self.completion_rate,
            "student_count": self.student_count,
            "tags": self.tags,
            "metadata": self.course_metadata,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }


class RecommendationAlgorithm(str, enum.Enum):
    """推荐算法类型枚举"""

    COLLABORATIVE_FILTERING = "collaborative_filtering"  # 协同过滤
    CONTENT_BASED = "content_based"  # 基于内容
    HYBRID = "hybrid"  # 混合推荐
    POPULARITY = "popularity"  # 热门排行
    KNOWLEDGE_GRAPH = "knowledge_graph"  # 知识图谱


class RecommendationRecord(Base):
    """推荐记录表（用于追踪推荐效果和 A/B 测试）"""

    __tablename__ = "recommendation_records"

    id = Column(Integer, primary_key=True, autoincrement=True)

    # 关联信息
    user_id = Column(
        Integer, ForeignKey("users.id"), nullable=False, index=True, comment="用户 ID"
    )
    course_id = Column(Integer, nullable=False, index=True, comment="推荐课程 ID")

    # 推荐算法信息
    algorithm_type = Column(
        SQLEnum(RecommendationAlgorithm), nullable=False, comment="推荐算法类型"
    )
    recommendation_score = Column(Float, default=0.0, comment="推荐分数（0-1）")

    # 推荐理由（JSON 存储）
    reason = Column(JSON, default=dict, comment="推荐理由")
    # 示例结构:
    # {
    #     "type": "skill_improvement",
    #     "description": "这门课程可以帮助你提升函数编程能力",
    #     "matched_skills": ["functions", "python_basics"],
    #     "confidence": 0.85
    # }

    # 推荐上下文
    context = Column(JSON, default=dict, comment="推荐上下文信息")
    # 示例：
    # {
    #     "location": "home_page",
    #     "section": "recommended_for_you",
    #     "timestamp": "2026-03-03T10:30:00Z"
    # }

    # 用户反馈
    user_clicked = Column(Boolean, default=False, index=True, comment="用户是否点击")
    user_completed = Column(Boolean, default=False, comment="用户是否完成课程")
    user_rating = Column(Integer, comment="用户评分（1-5）")
    feedback_text = Column(Text, comment="用户文字反馈")

    # 时间戳
    clicked_at = Column(DateTime(timezone=True), nullable=True, comment="点击时间")
    completed_at = Column(DateTime(timezone=True), nullable=True, comment="完成时间")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # 关系
    user_profile = relationship("UserLearningProfile", backref="recommendations")

    # 索引
    __table_args__ = (
        Index("idx_recommendation_user_course", "user_id", "course_id", unique=False),
        Index("idx_recommendation_algorithm", "algorithm_type"),
        Index("idx_recommendation_clicked", "user_clicked"),
    )

    def to_dict(self):
        """转换为字典"""
        return {
            "id": self.id,
            "user_id": self.user_id,
            "course_id": self.course_id,
            "algorithm_type": self.algorithm_type.value,
            "recommendation_score": self.recommendation_score,
            "reason": self.reason,
            "context": self.context,
            "user_clicked": self.user_clicked,
            "user_completed": self.user_completed,
            "user_rating": self.user_rating,
            "feedback_text": self.feedback_text,
            "clicked_at": self.clicked_at.isoformat() if self.clicked_at else None,
            "completed_at": (
                self.completed_at.isoformat() if self.completed_at else None
            ),
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


# ==================== 辅助函数 ====================


def calculate_user_similarity(profile1: dict, profile2: dict) -> float:
    """
    计算两个用户画像的相似度（余弦相似度简化版）

    Returns:
        相似度分数（0-1）
    """
    # 提取共同特征向量
    features = []

    # 兴趣偏好相似度
    interests1 = set(
        i.get("category") for i in profile1.get("interest_preferences", [])
    )
    interests2 = set(
        i.get("category") for i in profile2.get("interest_preferences", [])
    )

    if interests1 and interests2:
        intersection = len(interests1 & interests2)
        union = len(interests1 | interests2)
        interest_similarity = intersection / union if union > 0 else 0
        features.append(interest_similarity)

    # 学习风格相似度
    if profile1.get("learning_style") == profile2.get("learning_style"):
        features.append(1.0)
    else:
        features.append(0.0)

    # 难度偏好相似度
    avg_difficulty1 = sum(
        d.get("score", 0) for d in profile1.get("ability_dimensions", {}).values()
    ) / max(len(profile1.get("ability_dimensions", {})), 1)
    avg_difficulty2 = sum(
        d.get("score", 0) for d in profile2.get("ability_dimensions", {}).values()
    ) / max(len(profile2.get("ability_dimensions", {})), 1)

    difficulty_similarity = 1 - abs(avg_difficulty1 - avg_difficulty2) / 100
    features.append(difficulty_similarity)

    # 计算平均相似度
    if features:
        return sum(features) / len(features)
    return 0.0
