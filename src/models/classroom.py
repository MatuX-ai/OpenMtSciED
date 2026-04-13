"""
教室管理数据模型
用于教育机构的教室资源管理
"""

from datetime import datetime
from typing import Optional

from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    ForeignKey,
    Integer,
    String,
    Text,
)
from sqlalchemy.orm import relationship

from utils.database import Base


class Classroom(Base):
    """教室信息模型"""

    __tablename__ = "classrooms"

    id = Column(Integer, primary_key=True, index=True)
    org_id = Column(Integer, ForeignKey("organizations.id"), nullable=False, index=True)

    # 教室基本信息
    room_number = Column(String(20), nullable=False, index=True)  # 房间号
    building = Column(String(100))  # 所在楼宇
    floor = Column(Integer)  # 楼层
    capacity = Column(Integer, default=30)  # 容纳人数
    room_type = Column(String(50))  # 教室类型（普通教室、实验室、多媒体教室等）

    # 设备信息
    has_projector = Column(Boolean, default=False)  # 投影仪
    has_computer = Column(Boolean, default=False)  # 电脑设备
    has_audio_system = Column(Boolean, default=False)  # 音响设备
    has_whiteboard = Column(Boolean, default=True)  # 白板
    equipment_list = Column(Text)  # 设备清单（JSON格式）

    # 状态信息
    is_available = Column(Boolean, default=True)  # 是否可用
    maintenance_status = Column(String(50))  # 维护状态
    last_maintenance_date = Column(DateTime)  # 上次维护日期

    # 系统字段
    notes = Column(Text)  # 备注
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # 关系
    organization = relationship("Organization", back_populates="classrooms")
    schedules = relationship("ClassSchedule", back_populates="classroom")


class ClassSchedule(Base):
    """课程时间安排模型"""

    __tablename__ = "class_schedules"

    id = Column(Integer, primary_key=True, index=True)
    org_id = Column(Integer, ForeignKey("organizations.id"), nullable=False, index=True)
    classroom_id = Column(
        Integer, ForeignKey("classrooms.id"), nullable=False, index=True
    )
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False, index=True)
    teacher_id = Column(Integer, ForeignKey("teachers.id"), nullable=True, index=True)

    # 时间安排
    day_of_week = Column(Integer)  # 星期几 (1-7, 1=周一)
    start_time = Column(DateTime, nullable=False)  # 开始时间
    end_time = Column(DateTime, nullable=False)  # 结束时间
    duration_minutes = Column(Integer)  # 持续时间（分钟）

    # 日期范围
    start_date = Column(DateTime)  # 开始日期
    end_date = Column(DateTime)  # 结束日期
    recurrence_pattern = Column(String(50))  # 重复模式（每周、隔周等）

    # 状态
    is_active = Column(Boolean, default=True)
    is_confirmed = Column(Boolean, default=False)  # 是否已确认
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # 关系
    organization = relationship("Organization")
    classroom = relationship("Classroom", back_populates="schedules")
    course = relationship("Course")
    teacher = relationship("Teacher", back_populates="class_schedules")


# 在Organization模型中添加反向关系
from models.license import Organization

Organization.classrooms = relationship(
    "Classroom", back_populates="organization", cascade="all, delete-orphan"
)

# 在Teacher模型中添加反向关系
from models.teacher import Teacher

Teacher.class_schedules = relationship("ClassSchedule", back_populates="teacher")

from datetime import date, datetime
from typing import List, Optional

# Pydantic模型
from pydantic import BaseModel, Field


class ClassroomCreate(BaseModel):
    """创建教室的请求模型"""

    room_number: str = Field(..., min_length=1, max_length=20)
    building: Optional[str] = Field(None, max_length=100)
    floor: Optional[int] = None
    capacity: int = Field(default=30, ge=1, le=500)
    room_type: Optional[str] = Field(None, max_length=50)
    has_projector: bool = False
    has_computer: bool = False
    has_audio_system: bool = False
    has_whiteboard: bool = True
    equipment_list: Optional[List[str]] = None
    notes: Optional[str] = None


class ClassroomUpdate(BaseModel):
    """更新教室的请求模型"""

    building: Optional[str] = Field(None, max_length=100)
    floor: Optional[int] = None
    capacity: Optional[int] = Field(None, ge=1, le=500)
    room_type: Optional[str] = Field(None, max_length=50)
    has_projector: Optional[bool] = None
    has_computer: Optional[bool] = None
    has_audio_system: Optional[bool] = None
    has_whiteboard: Optional[bool] = None
    equipment_list: Optional[List[str]] = None
    is_available: Optional[bool] = None
    maintenance_status: Optional[str] = Field(None, max_length=50)
    notes: Optional[str] = None


class ClassroomResponse(BaseModel):
    """教室响应模型"""

    id: int
    org_id: int
    room_number: str
    building: Optional[str]
    floor: Optional[int]
    capacity: int
    room_type: Optional[str]
    has_projector: bool
    has_computer: bool
    has_audio_system: bool
    has_whiteboard: bool
    equipment_list: Optional[List[str]]
    is_available: bool
    maintenance_status: Optional[str]
    notes: Optional[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True


class ClassScheduleCreate(BaseModel):
    """创建课程时间安排的请求模型"""

    classroom_id: int
    course_id: int
    teacher_id: Optional[int] = None
    day_of_week: int = Field(..., ge=1, le=7)
    start_time: datetime
    end_time: datetime
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    recurrence_pattern: Optional[str] = Field(None, max_length=50)


class ClassScheduleResponse(BaseModel):
    """课程时间安排响应模型"""

    id: int
    org_id: int
    classroom_id: int
    course_id: int
    teacher_id: Optional[int]
    day_of_week: int
    start_time: datetime
    end_time: datetime
    duration_minutes: Optional[int]
    start_date: Optional[date]
    end_date: Optional[date]
    recurrence_pattern: Optional[str]
    is_active: bool
    is_confirmed: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True


class ScheduleConflictCheck(BaseModel):
    """排课冲突检查模型"""

    classroom_id: int
    day_of_week: int
    start_time: datetime
    end_time: datetime
    start_date: Optional[date] = None
    end_date: Optional[date] = None
