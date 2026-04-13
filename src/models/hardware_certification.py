"""
硬件认证相关数据模型
"""

from datetime import datetime
from enum import Enum
from typing import Dict, List, Optional

from pydantic import BaseModel


class CertificationStatus(str, Enum):
    """认证状态枚举"""

    PENDING = "pending"  # 待认证
    CERTIFIED = "certified"  # 已认证
    FAILED = "failed"  # 认证失败
    EXPIRED = "expired"  # 已过期


class TestCategory(str, Enum):
    """测试类别枚举"""

    FUNCTIONALITY = "functionality"  # 功能测试
    PERFORMANCE = "performance"  # 性能测试
    COMPATIBILITY = "compatibility"  # 兼容性测试
    SECURITY = "security"  # 安全测试
    RELIABILITY = "reliability"  # 可靠性测试


class TestResult(BaseModel):
    """单个测试结果"""

    test_id: str  # 测试ID
    category: TestCategory  # 测试类别
    name: str  # 测试名称
    description: str  # 测试描述
    status: str  # 测试状态 (pass/fail/skip)
    duration_ms: Optional[int]  # 执行时间(毫秒)
    error_message: Optional[str]  # 错误信息
    timestamp: datetime  # 测试时间戳


class CertificationRequest(BaseModel):
    """认证请求模型"""

    hw_id: str  # 硬件ID
    device_info: Dict[str, str]  # 设备信息
    test_results: List[TestResult]  # 测试结果列表
    firmware_version: str  # 固件版本
    hardware_version: str  # 硬件版本
    submitted_by: Optional[str]  # 提交者(可选)


class CertificationResponse(BaseModel):
    """认证响应模型"""

    hw_id: str  # 硬件ID
    status: CertificationStatus  # 认证状态
    badge_url: Optional[str]  # 徽章URL
    certified_at: Optional[datetime]  # 认证时间
    expires_at: Optional[datetime]  # 过期时间
    test_summary: Dict[str, int]  # 测试摘要统计
    failed_tests: List[TestResult]  # 失败的测试列表
    certificate_id: Optional[str]  # 证书ID


class BadgeStyle(str, Enum):
    """徽章样式枚举"""

    STANDARD = "standard"  # 标准样式
    COMPACT = "compact"  # 紧凑样式
    DETAILED = "detailed"  # 详细样式


class BadgeConfig(BaseModel):
    """徽章配置模型"""

    style: BadgeStyle = BadgeStyle.STANDARD
    show_timestamp: bool = True
    show_version: bool = True
    show_test_count: bool = True
    width: Optional[int] = None
    height: Optional[int] = None
    primary_color: str = "#2196f3"  # 主色调
    secondary_color: str = "#4caf50"  # 辅助色调


# 数据库模型（如果需要持久化存储）
class HardwareCertificationDB:
    """硬件认证数据库模型（简化版）"""

    def __init__(self):
        self.hw_id: str = ""
        self.status: CertificationStatus = CertificationStatus.PENDING
        self.device_info: Dict[str, str] = {}
        self.test_results: List[TestResult] = []
        self.firmware_version: str = ""
        self.hardware_version: str = ""
        self.submitted_by: Optional[str] = None
        self.certified_at: Optional[datetime] = None
        self.expires_at: Optional[datetime] = None
        self.certificate_id: Optional[str] = None
        self.created_at: datetime = datetime.utcnow()
        self.updated_at: datetime = datetime.utcnow()

    def to_dict(self) -> dict:
        """转换为字典格式"""
        return {
            "hw_id": self.hw_id,
            "status": self.status.value,
            "device_info": self.device_info,
            "test_results": [result.dict() for result in self.test_results],
            "firmware_version": self.firmware_version,
            "hardware_version": self.hardware_version,
            "submitted_by": self.submitted_by,
            "certified_at": (
                self.certified_at.isoformat() if self.certified_at else None
            ),
            "expires_at": self.expires_at.isoformat() if self.expires_at else None,
            "certificate_id": self.certificate_id,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
        }

    @classmethod
    def from_dict(cls, data: dict) -> "HardwareCertificationDB":
        """从字典创建实例"""
        instance = cls()
        instance.hw_id = data.get("hw_id", "")
        instance.status = CertificationStatus(
            data.get("status", CertificationStatus.PENDING)
        )
        instance.device_info = data.get("device_info", {})
        instance.test_results = [
            TestResult(**result) for result in data.get("test_results", [])
        ]
        instance.firmware_version = data.get("firmware_version", "")
        instance.hardware_version = data.get("hardware_version", "")
        instance.submitted_by = data.get("submitted_by")
        instance.certified_at = (
            datetime.fromisoformat(data["certified_at"])
            if data.get("certified_at")
            else None
        )
        instance.expires_at = (
            datetime.fromisoformat(data["expires_at"])
            if data.get("expires_at")
            else None
        )
        instance.certificate_id = data.get("certificate_id")
        instance.created_at = (
            datetime.fromisoformat(data["created_at"])
            if data.get("created_at")
            else datetime.utcnow()
        )
        instance.updated_at = (
            datetime.fromisoformat(data["updated_at"])
            if data.get("updated_at")
            else datetime.utcnow()
        )
        return instance
