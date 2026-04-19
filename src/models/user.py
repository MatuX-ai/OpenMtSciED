"""
用户模型
"""

import enum
from typing import List

from passlib.context import CryptContext
from sqlalchemy import Boolean, Column, DateTime, Enum, Integer, String
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from utils.database import Base

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class UserRole(str, enum.Enum):
    """用户角色枚举"""

    USER = "user"  # 普通用户
    ADMIN = "admin"  # 系统管理员
    ORG_ADMIN = "org_admin"  # 企业管理员
    PREMIUM = "premium"  # 高级用户


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=True)
    email = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column("password_hash", String(100), nullable=True)  # 映射到数据库的 password_hash 字段
    role = Column(String(50), default="user")  # 用户角色（字符串类型）
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    @property
    def is_superuser(self) -> bool:
        """兼容属性：检查用户是否为超级用户（admin 或 superuser 角色）"""
        return self.role in ["admin", "superuser"]

    # 关系
    created_materials = relationship(
        "UnifiedMaterial",
        foreign_keys="UnifiedMaterial.created_by",
        back_populates="creator"
    )
    updated_materials = relationship(
        "UnifiedMaterial",
        foreign_keys="UnifiedMaterial.updated_by",
        back_populates="updater"
    )

    # RBAC角色关系（通过user_roles关联表）
    roles = relationship(
        "Role",
        secondary="user_roles",
        back_populates="users",
        primaryjoin="User.id == user_roles.c.user_id",
        secondaryjoin="Role.id == user_roles.c.role_id",
        lazy="selectin"  # 使用selectin加载以避免N+1查询
    )

    def verify_password(self, password: str) -> bool:
        """验证密码"""
        return pwd_context.verify(password, self.hashed_password)

    def set_password(self, password: str) -> None:
        """设置密码"""
        self.hashed_password = pwd_context.hash(password)

    @classmethod
    def create_hashed_password(cls, password: str) -> str:
        """创建哈希密码"""
        return pwd_context.hash(password)

    def to_dict(self) -> dict:
        """转换为字典"""
        return {
            "id": self.id,
            "username": self.username,
            "email": self.email,
            "role": self.role.value if self.role else None,
            "is_active": self.is_active,
            "is_superuser": self.is_superuser,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }

    def to_detail_dict(self) -> dict:
        """转换为详细字典（包含更多信息）"""
        base_dict = self.to_dict()
        # 可以在这里添加更多用户相关信息
        return base_dict

    def has_role(self, role: UserRole) -> bool:
        """检查用户是否具有指定角色"""
        return self.role == role

    def has_any_role(self, roles: List[UserRole]) -> bool:
        """检查用户是否具有任意一个角色"""
        return self.role in roles

    def can_manage_licenses(self) -> bool:
        """检查用户是否可以管理许可证"""
        return self.role in [UserRole.ADMIN, UserRole.ORG_ADMIN]

    def is_admin(self) -> bool:
        """检查用户是否是管理员"""
        return self.role in [UserRole.ADMIN, UserRole.ORG_ADMIN] or self.is_superuser

    # RBAC相关方法
    def get_roles(self) -> List["Role"]:
        """获取用户的所有角色（新RBAC系统）"""
        # 如果有新的角色关联，从user_roles表获取
        if hasattr(self, "roles") and self.roles:
            return [role for role in self.roles if role.is_active]
        return []

    def get_permissions(self) -> List["Permission"]:
        """获取用户的所有权限"""
        permissions = set()
        # 获取角色对应的权限
        for role in self.get_roles():
            permissions.update(role.permissions)
        return list(permissions)

    def has_permission(self, permission_code: str) -> bool:
        """检查用户是否具有指定权限"""
        permissions = self.get_permissions()
        return any(perm.code == permission_code for perm in permissions)

    def has_any_permission(self, permission_codes: List[str]) -> bool:
        """检查用户是否具有任意一个权限"""
        user_permissions = {perm.code for perm in self.get_permissions()}
        return bool(user_permissions.intersection(set(permission_codes)))

    def has_all_permissions(self, permission_codes: List[str]) -> bool:
        """检查用户是否具有所有指定权限"""
        user_permissions = {perm.code for perm in self.get_permissions()}
        return user_permissions.issuperset(set(permission_codes))
