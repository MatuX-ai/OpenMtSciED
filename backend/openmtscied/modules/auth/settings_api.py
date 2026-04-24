"""系统设置 API 路由"""

import os
import json
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional

router = APIRouter()

# 设置文件路径
SETTINGS_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "..", "..", "data")
SETTINGS_FILE = os.path.join(SETTINGS_DIR, "system_settings.json")

class AIServiceSettings(BaseModel):
    enabled: bool = False
    provider: str = "openai"
    api_key: Optional[str] = ""

class DatabaseSettings(BaseModel):
    host: str = "localhost"
    port: int = 5432
    name: str = "openmtscied"

class StorageSettings(BaseModel):
    type: str = "local"
    path: str = "/data/storage"

class SystemSettings(BaseModel):
    ai_service: Optional[AIServiceSettings] = None
    database: Optional[DatabaseSettings] = None
    storage: Optional[StorageSettings] = None

def load_settings() -> dict:
    """加载系统设置"""
    if os.path.exists(SETTINGS_FILE):
        try:
            with open(SETTINGS_FILE, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception as e:
            print(f"加载设置文件失败: {e}")
    
    # 返回默认设置
    return {
        "ai_service": {
            "enabled": False,
            "provider": "openai",
            "api_key": ""
        },
        "database": {
            "host": "localhost",
            "port": 5432,
            "name": "openmtscied"
        },
        "storage": {
            "type": "local",
            "path": "/data/storage"
        }
    }

def save_settings(settings: dict) -> None:
    """保存系统设置"""
    try:
        os.makedirs(SETTINGS_DIR, exist_ok=True)
        with open(SETTINGS_FILE, 'w', encoding='utf-8') as f:
            json.dump(settings, f, ensure_ascii=False, indent=2)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"保存设置失败: {str(e)}")

@router.get("/")
async def get_settings():
    """获取系统设置"""
    try:
        settings = load_settings()
        return {"success": True, "data": settings}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/")
async def update_settings(settings: SystemSettings):
    """更新系统设置"""
    try:
        # 转换为字典
        settings_dict = settings.model_dump(exclude_none=True)
        
        # 合并现有设置
        current_settings = load_settings()
        current_settings.update(settings_dict)
        
        # 保存
        save_settings(current_settings)
        
        return {"success": True, "message": "设置已保存", "data": current_settings}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
