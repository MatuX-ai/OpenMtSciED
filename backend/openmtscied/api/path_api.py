"""
OpenMTSciEd 学习路径API接口
提供路径生成、查询和反馈的RESTful API
"""

from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any
from pydantic import BaseModel

from ..services.path_generator import PathGenerator, LearningPathNode
from ..models.user_profile import UserProfile, create_sample_user

router = APIRouter(
    prefix="/api/v1/path",
    tags=["learning-path"],
    responses={404: {"description": "Not found"}},
)

# 全局路径生成器实例(懒加载)
_path_generator = None


def get_path_generator() -> PathGenerator:
    """获取路径生成器单例"""
    global _path_generator
    if _path_generator is None:
        _path_generator = PathGenerator()
    return _path_generator


class PathRequest(BaseModel):
    """路径生成请求"""
    user_id: str
    age: int
    grade_level: str
    max_nodes: int = 20


class PathResponse(BaseModel):
    """路径生成响应"""
    user_id: str
    path_nodes: List[LearningPathNode]
    summary: Dict[str, Any]
    generated_at: str


@router.post("/generate", response_model=PathResponse)
async def generate_learning_path(request: PathRequest):
    """
    生成个性化学习路径

    - **user_id**: 用户ID
    - **age**: 年龄
    - **grade_level**: 学段(小学/初中/高中/大学)
    - **max_nodes**: 最大路径节点数(默认20)

    返回包含课程单元、教材章节、过渡项目和硬件项目的完整学习路径
    """

    try:
        # 创建用户画像(简化版,实际应从数据库查询)
        user = UserProfile(
            user_id=request.user_id,
            age=request.age,
            grade_level=request.grade_level,
            knowledge_test_scores=[],  # TODO: 从数据库加载
            completed_units=[],  # TODO: 从数据库加载
        )

        # 生成路径
        generator = get_path_generator()
        path_nodes = generator.generate_path(user, max_nodes=request.max_nodes)

        # 生成摘要
        summary = generator.get_path_summary(path_nodes)

        from datetime import datetime
        return PathResponse(
            user_id=request.user_id,
            path_nodes=path_nodes,
            summary=summary,
            generated_at=datetime.now().isoformat(),
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"路径生成失败: {str(e)}")


@router.get("/{user_id}/progress")
async def get_learning_progress(user_id: str):
    """
    查询用户学习进度

    - **user_id**: 用户ID

    返回已完成节点、当前节点和待解锁节点
    """

    # TODO: 从数据库查询用户进度
    return {
        "user_id": user_id,
        "completed_nodes": [],
        "current_node": None,
        "locked_nodes": [],
        "overall_progress": 0.0,
    }


@router.post("/{user_id}/feedback")
async def submit_learning_feedback(user_id: str, feedback: Dict[str, Any]):
    """
    提交学习反馈(用于强化学习调整)

    - **user_id**: 用户ID
    - **feedback**: 反馈数据,包含:
        - node_id: 节点ID
        - completion_status: 完成状态(completed/in_progress/abandoned)
        - difficulty_rating: 难度评分(1-5)
        - engagement_time: 实际学习时长(分钟)
        - performance_score: 表现评分(0-100)
    """

    # TODO: 存储反馈数据到数据库
    # TODO: 触发PPO模型重新训练

    return {
        "status": "success",
        "message": "反馈已接收,将用于优化后续路径推荐",
        "user_id": user_id,
    }


@router.get("/sample/{user_id}")
async def get_sample_path(user_id: str):
    """
    获取示例路径(用于测试)

    使用预设的测试用户数据生成路径
    """

    try:
        # 创建示例用户
        user = create_sample_user()
        user.user_id = user_id

        # 生成路径
        generator = get_path_generator()
        path_nodes = generator.generate_path(user, max_nodes=10)
        summary = generator.get_path_summary(path_nodes)

        from datetime import datetime
        return PathResponse(
            user_id=user_id,
            path_nodes=path_nodes,
            summary=summary,
            generated_at=datetime.now().isoformat(),
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"示例路径生成失败: {str(e)}")


# 健康检查
@router.get("/health")
async def health_check():
    """API健康检查"""
    return {
        "status": "healthy",
        "service": "openmtscied-path-generator",
        "neo4j_connected": _path_generator is not None,
    }
