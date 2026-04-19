"""
用户管理API接口
提供用户的CRUD操作、统计和批量管理功能
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select, func, and_, or_
from sqlalchemy.ext.asyncio import AsyncSession

from models.user import User
from routes.auth_routes import get_current_user
from utils.database import get_db
from utils.decorators import admin_required
from pydantic import BaseModel

router = APIRouter(prefix="/api/v1/users", tags=["用户管理"])


# Pydantic模型定义
class UserResponse(BaseModel):
    """用户响应模型"""
    id: int
    username: Optional[str] = None
    email: str
    role: Optional[str] = None
    is_active: bool
    is_superuser: bool
    organization_id: Optional[int] = None
    created_at: Optional[str] = None
    updated_at: Optional[str] = None

    class Config:
        from_attributes = True


class UserUpdateRequest(BaseModel):
    """用户更新请求模型"""
    username: Optional[str] = None
    email: Optional[str] = None
    role: Optional[str] = None
    is_active: Optional[bool] = None


class UserStatsResponse(BaseModel):
    """用户统计响应模型"""
    totalUsers: int
    activeUsers: int
    inactiveUsers: int
    adminUsers: int
    orgAdminUsers: int


@router.get("", response_model=List[UserResponse], summary="获取用户列表")
@admin_required()
async def list_users(
    page: int = Query(1, ge=1, description="页码"),
    limit: int = Query(50, ge=1, le=200, description="每页数量"),
    role: Optional[str] = Query(None, description="角色筛选"),
    status_filter: Optional[str] = Query(None, alias="status", description="状态筛选(active/inactive)"),
    search: Optional[str] = Query(None, description="搜索关键词（用户名或邮箱）"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    获取用户列表（支持分页、筛选和搜索）
    
    权限要求：管理员
    """
    # 构建查询
    stmt = select(User)
    
    # 应用筛选条件
    filters = []
    
    if role:
        filters.append(User.role == role)
    
    if status_filter:
        is_active = status_filter.lower() == 'active'
        filters.append(User.is_active == is_active)
    
    if search:
        search_term = f"%{search}%"
        filters.append(
            or_(
                User.username.ilike(search_term),
                User.email.ilike(search_term)
            )
        )
    
    if filters:
        stmt = stmt.where(and_(*filters))
    
    # 计算总数
    count_stmt = select(func.count()).select_from(stmt.subquery())
    count_result = await db.execute(count_stmt)
    total = count_result.scalar()
    
    # 应用分页和排序
    offset = (page - 1) * limit
    stmt = stmt.offset(offset).limit(limit).order_by(User.created_at.desc())
    
    result = await db.execute(stmt)
    users = result.scalars().all()
    
    # 转换为响应格式
    user_list = []
    for user in users:
        # 获取用户的主组织ID
        organization_id = None
        if user.role in ["admin", "org_admin"]:
            from models.user_organization import UserOrganization
            org_stmt = select(UserOrganization).where(
                UserOrganization.user_id == user.id,
                UserOrganization.is_primary == True,
                UserOrganization.status == "active"
            )
            org_result = await db.execute(org_stmt)
            primary_org = org_result.scalar_one_or_none()
            if primary_org:
                organization_id = primary_org.org_id
        
        user_list.append(UserResponse(
            id=user.id,
            username=user.username,
            email=user.email,
            role=user.role,
            is_active=user.is_active,
            is_superuser=user.is_superuser,
            organization_id=organization_id,
            created_at=user.created_at.isoformat() if user.created_at else None,
            updated_at=user.updated_at.isoformat() if user.updated_at else None,
        ))
    
    return user_list


@router.get("/{user_id}", response_model=UserResponse, summary="获取用户详情")
@admin_required()
async def get_user(
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    获取指定用户的详细信息
    
    权限要求：管理员
    """
    stmt = select(User).where(User.id == user_id)
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"用户ID {user_id} 不存在"
        )
    
    # 获取用户的主组织ID
    organization_id = None
    if user.role in ["admin", "org_admin"]:
        from models.user_organization import UserOrganization
        org_stmt = select(UserOrganization).where(
            UserOrganization.user_id == user.id,
            UserOrganization.is_primary == True,
            UserOrganization.status == "active"
        )
        org_result = await db.execute(org_stmt)
        primary_org = org_result.scalar_one_or_none()
        if primary_org:
            organization_id = primary_org.org_id
    
    return UserResponse(
        id=user.id,
        username=user.username,
        email=user.email,
        role=user.role,
        is_active=user.is_active,
        is_superuser=user.is_superuser,
        organization_id=organization_id,
        created_at=user.created_at.isoformat() if user.created_at else None,
        updated_at=user.updated_at.isoformat() if user.updated_at else None,
    )


@router.put("/{user_id}", response_model=UserResponse, summary="更新用户信息")
@admin_required()
async def update_user(
    user_id: int,
    user_data: UserUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    更新用户信息
    
    权限要求：管理员
    """
    stmt = select(User).where(User.id == user_id)
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"用户ID {user_id} 不存在"
        )
    
    # 防止修改自己的角色为普通用户
    if user_id == current_user.id and user_data.role and user_data.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="不能降低自己的管理员权限"
        )
    
    # 更新字段
    update_data = user_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(user, field, value)
    
    await db.commit()
    await db.refresh(user)
    
    # 获取组织ID
    organization_id = None
    if user.role in ["admin", "org_admin"]:
        from models.user_organization import UserOrganization
        org_stmt = select(UserOrganization).where(
            UserOrganization.user_id == user.id,
            UserOrganization.is_primary == True,
            UserOrganization.status == "active"
        )
        org_result = await db.execute(org_stmt)
        primary_org = org_result.scalar_one_or_none()
        if primary_org:
            organization_id = primary_org.org_id
    
    return UserResponse(
        id=user.id,
        username=user.username,
        email=user.email,
        role=user.role,
        is_active=user.is_active,
        is_superuser=user.is_superuser,
        organization_id=organization_id,
        created_at=user.created_at.isoformat() if user.created_at else None,
        updated_at=user.updated_at.isoformat() if user.updated_at else None,
    )


@router.delete("/{user_id}", summary="删除用户")
@admin_required()
async def delete_user(
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    删除用户（软删除，设置为非活跃状态）
    
    权限要求：管理员
    注意：不能删除自己
    """
    # 防止删除自己
    if user_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="不能删除自己的账户"
        )
    
    stmt = select(User).where(User.id == user_id)
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"用户ID {user_id} 不存在"
        )
    
    # 软删除：设置为非活跃状态
    user.is_active = False
    
    await db.commit()
    
    return {"message": "用户已成功禁用", "user_id": user_id}


@router.get("/stats", response_model=UserStatsResponse, summary="获取用户统计信息")
@admin_required()
async def get_user_stats(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    获取用户统计信息
    
    权限要求：管理员
    """
    # 总用户数
    total_stmt = select(func.count()).select_from(User)
    total_result = await db.execute(total_stmt)
    total_users = total_result.scalar() or 0
    
    # 活跃用户数
    active_stmt = select(func.count()).select_from(User).where(User.is_active == True)
    active_result = await db.execute(active_stmt)
    active_users = active_result.scalar() or 0
    
    # 非活跃用户数
    inactive_users = total_users - active_users
    
    # 管理员数量
    admin_stmt = select(func.count()).select_from(User).where(
        User.role.in_(["admin", "superuser"])
    )
    admin_result = await db.execute(admin_stmt)
    admin_users = admin_result.scalar() or 0
    
    # 机构管理员数量
    org_admin_stmt = select(func.count()).select_from(User).where(
        User.role == "org_admin"
    )
    org_admin_result = await db.execute(org_admin_stmt)
    org_admin_users = org_admin_result.scalar() or 0
    
    return UserStatsResponse(
        totalUsers=total_users,
        activeUsers=active_users,
        inactiveUsers=inactive_users,
        adminUsers=admin_users,
        orgAdminUsers=org_admin_users,
    )
