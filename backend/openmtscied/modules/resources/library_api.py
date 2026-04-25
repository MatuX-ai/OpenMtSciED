"""教程库和课件库 API 路由"""

import os
import json
from typing import Optional, List
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel

router = APIRouter()

# 数据目录
DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "..", "..", "data")
COURSE_LIBRARY_DIR = os.path.join(DATA_DIR, "course_library")
TEXTBOOK_LIBRARY_DIR = os.path.join(DATA_DIR, "textbook_library")


def load_json_files(directory: str) -> List[dict]:
    """加载目录下所有JSON文件"""
    all_data = []
    if not os.path.exists(directory):
        return all_data
    
    for filename in os.listdir(directory):
        if filename.endswith('.json'):
            filepath = os.path.join(directory, filename)
            try:
                with open(filepath, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    if isinstance(data, list):
                        # 添加来源文件名
                        for item in data:
                            item['_source_file'] = filename
                        all_data.extend(data)
                    elif isinstance(data, dict):
                        data['_source_file'] = filename
                        all_data.append(data)
            except Exception as e:
                print(f"加载文件 {filename} 失败: {e}")
    
    return all_data


@router.get("/tutorials")
def get_tutorials(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=1000),
    source: Optional[str] = None,
    subject: Optional[str] = None,
    search: Optional[str] = None
):
    """
    获取教程列表
    从 data/course_library 目录加载所有JSON文件
    """
    try:
        tutorials = load_json_files(COURSE_LIBRARY_DIR)
        
        # 筛选
        filtered = tutorials
        
        if source:
            filtered = [t for t in filtered if t.get('source') == source or t.get('_source_file', '').find(source) != -1]
        
        if subject:
            filtered = [t for t in filtered if t.get('subject') == subject]
        
        if search:
            search_lower = search.lower()
            filtered = [
                t for t in filtered 
                if search_lower in str(t.get('title', '')).lower() 
                or search_lower in str(t.get('description', '')).lower()
            ]
        
        total = len(filtered)
        paginated = filtered[skip:skip + limit]
        
        return {
            "success": True,
            "data": paginated,
            "total": total,
            "skip": skip,
            "limit": limit
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"加载教程失败: {str(e)}")


@router.get("/tutorials/stats")
def get_tutorials_stats():
    """获取教程库统计信息"""
    try:
        tutorials = load_json_files(COURSE_LIBRARY_DIR)
        
        sources = set(t.get('source', '未知') for t in tutorials if t.get('source'))
        subjects = set(t.get('subject', '未分类') for t in tutorials if t.get('subject'))
        categories = set(t.get('category', '') for t in tutorials if t.get('category'))
        
        return {
            "success": True,
            "data": {
                "totalTutorials": len(tutorials),
                "sources": len(sources),
                "subjects": len(subjects),
                "categories": len(categories),
                "sourceList": list(sources),
                "subjectList": list(subjects)
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取统计失败: {str(e)}")


@router.get("/materials")
def get_materials(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=1000),
    source: Optional[str] = None,
    subject: Optional[str] = None,
    grade_level: Optional[str] = None,
    search: Optional[str] = None
):
    """
    获取课件列表
    从 data/textbook_library 目录加载所有JSON文件
    """
    try:
        materials = load_json_files(TEXTBOOK_LIBRARY_DIR)
        
        # 筛选
        filtered = materials
        
        if source:
            filtered = [m for m in filtered if m.get('source') == source]
        
        if subject:
            filtered = [m for m in filtered if m.get('subject') == subject]
        
        if grade_level:
            filtered = [m for m in filtered if m.get('grade_level') == grade_level]
        
        if search:
            search_lower = search.lower()
            filtered = [
                m for m in filtered 
                if search_lower in str(m.get('title', '')).lower() 
                or search_lower in str(m.get('textbook', '')).lower()
            ]
        
        total = len(filtered)
        paginated = filtered[skip:skip + limit]
        
        # 统一下载链接字段名
        for item in paginated:
            if 'download_url' in item and 'pdf_download_url' not in item:
                item['pdf_download_url'] = item['download_url']
        
        return {
            "success": True,
            "data": paginated,
            "total": total,
            "skip": skip,
            "limit": limit
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"加载课件失败: {str(e)}")


@router.get("/materials/stats")
def get_materials_stats():
    """获取课件库统计信息"""
    try:
        materials = load_json_files(TEXTBOOK_LIBRARY_DIR)
        
        textbooks = set(m.get('textbook', '未知') for m in materials if m.get('textbook'))
        sources = set(m.get('source', '未知') for m in materials if m.get('source'))
        subjects = set(m.get('subject', '未分类') for m in materials if m.get('subject'))
        # 统计下载链接（支持两种字段名）
        with_downloads = sum(1 for m in materials if m.get('pdf_download_url') or m.get('download_url'))
        
        return {
            "success": True,
            "data": {
                "totalMaterials": len(materials),
                "textbooks": len(textbooks),
                "sources": len(sources),
                "subjects": len(subjects),
                "withDownloads": with_downloads,
                "textbookList": list(textbooks),
                "sourceList": list(sources),
                "subjectList": list(subjects)
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取统计失败: {str(e)}")


@router.get("/libraries/summary")
def get_libraries_summary():
    """获取两库总览信息"""
    try:
        tutorials = load_json_files(COURSE_LIBRARY_DIR)
        materials = load_json_files(TEXTBOOK_LIBRARY_DIR)
        
        return {
            "success": True,
            "data": {
                "tutorials": {
                    "count": len(tutorials),
                    "directory": COURSE_LIBRARY_DIR
                },
                "materials": {
                    "count": len(materials),
                    "directory": TEXTBOOK_LIBRARY_DIR
                }
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取总览失败: {str(e)}")
