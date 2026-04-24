import json
import os
from typing import List, Dict, Any, Optional
from sqlalchemy import func

from shared.models.db_models import SessionLocal, Course
from shared.crawlers import get_available_crawlers as _get_available_crawlers, get_crawler_handler as _get_crawler_handler

def get_available_crawlers():
    return _get_available_crawlers()

def get_crawler_handler(crawler_id: str):
    return _get_crawler_handler(crawler_id)

def get_course_stats():
    """获取课程库真实统计数据 (从数据库)"""
    db = SessionLocal()
    
    total = db.query(Course).count()
    
    # 按level统计
    level_counts = db.query(Course.level, func.count(Course.id)).group_by(Course.level).all()
    level_dict = {level: count for level, count in level_counts}
    
    # 如果elementary和middle为0，从title中智能推断
    if level_dict.get('elementary', 0) == 0 and level_dict.get('middle', 0) == 0:
        all_courses = db.query(Course).all()
        elementary = 0
        middle = 0
        high = 0
        university = 0
        
        for course in all_courses:
            title = (course.title or '').lower()
            description = (course.description or '').lower()
            text = title + ' ' + description
            
            # 从标题/描述中提取学段信息（优先匹配）
            if any(kw in text for kw in ['小学', 'elementary', 'grade 1', 'grade 2', 'grade 3', 'grade 4', 'grade 5', 'grade 6']):
                elementary += 1
            elif any(kw in text for kw in ['初中', 'middle school', 'grade 7', 'grade 8', 'grade 9']):
                middle += 1
            elif any(kw in text for kw in ['高中', 'high school', 'grade 10', 'grade 11', 'grade 12']):
                high += 1
            elif any(kw in text for kw in ['大学', 'university', 'college', '本科']):
                university += 1
            else:
                # 默认归为high
                high += 1
        
        db.close()
        
        return {
            "success": True, 
            "data": {
                "total": total,
                "elementary": elementary,
                "middle": middle,
                "high": high,
                "university": university
            }
        }
    
    db.close()
    
    return {
        "success": True, 
        "data": {
            "total": total,
            "elementary": level_dict.get('elementary', 0),
            "middle": level_dict.get('middle', 0),
            "high": level_dict.get('high', 0),
            "university": level_dict.get('university', 0)
        }
    }

def get_courses(skip: int = 0, limit: int = 50, level: str = None, subject: str = None, search: str = None):
    """获取课程列表（支持分页和筛选）"""
    db = SessionLocal()
    
    # 基础查询
    query = db.query(Course)
    
    # 筛选条件
    if level:
        query = query.filter(Course.level == level)
    if subject:
        query = query.filter(Course.subject == subject)
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            (Course.title.ilike(search_term)) | 
            (Course.description.ilike(search_term))
        )
    
    # 总数
    total = query.count()
    
    # 分页
    courses = query.order_by(Course.id.desc()).offset(skip).limit(limit).all()
    
    # 转换为字典
    courses_data = []
    for course in courses:
        courses_data.append({
            "id": course.id,
            "title": course.title,
            "source": course.source,
            "level": course.level,
            "subject": course.subject,
            "description": course.description,
            "url": course.url,
            "metadata": course.metadata_json
        })
    
    db.close()
    
    return {
        "success": True,
        "data": courses_data,
        "total": total,
        "skip": skip,
        "limit": limit
    }
