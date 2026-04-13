"""
课程管理API路由
支持多租户的课程管理功能
"""

import logging
from typing import List, Optional

from fastapi import APIRouter, Body, Depends, HTTPException, Path, Query
from sqlalchemy.orm import Session

from middleware.tenant_middleware import require_tenant_access
from models.course import (
    CourseCreate,
    CourseEnrollmentCreate,
    CourseEnrollmentResponse,
    CourseResponse,
    CourseStatus,
    CourseUpdate,
    EnrollmentStatus,
)
from models.user import User
from services.course_service import CourseService
from utils.auth_utils import get_current_user_sync
from utils.database import get_sync_db

logger = logging.getLogger(__name__)

# 创建路由器实例
router = APIRouter(prefix="/api/v1/org/{org_id}", tags=["课程管理"])


# 依赖项
def get_course_service(db: Session = Depends(get_sync_db)) -> CourseService:
    """获取课程服务实例"""
    return CourseService(db)


def validate_org_access(
    org_id: int = Path(..., description="组织ID"),
    current_user: User = Depends(get_current_user_sync),
    db: Session = Depends(get_sync_db),
) -> bool:
    """验证用户对组织的访问权限"""
    return require_tenant_access(org_id, current_user, db)


# 课程管理API
@router.post("/courses", response_model=CourseResponse, summary="创建课程")
def create_course(
    org_id: int = Path(..., description="组织ID"),
    course_data: CourseCreate = Body(..., description="课程创建数据"),
    current_user: User = Depends(get_current_user_sync),
    course_service: CourseService = Depends(get_course_service),
    db: Session = Depends(get_sync_db),
):
    """
    为指定组织创建新课程

    - **org_id**: 组织ID（路径参数）
    - **course_data**: 课程创建数据
    """
    try:
        # 验证权限
        validate_org_access(org_id, current_user, db)

        # 创建课程
        course = course_service.create_course(org_id, course_data, current_user)
        return course
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"创建课程失败: {e}")
        raise HTTPException(status_code=500, detail=f"创建课程失败: {str(e)}")


@router.get("/courses", response_model=List[CourseResponse], summary="获取课程列表")
def list_courses(
    org_id: int = Path(..., description="组织ID"),
    skip: int = Query(0, ge=0, description="跳过的记录数"),
    limit: int = Query(100, ge=1, le=1000, description="返回记录数"),
    status: Optional[CourseStatus] = Query(None, description="课程状态筛选"),
    category_id: Optional[int] = Query(None, description="分类ID筛选"),
    instructor_id: Optional[int] = Query(None, description="讲师ID筛选"),
    is_featured: Optional[bool] = Query(None, description="是否推荐课程"),
    search: Optional[str] = Query(None, description="搜索关键词"),
    current_user: User = Depends(get_current_user_sync),
    course_service: CourseService = Depends(get_course_service),
    db: Session = Depends(get_sync_db),
):
    """
    获取指定组织的课程列表

    支持多种筛选条件和分页
    """
    try:
        # 验证权限
        validate_org_access(org_id, current_user, db)

        # 构建筛选条件
        filters = {}
        if status:
            filters["status"] = status
        if category_id:
            filters["category_id"] = category_id
        if instructor_id:
            filters["instructor_id"] = instructor_id
        if is_featured is not None:
            filters["is_featured"] = is_featured
        if search:
            filters["search"] = search

        courses = course_service.list_courses(org_id, skip, limit, filters)
        return courses
    except Exception as e:
        logger.error(f"获取课程列表失败: {e}")
        raise HTTPException(status_code=500, detail=f"获取课程列表失败: {str(e)}")


@router.get(
    "/courses/{course_id}", response_model=CourseResponse, summary="获取课程详情"
)
def get_course(
    org_id: int = Path(..., description="组织ID"),
    course_id: int = Path(..., description="课程ID"),
    current_user: User = Depends(get_current_user_sync),
    course_service: CourseService = Depends(get_course_service),
    db: Session = Depends(get_sync_db),
):
    """
    获取指定课程的详细信息
    """
    try:
        # 验证权限
        validate_org_access(org_id, current_user, db)

        course = course_service.get_course(org_id, course_id)
        if not course:
            raise HTTPException(status_code=404, detail="课程不存在")

        return course
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"获取课程详情失败: {e}")
        raise HTTPException(status_code=500, detail=f"获取课程详情失败: {str(e)}")


@router.put("/courses/{course_id}", response_model=CourseResponse, summary="更新课程")
def update_course(
    org_id: int = Path(..., description="组织ID"),
    course_id: int = Path(..., description="课程ID"),
    course_update: CourseUpdate = Body(..., description="课程更新数据"),
    current_user: User = Depends(get_current_user_sync),
    course_service: CourseService = Depends(get_course_service),
    db: Session = Depends(get_sync_db),
):
    """
    更新指定课程的信息
    """
    try:
        # 验证权限
        validate_org_access(org_id, current_user, db)

        course = course_service.update_course(
            org_id, course_id, course_update, current_user
        )
        if not course:
            raise HTTPException(status_code=404, detail="课程不存在")

        return course
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"更新课程失败: {e}")
        raise HTTPException(status_code=500, detail=f"更新课程失败: {str(e)}")


@router.delete("/courses/{course_id}", summary="删除课程")
def delete_course(
    org_id: int = Path(..., description="组织ID"),
    course_id: int = Path(..., description="课程ID"),
    current_user: User = Depends(get_current_user_sync),
    course_service: CourseService = Depends(get_course_service),
    db: Session = Depends(get_sync_db),
):
    """
    删除指定课程
    """
    try:
        # 验证权限
        validate_org_access(org_id, current_user, db)

        success = course_service.delete_course(org_id, course_id, current_user)
        if not success:
            raise HTTPException(status_code=404, detail="课程不存在或删除失败")

        return {"message": "课程删除成功"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"删除课程失败: {e}")
        raise HTTPException(status_code=500, detail=f"删除课程失败: {str(e)}")


# 课程分类API
@router.post("/course-categories", summary="创建课程分类")
def create_course_category(
    org_id: int = Path(..., description="组织ID"),
    category_data: dict = Body(..., description="分类数据"),
    current_user: User = Depends(get_current_user_sync),
    course_service: CourseService = Depends(get_course_service),
    db: Session = Depends(get_sync_db),
):
    """
    为指定组织创建课程分类
    """
    try:
        # 验证权限
        validate_org_access(org_id, current_user, db)

        category = course_service.create_category(org_id, category_data)
        return category
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"创建课程分类失败: {e}")
        raise HTTPException(status_code=500, detail=f"创建课程分类失败: {str(e)}")


@router.get("/course-categories", summary="获取课程分类列表")
def list_course_categories(
    org_id: int = Path(..., description="组织ID"),
    include_inactive: bool = Query(False, description="是否包含非活跃分类"),
    current_user: User = Depends(get_current_user_sync),
    course_service: CourseService = Depends(get_course_service),
    db: Session = Depends(get_sync_db),
):
    """
    获取指定组织的课程分类列表
    """
    try:
        # 验证权限
        validate_org_access(org_id, current_user, db)

        categories = course_service.list_categories(org_id, include_inactive)
        return categories
    except Exception as e:
        logger.error(f"获取课程分类列表失败: {e}")
        raise HTTPException(status_code=500, detail=f"获取课程分类列表失败: {str(e)}")


# 选课管理API
@router.post(
    "/enrollments", response_model=CourseEnrollmentResponse, summary="创建选课记录"
)
def create_enrollment(
    org_id: int = Path(..., description="组织ID"),
    enrollment_data: CourseEnrollmentCreate = Body(..., description="选课数据"),
    current_user: User = Depends(get_current_user_sync),
    course_service: CourseService = Depends(get_course_service),
    db: Session = Depends(get_sync_db),
):
    """
    为学生创建选课记录
    """
    try:
        # 验证权限
        validate_org_access(org_id, current_user, db)

        enrollment = course_service.create_enrollment(
            org_id, enrollment_data, current_user
        )
        return enrollment
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"创建选课记录失败: {e}")
        raise HTTPException(status_code=500, detail=f"创建选课记录失败: {str(e)}")


@router.get(
    "/courses/{course_id}/enrollments",
    response_model=List[CourseEnrollmentResponse],
    summary="获取课程选课列表",
)
def get_course_enrollments(
    org_id: int = Path(..., description="组织ID"),
    course_id: int = Path(..., description="课程ID"),
    status: Optional[EnrollmentStatus] = Query(None, description="选课状态筛选"),
    current_user: User = Depends(get_current_user_sync),
    course_service: CourseService = Depends(get_course_service),
    db: Session = Depends(get_sync_db),
):
    """
    获取指定课程的选课列表
    """
    try:
        # 验证权限
        validate_org_access(org_id, current_user, db)

        enrollments = course_service.get_course_enrollments(org_id, course_id, status)
        return enrollments
    except Exception as e:
        logger.error(f"获取课程选课列表失败: {e}")
        raise HTTPException(status_code=500, detail=f"获取课程选课列表失败: {str(e)}")


@router.get(
    "/students/{student_id}/enrollments",
    response_model=List[CourseEnrollmentResponse],
    summary="获取学生选课列表",
)
def get_student_enrollments(
    org_id: int = Path(..., description="组织ID"),
    student_id: int = Path(..., description="学生ID"),
    status: Optional[EnrollmentStatus] = Query(None, description="选课状态筛选"),
    current_user: User = Depends(get_current_user_sync),
    course_service: CourseService = Depends(get_course_service),
    db: Session = Depends(get_sync_db),
):
    """
    获取指定学生的选课列表
    """
    try:
        # 验证权限
        validate_org_access(org_id, current_user, db)

        # 验证用户是否有权限查看该学生的选课信息
        if not course_service.can_view_student_enrollments(current_user, student_id):
            raise HTTPException(status_code=403, detail="无权查看该学生的选课信息")

        enrollments = course_service.get_student_enrollments(org_id, student_id, status)
        return enrollments
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"获取学生选课列表失败: {e}")
        raise HTTPException(status_code=500, detail=f"获取学生选课列表失败: {str(e)}")


# 课程统计API
@router.get("/courses/statistics", summary="获取课程统计信息")
def get_course_statistics(
    org_id: int = Path(..., description="组织ID"),
    current_user: User = Depends(get_current_user_sync),
    course_service: CourseService = Depends(get_course_service),
    db: Session = Depends(get_sync_db),
):
    """
    获取指定组织的课程统计信息
    """
    try:
        # 验证权限
        validate_org_access(org_id, current_user, db)

        stats = course_service.get_course_statistics(org_id)
        return stats
    except Exception as e:
        logger.error(f"获取课程统计信息失败: {e}")
        raise HTTPException(status_code=500, detail=f"获取课程统计信息失败: {str(e)}")


# 搜索API
@router.get("/courses/search", response_model=List[CourseResponse], summary="搜索课程")
def search_courses(
    org_id: int = Path(..., description="组织ID"),
    query: str = Query(..., description="搜索关键词"),
    limit: int = Query(20, ge=1, le=100, description="返回记录数"),
    current_user: User = Depends(get_current_user_sync),
    course_service: CourseService = Depends(get_course_service),
    db: Session = Depends(get_sync_db),
):
    """
    在指定组织内搜索课程
    """
    try:
        # 验证权限
        validate_org_access(org_id, current_user, db)

        courses = course_service.search_courses(org_id, query, limit)
        return courses
    except Exception as e:
        logger.error(f"搜索课程失败: {e}")
        raise HTTPException(status_code=500, detail=f"搜索课程失败: {str(e)}")
