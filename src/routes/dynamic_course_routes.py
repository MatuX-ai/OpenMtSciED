"""
动态课程生成API路由
提供基于AI的个性化课程生成服务
"""

import logging
import time
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import desc, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from ai_service.dynamic_course import (
    DynamicCourseRequest,
    StudentProfile,
    dynamic_course_generator,
)
from models.dynamic_course import (
    BacktestResult,
    CourseGenerationLog,
    CourseGenerationStats,
    DynamicCourseRequestCreate,
    DynamicCourseResponseDetail,
    GeneratedCourse,
    TemplateEvaluation,
)
from models.user import User
from routes.auth_routes import get_current_user
from utils.database import get_db

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/ai/dynamic-course", response_model=DynamicCourseResponseDetail)
async def generate_dynamic_course(
    request: DynamicCourseRequestCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    生成动态个性化课程

    基于学生档案和学习需求，使用GPT-3.5 Turbo模型生成个性化的课程设计方案。

    Args:
        request: 课程生成请求参数
        current_user: 当前认证用户
        db: 数据库会话

    Returns:
        DynamicCourseResponseDetail: 生成的课程详情
    """
    start_time = time.time()

    try:
        # 验证用户权限
        if not current_user.has_permission("ai.use"):
            raise HTTPException(status_code=403, detail="权限不足")

        # 构造内部请求对象
        internal_request = DynamicCourseRequest(
            student_profile=StudentProfile(
                grade=request.student_profile.grade,
                age=request.student_profile.age,
                learning_style=request.student_profile.learning_style,
                prior_knowledge=request.student_profile.prior_knowledge,
                interests=request.student_profile.interests,
                learning_goals=request.student_profile.learning_goals,
            ),
            subject_area=request.subject_area,
            learning_objectives=request.learning_objectives,
            difficulty_level=request.difficulty_level,
            project_type=request.project_type,
            time_constraint=request.time_constraint,
            language=request.language,
        )

        # 验证请求参数
        if not dynamic_course_generator.validate_request(internal_request):
            raise HTTPException(status_code=400, detail="请求参数无效")

        # 调用AI生成课程
        ai_response = await dynamic_course_generator.generate_course(internal_request)

        generation_time = int((time.time() - start_time) * 1000)

        # 保存到数据库
        generated_course = GeneratedCourse(
            org_id=current_user.org_id,
            user_id=current_user.id,
            title=ai_response.course_title,
            description=ai_response.course_description,
            subject_area=request.subject_area,
            difficulty_level=request.difficulty_level,
            estimated_duration=ai_response.estimated_duration,
            student_grade=request.student_profile.grade,
            student_age=request.student_profile.age,
            learning_style=request.student_profile.learning_style,
            learning_objectives=request.learning_objectives,
            project_type=request.project_type,
            time_constraint=request.time_constraint,
            course_components=[comp.dict() for comp in ai_response.project_components],
            required_materials=ai_response.required_materials,
            learning_outcomes=ai_response.learning_outcomes,
            prerequisites=ai_response.prerequisites,
            assessment_methods=ai_response.assessment_methods,
            difficulty_assessment=ai_response.difficulty_assessment,
            generation_time=generation_time,
            tokens_used=getattr(ai_response, "tokens_used", 0),
        )

        db.add(generated_course)
        await db.commit()
        await db.refresh(generated_course)

        # 记录生成日志
        log_entry = CourseGenerationLog(
            org_id=current_user.org_id,
            user_id=current_user.id,
            generated_course_id=generated_course.id,
            request_data=request.dict(),
            response_time=generation_time,
            tokens_used=getattr(ai_response, "tokens_used", 0),
            model_used="gpt-3.5-turbo",
            status="success",
        )

        db.add(log_entry)
        await db.commit()

        logger.info(
            f"动态课程生成成功: 用户{current_user.id}, 课程ID{generated_course.id}"
        )

        # 构造响应
        response = DynamicCourseResponseDetail(
            course_id=generated_course.id,
            course_title=ai_response.course_title,
            course_description=ai_response.course_description,
            learning_outcomes=ai_response.learning_outcomes,
            project_components=ai_response.project_components,
            required_materials=ai_response.required_materials,
            estimated_duration=ai_response.estimated_duration,
            difficulty_assessment=ai_response.difficulty_assessment,
            prerequisites=ai_response.prerequisites,
            assessment_methods=ai_response.assessment_methods,
            generated_at=ai_response.generated_at,
            tokens_used=getattr(ai_response, "tokens_used", 0),
            generation_time=generation_time,
        )

        return response

    except HTTPException:
        raise
    except Exception as e:
        # 记录错误日志
        error_log = CourseGenerationLog(
            org_id=current_user.org_id,
            user_id=current_user.id,
            request_data=request.dict() if "request" in locals() else {},
            response_time=int((time.time() - start_time) * 1000),
            error_message=str(e),
            status="failed",
        )

        db.add(error_log)
        await db.commit()

        logger.error(f"动态课程生成失败: {str(e)}")
        raise HTTPException(status_code=500, detail=f"课程生成失败: {str(e)}")


@router.get(
    "/ai/dynamic-course/history", response_model=List[DynamicCourseResponseDetail]
)
async def get_course_generation_history(
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    subject_area: Optional[str] = None,
    difficulty_level: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    获取课程生成历史记录

    Args:
        limit: 返回记录数限制
        offset: 偏移量
        subject_area: 学科领域筛选
        difficulty_level: 难度等级筛选
        current_user: 当前认证用户
        db: 数据库会话

    Returns:
        List[DynamicCourseResponseDetail]: 课程生成历史列表
    """
    try:
        # 验证权限
        if not current_user.has_permission("ai.use"):
            raise HTTPException(status_code=403, detail="权限不足")

        # 构建查询
        query = select(GeneratedCourse).where(
            GeneratedCourse.user_id == current_user.id
        )

        if subject_area:
            query = query.where(GeneratedCourse.subject_area == subject_area)

        if difficulty_level:
            query = query.where(GeneratedCourse.difficulty_level == difficulty_level)

        query = (
            query.order_by(desc(GeneratedCourse.created_at)).offset(offset).limit(limit)
        )

        result = await db.execute(query)
        courses = result.scalars().all()

        # 转换为响应格式
        response_list = []
        for course in courses:
            response = DynamicCourseResponseDetail(
                course_id=course.id,
                course_title=course.title,
                course_description=course.description,
                learning_outcomes=course.learning_outcomes or [],
                project_components=[],  # 简化处理
                required_materials=course.required_materials or [],
                estimated_duration=course.estimated_duration or 0,
                difficulty_assessment=course.difficulty_assessment or "",
                prerequisites=course.prerequisites or [],
                assessment_methods=course.assessment_methods or [],
                generated_at=course.generated_at,
                tokens_used=course.tokens_used,
                generation_time=course.generation_time or 0,
            )
            response_list.append(response)

        return response_list

    except Exception as e:
        logger.error(f"获取课程生成历史失败: {str(e)}")
        raise HTTPException(status_code=500, detail="获取历史记录失败")


@router.get("/ai/dynamic-course/stats", response_model=CourseGenerationStats)
async def get_course_generation_stats(
    current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)
):
    """
    获取课程生成统计信息

    Args:
        current_user: 当前认证用户
        db: 数据库会话

    Returns:
        CourseGenerationStats: 统计信息
    """
    try:
        # 验证权限
        if not current_user.has_permission("ai.use"):
            raise HTTPException(status_code=403, detail="权限不足")

        # 获取总数
        total_query = select(func.count(GeneratedCourse.id)).where(
            GeneratedCourse.user_id == current_user.id
        )
        total_result = await db.execute(total_query)
        total_generations = total_result.scalar()

        # 获取成功数
        success_query = select(func.count(GeneratedCourse.id)).where(
            GeneratedCourse.user_id == current_user.id,
            GeneratedCourse.completion_rate > 0,
        )
        success_result = await db.execute(success_query)
        successful_generations = success_result.scalar()

        # 获取平均响应时间和令牌使用
        avg_time_query = select(func.avg(GeneratedCourse.generation_time)).where(
            GeneratedCourse.user_id == current_user.id
        )
        avg_time_result = await db.execute(avg_time_query)
        average_response_time = float(avg_time_result.scalar() or 0)

        avg_tokens_query = select(func.avg(GeneratedCourse.tokens_used)).where(
            GeneratedCourse.user_id == current_user.id
        )
        avg_tokens_result = await db.execute(avg_tokens_query)
        average_tokens_used = float(avg_tokens_result.scalar() or 0)

        # 计算完成率
        completion_rate = (
            (successful_generations / total_generations * 100)
            if total_generations > 0
            else 0
        )

        # 获取热门学科
        popular_subjects_query = (
            select(
                GeneratedCourse.subject_area,
                func.count(GeneratedCourse.id).label("count"),
            )
            .where(GeneratedCourse.user_id == current_user.id)
            .group_by(GeneratedCourse.subject_area)
            .order_by(desc("count"))
            .limit(5)
        )

        popular_result = await db.execute(popular_subjects_query)
        popular_subjects = [
            {"subject": row[0], "count": row[1]} for row in popular_result.fetchall()
        ]

        # 平均课程时长
        avg_duration_query = select(func.avg(GeneratedCourse.estimated_duration)).where(
            GeneratedCourse.user_id == current_user.id
        )
        avg_duration_result = await db.execute(avg_duration_query)
        average_duration = int(avg_duration_result.scalar() or 0)

        stats = CourseGenerationStats(
            total_generations=total_generations,
            successful_generations=successful_generations,
            average_response_time=average_response_time,
            average_tokens_used=average_tokens_used,
            completion_rate=completion_rate,
            popular_subjects=popular_subjects,
            average_duration=average_duration,
        )

        return stats

    except Exception as e:
        logger.error(f"获取统计信息失败: {str(e)}")
        raise HTTPException(status_code=500, detail="获取统计信息失败")


@router.get("/ai/dynamic-course/templates", response_model=List[TemplateEvaluation])
async def get_template_evaluation(
    current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)
):
    """
    获取课程模板评估信息

    Args:
        current_user: 当前认证用户
        db: 数据库会话

    Returns:
        List[TemplateEvaluation]: 模板评估信息列表
    """
    try:
        # 验证权限
        if not current_user.has_permission("ai.use"):
            raise HTTPException(status_code=403, detail="权限不足")

        # 这里应该从数据库获取模板使用统计数据
        # 目前返回预定义的模板信息
        templates = [
            TemplateEvaluation(
                template_id="light_sensor_project",
                template_name="光敏传感器自动浇水系统",
                usage_count=45,
                average_rating=4.2,
                success_rate=88.5,
                average_completion_rate=92.3,
                last_used=None,  # 需要从数据库查询
            ),
            TemplateEvaluation(
                template_id="arduino_basics",
                template_name="Arduino基础电子项目",
                usage_count=32,
                average_rating=4.0,
                success_rate=85.2,
                average_completion_rate=89.7,
                last_used=None,
            ),
        ]

        return templates

    except Exception as e:
        logger.error(f"获取模板评估信息失败: {str(e)}")
        raise HTTPException(status_code=500, detail="获取模板评估信息失败")


@router.post("/ai/dynamic-course/backtest", response_model=BacktestResult)
async def run_backtest(
    test_period: str = Query("7d", description="测试周期"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    运行A/B测试回测

    Args:
        test_period: 测试周期 (如: 7d, 30d)
        current_user: 当前认证用户
        db: 数据库会话

    Returns:
        BacktestResult: 回测结果
    """
    try:
        # 验证权限
        if not current_user.has_permission("ai.manage"):
            raise HTTPException(status_code=403, detail="需要管理权限")

        # 这里应该实现实际的回测逻辑
        # 目前返回模拟数据
        backtest_result = BacktestResult(
            test_name=f"动态课程生成效果测试_{test_period}",
            generated_courses_count=150,
            manual_courses_count=120,
            generated_completion_rate=87.5,
            manual_completion_rate=72.3,
            improvement_percentage=21.0,
            statistical_significance=True,
            test_period=test_period,
            created_at=None,  # 将被自动填充
        )

        return backtest_result

    except Exception as e:
        logger.error(f"运行回测失败: {str(e)}")
        raise HTTPException(status_code=500, detail="运行回测失败")
