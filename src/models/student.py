"""
学生管理数据模型
专门用于教育机构的学生信息管理
"""

from datetime import date, datetime
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


class Student(Base):
    """学生信息模型"""

    __tablename__ = "students"

    id = Column(Integer, primary_key=True, index=True)
    org_id = Column(Integer, ForeignKey("organizations.id", use_alter=True), nullable=False, index=True)
    user_id = Column(
        Integer, ForeignKey("users.id", use_alter=True), nullable=False, unique=True
    )  # 关联用户表

    # 学生基本信息
    student_id = Column(String(50), unique=True, nullable=False, index=True)  # 学号
    grade = Column(String(20))  # 年级
    class_name = Column(String(50))  # 班级
    enrollment_date = Column(Date)  # 入学日期
    graduation_date = Column(Date)  # 预计毕业日期

    # 学业信息
    major = Column(String(100))  # 专业
    advisor_id = Column(Integer, ForeignKey("teachers.id"))  # 导师ID
    academic_status = Column(String(50), default="active")  # 学籍状态

    # 联系信息
    parent_name = Column(String(100))  # 家长姓名
    parent_phone = Column(String(20))  # 家长电话
    emergency_contact = Column(String(100))  # 紧急联系人
    emergency_phone = Column(String(20))  # 紧急联系电话

    # 系统字段
    is_active = Column(Boolean, default=True)
    notes = Column(Text)  # 备注
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # 关系
    organization = relationship("Organization", back_populates="students")
    user = relationship("User", back_populates="student_profile")
    advisor = relationship("Teacher")
    # enrollments = relationship("CourseEnrollment", back_populates="student")  # 暂时注释，外键指向User而非Student


class StudentAttendance(Base):
    """学生考勤记录模型"""

    __tablename__ = "student_attendance"

    id = Column(Integer, primary_key=True, index=True)
    org_id = Column(Integer, ForeignKey("organizations.id", use_alter=True), nullable=False, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False, index=True)
    course_id = Column(Integer, ForeignKey("courses.id", use_alter=True), nullable=False, index=True)
    schedule_id = Column(
        Integer, ForeignKey("class_schedules.id"), nullable=True
    )  # 对应的课程安排

    # 考勤信息
    attendance_date = Column(Date, nullable=False)  # 考勤日期
    class_time = Column(DateTime)  # 课程时间
    status = Column(
        String(20), default="present"
    )  # 出勤状态：present/absent/late/leave_early
    check_in_time = Column(DateTime)  # 签到时间
    check_out_time = Column(DateTime)  # 签退时间

    # 备注
    reason = Column(Text)  # 缺勤原因
    remarks = Column(Text)  # 备注

    # 系统字段
    recorded_by = Column(Integer, ForeignKey("users.id", use_alter=True))  # 记录人
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # 关系
    organization = relationship("Organization")
    student = relationship("Student")
    course = relationship("Course")
    schedule = relationship("ClassSchedule")
    recorder = relationship("User")


class AcademicRecord(Base):
    """学业记录模型"""

    __tablename__ = "academic_records"

    id = Column(Integer, primary_key=True, index=True)
    org_id = Column(Integer, ForeignKey("organizations.id", use_alter=True), nullable=False, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False, index=True)
    course_id = Column(Integer, ForeignKey("courses.id", use_alter=True), nullable=False, index=True)

    # 成绩信息
    assignment_scores = Column(Text)  # 作业成绩（JSON格式）
    midterm_score = Column(Integer)  # 期中成绩
    final_score = Column(Integer)  # 期末成绩
    total_score = Column(Integer)  # 总成绩
    grade_letter = Column(String(2))  # 等级成绩（A+, A, B+, B, C+, C, D, F）

    # 学习情况
    attendance_rate = Column(Integer, default=100)  # 出勤率
    participation_score = Column(Integer)  # 参与度评分
    homework_completion = Column(Integer, default=100)  # 作业完成率

    # 系统字段
    academic_year = Column(String(9))  # 学年
    semester = Column(String(20))  # 学期
    is_finalized = Column(Boolean, default=False)  # 是否已确定
    finalized_date = Column(DateTime)  # 确定日期
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # 关系
    organization = relationship("Organization")
    student = relationship("Student")
    course = relationship("Course")


# 在User模型中添加反向关系
from models.user import User

User.student_profile = relationship("Student", back_populates="user", uselist=False)

# 在Organization模型中添加反向关系
from models.license import Organization

Organization.students = relationship(
    "Student", back_populates="organization", cascade="all, delete-orphan"
)

# 在Teacher模型中添加反向关系
from models.teacher import Teacher

Teacher.advised_students = relationship("Student", foreign_keys=[Student.advisor_id])

from datetime import date, datetime
from typing import Dict, Optional

# Pydantic模型
from pydantic import BaseModel, Field


class StudentCreate(BaseModel):
    """创建学生的请求模型"""

    user_id: int
    student_id: str = Field(..., min_length=1, max_length=50)
    grade: Optional[str] = Field(None, max_length=20)
    class_name: Optional[str] = Field(None, max_length=50)
    enrollment_date: Optional[date] = None
    graduation_date: Optional[date] = None
    major: Optional[str] = Field(None, max_length=100)
    advisor_id: Optional[int] = None
    parent_name: Optional[str] = Field(None, max_length=100)
    parent_phone: Optional[str] = Field(None, max_length=20)
    emergency_contact: Optional[str] = Field(None, max_length=100)
    emergency_phone: Optional[str] = Field(None, max_length=20)


class StudentUpdate(BaseModel):
    """更新学生的请求模型"""

    grade: Optional[str] = Field(None, max_length=20)
    class_name: Optional[str] = Field(None, max_length=50)
    enrollment_date: Optional[date] = None
    graduation_date: Optional[date] = None
    major: Optional[str] = Field(None, max_length=100)
    advisor_id: Optional[int] = None
    academic_status: Optional[str] = Field(None, max_length=50)
    parent_name: Optional[str] = Field(None, max_length=100)
    parent_phone: Optional[str] = Field(None, max_length=20)
    emergency_contact: Optional[str] = Field(None, max_length=100)
    emergency_phone: Optional[str] = Field(None, max_length=20)
    is_active: Optional[bool] = None
    notes: Optional[str] = None


class StudentResponse(BaseModel):
    """学生响应模型"""

    id: int
    org_id: int
    user_id: int
    student_id: str
    grade: Optional[str]
    class_name: Optional[str]
    enrollment_date: Optional[date]
    graduation_date: Optional[date]
    major: Optional[str]
    advisor_id: Optional[int]
    academic_status: str
    parent_name: Optional[str]
    parent_phone: Optional[str]
    emergency_contact: Optional[str]
    emergency_phone: Optional[str]
    is_active: bool
    notes: Optional[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True


class AttendanceRecordCreate(BaseModel):
    """创建考勤记录的请求模型"""

    student_id: int
    course_id: int
    schedule_id: Optional[int] = None
    attendance_date: date
    class_time: Optional[datetime] = None
    status: str = Field(
        default="present", pattern="^(present|absent|late|leave_early)$"
    )
    check_in_time: Optional[datetime] = None
    check_out_time: Optional[datetime] = None
    reason: Optional[str] = None
    remarks: Optional[str] = None


class AttendanceRecordResponse(BaseModel):
    """考勤记录响应模型"""

    id: int
    org_id: int
    student_id: int
    course_id: int
    schedule_id: Optional[int]
    attendance_date: date
    class_time: Optional[datetime]
    status: str
    check_in_time: Optional[datetime]
    check_out_time: Optional[datetime]
    reason: Optional[str]
    remarks: Optional[str]
    recorded_by: Optional[int]
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True


class AcademicRecordCreate(BaseModel):
    """创建学业记录的请求模型"""

    student_id: int
    course_id: int
    assignment_scores: Optional[Dict[str, int]] = None
    midterm_score: Optional[int] = Field(None, ge=0, le=100)
    final_score: Optional[int] = Field(None, ge=0, le=100)
    total_score: Optional[int] = Field(None, ge=0, le=100)
    grade_letter: Optional[str] = Field(None, pattern="^(A\\+|A|B\\+|B|C\\+|C|D|F)$")
    attendance_rate: int = Field(default=100, ge=0, le=100)
    participation_score: Optional[int] = Field(None, ge=0, le=100)
    homework_completion: int = Field(default=100, ge=0, le=100)
    academic_year: str = Field(..., pattern=r"^\d{4}-\d{4}$")
    semester: str


class AcademicRecordResponse(BaseModel):
    """学业记录响应模型"""

    id: int
    org_id: int
    student_id: int
    course_id: int
    assignment_scores: Optional[Dict[str, int]]
    midterm_score: Optional[int]
    final_score: Optional[int]
    total_score: Optional[int]
    grade_letter: Optional[str]
    attendance_rate: int
    participation_score: Optional[int]
    homework_completion: int
    academic_year: str
    semester: str
    is_finalized: bool
    finalized_date: Optional[datetime]
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
