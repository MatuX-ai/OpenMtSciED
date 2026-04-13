"""
OpenMTSciEd 用户测试与反馈收集服务
设计50名K-12学生2周试用期的反馈收集系统
"""

import json
import logging
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
from pydantic import BaseModel, Field
from pathlib import Path
from enum import Enum

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class AgeGroup(str, Enum):
    """年龄组枚举"""
    ELEMENTARY = "小学(6-12岁)"
    MIDDLE = "初中(13-15岁)"
    HIGH = "高中(16-18岁)"


class SatisfactionLevel(str, Enum):
    """满意度等级"""
    VERY_SATISFIED = "非常满意"
    SATISFIED = "满意"
    NEUTRAL = "一般"
    DISSATISFIED = "不满意"
    VERY_DISSATISFIED = "非常不满意"


class UserFeedback(BaseModel):
    """用户反馈模型"""

    # 用户信息
    user_id: str = Field(..., description="用户ID")
    age: int = Field(..., ge=6, le=18, description="年龄")
    age_group: AgeGroup = Field(..., description="年龄组")
    grade_level: str = Field(..., description="年级")

    # 测试周期
    test_start_date: datetime = Field(default_factory=datetime.now, description="测试开始日期")
    test_end_date: datetime = Field(default_factory=lambda: datetime.now() + timedelta(days=14), description="测试结束日期")

    # 使用统计
    total_sessions: int = Field(default=0, description="总使用次数")
    total_learning_hours: float = Field(default=0, description="总学习时长(小时)")
    completed_paths: int = Field(default=0, description="完成的学习路径数")
    completed_hardware_projects: int = Field(default=0, description="完成的硬件项目数")

    # 功能评分(1-5分)
    path_generation_rating: int = Field(..., ge=1, le=5, description="路径生成评分")
    blockly_editor_rating: int = Field(..., ge=1, le=5, description="Blockly编辑器评分")
    hardware_flash_rating: int = Field(..., ge=1, le=5, description="硬件烧录评分")
    ai_tutor_rating: int = Field(..., ge=1, le=5, description="AI导师评分")
    ui_usability_rating: int = Field(..., ge=1, le=5, description="界面易用性评分")

    @property
    def avg_rating(self) -> float:
        """平均评分"""
        ratings = [
            self.path_generation_rating,
            self.blockly_editor_rating,
            self.hardware_flash_rating,
            self.ai_tutor_rating,
            self.ui_usability_rating
        ]
        return sum(ratings) / len(ratings)

    # 整体满意度
    overall_satisfaction: SatisfactionLevel = Field(..., description="整体满意度")

    # 开放式反馈
    liked_features: List[str] = Field(default_factory=list, description="喜欢的功能")
    disliked_features: List[str] = Field(default_factory=list, description="不喜欢的功能")
    improvement_suggestions: List[str] = Field(default_factory=list, description="改进建议")
    bugs_encountered: List[str] = Field(default_factory=list, description="遇到的Bug")

    # 推荐意愿(NPS)
    nps_score: int = Field(..., ge=0, le=10, description="净推荐值(0-10)")

    # 元数据
    submitted_at: datetime = Field(default_factory=datetime.now, description="提交时间")

    def to_dict(self) -> dict:
        """转换为字典"""
        return {
            "user_id": self.user_id,
            "age": self.age,
            "age_group": self.age_group.value,
            "grade_level": self.grade_level,
            "test_period_days": (self.test_end_date - self.test_start_date).days,
            "usage_stats": {
                "total_sessions": self.total_sessions,
                "total_learning_hours": self.total_learning_hours,
                "completed_paths": self.completed_paths,
                "completed_hardware_projects": self.completed_hardware_projects,
            },
            "feature_ratings": {
                "path_generation": self.path_generation_rating,
                "blockly_editor": self.blockly_editor_rating,
                "hardware_flash": self.hardware_flash_rating,
                "ai_tutor": self.ai_tutor_rating,
                "ui_usability": self.ui_usability_rating,
                "average": self.avg_rating,
            },
            "overall_satisfaction": self.overall_satisfaction.value,
            "nps_score": self.nps_score,
            "feedback": {
                "liked": self.liked_features,
                "disliked": self.disliked_features,
                "suggestions": self.improvement_suggestions,
                "bugs": self.bugs_encountered,
            },
            "submitted_at": self.submitted_at.isoformat(),
        }


class UserTestingCoordinator:
    """
    用户测试协调器

    管理50名K-12学生的2周试用期,收集和分析反馈
    """

    def __init__(self, data_dir: str = "data/user_testing"):
        self.data_dir = Path(data_dir)
        self.data_dir.mkdir(parents=True, exist_ok=True)

        self.feedbacks: List[UserFeedback] = []
        self.test_users: List[Dict[str, Any]] = []

    def generate_test_users(self, count: int = 50) -> List[Dict[str, Any]]:
        """
        生成测试用户列表

        Args:
            count: 用户数量

        Returns:
            用户列表
        """

        # 年龄分布: 小学40%, 初中35%, 高中25%
        age_distribution = {
            "小学": range(6, 13),
            "初中": range(13, 16),
            "高中": range(16, 19),
        }

        users = []
        for i in range(count):
            if i < count * 0.4:  # 40% 小学
                age_group = "小学"
                age_range = age_distribution["小学"]
            elif i < count * 0.75:  # 35% 初中
                age_group = "初中"
                age_range = age_distribution["初中"]
            else:  # 25% 高中
                age_group = "高中"
                age_range = age_distribution["高中"]

            age = list(age_range)[i % len(age_range)]

            user = {
                "user_id": f"test_user_{i+1:03d}",
                "age": age,
                "age_group": age_group,
                "grade_level": f"{age_group}{age - min(age_range) + 1}年级",
                "recruitment_channel": ["学校合作", "家长推荐", "在线招募"][i % 3],
                "test_start_date": datetime.now().isoformat(),
                "test_end_date": (datetime.now() + timedelta(days=14)).isoformat(),
            }

            users.append(user)

        self.test_users = users

        # 保存用户列表
        users_file = self.data_dir / "test_users.json"
        with open(users_file, 'w', encoding='utf-8') as f:
            json.dump(users, f, ensure_ascii=False, indent=2)

        logger.info(f"✅ 生成 {count} 名测试用户")
        logger.info(f"   小学: {int(count * 0.4)}人, 初中: {int(count * 0.35)}人, 高中: {int(count * 0.25)}人")

        return users

    def collect_feedback(self, feedback_data: Dict[str, Any]) -> UserFeedback:
        """
        收集单个用户反馈

        Args:
            feedback_data: 反馈数据字典

        Returns:
            UserFeedback对象
        """

        feedback = UserFeedback(**feedback_data)
        self.feedbacks.append(feedback)

        logger.info(f"✅ 收集用户 {feedback.user_id} 的反馈")

        return feedback

    def generate_sample_feedbacks(self, count: int = 50) -> List[UserFeedback]:
        """
        生成示例反馈数据(用于测试)

        Args:
            count: 反馈数量

        Returns:
            反馈列表
        """

        import random

        feedbacks = []
        for i in range(count):
            user = self.test_users[i] if i < len(self.test_users) else {
                "user_id": f"test_user_{i+1:03d}",
                "age": random.randint(6, 18),
                "age_group": random.choice(["小学", "初中", "高中"]),
            }

            age_group_map = {
                "小学": AgeGroup.ELEMENTARY,
                "初中": AgeGroup.MIDDLE,
                "高中": AgeGroup.HIGH,
            }

            feedback = UserFeedback(
                user_id=user["user_id"],
                age=user["age"],
                age_group=age_group_map.get(user["age_group"], AgeGroup.MIDDLE),
                grade_level=user.get("grade_level", "未知"),
                total_sessions=random.randint(5, 30),
                total_learning_hours=round(random.uniform(2, 20), 1),
                completed_paths=random.randint(1, 5),
                completed_hardware_projects=random.randint(0, 3),
                path_generation_rating=random.randint(3, 5),
                blockly_editor_rating=random.randint(3, 5),
                hardware_flash_rating=random.randint(2, 5),
                ai_tutor_rating=random.randint(3, 5),
                ui_usability_rating=random.randint(3, 5),
                overall_satisfaction=random.choice(list(SatisfactionLevel)),
                liked_features=random.sample([
                    "路径推荐很准确",
                    "Blockly编程很有趣",
                    "硬件项目实用",
                    "AI导师解释清晰",
                    "界面美观易用",
                    "学习进度可视化",
                ], k=random.randint(1, 3)),
                disliked_features=random.sample([
                    "加载速度慢",
                    "硬件连接不稳定",
                    "AI响应延迟高",
                    "部分功能复杂",
                ], k=random.randint(0, 2)),
                improvement_suggestions=random.sample([
                    "增加更多硬件项目",
                    "优化移动端体验",
                    "添加离线模式",
                    "提供更多示例代码",
                ], k=random.randint(1, 3)),
                bugs_encountered=random.sample([
                    "WebUSB偶尔断开",
                    "图表渲染慢",
                    "代码编译失败",
                ], k=random.randint(0, 2)),
                nps_score=random.randint(5, 10),
            )

            feedbacks.append(feedback)

        self.feedbacks = feedbacks

        # 保存反馈数据
        feedbacks_file = self.data_dir / "user_feedbacks.json"
        data = [f.to_dict() for f in feedbacks]
        with open(feedbacks_file, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)

        logger.info(f"✅ 生成 {count} 条示例反馈")

        return feedbacks

    def analyze_feedbacks(self) -> Dict[str, Any]:
        """
        分析反馈数据

        Returns:
            分析报告
        """

        if not self.feedbacks:
            return {"error": "无反馈数据"}

        # 基本统计
        total_users = len(self.feedbacks)
        avg_rating = sum(f.avg_rating for f in self.feedbacks) / total_users
        avg_nps = sum(f.nps_score for f in self.feedbacks) / total_users

        # NPS分类
        promoters = sum(1 for f in self.feedbacks if f.nps_score >= 9)  # 推荐者
        passives = sum(1 for f in self.feedbacks if 7 <= f.nps_score < 9)  # 被动者
        detractors = sum(1 for f in self.feedbacks if f.nps_score < 7)  # 批评者

        nps = ((promoters - detractors) / total_users) * 100

        # 满意度分布
        satisfaction_dist = {}
        for f in self.feedbacks:
            sat = f.overall_satisfaction.value
            satisfaction_dist[sat] = satisfaction_dist.get(sat, 0) + 1

        # 功能评分平均
        feature_avg = {
            "path_generation": sum(f.path_generation_rating for f in self.feedbacks) / total_users,
            "blockly_editor": sum(f.blockly_editor_rating for f in self.feedbacks) / total_users,
            "hardware_flash": sum(f.hardware_flash_rating for f in self.feedbacks) / total_users,
            "ai_tutor": sum(f.ai_tutor_rating for f in self.feedbacks) / total_users,
            "ui_usability": sum(f.ui_usability_rating for f in self.feedbacks) / total_users,
        }

        # Top改进建议
        all_suggestions = []
        for f in self.feedbacks:
            all_suggestions.extend(f.improvement_suggestions)

        suggestion_count = {}
        for s in all_suggestions:
            suggestion_count[s] = suggestion_count.get(s, 0) + 1

        top_suggestions = sorted(suggestion_count.items(), key=lambda x: x[1], reverse=True)[:5]

        # Top Bug
        all_bugs = []
        for f in self.feedbacks:
            all_bugs.extend(f.bugs_encountered)

        bug_count = {}
        for b in all_bugs:
            bug_count[b] = bug_count.get(b, 0) + 1

        top_bugs = sorted(bug_count.items(), key=lambda x: x[1], reverse=True)[:5]

        report = {
            "summary": {
                "total_users": total_users,
                "avg_rating": round(avg_rating, 2),
                "avg_nps": round(avg_nps, 2),
                "nps_score": round(nps, 2),
                "nps_breakdown": {
                    "promoters": promoters,
                    "passives": passives,
                    "detractors": detractors,
                },
            },
            "satisfaction_distribution": satisfaction_dist,
            "feature_ratings": {k: round(v, 2) for k, v in feature_avg.items()},
            "top_improvement_suggestions": top_suggestions,
            "top_bugs": top_bugs,
            "recommendations": self._generate_recommendations(avg_rating, nps, top_bugs),
        }

        # 保存报告
        report_file = self.data_dir / "analysis_report.json"
        with open(report_file, 'w', encoding='utf-8') as f:
            json.dump(report, f, ensure_ascii=False, indent=2)

        logger.info(f"✅ 反馈分析报告已生成")

        return report

    def _generate_recommendations(self, avg_rating: float, nps: float, top_bugs: List) -> List[str]:
        """生成改进建议"""

        recommendations = []

        if avg_rating < 3.5:
            recommendations.append("⚠️ 整体评分偏低,需全面优化用户体验")

        if nps < 30:
            recommendations.append("⚠️ NPS较低,需重点关注用户满意度提升")

        if top_bugs:
            recommendations.append(f"🐛 优先修复Top Bug: {top_bugs[0][0]} ({top_bugs[0][1]}次报告)")

        recommendations.append("✅ 继续优化AI导师响应速度")
        recommendations.append("✅ 增加硬件项目多样性")
        recommendations.append("✅ 完善移动端适配")

        return recommendations

    def export_all_data(self):
        """导出所有测试数据"""

        # 导出用户列表
        if self.test_users:
            users_file = self.data_dir / "test_users.json"
            with open(users_file, 'w', encoding='utf-8') as f:
                json.dump(self.test_users, f, ensure_ascii=False, indent=2)

        # 导出反馈
        if self.feedbacks:
            feedbacks_file = self.data_dir / "user_feedbacks.json"
            data = [f.to_dict() for f in self.feedbacks]
            with open(feedbacks_file, 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False, indent=2)

        # 导出分析报告
        if self.feedbacks:
            self.analyze_feedbacks()

        print(f"✅ 所有测试数据已导出到: {self.data_dir}")


# 示例使用
if __name__ == "__main__":
    coordinator = UserTestingCoordinator()

    print("=" * 60)
    print("用户测试与反馈收集系统")
    print("=" * 60)

    # 生成测试用户
    print("\n1. 生成50名测试用户:")
    users = coordinator.generate_test_users(50)
    print(f"   已生成 {len(users)} 名用户")

    # 生成示例反馈
    print("\n2. 生成示例反馈数据:")
    feedbacks = coordinator.generate_sample_feedbacks(50)
    print(f"   已生成 {len(feedbacks)} 条反馈")

    # 分析反馈
    print("\n3. 分析反馈数据:")
    report = coordinator.analyze_feedbacks()

    print(f"\n📊 测试结果摘要:")
    print(f"   总用户数: {report['summary']['total_users']}")
    print(f"   平均评分: {report['summary']['avg_rating']}/5")
    print(f"   NPS得分: {report['summary']['nps_score']}")
    print(f"   推荐者: {report['summary']['nps_breakdown']['promoters']}人")
    print(f"   批评者: {report['summary']['nps_breakdown']['detractors']}人")

    print(f"\n⭐ 功能评分:")
    for feature, rating in report['feature_ratings'].items():
        print(f"   {feature}: {rating}/5")

    print(f"\n💡 Top改进建议:")
    for suggestion, count in report['top_improvement_suggestions']:
        print(f"   - {suggestion} ({count}人提及)")

    print(f"\n🐛 Top Bug:")
    for bug, count in report['top_bugs']:
        print(f"   - {bug} ({count}次报告)")

    print(f"\n📋 改进建议:")
    for rec in report['recommendations']:
        print(f"   {rec}")

    # 导出数据
    print("\n4. 导出所有数据:")
    coordinator.export_all_data()
