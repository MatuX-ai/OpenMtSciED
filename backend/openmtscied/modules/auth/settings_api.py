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
    model: Optional[str] = "gpt-3.5-turbo"
    base_url: Optional[str] = "https://api.openai.com/v1"

class DatabaseSettings(BaseModel):
    neon_host: str = "ep-throbbing-bread-a1b2c3d4.us-east-1.aws.neon.tech"
    neon_port: int = 5432
    neon_name: str = "openmtscied"
    neon_user: str = "neon_user"
    neon_password: Optional[str] = ""
    neo4j_uri: str = "neo4j+s://4abd5ef9.databases.neo4j.io"
    neo4j_username: str = "4abd5ef9"
    neo4j_password: Optional[str] = ""

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
    
    # 从环境变量获取真实配置
    try:
        neon_db_url = os.getenv("DATABASE_URL", "")
        neo4j_uri = os.getenv("NEO4J_URI", "neo4j+s://4abd5ef9.databases.neo4j.io")
        neo4j_username = os.getenv("NEO4J_USERNAME", "4abd5ef9")
        neo4j_password = os.getenv("NEO4J_PASSWORD", "")
        
        # 解析Neon数据库URL
        neon_host = "ep-raspy-shape-ao7ool7u-pooler.c-2.ap-southeast-1.aws.neon.tech"
        neon_port = 5432
        neon_name = "neondb"
        neon_user = "neondb_owner"
        
        if neon_db_url and "@" in neon_db_url:
            try:
                # 解析postgresql+asyncpg://user:pass@host/dbname格式
                url_part = neon_db_url.split("://")[1] if "://" in neon_db_url else neon_db_url
                auth_host_part = url_part.split("@")[1] if "@" in url_part else url_part
                host_db_part = auth_host_part.split("/")[0] if "/" in auth_host_part else auth_host_part
                
                if ":" in host_db_part:
                    neon_host = host_db_part.split(":")[0]
                    neon_port = int(host_db_part.split(":")[1].split("?")[0])
                else:
                    neon_host = host_db_part.split("?")[0]
                
                # 获取数据库名
                if "/" in url_part:
                    db_part = url_part.split("/")[1]
                    neon_name = db_part.split("?")[0] if "?" in db_part else db_part
                
                # 获取用户名
                user_pass_part = url_part.split("@")[0] if "@" in url_part else ""
                if ":" in user_pass_part:
                    neon_user = user_pass_part.split(":")[0]
            except Exception as parse_error:
                print(f"解析数据库URL失败: {parse_error}")
                pass  # 如果解析失败，使用默认值
        
        # 返回默认设置
        return {
            "ai_service": {
                "enabled": False,
                "provider": "openai",
                "api_key": "",
                "model": "gpt-3.5-turbo",
                "base_url": "https://api.openai.com/v1"
            },
            "database": {
                "neon_host": neon_host,
                "neon_port": neon_port,
                "neon_name": neon_name,
                "neon_user": neon_user,
                "neon_password": "",
                "neo4j_uri": neo4j_uri,
                "neo4j_username": neo4j_username,
                "neo4j_password": ""
            },
            "storage": {
                "type": "local",
                "path": "/data/storage"
            }
        }
    except Exception as e:
        print(f"加载默认设置失败: {e}")
        # 返回最简默认设置
        return {
            "ai_service": {
                "enabled": False,
                "provider": "openai",
                "api_key": "",
                "model": "gpt-3.5-turbo",
                "base_url": "https://api.openai.com/v1"
            },
            "database": {
                "neon_host": "ep-raspy-shape-ao7ool7u-pooler.c-2.ap-southeast-1.aws.neon.tech",
                "neon_port": 5432,
                "neon_name": "neondb",
                "neon_user": "neondb_owner",
                "neon_password": "",
                "neo4j_uri": "neo4j+s://4abd5ef9.databases.neo4j.io",
                "neo4j_username": "4abd5ef9",
                "neo4j_password": ""
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
