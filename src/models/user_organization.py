"""
用户-组织多对多关联数据模型
支持一个用户同时属于多个组织，实现多组织关联模式
"""

import enum
from datetime import date, datetime
from typing import Optional, Dict, Any

from sqlalchemy import (
    Boolean,
    Column,
    Date,
    DateTime,
    Enum,
    ForeignKey,
    Integer,
    String,
    Text,
    JSON,
)
from sqlalchemy.orm import relationship

from utils.database import Base

# 导入学习来源类型枚举（复用）
from models.learning_source import LearningSourceType


class UserOrganizationRole(str, enum.Enum):
    """用户在组织中的角色"""
    STUDENT = "student"           # 学生
    TEACHER = "teacher"           # 教师
    PARENT = "parent"             # 家长
    ADMIN = "admin"               # 管理员
    STAFF = "staff"               # 教职工
    GUARDIAN = "guardian"         # 监护人


class UserOrganizationStatus(str, enum.Enum):
    """用户-组织关联状态"""
    ACTIVE = "active"            # 活动中
    PENDING = "pending"          # 待审核
    INACTIVE = "inactive"        # 已停用
    GRADUATED = "graduated"      # 已毕业/离校
    TRANSFERRED = "transferred"  # 已转出


class UserOrganization(Base):
    """用户-组织多对多关联模型

    替代原有的Student单组织模式，支持：
    - 一个学生同时属于多个学校/机构
    - 区分主组织和次要组织
    - 记录用户在不同组织中的角色和时间范围
    """

    __tablename__ = "user_organizations"

    id = Column(Integer, primary_key=True, index=True)
    
    # 用户ID
    user_id = Column(Integer, ForeignKey("users.id", use_alter=True), nullable=False, index=True)
    
    # 组织ID（自学时为null，表示不隶属于任何组织）
    org_id = Column(Integer, ForeignKey("organizations.id", use_alter=True), nullable=True, index=True)
    
    # 关联的学习来源类型
    learning_source_type = Column(Enum(LearningSourceType), nullable=True, index=True)
    
    # 用户在组织中的角色
    role = Column(Enum(UserOrganizationRole), default=UserOrganizationRole.STUDENT, index=True)
    
    # 是否为主组织（用户的主要学习/工作场所）
    is_primary = Column(Boolean, default=False, index=True)
    
    # 关联状态
    status = Column(Enum(UserOrganizationStatus), default=UserOrganizationStatus.ACTIVE, index=True)
    
    # 在该组织中的身份标识（如：学号、工号、学员号）
    member_id = Column(String(100), nullable=True, index=True)
    
    # 班级/部门信息
    class_name = Column(String(100), nullable=True)
    department = Column(String(100), nullable=True)
    
    # 关联时间范围
    start_date = Column(Date, nullable=True)
    end_date = Column(Date, nullable=True)
    
    # 额外信息（JSON格式）
    extra_data = Column(JSON, default=dict)
    
    # 备注
    notes = Column(Text, nullable=True)
    
    # 系统字段
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # 关联关系
    user = relationship("User", back_populates="user_organizations")
    organization = relationship("Organization", back_populates="user_organizations")

    def __repr__(self):
        return f"<UserOrganization(id={self.id}, user_id={self.user_id}, org_id={self.org_id}, role='{self.role.value}')>"


# 在User模型中添加反向关系
from models.user import User

User.user_organizations = relationship(
    "UserOrganization",
    back_populates="user",
    cascade="all, delete-orphan"
)


# 在Organization模型中添加反向关系
from models.license import Organization

Organization.user_organizations = relationship(
    "UserOrganization",
    back_populates="organization",
    cascade="all, delete-orphan"
)


# ============ Pydantic Schema ============

from pydantic import BaseModel, Field


class UserOrganizationCreate(BaseModel):
    """创建用户-组织关联的请求模型"""
    
    user_id: int = Field(..., description="用户ID")
    org_id: Optional[int] = Field(None, description="组织ID（自学时为null）")
    learning_source_type: Optional[LearningSourceType] = Field(None, description="学习来源类型")
    role: UserOrganizationRole = Field(default=UserOrganizationRole.STUDENT, description="用户角色")
    is_primary: bool = Field(default=False, description="是否为主组织")
    member_id: Optional[str] = Field(None, max_length=100, description="成员ID（如学号）")
    class_name: Optional[str] = Field(None, max_length=100, description="班级")
    department: Optional[str] = Field(None, max_length=100, description="部门")
    start_date: Optional[date] = Field(None, description="加入日期")
    end_date: Optional[date] = Field(None, description="离开日期")
    extra_data: Optional[Dict[str, Any]] = Field(default_factory=dict, description="额外信息")
    notes: Optional[str] = Field(None, description="备注")


class UserOrganizationUpdate(BaseModel):
    """更新用户-组织关联的请求模型"""
    
    org_id: Optional[int] = Field(None, description="组织ID")
    learning_source_type: Optional[LearningSourceType] = Field(None, description="学习来源类型")
    role: Optional[UserOrganizationRole] = Field(None, description="用户角色")
    is_primary: Optional[bool] = Field(None, description="是否为主组织")
    status: Optional[UserOrganizationStatus] = Field(None, description="关联状态")
    member_id: Optional[str] = Field(None, max_length=100, description="成员ID")
    class_name: Optional[str] = Field(None, max_length=100, description="班级")
    department: Optional[str] = Field(None, max_length=100, description="部门")
    start_date: Optional[date] = Field(None, description="加入日期")
    end_date: Optional[date] = Field(None, description="离开日期")
    extra_data: Optional[Dict[str, Any]] = Field(None, description="额外信息")
    is_active: Optional[bool] = Field(None, description="是否激活")
    notes: Optional[str] = Field(None, description="备注")


class UserOrganizationResponse(BaseModel):
    """用户-组织关联响应模型"""
    
    id: int
    user_id: int
    org_id: Optional[int]
    learning_source_type: Optional[LearningSourceType]
    role: UserOrganizationRole
    is_primary: bool
    status: UserOrganizationStatus
    member_id: Optional[str]
    class_name: Optional[str]
    department: Optional[str]
    start_date: Optional[date]
    end_date: Optional[date]
    extra_data: Dict[str, Any]
    is_active: bool
    notes: Optional[str]
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class UserOrganizationListResponse(BaseModel):
    """用户-组织关联列表响应模型"""
    
    total: int = Field(..., description="总数")
    items: list[UserOrganizationResponse] = Field(..., description="关联列表")
