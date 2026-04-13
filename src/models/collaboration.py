"""
AI-Edu 协作学习系统数据模型
支持讨论区、协作文档、小组项目、同伴审查等功能
"""

import enum

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
    UniqueConstraint,
    func,
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func as sql_func

from database.db import Base

# ==================== 枚举类型 ====================


class DiscussionCategory(str, enum.Enum):
    """讨论分类"""

    GENERAL = "general"  # 综合讨论
    COURSE_QA = "course_qa"  # 课程问答
    PROJECT_SHOWCASE = "showcase"  # 项目展示
    STUDY_GROUP = "study_group"  # 学习小组
    TECHNICAL = "technical"  # 技术交流
    CAREER = "career"  # 职业发展


class PostType(str, enum.Enum):
    """帖子类型"""

    QUESTION = "question"  # 问题
    DISCUSSION = "discussion"  # 讨论
    TUTORIAL = "tutorial"  # 教程
    SHOWCASE = "showcase"  # 展示
    ANNOUNCEMENT = "announcement"  # 公告


class DocumentPermission(str, enum.Enum):
    """文档权限"""

    PRIVATE = "private"  # 仅自己
    GROUP = "group"  # 小组成员
    PUBLIC = "public"  # 公开


class ReviewStatus(str, enum.Enum):
    """审查状态"""

    PENDING = "pending"  # 待审查
    IN_PROGRESS = "in_progress"  # 审查中
    COMPLETED = "completed"  # 已完成
    REJECTED = "rejected"  # 已拒绝


# ==================== 讨论区模型 ====================


class DiscussionPost(Base):
    """讨论帖子表"""

    __tablename__ = "discussion_posts"

    id = Column(Integer, primary_key=True, autoincrement=True)

    # 关联信息
    user_id = Column(
        Integer, ForeignKey("users.id"), nullable=False, index=True, comment="发帖人 ID"
    )
    course_id = Column(
        Integer,
        ForeignKey("courses.id"),
        nullable=True,
        index=True,
        comment="关联课程 ID（可选）",
    )
    parent_id = Column(
        Integer,
        ForeignKey("discussion_posts.id"),
        nullable=True,
        index=True,
        comment="父帖子 ID（用于回复）",
    )

    # 帖子内容
    title = Column(String(200), nullable=False, comment="标题")
    content = Column(Text, nullable=False, comment="正文内容")
    category = Column(
        SQLEnum(DiscussionCategory),
        nullable=False,
        default=DiscussionCategory.GENERAL,
        comment="分类",
    )
    post_type = Column(
        SQLEnum(PostType), nullable=False, default=PostType.DISCUSSION, comment="类型"
    )
    tags = Column(JSON, default=list, comment="标签列表")

    # 统计信息
    view_count = Column(Integer, default=0, comment="浏览次数")
    like_count = Column(Integer, default=0, comment="点赞数")
    comment_count = Column(Integer, default=0, comment="评论数")
    is_pinned = Column(Boolean, default=False, comment="是否置顶")
    is_locked = Column(Boolean, default=False, comment="是否锁定（禁止回复）")
    is_solved = Column(Boolean, default=False, comment="是否已解决（问题帖）")

    # 时间戳
    created_at = Column(
        DateTime(timezone=True), server_default=sql_func.now(), index=True
    )
    updated_at = Column(DateTime(timezone=True), onupdate=sql_func.now())
    last_activity_at = Column(
        DateTime(timezone=True), onupdate=sql_func.now(), comment="最后活跃时间"
    )

    # 关系
    author = relationship("User", backref="posts")
    course = relationship("Course", backref="posts")
    parent = relationship("DiscussionPost", remote_side=[id], backref="replies")
    comments = relationship(
        "DiscussionComment", back_populates="post", cascade="all, delete-orphan"
    )
    likes = relationship(
        "PostLike", back_populates="post", cascade="all, delete-orphan"
    )

    # 索引
    __table_args__ = (
        Index("idx_post_category_created", "category", "created_at"),
        Index("idx_post_user_created", "user_id", "created_at"),
    )

    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "content": self.content,
            "category": self.category.value,
            "post_type": self.post_type.value,
            "tags": self.tags,
            "view_count": self.view_count,
            "like_count": self.like_count,
            "comment_count": self.comment_count,
            "is_pinned": self.is_pinned,
            "is_locked": self.is_locked,
            "is_solved": self.is_solved,
            "user_id": self.user_id,
            "course_id": self.course_id,
            "parent_id": self.parent_id,
            "author": (
                {"id": self.author.id, "username": self.author.username}
                if self.author
                else None
            ),
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
            "last_activity_at": (
                self.last_activity_at.isoformat() if self.last_activity_at else None
            ),
        }


class DiscussionComment(Base):
    """评论表"""

    __tablename__ = "discussion_comments"

    id = Column(Integer, primary_key=True, autoincrement=True)

    # 关联信息
    post_id = Column(
        Integer, ForeignKey("discussion_posts.id"), nullable=False, index=True
    )
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    parent_id = Column(
        Integer,
        ForeignKey("discussion_comments.id"),
        nullable=True,
        index=True,
        comment="父评论 ID（用于回复）",
    )

    # 评论内容
    content = Column(Text, nullable=False, comment="评论内容")
    like_count = Column(Integer, default=0, comment="点赞数")

    # 时间戳
    created_at = Column(
        DateTime(timezone=True), server_default=sql_func.now(), index=True
    )
    updated_at = Column(DateTime(timezone=True), onupdate=sql_func.now())

    # 关系
    post = relationship("DiscussionPost", back_populates="comments")
    author = relationship("User", backref="comments")
    parent = relationship("DiscussionComment", remote_side=[id], backref="replies")
    likes = relationship(
        "CommentLike", back_populates="comment", cascade="all, delete-orphan"
    )

    def to_dict(self):
        return {
            "id": self.id,
            "content": self.content,
            "like_count": self.like_count,
            "user_id": self.user_id,
            "post_id": self.post_id,
            "parent_id": self.parent_id,
            "author": (
                {"id": self.author.id, "username": self.author.username}
                if self.author
                else None
            ),
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }


class PostLike(Base):
    """帖子点赞表"""

    __tablename__ = "post_likes"

    id = Column(Integer, primary_key=True, autoincrement=True)
    post_id = Column(
        Integer, ForeignKey("discussion_posts.id"), nullable=False, index=True
    )
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), server_default=sql_func.now())

    # 唯一约束（同一用户同一帖子只能点赞一次）
    __table_args__ = (
        UniqueConstraint("post_id", "user_id", name="uix_post_like_unique"),
    )

    post = relationship("DiscussionPost", back_populates="likes")
    user = relationship("User", backref="post_likes")

    def to_dict(self):
        return {
            "id": self.id,
            "post_id": self.post_id,
            "user_id": self.user_id,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


class CommentLike(Base):
    """评论点赞表"""

    __tablename__ = "comment_likes"

    id = Column(Integer, primary_key=True, autoincrement=True)
    comment_id = Column(
        Integer, ForeignKey("discussion_comments.id"), nullable=False, index=True
    )
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), server_default=sql_func.now())

    # 唯一约束
    __table_args__ = (
        UniqueConstraint("comment_id", "user_id", name="uix_comment_like_unique"),
    )

    comment = relationship("DiscussionComment", back_populates="likes")
    user = relationship("User", backref="comment_likes")

    def to_dict(self):
        return {
            "id": self.id,
            "comment_id": self.comment_id,
            "user_id": self.user_id,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


# ==================== 协作文档模型 ====================


class CollaborativeDocument(Base):
    """协作文档表"""

    __tablename__ = "collaborative_documents"

    id = Column(Integer, primary_key=True, autoincrement=True)

    # 关联信息
    user_id = Column(
        Integer, ForeignKey("users.id"), nullable=False, index=True, comment="创建者 ID"
    )
    group_id = Column(
        Integer,
        ForeignKey("study_groups.id"),
        nullable=True,
        index=True,
        comment="所属小组 ID（可选）",
    )
    course_id = Column(
        Integer,
        ForeignKey("courses.id"),
        nullable=True,
        index=True,
        comment="关联课程 ID（可选）",
    )

    # 文档信息
    title = Column(String(200), nullable=False, comment="文档标题")
    content = Column(Text, default="", comment="文档内容（Markdown 格式）")
    permission = Column(
        SQLEnum(DocumentPermission),
        default=DocumentPermission.PRIVATE,
        comment="权限设置",
    )

    # 版本控制
    version = Column(Integer, default=1, comment="版本号")
    last_editor_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=True,
        index=True,
        comment="最后编辑者 ID",
    )

    # 协作信息
    collaborators = Column(JSON, default=list, comment="协作者列表 [{user_id, role}]")

    # 时间戳
    created_at = Column(
        DateTime(timezone=True), server_default=sql_func.now(), index=True
    )
    updated_at = Column(DateTime(timezone=True), onupdate=sql_func.now())

    # 关系
    creator = relationship("User", foreign_keys=[user_id], backref="created_documents")
    last_editor = relationship("User", foreign_keys=[last_editor_id])
    group = relationship("StudyGroup", back_populates="documents")
    versions = relationship(
        "DocumentVersion", back_populates="document", cascade="all, delete-orphan"
    )
    comments = relationship(
        "DocumentComment", back_populates="document", cascade="all, delete-orphan"
    )

    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "content": self.content,
            "permission": self.permission.value,
            "version": self.version,
            "user_id": self.user_id,
            "group_id": self.group_id,
            "course_id": self.course_id,
            "last_editor_id": self.last_editor_id,
            "collaborators": self.collaborators,
            "creator": (
                {"id": self.creator.id, "username": self.creator.username}
                if self.creator
                else None
            ),
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }


class DocumentVersion(Base):
    """文档版本表"""

    __tablename__ = "document_versions"

    id = Column(Integer, primary_key=True, autoincrement=True)

    # 关联信息
    document_id = Column(
        Integer, ForeignKey("collaborative_documents.id"), nullable=False, index=True
    )
    user_id = Column(
        Integer, ForeignKey("users.id"), nullable=False, index=True, comment="编辑者 ID"
    )

    # 版本信息
    version_number = Column(Integer, nullable=False, comment="版本号")
    content = Column(Text, nullable=False, comment="版本内容")
    change_summary = Column(String(500), comment="修改摘要")

    # 时间戳
    created_at = Column(
        DateTime(timezone=True), server_default=sql_func.now(), index=True
    )

    # 关系
    document = relationship("CollaborativeDocument", back_populates="versions")
    editor = relationship("User", backref="document_versions")

    def to_dict(self):
        return {
            "id": self.id,
            "document_id": self.document_id,
            "version_number": self.version_number,
            "content": self.content,
            "change_summary": self.change_summary,
            "user_id": self.user_id,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


class DocumentComment(Base):
    """文档评论表（支持行级评论）"""

    __tablename__ = "document_comments"

    id = Column(Integer, primary_key=True, autoincrement=True)

    # 关联信息
    document_id = Column(
        Integer, ForeignKey("collaborative_documents.id"), nullable=False, index=True
    )
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    parent_id = Column(
        Integer, ForeignKey("document_comments.id"), nullable=True, index=True
    )

    # 评论内容
    content = Column(Text, nullable=False, comment="评论内容")
    line_number = Column(Integer, comment="行号（用于行级评论）")
    is_resolved = Column(Boolean, default=False, comment="是否已解决")

    # 时间戳
    created_at = Column(
        DateTime(timezone=True), server_default=sql_func.now(), index=True
    )
    updated_at = Column(DateTime(timezone=True), onupdate=sql_func.now())

    # 关系
    document = relationship("CollaborativeDocument", back_populates="comments")
    author = relationship("User", backref="document_comments")
    parent = relationship("DocumentComment", remote_side=[id], backref="replies")

    def to_dict(self):
        return {
            "id": self.id,
            "content": self.content,
            "line_number": self.line_number,
            "is_resolved": self.is_resolved,
            "user_id": self.user_id,
            "document_id": self.document_id,
            "parent_id": self.parent_id,
            "author": (
                {"id": self.author.id, "username": self.author.username}
                if self.author
                else None
            ),
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }


# ==================== 学习小组模型 ====================


class StudyGroup(Base):
    """学习小组表"""

    __tablename__ = "study_groups"

    id = Column(Integer, primary_key=True, autoincrement=True)

    # 基本信息
    name = Column(String(100), nullable=False, comment="小组名称")
    description = Column(Text, comment="小组描述")

    # 关联信息
    creator_id = Column(
        Integer, ForeignKey("users.id"), nullable=False, index=True, comment="创建者 ID"
    )
    course_id = Column(
        Integer,
        ForeignKey("courses.id"),
        nullable=True,
        index=True,
        comment="关联课程 ID（可选）",
    )
    org_id = Column(
        Integer,
        ForeignKey("organizations.id"),
        nullable=False,
        index=True,
        comment="组织 ID",
    )

    # 小组信息
    max_members = Column(Integer, default=10, comment="最大成员数")
    is_private = Column(Boolean, default=False, comment="是否私密（需要申请加入）")
    member_count = Column(Integer, default=0, comment="成员数量")

    # 时间戳
    created_at = Column(
        DateTime(timezone=True), server_default=sql_func.now(), index=True
    )
    updated_at = Column(DateTime(timezone=True), onupdate=sql_func.now())

    # 关系
    creator = relationship("User", foreign_keys=[creator_id], backref="created_groups")
    organization = relationship("Organization", backref="study_groups")
    course = relationship("Course", backref="study_groups")
    members = relationship(
        "StudyGroupMember", back_populates="group", cascade="all, delete-orphan"
    )
    projects = relationship(
        "StudyProject", back_populates="group", cascade="all, delete-orphan"
    )
    documents = relationship(
        "CollaborativeDocument", back_populates="group", cascade="all, delete-orphan"
    )

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "creator_id": self.creator_id,
            "course_id": self.course_id,
            "org_id": self.org_id,
            "max_members": self.max_members,
            "is_private": self.is_private,
            "member_count": self.member_count,
            "creator": (
                {"id": self.creator.id, "username": self.creator.username}
                if self.creator
                else None
            ),
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }


class StudyGroupMember(Base):
    """小组成员表"""

    __tablename__ = "study_group_members"

    id = Column(Integer, primary_key=True, autoincrement=True)

    # 关联信息
    group_id = Column(
        Integer, ForeignKey("study_groups.id"), nullable=False, index=True
    )
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)

    # 角色信息
    role = Column(String(20), default="member", comment="角色：admin/member")
    joined_at = Column(DateTime(timezone=True), server_default=sql_func.now())

    # 关系
    group = relationship("StudyGroup", back_populates="members")
    user = relationship("User", backref="group_memberships")

    # 唯一约束
    __table_args__ = (
        UniqueConstraint("group_id", "user_id", name="uix_group_member_unique"),
    )

    def to_dict(self):
        return {
            "id": self.id,
            "group_id": self.group_id,
            "user_id": self.user_id,
            "role": self.role,
            "joined_at": self.joined_at.isoformat() if self.joined_at else None,
            "user": (
                {"id": self.user.id, "username": self.user.username}
                if self.user
                else None
            ),
        }


# ==================== 项目与审查模型 ====================


class StudyProject(Base):
    """学习项目表"""

    __tablename__ = "study_projects"

    id = Column(Integer, primary_key=True, autoincrement=True)

    # 关联信息
    group_id = Column(
        Integer, ForeignKey("study_groups.id"), nullable=False, index=True
    )
    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False,
        index=True,
        comment="项目负责人 ID",
    )
    course_id = Column(
        Integer,
        ForeignKey("courses.id"),
        nullable=True,
        index=True,
        comment="关联课程 ID（可选）",
    )

    # 项目信息
    title = Column(String(200), nullable=False, comment="项目标题")
    description = Column(Text, comment="项目描述")
    repository_url = Column(String(500), comment="代码仓库 URL")

    # 进度跟踪
    progress_percentage = Column(Integer, default=0, comment="进度百分比")
    status = Column(
        String(20), default="active", comment="状态：active/completed/archived"
    )

    # 时间戳
    created_at = Column(
        DateTime(timezone=True), server_default=sql_func.now(), index=True
    )
    updated_at = Column(DateTime(timezone=True), onupdate=sql_func.now())

    # 关系
    group = relationship("StudyGroup", back_populates="projects")
    creator = relationship("User", foreign_keys=[user_id], backref="projects")
    tasks = relationship(
        "ProjectTask", back_populates="project", cascade="all, delete-orphan"
    )
    reviews = relationship(
        "PeerReview", back_populates="project", cascade="all, delete-orphan"
    )

    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "repository_url": self.repository_url,
            "progress_percentage": self.progress_percentage,
            "status": self.status,
            "group_id": self.group_id,
            "user_id": self.user_id,
            "course_id": self.course_id,
            "creator": (
                {"id": self.creator.id, "username": self.creator.username}
                if self.creator
                else None
            ),
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }


class ProjectTask(Base):
    """项目任务表"""

    __tablename__ = "project_tasks"

    id = Column(Integer, primary_key=True, autoincrement=True)

    # 关联信息
    project_id = Column(
        Integer, ForeignKey("study_projects.id"), nullable=False, index=True
    )
    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=True,
        index=True,
        comment="负责人 ID（可选）",
    )

    # 任务信息
    title = Column(String(200), nullable=False, comment="任务标题")
    description = Column(Text, comment="任务描述")
    status = Column(String(20), default="todo", comment="状态：todo/in_progress/done")
    priority = Column(String(20), default="medium", comment="优先级：low/medium/high")
    due_date = Column(DateTime(timezone=True), comment="截止日期")

    # 时间戳
    created_at = Column(DateTime(timezone=True), server_default=sql_func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=sql_func.now())

    # 关系
    project = relationship("StudyProject", back_populates="tasks")
    assignee = relationship("User", backref="assigned_tasks")

    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "status": self.status,
            "priority": self.priority,
            "due_date": self.due_date.isoformat() if self.due_date else None,
            "project_id": self.project_id,
            "user_id": self.user_id,
            "assignee": (
                {"id": self.assignee.id, "username": self.assignee.username}
                if self.assignee
                else None
            ),
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }


class PeerReview(Base):
    """同伴审查表"""

    __tablename__ = "peer_reviews"

    id = Column(Integer, primary_key=True, autoincrement=True)

    # 关联信息
    project_id = Column(
        Integer, ForeignKey("study_projects.id"), nullable=False, index=True
    )
    reviewer_id = Column(
        Integer, ForeignKey("users.id"), nullable=False, index=True, comment="审查人 ID"
    )
    reviewee_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False,
        index=True,
        comment="被审查人 ID",
    )

    # 审查内容
    status = Column(
        SQLEnum(ReviewStatus), default=ReviewStatus.PENDING, comment="审查状态"
    )
    feedback = Column(Text, comment="审查反馈")
    score = Column(Integer, comment="评分（0-100）")
    strengths = Column(JSON, default=list, comment="优点列表")
    suggestions = Column(JSON, default=list, comment="改进建议列表")

    # 时间戳
    created_at = Column(
        DateTime(timezone=True), server_default=sql_func.now(), index=True
    )
    updated_at = Column(DateTime(timezone=True), onupdate=sql_func.now())

    # 关系
    project = relationship("StudyProject", back_populates="reviews")
    reviewer = relationship("User", foreign_keys=[reviewer_id], backref="given_reviews")
    reviewee = relationship(
        "User", foreign_keys=[reviewee_id], backref="received_reviews"
    )

    # 唯一约束（同一人对同一项目只能审查一次）
    __table_args__ = (
        UniqueConstraint("project_id", "reviewer_id", name="uix_peer_review_unique"),
    )

    def to_dict(self):
        return {
            "id": self.id,
            "project_id": self.project_id,
            "reviewer_id": self.reviewer_id,
            "reviewee_id": self.reviewee_id,
            "status": self.status.value,
            "feedback": self.feedback,
            "score": self.score,
            "strengths": self.strengths,
            "suggestions": self.suggestions,
            "reviewer": (
                {"id": self.reviewer.id, "username": self.reviewer.username}
                if self.reviewer
                else None
            ),
            "reviewee": (
                {"id": self.reviewee.id, "username": self.reviewee.username}
                if self.reviewee
                else None
            ),
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
