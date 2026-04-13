"""
用户-组织关联管理API路由
提供用户与组织多对多关联的CRUD接口
"""

import logging
from typing import List, Optional

from fastapi import APIRouter, Body, Depends, HTTPException, Path, Query
from sqlalchemy.orm import Session

from models.user import User
from models.user_organization import (
    UserOrganization,
    UserOrganizationCreate,
    UserOrganizationListResponse,
    UserOrganizationResponse,
    UserOrganizationRole,
    UserOrganizationStatus,
    UserOrganizationUpdate,
)
from services.user_organization_service import UserOrganizationService
from utils.auth_utils import get_current_user_sync
from utils.database import get_sync_db

logger = logging.getLogger(__name__)

# 创建路由器实例
router = APIRouter(prefix="/api/v1", tags=["用户组织管理"])


def get_user_organization_service(db: Session = Depends(get_sync_db)) -> UserOrganizationService:
    """获取用户-组织关联服务实例"""
    return UserOrganizationService(db)


# ============ 用户-组织关联管理API ============

@router.post(
    "/user-organizations",
    response_model=UserOrganizationResponse,
    summary="创建用户-组织关联"
)
def create_user_organization(
    data: UserOrganizationCreate = Body(..., description="关联创建数据"),
    current_user: User = Depends(get_current_user_sync),
    service: UserOrganizationService = Depends(get_user_organization_service),
):
    """创建用户与组织的新关联"""
    try:
        user_org = service.create_user_organization(data, current_user)
        return user_org
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"创建用户-组织关联失败: {e}")
        raise HTTPException(status_code=500, detail=f"创建失败: {str(e)}")


@router.get(
    "/user-organizations/{org_rel_id}",
    response_model=UserOrganizationResponse,
    summary="获取用户-组织关联详情"
)
def get_user_organization(
    org_rel_id: int = Path(..., description="关联ID"),
    service: UserOrganizationService = Depends(get_user_organization_service),
):
    """获取指定关联的详细信息"""
    user_org = service.get_user_organization(org_rel_id)
    if not user_org:
        raise HTTPException(status_code=404, detail=f"关联ID {org_rel_id} 不存在")
    return user_org


@router.get(
    "/user-organizations/user/{user_id}",
    response_model=UserOrganizationListResponse,
    summary="获取用户的所有组织关联"
)
def get_user_organizations(
    user_id: int = Path(..., description="用户ID"),
    role: Optional[UserOrganizationRole] = Query(None, description="角色过滤"),
    status: Optional[UserOrganizationStatus] = Query(None, description="状态过滤"),
    include_inactive: bool = Query(False, description="是否包含已停用的关联"),
    service: UserOrganizationService = Depends(get_user_organization_service),
):
    """获取用户加入的所有组织"""
    orgs = service.get_user_organizations(
        user_id=user_id,
        role=role,
        status=status,
        include_inactive=include_inactive,
    )
    return UserOrganizationListResponse(total=len(orgs), items=orgs)


@router.get(
    "/user-organizations/org/{org_id}",
    response_model=UserOrganizationListResponse,
    summary="获取组织的所有用户"
)
def get_organization_users(
    org_id: int = Path(..., description="组织ID"),
    role: Optional[UserOrganizationRole] = Query(None, description="角色过滤"),
    status: Optional[UserOrganizationStatus] = Query(None, description="状态过滤"),
    service: UserOrganizationService = Depends(get_user_organization_service),
):
    """获取组织下的所有用户"""
    users = service.get_organization_users(
        org_id=org_id,
        role=role,
        status=status,
    )
    return UserOrganizationListResponse(total=len(users), items=users)


@router.put(
    "/user-organizations/{org_rel_id}",
    response_model=UserOrganizationResponse,
    summary="更新用户-组织关联"
)
def update_user_organization(
    org_rel_id: int = Path(..., description="关联ID"),
    data: UserOrganizationUpdate = Body(..., description="更新数据"),
    current_user: User = Depends(get_current_user_sync),
    service: UserOrganizationService = Depends(get_user_organization_service),
):
    """更新关联信息"""
    try:
        user_org = service.update_user_organization(org_rel_id, data)
        return user_org
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"更新用户-组织关联失败: {e}")
        raise HTTPException(status_code=500, detail=f"更新失败: {str(e)}")


@router.delete(
    "/user-organizations/{org_rel_id}",
    summary="删除用户-组织关联"
)
def delete_user_organization(
    org_rel_id: int = Path(..., description="关联ID"),
    soft: bool = Query(True, description="是否软删除"),
    current_user: User = Depends(get_current_user_sync),
    service: UserOrganizationService = Depends(get_user_organization_service),
):
    """删除用户与组织的关联"""
    try:
        service.delete_user_organization(org_rel_id, soft=soft)
        return {"message": "删除成功", "org_rel_id": org_rel_id}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"删除用户-组织关联失败: {e}")
        raise HTTPException(status_code=500, detail=f"删除失败: {str(e)}")


@router.post(
    "/user-organizations/user/{user_id}/set-primary/{org_id}",
    response_model=UserOrganizationResponse,
    summary="设置主组织"
)
def set_primary_organization(
    user_id: int = Path(..., description="用户ID"),
    org_id: int = Path(..., description="组织ID"),
    current_user: User = Depends(get_current_user_sync),
    service: UserOrganizationService = Depends(get_user_organization_service),
):
    """设置用户的主组织"""
    try:
        user_org = service.set_primary_organization(user_id, org_id)
        return user_org
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"设置主组织失败: {e}")
        raise HTTPException(status_code=500, detail=f"设置失败: {str(e)}")


@router.get(
    "/user-organizations/user/{user_id}/primary",
    summary="获取用户主组织"
)
def get_user_primary_organization(
    user_id: int = Path(..., description="用户ID"),
    service: UserOrganizationService = Depends(get_user_organization_service),
):
    """获取用户的主组织"""
    primary = service.get_user_primary_organization(user_id)
    if not primary:
        raise HTTPException(status_code=404, detail="用户没有设置主组织")
    return primary


@router.get(
    "/user-organizations/user/{user_id}/stats",
    summary="获取用户组织统计"
)
def get_user_organization_stats(
    user_id: int = Path(..., description="用户ID"),
    service: UserOrganizationService = Depends(get_user_organization_service),
):
    """获取用户组织统计信息"""
    stats = service.get_user_stats(user_id)
    return stats
