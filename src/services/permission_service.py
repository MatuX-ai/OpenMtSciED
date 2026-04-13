"""
权限服务层
实现RBAC权限管理和相关业务逻辑
"""

from datetime import datetime
import logging
from typing import Dict, List, Optional

from fastapi import HTTPException, status
from sqlalchemy import and_, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from models.permission import (
    SYSTEM_PERMISSIONS,
    SYSTEM_ROLES,
    Permission,
    PermissionLog,
    Role,
    UserRoleAssignment,
)
from models.user import User
from utils.database import get_async_db

logger = logging.getLogger(__name__)


class PermissionService:
    """权限服务类"""

    async def initialize_system_permissions(
        self, db: AsyncSession = None
    ) -> Dict[str, int]:
        """
        初始化系统预定义权限

        Returns:
            Dict[str, int]: 权限代码到ID的映射
        """
        if db is None:
            async for db_session in get_async_db():
                db = db_session
                break

        permission_map = {}

        try:
            for perm_data in SYSTEM_PERMISSIONS:
                # 检查权限是否已存在
                stmt = select(Permission).filter(Permission.code == perm_data["code"])
                result = await db.execute(stmt)
                existing_perm = result.scalar_one_or_none()

                if not existing_perm:
                    # 创建新权限
                    permission = Permission(
                        name=perm_data["name"],
                        code=perm_data["code"],
                        description=f"{perm_data['category']}_{perm_data['action']}",
                        category=perm_data["category"],
                        action=perm_data["action"],
                        resource=perm_data.get("resource", ""),
                    )
                    db.add(permission)
                    await db.flush()
                    permission_map[perm_data["code"]] = permission.id
                    logger.info(f"创建权限: {perm_data['code']}")
                else:
                    permission_map[perm_data["code"]] = existing_perm.id

            await db.commit()
            logger.info(f"系统权限初始化完成，共 {len(permission_map)} 个权限")
            return permission_map

        except Exception as e:
            await db.rollback()
            logger.error(f"初始化系统权限失败: {e}")
            raise

    async def initialize_system_roles(self, db: AsyncSession = None) -> Dict[str, int]:
        """
        初始化系统预定义角色

        Returns:
            Dict[str, int]: 角色代码到ID的映射
        """
        if db is None:
            async for db_session in get_async_db():
                db = db_session
                break

        role_map = {}
        permission_map = await self.initialize_system_permissions(db)

        try:
            for role_data in SYSTEM_ROLES:
                # 检查角色是否已存在
                stmt = select(Role).filter(Role.code == role_data["code"])
                result = await db.execute(stmt)
                existing_role = result.scalar_one_or_none()

                if not existing_role:
                    # 创建新角色
                    role = Role(
                        name=role_data["name"],
                        code=role_data["code"],
                        description=role_data["description"],
                        is_system=role_data["is_system"],
                        priority=role_data["priority"],
                    )
                    db.add(role)
                    await db.flush()
                    role_id = role.id
                    role_map[role_data["code"]] = role_id
                    logger.info(f"创建角色: {role_data['code']}")
                else:
                    role_id = existing_role.id
                    role_map[role_data["code"]] = role_id

                # 分配权限给角色
                if "permissions" in role_data:
                    # 先清除现有权限关联
                    from models.permission import role_permissions

                    delete_stmt = role_permissions.delete().where(
                        role_permissions.c.role_id == role_id
                    )
                    await db.execute(delete_stmt)

                    # 添加新的权限关联
                    permission_ids = [
                        permission_map[code]
                        for code in role_data["permissions"]
                        if code in permission_map
                    ]

                    if permission_ids:
                        insert_values = [
                            {"role_id": role_id, "permission_id": perm_id}
                            for perm_id in permission_ids
                        ]
                        await db.execute(role_permissions.insert(), insert_values)

            await db.commit()
            logger.info(f"系统角色初始化完成，共 {len(role_map)} 个角色")
            return role_map

        except Exception as e:
            await db.rollback()
            logger.error(f"初始化系统角色失败: {e}")
            raise

    async def assign_role_to_user(
        self,
        user_id: int,
        role_code: str,
        assigned_by: int = None,
        expires_at: datetime = None,
        reason: str = None,
        db: AsyncSession = None,
    ) -> UserRoleAssignment:
        """
        为用户分配角色

        Args:
            user_id: 用户ID
            role_code: 角色代码
            assigned_by: 分配者ID
            expires_at: 过期时间
            reason: 分配原因
            db: 数据库会话

        Returns:
            UserRoleAssignment: 角色分配记录
        """
        if db is None:
            async for db_session in get_async_db():
                db = db_session
                break

        try:
            # 检查角色是否存在
            role_stmt = select(Role).filter(
                and_(Role.code == role_code, Role.is_active == True)
            )
            role_result = await db.execute(role_stmt)
            role = role_result.scalar_one_or_none()

            if not role:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"角色 {role_code} 不存在或已被禁用",
                )

            # 检查用户是否存在
            user_stmt = select(User).filter(User.id == user_id)
            user_result = await db.execute(user_stmt)
            user = user_result.scalar_one_or_none()

            if not user:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"用户 {user_id} 不存在",
                )

            # 检查是否已有相同角色分配（且未过期）
            assignment_stmt = select(UserRoleAssignment).filter(
                and_(
                    UserRoleAssignment.user_id == user_id,
                    UserRoleAssignment.role_id == role.id,
                    UserRoleAssignment.is_active == True,
                    or_(
                        UserRoleAssignment.expires_at.is_(None),
                        UserRoleAssignment.expires_at > datetime.utcnow(),
                    ),
                )
            )
            assignment_result = await db.execute(assignment_stmt)
            existing_assignment = assignment_result.scalar_one_or_none()

            if existing_assignment:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail=f"用户已拥有角色 {role_code}",
                )

            # 创建角色分配记录
            assignment = UserRoleAssignment(
                user_id=user_id,
                role_id=role.id,
                assigned_by=assigned_by,
                expires_at=expires_at,
                reason=reason,
            )
            db.add(assignment)
            await db.flush()

            # 记录权限变更日志
            await self.log_permission_change(
                user_id=assigned_by,
                target_user_id=user_id,
                action_type="assign_role",
                resource_type="role",
                resource_id=role.id,
                role_code=role_code,
                description=f"为用户分配角色 {role.name}",
                db=db,
            )

            await db.commit()
            logger.info(f"成功为用户 {user_id} 分配角色 {role_code}")
            return assignment

        except HTTPException:
            raise
        except Exception as e:
            await db.rollback()
            logger.error(f"分配角色失败: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="分配角色失败"
            )

    async def revoke_role_from_user(
        self,
        user_id: int,
        role_code: str,
        revoked_by: int = None,
        reason: str = None,
        db: AsyncSession = None,
    ) -> bool:
        """
        从用户撤销角色

        Args:
            user_id: 用户ID
            role_code: 角色代码
            revoked_by: 撤销者ID
            reason: 撤销原因
            db: 数据库会话

        Returns:
            bool: 操作是否成功
        """
        if db is None:
            async for db_session in get_async_db():
                db = db_session
                break

        try:
            # 查找活动的角色分配
            stmt = (
                select(UserRoleAssignment)
                .join(Role)
                .filter(
                    and_(
                        UserRoleAssignment.user_id == user_id,
                        Role.code == role_code,
                        UserRoleAssignment.is_active == True,
                    )
                )
            )
            result = await db.execute(stmt)
            assignment = result.scalar_one_or_none()

            if not assignment:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"用户 {user_id} 未分配角色 {role_code}",
                )

            # 更新分配记录
            assignment.is_active = False
            assignment.revoked_at = datetime.utcnow()
            assignment.revoked_by = revoked_by

            # 记录权限变更日志
            await self.log_permission_change(
                user_id=revoked_by,
                target_user_id=user_id,
                action_type="revoke_role",
                resource_type="role",
                resource_id=assignment.role_id,
                role_code=role_code,
                description=f"从用户撤销角色 {assignment.role.name}"
                + (f" 原因: {reason}" if reason else ""),
                db=db,
            )

            await db.commit()
            logger.info(f"成功从用户 {user_id} 撤销角色 {role_code}")
            return True

        except HTTPException:
            raise
        except Exception as e:
            await db.rollback()
            logger.error(f"撤销角色失败: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="撤销角色失败"
            )

    async def get_user_permissions(
        self, user_id: int, db: AsyncSession = None
    ) -> List[Permission]:
        """
        获取用户的所有权限

        Args:
            user_id: 用户ID
            db: 数据库会话

        Returns:
            List[Permission]: 用户权限列表
        """
        if db is None:
            async for db_session in get_async_db():
                db = db_session
                break

        try:
            # 获取用户的角色分配
            assignment_stmt = select(UserRoleAssignment).filter(
                and_(
                    UserRoleAssignment.user_id == user_id,
                    UserRoleAssignment.is_active == True,
                    or_(
                        UserRoleAssignment.expires_at.is_(None),
                        UserRoleAssignment.expires_at > datetime.utcnow(),
                    ),
                )
            )
            assignment_result = await db.execute(assignment_stmt)
            assignments = assignment_result.scalars().all()

            if not assignments:
                return []

            # 获取角色ID列表
            role_ids = [assignment.role_id for assignment in assignments]

            # 获取角色对应的权限
            from models.permission import role_permissions

            permission_stmt = (
                select(Permission)
                .join(role_permissions)
                .filter(
                    and_(
                        role_permissions.c.role_id.in_(role_ids),
                        Permission.is_active == True,
                    )
                )
                .distinct()
            )

            permission_result = await db.execute(permission_stmt)
            permissions = permission_result.scalars().all()

            return list(permissions)

        except Exception as e:
            logger.error(f"获取用户权限失败: {e}")
            return []

    async def check_user_permission(
        self, user_id: int, permission_code: str, db: AsyncSession = None
    ) -> bool:
        """
        检查用户是否具有指定权限

        Args:
            user_id: 用户ID
            permission_code: 权限代码
            db: 数据库会话

        Returns:
            bool: 是否具有权限
        """
        permissions = await self.get_user_permissions(user_id, db)
        return any(perm.code == permission_code for perm in permissions)

    async def check_user_has_any_permission(
        self, user_id: int, permission_codes: List[str], db: AsyncSession = None
    ) -> bool:
        """
        检查用户是否具有任意一个权限

        Args:
            user_id: 用户ID
            permission_codes: 权限代码列表
            db: 数据库会话

        Returns:
            bool: 是否具有任意权限
        """
        permissions = await self.get_user_permissions(user_id, db)
        user_permission_codes = {perm.code for perm in permissions}
        return bool(user_permission_codes.intersection(set(permission_codes)))

    async def check_user_has_all_permissions(
        self, user_id: int, permission_codes: List[str], db: AsyncSession = None
    ) -> bool:
        """
        检查用户是否具有所有指定权限

        Args:
            user_id: 用户ID
            permission_codes: 权限代码列表
            db: 数据库会话

        Returns:
            bool: 是否具有所有权限
        """
        permissions = await self.get_user_permissions(user_id, db)
        user_permission_codes = {perm.code for perm in permissions}
        return user_permission_codes.issuperset(set(permission_codes))

    async def log_permission_change(
        self,
        user_id: Optional[int],
        target_user_id: Optional[int],
        action_type: str,
        resource_type: str,
        resource_id: Optional[int] = None,
        permission_code: Optional[str] = None,
        role_code: Optional[str] = None,
        old_value: Optional[str] = None,
        new_value: Optional[str] = None,
        description: Optional[str] = None,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
        db: AsyncSession = None,
    ) -> PermissionLog:
        """
        记录权限变更日志

        Args:
            user_id: 操作用户ID
            target_user_id: 目标用户ID
            action_type: 操作类型
            resource_type: 资源类型
            resource_id: 资源ID
            permission_code: 权限代码
            role_code: 角色代码
            old_value: 旧值
            new_value: 新值
            description: 描述
            ip_address: IP地址
            user_agent: 用户代理
            db: 数据库会话

        Returns:
            PermissionLog: 日志记录
        """
        if db is None:
            async for db_session in get_async_db():
                db = db_session
                break

        try:
            log_entry = PermissionLog(
                user_id=user_id,
                target_user_id=target_user_id,
                action_type=action_type,
                resource_type=resource_type,
                resource_id=resource_id,
                permission_code=permission_code,
                role_code=role_code,
                old_value=old_value,
                new_value=new_value,
                ip_address=ip_address,
                user_agent=user_agent,
                description=description,
            )

            db.add(log_entry)
            await db.flush()
            await db.commit()

            logger.info(f"记录权限变更日志: {action_type} - {resource_type}")
            return log_entry

        except Exception as e:
            await db.rollback()
            logger.error(f"记录权限变更日志失败: {e}")
            raise

    async def get_permission_logs(
        self,
        user_id: Optional[int] = None,
        action_type: Optional[str] = None,
        resource_type: Optional[str] = None,
        limit: int = 50,
        offset: int = 0,
        db: AsyncSession = None,
    ) -> List[PermissionLog]:
        """
        获取权限变更日志

        Args:
            user_id: 用户ID过滤
            action_type: 操作类型过滤
            resource_type: 资源类型过滤
            limit: 限制数量
            offset: 偏移量
            db: 数据库会话

        Returns:
            List[PermissionLog]: 日志列表
        """
        if db is None:
            async for db_session in get_async_db():
                db = db_session
                break

        try:
            stmt = select(PermissionLog)

            # 构建过滤条件
            filters = []
            if user_id:
                filters.append(PermissionLog.user_id == user_id)
            if action_type:
                filters.append(PermissionLog.action_type == action_type)
            if resource_type:
                filters.append(PermissionLog.resource_type == resource_type)

            if filters:
                stmt = stmt.filter(and_(*filters))

            # 排序和分页
            stmt = (
                stmt.order_by(PermissionLog.created_at.desc())
                .limit(limit)
                .offset(offset)
            )

            result = await db.execute(stmt)
            logs = result.scalars().all()

            return list(logs)

        except Exception as e:
            logger.error(f"获取权限日志失败: {e}")
            return []


# 全局权限服务实例
permission_service = PermissionService()
