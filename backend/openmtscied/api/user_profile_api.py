"""
OpenMTSciEd 用户画像 API
提供用户画像管理、学习进度跟踪、动态路径调整等功能
"""

from fastapi import APIRouter, HTTPException, Depends
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime
import logging

from ..models.user_profile import UserProfile, GradeLevel, KnowledgeTestScore, CompletedUnit
from ..services.path_generator import PathGenerator, LearningPathNode

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/user-profile", tags=["user-profile"])

# 模拟用户数据库（实际应使用数据库）
_users_db: Dict[str, UserProfile] = {}
_path_generator: Optional[PathGenerator] = None


def get_path_generator() -> PathGenerator:
    """获取路径生成器单例"""
    global _path_generator
    if _path_generator is None:
        _path_generator = PathGenerator()
    return _path_generator


# ==================== 请求/响应模型 ====================

class CreateUserRequest(BaseModel):
    user_id: str
    age: int = Field(..., ge=6, le=25)
    grade_level: GradeLevel


class UpdateProfileRequest(BaseModel):
    age: Optional[int] = Field(None, ge=6, le=25)
    grade_level: Optional[GradeLevel] = None


class SubmitTestScoreRequest(BaseModel):
    knowledge_point_id: str
    score: float = Field(..., ge=0, le=100)


class CompleteUnitRequest(BaseModel):
    unit_id: str
    duration_hours: float = Field(..., gt=0)
    performance_score: float = Field(..., ge=0, le=100)


class UserProfileResponse(BaseModel):
    user_id: str
    age: int
    grade_level: GradeLevel
    average_score: float
    completed_units_count: int
    test_scores_count: int
    recommended_starting_unit: str
    created_at: Optional[str] = None


class DynamicPathAdjustmentRequest(BaseModel):
    feedback_type: str = Field(..., description="反馈类型: too_hard/too_easy/bored/perfect")
    current_node_id: Optional[str] = None
    completion_rate: Optional[float] = Field(None, ge=0, le=1)


class DynamicPathResponse(BaseModel):
    adjusted_path: List[LearningPathNode]
    adjustment_reason: str
    difficulty_change: str  # increased/decreased/unchanged


# ==================== API端点 ====================

@router.post("/create", response_model=UserProfileResponse)
async def create_user_profile(request: CreateUserRequest):
    """创建新用户画像"""
    try:
        if request.user_id in _users_db:
            raise HTTPException(status_code=409, detail=f"用户 {request.user_id} 已存在")
        
        user = UserProfile(
            user_id=request.user_id,
            age=request.age,
            grade_level=request.grade_level,
            knowledge_test_scores=[],
            completed_units=[]
        )
        
        _users_db[request.user_id] = user
        
        logger.info(f"创建用户画像: {request.user_id}, 年龄: {request.age}, 年级: {request.grade_level}")
        
        return UserProfileResponse(
            user_id=user.user_id,
            age=user.age,
            grade_level=user.grade_level,
            average_score=user.average_score,
            completed_units_count=len(user.completed_units),
            test_scores_count=len(user.knowledge_test_scores),
            recommended_starting_unit=user.get_recommended_starting_unit(),
            created_at=datetime.now().isoformat()
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"创建用户画像失败: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{user_id}", response_model=UserProfileResponse)
async def get_user_profile(user_id: str):
    """获取用户画像"""
    if user_id not in _users_db:
        raise HTTPException(status_code=404, detail=f"用户 {user_id} 不存在")
    
    user = _users_db[user_id]
    
    return UserProfileResponse(
        user_id=user.user_id,
        age=user.age,
        grade_level=user.grade_level,
        average_score=user.average_score,
        completed_units_count=len(user.completed_units),
        test_scores_count=len(user.knowledge_test_scores),
        recommended_starting_unit=user.get_recommended_starting_unit()
    )


@router.put("/{user_id}", response_model=UserProfileResponse)
async def update_user_profile(user_id: str, request: UpdateProfileRequest):
    """更新用户画像"""
    if user_id not in _users_db:
        raise HTTPException(status_code=404, detail=f"用户 {user_id} 不存在")
    
    user = _users_db[user_id]
    
    if request.age is not None:
        user.age = request.age
    
    if request.grade_level is not None:
        user.grade_level = request.grade_level
    
    logger.info(f"更新用户画像: {user_id}")
    
    return UserProfileResponse(
        user_id=user.user_id,
        age=user.age,
        grade_level=user.grade_level,
        average_score=user.average_score,
        completed_units_count=len(user.completed_units),
        test_scores_count=len(user.knowledge_test_scores),
        recommended_starting_unit=user.get_recommended_starting_unit()
    )


@router.post("/{user_id}/test-score")
async def submit_test_score(user_id: str, request: SubmitTestScoreRequest):
    """提交知识点测试成绩"""
    if user_id not in _users_db:
        raise HTTPException(status_code=404, detail=f"用户 {user_id} 不存在")
    
    user = _users_db[user_id]
    
    score = KnowledgeTestScore(
        knowledge_point_id=request.knowledge_point_id,
        score=request.score,
        test_date=datetime.now()
    )
    
    user.knowledge_test_scores.append(score)
    
    logger.info(f"用户 {user_id} 提交测试成绩: {request.knowledge_point_id} = {request.score}")
    
    return {
        "message": "成绩提交成功",
        "new_average_score": user.average_score,
        "total_tests": len(user.knowledge_test_scores)
    }


@router.post("/{user_id}/complete-unit")
async def complete_unit(user_id: str, request: CompleteUnitRequest):
    """标记课程单元完成"""
    if user_id not in _users_db:
        raise HTTPException(status_code=404, detail=f"用户 {user_id} 不存在")
    
    user = _users_db[user_id]
    
    completed = CompletedUnit(
        unit_id=request.unit_id,
        completion_date=datetime.now(),
        duration_hours=request.duration_hours,
        performance_score=request.performance_score
    )
    
    user.completed_units.append(completed)
    
    logger.info(f"用户 {user_id} 完成单元: {request.unit_id}, 成绩: {request.performance_score}")
    
    return {
        "message": "单元完成记录成功",
        "completed_units_count": len(user.completed_units),
        "average_performance": sum(u.performance_score for u in user.completed_units) / len(user.completed_units)
    }


@router.get("/{user_id}/learning-progress")
async def get_learning_progress(user_id: str):
    """获取学习进度统计"""
    if user_id not in _users_db:
        raise HTTPException(status_code=404, detail=f"用户 {user_id} 不存在")
    
    user = _users_db[user_id]
    
    # 计算各维度统计
    total_study_hours = sum(u.duration_hours for u in user.completed_units)
    avg_performance = (
        sum(u.performance_score for u in user.completed_units) / len(user.completed_units)
        if user.completed_units else 0
    )
    
    # 知识点掌握情况
    knowledge_mastery = {}
    for score in user.knowledge_test_scores:
        knowledge_mastery[score.knowledge_point_id] = {
            "score": score.score,
            "level": "mastered" if score.score >= 80 else "learning" if score.score >= 60 else "needs_practice",
            "test_date": score.test_date.isoformat()
        }
    
    return {
        "user_id": user_id,
        "total_completed_units": len(user.completed_units),
        "total_study_hours": round(total_study_hours, 2),
        "average_performance": round(avg_performance, 2),
        "average_test_score": round(user.average_score, 2),
        "knowledge_mastery": knowledge_mastery,
        "recommended_next_unit": user.get_recommended_starting_unit()
    }


@router.post("/{user_id}/adjust-path", response_model=DynamicPathResponse)
async def adjust_learning_path(user_id: str, request: DynamicPathAdjustmentRequest):
    """基于学习反馈动态调整路径"""
    if user_id not in _users_db:
        raise HTTPException(status_code=404, detail=f"用户 {user_id} 不存在")
    
    user = _users_db[user_id]
    generator = get_path_generator()
    
    # 根据反馈类型调整难度
    if request.feedback_type == "too_hard":
        # 太难：降低难度，添加过渡内容
        adjustment_reason = "检测到学习困难，降低难度并添加过渡内容"
        difficulty_change = "decreased"
        # 临时降低年龄以获得更简单的起点
        temp_user = UserProfile(
            user_id=user.user_id,
            age=max(6, user.age - 2),
            grade_level=user.grade_level,
            knowledge_test_scores=user.knowledge_test_scores,
            completed_units=user.completed_units
        )
        nodes = generator.generate_path(temp_user, max_nodes=15)
    
    elif request.feedback_type == "too_easy":
        # 太简单：提高难度
        adjustment_reason = "检测到学习轻松，提升难度挑战"
        difficulty_change = "increased"
        # 临时提高年龄以获得更难的内容
        temp_user = UserProfile(
            user_id=user.user_id,
            age=min(25, user.age + 2),
            grade_level=user.grade_level,
            knowledge_test_scores=user.knowledge_test_scores,
            completed_units=user.completed_units
        )
        nodes = generator.generate_path(temp_user, max_nodes=15)
    
    elif request.feedback_type == "bored":
        # 无聊：保持难度但增加多样性
        adjustment_reason = "检测到学习兴趣下降，增加内容多样性"
        difficulty_change = "unchanged"
        nodes = generator.generate_path(user, max_nodes=20)
    
    else:  # perfect
        # 完美：保持当前节奏
        adjustment_reason = "学习节奏适中，保持当前路径"
        difficulty_change = "unchanged"
        nodes = generator.generate_path(user, max_nodes=15)
    
    logger.info(f"用户 {user_id} 路径调整: {request.feedback_type} -> {difficulty_change}")
    
    return DynamicPathResponse(
        adjusted_path=nodes,
        adjustment_reason=adjustment_reason,
        difficulty_change=difficulty_change
    )


@router.get("/{user_id}/generate-path")
async def generate_path_for_user(user_id: str, max_nodes: int = 20):
    """为用户生成学习路径"""
    if user_id not in _users_db:
        raise HTTPException(status_code=404, detail=f"用户 {user_id} 不存在")
    
    user = _users_db[user_id]
    generator = get_path_generator()
    
    nodes = generator.generate_path(user, max_nodes=max_nodes)
    summary = generator.get_path_summary(nodes)
    
    return {
        "user_id": user_id,
        "starting_unit": user.get_recommended_starting_unit(),
        "path_nodes": [node.dict() for node in nodes],
        "summary": summary,
        "generated_at": datetime.now().isoformat()
    }


@router.delete("/{user_id}")
async def delete_user_profile(user_id: str):
    """删除用户画像"""
    if user_id not in _users_db:
        raise HTTPException(status_code=404, detail=f"用户 {user_id} 不存在")
    
    del _users_db[user_id]
    logger.info(f"删除用户画像: {user_id}")
    
    return {"message": f"用户 {user_id} 已删除"}
