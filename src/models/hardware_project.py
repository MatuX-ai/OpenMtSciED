"""
硬件项目数据模型
支持低成本STEM硬件项目的管理、材料清单、代码模板等功能
"""

import enum
from typing import List, Optional

from sqlalchemy import (
    JSON,
    Boolean,
    Column,
    DateTime,
    Enum as SQLEnum,
    Float,
    ForeignKey,
    Index,
    Integer,
    String,
    Text,
    func,
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func as sql_func

from database.db import Base


# ==================== 枚举类型 ====================


class HardwareCategory(str, enum.Enum):
    """硬件项目分类"""

    ELECTRONICS = "electronics"  # 电子电路
    ROBOTICS = "robotics"  # 机器人
    IOT = "iot"  # 物联网
    MECHANICAL = "mechanical"  # 机械结构
    SMART_HOME = "smart_home"  # 智能家居
    SENSOR = "sensor"  # 传感器应用
    COMMUNICATION = "communication"  # 通信技术


class CodeLanguage(str, enum.Enum):
    """编程语言类型"""

    ARDUINO = "arduino"  # Arduino C++
    PYTHON = "python"  # MicroPython
    BLOCKLY = "blockly"  # Blockly 可视化编程
    SCRATCH = "scratch"  # Scratch


class MCUType(str, enum.Enum):
    """微控制器类型"""

    ARDUINO_NANO = "arduino_nano"
    ARDUINO_UNO = "arduino_uno"
    ESP32 = "esp32"
    ESP8266 = "esp8266"
    RASPBERRY_PI_PICO = "raspberry_pi_pico"


# ==================== 硬件项目模板模型 ====================


class HardwareProjectTemplate(Base):
    """
    硬件项目模板表
    
    存储标准化的硬件项目模板，包含材料清单、代码示例、电路图等信息
    所有项目预算控制在50元以内，适合普惠STEM教育
    """

    __tablename__ = "hardware_project_templates"

    id = Column(Integer, primary_key=True, autoincrement=True)

    # 基础信息
    project_id = Column(
        String(50), unique=True, nullable=False, index=True, comment="项目唯一ID（如 HW-Sensor-001）"
    )
    title = Column(String(200), nullable=False, comment="项目标题")
    category = Column(
        SQLEnum(HardwareCategory), nullable=False, index=True, comment="项目分类"
    )
    difficulty = Column(Integer, nullable=False, comment="难度等级（1-5）")
    subject = Column(String(50), nullable=False, comment="学科（物理/化学/生物/工程）")

    # 项目描述
    description = Column(Text, nullable=False, comment="项目详细描述")
    learning_objectives = Column(JSON, default=list, comment="学习目标列表")
    estimated_time_hours = Column(Float, nullable=False, comment="预计完成时间（小时）")

    # 成本信息
    total_cost = Column(Float, nullable=False, comment="总成本（元），必须≤50")
    budget_verified = Column(Boolean, default=False, comment="预算是否已验证")

    # 技术文档
    mcu_type = Column(
        SQLEnum(MCUType), default=MCUType.ARDUINO_NANO, comment="微控制器类型"
    )
    wiring_instructions = Column(Text, comment="接线说明")
    circuit_diagram_path = Column(String(500), comment="电路图文件路径")
    safety_notes = Column(JSON, default=list, comment="安全注意事项列表")
    common_issues = Column(JSON, default=list, comment="常见问题列表")
    teaching_guide = Column(Text, comment="教学指南")

    # WebUSB 支持
    webusb_support = Column(Boolean, default=False, comment="是否支持 WebUSB 烧录")
    supported_boards = Column(JSON, default=list, comment="支持的開發板列表")

    # 关联知识点
    knowledge_point_ids = Column(JSON, default=list, comment="关联的知识点ID列表")

    # 媒体资源
    thumbnail_path = Column(String(500), comment="缩略图路径")
    demo_video_url = Column(String(500), comment="演示视频URL")

    # 状态管理
    is_active = Column(Boolean, default=True, comment="是否启用")
    is_featured = Column(Boolean, default=False, comment="是否推荐项目")

    # 统计信息
    usage_count = Column(Integer, default=0, comment="使用次数")
    average_rating = Column(Float, default=0.0, comment="平均评分")
    review_count = Column(Integer, default=0, comment="评价数量")

    # 时间戳
    created_at = Column(
        DateTime(timezone=True), server_default=sql_func.now(), index=True
    )
    updated_at = Column(DateTime(timezone=True), onupdate=sql_func.now())
    created_by = Column(
        Integer, ForeignKey("users.id"), nullable=True, comment="创建者ID"
    )

    # 关系
    creator = relationship("User", foreign_keys=[created_by], backref="created_hardware_templates")
    materials = relationship(
        "HardwareMaterial", back_populates="template", cascade="all, delete-orphan"
    )
    code_templates = relationship(
        "CodeTemplate", back_populates="hardware_template", cascade="all, delete-orphan"
    )
    study_projects = relationship(
        "StudyProject", back_populates="hardware_template"
    )

    # 索引
    __table_args__ = (
        Index("idx_hw_template_category", "category"),
        Index("idx_hw_template_difficulty", "difficulty"),
        Index("idx_hw_template_subject", "subject"),
        Index("idx_hw_template_cost", "total_cost"),
    )

    def to_dict(self):
        """转换为字典"""
        return {
            "id": self.id,
            "project_id": self.project_id,
            "title": self.title,
            "category": self.category.value if self.category else None,
            "difficulty": self.difficulty,
            "subject": self.subject,
            "description": self.description,
            "learning_objectives": self.learning_objectives,
            "estimated_time_hours": self.estimated_time_hours,
            "total_cost": self.total_cost,
            "mcu_type": self.mcu_type.value if self.mcu_type else None,
            "wiring_instructions": self.wiring_instructions,
            "circuit_diagram_path": self.circuit_diagram_path,
            "safety_notes": self.safety_notes,
            "common_issues": self.common_issues,
            "teaching_guide": self.teaching_guide,
            "webusb_support": self.webusb_support,
            "supported_boards": self.supported_boards,
            "knowledge_point_ids": self.knowledge_point_ids,
            "thumbnail_path": self.thumbnail_path,
            "demo_video_url": self.demo_video_url,
            "is_active": self.is_active,
            "is_featured": self.is_featured,
            "usage_count": self.usage_count,
            "average_rating": self.average_rating,
            "review_count": self.review_count,
            "materials": [m.to_dict() for m in self.materials],
            "code_templates": [c.to_dict() for c in self.code_templates],
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }


class HardwareMaterial(Base):
    """
    硬件材料清单项表
    
    存储每个硬件项目所需的材料详细信息
    """

    __tablename__ = "hardware_materials"

    id = Column(Integer, primary_key=True, autoincrement=True)

    # 关联信息
    template_id = Column(
        Integer,
        ForeignKey("hardware_project_templates.id"),
        nullable=False,
        index=True,
        comment="所属项目模板ID",
    )

    # 材料信息
    name = Column(String(200), nullable=False, comment="材料名称")
    quantity = Column(Integer, nullable=False, default=1, comment="数量")
    unit = Column(String(20), default="个", comment="单位")
    unit_price = Column(Float, nullable=False, comment="单价（元）")
    subtotal = Column(Float, comment="小计（自动计算：quantity * unit_price）")

    # 采购信息
    supplier_link = Column(String(500), comment="购买链接")
    alternative_suggestion = Column(Text, comment="替代方案说明")

    # 分类标签
    component_type = Column(String(50), comment="组件类型（传感器/执行器/主控板等）")

    # 时间戳
    created_at = Column(DateTime(timezone=True), server_default=sql_func.now())

    # 关系
    template = relationship("HardwareProjectTemplate", back_populates="materials")

    # 唯一约束（同一模板中同名材料只能有一条记录）
    __table_args__ = (
        Index("idx_hw_material_template", "template_id"),
    )

    def to_dict(self):
        """转换为字典"""
        return {
            "id": self.id,
            "template_id": self.template_id,
            "name": self.name,
            "quantity": self.quantity,
            "unit": self.unit,
            "unit_price": self.unit_price,
            "subtotal": self.subtotal,
            "supplier_link": self.supplier_link,
            "alternative_suggestion": self.alternative_suggestion,
            "component_type": self.component_type,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


class CodeTemplate(Base):
    """
    代码模板表
    
    存储硬件项目的代码示例，支持多种编程语言
    """

    __tablename__ = "code_templates"

    id = Column(Integer, primary_key=True, autoincrement=True)

    # 关联信息
    hardware_template_id = Column(
        Integer,
        ForeignKey("hardware_project_templates.id"),
        nullable=True,
        index=True,
        comment="关联的硬件项目模板ID",
    )
    study_project_id = Column(
        Integer,
        ForeignKey("study_projects.id"),
        nullable=True,
        index=True,
        comment="关联的学习项目ID（学生实际提交的代码）",
    )

    # 代码信息
    language = Column(
        SQLEnum(CodeLanguage), nullable=False, comment="编程语言"
    )
    title = Column(String(200), comment="代码标题")
    code = Column(Text, nullable=False, comment="代码内容")
    description = Column(Text, comment="代码说明")

    # 依赖配置
    dependencies = Column(JSON, default=list, comment="依赖库列表")
    pin_configurations = Column(JSON, default=list, comment="引脚配置说明")

    # 版本管理
    version = Column(Integer, default=1, comment="版本号")
    is_primary = Column(Boolean, default=False, comment="是否为主要代码示例")

    # 时间戳
    created_at = Column(
        DateTime(timezone=True), server_default=sql_func.now(), index=True
    )
    updated_at = Column(DateTime(timezone=True), onupdate=sql_func.now())
    created_by = Column(
        Integer, ForeignKey("users.id"), nullable=True, comment="创建者ID"
    )

    # 关系
    hardware_template = relationship(
        "HardwareProjectTemplate", back_populates="code_templates"
    )
    study_project = relationship("StudyProject", backref="submitted_codes")
    creator = relationship("User", foreign_keys=[created_by], backref="created_code_templates")

    # 索引
    __table_args__ = (
        Index("idx_code_hw_template", "hardware_template_id"),
        Index("idx_code_study_project", "study_project_id"),
        Index("idx_code_language", "language"),
    )

    def to_dict(self):
        """转换为字典"""
        return {
            "id": self.id,
            "hardware_template_id": self.hardware_template_id,
            "study_project_id": self.study_project_id,
            "language": self.language.value if self.language else None,
            "title": self.title,
            "code": self.code,
            "description": self.description,
            "dependencies": self.dependencies,
            "pin_configurations": self.pin_configurations,
            "version": self.version,
            "is_primary": self.is_primary,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }


# ==================== 扩展 StudyProject 模型 ====================
# 注意：这部分需要在 collaboration.py 中的 StudyProject 模型中添加新字段
# 这里仅提供需要添加的字段定义参考

"""
需要在 src/models/collaboration.py 的 StudyProject 类中添加以下字段：

    # 硬件项目关联
    hardware_template_id = Column(
        Integer,
        ForeignKey("hardware_project_templates.id"),
        nullable=True,
        index=True,
        comment="关联的硬件项目模板ID",
    )
    
    # 硬件项目特定字段
    mcu_type_used = Column(
        SQLEnum(MCUType),
        nullable=True,
        comment="实际使用的微控制器类型",
    )
    actual_cost = Column(Float, comment="实际花费（元）")
    completion_photos = Column(JSON, default=list, comment="完成照片路径列表")
    demonstration_video_url = Column(String(500), comment="演示视频URL")
    
    # WebUSB 相关
    webusb_flashed = Column(Boolean, default=False, comment="是否已通过 WebUSB 烧录")
    flash_timestamp = Column(DateTime(timezone=True), comment="烧录时间戳")
    
    # 关系
    hardware_template = relationship("HardwareProjectTemplate", back_populates="study_projects")

同时需要在 to_dict() 方法中添加这些字段的序列化。
"""


# ==================== 扩展 PeerReview 模型 ====================
# 注意：这部分需要在 collaboration.py 中的 PeerReview 模型中添加新字段

"""
需要在 src/models/collaboration.py 的 PeerReview 类中添加以下字段：

    # 硬件项目特定审查字段
    hardware_functionality_score = Column(Integer, comment="硬件功能评分（0-100）")
    code_quality_score = Column(Integer, comment="代码质量评分（0-100）")
    creativity_score = Column(Integer, comment="创意评分（0-100）")
    documentation_score = Column(Integer, comment="文档完整性评分（0-100）")
    
    # 审查详情
    hardware_feedback = Column(Text, comment="硬件实现反馈")
    code_feedback = Column(Text, comment="代码质量反馈")
    improvement_suggestions = Column(JSON, default=list, comment="改进建议列表")
    
    # 审查附件
    review_photos = Column(JSON, default=list, comment="审查时拍摄的照片")
    test_results = Column(JSON, default=dict, comment="测试结果数据")

同时需要在 to_dict() 方法中添加这些字段的序列化。
"""
