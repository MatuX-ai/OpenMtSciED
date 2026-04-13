"""
课程管理数据模型
支持教育机构的多租户课程管理功能
"""

from datetime import datetime
import enum
import re
from typing import Optional

from sqlalchemy import (
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


class CourseDifficulty(str, enum.Enum):
    """课程难度等级"""

    BEGINNER = "beginner"
    INTERMEDIATE = "intermediate"
    ADVANCED = "advanced"
    EXPERT = "expert"


class CourseStatus(str, enum.Enum):
    """课程状态"""

    DRAFT = "draft"  # 草稿
    PUBLISHED = "published"  # 已发布
    ARCHIVED = "archived"  # 已归档
    SUSPENDED = "suspended"  # 已暂停


class EnrollmentStatus(str, enum.Enum):
    """选课状态"""

    PENDING = "pending"  # 待审核
    ENROLLED = "enrolled"  # 已选课
    COMPLETED = "completed"  # 已完成
    DROPPED = "dropped"  # 已退课
    REJECTED = "rejected"  # 已拒绝


class CourseCategory(Base):
    """课程分类模型"""

    __tablename__ = "course_categories"

    id = Column(Integer, primary_key=True, index=True)
    org_id = Column(Integer, ForeignKey("organizations.id", use_alter=True), nullable=False, index=True)
    name = Column(String(100), nullable=False)
    description = Column(Text)
    parent_id = Column(Integer, ForeignKey("course_categories.id"), nullable=True)
    is_active = Column(Boolean, default=True)
    sort_order = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # 关系
    organization = relationship("Organization", back_populates="course_categories")
    parent = relationship("CourseCategory", remote_side=[id], back_populates="children")
    children = relationship("CourseCategory", back_populates="parent")
    courses = relationship("Course", back_populates="category")


class Course(Base):
    """课程模型"""

    __tablename__ = "courses"

    id = Column(Integer, primary_key=True, index=True)
    org_id = Column(Integer, ForeignKey("organizations.id", use_alter=True), nullable=False, index=True)
    category_id = Column(Integer, ForeignKey("course_categories.id"), nullable=True)
    title = Column(String(255), nullable=False, index=True)
    code = Column(String(50), unique=True, nullable=False, index=True)  # 课程代码
    description = Column(Text)
    short_description = Column(String(500))  # 简短描述
    difficulty = Column(Enum(CourseDifficulty), default=CourseDifficulty.BEGINNER)
    status = Column(Enum(CourseStatus), default=CourseStatus.DRAFT)

    # 课程信息
    duration_hours = Column(Float, default=0.0)  # 总学时
    credit_hours = Column(Float, default=0.0)  # 学分
    max_students = Column(Integer, default=30)  # 最大学生数
    current_students = Column(Integer, default=0)  # 当前学生数

    # 时间信息
    start_date = Column(DateTime, nullable=True)
    end_date = Column(DateTime, nullable=True)
    enrollment_start_date = Column(DateTime, nullable=True)
    enrollment_end_date = Column(DateTime, nullable=True)

    # 讲师信息
    instructor_id = Column(Integer, ForeignKey("users.id", use_alter=True), nullable=True)
    co_instructors = Column(Text)  # 共同讲师IDs，JSON格式存储

    # 价格信息
    price = Column(Float, default=0.0)
    currency = Column(String(3), default="CNY")
    is_free = Column(Boolean, default=False)

    # 其他属性
    prerequisites = Column(Text)  # 先修课程要求，JSON格式
    learning_outcomes = Column(Text)  # 学习成果，JSON格式
    materials_required = Column(Text)  # 所需材料，JSON格式
    thumbnail_url = Column(String(500))  # 缩略图URL
    video_url = Column(String(500))  # 介绍视频URL

    # 系统字段
    is_active = Column(Boolean, default=True)
    is_featured = Column(Boolean, default=False)  # 是否推荐课程
    tags = Column(Text)  # 标签，JSON格式
    custom_metadata = Column(Text)  # 元数据，JSON格式

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # 关系
    organization = relationship("Organization", back_populates="courses")
    category = relationship("CourseCategory", back_populates="courses")
    # instructor = relationship(
    #     "User",
    #     foreign_keys=[instructor_id],
    #     primaryjoin="Course.instructor_id == User.id"
    # )
    enrollments = relationship(
        "CourseEnrollment", back_populates="course", cascade="all, delete-orphan"
    )
    lessons = relationship(
        "CourseLesson", back_populates="course", cascade="all, delete-orphan"
    )
    assignments = relationship(
        "CourseAssignment", back_populates="course", cascade="all, delete-orphan"
    )
    ar_vr_contents = relationship(
        "ARVRContent", back_populates="course", cascade="all, delete-orphan"
    )
    materials = relationship(
        "UnifiedMaterial", back_populates="course", cascade="all, delete-orphan"
    )

    def __repr__(self):
        return f"<Course(id={self.id}, code='{self.code}', title='{self.title}')>"

    @property
    def is_enrollable(self) -> bool:
        """检查课程是否可以选课"""
        if not self.is_active or self.status != CourseStatus.PUBLISHED:
            return False

        if (
            self.enrollment_start_date
            and datetime.utcnow() < self.enrollment_start_date
        ):
            return False

        if self.enrollment_end_date and datetime.utcnow() > self.enrollment_end_date:
            return False

        if self.current_students >= self.max_students:
            return False

        return True

    @property
    def enrollment_progress(self) -> float:
        """计算选课进度百分比"""
        if self.max_students <= 0:
            return 0.0
        return (self.current_students / self.max_students) * 100

    @validates("code")
    def validate_code(self, key, code):
        """验证课程代码格式"""
        if not code:
            raise ValueError("课程代码不能为空")

        # 课程代码格式验证：字母数字组合，可包含连字符
        pattern = r"^[A-Za-z0-9\-_]+$"
        if not re.match(pattern, code):
            raise ValueError("课程代码只能包含字母、数字、连字符和下划线")

        if len(code) < 3 or len(code) > 50:
            raise ValueError("课程代码长度必须在3-50个字符之间")

        return code.strip().upper()

    @validates("title")
    def validate_title(self, key, title):
        """验证课程标题"""
        if not title or len(title.strip()) < 2:
            raise ValueError("课程标题至少需要2个字符")

        if len(title) > 255:
            raise ValueError("课程标题不能超过255个字符")

        return title.strip()

    @validates("price")
    def validate_price(self, key, price):
        """验证价格"""
        if price < 0:
            raise ValueError("价格不能为负数")
        return price


class CourseEnrollment(Base):
    """课程选课记录模型"""

    __tablename__ = "course_enrollments"

    id = Column(Integer, primary_key=True, index=True)
    org_id = Column(Integer, ForeignKey("organizations.id", use_alter=True), nullable=False, index=True)
    course_id = Column(Integer, ForeignKey("courses.id", use_alter=True), nullable=False, index=True)
    student_id = Column(Integer, ForeignKey("users.id", use_alter=True), nullable=False, index=True)
    status = Column(Enum(EnrollmentStatus), default=EnrollmentStatus.PENDING)

    # 学习来源关联（支持多来源选课）
    learning_source_id = Column(Integer, ForeignKey("learning_sources.id"), nullable=True, index=True)

    # 选课信息
    enrollment_date = Column(DateTime, default=datetime.utcnow)
    completion_date = Column(DateTime, nullable=True)
    grade = Column(Float, nullable=True)  # 成绩
    attendance_rate = Column(Float, default=0.0)  # 出勤率

    # 系统字段
    is_active = Column(Boolean, default=True)
    notes = Column(Text)  # 备注
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # 关系
    organization = relationship("Organization")
    course = relationship("Course", back_populates="enrollments")
    student = relationship("User", foreign_keys=[student_id])
    learning_source = relationship("LearningSource", back_populates="enrollments")


class CourseLesson(Base):
    """课程章节/课时模型"""

    __tablename__ = "course_lessons"

    id = Column(Integer, primary_key=True, index=True)
    org_id = Column(Integer, ForeignKey("organizations.id", use_alter=True), nullable=False, index=True)
    course_id = Column(Integer, ForeignKey("courses.id", use_alter=True), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text)
    content = Column(Text)  # 课时内容

    # 排序和进度
    lesson_number = Column(Integer, nullable=False)
    duration_minutes = Column(Integer, default=0)  # 课时时长（分钟）
    is_required = Column(Boolean, default=True)  # 是否必修

    # 资源
    video_url = Column(String(500))
    attachment_urls = Column(Text)  # 附件URL列表，JSON格式
    resources = Column(Text)  # 其他资源，JSON格式

    # 状态
    is_published = Column(Boolean, default=False)
    published_at = Column(DateTime, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # 关系
    organization = relationship("Organization")
    course = relationship("Course", back_populates="lessons")
    ar_vr_contents = relationship(
        "ARVRContent", back_populates="lesson", cascade="all, delete-orphan"
    )
    materials = relationship(
        "UnifiedMaterial", back_populates="lesson", cascade="all, delete-orphan"
    )


class CourseAssignment(Base):
    """课程作业模型"""

    __tablename__ = "course_assignments"

    id = Column(Integer, primary_key=True, index=True)
    org_id = Column(Integer, ForeignKey("organizations.id", use_alter=True), nullable=False, index=True)
    course_id = Column(Integer, ForeignKey("courses.id", use_alter=True), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text)

    # 时间设置
    due_date = Column(DateTime, nullable=False)
    release_date = Column(DateTime, default=datetime.utcnow)

    # 分值设置
    max_points = Column(Float, default=100.0)
    weight = Column(Float, default=1.0)  # 在总成绩中的权重

    # 类型和配置
    assignment_type = Column(
        String(50), default="homework"
    )  # homework, quiz, project等
    config = Column(Text)  # 作业配置，JSON格式

    # 状态
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # 关系
    organization = relationship("Organization")
    course = relationship("Course", back_populates="assignments")


from datetime import datetime
from typing import List, Optional

# Pydantic模型用于API请求/响应
from pydantic import BaseModel, Field


class CourseCreate(BaseModel):
    """创建课程的请求模型"""

    category_id: Optional[int] = None
    title: str = Field(..., min_length=2, max_length=255)
    code: str = Field(..., min_length=3, max_length=50)
    description: Optional[str] = None
    short_description: Optional[str] = Field(None, max_length=500)
    difficulty: CourseDifficulty = CourseDifficulty.BEGINNER
    duration_hours: float = Field(default=0.0, ge=0)
    credit_hours: float = Field(default=0.0, ge=0)
    max_students: int = Field(default=30, ge=1, le=1000)
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    enrollment_start_date: Optional[datetime] = None
    enrollment_end_date: Optional[datetime] = None
    instructor_id: Optional[int] = None
    price: float = Field(default=0.0, ge=0)
    is_free: bool = False
    prerequisites: Optional[List[str]] = None
    learning_outcomes: Optional[List[str]] = None
    tags: Optional[List[str]] = None


class CourseUpdate(BaseModel):
    """更新课程的请求模型"""

    category_id: Optional[int] = None
    title: Optional[str] = Field(None, min_length=2, max_length=255)
    description: Optional[str] = None
    short_description: Optional[str] = Field(None, max_length=500)
    difficulty: Optional[CourseDifficulty] = None
    status: Optional[CourseStatus] = None
    duration_hours: Optional[float] = Field(None, ge=0)
    credit_hours: Optional[float] = Field(None, ge=0)
    max_students: Optional[int] = Field(None, ge=1, le=1000)
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    enrollment_start_date: Optional[datetime] = None
    enrollment_end_date: Optional[datetime] = None
    instructor_id: Optional[int] = None
    price: Optional[float] = Field(None, ge=0)
    is_free: Optional[bool] = None
    is_active: Optional[bool] = None
    is_featured: Optional[bool] = None
    tags: Optional[List[str]] = None


class CourseResponse(BaseModel):
    """课程响应模型"""

    id: int
    org_id: int
    category_id: Optional[int]
    title: str
    code: str
    description: Optional[str]
    short_description: Optional[str]
    difficulty: CourseDifficulty
    status: CourseStatus
    duration_hours: float
    credit_hours: float
    max_students: int
    current_students: int
    start_date: Optional[datetime]
    end_date: Optional[datetime]
    enrollment_start_date: Optional[datetime]
    enrollment_end_date: Optional[datetime]
    instructor_id: Optional[int]
    price: float
    is_free: bool
    is_active: bool
    is_featured: bool
    is_enrollable: bool
    enrollment_progress: float
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True


class CourseEnrollmentCreate(BaseModel):
    """创建选课记录的请求模型"""

    course_id: int
    student_id: int
    status: EnrollmentStatus = EnrollmentStatus.PENDING
    learning_source_id: Optional[int] = Field(None, description="学习来源ID（支持多来源选课）")


class CourseEnrollmentResponse(BaseModel):
    """选课记录响应模型"""

    id: int
    org_id: int
    course_id: int
    student_id: int
    status: EnrollmentStatus
    learning_source_id: Optional[int]
    enrollment_date: datetime
    completion_date: Optional[datetime]
    grade: Optional[float]
    attendance_rate: float
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True
