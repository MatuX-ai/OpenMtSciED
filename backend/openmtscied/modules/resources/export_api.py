"""
OpenMTSciEd 导出 API
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from modules.learning.ai_learning_service import ai_service
from datetime import datetime

router = APIRouter(prefix="/api/v1/export", tags=["export"])

def _format_markdown(title: str, content: List[Dict[str, Any]], metadata: Dict[str, Any] = None) -> str:
    md_lines = [f"# {title}\n"]
    if metadata:
        md_lines.append(f"**生成时间**: {metadata.get('generated_at', datetime.now().strftime('%Y-%m-%d %H:%M'))}")
        md_lines.append("---\n")
    for i, item in enumerate(content, 1):
        md_lines.append(f"## {i}. {item.get('title', '未命名模块')}\n")
        md_lines.append(f"{item.get('description', '')}\n")
        if 'estimated_hours' in item:
            md_lines.append(f"- **预计学时**: {item['estimated_hours']} 小时")
        md_lines.append("")
    return "\n".join(md_lines)

class ExportRequest(BaseModel):
    title: str
    content: List[Dict[str, Any]]
    metadata: Optional[Dict[str, Any]] = None

@router.post("/markdown")
async def export_markdown(request: ExportRequest):
    """导出为 Markdown"""
    try:
        md_content = _format_markdown(request.title, request.content, request.metadata)
        return {"content": md_content, "format": "markdown"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/generate-and-export")
async def generate_and_export(topic: str, grade_level: str = "High School"):
    """AI 生成大纲并直接返回 Markdown"""
    result = ai_service.generate_outline(topic, grade_level)
    if not result:
        raise HTTPException(status_code=500, detail="AI 生成失败")
    
    md_content = _format_markdown(
        f"STEM 课程大纲: {result.topic}",
        [item.dict() for item in result.outline],
        {"target_audience": result.target_audience}
    )
    return {"content": md_content, "format": "markdown"}
