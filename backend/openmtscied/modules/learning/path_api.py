"""
OpenMTSciEd 学习路径 API (MVP 极简版)
"""

from fastapi import APIRouter, HTTPException
from typing import List
from pydantic import BaseModel
from datetime import datetime

from modules.learning.path_generator import PathEngine, LearningPathNode
from shared.models.db_models import SessionLocal, UserAnswer, Question

router = APIRouter(prefix="/api/v1/path", tags=["learning-path"])

_path_engine = None


def get_engine() -> PathEngine:
    global _path_engine
    if _path_engine is None:
        _path_engine = PathEngine()
    return _path_engine


class PathRequest(BaseModel):
    user_id: str
    age: int
    grade_level: str
    max_nodes: int = 20


class PathResponse(BaseModel):
    user_id: str
    path_nodes: List[LearningPathNode]
    summary: dict
    generated_at: str


@router.post("/generate", response_model=PathResponse)
async def generate_learning_path(request: PathRequest):
    try:
        engine = get_engine()
        nodes = engine.generate(strategy="tag_based", subject=request.grade_level, grade_level=request.grade_level, max_nodes=request.max_nodes)
        
        return PathResponse(
            user_id=request.user_id,
            path_nodes=nodes,
            summary=engine.generator.get_path_summary(nodes),
            generated_at=datetime.now().isoformat()
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/health")
async def health_check():
    return {"status": "healthy"}

@router.get("/dynamic-adjust/{user_id}")
def get_dynamic_path_adjustment(user_id: str):
    """根据用户答题表现动态调整学习路径建议"""
    db = SessionLocal()
    try:
        # 1. 获取薄弱知识点
        weak_points = set()
        wrong_answers = db.query(UserAnswer).filter(
            UserAnswer.user_id == user_id,
            UserAnswer.is_correct == 0
        ).order_by(UserAnswer.answered_at.desc()).limit(20).all()
        
        for ans in wrong_answers:
            q = db.query(Question).filter(Question.id == ans.question_id).first()
            if q and q.knowledge_points:
                weak_points.update(q.knowledge_points)
        
        # 2. 调用路径引擎获取针对这些知识点的推荐课程
        engine = get_engine()
        suggested_nodes = []
        for point in list(weak_points)[:3]:
            nodes = engine.generate(strategy="tag_based", subject=point, max_nodes=2)
            suggested_nodes.extend(nodes)
            
        return {
            "success": True,
            "weak_points": list(weak_points),
            "suggested_next_steps": suggested_nodes
        }
    finally:
        db.close()
