"""
OpenMTSciEd 学习路径 API (MVP 极简版)
"""

from fastapi import APIRouter, HTTPException
from typing import List
from pydantic import BaseModel
from datetime import datetime

from modules.learning.path_generator import PathEngine, LearningPathNode

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
