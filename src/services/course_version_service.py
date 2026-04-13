"""
课程版本控制服务
提供Git-like的版本控制功能用于课程内容管理
"""

from datetime import datetime
import logging
from typing import Any, Dict, List, Optional, Tuple

from fastapi import Depends
from sqlalchemy import desc
from sqlalchemy.orm import Session

from models.course import Course
from models.course_version import (
    BranchCreate,
    CourseVersion,
    CourseVersionCreate,
    MergeRequest,
    MergeRequestCreate,
    VersionBranch,
)
from models.user import User
from utils.database import get_sync_db

logger = logging.getLogger(__name__)


class CourseVersionService:
    """课程版本控制服务类"""

    def __init__(self, db: Session):
        self.db = db

    def commit_course_version(
        self, org_id: int, version_data: CourseVersionCreate, current_user: User
    ) -> CourseVersion:
        """
        提交课程新版本

        Args:
            org_id: 组织ID
            version_data: 版本创建数据
            current_user: 当前用户

        Returns:
            CourseVersion: 创建的版本对象
        """
        try:
            # 验证课程存在
            course = (
                self.db.query(Course)
                .filter(Course.id == version_data.course_id, Course.org_id == org_id)
                .first()
            )

            if not course:
                raise ValueError("课程不存在")

            # 获取当前分支的最新版本
            latest_version = self.get_latest_version(
                version_data.course_id, version_data.branch_name
            )

            # 生成版本号
            version_number = 1
            parent_commit_hash = None

            if latest_version:
                version_number = latest_version.version_number + 1
                parent_commit_hash = latest_version.commit_hash

            # 创建版本对象
            version = CourseVersion(
                course_id=version_data.course_id,
                org_id=org_id,
                version_number=version_number,
                parent_commit_hash=parent_commit_hash,
                author_email=current_user.email,
                author_name=f"{current_user.first_name} {current_user.last_name}".strip(),
                commit_message=version_data.commit_message,
                course_snapshot=version_data.course_data,
                branch_name=version_data.branch_name,
                is_head=True,
            )

            # 设置变更摘要
            changes_summary = version.calculate_changes_from_parent(latest_version)
            version.changes_summary = changes_summary

            # 保存到数据库
            self.db.add(version)

            # 将之前的head版本标记为非head
            if latest_version:
                latest_version.is_head = False
                self.db.add(latest_version)

            self.db.commit()
            self.db.refresh(version)

            logger.info(
                f"课程版本提交成功: Course {version_data.course_id}, "
                f"Version {version.version_number}, Commit {version.commit_hash[:8]}"
            )

            return version

        except Exception as e:
            self.db.rollback()
            logger.error(f"提交课程版本失败: {e}")
            raise

    def get_course_versions(
        self, course_id: int, branch_name: Optional[str] = None, limit: int = 50
    ) -> List[CourseVersion]:
        """
        获取课程版本历史

        Args:
            course_id: 课程ID
            branch_name: 分支名称（可选）
            limit: 返回记录数限制

        Returns:
            List[CourseVersion]: 版本列表
        """
        try:
            query = (
                self.db.query(CourseVersion)
                .filter(CourseVersion.course_id == course_id)
                .order_by(desc(CourseVersion.timestamp))
            )

            if branch_name:
                query = query.filter(CourseVersion.branch_name == branch_name)

            versions = query.limit(limit).all()
            return versions

        except Exception as e:
            logger.error(f"获取课程版本历史失败: {e}")
            raise

    def get_version_by_commit(
        self, course_id: int, commit_hash: str
    ) -> Optional[CourseVersion]:
        """
        根据提交哈希获取特定版本

        Args:
            course_id: 课程ID
            commit_hash: 提交哈希

        Returns:
            Optional[CourseVersion]: 版本对象或None
        """
        try:
            version = (
                self.db.query(CourseVersion)
                .filter(
                    CourseVersion.course_id == course_id,
                    CourseVersion.commit_hash == commit_hash,
                )
                .first()
            )
            return version

        except Exception as e:
            logger.error(f"获取版本失败: {e}")
            raise

    def get_latest_version(
        self, course_id: int, branch_name: str = "main"
    ) -> Optional[CourseVersion]:
        """
        获取指定分支的最新版本

        Args:
            course_id: 课程ID
            branch_name: 分支名称

        Returns:
            Optional[CourseVersion]: 最新版本或None
        """
        try:
            version = (
                self.db.query(CourseVersion)
                .filter(
                    CourseVersion.course_id == course_id,
                    CourseVersion.branch_name == branch_name,
                    CourseVersion.is_head == True,
                )
                .first()
            )
            return version

        except Exception as e:
            logger.error(f"获取最新版本失败: {e}")
            raise

    def create_branch(
        self, course_id: int, org_id: int, branch_data: BranchCreate, current_user: User
    ) -> VersionBranch:
        """
        创建新分支

        Args:
            course_id: 课程ID
            org_id: 组织ID
            branch_data: 分支创建数据
            current_user: 当前用户

        Returns:
            VersionBranch: 创建的分支对象
        """
        try:
            # 验证课程存在
            course = (
                self.db.query(Course)
                .filter(Course.id == course_id, Course.org_id == org_id)
                .first()
            )

            if not course:
                raise ValueError("课程不存在")

            # 检查分支是否已存在
            existing_branch = (
                self.db.query(VersionBranch)
                .filter(
                    VersionBranch.course_id == course_id,
                    VersionBranch.name == branch_data.name,
                )
                .first()
            )

            if existing_branch:
                raise ValueError(f"分支 '{branch_data.name}' 已存在")

            # 获取主分支的最新版本作为新分支的基础
            main_version = self.get_latest_version(course_id, "main")

            # 创建分支
            branch = VersionBranch(
                course_id=course_id,
                org_id=org_id,
                name=branch_data.name,
                description=branch_data.description,
                head_commit_hash=main_version.commit_hash if main_version else None,
            )

            self.db.add(branch)
            self.db.commit()
            self.db.refresh(branch)

            logger.info(f"分支创建成功: Course {course_id}, Branch {branch_data.name}")
            return branch

        except Exception as e:
            self.db.rollback()
            logger.error(f"创建分支失败: {e}")
            raise

    def list_branches(self, course_id: int) -> List[VersionBranch]:
        """
        列出课程的所有分支

        Args:
            course_id: 课程ID

        Returns:
            List[VersionBranch]: 分支列表
        """
        try:
            branches = (
                self.db.query(VersionBranch)
                .filter(
                    VersionBranch.course_id == course_id,
                    VersionBranch.is_active == True,
                )
                .all()
            )
            return branches

        except Exception as e:
            logger.error(f"列出分支失败: {e}")
            raise

    def create_merge_request(
        self,
        course_id: int,
        org_id: int,
        mr_data: MergeRequestCreate,
        current_user: User,
    ) -> MergeRequest:
        """
        创建合并请求

        Args:
            course_id: 课程ID
            org_id: 组织ID
            mr_data: 合并请求数据
            current_user: 当前用户

        Returns:
            MergeRequest: 创建的合并请求对象
        """
        try:
            # 验证课程存在
            course = (
                self.db.query(Course)
                .filter(Course.id == course_id, Course.org_id == org_id)
                .first()
            )

            if not course:
                raise ValueError("课程不存在")

            # 验证分支存在
            source_branch = (
                self.db.query(VersionBranch)
                .filter(
                    VersionBranch.course_id == course_id,
                    VersionBranch.name == mr_data.source_branch,
                )
                .first()
            )

            target_branch = (
                self.db.query(VersionBranch)
                .filter(
                    VersionBranch.course_id == course_id,
                    VersionBranch.name == mr_data.target_branch,
                )
                .first()
            )

            if not source_branch or not target_branch:
                raise ValueError("源分支或目标分支不存在")

            # 检查是否存在相同的开放合并请求
            existing_mr = (
                self.db.query(MergeRequest)
                .filter(
                    MergeRequest.course_id == course_id,
                    MergeRequest.source_branch == mr_data.source_branch,
                    MergeRequest.target_branch == mr_data.target_branch,
                    MergeRequest.status == "open",
                )
                .first()
            )

            if existing_mr:
                raise ValueError("已存在相同的开放合并请求")

            # 检查是否有冲突
            has_conflicts, conflict_summary = self.check_merge_conflicts(
                course_id, mr_data.source_branch, mr_data.target_branch
            )

            # 创建合并请求
            merge_request = MergeRequest(
                course_id=course_id,
                org_id=org_id,
                source_branch=mr_data.source_branch,
                target_branch=mr_data.target_branch,
                title=mr_data.title,
                description=mr_data.description,
                author_email=current_user.email,
                has_conflicts=has_conflicts,
                conflict_summary=conflict_summary if has_conflicts else None,
            )

            self.db.add(merge_request)
            self.db.commit()
            self.db.refresh(merge_request)

            logger.info(
                f"合并请求创建成功: Course {course_id}, "
                f"{mr_data.source_branch} -> {mr_data.target_branch}"
            )
            return merge_request

        except Exception as e:
            self.db.rollback()
            logger.error(f"创建合并请求失败: {e}")
            raise

    def check_merge_conflicts(
        self, course_id: int, source_branch: str, target_branch: str
    ) -> Tuple[bool, Optional[Dict]]:
        """
        检查两个分支合并是否有冲突

        Args:
            course_id: 课程ID
            source_branch: 源分支
            target_branch: 目标分支

        Returns:
            Tuple[bool, Optional[Dict]]: (是否有冲突, 冲突详情)
        """
        try:
            # 获取两个分支的最新版本
            source_version = self.get_latest_version(course_id, source_branch)
            target_version = self.get_latest_version(course_id, target_branch)

            if not source_version or not target_version:
                return False, None

            # 执行合并检查
            success, merge_result = source_version.merge_with_version(target_version)

            return not merge_result.get("successful_merge", True), merge_result.get(
                "conflicts"
            )

        except Exception as e:
            logger.error(f"检查合并冲突失败: {e}")
            return True, {"error": str(e)}

    def merge_branches(
        self, merge_request_id: int, org_id: int, current_user: User
    ) -> CourseVersion:
        """
        执行分支合并

        Args:
            merge_request_id: 合并请求ID
            org_id: 组织ID
            current_user: 当前用户

        Returns:
            CourseVersion: 合并后的版本
        """
        try:
            # 获取合并请求
            merge_request = (
                self.db.query(MergeRequest)
                .filter(
                    MergeRequest.id == merge_request_id, MergeRequest.org_id == org_id
                )
                .first()
            )

            if not merge_request:
                raise ValueError("合并请求不存在")

            if merge_request.status != "open":
                raise ValueError("合并请求已关闭或已完成")

            # 获取源分支和目标分支的最新版本
            source_version = self.get_latest_version(
                merge_request.course_id, merge_request.source_branch
            )
            target_version = self.get_latest_version(
                merge_request.course_id, merge_request.target_branch
            )

            if not source_version or not target_version:
                raise ValueError("源分支或目标分支没有可用版本")

            # 执行合并
            success, merge_result = source_version.merge_with_version(target_version)

            if not success:
                raise ValueError(f"合并失败: {merge_result.get('error', '未知错误')}")

            # 创建合并提交
            merge_commit = CourseVersion(
                course_id=merge_request.course_id,
                org_id=org_id,
                version_number=target_version.version_number + 1,
                parent_commit_hash=target_version.commit_hash,
                author_email=current_user.email,
                author_name=f"{current_user.first_name} {current_user.last_name}".strip(),
                commit_message=f"Merge {merge_request.source_branch} into {merge_request.target_branch}: {merge_request.title}",
                course_snapshot=merge_result.get("merged_data", {}),
                branch_name=merge_request.target_branch,
                is_head=True,
            )

            # 计算变更摘要
            changes_summary = merge_commit.calculate_changes_from_parent(target_version)
            merge_commit.changes_summary = changes_summary

            # 保存合并提交
            self.db.add(merge_commit)

            # 更新目标分支的HEAD
            target_version.is_head = False
            self.db.add(target_version)

            # 更新合并请求状态
            merge_request.status = "merged"
            merge_request.merge_commit_hash = merge_commit.commit_hash
            merge_request.merged_at = datetime.utcnow()
            self.db.add(merge_request)

            self.db.commit()
            self.db.refresh(merge_request)
            self.db.refresh(merge_commit)

            logger.info(f"分支合并成功: MR #{merge_request_id}")
            return merge_commit

        except Exception as e:
            self.db.rollback()
            logger.error(f"合并分支失败: {e}")
            raise

    def revert_to_version(
        self,
        course_id: int,
        commit_hash: str,
        org_id: int,
        current_user: User,
        commit_message: Optional[str] = None,
    ) -> CourseVersion:
        """
        回滚到指定版本

        Args:
            course_id: 课程ID
            commit_hash: 目标版本的提交哈希
            org_id: 组织ID
            current_user: 当前用户
            commit_message: 回滚提交消息

        Returns:
            CourseVersion: 回滚后的版本
        """
        try:
            # 获取目标版本
            target_version = self.get_version_by_commit(course_id, commit_hash)
            if not target_version:
                raise ValueError("指定版本不存在")

            # 获取当前最新版本
            current_version = self.get_latest_version(
                course_id, target_version.branch_name
            )

            # 创建回滚提交
            revert_message = (
                commit_message or f"Revert to version {target_version.version_number}"
            )

            revert_version = CourseVersion(
                course_id=course_id,
                org_id=org_id,
                version_number=(
                    (current_version.version_number + 1) if current_version else 1
                ),
                parent_commit_hash=(
                    current_version.commit_hash if current_version else None
                ),
                author_email=current_user.email,
                author_name=f"{current_user.first_name} {current_user.last_name}".strip(),
                commit_message=revert_message,
                course_snapshot=target_version.course_snapshot,
                branch_name=target_version.branch_name,
                is_head=True,
            )

            # 计算变更摘要
            changes_summary = revert_version.calculate_changes_from_parent(
                current_version
            )
            revert_version.changes_summary = changes_summary

            # 保存回滚版本
            self.db.add(revert_version)

            # 更新当前HEAD
            if current_version:
                current_version.is_head = False
                self.db.add(current_version)

            self.db.commit()
            self.db.refresh(revert_version)

            logger.info(f"版本回滚成功: Course {course_id}, Commit {commit_hash[:8]}")
            return revert_version

        except Exception as e:
            self.db.rollback()
            logger.error(f"版本回滚失败: {e}")
            raise

    def compare_versions(
        self, course_id: int, from_commit: str, to_commit: str
    ) -> Dict[str, Any]:
        """
        比较两个版本的差异

        Args:
            course_id: 课程ID
            from_commit: 起始版本提交哈希
            to_commit: 结束版本提交哈希

        Returns:
            Dict[str, Any]: 差异信息
        """
        try:
            from_version = self.get_version_by_commit(course_id, from_commit)
            to_version = self.get_version_by_commit(course_id, to_commit)

            if not from_version or not to_version:
                raise ValueError("指定版本不存在")

            # 计算差异
            changes = to_version.calculate_changes_from_parent(from_version)

            return {
                "from_version": from_version.version_number,
                "to_version": to_version.version_number,
                "from_commit": from_commit,
                "to_commit": to_commit,
                "changes": changes,
                "author": to_version.author_name,
                "timestamp": to_version.timestamp,
            }

        except Exception as e:
            logger.error(f"版本比较失败: {e}")
            raise


# 依赖注入函数
def get_course_version_service(
    db: Session = Depends(get_sync_db),
) -> CourseVersionService:
    """获取课程版本服务实例"""
    return CourseVersionService(db)
