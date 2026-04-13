"""
课程版本控制数据模型
实现Git-like的版本控制系统用于课程内容管理
"""

from datetime import datetime
import hashlib
import json
from typing import Any, Dict, List, Optional

from sqlalchemy import (
    JSON,
    Boolean,
    Column,
    DateTime,
    ForeignKey,
    Index,
    Integer,
    String,
    Text,
)
from sqlalchemy.orm import relationship

from utils.database import Base


class CourseVersion(Base):
    """课程版本模型 - 存储课程的历史版本"""

    __tablename__ = "course_versions"

    id = Column(Integer, primary_key=True, index=True)
    course_id = Column(Integer, ForeignKey("courses.id", use_alter=True), nullable=False, index=True)
    org_id = Column(Integer, ForeignKey("organizations.id", use_alter=True), nullable=False, index=True)

    # 版本信息
    version_number = Column(Integer, nullable=False)  # 版本号
    commit_hash = Column(String(64), unique=True, nullable=False)  # 提交哈希值
    parent_commit_hash = Column(String(64), nullable=True)  # 父提交哈希

    # 提交信息
    author_email = Column(String(255), nullable=False)  # 提交者邮箱
    author_name = Column(String(100), nullable=False)  # 提交者姓名
    commit_message = Column(Text, nullable=False)  # 提交消息
    timestamp = Column(DateTime, default=datetime.utcnow)  # 提交时间

    # 版本内容
    course_snapshot = Column(JSON, nullable=False)  # 课程完整快照
    changes_summary = Column(JSON)  # 变更摘要

    # 分支信息
    branch_name = Column(String(100), default="main")  # 分支名称
    is_head = Column(Boolean, default=False)  # 是否为分支头版本

    # 冲突标记
    has_conflicts = Column(Boolean, default=False)  # 是否存在冲突
    conflict_details = Column(JSON)  # 冲突详情

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # 关系
    course = relationship("Course", back_populates="versions")
    organization = relationship("Organization")

    # 索引
    __table_args__ = (
        Index("idx_course_version_course_branch", "course_id", "branch_name"),
        Index("idx_course_version_commit_hash", "commit_hash"),
        Index("idx_course_version_timestamp", "timestamp"),
    )

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        if not self.commit_hash and self.course_snapshot:
            self.generate_commit_hash()

    def generate_commit_hash(self):
        """生成基于内容的提交哈希"""
        content_str = json.dumps(self.course_snapshot, sort_keys=True, default=str)
        commit_data = f"{content_str}{self.author_email}{self.timestamp.isoformat()}"
        self.commit_hash = hashlib.sha256(commit_data.encode()).hexdigest()

    def calculate_changes_from_parent(
        self, parent_version: Optional["CourseVersion"] = None
    ) -> Dict[str, Any]:
        """计算相对于父版本的变更"""
        if not parent_version:
            # 如果没有父版本，则这是初始版本
            return {
                "type": "initial",
                "added": list(self.course_snapshot.keys()),
                "modified": [],
                "deleted": [],
            }

        parent_data = parent_version.course_snapshot
        current_data = self.course_snapshot

        added = []
        modified = []
        deleted = []

        # 找出新增和修改的字段
        for key, value in current_data.items():
            if key not in parent_data:
                added.append(key)
            elif parent_data[key] != value:
                modified.append(key)

        # 找出删除的字段
        for key in parent_data.keys():
            if key not in current_data:
                deleted.append(key)

        return {
            "type": "update",
            "added": added,
            "modified": modified,
            "deleted": deleted,
        }

    def merge_with_version(
        self, other_version: "CourseVersion"
    ) -> tuple[bool, Dict[str, Any]]:
        """与另一个版本合并，返回(是否成功, 合并结果)"""
        try:
            # 简单的三路合并算法
            base_version = self.find_common_ancestor(other_version)

            if not base_version:
                return False, {"error": "无法找到共同祖先版本"}

            merged_data = {}
            conflicts = {}

            # 获取三个版本的数据
            base_data = base_version.course_snapshot
            our_data = self.course_snapshot
            their_data = other_version.course_snapshot

            # 收集所有涉及的键
            all_keys = (
                set(base_data.keys()) | set(our_data.keys()) | set(their_data.keys())
            )

            for key in all_keys:
                base_value = base_data.get(key)
                our_value = our_data.get(key)
                their_value = their_data.get(key)

                if our_value == their_value:
                    # 两边相同，直接使用
                    merged_data[key] = our_value
                elif our_value == base_value and their_value != base_value:
                    # 我们未修改，他们修改了，采用他们的修改
                    merged_data[key] = their_value
                elif their_value == base_value and our_value != base_value:
                    # 他们未修改，我们修改了，采用我们的修改
                    merged_data[key] = our_value
                elif our_value != base_value and their_value != base_value:
                    # 双方都修改了同一字段，产生冲突
                    conflicts[key] = {
                        "base": base_value,
                        "ours": our_value,
                        "theirs": their_value,
                    }
                    # 使用我们的版本作为默认选择
                    merged_data[key] = our_value

            return len(conflicts) == 0, {
                "merged_data": merged_data,
                "conflicts": conflicts,
                "successful_merge": len(conflicts) == 0,
            }

        except Exception as e:
            return False, {"error": f"合并过程中发生错误: {str(e)}"}

    def find_common_ancestor(
        self, other_version: "CourseVersion"
    ) -> Optional["CourseVersion"]:
        """查找两个版本的共同祖先"""
        # 这是一个简化的实现，实际应用中可能需要更复杂的算法
        # 这里假设通过提交历史可以找到共同祖先
        return None  # 简化实现，实际需要查询数据库


class VersionBranch(Base):
    """版本分支模型"""

    __tablename__ = "version_branches"

    id = Column(Integer, primary_key=True, index=True)
    course_id = Column(Integer, ForeignKey("courses.id", use_alter=True), nullable=False, index=True)
    org_id = Column(Integer, ForeignKey("organizations.id", use_alter=True), nullable=False, index=True)

    name = Column(String(100), nullable=False)  # 分支名称
    description = Column(Text)  # 分支描述
    is_active = Column(Boolean, default=True)  # 是否活跃
    is_protected = Column(Boolean, default=False)  # 是否受保护

    # 当前HEAD指向的版本
    head_commit_hash = Column(String(64))  # HEAD提交哈希

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # 关系
    course = relationship("Course")
    organization = relationship("Organization")

    __table_args__ = (
        Index("idx_branch_course_name", "course_id", "name", unique=True),
    )


class MergeRequest(Base):
    """合并请求模型"""

    __tablename__ = "merge_requests"

    id = Column(Integer, primary_key=True, index=True)
    course_id = Column(Integer, ForeignKey("courses.id", use_alter=True), nullable=False, index=True)
    org_id = Column(Integer, ForeignKey("organizations.id", use_alter=True), nullable=False, index=True)

    # 分支信息
    source_branch = Column(String(100), nullable=False)  # 源分支
    target_branch = Column(String(100), nullable=False)  # 目标分支

    # 请求信息
    title = Column(String(255), nullable=False)  # 请求标题
    description = Column(Text)  # 请求描述
    author_email = Column(String(255), nullable=False)  # 请求发起者

    # 状态
    status = Column(String(50), default="open")  # 状态: open/closed/merged
    merge_commit_hash = Column(String(64))  # 合并提交哈希

    # 冲突信息
    has_conflicts = Column(Boolean, default=False)  # 是否有冲突
    conflict_summary = Column(JSON)  # 冲突摘要

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    merged_at = Column(DateTime)  # 合并时间

    # 关系
    course = relationship("Course")
    organization = relationship("Organization")


# 在Course模型中添加版本控制关系
from models.course import Course

Course.versions = relationship(
    "CourseVersion", back_populates="course", cascade="all, delete-orphan"
)

from typing import Any, Dict, List, Optional

# Pydantic模型定义
from pydantic import BaseModel, Field, validator


class CourseSnapshot(BaseModel):
    """课程快照数据模型"""

    title: str
    description: Optional[str]
    content: Dict[str, Any]  # 课程具体内容
    metadata: Dict[str, Any]  # 元数据

    class Config:
        extra = "allow"


class VersionChange(BaseModel):
    """版本变更记录"""

    type: str  # add/delete/modify
    path: str
    content: Optional[Any] = None
    old_content: Optional[Any] = None


class CommitData(BaseModel):
    """提交数据模型"""

    version: int
    changes: List[VersionChange]
    author: str
    timestamp: int
    message: str
    branch: str = "main"


class CourseVersionCreate(BaseModel):
    """创建课程版本的请求模型"""

    course_id: int
    commit_message: str = Field(..., min_length=1, max_length=500)
    branch_name: str = Field(default="main", max_length=100)
    course_data: Dict[str, Any]  # 新的课程数据

    @validator("commit_message")
    def validate_commit_message(cls, v):
        if not v.strip():
            raise ValueError("提交消息不能为空")
        return v.strip()


class CourseVersionResponse(BaseModel):
    """课程版本响应模型"""

    id: int
    course_id: int
    version_number: int
    commit_hash: str
    parent_commit_hash: Optional[str]
    author_email: str
    author_name: str
    commit_message: str
    timestamp: datetime
    branch_name: str
    is_head: bool
    has_conflicts: bool
    changes_summary: Optional[Dict[str, Any]]

    class Config:
        orm_mode = True


class BranchCreate(BaseModel):
    """创建分支的请求模型"""

    name: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = Field(None, max_length=500)


class BranchResponse(BaseModel):
    """分支响应模型"""

    id: int
    course_id: int
    name: str
    description: Optional[str]
    is_active: bool
    is_protected: bool
    head_commit_hash: Optional[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True


class MergeRequestCreate(BaseModel):
    """创建合并请求的请求模型"""

    source_branch: str = Field(..., min_length=1, max_length=100)
    target_branch: str = Field(..., min_length=1, max_length=100)
    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = Field(None, max_length=1000)


class MergeRequestResponse(BaseModel):
    """合并请求响应模型"""

    id: int
    course_id: int
    source_branch: str
    target_branch: str
    title: str
    description: Optional[str]
    author_email: str
    status: str
    has_conflicts: bool
    conflict_summary: Optional[Dict[str, Any]]
    created_at: datetime
    updated_at: datetime
    merged_at: Optional[datetime]

    class Config:
        orm_mode = True
