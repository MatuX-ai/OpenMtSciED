"""
OpenMTSciEd 资源管理 API
提供开源资源的浏览、搜索和详情查询功能
"""

from fastapi import APIRouter, Query, HTTPException
from typing import List, Optional
import json
import os
from pathlib import Path

router = APIRouter(
    prefix="/api/v1/resources",
    tags=["resources"],
    responses={404: {"description": "Not found"}},
)

# 简单的资源缓存，实际生产中应使用数据库
_resources_cache = {}

def _load_resources():
    """加载资源数据"""
    global _resources_cache
    if not _resources_cache:
        # 尝试从 datasets 目录加载
        data_path = Path(__file__).parent.parent.parent / "datasets" / "open_resources.json"
        if data_path.exists():
            with open(data_path, 'r', encoding='utf-8') as f:
                _resources_cache = json.load(f)
    return _resources_cache

@router.get("/")
async def browse_resources(
    source: Optional[str] = Query(None, description="资源来源 (openscied, gewustan, stemcloud)"),
    subject: Optional[str] = Query(None, description="学科"),
    level: Optional[str] = Query(None, description="学段 (elementary, middle, high)"),
    keyword: Optional[str] = Query(None, description="关键词搜索"),
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100)
):
    """
    浏览开源资源（支持分页和筛选）
    """
    all_data = _load_resources()
    items = []

    # 合并所有来源的资源
    for src_name, src_resources in all_data.get("sources", {}).items():
        if source and src_name != source:
            continue
        items.extend(src_resources)

    # 筛选逻辑
    filtered_items = []
    for item in items:
        if subject and item.get("subject") != subject:
            continue
        if level and item.get("level") != level:
            continue
        if keyword and keyword.lower() not in item.get("title", "").lower() and keyword.lower() not in item.get("description", "").lower():
            continue
        filtered_items.append(item)

    # 分页逻辑
    total = len(filtered_items)
    start = (page - 1) * page_size
    end = start + page_size
    paginated_items = filtered_items[start:end]

    return {
        "items": paginated_items,
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": (total + page_size - 1) // page_size if page_size > 0 else 0
    }

@router.get("/{resource_id}")
async def get_resource_detail(resource_id: str):
    """
    获取特定资源的详细信息
    """
    all_data = _load_resources()
    for src_resources in all_data.get("sources", {}).values():
        for item in src_resources:
            if item.get("id") == resource_id:
                return item
    raise HTTPException(status_code=404, detail=f"Resource {resource_id} not found")
