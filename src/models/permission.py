"""
权限系统模型定义
实现RBAC（基于角色的访问控制）权限管理
"""

import enum

from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    ForeignKey,
    Integer,
    String,
    Table,
    Text,
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from utils.database import Base


class PermissionCategory(str, enum.Enum):
    """权限分类枚举"""

    SYSTEM = "system"  # 系统管理
    USER = "user"  # 用户管理
    LICENSE = "license"  # 许可证管理
    COURSE = "course"  # 课程管理
    PAYMENT = "payment"  # 支付管理
    AI = "ai"  # AI服务
    REPORT = "report"  # 报表统计
    CONFIG = "config"  # 配置管理


class PermissionAction(str, enum.Enum):
    """权限操作枚举"""

    CREATE = "create"  # 创建
    READ = "read"  # 读取
    UPDATE = "update"  # 更新
    DELETE = "delete"  # 删除
    MANAGE = "manage"  # 管理
    VIEW = "view"  # 查看
    EXPORT = "export"  # 导出
    IMPORT = "import"  # 导入


class Permission(Base):
    """权限模型"""

    __tablename__ = "permissions"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, index=True, nullable=False)  # 权限名称
    code = Column(String(100), unique=True, index=True, nullable=False)  # 权限代码
    description = Column(Text)  # 权限描述
    category = Column(String(50), nullable=False)  # 权限分类
    action = Column(String(50), nullable=False)  # 权限操作
    resource = Column(String(100))  # 资源标识
    is_active = Column(Boolean, default=True)  # 是否激活
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # 关联关系
    roles = relationship(
        "Role", secondary="role_permissions", back_populates="permissions"
    )

    def to_dict(self) -> dict:
        """转换为字典"""
        return {
            "id": self.id,
            "name": self.name,
            "code": self.code,
            "description": self.description,
            "category": self.category,
            "action": self.action,
            "resource": self.resource,
            "is_active": self.is_active,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }

    def __repr__(self):
        return f"<Permission(id={self.id}, code='{self.code}', name='{self.name}')>"


class Role(Base):
    """角色模型"""

    __tablename__ = "roles"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), unique=True, index=True, nullable=False)  # 角色名称
    code = Column(String(50), unique=True, index=True, nullable=False)  # 角色代码
    description = Column(Text)  # 角色描述
    is_system = Column(Boolean, default=False)  # 是否系统角色
    is_active = Column(Boolean, default=True)  # 是否激活
    priority = Column(Integer, default=0)  # 角色优先级
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # 关联关系
    permissions = relationship(
        "Permission", secondary="role_permissions", back_populates="roles"
    )
    users = relationship(
        "User",
        secondary="user_roles",
        back_populates="roles",
        primaryjoin="Role.id == user_roles.c.role_id",
        secondaryjoin="User.id == user_roles.c.user_id"
    )

    def to_dict(self) -> dict:
        """转换为字典"""
        return {
            "id": self.id,
            "name": self.name,
            "code": self.code,
            "description": self.description,
            "is_system": self.is_system,
            "is_active": self.is_active,
            "priority": self.priority,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }

    def __repr__(self):
        return f"<Role(id={self.id}, code='{self.code}', name='{self.name}')>"


# 角色权限关联表
role_permissions = Table(
    "role_permissions",
    Base.metadata,
    Column("role_id", Integer, ForeignKey("roles.id"), primary_key=True),
    Column("permission_id", Integer, ForeignKey("permissions.id"), primary_key=True),
    Column("created_at", DateTime(timezone=True), server_default=func.now()),
)


# 用户角色关联表
user_roles = Table(
    "user_roles",
    Base.metadata,
    Column("user_id", Integer, ForeignKey("users.id"), primary_key=True),
    Column("role_id", Integer, ForeignKey("roles.id"), primary_key=True),
    Column("assigned_by", Integer, ForeignKey("users.id")),  # 分配者
    Column("assigned_at", DateTime(timezone=True), server_default=func.now()),
    Column("expires_at", DateTime(timezone=True)),  # 过期时间
    Column("is_active", Boolean, default=True),
)


class UserRoleAssignment(Base):
    """用户角色分配详情模型（用于记录分配历史）"""

    __tablename__ = "user_role_assignments"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    role_id = Column(Integer, ForeignKey("roles.id"), nullable=False)
    assigned_by = Column(Integer, ForeignKey("users.id"))  # 分配者
    assigned_at = Column(DateTime(timezone=True), server_default=func.now())  # 分配时间
    expires_at = Column(DateTime(timezone=True))  # 过期时间
    revoked_at = Column(DateTime(timezone=True))  # 撤销时间
    revoked_by = Column(Integer, ForeignKey("users.id"))  # 撤销者
    is_active = Column(Boolean, default=True)  # 是否激活
    reason = Column(Text)  # 分配原因

    # 关联关系
    user = relationship("User", foreign_keys=[user_id])
    role = relationship("Role")
    assigner = relationship("User", foreign_keys=[assigned_by])
    revoker = relationship("User", foreign_keys=[revoked_by])

    def to_dict(self) -> dict:
        """转换为字典"""
        return {
            "id": self.id,
            "user_id": self.user_id,
            "role_id": self.role_id,
            "assigned_by": self.assigned_by,
            "assigned_at": self.assigned_at.isoformat() if self.assigned_at else None,
            "expires_at": self.expires_at.isoformat() if self.expires_at else None,
            "revoked_at": self.revoked_at.isoformat() if self.revoked_at else None,
            "revoked_by": self.revoked_by,
            "is_active": self.is_active,
            "reason": self.reason,
        }


class PermissionLog(Base):
    """权限变更日志模型"""

    __tablename__ = "permission_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))  # 操作用户
    target_user_id = Column(Integer, ForeignKey("users.id"))  # 目标用户
    action_type = Column(String(50), nullable=False)  # 操作类型
    resource_type = Column(String(50), nullable=False)  # 资源类型
    resource_id = Column(Integer)  # 资源ID
    permission_code = Column(String(100))  # 权限代码
    role_code = Column(String(50))  # 角色代码
    old_value = Column(Text)  # 旧值
    new_value = Column(Text)  # 新值
    ip_address = Column(String(45))  # IP地址
    user_agent = Column(Text)  # 用户代理
    description = Column(Text)  # 描述
    created_at = Column(DateTime(timezone=True), server_default=func.now())  # 创建时间

    # 关联关系
    user = relationship("User", foreign_keys=[user_id])
    target_user = relationship("User", foreign_keys=[target_user_id])

    def to_dict(self) -> dict:
        """转换为字典"""
        return {
            "id": self.id,
            "user_id": self.user_id,
            "target_user_id": self.target_user_id,
            "action_type": self.action_type,
            "resource_type": self.resource_type,
            "resource_id": self.resource_id,
            "permission_code": self.permission_code,
            "role_code": self.role_code,
            "old_value": self.old_value,
            "new_value": self.new_value,
            "ip_address": self.ip_address,
            "user_agent": self.user_agent,
            "description": self.description,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


# 预定义的系统权限
SYSTEM_PERMISSIONS = [
    # 系统管理权限
    {
        "code": "system.admin",
        "name": "系统管理",
        "category": "system",
        "action": "manage",
    },
    {
        "code": "system.config",
        "name": "系统配置",
        "category": "config",
        "action": "manage",
    },
    {
        "code": "system.logs",
        "name": "查看系统日志",
        "category": "system",
        "action": "view",
    },
    # 用户管理权限
    {"code": "user.create", "name": "创建用户", "category": "user", "action": "create"},
    {"code": "user.read", "name": "查看用户", "category": "user", "action": "read"},
    {"code": "user.update", "name": "编辑用户", "category": "user", "action": "update"},
    {"code": "user.delete", "name": "删除用户", "category": "user", "action": "delete"},
    {
        "code": "user.manage_roles",
        "name": "管理用户角色",
        "category": "user",
        "action": "manage",
    },
    # 许可证管理权限
    {
        "code": "license.create",
        "name": "创建许可证",
        "category": "license",
        "action": "create",
    },
    {
        "code": "license.read",
        "name": "查看许可证",
        "category": "license",
        "action": "read",
    },
    {
        "code": "license.update",
        "name": "编辑许可证",
        "category": "license",
        "action": "update",
    },
    {
        "code": "license.delete",
        "name": "删除许可证",
        "category": "license",
        "action": "delete",
    },
    {
        "code": "license.assign",
        "name": "分配许可证",
        "category": "license",
        "action": "manage",
    },
    # 课程管理权限
    {
        "code": "course.create",
        "name": "创建课程",
        "category": "course",
        "action": "create",
    },
    {"code": "course.read", "name": "查看课程", "category": "course", "action": "read"},
    {
        "code": "course.update",
        "name": "编辑课程",
        "category": "course",
        "action": "update",
    },
    {
        "code": "course.delete",
        "name": "删除课程",
        "category": "course",
        "action": "delete",
    },
    # 支付管理权限
    {
        "code": "payment.read",
        "name": "查看支付记录",
        "category": "payment",
        "action": "read",
    },
    {
        "code": "payment.refund",
        "name": "退款操作",
        "category": "payment",
        "action": "manage",
    },
    # AI服务权限
    {"code": "ai.use", "name": "使用AI服务", "category": "ai", "action": "use"},
    {"code": "ai.manage", "name": "管理AI服务", "category": "ai", "action": "manage"},
    # 报表统计权限
    {"code": "report.view", "name": "查看报表", "category": "report", "action": "view"},
    {
        "code": "report.export",
        "name": "导出报表",
        "category": "report",
        "action": "export",
    },
]

# 预定义的角色
SYSTEM_ROLES = [
    {
        "code": "super_admin",
        "name": "超级管理员",
        "description": "拥有系统全部权限",
        "is_system": True,
        "priority": 100,
        "permissions": [perm["code"] for perm in SYSTEM_PERMISSIONS],
    },
    {
        "code": "admin",
        "name": "管理员",
        "description": "管理系统主要功能",
        "is_system": True,
        "priority": 90,
        "permissions": [
            "user.read",
            "user.update",
            "user.manage_roles",
            "license.read",
            "license.update",
            "license.assign",
            "course.read",
            "course.update",
            "payment.read",
            "report.view",
        ],
    },
    {
        "code": "org_admin",
        "name": "企业管理员",
        "description": "管理企业相关功能",
        "is_system": True,
        "priority": 80,
        "permissions": ["user.read", "license.read", "course.read", "report.view"],
    },
    {
        "code": "teacher",
        "name": "教师",
        "description": "课程教学相关权限",
        "is_system": True,
        "priority": 50,
        "permissions": ["course.create", "course.read", "course.update", "ai.use"],
    },
    {
        "code": "student",
        "name": "学生",
        "description": "学习相关权限",
        "is_system": True,
        "priority": 30,
        "permissions": ["course.read", "ai.use"],
    },
]
