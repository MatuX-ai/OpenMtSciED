"""
用户与许可证关联模型
"""

from sqlalchemy import Boolean, Column, DateTime, Enum, ForeignKey, Integer, Float, String, Text, JSON
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime
import enum
from typing import Optional, List

from sqlalchemy import Boolean, Column, DateTime, Enum, ForeignKey, Integer
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from database import Base


class UserRole(str, enum.Enum):
    """用户角色枚举"""

    USER = "user"  # 普通用户
    ADMIN = "admin"  # 系统管理员
    ORG_ADMIN = "org_admin"  # 企业管理员
    PREMIUM = "premium"  # 高级用户


class UserLicenseStatus(str, enum.Enum):
    """用户许可证状态枚举"""

    ACTIVE = "active"  # 激活
    INACTIVE = "inactive"  # 未激活
    EXPIRED = "expired"  # 已过期
    REVOKED = "revoked"  # 已撤销


class UserLicense(Base):
    """用户与许可证关联表"""

    __tablename__ = "user_licenses"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"),
                     nullable=False, index=True)
    license_id = Column(Integer, ForeignKey(
        "licenses.id"), nullable=False, index=True)

    # 关联信息
    role = Column(
        Enum(UserRole), default=UserRole.USER, nullable=False
    )  # 用户在此许可证中的角色
    status = Column(Enum(UserLicenseStatus),
                    default=UserLicenseStatus.INACTIVE)

    # 使用权限
    can_manage = Column(Boolean, default=False)  # 是否可以管理此许可证
    can_view = Column(Boolean, default=True)  # 是否可以查看此许可证
    can_use = Column(Boolean, default=True)  # 是否可以使用此许可证功能

    # 元数据
    assigned_by = Column(Integer, ForeignKey("users.id"))  # 分配者ID
    assigned_at = Column(DateTime, default=func.now())
    expires_at = Column(DateTime, nullable=True)  # 特定用户的过期时间

    # 时间戳
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

    # 关系
    user = relationship("User", foreign_keys=[user_id])
    license = relationship("License")
    assigner = relationship("User", foreign_keys=[assigned_by])
    # 硬件租赁关系
    hardware_rentals = relationship(
        "ModuleRentalRecord",
        back_populates="user_license",
        cascade="all, delete-orphan",
    )

    def __repr__(self):
        return f"<UserLicense(user_id={self.user_id}, license_id={self.license_id}, role='{self.role}')>"

    @property
    def is_expired(self) -> bool:
        """检查用户许可证是否过期"""
        if self.expires_at:
            return datetime.utcnow() > self.expires_at
        # 如果没有特定过期时间，则检查许可证本身是否过期
        if self.license:
            return self.license.is_expired
        return False

    @property
    def is_accessible(self) -> bool:
        """检查用户是否可以访问此许可证"""
        return (
            self.status == UserLicenseStatus.ACTIVE
            and not self.is_expired
            and self.can_view
        )

    @property
    def active_hardware_rentals(self) -> List:
        """获取用户当前活跃的硬件租赁记录"""
        from datetime import datetime

        return [
            record
            for record in self.hardware_rentals
            if record.status == "active"
            and (
                record.actual_return_date is None
                or record.actual_return_date > datetime.utcnow()
            )
        ]

    @property
    def hardware_rental_limit(self) -> int:
        """获取用户硬件租赁限额（基于许可证类型）"""
        # 根据许可证类型设置不同的租赁限额
        if self.license and self.license.license_type:
            limits = {
                "trial": 1,  # 试用版：1个
                "commercial": 5,  # 商业版：5个
                "education": 10,  # 教育版：10个
                "enterprise": 20,  # 企业版：20个
            }
            return limits.get(self.license.license_type.value, 1)
        return 1

    @property
    def can_rent_more_hardware(self) -> bool:
        """检查用户是否还能租赁更多硬件"""
        return len(self.active_hardware_rentals) < self.hardware_rental_limit


# 扩展用户模型的 Pydantic 模型


class UserLicenseResponse(BaseModel):
    """用户许可证响应模型"""

    id: int
    user_id: int
    license_id: int
    role: UserRole
    status: UserLicenseStatus
    can_manage: bool
    can_view: bool
    can_use: bool
    assigned_by: Optional[int]
    assigned_at: datetime
    expires_at: Optional[datetime]
    created_at: datetime
    updated_at: datetime
    is_expired: bool
    is_accessible: bool

    # 关联对象信息
    license_key: Optional[str]
    organization_name: Optional[str]

    model_config = {"from_attributes": True}


class AssignUserLicenseRequest(BaseModel):
    """分配用户许可证请求模型"""

    user_id: int
    license_id: int
    role: UserRole = UserRole.USER
    can_manage: bool = False
    can_use: bool = True
    expires_at: Optional[datetime] = None


class UpdateUserLicenseRequest(BaseModel):
    """更新用户许可证请求模型"""

    role: Optional[UserRole] = None
    status: Optional[UserLicenseStatus] = None
    can_manage: Optional[bool] = None
    can_use: Optional[bool] = None
    can_view: Optional[bool] = None
    expires_at: Optional[datetime] = None


class HardwareRentalSummary(BaseModel):
    """用户硬件租赁摘要信息"""

    total_rentals: int
    active_rentals: int
    overdue_rentals: int
    total_spent: float
    pending_deposit: float
    rental_limit: int
    can_rent_more: bool

    model_config = {"from_attributes": True}


# ==================== Token 计费系统模型 ====================


class TokenPackageType(str, enum.Enum):
    """Token 套餐类型枚举"""

    FREE = "free"              # 免费版（每月赠送）
    STANDARD = "standard"      # 标准包
    PREMIUM = "premium"        # 高级包
    ENTERPRISE = "enterprise"  # 企业包


class TokenPackage(Base):
    """Token 套餐包模型"""

    __tablename__ = "token_packages"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)  # 套餐名称
    package_type = Column(Enum(TokenPackageType),
                          default=TokenPackageType.STANDARD)

    # Token 数量
    token_count = Column(Integer, nullable=False)  # 包含的 Token 数量
    price = Column(Float, nullable=False)  # 价格（元）

    # 有效期
    valid_days = Column(Integer, default=365)  # 有效天数

    # 额外权益
    bonus_features = Column(JSON, default=list)  # 额外功能列表

    # 状态
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

    def __repr__(self):
        return f"<TokenPackage(id={self.id}, name='{self.name}', tokens={self.token_count})>"


class UserTokenBalance(Base):
    """用户 Token 余额模型"""

    __tablename__ = "user_token_balances"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"),
                     nullable=False, unique=True)

    # Token 余额
    total_tokens = Column(Integer, default=0)  # 累计购买的 Token
    used_tokens = Column(Integer, default=0)  # 已使用的 Token
    remaining_tokens = Column(Integer, default=0)  # 剩余可用 Token

    # 每月赠送 Token（仅针对云托管版）
    monthly_bonus_tokens = Column(Integer, default=0)
    last_bonus_date = Column(DateTime, nullable=True)  # 上次领取时间

    # 时间戳
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

    # 关系
    user = relationship("User")
    recharge_records = relationship(
        "TokenRechargeRecord",
        back_populates="user_balance",
        cascade="all, delete-orphan"
    )
    usage_records = relationship(
        "TokenUsageRecord",
        back_populates="user_balance",
        cascade="all, delete-orphan"
    )

    def __repr__(self):
        return f"<UserTokenBalance(user_id={self.user_id}, remaining={self.remaining_tokens})>"

    @property
    def can_use_ai_features(self) -> bool:
        """检查是否可以使用 AI 功能"""
        return self.remaining_tokens > 0


class TokenRechargeRecord(Base):
    """Token 充值记录"""

    __tablename__ = "token_recharge_records"

    id = Column(Integer, primary_key=True, index=True)
    user_balance_id = Column(Integer, ForeignKey(
        "user_token_balances.id"), nullable=False)

    # 充值信息
    package_id = Column(Integer, ForeignKey(
        "token_packages.id"), nullable=True)
    token_amount = Column(Integer, nullable=False)  # 充值 Token 数量
    payment_amount = Column(Float, nullable=False)  # 支付金额

    # 支付方式
    payment_method = Column(String(50))  # wechat, alipay, etc.
    # pending, success, failed
    payment_status = Column(String(20), default="pending")
    payment_time = Column(DateTime, nullable=True)

    # 订单号
    order_no = Column(String(100), unique=True, nullable=False)

    # 时间戳
    created_at = Column(DateTime, default=func.now())

    # 关系
    user_balance = relationship(
        "UserTokenBalance", back_populates="recharge_records")
    package = relationship("TokenPackage")

    def __repr__(self):
        return f"<TokenRechargeRecord(order_no='{self.order_no}', tokens={self.token_amount})>"


class TokenUsageRecord(Base):
    """Token 使用记录"""

    __tablename__ = "token_usage_records"

    id = Column(Integer, primary_key=True, index=True)
    user_balance_id = Column(Integer, ForeignKey(
        "user_token_balances.id"), nullable=False)

    # 使用信息
    token_amount = Column(Integer, nullable=False)  # 消耗的 Token 数量

    # 使用场景
    # ai_teacher, course_generation, etc.
    usage_type = Column(String(50), nullable=False)
    usage_description = Column(Text, nullable=True)  # 使用描述

    # 关联资源
    resource_id = Column(Integer, nullable=True)  # 关联的资源 ID
    # 资源类型（course, quiz, etc.）
    resource_type = Column(String(50), nullable=True)

    # 时间戳
    created_at = Column(DateTime, default=func.now())

    # 关系
    user_balance = relationship(
        "UserTokenBalance", back_populates="usage_records")

    def __repr__(self):
        return f"<TokenUsageRecord(type='{self.usage_type}', tokens={self.token_amount})>"
