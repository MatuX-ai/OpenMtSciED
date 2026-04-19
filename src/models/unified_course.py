"""
统一教程库数据库模型
支持多场景STEM教程管理（校本、培训机构、在线平台、AI生成等）
"""

from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, Float, JSON, ForeignKey, Index, Enum
from sqlalchemy.orm import relationship
import enum

from utils.database import Base


class CourseScenarioType(str, enum.Enum):
    """课程场景类型"""
    SCHOOL_CURRICULUM = "school_curriculum"  # 校本教程
    SCHOOL_INTEREST = "school_interest"  # 兴趣班
    INSTITUTION = "institution"  # 培训机构教程
    ONLINE_PLATFORM = "online_platform"  # 在线平台教程
    AI_GENERATED = "ai_generated"  # AI生成教程
    COMPETITION = "competition"  # 竞赛培训教程


class CourseStatus(str, enum.Enum):
    """课程状态"""
    DRAFT = "draft"  # 草稿
    PENDING = "pending"  # 待审核
    PUBLISHED = "published"  # 已发布
    ONGOING = "ongoing"  # 进行中
    COMPLETED = "completed"  # 已结束
    ARCHIVED = "archived"  # 已归档


class CourseLevel(str, enum.Enum):
    """课程级别"""
    BEGINNER = "beginner"
    INTERMEDIATE = "intermediate"
    ADVANCED = "advanced"
    EXPERT = "expert"


class CourseCategory(str, enum.Enum):
    """课程分类"""
    SCIENCE = "science"
    TECHNOLOGY = "technology"
    ENGINEERING = "engineering"
    MATHEMATICS = "mathematics"
    LANGUAGE = "language"
    ARTS = "arts"
    SPORTS = "sports"
    SOCIAL_STUDIES = "social_studies"
    MUSIC = "music"
    PROGRAMMING = "programming"
    AI_ROBOTICS = "ai_robotics"
    OTHER = "other"


class DeliveryMethod(str, enum.Enum):
    """授课方式"""
    ONLINE = "online"
    OFFLINE = "offline"
    HYBRID = "hybrid"
    SELF_PACED = "self_paced"


class Visibility(str, enum.Enum):
    """可见性"""
    PUBLIC = "public"
    PRIVATE = "private"
    RESTRICTED = "restricted"


class UnifiedCourse(Base):
    """统一教程模型"""

    __tablename__ = "unified_courses"

    # 基础标识
    id = Column(Integer, primary_key=True, index=True)
    course_code = Column(String(50), unique=True, index=True, nullable=False, comment="课程唯一编号")
    org_id = Column(Integer, ForeignKey("organizations.id"), nullable=False, index=True, comment="所属组织ID")
    scenario_type = Column(Enum(CourseScenarioType), nullable=False, comment="课程场景类型")

    # 元数据
    title = Column(String(200), nullable=False, comment="课程标题")
    subtitle = Column(String(200), comment="副标题")
    description = Column(Text, comment="课程描述")
    cover_image_url = Column(String(500), comment="封面图片URL")
    promo_video_url = Column(String(500), comment="宣传视频URL")

    # 分类信息
    category = Column(Enum(CourseCategory), nullable=False, comment="课程分类")
    tags = Column(JSON, default=list, comment="课程标签")
    level = Column(Enum(CourseLevel), nullable=False, comment="课程难度级别")
    subject = Column(String(100), comment="学科/主题")

    # 学习路径相关
    learning_path_stage = Column(String(50), comment="学习路径阶段：elementary_intro/middle_practice/high_inquiry/university_bridge")
    hardware_budget_level = Column(String(20), comment="硬件预算等级：entry/intermediate/advanced")
    hardware_dependencies = Column(JSON, default=list, comment="硬件依赖项列表")

    # 课程详情
    learning_objectives = Column(JSON, default=list, comment="学习目标")
    prerequisites = Column(JSON, default=list, comment="先修要求")
    target_audience = Column(String(200), comment="目标学员")
    total_lessons = Column(Integer, default=0, comment="总课时数")
    estimated_duration_hours = Column(Float, default=0.0, comment="预估时长（小时）")
    delivery_method = Column(Enum(DeliveryMethod), default=DeliveryMethod.ONLINE, comment="授课方式")

    # 招生信息
    max_students = Column(Integer, comment="最大学生数")
    enrollment_start_date = Column(DateTime, comment="报名开始时间")
    enrollment_end_date = Column(DateTime, comment="报名结束时间")
    course_start_date = Column(DateTime, comment="课程开始时间")
    course_end_date = Column(DateTime, comment="课程结束时间")
    schedule_pattern = Column(String(100), comment="上课模式")

    # 价格信息
    is_free = Column(Boolean, default=False, comment="是否免费")
    price = Column(Float, default=0.0, comment="价格")
    currency = Column(String(3), default="CNY", comment="货币单位")

    # 教师信息
    primary_teacher_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True, comment="主讲教师ID")
    assistant_teacher_ids = Column(JSON, default=list, comment="助教ID列表")

    # 状态和可见性
    status = Column(Enum(CourseStatus), default=CourseStatus.DRAFT, index=True, comment="课程状态")
    visibility = Column(Enum(Visibility), default=Visibility.PUBLIC, comment="可见性")
    is_featured = Column(Boolean, default=False, comment="是否推荐")
    is_active = Column(Boolean, default=True, comment="是否激活")

    # AI增强信息
    ai_generated = Column(Boolean, default=False, comment="是否AI生成")
    ai_model_version = Column(String(50), comment="AI模型版本")
    ai_confidence_score = Column(Float, comment="AI置信度分数")
    dynamic_content = Column(Boolean, default=False, comment="是否动态内容")

    # 使用统计
    enrollment_count = Column(Integer, default=0, comment="报名人数")
    completion_count = Column(Integer, default=0, comment="完成人数")
    average_rating = Column(Float, default=0.0, comment="平均评分")
    review_count = Column(Integer, default=0, comment="评价数量")
    view_count = Column(Integer, default=0, comment="浏览次数")

    # 系统字段
    created_by = Column(Integer, ForeignKey("users.id"), nullable=False, comment="创建者ID")
    updated_by = Column(Integer, ForeignKey("users.id"), comment="最后更新者ID")
    created_at = Column(DateTime, default=datetime.utcnow, comment="创建时间")
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, comment="更新时间")
    published_at = Column(DateTime, comment="发布时间")

    # 关系
    organization = relationship("Organization", back_populates="unified_courses")
    primary_teacher = relationship("User", foreign_keys=[primary_teacher_id])
    creator = relationship("User", foreign_keys=[created_by])
    updater = relationship("User", foreign_keys=[updated_by])
    
    # 关联的课件
    materials = relationship("UnifiedMaterial", back_populates="course", cascade="all, delete-orphan")

    # 索引
    __table_args__ = (
        Index("idx_unified_course_org", "org_id"),
        Index("idx_unified_course_category", "category"),
        Index("idx_unified_course_level", "level"),
        Index("idx_unified_course_status", "status"),
        Index("idx_unified_course_scenario", "scenario_type"),
        Index("idx_unified_course_subject", "subject"),
    )

    def __repr__(self):
        return f"<UnifiedCourse(id={self.id}, code='{self.course_code}', title='{self.title}')>"

    def to_dict(self):
        """转换为字典"""
        return {
            "id": self.id,
            "course_code": self.course_code,
            "org_id": self.org_id,
            "scenario_type": self.scenario_type.value if self.scenario_type else None,
            "title": self.title,
            "subtitle": self.subtitle,
            "description": self.description,
            "cover_image_url": self.cover_image_url,
            "promo_video_url": self.promo_video_url,
            "category": self.category.value if self.category else None,
            "tags": self.tags or [],
            "level": self.level.value if self.level else None,
            "subject": self.subject,
            "learning_path_stage": self.learning_path_stage,
            "hardware_budget_level": self.hardware_budget_level,
            "hardware_dependencies": self.hardware_dependencies or [],
            "learning_objectives": self.learning_objectives or [],
            "prerequisites": self.prerequisites or [],
            "target_audience": self.target_audience,
            "total_lessons": self.total_lessons,
            "estimated_duration_hours": self.estimated_duration_hours,
            "delivery_method": self.delivery_method.value if self.delivery_method else None,
            "max_students": self.max_students,
            "enrollment_start_date": self.enrollment_start_date.isoformat() if self.enrollment_start_date else None,
            "enrollment_end_date": self.enrollment_end_date.isoformat() if self.enrollment_end_date else None,
            "course_start_date": self.course_start_date.isoformat() if self.course_start_date else None,
            "course_end_date": self.course_end_date.isoformat() if self.course_end_date else None,
            "schedule_pattern": self.schedule_pattern,
            "is_free": self.is_free,
            "price": self.price,
            "currency": self.currency,
            "primary_teacher_id": self.primary_teacher_id,
            "assistant_teacher_ids": self.assistant_teacher_ids or [],
            "status": self.status.value if self.status else None,
            "visibility": self.visibility.value if self.visibility else None,
            "is_featured": self.is_featured,
            "is_active": self.is_active,
            "ai_generated": self.ai_generated,
            "ai_model_version": self.ai_model_version,
            "ai_confidence_score": self.ai_confidence_score,
            "dynamic_content": self.dynamic_content,
            "enrollment_count": self.enrollment_count,
            "completion_count": self.completion_count,
            "average_rating": self.average_rating,
            "review_count": self.review_count,
            "view_count": self.view_count,
            "created_by": self.created_by,
            "updated_by": self.updated_by,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
            "published_at": self.published_at.isoformat() if self.published_at else None,
        }
