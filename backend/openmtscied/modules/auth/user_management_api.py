"""用户管理 API 路由"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime
import hashlib

router = APIRouter()

# Mock 用户数据 (实际应连接数据库)
MOCK_USERS = {
    1: {
        "id": 1,
        "username": "admin",
        "email": "3936318150@qq.com",
        "password_hash": hashlib.sha256("12345678".encode()).hexdigest(),
        "role": "admin",
        "is_active": True,
        "organization_id": None,
        "created_at": "2024-01-01T00:00:00Z",
        "updated_at": "2024-01-01T00:00:00Z"
    },
    2: {
        "id": 2,
        "username": "user1",
        "email": "user1@example.com",
        "password_hash": hashlib.sha256("12345678".encode()).hexdigest(),
        "role": "user",
        "is_active": True,
        "organization_id": 1,
        "created_at": "2024-01-02T00:00:00Z",
        "updated_at": "2024-01-02T00:00:00Z"
    },
    3: {
        "id": 3,
        "username": "org_admin",
        "email": "org_admin@example.com",
        "password_hash": hashlib.sha256("12345678".encode()).hexdigest(),
        "role": "org_admin",
        "is_active": True,
        "organization_id": 1,
        "created_at": "2024-01-03T00:00:00Z",
        "updated_at": "2024-01-03T00:00:00Z"
    },
    4: {
        "id": 4,
        "username": "inactive_user",
        "email": "inactive@example.com",
        "password_hash": hashlib.sha256("12345678".encode()).hexdigest(),
        "role": "user",
        "is_active": False,
        "organization_id": None,
        "created_at": "2024-01-04T00:00:00Z",
        "updated_at": "2024-01-04T00:00:00Z"
    }
}

class UserResponse(BaseModel):
    id: int
    username: Optional[str] = None
    email: str
    role: Optional[str] = None
    is_active: bool
    organization_id: Optional[int] = None
    created_at: Optional[str] = None
    updated_at: Optional[str] = None

class UserCreate(BaseModel):
    username: str
    email: str
    password: str
    role: Optional[str] = "user"

class UserUpdate(BaseModel):
    username: Optional[str] = None
    email: Optional[str] = None
    role: Optional[str] = None
    is_active: Optional[bool] = None

class UserStats(BaseModel):
    totalUsers: int
    activeUsers: int
    inactiveUsers: int
    adminUsers: int
    orgAdminUsers: int

@router.get("/")
async def get_users(
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=100),
    role: Optional[str] = None,
    status: Optional[str] = None,
    search: Optional[str] = None
):
    """获取用户列表"""
    users = list(MOCK_USERS.values())
    
    # 搜索过滤
    if search:
        search_lower = search.lower()
        users = [
            user for user in users
            if (user["username"] and search_lower in user["username"].lower()) or
               search_lower in user["email"].lower()
        ]
    
    # 角色过滤
    if role and role != "all":
        users = [user for user in users if user["role"] == role]
    
    # 状态过滤
    if status and status != "all":
        is_active = status == "active"
        users = [user for user in users if user["is_active"] == is_active]
    
    # 分页
    start = (page - 1) * limit
    end = start + limit
    paginated_users = users[start:end]
    
    return {
        "success": True,
        "data": [
            {
                **UserResponse(**user).model_dump(),
                "is_superuser": user["role"] == "admin"
            }
            for user in paginated_users
        ],
        "total": len(users)
    }

@router.get("/stats", response_model=UserStats)
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

@router.get("/{user_id}", response_model=UserResponse)
async def get_user(user_id: int):
    """获取用户详情"""
    user = MOCK_USERS.get(user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="用户不存在"
        )
    return UserResponse(**user)

@router.post("/", response_model=UserResponse)
async def create_user(user_data: UserCreate):
    """创建新用户"""
    # 检查用户名是否已存在
    for user in MOCK_USERS.values():
        if user["username"] == user_data.username:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="用户名已存在"
            )
        if user["email"] == user_data.email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="邮箱已被注册"
            )
    
    # 生成新用户ID
    new_id = max(MOCK_USERS.keys()) + 1 if MOCK_USERS else 1
    
    # 创建新用户
    now = datetime.utcnow().isoformat() + "Z"
    new_user = {
        "id": new_id,
        "username": user_data.username,
        "email": user_data.email,
        "password_hash": hashlib.sha256(user_data.password.encode()).hexdigest(),
        "role": user_data.role or "user",
        "is_active": True,
        "organization_id": None,
        "created_at": now,
        "updated_at": now
    }
    
    MOCK_USERS[new_id] = new_user
    return UserResponse(**new_user)

@router.put("/{user_id}", response_model=UserResponse)
async def update_user(user_id: int, user_data: UserUpdate):
    """更新用户信息"""
    user = MOCK_USERS.get(user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="用户不存在"
        )
    
    # 更新字段
    if user_data.username is not None:
        # 检查用户名是否已被其他用户使用
        for uid, u in MOCK_USERS.items():
            if uid != user_id and u["username"] == user_data.username:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="用户名已存在"
                )
        user["username"] = user_data.username
    
    if user_data.email is not None:
        # 检查邮箱是否已被其他用户使用
        for uid, u in MOCK_USERS.items():
            if uid != user_id and u["email"] == user_data.email:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="邮箱已被注册"
                )
        user["email"] = user_data.email
    
    if user_data.role is not None:
        user["role"] = user_data.role
    
    if user_data.is_active is not None:
        user["is_active"] = user_data.is_active
    
    user["updated_at"] = datetime.utcnow().isoformat() + "Z"
    MOCK_USERS[user_id] = user
    
    return UserResponse(**user)

@router.delete("/{user_id}")
async def delete_user(user_id: int):
    """删除用户"""
    user = MOCK_USERS.get(user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="用户不存在"
        )
    
    del MOCK_USERS[user_id]
    return {"message": "用户删除成功"}