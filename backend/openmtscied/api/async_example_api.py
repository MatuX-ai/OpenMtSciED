"""
异步数据库使用示例 API
展示如何在 FastAPI 中使用异步数据库会话
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
import logging

from ..async_database import get_async_db
from ..models.user import User

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/async-users", tags=["async-users"])


@router.get("/")
async def list_users(db: AsyncSession = Depends(get_async_db)):
    """
    异步获取用户列表
    """
    try:
        # 使用异步查询
        result = await db.execute(select(User))
        users = result.scalars().all()
        
        return {
            "users": [
                {
                    "id": user.id,
                    "username": user.username,
                    "email": user.email
                }
                for user in users
            ]
        }
    except Exception as e:
        logger.error(f"获取用户列表失败: {e}")
        raise HTTPException(status_code=500, detail="获取用户列表失败")


@router.get("/{user_id}")
async def get_user(user_id: int, db: AsyncSession = Depends(get_async_db)):
    """
    异步获取单个用户
    """
    try:
        result = await db.execute(select(User).where(User.id == user_id))
        user = result.scalar_one_or_none()
        
        if not user:
            raise HTTPException(status_code=404, detail="用户不存在")
        
        return {
            "id": user.id,
            "username": user.username,
            "email": user.email
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"获取用户失败: {e}")
        raise HTTPException(status_code=500, detail="获取用户失败")
