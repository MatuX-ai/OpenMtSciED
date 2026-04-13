"""
教师管理数据模型
专门用于教育机构的教师信息管理
"""

from datetime import datetime
from typing import Optional

from sqlalchemy import (
    Boolean,
    Column,
    Date,
    DateTime,
    ForeignKey,
    Integer,
    String,
    Text,
)
from sqlalchemy.orm import relationship

from utils.database import Base


class Teacher(Base):
    """教师信息模型"""

    __tablename__ = "teachers"

    id = Column(Integer, primary_key=True, index=True)
    org_id = Column(Integer, ForeignKey("organizations.id", use_alter=True), nullable=False, index=True)
    user_id = Column(
        Integer, ForeignKey("users.id", use_alter=True), nullable=False, unique=True
    )  # 关联用户表

    # 教师基本信息
    employee_id = Column(String(50), unique=True, nullable=False, index=True)  # 工号
    department = Column(String(100))  # 所属部门
    position = Column(String(100))  # 职位
    hire_date = Column(Date)  # 入职日期
    qualification = Column(Text)  # 资格证书
    specialization = Column(Text)  # 专业领域
    teaching_subjects = Column(Text)  # 授课科目（JSON格式）

    # 教学信息
    max_classes = Column(Integer, default=5)  # 最大授课班级数
    current_classes = Column(Integer, default=0)  # 当前授课班级数
    teaching_load = Column(Integer, default=0)  # 教学工作量（课时）

    # 系统字段
    is_active = Column(Boolean, default=True)
    notes = Column(Text)  # 备注
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # 关系
    organization = relationship("Organization", back_populates="teachers")
    user = relationship("User", back_populates="teacher_profile")
    courses = relationship(
        "Course",
        primaryjoin="Teacher.id == Course.instructor_id",
        foreign_keys="[Course.instructor_id]"
    )
    class_schedules = relationship("ClassSchedule", back_populates="teacher")
    teaching_assignments = relationship("TeachingAssignment", back_populates="teacher")


class TeachingAssignment(Base):
    """教学分配模型"""

    __tablename__ = "teaching_assignments"

    id = Column(Integer, primary_key=True, index=True)
    org_id = Column(Integer, ForeignKey("organizations.id", use_alter=True), nullable=False, index=True)
    teacher_id = Column(Integer, ForeignKey("teachers.id"), nullable=False, index=True)
    course_id = Column(Integer, ForeignKey("courses.id", use_alter=True), nullable=False, index=True)
    academic_year = Column(String(9))  # 学年，如 "2023-2024"
    semester = Column(String(20))  # 学期
    class_name = Column(String(100))  # 班级名称
    student_count = Column(Integer, default=0)  # 学生人数

    # 时间信息
    start_date = Column(Date)
    end_date = Column(Date)

    # 状态
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # 关系
    organization = relationship("Organization")
    teacher = relationship("Teacher", back_populates="teaching_assignments")
    course = relationship("Course")


# 在User模型中添加反向关系
from models.user import User

User.teacher_profile = relationship("Teacher", back_populates="user", uselist=False)

# 在Organization模型中添加反向关系
from models.license import Organization

Organization.teachers = relationship(
    "Teacher", back_populates="organization", cascade="all, delete-orphan"
)

# 在Course模型中添加反向关系
from models.course import Course

# Course.instructor = relationship("Teacher", back_populates="courses")

from datetime import date, datetime
from typing import List, Optional

# Pydantic模型
from pydantic import BaseModel, Field


class TeacherCreate(BaseModel):
    """创建教师的请求模型"""

    user_id: int
    employee_id: str = Field(..., min_length=1, max_length=50)
    department: Optional[str] = Field(None, max_length=100)
    position: Optional[str] = Field(None, max_length=100)
    hire_date: Optional[date] = None
    qualification: Optional[str] = None
    specialization: Optional[str] = None
    teaching_subjects: Optional[List[str]] = None
    max_classes: int = Field(default=5, ge=1, le=20)


class TeacherUpdate(BaseModel):
    """更新教师的请求模型"""

    department: Optional[str] = Field(None, max_length=100)
    position: Optional[str] = Field(None, max_length=100)
    hire_date: Optional[date] = None
    qualification: Optional[str] = None
    specialization: Optional[str] = None
    teaching_subjects: Optional[List[str]] = None
    max_classes: Optional[int] = Field(None, ge=1, le=20)
    is_active: Optional[bool] = None
    notes: Optional[str] = None


class TeacherResponse(BaseModel):
    """教师响应模型"""

    id: int
    org_id: int
    user_id: int
    employee_id: str
    department: Optional[str]
    position: Optional[str]
    hire_date: Optional[date]
    qualification: Optional[str]
    specialization: Optional[str]
    teaching_subjects: Optional[List[str]]
    max_classes: int
    current_classes: int
    teaching_load: int
    is_active: bool
    notes: Optional[str]
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class TeachingAssignmentCreate(BaseModel):
    """创建教学分配的请求模型"""

    teacher_id: int
    course_id: int
    academic_year: str = Field(..., pattern=r"^\d{4}-\d{4}$")  # 如 "2023-2024"
    semester: str
    class_name: str = Field(..., max_length=100)
    student_count: int = Field(default=0, ge=0)
    start_date: Optional[date] = None
    end_date: Optional[date] = None


class TeachingAssignmentResponse(BaseModel):
    """教学分配响应模型"""

    id: int
    org_id: int
    teacher_id: int
    course_id: int
    academic_year: str
    semester: str
    class_name: str
    student_count: int
    start_date: Optional[date]
    end_date: Optional[date]
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
