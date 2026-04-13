"""
许可证管理API路由
提供组织和许可证管理的RESTful API接口
"""

from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, Request
from sqlalchemy.orm import Session

from models.license import (
    LicenseCreate,
    LicenseResponse,
    LicenseStatus,
    LicenseUpdate,
    OrganizationCreate,
    OrganizationResponse,
    OrganizationUpdate,
)
from services.license_service import LicenseService
from utils.database import get_db

router = APIRouter(prefix="/api/v1", tags=["许可证管理"])


def get_license_service(db: Session = Depends(get_db)) -> LicenseService:
    """获取许可证服务实例"""
    return LicenseService(db)


@router.post("/organizations", response_model=OrganizationResponse, summary="创建组织")
async def create_organization(
    org_data: OrganizationCreate,
    license_service: LicenseService = Depends(get_license_service),
):
    """
    创建新的组织/机构

    - **name**: 组织名称（必填）
    - **contact_email**: 联系邮箱（必填，唯一）
    - **phone**: 联系电话（可选）
    - **address**: 地址（可选）
    - **website**: 网站（可选）
    - **max_users**: 最大用户数（默认100）
    """
    try:
        organization = license_service.create_organization(org_data.dict())
        return organization
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"创建组织失败: {str(e)}")


@router.get(
    "/organizations", response_model=List[OrganizationResponse], summary="获取组织列表"
)
async def list_organizations(
    skip: int = Query(0, ge=0, description="跳过的记录数"),
    limit: int = Query(100, ge=1, le=1000, description="返回记录数"),
    is_active: Optional[bool] = Query(None, description="是否激活"),
    license_service: LicenseService = Depends(get_license_service),
    db: Session = Depends(get_db),
):
    """
    获取组织列表

    支持分页和筛选
    """
    from models.license import Organization

    query = db.query(Organization)

    if is_active is not None:
        query = query.filter(Organization.is_active == is_active)

    organizations = query.offset(skip).limit(limit).all()
    return organizations


@router.get(
    "/organizations/{org_id}",
    response_model=OrganizationResponse,
    summary="获取组织详情",
)
async def get_organization(
    org_id: int,
    license_service: LicenseService = Depends(get_license_service),
    db: Session = Depends(get_db),
):
    """根据ID获取组织详情"""
    from models.license import Organization

    organization = db.query(Organization).filter(Organization.id == org_id).first()
    if not organization:
        raise HTTPException(status_code=404, detail="组织不存在")

    return organization


@router.put(
    "/organizations/{org_id}", response_model=OrganizationResponse, summary="更新组织"
)
async def update_organization(
    org_id: int,
    org_update: OrganizationUpdate,
    license_service: LicenseService = Depends(get_license_service),
    db: Session = Depends(get_db),
):
    """更新组织信息"""
    from models.license import Organization

    organization = db.query(Organization).filter(Organization.id == org_id).first()
    if not organization:
        raise HTTPException(status_code=404, detail="组织不存在")

    try:
        update_data = org_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            if hasattr(organization, field):
                setattr(organization, field, value)

        organization.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(organization)

        return organization
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"更新组织失败: {str(e)}")


@router.post("/licenses", response_model=LicenseResponse, summary="生成许可证")
async def generate_license(
    license_data: LicenseCreate,
    license_service: LicenseService = Depends(get_license_service),
):
    """
    为指定组织生成新的许可证

    - **organization_id**: 组织ID（必填）
    - **product_id**: 产品ID（可选）
    - **license_type**: 许可证类型（默认commercial）
    - **duration_days**: 有效期天数（默认365天）
    - **max_users**: 最大用户数（默认1）
    - **max_devices**: 最大设备数（默认1）
    - **features**: 功能特性列表（可选）
    - **notes**: 备注（可选）
    """
    try:
        license_obj = license_service.create_license(license_data)
        return license_obj
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"生成许可证失败: {str(e)}")


@router.get("/licenses", response_model=List[LicenseResponse], summary="获取许可证列表")
async def list_licenses(
    skip: int = Query(0, ge=0, description="跳过的记录数"),
    limit: int = Query(100, ge=1, le=1000, description="返回记录数"),
    organization_id: Optional[int] = Query(None, description="组织ID筛选"),
    status: Optional[LicenseStatus] = Query(None, description="状态筛选"),
    license_service: LicenseService = Depends(get_license_service),
    db: Session = Depends(get_db),
):
    """获取许可证列表，支持分页和筛选"""
    from models.license import License

    query = db.query(License)

    if organization_id:
        query = query.filter(License.organization_id == organization_id)

    if status:
        query = query.filter(License.status == status)

    licenses = query.order_by(License.created_at.desc()).offset(skip).limit(limit).all()
    return licenses


@router.get(
    "/licenses/{license_key}", response_model=LicenseResponse, summary="获取许可证详情"
)
async def get_license(
    license_key: str,
    license_service: LicenseService = Depends(get_license_service),
    db: Session = Depends(get_db),
):
    """根据许可证密钥获取许可证详情"""
    from models.license import License

    license_obj = db.query(License).filter(License.license_key == license_key).first()
    if not license_obj:
        raise HTTPException(status_code=404, detail="许可证不存在")

    return license_obj


@router.post("/licenses/{license_key}/validate", summary="验证许可证")
async def validate_license(
    license_key: str,
    request: Request,
    license_service: LicenseService = Depends(get_license_service),
):
    """
    验证许可证有效性

    返回详细的验证结果，包括许可证信息和错误信息
    """
    # 获取客户端信息
    ip_address = request.client.host if request.client else None
    user_agent = request.headers.get("user-agent")

    validation_result = license_service.validate_license(
        license_key=license_key, ip_address=ip_address, user_agent=user_agent
    )

    if not validation_result["is_valid"]:
        raise HTTPException(status_code=403, detail=validation_result["error"])

    return {"valid": True, "license_info": validation_result["license_info"]}


@router.put(
    "/licenses/{license_key}", response_model=LicenseResponse, summary="更新许可证"
)
async def update_license(
    license_key: str,
    license_update: LicenseUpdate,
    license_service: LicenseService = Depends(get_license_service),
):
    """更新许可证信息"""
    license_obj = license_service.update_license(license_key, license_update)
    if not license_obj:
        raise HTTPException(status_code=404, detail="许可证不存在")

    return license_obj


@router.post("/licenses/{license_key}/revoke", summary="撤销许可证")
async def revoke_license(
    license_key: str,
    reason: Optional[str] = None,
    license_service: LicenseService = Depends(get_license_service),
):
    """撤销指定的许可证"""
    success = license_service.revoke_license(license_key, reason)
    if not success:
        raise HTTPException(status_code=404, detail="许可证不存在或撤销失败")

    return {"message": "许可证已成功撤销"}


@router.get(
    "/organizations/{org_id}/licenses",
    response_model=List[LicenseResponse],
    summary="获取组织的许可证",
)
async def get_organization_licenses(
    org_id: int, license_service: LicenseService = Depends(get_license_service)
):
    """获取指定组织的所有许可证"""
    licenses = license_service.get_organization_licenses(org_id)
    return licenses


@router.get("/statistics", summary="获取许可证统计信息")
async def get_license_statistics(
    license_service: LicenseService = Depends(get_license_service),
):
    """获取许可证系统的统计信息"""
    stats = license_service.get_license_statistics()
    return stats


@router.get("/health", summary="许可证系统健康检查")
async def license_system_health(
    license_service: LicenseService = Depends(get_license_service),
):
    """检查许可证系统的健康状态"""
    from utils.redis_client import redis_license_store

    health_status = {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "components": {
            "database": True,  # 假设数据库连接正常
            "redis": redis_license_store.is_connected(),
            "service": True,
        },
    }

    # 检查是否有任何组件不健康
    if not all(health_status["components"].values()):
        health_status["status"] = "degraded"

    return health_status


# 错误处理器 - 暂时禁用（应在 main.py 中全局注册）
# @router.exception_handler(Exception)
# async def general_exception_handler(request: Request, exc: Exception):
#     """通用异常处理器"""
#     return {"error": "内部服务器错误", "message": str(exc), "path": request.url.path}
