import json
import os
import asyncio
from datetime import datetime
from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel
from typing import List, Optional
import requests
from bs4 import BeautifulSoup

from apscheduler.schedulers.background import BackgroundScheduler
import threading

from modules.resources.services.crawler_service import get_available_crawlers, get_crawler_handler, get_course_stats, get_courses
from shared.models.db_models import SessionLocal, UserResource, UserProfile

router = APIRouter()

DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "..", "..", "data")
CRAWLER_CONFIG_FILE = os.path.join(DATA_DIR, "crawler_configs.json")
COURSE_OUTPUT_FILE = os.path.join(DATA_DIR, "course_library", "custom_crawled_courses.json")
TEXTBOOK_OUTPUT_FILE = os.path.join(DATA_DIR, "textbook_library", "custom_crawled_textbooks.json")

# 初始化调度器
scheduler = BackgroundScheduler()
scheduler.start()

class CrawlerConfig(BaseModel):
    id: str
    name: str
    description: str
    target_url: str
    type: str  # 'course' or 'textbook'
    status: str = 'idle'  # idle, running, completed, failed
    progress: int = 0
    total_items: int = 0
    scraped_items: int = 0
    last_run: Optional[str] = None
    error_message: Optional[str] = None

def load_configs():
    if not os.path.exists(CRAWLER_CONFIG_FILE):
        return []
    with open(CRAWLER_CONFIG_FILE, 'r', encoding='utf-8') as f:
        return json.load(f)

def save_configs(configs):
    with open(CRAWLER_CONFIG_FILE, 'w', encoding='utf-8') as f:
        json.dump(configs, f, ensure_ascii=False, indent=2)

@router.get("/crawlers")
def get_crawlers():
    """获取所有爬虫任务配置"""
    try:
        configs = load_configs()
        return {"success": True, "data": configs}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/crawlers/templates")
def get_crawler_templates():
    """获取所有可用的爬虫模板"""
    try:
        templates = get_available_crawlers()
        return {"success": True, "data": templates}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/crawlers")
def add_crawler(crawler: CrawlerConfig):
    try:
        configs = load_configs()
        if any(c['id'] == crawler.id for c in configs):
            raise HTTPException(status_code=400, detail="ID already exists")
        configs.append(crawler.dict())
        save_configs(configs)
        return {"success": True, "message": "Crawler added successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/crawlers/{crawler_id}")
def delete_crawler(crawler_id: str):
    try:
        configs = load_configs()
        new_configs = [c for c in configs if c['id'] != crawler_id]
        if len(new_configs) == len(configs):
            raise HTTPException(status_code=404, detail="Crawler not found")
        save_configs(new_configs)
        return {"success": True, "message": "Crawler deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def save_json_file(filepath, data):
    if not os.path.exists(os.path.dirname(filepath)):
        os.makedirs(os.path.dirname(filepath))
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

def load_json_file(filepath):
    if not os.path.exists(filepath):
        return []
    with open(filepath, 'r', encoding='utf-8') as f:
        return json.load(f)

async def execute_crawl(crawler: dict):
    """执行爬虫任务（使用注册的爬虫处理函数）"""
    crawler_id = crawler['id']
    configs = load_configs()
    
    try:
        # 更新状态为运行中
        for c in configs:
            if c['id'] == crawler_id:
                c['status'] = 'running'
                c['progress'] = 10
                save_configs(configs)
                break
        
        # 获取注册的爬虫处理函数
        handler = get_crawler_handler(crawler_id)
        
        # 执行爬虫
        result = await handler(crawler) if asyncio.iscoroutinefunction(handler) else handler(crawler)
        
        # 更新状态
        for c in configs:
            if c['id'] == crawler_id:
                if result.get('success'):
                    c['status'] = 'completed'
                    c['progress'] = 100
                    c['total_items'] = result.get('total_items', 0)
                    c['scraped_items'] = result.get('scraped_items', 0)
                else:
                    c['status'] = 'failed'
                    c['error_message'] = result.get('error', 'Unknown error')
                c['last_run'] = datetime.now().isoformat()
                save_configs(configs)
                break
                
    except Exception as e:
        # 更新失败状态
        for c in configs:
            if c['id'] == crawler_id:
                c['status'] = 'failed'
                c['error_message'] = str(e)
                save_configs(configs)
                break

@router.post("/crawlers/{crawler_id}/run")
async def run_crawler(crawler_id: str, background_tasks: BackgroundTasks):
    configs = load_configs()
    target_crawler = None
    for c in configs:
        if c['id'] == crawler_id:
            target_crawler = c
            break
    
    if not target_crawler:
        raise HTTPException(status_code=404, detail="Crawler not found")
    
    background_tasks.add_task(execute_crawl, target_crawler)
    return {"success": True, "message": f"Crawler {crawler_id} started in background"}

@router.get("/courses/stats")
def get_courses_stats():
    """获取课程库真实统计数据 (从数据库)"""
    try:
        return get_course_stats()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/courses")
def list_courses(
    skip: int = 0,
    limit: int = 50,
    level: str = None,
    subject: str = None,
    search: str = None
):
    """获取课程列表（支持分页和筛选）"""
    try:
        return get_courses(skip=skip, limit=limit, level=level, subject=subject, search=search)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/smart-search")
def smart_search_stem(keyword: str, limit: int = 10):
    """智能STEM搜索：先搜本地，不足时触发全网搜索"""
    try:
        # 1. 搜索本地数据库
        local_results = get_courses(search=keyword, limit=limit)
        
        if len(local_results) >= limit:
            return {"success": True, "source": "local", "data": local_results}

        # 2. 如果本地不足，触发混合搜索 (这里简化为调用外部API或爬虫)
        # TODO: 集成 Bing Custom Search API 或 AI 总结服务
        web_results = []
        # 模拟外部搜索结果
        if keyword:
            web_results.append({
                "id": f"web_{hash(keyword)}",
                "title": f"[Web Result] {keyword} STEM Project",
                "source": "internet",
                "description": "Found via intelligent STEM search engine.",
                "url": f"https://example.com/stem/{keyword.replace(' ', '-')}"
            })
        
        combined = local_results + web_results
        return {"success": True, "source": "hybrid", "data": combined[:limit]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/share")
def share_resource(data: dict):
    """分享本地课程到云库"""
    db = SessionLocal()
    try:
        new_resource = UserResource(
            title=data.get("title"),
            description=data.get("description"),
            content_json=data.get("content"),
            contributor_id=data.get("contributor_id", "anonymous")
        )
        db.add(new_resource)
        db.commit()
        return {"success": True, "message": "资源分享成功"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()

@router.get("/leaderboard")
def get_leaderboard(limit: int = 10):
    """获取贡献者排行榜"""
    db = SessionLocal()
    try:
        # 统计每个贡献者的总下载量
        from sqlalchemy import func
        results = db.query(
            UserResource.contributor_id,
            func.sum(UserResource.download_count).label('total_downloads')
        ).group_by(UserResource.contributor_id).order_by(func.sum(UserResource.download_count).desc()).limit(limit).all()
        
        leaderboard = [{"user_id": r[0], "points": r[1]} for r in results]
        return {"success": True, "data": leaderboard}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()

@router.get("/education-platforms/status")
def get_platform_status():
    """获取教育平台状态概览"""
    try:
        configs = load_configs()
        platforms = []
        for c in configs:
            # 检查数据文件是否存在
            output_file = c.get('output_file', '')
            if output_file:
                # 如果是相对路径，转换为绝对路径
                if not os.path.isabs(output_file):
                    output_file = os.path.join(DATA_DIR, os.path.basename(output_file))
                    # 更精确地处理路径
                    if 'course_library' in c.get('output_file', ''):
                        output_file = os.path.join(DATA_DIR, 'course_library', os.path.basename(c.get('output_file', '')))
                    elif 'textbook_library' in c.get('output_file', ''):
                        output_file = os.path.join(DATA_DIR, 'textbook_library', os.path.basename(c.get('output_file', '')))
                
                file_exists = os.path.exists(output_file)
                file_size = os.path.getsize(output_file) if file_exists else None
            else:
                file_exists = False
                file_size = None
            
            platforms.append({
                "platform_name": c.get('name', 'Unknown'),
                "registered": True,
                "schedule": {
                    "interval": c.get('schedule_interval', 'manual'),
                    "day": "every",
                    "time": "00:00"
                },
                "data_file_exists": file_exists,
                "last_updated": c.get('last_run'),
                "file_size": file_size
            })
        return {"success": True, "data": platforms}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/crawlers/{crawler_id}/schedule")
def set_schedule(crawler_id: str, interval_hours: int):
    """设置周期性抓取"""
    configs = load_configs()
    target_crawler = None
    for c in configs:
        if c['id'] == crawler_id:
            target_crawler = c
            c['schedule_interval'] = interval_hours
            break
    
    if not target_crawler:
        raise HTTPException(status_code=404, detail="Crawler not found")
    
    save_configs(configs)
    
    # 更新调度器
    scheduler.add_job(
        func=execute_crawl,
        trigger="interval",
        hours=interval_hours,
        id=crawler_id,
        args=[target_crawler],
        replace_existing=True
    )
    
    return {"success": True, "message": f"Schedule set to every {interval_hours} hours"}

def init_scheduled_tasks():
    """服务启动时恢复定时任务"""
    configs = load_configs()
    for c in configs:
        if c.get('schedule_interval'):
            try:
                scheduler.add_job(
                    func=execute_crawl,
                    trigger="interval",
                    hours=c['schedule_interval'],
                    id=c['id'],
                    args=[c],
                    replace_existing=True
                )
                print(f"[Scheduler] Restored task for {c['name']} (every {c['schedule_interval']}h)")
            except Exception as e:
                print(f"[Scheduler] Failed to restore task {c['id']}: {e}")

# 在模块加载时自动执行一次初始化（注意：在生产环境建议使用 lifespan）
import threading
threading.Timer(2.0, init_scheduled_tasks).start()
