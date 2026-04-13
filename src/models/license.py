"""
许可证管理系统数据模型
包含组织和许可证的核心数据结构
"""

from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
import enum
import re
from typing import Any, Dict, Optional

from sqlalchemy import (
    JSON,
    Boolean,
    Column,
    DateTime,
    Enum,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
)
from sqlalchemy.orm import relationship, validates

from utils.database import Base


class LicenseStatus(str, enum.Enum):
    """许可证状态枚举"""

    ACTIVE = "active"
    EXPIRED = "expired"
    REVOKED = "revoked"
    PENDING = "pending"


class LicenseType(str, enum.Enum):
    """许可证类型枚举"""

    OPEN_SOURCE = "open_source"          # 开源社区版（免费，自行部署）
    WINDOWS_LOCAL = "windows_local"      # Windows 本地版（免费安装 + Token 消耗）
    CLOUD_HOSTED = "cloud_hosted"        # 云托管版（年费¥300 + Token 消耗）
    TRIAL = "trial"                      # 试用版
    COMMERCIAL = "commercial"            # 商业版
    EDUCATION = "education"              # 教育版
    ENTERPRISE = "enterprise"            # 企业定制版


class Organization(Base):
    """组织/机构模型"""

    __tablename__ = "organizations"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    contact_email = Column(String(255), unique=True,
                           nullable=False, index=True)
    phone = Column(String(50), nullable=True)
    address = Column(Text, nullable=True)
    website = Column(String(255), nullable=True)

    # 许可证相关信息
    license_count = Column(Integer, default=0)
    max_users = Column(Integer, default=100)  # 该组织的最大用户数
    current_users = Column(Integer, default=0)  # 当前用户数

    # 赞助相关信息
    total_sponsorship_amount = Column(Float, default=0.0)  # 总赞助金额
    active_sponsorships = Column(Integer, default=0)  # 活跃赞助活动数
    total_brand_exposures = Column(Integer, default=0)  # 总品牌曝光次数
    accumulated_points = Column(Float, default=0.0)  # 累积积分

    # 状态和时间戳
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow,
                        onupdate=datetime.utcnow)

    # 关系
    licenses = relationship(
        "License", back_populates="organization", cascade="all, delete-orphan"
    )
    courses = relationship(
        "Course", back_populates="organization", cascade="all, delete-orphan"
    )
    ar_vr_contents = relationship(
        "ARVRContent", back_populates="organization", cascade="all, delete-orphan"
    )
    course_categories = relationship(
        "CourseCategory", back_populates="organization", cascade="all, delete-orphan"
    )
    configs = relationship(
        "TenantConfig", back_populates="organization", cascade="all, delete-orphan"
    )
    feature_flags = relationship(
        "TenantFeatureFlag", back_populates="organization", cascade="all, delete-orphan"
    )
    resource_quotas = relationship(
        "TenantResourceQuota",
        back_populates="organization",
        cascade="all, delete-orphan",
    )
    materials = relationship(
        "UnifiedMaterial", back_populates="organization", cascade="all, delete-orphan"
    )
    # 暂时注释掉sponsorships关系以避免循环依赖问题
    # sponsorships = relationship(
    #     "models.sponsorship.Sponsorship", back_populates="organization", cascade="all, delete-orphan"
    # )

    def __repr__(self):
        return f"<Organization(id={self.id}, name='{self.name}', email='{self.contact_email}')>"

    @validates("contact_email")
    def validate_email(self, key, email):
        """验证邮箱格式"""
        if email:
            pattern = r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
            if not re.match(pattern, email):
                raise ValueError("无效的邮箱格式")
        return email

    @validates("name")
    def validate_name(self, key, name):
        """验证组织名称"""
        if not name or len(name.strip()) < 2:
            raise ValueError("组织名称至少需要2个字符")
        return name.strip()


class License(Base):
    """许可证模型"""

    __tablename__ = "licenses"

    id = Column(Integer, primary_key=True, index=True)
    license_key = Column(String(255), unique=True, nullable=False, index=True)
    organization_id = Column(Integer, ForeignKey(
        "organizations.id"), nullable=False)
    product_id = Column(
        Integer, ForeignKey("products.id"), nullable=True
    )  # 如果有产品概念

    # 许可证基本信息
    license_type = Column(Enum(LicenseType), default=LicenseType.COMMERCIAL)
    status = Column(Enum(LicenseStatus), default=LicenseStatus.PENDING)

    # 时间信息
    issued_at = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime, nullable=False)
    activated_at = Column(DateTime, nullable=True)

    # 使用限制
    max_users = Column(Integer, default=1)
    max_devices = Column(Integer, default=1)
    current_users = Column(Integer, default=0)
    current_devices = Column(Integer, default=0)

    # 功能特性
    features = Column(JSON, default=list)  # 允许的功能列表
    restrictions = Column(JSON, default=dict)  # 限制条件

    # 元数据
    custom_metadata = Column(JSON, default=dict)
    notes = Column(Text, nullable=True)

    # 状态和时间戳
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow,
                        onupdate=datetime.utcnow)

    # 关系
    organization = relationship("Organization", back_populates="licenses")

    def __repr__(self):
        return (
            f"<License(id={self.id}, key='{self.license_key}', status='{self.status}')>"
        )

    @property
    def is_expired(self) -> bool:
        """检查许可证是否过期"""
        return datetime.utcnow() > self.expires_at

    @property
    def is_valid(self) -> bool:
        """检查许可证是否有效"""
        return (
            self.status == LicenseStatus.ACTIVE
            and not self.is_expired
            and self.is_active
        )

    @property
    def days_until_expiry(self) -> Optional[int]:
        """距离过期的天数"""
        if self.expires_at:
            delta = self.expires_at - datetime.utcnow()
            return max(0, delta.days)
        return None

    @validates("license_key")
    def validate_license_key(self, key, license_key):
        """验证许可证密钥格式"""
        if not license_key or len(license_key) < 10:
            raise ValueError("许可证密钥长度至少10个字符")
        # 可以添加更多验证规则
        return license_key

    @validates("max_users")
    def validate_max_users(self, key, max_users):
        """验证最大用户数"""
        if max_users < 1:
            raise ValueError("最大用户数必须大于0")
        if max_users > 100000:  # 设置上限
            raise ValueError("最大用户数不能超过100000")
        return max_users


class LicenseActivityLog(Base):
    """许可证活动日志模型"""

    __tablename__ = "license_activity_logs"

    id = Column(Integer, primary_key=True, index=True)
    license_key = Column(String(255), nullable=False, index=True)
    organization_id = Column(Integer, ForeignKey(
        "organizations.id"), nullable=False)

    # 活动信息
    activity_type = Column(
        String(50), nullable=False
    )  # validate, activate, revoke, etc.
    activity_description = Column(Text, nullable=True)
    ip_address = Column(String(45), nullable=True)  # 支持IPv6
    user_agent = Column(Text, nullable=True)

    # 详细信息
    details = Column(JSON, default=dict)

    # 时间戳
    created_at = Column(DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f"<LicenseActivityLog(id={self.id}, type='{self.activity_type}', license='{self.license_key}')>"


class LicenseValidationAttempt(Base):
    """许可证验证尝试记录"""

    __tablename__ = "license_validation_attempts"

    id = Column(Integer, primary_key=True, index=True)
    license_key = Column(String(255), nullable=False, index=True)

    # 验证信息
    ip_address = Column(String(45), nullable=True)
    user_agent = Column(Text, nullable=True)
    is_valid = Column(Boolean, nullable=False)
    validation_result = Column(JSON, default=dict)  # 验证详情

    # 时间戳
    created_at = Column(DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f"<LicenseValidationAttempt(id={self.id}, valid={self.is_valid})>"


# Pydantic模型用于API请求/响应


class OrganizationCreate(BaseModel):
    """创建组织的请求模型"""

    name: str = Field(..., min_length=2, max_length=255)
    contact_email: str = Field(...)
    phone: Optional[str] = None
    address: Optional[str] = None
    website: Optional[str] = None
    max_users: int = Field(default=100, ge=1, le=100000)


class OrganizationUpdate(BaseModel):
    """更新组织的请求模型"""

    name: Optional[str] = Field(None, min_length=2, max_length=255)
    contact_email: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    website: Optional[str] = None
    max_users: Optional[int] = Field(None, ge=1, le=100000)
    is_active: Optional[bool] = None


class LicenseCreate(BaseModel):
    """创建许可证的请求模型"""

    organization_id: int
    product_id: Optional[int] = None
    license_type: LicenseType = LicenseType.COMMERCIAL
    duration_days: int = Field(default=365, ge=1, le=3650)  # 1天到10年
    max_users: int = Field(default=1, ge=1, le=100000)
    max_devices: int = Field(default=1, ge=1, le=100000)
    features: List[str] = Field(default_factory=list)
    notes: Optional[str] = None


class LicenseUpdate(BaseModel):
    """更新许可证的请求模型"""

    status: Optional[LicenseStatus] = None
    max_users: Optional[int] = Field(None, ge=1, le=100000)
    max_devices: Optional[int] = Field(None, ge=1, le=100000)
    features: Optional[List[str]] = None
    notes: Optional[str] = None
    is_active: Optional[bool] = None


class LicenseResponse(BaseModel):
    """许可证响应模型"""

    id: int
    license_key: str
    organization_id: int
    product_id: Optional[int]
    license_type: LicenseType
    status: LicenseStatus
    issued_at: datetime
    expires_at: datetime
    activated_at: Optional[datetime]
    max_users: int
    max_devices: int
    current_users: int
    current_devices: int
    features: List[str]
    restrictions: Dict[str, Any]
    metadata: Dict[str, Any]
    notes: Optional[str]
    is_active: bool
    created_at: datetime
    updated_at: datetime
    is_expired: bool
    is_valid: bool
    days_until_expiry: Optional[int]

    class Config:
        orm_mode = True


class OrganizationResponse(BaseModel):
    """组织响应模型"""

    id: int
    name: str
    contact_email: str
    phone: Optional[str]
    address: Optional[str]
    website: Optional[str]
    license_count: int
    max_users: int
    current_users: int

    # 赞助相关信息
    total_sponsorship_amount: float
    active_sponsorships: int
    total_brand_exposures: int
    accumulated_points: float
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
