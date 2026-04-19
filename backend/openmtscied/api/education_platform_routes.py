"""
教育平台数据生成器API路由
提供平台管理、手动触发生成、查看状态等功能
"""

from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel
from typing import Dict, List, Optional
import sys
from pathlib import Path

# 添加项目根目录到Python路径
project_root = Path(__file__).parent.parent.parent.parent
sys.path.insert(0, str(project_root))

from scripts.scrapers.education_platform_generator import platform_manager

router = APIRouter(prefix="/api/v1/education-platforms", tags=["教育平台管理"])


class PlatformStatusResponse(BaseModel):
    """平台状态响应模型"""
    platform_name: str
    registered: bool
    schedule: Dict[str, str]
    data_file_exists: bool
    last_updated: Optional[str] = None
    file_size: Optional[int] = None


class GenerateRequest(BaseModel):
    """生成请求模型"""
    platform_name: Optional[str] = None  # 如果为None则生成所有平台


class ScheduleConfig(BaseModel):
    """调度配置模型"""
    interval: str
    day: str
    time: str


@router.get("/status", response_model=Dict[str, PlatformStatusResponse])
async def get_platforms_status():
    """获取所有教育平台的状态信息"""
    try:
        status = platform_manager.get_platform_status()
        return status
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取平台状态失败: {str(e)}")


@router.get("/platforms")
async def list_platforms():
    """列出所有已注册的教育平台"""
    platforms = []
    for name, generator in platform_manager.generators.items():
        platforms.append({
            "name": name,
            "schedule_config": platform_manager.schedules[name]
        })
    return {"platforms": platforms}


@router.post("/generate")
async def trigger_generation(background_tasks: BackgroundTasks, request: GenerateRequest = None):
    """触发生成任务"""
    try:
        if request and request.platform_name:
            # 生成特定平台
            background_tasks.add_task(
                platform_manager.run_specific_generator, 
                request.platform_name
            )
            return {
                "message": f"已开始生成 {request.platform_name} 平台数据",
                "platform": request.platform_name,
                "status": "started"
            }
        else:
            # 生成所有平台
            background_tasks.add_task(platform_manager.run_all_generators)
            return {
                "message": "已开始生成所有平台数据",
                "status": "started"
            }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"触发生成任务失败: {str(e)}")


@router.post("/schedule/start")
async def start_scheduled_tasks():
    """启动定时任务调度"""
    try:
        platform_manager.start_scheduled_tasks()
        return {
            "message": "定时任务调度已启动",
            "status": "started"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"启动定时任务失败: {str(e)}")


@router.post("/schedule/stop")
async def stop_scheduled_tasks():
    """停止定时任务调度"""
    try:
        platform_manager.stop_scheduled_tasks()
        return {
            "message": "定时任务调度已停止",
            "status": "stopped"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"停止定时任务失败: {str(e)}")


@router.get("/schedule/status")
async def get_schedule_status():
    """获取定时任务状态"""
    # 这里可以扩展以返回更详细的调度状态
    return {
        "scheduled_tasks_active": True,  # 简化实现
        "platforms_scheduled": len(platform_manager.schedules),
        "next_runs": {}  # 可以扩展以显示下次运行时间
    }


@router.post("/register-platform")
async def register_new_platform(platform_data: Dict):
    """注册新的教育平台生成器"""
    # 这个端点可以用于动态注册新的平台生成器
    # 实际实现需要根据平台类型创建相应的生成器实例
    return {
        "message": "平台注册功能待实现",
        "platform_data": platform_data
    }