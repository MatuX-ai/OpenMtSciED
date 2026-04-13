"""
统一课程库API路由
为多角色（教师、学生、机构管理员、学校管理员、教育局）提供统一的课程数据和管理接口
支持多场景：校本课程、培训机构课程、在线平台课程、AI生成课程、兴趣班
"""

import logging
from typing import List, Optional
from datetime import datetime

from fastapi import APIRouter, Body, Depends, HTTPException, Path, Query, status
from sqlalchemy.orm import Session

from models.unified_course import (
    UnifiedCourse,
    UnifiedCourseCreate,
    UnifiedCourseUpdate,
    UnifiedCourseResponse,
    CourseStatus,
    CourseScenarioType,
    CourseChapter,
    CourseLesson,
    CourseReview,
    CourseEnrollment,
    EnrollmentStatus
)
from models.course_relationship import (
    CourseOrganization,
    CourseTeacher,
    CourseStudent
)
from models.user import User
from services.unified_course_service import UnifiedCourseService
from services.course_enrollment_service import CourseEnrollmentService
from services.course_progress_service import CourseProgressService
from middleware.tenant_middleware import require_tenant_access
from utils.auth_utils import get_current_user_sync
from utils.database import get_sync_db

logger = logging.getLogger(__name__)

# 创建路由器实例
router = APIRouter(prefix="/api/v1/unified-courses", tags=["统一课程库"])


# ==================== 依赖项 ====================

def get_unified_course_service(db: Session = Depends(get_sync_db)) -> UnifiedCourseService:
    """获取统一课程服务实例"""
    return UnifiedCourseService(db)


def get_enrollment_service(db: Session = Depends(get_sync_db)) -> CourseEnrollmentService:
    """获取课程报名服务实例"""
    return CourseEnrollmentService(db)


def get_progress_service(db: Session = Depends(get_sync_db)) -> CourseProgressService:
    """获取课程进度服务实例"""
    return CourseProgressService(db)


def validate_org_access(
    org_id: int,
    current_user: User,
    db: Session
) -> bool:
    """验证用户对组织的访问权限"""
    return require_tenant_access(org_id, current_user, db)


# ==================== 课程管理API ====================

@router.post("/courses", response_model=dict, summary="创建课程")
def create_course(
    course_data: UnifiedCourseCreate = Body(..., description="课程创建数据"),
    current_user: User = Depends(get_current_user_sync),
    course_service: UnifiedCourseService = Depends(get_unified_course_service),
    db: Session = Depends(get_sync_db)
):
    """
    创建新课程

    支持多种课程场景类型：校本课程、培训机构课程、在线平台课程、AI生成课程、兴趣班
    """
    try:
        # 验证权限
        validate_org_access(course_data.org_id, current_user, db)

        # 创建课程
        course = course_service.create_course(course_data, current_user.id)
        return {
            "success": True,
            "data": course,
            "message": "课程创建成功"
        }
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        logger.error(f"创建课程失败: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"创建课程失败: {str(e)}")


@router.get("/courses/{course_id}", response_model=dict, summary="获取课程详情")
def get_course(
    course_id: int = Path(..., description="课程ID"),
    current_user: User = Depends(get_current_user_sync),
    course_service: UnifiedCourseService = Depends(get_unified_course_service),
    db: Session = Depends(get_sync_db)
):
    """获取课程详细信息"""
    try:
        course = course_service.get_course(course_id)

        # 检查访问权限
        if course.visibility == 'private':
            validate_org_access(course.org_id, current_user, db)

        return {
            "success": True,
            "data": course
        }
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except Exception as e:
        logger.error(f"获取课程详情失败: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"获取课程详情失败: {str(e)}")


@router.get("/courses", response_model=dict, summary="获取课程列表")
def list_courses(
    scenario_type: Optional[CourseScenarioType] = Query(None, description="课程场景类型"),
    category: Optional[str] = Query(None, description="课程分类"),
    level: Optional[str] = Query(None, description="课程级别"),
    status: Optional[CourseStatus] = Query(None, description="课程状态"),
    org_id: Optional[int] = Query(None, description="组织ID"),
    is_free: Optional[bool] = Query(None, description="是否免费"),
    min_rating: Optional[float] = Query(None, ge=0, le=5, description="最低评分"),
    tags: Optional[str] = Query(None, description="课程标签（逗号分隔）"),
    search: Optional[str] = Query(None, description="搜索关键词"),
    sort: Optional[str] = Query("newest", description="排序方式"),
    page: int = Query(1, ge=1, description="页码"),
    page_size: int = Query(20, ge=1, le=100, description="每页数量"),
    current_user: User = Depends(get_current_user_sync),
    course_service: UnifiedCourseService = Depends(get_unified_course_service),
    db: Session = Depends(get_sync_db)
):
    """
    获取课程列表

    支持多种筛选条件和排序方式
    """
    try:
        # 构建筛选条件
        filters = {}
        if scenario_type:
            filters['scenario_type'] = scenario_type
        if category:
            filters['category'] = category
        if level:
            filters['level'] = level
        if status:
            filters['status'] = status
        if org_id:
            filters['org_id'] = org_id
        if is_free is not None:
            filters['is_free'] = is_free
        if min_rating:
            filters['min_rating'] = min_rating
        if tags:
            filters['tags'] = tags.split(',')
        if search:
            filters['search'] = search

        result = course_service.list_courses(
            filters=filters,
            sort=sort,
            page=page,
            page_size=page_size
        )

        return {
            "success": True,
            "data": result
        }
    except Exception as e:
        logger.error(f"获取课程列表失败: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"获取课程列表失败: {str(e)}")


@router.put("/courses/{course_id}", response_model=dict, summary="更新课程")
def update_course(
    course_id: int = Path(..., description="课程ID"),
    course_data: UnifiedCourseUpdate = Body(..., description="课程更新数据"),
    current_user: User = Depends(get_current_user_sync),
    course_service: UnifiedCourseService = Depends(get_unified_course_service),
    db: Session = Depends(get_sync_db)
):
    """更新课程信息"""
    try:
        # 获取课程并验证权限
        course = course_service.get_course(course_id)
        validate_org_access(course.org_id, current_user, db)

        # 更新课程
        updated_course = course_service.update_course(course_id, course_data, current_user.id)
        return {
            "success": True,
            "data": updated_course,
            "message": "课程更新成功"
        }
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        logger.error(f"更新课程失败: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"更新课程失败: {str(e)}")


@router.delete("/courses/{course_id}", response_model=dict, summary="删除课程")
def delete_course(
    course_id: int = Path(..., description="课程ID"),
    soft: bool = Query(True, description="是否软删除"),
    current_user: User = Depends(get_current_user_sync),
    course_service: UnifiedCourseService = Depends(get_unified_course_service),
    db: Session = Depends(get_sync_db)
):
    """删除课程（默认软删除）"""
    try:
        # 获取课程并验证权限
        course = course_service.get_course(course_id)
        validate_org_access(course.org_id, current_user, db)

        # 删除课程
        course_service.delete_course(course_id, soft=soft)
        return {
            "success": True,
            "message": f"课程{'软删除' if soft else '删除'}成功"
        }
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        logger.error(f"删除课程失败: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"删除课程失败: {str(e)}")


# ==================== 课程章节管理API ====================

@router.get("/courses/{course_id}/chapters", response_model=dict, summary="获取课程章节列表")
def list_chapters(
    course_id: int = Path(..., description="课程ID"),
    current_user: User = Depends(get_current_user_sync),
    course_service: UnifiedCourseService = Depends(get_unified_course_service),
    db: Session = Depends(get_sync_db)
):
    """获取课程的所有章节"""
    try:
        chapters = course_service.list_chapters(course_id)
        return {
            "success": True,
            "data": chapters
        }
    except Exception as e:
        logger.error(f"获取章节列表失败: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"获取章节列表失败: {str(e)}")


@router.post("/courses/{course_id}/chapters", response_model=dict, summary="创建章节")
def create_chapter(
    course_id: int = Path(..., description="课程ID"),
    chapter_data: dict = Body(..., description="章节数据"),
    current_user: User = Depends(get_current_user_sync),
    course_service: UnifiedCourseService = Depends(get_unified_course_service),
    db: Session = Depends(get_sync_db)
):
    """创建新章节"""
    try:
        # 获取课程并验证权限
        course = course_service.get_course(course_id)
        validate_org_access(course.org_id, current_user, db)

        chapter = course_service.create_chapter(course_id, chapter_data)
        return {
            "success": True,
            "data": chapter,
            "message": "章节创建成功"
        }
    except Exception as e:
        logger.error(f"创建章节失败: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"创建章节失败: {str(e)}")


# ==================== 课程课时管理API ====================

@router.get("/courses/{course_id}/lessons", response_model=dict, summary="获取课程课时列表")
def list_lessons(
    course_id: int = Path(..., description="课程ID"),
    chapter_id: Optional[int] = Query(None, description="章节ID"),
    current_user: User = Depends(get_current_user_sync),
    course_service: UnifiedCourseService = Depends(get_unified_course_service),
    db: Session = Depends(get_sync_db)
):
    """获取课程的所有课时"""
    try:
        lessons = course_service.list_lessons(course_id, chapter_id)
        return {
            "success": True,
            "data": lessons
        }
    except Exception as e:
        logger.error(f"获取课时列表失败: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"获取课时列表失败: {str(e)}")


@router.get("/courses/{course_id}/lessons/{lesson_id}", response_model=dict, summary="获取课时详情")
def get_lesson(
    course_id: int = Path(..., description="课程ID"),
    lesson_id: int = Path(..., description="课时ID"),
    current_user: User = Depends(get_current_user_sync),
    course_service: UnifiedCourseService = Depends(get_unified_course_service),
    db: Session = Depends(get_sync_db)
):
    """获取课时详细信息"""
    try:
        lesson = course_service.get_lesson(lesson_id)
        return {
            "success": True,
            "data": lesson
        }
    except Exception as e:
        logger.error(f"获取课时详情失败: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"获取课时详情失败: {str(e)}")


# ==================== 课程评价管理API ====================

@router.get("/courses/{course_id}/reviews", response_model=dict, summary="获取课程评价列表")
def list_reviews(
    course_id: int = Path(..., description="课程ID"),
    page: int = Query(1, ge=1, description="页码"),
    page_size: int = Query(10, ge=1, le=50, description="每页数量"),
    current_user: User = Depends(get_current_user_sync),
    course_service: UnifiedCourseService = Depends(get_unified_course_service),
    db: Session = Depends(get_sync_db)
):
    """获取课程评价列表"""
    try:
        result = course_service.list_reviews(course_id, page, page_size)
        return {
            "success": True,
            "data": result
        }
    except Exception as e:
        logger.error(f"获取评价列表失败: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"获取评价列表失败: {str(e)}")


@router.post("/courses/{course_id}/reviews", response_model=dict, summary="创建课程评价")
def create_review(
    course_id: int = Path(..., description="课程ID"),
    review_data: dict = Body(..., description="评价数据"),
    current_user: User = Depends(get_current_user_sync),
    course_service: UnifiedCourseService = Depends(get_unified_course_service),
    db: Session = Depends(get_sync_db)
):
    """创建课程评价"""
    try:
        review = course_service.create_review(course_id, current_user.id, review_data)
        return {
            "success": True,
            "data": review,
            "message": "评价创建成功"
        }
    except Exception as e:
        logger.error(f"创建评价失败: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"创建评价失败: {str(e)}")


# ==================== 推荐和搜索API ====================

@router.get("/popular", response_model=dict, summary="获取热门课程")
def get_popular_courses(
    category: Optional[str] = Query(None, description="分类"),
    limit: int = Query(10, ge=1, le=50, description="数量限制"),
    current_user: User = Depends(get_current_user_sync),
    course_service: UnifiedCourseService = Depends(get_unified_course_service)
):
    """获取热门课程"""
    try:
        courses = course_service.get_popular_courses(category, limit)
        return {
            "success": True,
            "data": courses
        }
    except Exception as e:
        logger.error(f"获取热门课程失败: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"获取热门课程失败: {str(e)}")


@router.get("/newest", response_model=dict, summary="获取最新课程")
def get_newest_courses(
    limit: int = Query(10, ge=1, le=50, description="数量限制"),
    current_user: User = Depends(get_current_user_sync),
    course_service: UnifiedCourseService = Depends(get_unified_course_service)
):
    """获取最新课程"""
    try:
        courses = course_service.get_newest_courses(limit)
        return {
            "success": True,
            "data": courses
        }
    except Exception as e:
        logger.error(f"获取最新课程失败: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"获取最新课程失败: {str(e)}")


@router.get("/users/{user_id}/recommended-courses", response_model=dict, summary="获取推荐课程")
def get_recommended_courses(
    user_id: int = Path(..., description="用户ID"),
    limit: int = Query(10, ge=1, le=50, description="数量限制"),
    current_user: User = Depends(get_current_user_sync),
    course_service: UnifiedCourseService = Depends(get_unified_course_service)
):
    """获取个性化推荐课程"""
    try:
        courses = course_service.get_recommended_courses(user_id, limit)
        return {
            "success": True,
            "data": courses
        }
    except Exception as e:
        logger.error(f"获取推荐课程失败: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"获取推荐课程失败: {str(e)}")


# ==================== 报名管理API ====================

@router.post("/enroll", response_model=dict, summary="报名课程")
def enroll_in_course(
    course_id: int = Body(..., description="课程ID"),
    user_id: int = Body(..., description="用户ID"),
    org_id: int = Body(..., description="组织ID"),
    enrollment_code: Optional[str] = Body(None, description="报名码"),
    current_user: User = Depends(get_current_user_sync),
    enrollment_service: CourseEnrollmentService = Depends(get_enrollment_service),
    db: Session = Depends(get_sync_db)
):
    """学生报名课程"""
    try:
        enrollment = enrollment_service.enroll_user(course_id, user_id, org_id, enrollment_code)
        return {
            "success": True,
            "data": enrollment,
            "message": "报名成功"
        }
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        logger.error(f"报名失败: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"报名失败: {str(e)}")


@router.get("/user/{user_id}", response_model=dict, summary="获取用户报名列表")
def list_user_enrollments(
    user_id: int = Path(..., description="用户ID"),
    status: Optional[EnrollmentStatus] = Query(None, description="报名状态"),
    org_id: Optional[int] = Query(None, description="组织ID"),
    course_id: Optional[int] = Query(None, description="课程ID"),
    page: int = Query(1, ge=1, description="页码"),
    page_size: int = Query(10, ge=1, le=50, description="每页数量"),
    current_user: User = Depends(get_current_user_sync),
    enrollment_service: CourseEnrollmentService = Depends(get_enrollment_service)
):
    """获取用户的所有报名"""
    try:
        result = enrollment_service.list_user_enrollments(
            user_id, status, org_id, course_id, page, page_size
        )
        return {
            "success": True,
            "data": result
        }
    except Exception as e:
        logger.error(f"获取报名列表失败: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"获取报名列表失败: {str(e)}")


@router.post("/{enrollment_id}/withdraw", response_model=dict, summary="退课")
def withdraw_from_course(
    enrollment_id: int = Path(..., description="报名ID"),
    reason: Optional[str] = Body(None, description="退课原因"),
    current_user: User = Depends(get_current_user_sync),
    enrollment_service: CourseEnrollmentService = Depends(get_enrollment_service)
):
    """退课"""
    try:
        enrollment_service.withdraw_user(enrollment_id, reason)
        return {
            "success": True,
            "message": "退课成功"
        }
    except Exception as e:
        logger.error(f"退课失败: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"退课失败: {str(e)}")


# ==================== 进度管理API ====================

@router.post("/start", response_model=dict, summary="开始学习课时")
def start_lesson(
    enrollment_id: int = Body(..., description="报名ID"),
    lesson_id: int = Body(..., description="课时ID"),
    current_user: User = Depends(get_current_user_sync),
    progress_service: CourseProgressService = Depends(get_progress_service)
):
    """开始学习课时"""
    try:
        progress = progress_service.start_lesson(enrollment_id, lesson_id)
        return {
            "success": True,
            "data": progress,
            "message": "开始学习"
        }
    except Exception as e:
        logger.error(f"开始学习失败: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"开始学习失败: {str(e)}")


@router.put("/{progress_id}/complete", response_model=dict, summary="完成课时")
def complete_lesson(
    progress_id: int = Path(..., description="进度ID"),
    progress_data: dict = Body(..., description="进度数据"),
    current_user: User = Depends(get_current_user_sync),
    progress_service: CourseProgressService = Depends(get_progress_service)
):
    """完成课时"""
    try:
        progress = progress_service.complete_lesson(progress_id, progress_data)
        return {
            "success": True,
            "data": progress,
            "message": "课时完成"
        }
    except Exception as e:
        logger.error(f"完成课时失败: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"完成课时失败: {str(e)}")


@router.get("/stats/course/{course_id}", response_model=dict, summary="获取课程进度统计")
def get_course_progress_stats(
    course_id: int = Path(..., description="课程ID"),
    current_user: User = Depends(get_current_user_sync),
    progress_service: CourseProgressService = Depends(get_progress_service)
):
    """获取课程进度统计"""
    try:
        stats = progress_service.get_course_stats(course_id)
        return {
            "success": True,
            "data": stats
        }
    except Exception as e:
        logger.error(f"获取课程进度统计失败: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"获取课程进度统计失败: {str(e)}")
