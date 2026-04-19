"""
用户许可证服务
处理用户与许可证的关联逻辑和Sentinel租户信息同步
"""

from datetime import datetime
import logging
from typing import Any, Dict, List, Optional

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from config.license_config import load_sentinel_config
from models.license import License
from models.user import User, UserRole
from models.user_license import UserLicense, UserLicenseStatus
from utils.redis_client import RedisLicenseStore

logger = logging.getLogger(__name__)


class UserLicenseService:
    """用户许可证服务类"""

    def __init__(self):
        self._redis_store = None
        self.sentinel_config = load_sentinel_config()
    
    @property
    def redis_store(self):
        """延迟初始化 Redis 存储"""
        if self._redis_store is None:
            try:
                self._redis_store = RedisLicenseStore()
            except Exception as e:
                logger.warning(f"Redis 初始化失败，将使用内存模式: {e}")
                self._redis_store = None
        return self._redis_store

    async def sync_user_with_sentinel(
        self, user: User, db: AsyncSession
    ) -> Dict[str, Any]:
        """
        同步用户与Sentinel租户信息

        Args:
            user: 用户对象
            db: 数据库会话

        Returns:
            包含同步结果的字典
        """
        try:
            # 获取用户的所有活跃许可证
            user_licenses = await self.get_user_active_licenses(user.id, db)

            # 准备Sentinel租户信息
            tenant_info = {
                "user_id": user.id,
                "username": user.username,
                "email": user.email,
                "role": user.role.value if user.role else "user",
                "is_admin": user.is_admin(),
                "licenses": [],
                "features": set(),
                "permissions": set(),
            }

            # 处理每个许可证
            for user_license in user_licenses:
                license_info = await self.process_license_for_user(user_license, db)
                if license_info:
                    tenant_info["licenses"].append(license_info)

                    # 收集功能和权限
                    if user_license.license and user_license.license.features:
                        tenant_info["features"].update(user_license.license.features)

                    # 根据用户角色和许可证权限设置权限
                    if user_license.can_manage:
                        tenant_info["permissions"].add("manage_license")
                    if user_license.can_use:
                        tenant_info["permissions"].add("use_license")

            # 转换集合为列表
            tenant_info["features"] = list(tenant_info["features"])
            tenant_info["permissions"] = list(tenant_info["permissions"])

            # 存储到Redis
            await self.store_tenant_info_in_redis(user.id, tenant_info)

            logger.info(f"用户 {user.username} 的Sentinel租户信息同步完成")
            return {
                "success": True,
                "user_id": user.id,
                "tenant_info": tenant_info,
                "license_count": len(tenant_info["licenses"]),
            }

        except Exception as e:
            logger.error(f"同步用户 {user.username} 的Sentinel租户信息失败: {e}")
            return {"success": False, "user_id": user.id, "error": str(e)}

    async def get_user_active_licenses(
        self, user_id: int, db: AsyncSession
    ) -> List[UserLicense]:
        """获取用户的所有活跃许可证"""
        result = await db.execute(
            select(UserLicense)
            .filter(
                UserLicense.user_id == user_id,
                UserLicense.status == UserLicenseStatus.ACTIVE,
            )
            .options(
                selectinload(UserLicense.license).selectinload(License.organization)
            )
        )
        return result.scalars().all()

    async def process_license_for_user(
        self, user_license: UserLicense, db: AsyncSession
    ) -> Optional[Dict[str, Any]]:
        """处理单个许可证信息"""
        if not user_license.license:
            return None

        license_obj = user_license.license

        # 检查许可证是否有效
        if not license_obj.is_valid:
            return None

        return {
            "license_id": license_obj.id,
            "license_key": license_obj.license_key,
            "license_type": license_obj.license_type.value,
            "organization_id": license_obj.organization_id,
            "organization_name": (
                license_obj.organization.name if license_obj.organization else None
            ),
            "expires_at": (
                license_obj.expires_at.isoformat() if license_obj.expires_at else None
            ),
            "max_users": license_obj.max_users,
            "max_devices": license_obj.max_devices,
            "features": license_obj.features or [],
            "user_role": user_license.role.value,
            "can_manage": user_license.can_manage,
            "can_use": user_license.can_use,
            "can_view": user_license.can_view,
            "assigned_at": (
                user_license.assigned_at.isoformat()
                if user_license.assigned_at
                else None
            ),
        }

    async def store_tenant_info_in_redis(
        self, user_id: int, tenant_info: Dict[str, Any]
    ) -> bool:
        """将租户信息存储到Redis"""
        try:
            key = f"user:{user_id}:tenant_info"
            await self.redis_store.set_json(key, tenant_info)

            # 设置过期时间（例如1小时）
            await self.redis_store.expire(key, 3600)

            return True
        except Exception as e:
            logger.error(f"存储用户 {user_id} 的租户信息到Redis失败: {e}")
            return False

    async def get_user_tenant_info(self, user_id: int) -> Optional[Dict[str, Any]]:
        """从Redis获取用户的租户信息"""
        try:
            key = f"user:{user_id}:tenant_info"
            tenant_info = await self.redis_store.get_json(key)
            return tenant_info
        except Exception as e:
            logger.error(f"获取用户 {user_id} 的租户信息失败: {e}")
            return None

    async def assign_license_to_user(
        self,
        user_id: int,
        license_id: int,
        assigning_user: User,
        role: UserRole = UserRole.USER,
        can_manage: bool = False,
        can_use: bool = True,
        expires_at: Optional[datetime] = None,
        db: AsyncSession = None,
    ) -> Dict[str, Any]:
        """为用户分配许可证"""
        try:
            # 权限检查
            if not assigning_user.can_manage_licenses():
                return {"success": False, "error": "无权分配许可证"}

            # 检查用户是否存在
            user_result = await db.execute(select(User).filter(User.id == user_id))
            user = user_result.scalar_one_or_none()
            if not user:
                return {"success": False, "error": "用户不存在"}

            # 检查许可证是否存在
            license_result = await db.execute(
                select(License).filter(License.id == license_id)
            )
            license_obj = license_result.scalar_one_or_none()
            if not license_obj:
                return {"success": False, "error": "许可证不存在"}

            # 检查是否已经存在关联
            existing_result = await db.execute(
                select(UserLicense).filter(
                    UserLicense.user_id == user_id, UserLicense.license_id == license_id
                )
            )
            existing = existing_result.scalar_one_or_none()
            if existing:
                return {"success": False, "error": "用户已关联此许可证"}

            # 创建新的用户许可证关联
            user_license = UserLicense(
                user_id=user_id,
                license_id=license_id,
                role=role,
                can_manage=can_manage,
                can_use=can_use,
                expires_at=expires_at,
                assigned_by=assigning_user.id,
                status=UserLicenseStatus.ACTIVE,
            )

            db.add(user_license)
            await db.commit()
            await db.refresh(user_license)

            # 同步用户信息到Sentinel
            sync_result = await self.sync_user_with_sentinel(user, db)

            return {
                "success": True,
                "user_license_id": user_license.id,
                "sync_result": sync_result,
            }

        except Exception as e:
            logger.error(f"分配许可证给用户失败: {e}")
            return {"success": False, "error": str(e)}

    async def validate_user_license_access(
        self, user_id: int, license_key: str, required_permission: str = "use_license"
    ) -> Dict[str, Any]:
        """验证用户对特定许可证的访问权限"""
        try:
            # 从Redis获取用户租户信息
            tenant_info = await self.get_user_tenant_info(user_id)

            if not tenant_info:
                return {"allowed": False, "reason": "用户租户信息不存在"}

            # 检查用户是否具有所需权限
            if required_permission not in tenant_info.get("permissions", []):
                return {"allowed": False, "reason": f"缺少权限: {required_permission}"}

            # 检查具体的许可证
            user_licenses = tenant_info.get("licenses", [])
            for license_info in user_licenses:
                if license_info.get("license_key") == license_key:
                    # 检查许可证是否过期
                    expires_at = license_info.get("expires_at")
                    if expires_at:
                        expire_time = datetime.fromisoformat(
                            expires_at.replace("Z", "+00:00")
                        )
                        if datetime.utcnow() > expire_time:
                            return {"allowed": False, "reason": "许可证已过期"}

                    # 检查特定权限
                    if (
                        required_permission == "manage_license"
                        and not license_info.get("can_manage")
                    ):
                        return {"allowed": False, "reason": "无管理权限"}
                    elif required_permission == "use_license" and not license_info.get(
                        "can_use"
                    ):
                        return {"allowed": False, "reason": "无使用权限"}

                    return {"allowed": True, "license_info": license_info}

            return {"allowed": False, "reason": "用户未关联此许可证"}

        except Exception as e:
            logger.error(f"验证用户许可证访问权限失败: {e}")
            return {"allowed": False, "reason": str(e)}


# 创建服务实例
user_license_service = UserLicenseService()
