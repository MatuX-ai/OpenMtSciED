"""
用户-组织关联管理服务
处理用户与组织之间的多对多关联关系
"""

import logging
from datetime import date, datetime
from typing import Any, Dict, List, Optional

from sqlalchemy.orm import Session, joinedload

from models.learning_source import LearningSourceType
from models.user import User
from models.user_organization import (
    UserOrganization,
    UserOrganizationCreate,
    UserOrganizationResponse,
    UserOrganizationRole,
    UserOrganizationStatus,
    UserOrganizationUpdate,
)

logger = logging.getLogger(__name__)


class UserOrganizationService:
    """用户-组织关联管理服务类"""

    def __init__(self, db: Session):
        self.db = db

    def create_user_organization(
        self, data: UserOrganizationCreate, current_user: Optional[User] = None
    ) -> UserOrganization:
        """
        创建用户-组织关联

        Args:
            data: 关联创建数据
            current_user: 当前用户（可选）

        Returns:
            UserOrganization: 创建的关联对象

        Raises:
            ValueError: 数据验证失败
        """
        try:
            # 检查用户是否存在
            user = self.db.query(User).filter(User.id == data.user_id).first()
            if not user:
                raise ValueError(f"用户ID {data.user_id} 不存在")

            # 检查组织是否存在（如果提供了org_id）
            if data.org_id:
                from models.license import Organization
                org = (
                    self.db.query(Organization)
                    .filter(Organization.id == data.org_id)
                    .first()
                )
                if not org:
                    raise ValueError(f"组织ID {data.org_id} 不存在")

            # 检查是否已存在相同的关联
            existing = (
                self.db.query(UserOrganization)
                .filter(
                    UserOrganization.user_id == data.user_id,
                    UserOrganization.org_id == data.org_id,
                )
                .first()
            )
            if existing:
                raise ValueError("该用户-组织关联已存在")

            # 如果设置为主组织，需要取消其他主组织
            if data.is_primary:
                self._clear_primary_orgs(data.user_id)

            # 创建关联
            user_org = UserOrganization(**data.dict())
            self.db.add(user_org)
            self.db.commit()
            self.db.refresh(user_org)

            logger.info(
                f"用户 {data.user_id} 加入组织 {data.org_id}, 角色: {data.role.value}"
            )
            return user_org

        except Exception as e:
            self.db.rollback()
            logger.error(f"创建用户-组织关联失败: {str(e)}")
            raise

    def get_user_organization(self, org_id: int) -> Optional[UserOrganization]:
        """获取用户-组织关联详情"""
        return (
            self.db.query(UserOrganization)
            .options(joinedload(UserOrganization.organization))
            .filter(UserOrganization.id == org_id)
            .first()
        )

    def get_user_organizations(
        self,
        user_id: int,
        role: Optional[UserOrganizationRole] = None,
        status: Optional[UserOrganizationStatus] = None,
        include_inactive: bool = False,
    ) -> List[UserOrganization]:
        """
        获取用户的所有组织关联

        Args:
            user_id: 用户ID
            role: 角色过滤
            status: 状态过滤
            include_inactive: 是否包含已停用的关联

        Returns:
            List[UserOrganization]: 关联列表
        """
        query = (
            self.db.query(UserOrganization)
            .options(joinedload(UserOrganization.organization))
            .filter(UserOrganization.user_id == user_id)
        )

        if role:
            query = query.filter(UserOrganization.role == role)

        if status:
            query = query.filter(UserOrganization.status == status)
        elif not include_inactive:
            query = query.filter(
                UserOrganization.status == UserOrganizationStatus.ACTIVE
            )

        return query.order_by(
            UserOrganization.is_primary.desc(), UserOrganization.created_at.desc()
        ).all()

    def get_organization_users(
        self,
        org_id: int,
        role: Optional[UserOrganizationRole] = None,
        status: Optional[UserOrganizationStatus] = None,
    ) -> List[UserOrganization]:
        """
        获取组织下的所有用户

        Args:
            org_id: 组织ID
            role: 角色过滤
            status: 状态过滤

        Returns:
            List[UserOrganization]: 关联列表
        """
        query = (
            self.db.query(UserOrganization)
            .options(joinedload(UserOrganization.user))
            .filter(UserOrganization.org_id == org_id)
        )

        if role:
            query = query.filter(UserOrganization.role == role)

        if status:
            query = query.filter(UserOrganization.status == status)
        else:
            query = query.filter(
                UserOrganization.status == UserOrganizationStatus.ACTIVE
            )

        return query.order_by(UserOrganization.is_primary.desc()).all()

    def update_user_organization(
        self, org_id: int, data: UserOrganizationUpdate
    ) -> UserOrganization:
        """
        更新用户-组织关联

        Args:
            org_id: 关联ID
            data: 更新数据

        Returns:
            UserOrganization: 更新后的关联

        Raises:
            ValueError: 不存在
        """
        user_org = self.get_user_organization(org_id)
        if not user_org:
            raise ValueError(f"用户-组织关联ID {org_id} 不存在")

        # 如果设置为主组织，需要取消其他主组织
        if data.is_primary and not user_org.is_primary:
            self._clear_primary_orgs(user_org.user_id)

        # 更新字段
        update_data = data.dict(exclude_unset=True)
        for key, value in update_data.items():
            setattr(user_org, key, value)

        self.db.commit()
        self.db.refresh(user_org)

        logger.info(f"更新用户-组织关联: {org_id}")
        return user_org

    def delete_user_organization(self, org_id: int, soft: bool = True) -> bool:
        """
        删除用户-组织关联

        Args:
            org_id: 关联ID
            soft: 是否软删除

        Returns:
            bool: 是否删除成功
        """
        user_org = self.get_user_organization(org_id)
        if not user_org:
            raise ValueError(f"用户-组织关联ID {org_id} 不存在")

        if soft:
            user_org.is_active = False
            user_org.status = UserOrganizationStatus.INACTIVE
            self.db.commit()
        else:
            self.db.delete(user_org)
            self.db.commit()

        logger.info(f"删除用户-组织关联: {org_id}, 软删除: {soft}")
        return True

    def _clear_primary_orgs(self, user_id: int) -> None:
        """清除用户的所有主组织标记"""
        self.db.query(UserOrganization).filter(
            UserOrganization.user_id == user_id,
            UserOrganization.is_primary == True,
        ).update({"is_primary": False})
        self.db.commit()

    def set_primary_organization(self, user_id: int, org_id: int) -> UserOrganization:
        """
        设置用户的主组织

        Args:
            user_id: 用户ID
            org_id: 组织ID

        Returns:
            UserOrganization: 更新后的关联

        Raises:
            ValueError: 关联不存在
        """
        user_org = (
            self.db.query(UserOrganization)
            .filter(
                UserOrganization.user_id == user_id,
                UserOrganization.org_id == org_id,
            )
            .first()
        )
        if not user_org:
            raise ValueError(f"用户 {user_id} 与组织 {org_id} 的关联不存在")

        # 清除其他主组织
        self._clear_primary_orgs(user_id)

        # 设置为主组织
        user_org.is_primary = True
        self.db.commit()
        self.db.refresh(user_org)

        logger.info(f"用户 {user_id} 设置主组织: {org_id}")
        return user_org

    def get_user_primary_organization(
        self, user_id: int
    ) -> Optional[UserOrganization]:
        """获取用户的主组织"""
        return (
            self.db.query(UserOrganization)
            .options(joinedload(UserOrganization.organization))
            .filter(
                UserOrganization.user_id == user_id,
                UserOrganization.is_primary == True,
                UserOrganization.status == UserOrganizationStatus.ACTIVE,
            )
            .first()
        )

    def get_user_stats(self, user_id: int) -> Dict[str, Any]:
        """
        获取用户组织统计

        Args:
            user_id: 用户ID

        Returns:
            Dict: 统计信息
        """
        orgs = self.get_user_organizations(user_id, include_inactive=True)

        stats = {
            "total": len(orgs),
            "active": len([o for o in orgs if o.status == UserOrganizationStatus.ACTIVE]),
            "by_role": {},
            "by_source_type": {},
            "primary": None,
        }

        # 按角色统计
        for role in UserOrganizationRole:
            count = len([o for o in orgs if o.role == role])
            if count > 0:
                stats["by_role"][role.value] = count

        # 按来源类型统计
        for source_type in LearningSourceType:
            count = len([o for o in orgs if o.learning_source_type == source_type])
            if count > 0:
                stats["by_source_type"][source_type.value] = count

        # 获取主组织
        primary = next((o for o in orgs if o.is_primary), None)
        if primary:
            stats["primary"] = UserOrganizationResponse.model_validate(primary).model_dump()

        return stats
