"""
学习路径API数据模型
定义请求和响应的Pydantic模型
"""

from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field


class PathNodeResponse(BaseModel):
    """路径节点响应模型"""
    node_id: str = Field(..., description="节点ID")
    title: str = Field(..., description="节点标题")
    node_type: str = Field(..., description="节点类型", examples=["CourseUnit", "TextbookChapter", "KnowledgePoint"])
    subject: str = Field(..., description="学科")
    difficulty: str = Field(..., description="难度级别", examples=["beginner", "intermediate", "advanced", "expert"])
    estimated_hours: float = Field(..., description="预估学时")
    description: Optional[str] = Field(None, description="节点描述")
    prerequisites: List[str] = Field(default_factory=list, description="先修节点ID列表")
    
    class Config:
        json_schema_extra = {
            "example": {
                "node_id": "OS-Unit-001",
                "title": "生态系统能量流动",
                "node_type": "CourseUnit",
                "subject": "生物",
                "difficulty": "beginner",
                "estimated_hours": 15.0,
                "description": "学习生态系统中的能量传递规律",
                "prerequisites": []
            }
        }


class LearningPathResponse(BaseModel):
    """学习路径响应模型"""
    user_id: str = Field(..., description="用户ID")
    nodes: List[PathNodeResponse] = Field(..., description="路径节点列表")
    total_hours: float = Field(..., description="总预估学时")
    generated_at: datetime = Field(..., description="生成时间")
    path_quality_score: float = Field(..., ge=0.0, le=1.0, description="路径质量评分(0-1)")
    difficulty_progression: List[str] = Field(..., description="难度递进序列")
    
    class Config:
        json_schema_extra = {
            "example": {
                "user_id": "user_123",
                "nodes": [],
                "total_hours": 50.0,
                "generated_at": "2026-04-14T20:00:00",
                "path_quality_score": 0.85,
                "difficulty_progression": ["beginner", "beginner", "intermediate", "intermediate", "advanced"]
            }
        }


class PathGenerationRequest(BaseModel):
    """路径生成请求模型"""
    user_id: str = Field(..., description="用户ID", min_length=1)
    current_level: str = Field(
        ...,
        description="当前知识水平",
        examples=["beginner", "intermediate", "advanced"]
    )
    target_subject: Optional[str] = Field(
        None,
        description="目标学科（可选）",
        examples=["物理", "生物", "化学", "数学"]
    )
    interests: List[str] = Field(
        default_factory=list,
        description="感兴趣的学科列表",
        examples=[["物理", "工程"]]
    )
    completed_nodes: List[str] = Field(
        default_factory=list,
        description="已完成的节点ID列表"
    )
    max_nodes: int = Field(
        default=10,
        ge=1,
        le=50,
        description="最大节点数"
    )
    max_hours: Optional[float] = Field(
        None,
        ge=1.0,
        description="最大总学时限制（可选）"
    )
    available_hours_per_week: float = Field(
        default=10.0,
        ge=1.0,
        le=40.0,
        description="每周可用学习时间（小时）"
    )
    
    class Config:
        json_schema_extra = {
            "example": {
                "user_id": "user_123",
                "current_level": "beginner",
                "target_subject": "物理",
                "interests": ["物理", "工程"],
                "completed_nodes": [],
                "max_nodes": 10,
                "max_hours": 50.0,
                "available_hours_per_week": 10.0
            }
        }


class ProgressUpdateRequest(BaseModel):
    """进度更新请求模型"""
    user_id: str = Field(..., description="用户ID")
    completed_node_id: str = Field(..., description="刚完成的节点ID")
    completion_date: Optional[datetime] = Field(None, description="完成时间（默认为当前时间）")
    rating: Optional[int] = Field(
        None,
        ge=1,
        le=5,
        description="节点评分（1-5星）"
    )
    feedback: Optional[str] = Field(None, description="文字反馈")
    
    class Config:
        json_schema_extra = {
            "example": {
                "user_id": "user_123",
                "completed_node_id": "OS-Unit-001",
                "completion_date": "2026-04-14T20:30:00",
                "rating": 4,
                "feedback": "内容很好，但难度稍高"
            }
        }


class UserProgressResponse(BaseModel):
    """用户进度响应模型"""
    user_id: str = Field(..., description="用户ID")
    completed_nodes: List[str] = Field(..., description="已完成节点ID列表")
    completed_count: int = Field(..., description="已完成节点数")
    total_path_nodes: int = Field(..., description="路径总节点数")
    progress_percentage: float = Field(..., ge=0.0, le=100.0, description="完成百分比")
    current_node: Optional[PathNodeResponse] = Field(None, description="当前正在学习的节点")
    next_recommended_node: Optional[PathNodeResponse] = Field(None, description="下一个推荐节点")
    estimated_completion_date: Optional[datetime] = Field(None, description="预计完成日期")
    
    class Config:
        json_schema_extra = {
            "example": {
                "user_id": "user_123",
                "completed_nodes": ["OS-Unit-001", "OS-Unit-002"],
                "completed_count": 2,
                "total_path_nodes": 10,
                "progress_percentage": 20.0,
                "current_node": None,
                "next_recommended_node": None,
                "estimated_completion_date": "2026-05-14T00:00:00"
            }
        }


class PathAdjustmentRequest(BaseModel):
    """路径调整请求模型"""
    user_id: str = Field(..., description="用户ID")
    adjustment_type: str = Field(
        ...,
        description="调整类型",
        examples=["increase_difficulty", "decrease_difficulty", "change_subject", "add_more_nodes"]
    )
    target_difficulty: Optional[str] = Field(
        None,
        description="目标难度（当adjustment_type为diffculty相关时）",
        examples=["beginner", "intermediate", "advanced"]
    )
    target_subject: Optional[str] = Field(
        None,
        description="目标学科（当adjustment_type为change_subject时）"
    )
    additional_nodes_count: Optional[int] = Field(
        None,
        ge=1,
        le=20,
        description="额外添加的节点数（当adjustment_type为add_more_nodes时）"
    )
    
    class Config:
        json_schema_extra = {
            "example": {
                "user_id": "user_123",
                "adjustment_type": "increase_difficulty",
                "target_difficulty": "advanced"
            }
        }


class RecommendationResponse(BaseModel):
    """推荐响应模型"""
    user_id: str = Field(..., description="用户ID")
    recommended_nodes: List[PathNodeResponse] = Field(..., description="推荐的节点列表")
    recommendation_reason: str = Field(..., description="推荐理由")
    confidence_score: float = Field(..., ge=0.0, le=1.0, description="推荐置信度")
    
    class Config:
        json_schema_extra = {
            "example": {
                "user_id": "user_123",
                "recommended_nodes": [],
                "recommendation_reason": "基于您的学习进度和兴趣推荐",
                "confidence_score": 0.85
            }
        }


class ErrorResponse(BaseModel):
    """错误响应模型"""
    error_code: str = Field(..., description="错误代码")
    error_message: str = Field(..., description="错误信息")
    details: Optional[str] = Field(None, description="详细错误信息")
    timestamp: datetime = Field(default_factory=datetime.now, description="错误发生时间")
    
    class Config:
        json_schema_extra = {
            "example": {
                "error_code": "PATH_GENERATION_FAILED",
                "error_message": "路径生成失败",
                "details": "Neo4j连接超时",
                "timestamp": "2026-04-14T20:30:00"
            }
        }
