"""
动态课程生成数据模型
定义与动态课程生成相关的数据结构
"""

from datetime import datetime
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field, validator
from sqlalchemy import JSON, Column, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from utils.database import Base


# SQLAlchemy模型
class GeneratedCourse(Base):
    """生成的课程记录模型"""

    __tablename__ = "generated_courses"

    id = Column(Integer, primary_key=True, index=True)
    org_id = Column(Integer, ForeignKey("organizations.id", use_alter=True), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id", use_alter=True), nullable=False, index=True)

    # 课程基本信息
    title = Column(String(255), nullable=False)
    description = Column(Text)
    subject_area = Column(String(100), nullable=False)
    difficulty_level = Column(String(50), nullable=False)
    estimated_duration = Column(Integer)  # 分钟

    # 学生信息
    student_grade = Column(Integer)
    student_age = Column(Integer)
    learning_style = Column(String(50))

    # 生成参数
    learning_objectives = Column(JSON)  # List[str]
    project_type = Column(String(100))
    time_constraint = Column(Integer)  # 小时

    # 生成结果
    course_components = Column(JSON)  # List[Dict]
    required_materials = Column(JSON)  # List[str]
    learning_outcomes = Column(JSON)  # List[str]
    prerequisites = Column(JSON)  # List[str]
    assessment_methods = Column(JSON)  # List[str]
    difficulty_assessment = Column(String(100))

    # 统计信息
    tokens_used = Column(Integer, default=0)
    generation_time = Column(Integer)  # 毫秒
    completion_rate = Column(Integer, default=0)  # 百分比

    # 时间戳
    generated_at = Column(DateTime, default=datetime.utcnow)
    last_accessed = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # 关系
    organization = relationship("Organization")
    user = relationship("User")


class CourseGenerationLog(Base):
    """课程生成日志模型"""

    __tablename__ = "course_generation_logs"

    id = Column(Integer, primary_key=True, index=True)
    org_id = Column(Integer, ForeignKey("organizations.id", use_alter=True), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", use_alter=True), nullable=False)
    generated_course_id = Column(Integer, ForeignKey("generated_courses.id"))

    # 请求信息
    request_data = Column(JSON)  # 原始请求数据
    prompt_template = Column(Text)  # 使用的提示词模板

    # 响应信息
    raw_response = Column(Text)  # AI原始响应
    parsed_response = Column(JSON)  # 解析后的响应

    # 性能指标
    response_time = Column(Integer)  # 毫秒
    tokens_used = Column(Integer)
    model_used = Column(String(100))

    # 状态信息
    status = Column(String(50), default="success")  # success, failed, timeout
    error_message = Column(Text)

    # 时间戳
    created_at = Column(DateTime, default=datetime.utcnow)


# Pydantic模型
class StudentProfileCreate(BaseModel):
    """创建学生档案的请求模型"""

    grade: int = Field(..., ge=1, le=12, description="年级 (1-12)")
    age: int = Field(..., ge=6, le=18, description="年龄")
    learning_style: str = Field(
        ..., min_length=1, max_length=50, description="学习风格"
    )
    prior_knowledge: List[str] = Field(default=[], description="已有知识背景")
    interests: List[str] = Field(default=[], description="兴趣爱好")
    learning_goals: List[str] = Field(default=[], description="学习目标")

    @validator("learning_style")
    def validate_learning_style(cls, v):
        valid_styles = ["视觉型", "听觉型", "动手型", "综合型", "阅读写作型"]
        if v not in valid_styles:
            raise ValueError(f'学习风格必须是以下之一: {", ".join(valid_styles)}')
        return v


class DynamicCourseRequestCreate(BaseModel):
    """创建动态课程生成请求的模型"""

    student_profile: StudentProfileCreate
    subject_area: str = Field(..., min_length=1, max_length=100, description="学科领域")
    learning_objectives: List[str] = Field(..., min_items=1, description="学习目标")
    difficulty_level: str = Field(
        ..., min_length=1, max_length=50, description="难度等级"
    )
    project_type: str = Field(..., min_length=1, max_length=100, description="项目类型")
    time_constraint: int = Field(..., ge=1, le=100, description="时间约束(小时)")
    language: str = Field(default="zh-CN", description="语言")

    @validator("subject_area")
    def validate_subject_area(cls, v):
        valid_subjects = [
            "物理",
            "化学",
            "生物",
            "信息技术",
            "数学",
            "工程",
            "科学",
            "技术",
        ]
        if v not in valid_subjects:
            raise ValueError(f'学科领域必须是以下之一: {", ".join(valid_subjects)}')
        return v

    @validator("difficulty_level")
    def validate_difficulty_level(cls, v):
        valid_levels = ["初级", "中级", "高级", "专家级"]
        if v not in valid_levels:
            raise ValueError(f'难度等级必须是以下之一: {", ".join(valid_levels)}')
        return v


class CourseComponentResponse(BaseModel):
    """课程组件响应模型"""

    title: str = Field(..., description="组件标题")
    description: str = Field(..., description="组件描述")
    duration: int = Field(..., ge=0, description="预计时长(分钟)")
    materials: List[str] = Field(..., description="所需材料")
    steps: List[str] = Field(..., description="实施步骤")


class DynamicCourseResponseDetail(BaseModel):
    """详细的动态课程响应模型"""

    course_id: int = Field(..., description="课程ID")
    course_title: str = Field(..., description="课程标题")
    course_description: str = Field(..., description="课程描述")
    learning_outcomes: List[str] = Field(..., description="学习成果")
    project_components: List[CourseComponentResponse] = Field(
        ..., description="项目组件"
    )
    required_materials: List[str] = Field(..., description="所需材料")
    estimated_duration: int = Field(..., ge=0, description="总估计时长(分钟)")
    difficulty_assessment: str = Field(..., description="难度评估")
    prerequisites: List[str] = Field(..., description="先修知识")
    assessment_methods: List[str] = Field(..., description="评估方法")
    generated_at: datetime = Field(..., description="生成时间")
    tokens_used: int = Field(..., ge=0, description="使用的令牌数")
    generation_time: int = Field(..., ge=0, description="生成耗时(毫秒)")


class CourseGenerationStats(BaseModel):
    """课程生成统计模型"""

    total_generations: int = Field(..., description="总生成次数")
    successful_generations: int = Field(..., description="成功生成次数")
    average_response_time: float = Field(..., description="平均响应时间(毫秒)")
    average_tokens_used: float = Field(..., description="平均令牌使用数")
    completion_rate: float = Field(..., ge=0, le=100, description="完成率(%)")
    popular_subjects: List[Dict[str, Any]] = Field(..., description="热门学科")
    average_duration: int = Field(..., description="平均课程时长(分钟)")


class BacktestResult(BaseModel):
    """回测结果模型"""

    test_name: str = Field(..., description="测试名称")
    generated_courses_count: int = Field(..., description="生成课程数量")
    manual_courses_count: int = Field(..., description="手工课程数量")
    generated_completion_rate: float = Field(
        ..., ge=0, le=100, description="生成课程完成率(%)"
    )
    manual_completion_rate: float = Field(
        ..., ge=0, le=100, description="手工课程完成率(%)"
    )
    improvement_percentage: float = Field(..., description="提升百分比")
    statistical_significance: bool = Field(..., description="统计显著性")
    test_period: str = Field(..., description="测试周期")
    created_at: datetime = Field(..., description="创建时间")


# 查询参数模型
class CourseQueryParams(BaseModel):
    """课程查询参数模型"""

    subject_area: Optional[str] = Field(None, description="学科领域")
    difficulty_level: Optional[str] = Field(None, description="难度等级")
    student_grade: Optional[int] = Field(None, ge=1, le=12, description="学生年级")
    min_duration: Optional[int] = Field(None, ge=0, description="最小时长(分钟)")
    max_duration: Optional[int] = Field(None, ge=0, description="最大时长(分钟)")
    completion_rate_threshold: Optional[int] = Field(
        None, ge=0, le=100, description="完成率阈值(%)"
    )
    limit: int = Field(default=20, ge=1, le=100, description="返回记录数限制")
    offset: int = Field(default=0, ge=0, description="偏移量")


class TemplateEvaluation(BaseModel):
    """模板评估模型"""

    template_id: str = Field(..., description="模板ID")
    template_name: str = Field(..., description="模板名称")
    usage_count: int = Field(..., description="使用次数")
    average_rating: float = Field(..., ge=1, le=5, description="平均评分")
    success_rate: float = Field(..., ge=0, le=100, description="成功率(%)")
    average_completion_rate: float = Field(
        ..., ge=0, le=100, description="平均完成率(%)"
    )
    last_used: datetime = Field(..., description="最后使用时间")
