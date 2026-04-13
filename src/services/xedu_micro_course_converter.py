"""
XEdu 微课程转换服务
将 XEdu 标准课程转换为带有游戏化元素的微课程
支持积分奖励、任务关卡、成就系统等
"""

from datetime import datetime
import logging
from typing import Any, Dict, List, Optional

from sqlalchemy import and_
from sqlalchemy.orm import Session

from models.ai_edu_rewards import (
    AchievementRarity,
    AIEduAchievement,
    AIEduLesson,
    AIEduModule,
    AIEduRewardRule,
    RewardRuleType,
)

logger = logging.getLogger(__name__)


class MicroCourseLevel:
    """微课程关卡配置"""

    def __init__(
        self, level_id: int, name: str, task: str, xp_reward: int, badge: str = None
    ):
        self.level_id = level_id
        self.name = name
        self.task = task
        self.xp_reward = xp_reward
        self.badge = badge

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.level_id,
            "name": self.name,
            "task": self.task,
            "xpReward": self.xp_reward,
            "badge": self.badge,
        }


class MicroCourseConfig:
    """微课程配置"""

    def __init__(self, course_data: Dict[str, Any]):
        self.id = course_data.get("id")
        self.title = course_data.get("title")
        self.description = course_data.get("description")

        # 游戏化元素
        self.gamification = course_data.get("gamification", {})

        # 任务关卡
        self.levels: List[MicroCourseLevel] = []
        for level_data in course_data.get("levels", []):
            level = MicroCourseLevel(
                level_id=level_data.get("id"),
                name=level_data.get("name"),
                task=level_data.get("task"),
                xp_reward=level_data.get("xpReward"),
                badge=level_data.get("badge"),
            )
            self.levels.append(level)

        # 硬件集成（可选）
        self.hardware_integration = course_data.get("hardwareIntegration", {})

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "gamification": self.gamification,
            "levels": [level.to_dict() for level in self.levels],
            "hardwareIntegration": self.hardware_integration,
        }


class XEduMicroCourseConverter:
    """XEdu 微课程转换器"""

    def __init__(self, db_session: Session):
        """
        初始化转换器

        Args:
            db_session: 数据库会话
        """
        self.db = db_session

    def convert_xedu_course_to_microcourse(
        self,
        xedu_module: AIEduModule,
        xedu_lessons: List[AIEduLesson],
        gamification_config: Optional[Dict[str, Any]] = None,
    ) -> MicroCourseConfig:
        """
        将 XEdu 课程转换为微课程

        Args:
            xedu_module: XEdu 课程模块
            xedu_lessons: XEdu 课时列表
            gamification_config: 游戏化配置（可选）

        Returns:
            微课程配置
        """
        logger.info(f"开始转换 XEdu 课程：{xedu_module.name}")

        # 1. 构建基础课程信息
        micro_course_data = {
            "id": f"xedu_{xedu_module.module_code}",
            "title": xedu_module.name,
            "description": xedu_module.description,
        }

        # 2. 设置游戏化主题（默认或使用配置）
        if gamification_config:
            micro_course_data["gamification"] = gamification_config
        else:
            # 根据课程类别自动分配主题
            theme = self._auto_select_theme(xedu_module.category)
            micro_course_data["gamification"] = theme

        # 3. 创建任务关卡
        levels = self._create_levels_from_lessons(xedu_lessons)
        micro_course_data["levels"] = levels

        # 4. 硬件集成配置（如果有时长包含硬件实践）
        hardware_tasks = self._extract_hardware_tasks(xedu_lessons)
        if hardware_tasks:
            micro_course_data["hardwareIntegration"] = {
                "optional": True,
                "device": hardware_tasks[0]["device"],
                "task": hardware_tasks[0]["description"],
            }

        return MicroCourseConfig(micro_course_data)

    def _auto_select_theme(self, category: str) -> Dict[str, str]:
        """根据课程类别自动选择游戏化主题"""

        themes = {
            "basic_concepts": {
                "theme": "知识探险",
                "avatar": "🎓 小学者",
                "story": "你是一位知识探险家，准备探索 AI 的奥秘...",
            },
            "data_perception": {
                "theme": "数据侦探",
                "avatar": "🕵️ 数据侦探",
                "story": "作为一名数据侦探，你需要从海量数据中发现规律...",
            },
            "algorithms": {
                "theme": "算法魔法师",
                "avatar": "🧙 算法法师",
                "story": "掌握算法魔法，让计算机变得聪明起来...",
            },
            "ethics": {
                "theme": "AI 伦理守护者",
                "avatar": "⚖️ 伦理卫士",
                "story": "守护 AI 伦理，确保技术造福人类...",
            },
            "interdisciplinary": {
                "theme": "跨学科创新者",
                "avatar": "💡 创新达人",
                "story": "融合多学科知识，创造改变世界的创新...",
            },
        }

        return themes.get(category, themes["basic_concepts"])

    def _create_levels_from_lessons(
        self, lessons: List[AIEduLesson]
    ) -> List[Dict[str, Any]]:
        """从 XEdu 课时创建任务关卡"""

        levels = []

        for idx, lesson in enumerate(lessons, start=1):
            # 根据课程类型设计关卡名称和任务
            if lesson.content_type == "theory":
                level = {
                    "id": idx,
                    "name": f"第{idx}关：{lesson.title}",
                    "task": f'完成理论学习：{lesson.subtitle or "理解核心概念"}',
                    "xpReward": lesson.base_points * 2,  # 理论关卡基础积分
                    "badge": (
                        f"📚 {lesson.title[:10]}学者"
                        if len(lesson.title) > 10
                        else f"📚 {lesson.title}学者"
                    ),
                }
            elif lesson.content_type == "practice":
                level = {
                    "id": idx,
                    "name": f"第{idx}关：{lesson.title}",
                    "task": f'完成实践训练：{lesson.practice_type or "编程练习"}',
                    "xpReward": lesson.base_points * 3,  # 实践关卡更高积分
                    "badge": (
                        f"💻 {lesson.title[:10]}工程师"
                        if len(lesson.title) > 10
                        else f"💻 {lesson.title}工程师"
                    ),
                }
            elif lesson.content_type == "hybrid":
                level = {
                    "id": idx,
                    "name": f"第{idx}关：{lesson.title}",
                    "task": f"完成综合挑战：理论与实践结合",
                    "xpReward": lesson.base_points * 4,  # 综合关卡最高积分
                    "badge": (
                        f"🏆 {lesson.title[:10]}大师"
                        if len(lesson.title) > 10
                        else f"🏆 {lesson.title}大师"
                    ),
                }
            else:
                # 默认关卡
                level = {
                    "id": idx,
                    "name": f"第{idx}关：{lesson.title}",
                    "task": f"完成学习：{lesson.title}",
                    "xpReward": lesson.base_points * 2,
                    "badge": f"⭐ 学习者",
                }

            levels.append(level)

        # 添加最终挑战关卡
        if levels:
            final_level = {
                "id": len(levels) + 1,
                "name": "终极挑战",
                "task": "在排行榜进入前 10 名或完成项目作品",
                "xpReward": 500,
                "badge": "🎯 课程大师",
            }
            levels.append(final_level)

        return levels

    def _extract_hardware_tasks(
        self, lessons: List[AIEduLesson]
    ) -> List[Dict[str, str]]:
        """从课程中提取硬件相关任务"""

        hardware_tasks = []

        for lesson in lessons:
            if lesson.practice_type in ["ar_vr", "hardware"]:
                task = {
                    "device": (
                        "摄像头模块"
                        if lesson.practice_type == "ar_vr"
                        else "硬件传感器"
                    ),
                    "description": f"使用{lesson.practice_type}设备完成：{lesson.title}",
                }
                hardware_tasks.append(task)

        return hardware_tasks

    def create_reward_rules_for_microcourse(
        self, module_id: int, micro_course: MicroCourseConfig
    ) -> List[AIEduRewardRule]:
        """为微课程创建奖励规则"""

        logger.info(f"为微课程 {micro_course.title} 创建奖励规则")

        reward_rules = []

        # 1. 理论学习奖励规则
        theory_rule = AIEduRewardRule(
            rule_code=f"MICRO_THEORY_{module_id}",
            rule_name="理论学习奖励",
            description="完成理论课程学习并获得积分",
            rule_type=RewardRuleType.THEORY,
            module_id=module_id,
            base_points=50,
            grade_multipliers={"G1-G2": 1.0, "G3-G4": 1.2, "G5-G6": 1.5, "G7-G9": 2.0},
            quality_coefficients={"excellent": 1.2, "good": 1.1, "pass": 1.0},
            streak_bonus_enabled=True,
            is_active=True,
        )
        reward_rules.append(theory_rule)

        # 2. 实践训练奖励规则
        practice_rule = AIEduRewardRule(
            rule_code=f"MICRO_PRACTICE_{module_id}",
            rule_name="实践训练奖励",
            description="完成实践训练并达到质量要求",
            rule_type=RewardRuleType.PRACTICE,
            module_id=module_id,
            base_points=100,
            grade_multipliers={"G1-G2": 1.0, "G3-G4": 1.2, "G5-G6": 1.5, "G7-G9": 2.0},
            quality_coefficients={"excellent": 1.3, "good": 1.2, "pass": 1.0},
            time_bonus_enabled=True,
            standard_time_minutes=30,
            time_bonus_rate=0.5,
            streak_bonus_enabled=True,
            is_active=True,
        )
        reward_rules.append(practice_rule)

        # 3. 项目挑战奖励规则
        project_rule = AIEduRewardRule(
            rule_code=f"MICRO_PROJECT_{module_id}",
            rule_name="项目挑战奖励",
            description="完成项目挑战并进入排行榜",
            rule_type=RewardRuleType.PROJECT,
            module_id=module_id,
            base_points=200,
            grade_multipliers={"G1-G2": 1.0, "G3-G4": 1.2, "G5-G6": 1.5, "G7-G9": 2.0},
            trigger_conditions=[
                {"field": "leaderboard_rank", "operator": "<=", "value": 10}
            ],
            is_active=True,
        )
        reward_rules.append(project_rule)

        # 4. 连胜奖励规则
        streak_rule = AIEduRewardRule(
            rule_code=f"MICRO_STREAK_{module_id}",
            rule_name="连胜奖励",
            description="连续学习获得额外积分加成",
            rule_type=RewardRuleType.STREAK,
            module_id=module_id,
            base_points=0,  # 连胜奖励是倍数加成
            streak_multipliers={3: 1.1, 5: 1.2, 10: 1.3, 20: 1.5, 30: 2.0},
            is_active=True,
        )
        reward_rules.append(streak_rule)

        return reward_rules

    def create_achievements_for_microcourse(
        self, module_id: int, micro_course: MicroCourseConfig
    ) -> List[AIEduAchievement]:
        """为微课程创建成就徽章"""

        logger.info(f"为微课程 {micro_course.title} 创建成就徽章")

        achievements = []

        # 1. 入门学者成就
        beginner_achievement = AIEduAchievement(
            achievement_code=f"MICRO_BEGINNER_{module_id}",
            name="入门学者",
            description=f"完成{micro_course.title}的前 3 个关卡",
            icon_url="🎓",
            rarity=AchievementRarity.COMMON,
            unlock_conditions=[
                {"type": "complete_levels", "count": 3, "module_id": module_id}
            ],
            points_reward=100,
            category="learning",
        )
        achievements.append(beginner_achievement)

        # 2. 实践达人成就
        practitioner_achievement = AIEduAchievement(
            achievement_code=f"MICRO_PRACTITIONER_{module_id}",
            name="实践达人",
            description="完成所有实践关卡并获得优秀评价",
            icon_url="💻",
            rarity=AchievementRarity.RARE,
            unlock_conditions=[
                {
                    "type": "complete_practice_levels",
                    "quality": "excellent",
                    "module_id": module_id,
                }
            ],
            points_reward=300,
            category="skill",
        )
        achievements.append(practitioner_achievement)

        # 3. 课程大师成就
        master_achievement = AIEduAchievement(
            achievement_code=f"MICRO_MASTER_{module_id}",
            name="课程大师",
            description="完成整个微课程并进入排行榜前 10",
            icon_url="🏆",
            rarity=AchievementRarity.EPIC,
            unlock_conditions=[
                {"type": "complete_all_levels", "module_id": module_id},
                {"type": "leaderboard_rank", "rank": 10},
            ],
            points_reward=500,
            category="special",
        )
        achievements.append(master_achievement)

        return achievements

    def save_microcourse(
        self,
        micro_course: MicroCourseConfig,
        reward_rules: List[AIEduRewardRule],
        achievements: List[AIEduAchievement],
    ) -> Dict[str, Any]:
        """保存微课程配置到数据库"""

        try:
            # 这里应该调用课程存储服务
            # 为了简化，我们只返回配置数据
            logger.info("微课程配置已生成（实际应保存到数据库）")

            return {
                "success": True,
                "micro_course": micro_course.to_dict(),
                "reward_rules_count": len(reward_rules),
                "achievements_count": len(achievements),
            }

        except Exception as e:
            logger.error(f"保存微课程失败：{e}")
            return {"success": False, "error": str(e)}


def get_micro_course_converter(db: Session) -> XEduMicroCourseConverter:
    """获取微课程转换器实例"""
    return XEduMicroCourseConverter(db)
