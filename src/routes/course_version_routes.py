"""
课程版本控制API路由
提供Git-like的版本控制接口
"""

import logging
from typing import List, Optional

from fastapi import APIRouter, Body, Depends, HTTPException, Path, Query
from sqlalchemy.orm import Session

from middleware.tenant_middleware import require_tenant_access
from models.course_version import (
    BranchCreate,
    BranchResponse,
    CourseVersion,
    CourseVersionCreate,
    CourseVersionResponse,
    MergeRequest,
    MergeRequestCreate,
    MergeRequestResponse,
    VersionBranch,
)
from models.user import User
from services.course_version_service import CourseVersionService
from utils.auth_utils import get_current_user_sync
from utils.database import get_sync_db

logger = logging.getLogger(__name__)

# 创建路由器实例
router = APIRouter(
    prefix="/api/v1/org/{org_id}/courses/{course_id}", tags=["课程版本控制"]
)


# 依赖项
def get_version_service(db: Session = Depends(get_sync_db)) -> CourseVersionService:
    """获取版本服务实例"""
    return CourseVersionService(db)


def validate_course_access(
    org_id: int = Path(..., description="组织ID"),
    course_id: int = Path(..., description="课程ID"),
    current_user: User = Depends(get_current_user_sync),
    db: Session = Depends(get_sync_db),
) -> bool:
    """验证用户对课程的访问权限"""
    return require_tenant_access(org_id, current_user, db)


# 版本管理API
@router.post("/versions", response_model=CourseVersionResponse, summary="提交新版本")
def commit_version(
    org_id: int = Path(..., description="组织ID"),
    course_id: int = Path(..., description="课程ID"),
    version_data: CourseVersionCreate = Body(..., description="版本提交数据"),
    current_user: User = Depends(get_current_user_sync),
    version_service: CourseVersionService = Depends(get_version_service),
    db: Session = Depends(get_sync_db),
):
    """
    提交课程的新版本

    类似于Git的commit操作，保存课程的当前状态作为一个新的版本
    """
    try:
        # 验证权限
        validate_course_access(org_id, course_id, current_user, db)

        # 确保version_data中的course_id匹配路径参数
        if version_data.course_id != course_id:
            raise HTTPException(status_code=400, detail="课程ID不匹配")

        version = version_service.commit_course_version(
            org_id, version_data, current_user
        )
        return version
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"提交版本失败: {e}")
        raise HTTPException(status_code=500, detail=f"提交版本失败: {str(e)}")


@router.get(
    "/versions", response_model=List[CourseVersionResponse], summary="获取版本历史"
)
def get_versions(
    org_id: int = Path(..., description="组织ID"),
    course_id: int = Path(..., description="课程ID"),
    branch: Optional[str] = Query(None, description="分支名称"),
    limit: int = Query(50, ge=1, le=100, description="返回记录数"),
    current_user: User = Depends(get_current_user_sync),
    version_service: CourseVersionService = Depends(get_version_service),
    db: Session = Depends(get_sync_db),
):
    """
    获取课程的版本历史记录

    支持按分支筛选，默认返回最新的50个版本
    """
    try:
        # 验证权限
        validate_course_access(org_id, course_id, current_user, db)

        versions = version_service.get_course_versions(course_id, branch, limit)
        return versions
    except Exception as e:
        logger.error(f"获取版本历史失败: {e}")
        raise HTTPException(status_code=500, detail=f"获取版本历史失败: {str(e)}")


@router.get(
    "/versions/{commit_hash}",
    response_model=CourseVersionResponse,
    summary="获取特定版本",
)
def get_version(
    org_id: int = Path(..., description="组织ID"),
    course_id: int = Path(..., description="课程ID"),
    commit_hash: str = Path(..., description="提交哈希"),
    current_user: User = Depends(get_current_user_sync),
    version_service: CourseVersionService = Depends(get_version_service),
    db: Session = Depends(get_sync_db),
):
    """
    根据提交哈希获取特定版本的详细信息
    """
    try:
        # 验证权限
        validate_course_access(org_id, course_id, current_user, db)

        version = version_service.get_version_by_commit(course_id, commit_hash)
        if not version:
            raise HTTPException(status_code=404, detail="版本不存在")

        return version
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"获取版本失败: {e}")
        raise HTTPException(status_code=500, detail=f"获取版本失败: {str(e)}")


@router.get("/versions/{commit_hash}/content", summary="获取版本内容")
def get_version_content(
    org_id: int = Path(..., description="组织ID"),
    course_id: int = Path(..., description="课程ID"),
    commit_hash: str = Path(..., description="提交哈希"),
    current_user: User = Depends(get_current_user_sync),
    version_service: CourseVersionService = Depends(get_version_service),
    db: Session = Depends(get_sync_db),
):
    """
    获取指定版本的完整课程内容
    """
    try:
        # 验证权限
        validate_course_access(org_id, course_id, current_user, db)

        version = version_service.get_version_by_commit(course_id, commit_hash)
        if not version:
            raise HTTPException(status_code=404, detail="版本不存在")

        return {
            "commit_hash": commit_hash,
            "version_number": version.version_number,
            "timestamp": version.timestamp,
            "author": version.author_name,
            "course_content": version.course_snapshot,
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"获取版本内容失败: {e}")
        raise HTTPException(status_code=500, detail=f"获取版本内容失败: {str(e)}")


# 分支管理API
@router.post("/branches", response_model=BranchResponse, summary="创建新分支")
def create_branch(
    org_id: int = Path(..., description="组织ID"),
    course_id: int = Path(..., description="课程ID"),
    branch_data: BranchCreate = Body(..., description="分支创建数据"),
    current_user: User = Depends(get_current_user_sync),
    version_service: CourseVersionService = Depends(get_version_service),
    db: Session = Depends(get_sync_db),
):
    """
    基于当前主分支创建新分支

    类似于Git的branch操作
    """
    try:
        # 验证权限
        validate_course_access(org_id, course_id, current_user, db)

        branch = version_service.create_branch(
            course_id, org_id, branch_data, current_user
        )
        return branch
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"创建分支失败: {e}")
        raise HTTPException(status_code=500, detail=f"创建分支失败: {str(e)}")


@router.get("/branches", response_model=List[BranchResponse], summary="列出所有分支")
def list_branches(
    org_id: int = Path(..., description="组织ID"),
    course_id: int = Path(..., description="课程ID"),
    current_user: User = Depends(get_current_user_sync),
    version_service: CourseVersionService = Depends(get_version_service),
    db: Session = Depends(get_sync_db),
):
    """
    列出课程的所有活跃分支
    """
    try:
        # 验证权限
        validate_course_access(org_id, course_id, current_user, db)

        branches = version_service.list_branches(course_id)
        return branches
    except Exception as e:
        logger.error(f"列出分支失败: {e}")
        raise HTTPException(status_code=500, detail=f"列出分支失败: {str(e)}")


@router.get(
    "/branches/{branch_name}", response_model=BranchResponse, summary="获取分支详情"
)
def get_branch(
    org_id: int = Path(..., description="组织ID"),
    course_id: int = Path(..., description="课程ID"),
    branch_name: str = Path(..., description="分支名称"),
    current_user: User = Depends(get_current_user_sync),
    version_service: CourseVersionService = Depends(get_version_service),
    db: Session = Depends(get_sync_db),
):
    """
    获取指定分支的详细信息
    """
    try:
        # 验证权限
        validate_course_access(org_id, course_id, current_user, db)

        branch = (
            version_service.db.query(VersionBranch)
            .filter(
                VersionBranch.course_id == course_id, VersionBranch.name == branch_name
            )
            .first()
        )

        if not branch:
            raise HTTPException(status_code=404, detail="分支不存在")

        return branch
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"获取分支详情失败: {e}")
        raise HTTPException(status_code=500, detail=f"获取分支详情失败: {str(e)}")


# 合并请求API
@router.post(
    "/merge-requests", response_model=MergeRequestResponse, summary="创建合并请求"
)
def create_merge_request(
    org_id: int = Path(..., description="组织ID"),
    course_id: int = Path(..., description="课程ID"),
    mr_data: MergeRequestCreate = Body(..., description="合并请求数据"),
    current_user: User = Depends(get_current_user_sync),
    version_service: CourseVersionService = Depends(get_version_service),
    db: Session = Depends(get_sync_db),
):
    """
    创建从源分支到目标分支的合并请求

    类似于Git的pull request或merge request
    """
    try:
        # 验证权限
        validate_course_access(org_id, course_id, current_user, db)

        merge_request = version_service.create_merge_request(
            course_id, org_id, mr_data, current_user
        )
        return merge_request
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"创建合并请求失败: {e}")
        raise HTTPException(status_code=500, detail=f"创建合并请求失败: {str(e)}")


@router.get(
    "/merge-requests", response_model=List[MergeRequestResponse], summary="列出合并请求"
)
def list_merge_requests(
    org_id: int = Path(..., description="组织ID"),
    course_id: int = Path(..., description="课程ID"),
    status: Optional[str] = Query(None, description="状态筛选: open/closed/merged"),
    current_user: User = Depends(get_current_user_sync),
    version_service: CourseVersionService = Depends(get_version_service),
    db: Session = Depends(get_sync_db),
):
    """
    列出课程的所有合并请求，支持按状态筛选
    """
    try:
        # 验证权限
        validate_course_access(org_id, course_id, current_user, db)

        query = version_service.db.query(MergeRequest).filter(
            MergeRequest.course_id == course_id, MergeRequest.org_id == org_id
        )

        if status:
            query = query.filter(MergeRequest.status == status)

        merge_requests = query.order_by(MergeRequest.created_at.desc()).all()
        return merge_requests
    except Exception as e:
        logger.error(f"列出合并请求失败: {e}")
        raise HTTPException(status_code=500, detail=f"列出合并请求失败: {str(e)}")


@router.post(
    "/merge-requests/{mr_id}/merge",
    response_model=CourseVersionResponse,
    summary="执行合并",
)
def execute_merge(
    org_id: int = Path(..., description="组织ID"),
    course_id: int = Path(..., description="课程ID"),
    mr_id: int = Path(..., description="合并请求ID"),
    current_user: User = Depends(get_current_user_sync),
    version_service: CourseVersionService = Depends(get_version_service),
    db: Session = Depends(get_sync_db),
):
    """
    执行合并请求，将源分支的内容合并到目标分支

    类似于Git的merge操作
    """
    try:
        # 验证权限
        validate_course_access(org_id, course_id, current_user, db)

        merged_version = version_service.merge_branches(mr_id, org_id, current_user)
        return merged_version
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"执行合并失败: {e}")
        raise HTTPException(status_code=500, detail=f"执行合并失败: {str(e)}")


@router.get("/merge-requests/{mr_id}/conflicts", summary="检查合并冲突")
def check_merge_conflicts(
    org_id: int = Path(..., description="组织ID"),
    course_id: int = Path(..., description="课程ID"),
    mr_id: int = Path(..., description="合并请求ID"),
    current_user: User = Depends(get_current_user_sync),
    version_service: CourseVersionService = Depends(get_version_service),
    db: Session = Depends(get_sync_db),
):
    """
    检查合并请求是否存在冲突
    """
    try:
        # 验证权限
        validate_course_access(org_id, course_id, current_user, db)

        # 获取合并请求
        merge_request = (
            version_service.db.query(MergeRequest)
            .filter(
                MergeRequest.id == mr_id,
                MergeRequest.course_id == course_id,
                MergeRequest.org_id == org_id,
            )
            .first()
        )

        if not merge_request:
            raise HTTPException(status_code=404, detail="合并请求不存在")

        # 检查冲突
        has_conflicts, conflict_details = version_service.check_merge_conflicts(
            course_id, merge_request.source_branch, merge_request.target_branch
        )

        return {
            "has_conflicts": has_conflicts,
            "conflict_details": conflict_details,
            "source_branch": merge_request.source_branch,
            "target_branch": merge_request.target_branch,
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"检查合并冲突失败: {e}")
        raise HTTPException(status_code=500, detail=f"检查合并冲突失败: {str(e)}")


# 版本对比和回滚API
@router.get("/compare/{from_commit}...{to_commit}", summary="比较版本差异")
def compare_versions(
    org_id: int = Path(..., description="组织ID"),
    course_id: int = Path(..., description="课程ID"),
    from_commit: str = Path(..., description="起始版本提交哈希"),
    to_commit: str = Path(..., description="结束版本提交哈希"),
    current_user: User = Depends(get_current_user_sync),
    version_service: CourseVersionService = Depends(get_version_service),
    db: Session = Depends(get_sync_db),
):
    """
    比较两个版本之间的差异

    类似于Git的diff操作
    """
    try:
        # 验证权限
        validate_course_access(org_id, course_id, current_user, db)

        diff_result = version_service.compare_versions(
            course_id, from_commit, to_commit
        )
        return diff_result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"版本比较失败: {e}")
        raise HTTPException(status_code=500, detail=f"版本比较失败: {str(e)}")


@router.post(
    "/versions/{commit_hash}/revert",
    response_model=CourseVersionResponse,
    summary="回滚到指定版本",
)
def revert_to_version(
    org_id: int = Path(..., description="组织ID"),
    course_id: int = Path(..., description="课程ID"),
    commit_hash: str = Path(..., description="目标版本提交哈希"),
    commit_message: Optional[str] = Body(None, description="回滚提交消息"),
    current_user: User = Depends(get_current_user_sync),
    version_service: CourseVersionService = Depends(get_version_service),
    db: Session = Depends(get_sync_db),
):
    """
    回滚到指定的历史版本

    类似于Git的revert操作
    """
    try:
        # 验证权限
        validate_course_access(org_id, course_id, current_user, db)

        reverted_version = version_service.revert_to_version(
            course_id, commit_hash, org_id, current_user, commit_message
        )
        return reverted_version
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"版本回滚失败: {e}")
        raise HTTPException(status_code=500, detail=f"版本回滚失败: {str(e)}")


# 版本统计API
@router.get("/versions/stats", summary="获取版本统计信息")
def get_version_statistics(
    org_id: int = Path(..., description="组织ID"),
    course_id: int = Path(..., description="课程ID"),
    current_user: User = Depends(get_current_user_sync),
    version_service: CourseVersionService = Depends(get_version_service),
    db: Session = Depends(get_sync_db),
):
    """
    获取课程版本控制的统计信息
    """
    try:
        # 验证权限
        validate_course_access(org_id, course_id, current_user, db)

        # 获取版本总数
        total_versions = (
            version_service.db.query(CourseVersion)
            .filter(CourseVersion.course_id == course_id)
            .count()
        )

        # 获取分支数
        total_branches = (
            version_service.db.query(VersionBranch)
            .filter(
                VersionBranch.course_id == course_id, VersionBranch.is_active == True
            )
            .count()
        )

        # 获取合并请求数
        total_merge_requests = (
            version_service.db.query(MergeRequest)
            .filter(MergeRequest.course_id == course_id)
            .count()
        )

        # 获取各状态的合并请求数
        open_mrs = (
            version_service.db.query(MergeRequest)
            .filter(MergeRequest.course_id == course_id, MergeRequest.status == "open")
            .count()
        )

        merged_mrs = (
            version_service.db.query(MergeRequest)
            .filter(
                MergeRequest.course_id == course_id, MergeRequest.status == "merged"
            )
            .count()
        )

        # 获取最近的版本
        latest_version = version_service.get_latest_version(course_id)

        return {
            "total_versions": total_versions,
            "total_branches": total_branches,
            "total_merge_requests": total_merge_requests,
            "open_merge_requests": open_mrs,
            "merged_merge_requests": merged_mrs,
            "latest_version": (
                {
                    "version_number": (
                        latest_version.version_number if latest_version else None
                    ),
                    "commit_hash": (
                        latest_version.commit_hash[:8] if latest_version else None
                    ),
                    "timestamp": latest_version.timestamp if latest_version else None,
                    "author": latest_version.author_name if latest_version else None,
                }
                if latest_version
                else None
            ),
        }
    except Exception as e:
        logger.error(f"获取版本统计失败: {e}")
        raise HTTPException(status_code=500, detail=f"获取版本统计失败: {str(e)}")
