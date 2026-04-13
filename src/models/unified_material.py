"""
统一课件库数据库模型
支持24种课件类型
"""

from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, Float, JSON, ForeignKey, Index
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from utils.database import Base


class UnifiedMaterial(Base):
    """统一课件模型"""

    __tablename__ = "unified_materials"

    # 基础信息
    id = Column(Integer, primary_key=True, index=True)
    material_code = Column(String(50), unique=True, index=True, nullable=False, comment="课件编号")
    title = Column(String(200), nullable=False, comment="课件标题")
    description = Column(Text, comment="课件描述")
    type = Column(String(50), nullable=False, comment="课件类型")
    category = Column(String(50), nullable=False, comment="课件分类")
    tags = Column(JSON, default=list, comment="标签列表")

    # 文件信息
    file_url = Column(String(500), nullable=False, comment="文件URL")
    file_name = Column(String(200), nullable=False, comment="文件名")
    file_size = Column(Integer, nullable=False, comment="文件大小(bytes)")
    file_format = Column(String(20), nullable=False, comment="文件格式")
    file_hash = Column(String(64), index=True, comment="文件MD5哈希")
    thumbnail_url = Column(String(500), comment="缩略图URL")

    # 关联信息
    course_id = Column(Integer, ForeignKey("courses.id"), comment="关联课程ID")
    # chapter_id = Column(Integer, ForeignKey("course_chapters.id"), comment="关联章节ID")  # TODO: CourseChapter模型待实现
    lesson_id = Column(Integer, ForeignKey("course_lessons.id"), comment="关联课时ID")
    org_id = Column(Integer, ForeignKey("organizations.id"), nullable=False, comment="机构ID")
    created_by = Column(Integer, ForeignKey("users.id"), nullable=False, comment="创建者ID")
    updated_by = Column(Integer, ForeignKey("users.id"), comment="更新者ID")

    # 访问控制
    visibility = Column(String(20), default="course_private", comment="可见性")
    download_permission = Column(String(20), default="enrolled", comment="下载权限")

    # 使用统计
    download_count = Column(Integer, default=0, comment="下载次数")
    view_count = Column(Integer, default=0, comment="查看次数")
    like_count = Column(Integer, default=0, comment="点赞次数")
    share_count = Column(Integer, default=0, comment="分享次数")
    comment_count = Column(Integer, default=0, comment="评论次数")

    # 时间戳
    created_at = Column(DateTime, default=func.now(), comment="创建时间")
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now(), comment="更新时间")
    published_at = Column(DateTime, comment="发布时间")

    # AI增强信息
    ai_generated = Column(Boolean, default=False, comment="是否AI生成")
    ai_summary = Column(Text, comment="AI摘要")
    ai_tags = Column(JSON, default=list, comment="AI生成的标签")

    # AR/VR 特有属性
    arvr_data = Column(JSON, comment="AR/VR数据JSON")

    # 游戏特有属性
    game_data = Column(JSON, comment="游戏数据JSON")

    # 动画特有属性
    animation_data = Column(JSON, comment="动画数据JSON")

    # 实验特有属性
    experiment_data = Column(JSON, comment="实验数据JSON")

    # 关系
    course = relationship("Course", back_populates="materials")
    # chapter = relationship("CourseChapter", back_populates="materials")  # TODO: CourseChapter模型待实现
    lesson = relationship("CourseLesson", back_populates="materials")
    organization = relationship("Organization", back_populates="materials")
    creator = relationship("User", foreign_keys=[created_by], back_populates="created_materials")
    updater = relationship("User", foreign_keys=[updated_by], back_populates="updated_materials")

    # 索引
    __table_args__ = (
        Index('idx_materials_type', 'type'),
        Index('idx_materials_category', 'category'),
        Index('idx_materials_org', 'org_id'),
        Index('idx_materials_course', 'course_id'),
        Index('idx_materials_created_by', 'created_by'),
        Index('idx_materials_visibility', 'visibility'),
        Index('idx_materials_created_at', 'created_at'),
    )

    def to_dict(self):
        """转换为字典"""
        return {
            "id": self.id,
            "material_code": self.material_code,
            "title": self.title,
            "description": self.description,
            "type": self.type,
            "category": self.category,
            "tags": self.tags or [],
            "file_url": self.file_url,
            "file_name": self.file_name,
            "file_size": self.file_size,
            "file_format": self.file_format,
            "file_hash": self.file_hash,
            "thumbnail_url": self.thumbnail_url,
            "course_id": self.course_id,
            "chapter_id": self.chapter_id,
            "lesson_id": self.lesson_id,
            "org_id": self.org_id,
            "created_by": self.created_by,
            "updated_by": self.updated_by,
            "visibility": self.visibility,
            "download_permission": self.download_permission,
            "download_count": self.download_count,
            "view_count": self.view_count,
            "like_count": self.like_count,
            "share_count": self.share_count,
            "comment_count": self.comment_count,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
            "published_at": self.published_at.isoformat() if self.published_at else None,
            "ai_generated": self.ai_generated,
            "ai_summary": self.ai_summary,
            "ai_tags": self.ai_tags or [],
            "arvr_data": self.arvr_data,
            "game_data": self.game_data,
            "animation_data": self.animation_data,
            "experiment_data": self.experiment_data,
        }


# 为其他模型添加反向关系（需要在对应模型文件中添加）
# Course.materials = relationship("UnifiedMaterial", back_populates="course")
# CourseChapter.materials = relationship("UnifiedMaterial", back_populates="chapter")
# CourseLesson.materials = relationship("UnifiedMaterial", back_populates="lesson")
# Organization.materials = relationship("UnifiedMaterial", back_populates="organization")
# User.created_materials = relationship("UnifiedMaterial", foreign_keys=[UnifiedMaterial.created_by], back_populates="creator")
# User.updated_materials = relationship("UnifiedMaterial", foreign_keys=[UnifiedMaterial.updated_by], back_populates="updater")
