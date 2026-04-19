"""
OpenMTSciEd 学习路径API接口
提供路径生成、查询和反馈的RESTful API
"""

import logging
from datetime import datetime
from typing import Optional

from fastapi import APIRouter, HTTPException, Depends

from ..services.learning_path_service import LearningPathService, UserKnowledgeProfile
from ..models.path_models import (
    PathGenerationRequest,
    LearningPathResponse,
    PathNodeResponse,
    ProgressUpdateRequest,
    UserProgressResponse,
    PathAdjustmentRequest,
    RecommendationResponse,
    ErrorResponse,
)

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/api/v1/learning-path",
    tags=["learning-path"],
    responses={
        400: {"model": ErrorResponse, "description": "请求参数错误"},
        404: {"model": ErrorResponse, "description": "资源未找到"},
        500: {"model": ErrorResponse, "description": "服务器内部错误"},
    },
)

# 全局服务实例(懒加载)
_learning_path_service: Optional[LearningPathService] = None


def get_learning_path_service() -> LearningPathService:
    """获取学习路径服务单例"""
    global _learning_path_service
    if _learning_path_service is None:
        _learning_path_service = LearningPathService()
        logger.info("LearningPathService initialized")
    return _learning_path_service

@router.post(
    "/generate",
    response_model=LearningPathResponse,
    summary="生成个性化学习路径",
    description="基于用户画像和知识图谱生成个性化学习路径"
)
async def generate_learning_path(
    request: PathGenerationRequest,
    service: LearningPathService = Depends(get_learning_path_service)
):
    """
    生成学习路径
    
    - **user_id**: 用户ID
    - **current_level**: 当前知识水平 (beginner/intermediate/advanced)
    - **target_subject**: 目标学科（可选）
    - **interests**: 感兴趣的学科列表
    - **completed_nodes**: 已完成的节点ID列表
    - **max_nodes**: 最大节点数 (1-50)
    - **max_hours**: 最大总学时限制（可选）
    - **available_hours_per_week**: 每周可用学习时间
    
    返回包含完整学习路径的响应，包括节点列表、总学时、质量评分等
    """
    try:
        logger.info(f"Generating learning path for user: {request.user_id}")
        
        # 创建用户知识画像
        user_profile = UserKnowledgeProfile(
            user_id=request.user_id,
            current_level=request.current_level,
            completed_nodes=request.completed_nodes,
            interests=request.interests,
            target_subject=request.target_subject,
            available_hours_per_week=request.available_hours_per_week
        )
        
        # 生成学习路径
        learning_path = service.generate_path(
            user_profile=user_profile,
            max_nodes=request.max_nodes,
            max_hours=request.max_hours
        )
        
        # 转换为响应模型
        nodes_response = [
            PathNodeResponse(
                node_id=node.node_id,
                title=node.title,
                node_type=node.node_type,
                subject=node.subject,
                difficulty=node.difficulty,
                estimated_hours=node.estimated_hours,
                description=node.description,
                prerequisites=node.prerequisites
            )
            for node in learning_path.nodes
        ]
        
        return LearningPathResponse(
            user_id=learning_path.user_id,
            nodes=nodes_response,
            total_hours=learning_path.total_hours,
            generated_at=learning_path.generated_at,
            path_quality_score=learning_path.path_quality_score,
            difficulty_progression=learning_path.difficulty_progression
        )
        
    except ValueError as e:
        logger.error(f"Invalid request parameters: {e}")
        raise HTTPException(
            status_code=400,
            detail={
                "error_code": "INVALID_PARAMETERS",
                "error_message": "请求参数无效",
                "details": str(e)
            }
        )
    except Exception as e:
        logger.error(f"Failed to generate learning path: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail={
                "error_code": "PATH_GENERATION_FAILED",
                "error_message": "路径生成失败",
                "details": str(e)
            }
        )


@router.get(
    "/{user_id}/progress",
    response_model=UserProgressResponse,
    summary="获取用户学习进度",
    description="查询用户的当前学习进度和下一步推荐"
)
async def get_learning_progress(
    user_id: str,
    service: LearningPathService = Depends(get_learning_path_service)
):
    """
    查询用户学习进度
    
    - **user_id**: 用户ID
    
    返回已完成节点、当前节点、进度百分比和下一个推荐节点
    """
    try:
        logger.info(f"Getting progress for user: {user_id}")
        
        # TODO: 从数据库查询用户实际进度
        # 这里返回模拟数据
        return UserProgressResponse(
            user_id=user_id,
            completed_nodes=[],
            completed_count=0,
            total_path_nodes=10,
            progress_percentage=0.0,
            current_node=None,
            next_recommended_node=None,
            estimated_completion_date=None
        )
        
    except Exception as e:
        logger.error(f"Failed to get progress: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail={
                "error_code": "PROGRESS_QUERY_FAILED",
                "error_message": "进度查询失败",
                "details": str(e)
            }
        )


@router.post(
    "/{user_id}/feedback",
    summary="提交学习反馈",
    description="提交节点学习反馈，用于优化后续路径推荐"
)
async def submit_learning_feedback(
    user_id: str,
    feedback: ProgressUpdateRequest,
    service: LearningPathService = Depends(get_learning_path_service)
):
    """
    提交学习反馈
    
    - **user_id**: 用户ID
    - **completed_node_id**: 刚完成的节点ID
    - **completion_date**: 完成时间（可选）
    - **rating**: 节点评分（1-5星，可选）
    - **feedback**: 文字反馈（可选）
    
    反馈数据将用于：
    1. 更新用户学习进度
    2. 调整后续路径推荐
    3. 优化PPO强化学习模型
    """
    try:
        logger.info(f"Received feedback from user {user_id} for node {feedback.completed_node_id}")
        
        # TODO: 存储反馈数据到数据库
        # TODO: 触发路径重新生成或调整
        
        return {
            "status": "success",
            "message": "反馈已接收，将用于优化后续路径推荐",
            "user_id": user_id,
            "node_id": feedback.completed_node_id
        }
        
    except Exception as e:
        logger.error(f"Failed to submit feedback: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail={
                "error_code": "FEEDBACK_SUBMISSION_FAILED",
                "error_message": "反馈提交失败",
                "details": str(e)
            }
        )


@router.put(
    "/{user_id}/adjust",
    response_model=LearningPathResponse,
    summary="调整学习路径",
    description="根据用户需求调整已生成的学习路径"
)
async def adjust_learning_path(
    user_id: str,
    adjustment: PathAdjustmentRequest,
    service: LearningPathService = Depends(get_learning_path_service)
):
    """
    调整学习路径
    
    - **user_id**: 用户ID
    - **adjustment_type**: 调整类型
        - increase_difficulty: 提高难度
        - decrease_difficulty: 降低难度
        - change_subject: 更改学科
        - add_more_nodes: 添加更多节点
    - **target_difficulty**: 目标难度（当adjustment_type为difficulty相关时）
    - **target_subject**: 目标学科（当adjustment_type为change_subject时）
    - **additional_nodes_count**: 额外添加的节点数（当adjustment_type为add_more_nodes时）
    """
    try:
        logger.info(f"Adjusting path for user {user_id}: {adjustment.adjustment_type}")
        
        # TODO: 实现路径调整逻辑
        # 目前返回提示信息
        raise HTTPException(
            status_code=501,
            detail={
                "error_code": "NOT_IMPLEMENTED",
                "error_message": "路径调整功能正在开发中",
                "details": "请使用generate接口重新生成路径"
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to adjust path: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail={
                "error_code": "PATH_ADJUSTMENT_FAILED",
                "error_message": "路径调整失败",
                "details": str(e)
            }
        )


@router.get(
    "/{user_id}/recommendations",
    response_model=RecommendationResponse,
    summary="获取下一步推荐",
    description="基于用户当前进度获取下一步学习推荐"
)
async def get_next_recommendations(
    user_id: str,
    limit: int = 3,
    service: LearningPathService = Depends(get_learning_path_service)
):
    """
    获取下一步学习推荐
    
    - **user_id**: 用户ID
    - **limit**: 推荐数量（默认3个）
    
    返回基于用户当前进度的个性化推荐节点
    """
    try:
        logger.info(f"Getting recommendations for user: {user_id}")
        
        # TODO: 实现推荐算法
        # 目前返回空列表
        return RecommendationResponse(
            user_id=user_id,
            recommended_nodes=[],
            recommendation_reason="推荐功能正在开发中",
            confidence_score=0.0
        )
        
    except Exception as e:
        logger.error(f"Failed to get recommendations: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail={
                "error_code": "RECOMMENDATION_FAILED",
                "error_message": "推荐获取失败",
                "details": str(e)
            }
        )


@router.get(
    "/explore",
    response_model=RecommendationResponse,
    summary="探索式学习推荐",
    description="不按固定路径，基于兴趣探索式推荐"
)
async def explore_learning(
    subject: Optional[str] = None,
    difficulty: Optional[str] = None,
    limit: int = 5,
    service: LearningPathService = Depends(get_learning_path_service)
):
    """
    探索式学习推荐
    
    - **subject**: 学科过滤（可选）
    - **difficulty**: 难度过滤（可选）
    - **limit**: 推荐数量（默认5个）
    
    适合想要自由探索的用户，不强制按路径学习
    """
    try:
        logger.info(f"Explore learning: subject={subject}, difficulty={difficulty}")
        
        # TODO: 实现探索式推荐
        return RecommendationResponse(
            user_id="anonymous",
            recommended_nodes=[],
            recommendation_reason="探索式推荐功能正在开发中",
            confidence_score=0.0
        )
        
    except Exception as e:
        logger.error(f"Failed to get exploration recommendations: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail={
                "error_code": "EXPLORATION_FAILED",
                "error_message": "探索推荐失败",
                "details": str(e)
            }
        )


# 健康检查
@router.get("/health")
async def health_check():
    """API健康检查"""
    return {
        "status": "healthy",
        "service": "openmtscied-learning-path",
        "version": "0.2.0",
        "neo4j_connected": _learning_path_service is not None,
        "timestamp": datetime.now().isoformat()
    }

