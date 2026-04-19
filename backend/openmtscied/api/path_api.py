"""
OpenMTSciEd 学习路径 API (MVP 极简版)
"""

from fastapi import APIRouter, HTTPException
from typing import List
from pydantic import BaseModel
from datetime import datetime

from ..services.path_generator import PathGenerator, LearningPathNode
from ..models.user_profile import UserProfile

router = APIRouter(prefix="/api/v1/path", tags=["learning-path"])

_path_generator = None


def get_generator() -> PathGenerator:
    global _path_generator
    if _path_generator is None:
        _path_generator = PathGenerator()
    return _path_generator


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
        user = UserProfile(
            user_id=request.user_id,
            age=request.age,
            grade_level=request.grade_level,
            knowledge_test_scores=[],
            completed_units=[]
        )
        
        generator = get_generator()
        nodes = generator.generate_path(user, max_nodes=request.max_nodes)
        
        return PathResponse(
            user_id=request.user_id,
            path_nodes=nodes,
            summary=generator.get_path_summary(nodes),
            generated_at=datetime.now().isoformat()
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/health")
async def health_check():
    return {"status": "healthy"}
