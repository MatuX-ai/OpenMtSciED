"""用户统计 API 路由"""

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import Optional

router = APIRouter()

# Mock 用户数据 (实际应连接数据库)
MOCK_USERS = {
    1: {
        "id": 1,
        "username": "admin",
        "email": "3936318150@qq.com",
        "password_hash": "12345678", # 简化处理，生产环境必须加密
        "role": "admin",
        "is_active": True,
        "organization_id": None
    },
    2: {
        "id": 2,
        "username": "user1",
        "email": "user1@example.com",
        "password_hash": "12345678",
        "role": "user",
        "is_active": True,
        "organization_id": 1
    },
    3: {
        "id": 3,
        "username": "org_admin",
        "email": "org_admin@example.com",
        "password_hash": "12345678",
        "role": "org_admin",
        "is_active": True,
        "organization_id": 1
    },
    4: {
        "id": 4,
        "username": "inactive_user",
        "email": "inactive@example.com",
        "password_hash": "12345678",
        "role": "user",
        "is_active": False,
        "organization_id": None
    }
}

class UserStats(BaseModel):
    totalUsers: int
    activeUsers: int
    inactiveUsers: int
    adminUsers: int
    orgAdminUsers: int

@router.get("/", response_model=UserStats)
async def get_user_stats():
    """获取用户统计信息"""
    total_users = len(MOCK_USERS)
    active_users = sum(1 for user in MOCK_USERS.values() if user["is_active"])
    inactive_users = total_users - active_users
    admin_users = sum(1 for user in MOCK_USERS.values() if user["role"] == "admin")
    org_admin_users = sum(1 for user in MOCK_USERS.values() if user["role"] == "org_admin")
    
    return UserStats(
        totalUsers=total_users,
        activeUsers=active_users,
        inactiveUsers=inactive_users,
        adminUsers=admin_users,
        orgAdminUsers=org_admin_users
    )
