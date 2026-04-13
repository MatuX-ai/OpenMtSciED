"""
微课程转换 API 路由
将 XEdu 课程转换为带有游戏化元素的微课程
"""

import logging
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, Body, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from database.db import get_sync_db
from models.ai_edu_rewards import AIEduLesson, AIEduModule
from models.user import User
from services.xedu_micro_course_converter import (
    MicroCourseConfig,
    XEduMicroCourseConverter,
    get_micro_course_converter,
)

logger = logging.getLogger(__name__)

# 创建路由器
router = APIRouter(
    prefix="/api/v1/org/{org_id}/ai-edu/micro-course", tags=["微课程转化"]
)


@router.post("/convert")
async def convert_xedu_course_to_microcourse(
    org_id: int,
    module_id: int = Body(..., description="XEdu 课程模块 ID"),
    gamification_config: Optional[Dict[str, Any]] = Body(
        None, description="游戏化配置（可选）"
    ),
    save_to_db: bool = Body(True, description="是否保存到数据库"),
    db: Session = Depends(get_sync_db),
    current_user: User = Depends(get_current_user_sync),
):
    """
    将 XEdu 课程转换为微课程

    Args:
        org_id: 组织 ID
        module_id: XEdu 课程模块 ID
        gamification_config: 自定义游戏化配置（可选）
        save_to_db: 是否保存到数据库
        db: 数据库会话
        current_user: 当前用户

    Returns:
        微课程配置

    Examples:
        POST /api/v1/org/1/ai-edu/micro-course/convert
        {
            "module_id": 1,
            "gamification_config": {
                "theme": "考古探险",
                "avatar": "🏺 考古学家",
                "story": "你是一名考古学家，发现了一批刻有甲骨文的碎片..."
            },
            "save_to_db": true
        }
    """
    try:
        logger.info(f"收到微课程转换请求：模块{module_id}")

        # 1. 获取 XEdu 课程模块
        xedu_module = db.query(AIEduModule).filter(AIEduModule.id == module_id).first()
        if not xedu_module:
            raise HTTPException(status_code=404, detail=f"课程模块不存在：{module_id}")

        # 2. 获取所有课时
        xedu_lessons = (
            db.query(AIEduLesson)
            .filter(AIEduLesson.module_id == module_id, AIEduLesson.is_active == True)
            .order_by(AIEduLesson.display_order)
            .all()
        )

        if not xedu_lessons:
            raise HTTPException(status_code=400, detail=f"课程没有课时：{module_id}")

        # 3. 创建转换器
        converter = get_micro_course_converter(db)

        # 4. 执行转换
        micro_course = converter.convert_xedu_course_to_microcourse(
            xedu_module=xedu_module,
            xedu_lessons=xedu_lessons,
            gamification_config=gamification_config,
        )

        # 5. 创建奖励规则和成就
        reward_rules = converter.create_reward_rules_for_microcourse(
            module_id, micro_course
        )
        achievements = converter.create_achievements_for_microcourse(
            module_id, micro_course
        )

        # 6. 保存或返回
        if save_to_db:
            # 保存奖励规则
            for rule in reward_rules:
                db.add(rule)

            # 保存成就
            for achievement in achievements:
                db.add(achievement)

            db.commit()
            logger.info(f"✅ 微课程已保存：{micro_course.title}")

        return {
            "success": True,
            "data": {
                "micro_course": micro_course.to_dict(),
                "reward_rules": [
                    {
                        "rule_code": rule.rule_code,
                        "rule_name": rule.rule_name,
                        "rule_type": rule.rule_type.value,
                        "base_points": rule.base_points,
                    }
                    for rule in reward_rules
                ],
                "achievements": [
                    {
                        "achievement_code": achievement.achievement_code,
                        "name": achievement.name,
                        "rarity": achievement.rarity.value,
                        "points_reward": achievement.points_reward,
                    }
                    for achievement in achievements
                ],
            },
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"微课程转换失败：{e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"转换失败：{str(e)}")


@router.get("/{module_id}")
async def get_microcourse_config(
    org_id: int,
    module_id: int,
    db: Session = Depends(get_sync_db),
    current_user: User = Depends(get_current_user_sync),
):
    """
    获取微课程配置

    Args:
        org_id: 组织 ID
        module_id: 课程模块 ID
        db: 数据库会话
        current_user: 当前用户

    Returns:
        微课程配置信息
    """
    try:
        # 1. 获取课程模块
        xedu_module = (
            db.query(AIEduModule)
            .filter(AIEduModule.id == module_id, AIEduModule.is_active == True)
            .first()
        )

        if not xedu_module:
            raise HTTPException(status_code=404, detail="课程模块不存在")

        # 2. 获取课时
        xedu_lessons = (
            db.query(AIEduLesson)
            .filter(AIEduLesson.module_id == module_id, AIEduLesson.is_active == True)
            .order_by(AIEduLesson.display_order)
            .all()
        )

        # 3. 创建转换器
        converter = get_micro_course_converter(db)

        # 4. 转换为微课程
        micro_course = converter.convert_xedu_course_to_microcourse(
            xedu_module=xedu_module, xedu_lessons=xedu_lessons
        )

        return {"success": True, "data": micro_course.to_dict()}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"获取微课程配置失败：{e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/batch-convert")
async def batch_convert_courses(
    org_id: int,
    module_ids: List[int] = Body(..., description="课程模块 ID 列表"),
    auto_save: bool = Body(True, description="是否自动保存"),
    db: Session = Depends(get_sync_db),
    current_user: User = Depends(get_current_user_sync),
):
    """
    批量转换课程为微课程

    Args:
        org_id: 组织 ID
        module_ids: 课程模块 ID 列表
        auto_save: 是否自动保存
        db: 数据库会话
        current_user: 当前用户

    Returns:
        批量转换结果
    """
    try:
        results = []

        converter = get_micro_course_converter(db)

        for module_id in module_ids:
            try:
                # 获取课程
                xedu_module = (
                    db.query(AIEduModule)
                    .filter(AIEduModule.id == module_id, AIEduModule.is_active == True)
                    .first()
                )

                if not xedu_module:
                    results.append(
                        {
                            "module_id": module_id,
                            "success": False,
                            "error": "课程不存在",
                        }
                    )
                    continue

                # 获取课时
                xedu_lessons = (
                    db.query(AIEduLesson)
                    .filter(
                        AIEduLesson.module_id == module_id,
                        AIEduLesson.is_active == True,
                    )
                    .order_by(AIEduLesson.display_order)
                    .all()
                )

                # 转换
                micro_course = converter.convert_xedu_course_to_microcourse(
                    xedu_module=xedu_module, xedu_lessons=xedu_lessons
                )

                # 创建奖励和成就
                reward_rules = converter.create_reward_rules_for_microcourse(
                    module_id, micro_course
                )
                achievements = converter.create_achievements_for_microcourse(
                    module_id, micro_course
                )

                if auto_save:
                    for rule in reward_rules:
                        db.add(rule)
                    for achievement in achievements:
                        db.add(achievement)
                    db.commit()

                results.append(
                    {
                        "module_id": module_id,
                        "success": True,
                        "title": micro_course.title,
                        "levels_count": len(micro_course.levels),
                        "reward_rules_count": len(reward_rules),
                        "achievements_count": len(achievements),
                    }
                )

            except Exception as e:
                logger.error(f"转换课程{module_id}失败：{e}")
                results.append(
                    {"module_id": module_id, "success": False, "error": str(e)}
                )

        return {
            "success": True,
            "results": results,
            "total": len(results),
            "successful": sum(1 for r in results if r["success"]),
        }

    except Exception as e:
        logger.error(f"批量转换失败：{e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"批量转换失败：{str(e)}")


@router.get("/templates/list")
async def list_microcourse_templates(
    org_id: int,
    category: Optional[str] = Query(None, description="课程类别"),
    db: Session = Depends(get_sync_db),
):
    """
    获取微课程模板列表

    Args:
        org_id: 组织 ID
        category: 课程类别（可选）
        db: 数据库会话

    Returns:
        微课程模板列表
    """
    try:
        query = db.query(AIEduModule).filter(AIEduModule.is_active == True)

        if category:
            query = query.filter(AIEduModule.category == category)

        modules = query.order_by(AIEduModule.display_order).all()

        templates = []
        for module in modules:
            templates.append(
                {
                    "id": module.id,
                    "module_code": module.module_code,
                    "name": module.name,
                    "description": module.description,
                    "category": module.category,
                    "expected_lessons": module.expected_lessons,
                    "grade_ranges": module.grade_ranges,
                }
            )

        return {"success": True, "count": len(templates), "data": templates}

    except Exception as e:
        logger.error(f"获取模板列表失败：{e}")
        raise HTTPException(status_code=500, detail=str(e))
