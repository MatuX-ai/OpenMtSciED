"""
用户许可证关联路由
提供用户与许可证的关联管理API
"""

from datetime import datetime
from typing import List

from fastapi import APIRouter, Depends, HTTPException, Path, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from models.license import License
from models.user import User
from models.user_license import (
    AssignUserLicenseRequest,
    UpdateUserLicenseRequest,
    UserLicense,
    UserLicenseResponse,
    UserLicenseStatus,
)
from routes.auth_routes import get_current_user
from utils.database import get_db

router = APIRouter(prefix="/api/users", tags=["用户许可证"])


@router.get("/{user_id}/licenses", response_model=List[UserLicenseResponse])
async def get_user_licenses(
    user_id: int = Path(..., description="用户ID"),
    include_inactive: bool = Query(False, description="是否包含非活跃的许可证"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """获取用户的所有许可证关联"""
    # 权限检查：用户只能查看自己的许可证，管理员可以查看所有
    if current_user.id != user_id and not current_user.is_admin():
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="无权查看其他用户的许可证信息"
        )

    query = select(UserLicense).filter(UserLicense.user_id == user_id)

    # 如果不包含非活跃的许可证，添加过滤条件
    if not include_inactive:
        query = query.filter(UserLicense.status == UserLicenseStatus.ACTIVE)

    # 预加载关联对象
    query = query.options(
        selectinload(UserLicense.license).selectinload(License.organization)
    )

    result = await db.execute(query)
    user_licenses = result.scalars().all()

    # 转换为响应模型
    response_list = []
    for ul in user_licenses:
        response = UserLicenseResponse.from_orm(ul)
        # 添加关联对象信息
        if ul.license:
            response.license_key = ul.license.license_key
            if ul.license.organization:
                response.organization_name = ul.license.organization.name
        response_list.append(response)

    return response_list


@router.post("/{user_id}/licenses", response_model=UserLicenseResponse)
async def assign_license_to_user(
    user_id: int = Path(..., description="用户ID"),
    request: AssignUserLicenseRequest = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """为用户分配许可证"""
    # 权限检查：只有管理员可以分配许可证
    if not current_user.can_manage_licenses():
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="无权分配许可证"
        )

    # 检查用户是否存在
    user_result = await db.execute(select(User).filter(User.id == user_id))
    user = user_result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="用户不存在")

    # 检查许可证是否存在
    license_result = await db.execute(
        select(License).filter(License.id == request.license_id)
    )
    license = license_result.scalar_one_or_none()
    if not license:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="许可证不存在"
        )

    # 检查是否已经存在关联
    existing_result = await db.execute(
        select(UserLicense).filter(
            UserLicense.user_id == user_id, UserLicense.license_id == request.license_id
        )
    )
    existing = existing_result.scalar_one_or_none()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT, detail="用户已关联此许可证"
        )

    # 创建新的用户许可证关联
    user_license = UserLicense(
        user_id=user_id,
        license_id=request.license_id,
        role=request.role,
        can_manage=request.can_manage,
        can_use=request.can_use,
        expires_at=request.expires_at,
        assigned_by=current_user.id,
        status=UserLicenseStatus.ACTIVE,
    )

    db.add(user_license)
    await db.commit()
    await db.refresh(user_license)

    # 预加载关联对象
    await db.refresh(user_license, ["license", "license.organization"])

    # 转换为响应模型
    response = UserLicenseResponse.from_orm(user_license)
    if user_license.license:
        response.license_key = user_license.license.license_key
        if user_license.license.organization:
            response.organization_name = user_license.license.organization.name

    return response


@router.get("/{user_id}/licenses/{license_id}", response_model=UserLicenseResponse)
async def get_user_license(
    user_id: int = Path(..., description="用户ID"),
    license_id: int = Path(..., description="许可证ID"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """获取用户特定许可证的关联信息"""
    # 权限检查
    if current_user.id != user_id and not current_user.is_admin():
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="无权查看其他用户的许可证信息"
        )

    result = await db.execute(
        select(UserLicense)
        .filter(UserLicense.user_id == user_id, UserLicense.license_id == license_id)
        .options(selectinload(UserLicense.license).selectinload(License.organization))
    )
    user_license = result.scalar_one_or_none()

    if not user_license:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="未找到用户与许可证的关联"
        )

    # 转换为响应模型
    response = UserLicenseResponse.from_orm(user_license)
    if user_license.license:
        response.license_key = user_license.license.license_key
        if user_license.license.organization:
            response.organization_name = user_license.license.organization.name

    return response


@router.put("/{user_id}/licenses/{license_id}", response_model=UserLicenseResponse)
async def update_user_license(
    user_id: int = Path(..., description="用户ID"),
    license_id: int = Path(..., description="许可证ID"),
    request: UpdateUserLicenseRequest = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """更新用户许可证关联"""
    # 权限检查
    if not current_user.can_manage_licenses():
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="无权更新许可证关联"
        )

    result = await db.execute(
        select(UserLicense).filter(
            UserLicense.user_id == user_id, UserLicense.license_id == license_id
        )
    )
    user_license = result.scalar_one_or_none()

    if not user_license:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="未找到用户与许可证的关联"
        )

    # 更新字段
    if request.role is not None:
        user_license.role = request.role
    if request.status is not None:
        user_license.status = request.status
    if request.can_manage is not None:
        user_license.can_manage = request.can_manage
    if request.can_use is not None:
        user_license.can_use = request.can_use
    if request.can_view is not None:
        user_license.can_view = request.can_view
    if request.expires_at is not None:
        user_license.expires_at = request.expires_at

    user_license.updated_at = datetime.utcnow()

    await db.commit()
    await db.refresh(user_license)

    # 预加载关联对象
    await db.refresh(user_license, ["license", "license.organization"])

    # 转换为响应模型
    response = UserLicenseResponse.from_orm(user_license)
    if user_license.license:
        response.license_key = user_license.license.license_key
        if user_license.license.organization:
            response.organization_name = user_license.license.organization.name

    return response


@router.delete("/{user_id}/licenses/{license_id}")
async def remove_user_license(
    user_id: int = Path(..., description="用户ID"),
    license_id: int = Path(..., description="许可证ID"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """移除用户许可证关联"""
    # 权限检查
    if not current_user.can_manage_licenses():
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="无权移除许可证关联"
        )

    result = await db.execute(
        select(UserLicense).filter(
            UserLicense.user_id == user_id, UserLicense.license_id == license_id
        )
    )
    user_license = result.scalar_one_or_none()

    if not user_license:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="未找到用户与许可证的关联"
        )

    await db.delete(user_license)
    await db.commit()

    return {"message": "用户许可证关联已移除"}


@router.get("/me/licenses", response_model=List[UserLicenseResponse])
async def get_my_licenses(
    include_inactive: bool = Query(False, description="是否包含非活跃的许可证"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """获取当前用户的所有许可证关联（便捷接口）"""
    return await get_user_licenses(
        user_id=current_user.id,
        include_inactive=include_inactive,
        current_user=current_user,
        db=db,
    )
