"""
OpenMTSciEd 用户画像模型
定义用户属性、学习进度和偏好
"""

from pydantic import BaseModel, Field, validator
from typing import List, Dict, Optional
from datetime import datetime
from enum import Enum


class GradeLevel(str, Enum):
    """学段枚举"""
    ELEMENTARY = "小学"
    MIDDLE = "初中"
    HIGH = "高中"
    UNIVERSITY = "大学"


class LearningStyle(str, Enum):
    """学习风格枚举"""
    VISUAL = "视觉型"
    AUDITORY = "听觉型"
    KINESTHETIC = "动觉型"
    READ_WRITE = "读写型"


class KnowledgeTestScore(BaseModel):
    """知识点测试成绩"""
    knowledge_point_id: str = Field(..., description="知识点ID")
    score: float = Field(..., ge=0, le=100, description="得分(0-100)")
    test_date: datetime = Field(default_factory=datetime.now, description="测试日期")
    attempts: int = Field(default=1, ge=1, description="尝试次数")


class CompletedUnit(BaseModel):
    """已完成的课程单元"""
    unit_id: str = Field(..., description="课程单元ID")
    completion_date: datetime = Field(default_factory=datetime.now, description="完成日期")
    duration_hours: float = Field(..., gt=0, description="学习时长(小时)")
    performance_score: float = Field(..., ge=0, le=100, description="表现评分")


class UserProfile(BaseModel):
    """
    用户画像模型

    用于个性化学习路径推荐
    """

    # 基础信息
    user_id: str = Field(..., description="用户唯一标识")
    age: int = Field(..., ge=6, le=25, description="年龄")
    grade_level: GradeLevel = Field(..., description="学段")

    # 知识水平评估
    knowledge_test_scores: List[KnowledgeTestScore] = Field(
        default_factory=list,
        description="知识点测试成绩列表"
    )

    @property
    def average_score(self) -> float:
        """计算平均测试成绩"""
        if not self.knowledge_test_scores:
            return 0.0
        total = sum(score.score for score in self.knowledge_test_scores)
        return total / len(self.knowledge_test_scores)

    @property
    def proficiency_by_subject(self) -> Dict[str, float]:
        """按学科计算熟练度"""
        subject_scores: Dict[str, List[float]] = {}

        # 这里需要从Neo4j查询知识点对应的学科
        # 简化实现:假设已有映射
        for test in self.knowledge_test_scores:
            # TODO: 从Neo4j查询knowledge_point_id对应的subject
            subject = "未知"  # 占位符
            if subject not in subject_scores:
                subject_scores[subject] = []
            subject_scores[subject].append(test.score)

        return {
            subject: sum(scores) / len(scores)
            for subject, scores in subject_scores.items()
        }

    # 学习历史
    completed_units: List[CompletedUnit] = Field(
        default_factory=list,
        description="已完成的课程单元"
    )

    @property
    def total_learning_hours(self) -> float:
        """总学习时长"""
        return sum(unit.duration_hours for unit in self.completed_units)

    @property
    def completion_rate(self) -> float:
        """完成率(已完成单元数/推荐单元总数)"""
        # TODO: 从数据库获取推荐单元总数
        recommended_total = max(len(self.completed_units) + 5, 10)  # 估算值
        return len(self.completed_units) / recommended_total

    # 学习偏好
    preferred_learning_style: LearningStyle = Field(
        default=LearningStyle.VISUAL,
        description="首选学习风格"
    )

    preferred_subjects: List[str] = Field(
        default_factory=list,
        description="偏好的学科列表"
    )

    # 学习目标
    target_grade_level: Optional[GradeLevel] = Field(
        None,
        description="目标学段(用于长期规划)"
    )

    weekly_study_hours: float = Field(
        default=5.0,
        ge=1.0,
        le=40.0,
        description="每周计划学习时长(小时)"
    )

    # 元数据
    created_at: datetime = Field(default_factory=datetime.now, description="创建时间")
    updated_at: datetime = Field(default_factory=datetime.now, description="更新时间")

    @validator('age')
    def validate_age(cls, v):
        if v < 6 or v > 25:
            raise ValueError("年龄必须在6-25岁之间")
        return v

    def get_recommended_starting_unit(self) -> str:
        """
        根据年龄和测试成绩推荐起始课程单元

        Returns:
            推荐的课程单元ID
        """
        # 规则引擎:基于年龄和平均分推荐
        avg_score = self.average_score

        if self.age <= 10:  # 小学
            if avg_score >= 80:
                return "OS-Unit-Advanced-Elementary"
            else:
                return "OS-Unit-Basic-Elementary"

        elif self.age <= 14:  # 初中
            if avg_score >= 75:
                return "OS-Unit-001"  # 生态系统能量流动
            else:
                return "OS-Unit-Basic-Middle"

        elif self.age <= 18:  # 高中
            if avg_score >= 70:
                return "OS-Unit-002"  # 电磁感应现象
            else:
                return "OS-Unit-Basic-High"

        else:  # 大学
            return "OST-Phys-Ch1"  # 牛顿运动定律

    def to_dict(self) -> dict:
        """转换为字典(用于JSON序列化)"""
        return {
            "user_id": self.user_id,
            "age": self.age,
            "grade_level": self.grade_level.value,
            "average_score": self.average_score,
            "completed_units_count": len(self.completed_units),
            "total_learning_hours": self.total_learning_hours,
            "completion_rate": self.completion_rate,
            "preferred_learning_style": self.preferred_learning_style.value,
            "weekly_study_hours": self.weekly_study_hours,
        }


# 示例:创建测试用户
def create_sample_user() -> UserProfile:
    """创建示例用户用于测试"""

    user = UserProfile(
        user_id="user_001",
        age=13,
        grade_level=GradeLevel.MIDDLE,
        knowledge_test_scores=[
            KnowledgeTestScore(
                knowledge_point_id="KP-Bio-001",
                score=85.0,
                attempts=2
            ),
            KnowledgeTestScore(
                knowledge_point_id="KP-Phys-001",
                score=72.0,
                attempts=1
            ),
        ],
        completed_units=[],
        preferred_learning_style=LearningStyle.VISUAL,
        preferred_subjects=["生物", "物理"],
        weekly_study_hours=6.0,
    )

    return user


if __name__ == "__main__":
    # 测试用户画像
    user = create_sample_user()

    print("=" * 60)
    print("用户画像示例")
    print("=" * 60)
    print(f"用户ID: {user.user_id}")
    print(f"年龄: {user.age}岁")
    print(f"学段: {user.grade_level.value}")
    print(f"平均成绩: {user.average_score:.1f}")
    print(f"学习风格: {user.preferred_learning_style.value}")
    print(f"每周学习时长: {user.weekly_study_hours}小时")
    print(f"推荐起始单元: {user.get_recommended_starting_unit()}")
    print("\n用户信息摘要:")
    print(user.to_dict())
