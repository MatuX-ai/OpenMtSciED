"""
OpenMTSciEd 用户画像模型 (MVP 极简版)
"""

from pydantic import BaseModel, Field
from typing import List
from datetime import datetime
from enum import Enum


class GradeLevel(str, Enum):
    ELEMENTARY = "小学"
    MIDDLE = "初中"
    HIGH = "高中"
    UNIVERSITY = "大学"


class KnowledgeTestScore(BaseModel):
    knowledge_point_id: str
    score: float = Field(..., ge=0, le=100)
    test_date: datetime = Field(default_factory=datetime.now)


class CompletedUnit(BaseModel):
    unit_id: str
    completion_date: datetime = Field(default_factory=datetime.now)
    duration_hours: float
    performance_score: float


class UserProfile(BaseModel):
    """用户画像模型 (MVP 极简版)"""
    user_id: str
    age: int = Field(..., ge=6, le=25)
    grade_level: GradeLevel
    knowledge_test_scores: List[KnowledgeTestScore] = Field(default_factory=list)
    completed_units: List[CompletedUnit] = Field(default_factory=list)

    @property
    def average_score(self) -> float:
        if not self.knowledge_test_scores:
            return 70.0
        return sum(s.score for s in self.knowledge_test_scores) / len(self.knowledge_test_scores)

    def get_recommended_starting_unit(self) -> str:
        """根据年龄和成绩推荐起始课程单元
        
        根据年龄段匹配Neo4j中实际的CourseUnit ID:
        - 小学(6-10岁): OS-MS-{subject}-001 (初中-物理/生物/化学)
        - 初中(11-14岁): OS-MS-{subject}-001 
        - 高中(15-18岁): OS-HS-{subject}-001
        - 大学(>18岁): OST-{subject}-Ch1
        """
        avg = self.average_score
        
        if self.age <= 10:  # 小学
            # 小学阶段推荐初中物理入门
            return "OS-MS-Phys-001"  # 光与物质相互作用
        
        elif self.age <= 14:  # 初中
            # 根据成绩推荐不同难度的起点
            if avg >= 80:
                # 高分学生从进阶内容开始
                return "OS-MS-Phys-002"  # 热能与温度
            else:
                return "OS-MS-Phys-001"  # 光与物质相互作用
        
        elif self.age <= 18:  # 高中
            # 高中阶段从高中内容开始
            return "OS-MS-Phys-003"  # 碰撞与动量
        
        else:  # 大学
            # 大学阶段推荐大学物理
            return "OS-MS-Phys-001"  # 先通过K12内容过渡
        
        # Fallback: 返回第一个可用起点
        return "OS-MS-Phys-001"


def create_sample_user() -> UserProfile:
    return UserProfile(
        user_id="user_001",
        age=13,
        grade_level=GradeLevel.MIDDLE,
        knowledge_test_scores=[
            KnowledgeTestScore(knowledge_point_id="KP-Bio-001", score=85.0),
            KnowledgeTestScore(knowledge_point_id="KP-Phys-001", score=72.0),
        ],
    )
