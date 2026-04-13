"""
AI-Edu 积分排行榜系统数据模型
支持个人积分统计、多维度排行榜等功能
"""

import enum

from sqlalchemy import (
    JSON,
    Boolean,
    Column,
    DateTime,
    Float,
    ForeignKey,
    Index,
    Integer,
    String,
    UniqueConstraint,
    func,
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func as sql_func

from database.db import Base


class LeaderboardPeriod(str, enum.Enum):
    """排行榜周期枚举"""

    DAILY = "daily"  # 日榜
    WEEKLY = "weekly"  # 周榜
    MONTHLY = "monthly"  # 月榜
    ALL_TIME = "all_time"  # 总榜


class LeaderboardType(str, enum.Enum):
    """排行榜类型枚举"""

    TOTAL_POINTS = "total_points"  # 总积分
    STUDY_TIME = "study_time"  # 学习时长
    COURSES_COMPLETED = "courses_completed"  # 完成课程数
    QUIZ_SCORE = "quiz_score"  # 测验平均分
    ACHIEVEMENTS = "achievements"  # 成就数量
    CODE_EXECUTIONS = "code_executions"  # 代码执行次数


class UserPoints(Base):
    """用户积分表"""

    __tablename__ = "user_points"

    id = Column(Integer, primary_key=True, autoincrement=True)

    # 关联信息
    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False,
        unique=True,
        index=True,
        comment="用户 ID",
    )

    # 积分信息
    total_points = Column(Integer, default=0, comment="总积分")
    available_points = Column(Integer, default=0, comment="可用积分（未消费）")
    consumed_points = Column(Integer, default=0, comment="已消费积分")

    # 积分明细（JSON 存储来源）
    points_breakdown = Column(JSON, default=dict, comment="积分来源明细")
    # 示例结构:
    # {
    #     "course_completion": 500,    # 课程完成奖励
    #     "achievement_unlock": 300,   # 成就解锁奖励
    #     "quiz_perfect_score": 150,   # 测验满分奖励
    #     "daily_checkin": 50,         # 每日签到
    #     "code_execution": 100        # 代码执行
    # }

    # 时间戳
    created_at = Column(DateTime(timezone=True), server_default=sql_func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=sql_func.now())

    # 关系
    user = relationship("User", backref="points")
    transactions = relationship("PointsTransaction", back_populates="user")

    def to_dict(self):
        """转换为字典"""
        return {
            "id": self.id,
            "user_id": self.user_id,
            "total_points": self.total_points,
            "available_points": self.available_points,
            "consumed_points": self.consumed_points,
            "points_breakdown": self.points_breakdown,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }


class PointsTransaction(Base):
    """积分交易流水表"""

    __tablename__ = "points_transactions"

    id = Column(Integer, primary_key=True, autoincrement=True)

    # 关联信息
    user_id = Column(
        Integer, ForeignKey("users.id"), nullable=False, index=True, comment="用户 ID"
    )

    # 交易信息
    transaction_type = Column(
        String(20), nullable=False, comment="交易类型：earn/spend"
    )
    points_amount = Column(Integer, nullable=False, comment="积分金额")
    balance_after = Column(Integer, nullable=False, comment="交易后余额")

    # 交易原因
    reason = Column(String(100), nullable=False, comment="交易原因")
    reference_type = Column(
        String(50), comment="关联类型（如 course, achievement, quiz）"
    )
    reference_id = Column(Integer, comment="关联 ID")

    # 描述信息
    description = Column(String(500), comment="交易描述")
    metadata = Column(JSON, default=dict, comment="额外元数据")

    # 时间戳
    created_at = Column(
        DateTime(timezone=True),
        server_default=sql_func.now(),
        index=True,
        comment="交易时间",
    )

    # 关系
    user = relationship("User", back_populates="transactions")

    # 索引
    __table_args__ = (
        Index("idx_transaction_user_type", "user_id", "transaction_type"),
        Index("idx_transaction_created", "created_at"),
    )

    def to_dict(self):
        """转换为字典"""
        return {
            "id": self.id,
            "user_id": self.user_id,
            "transaction_type": self.transaction_type,
            "points_amount": self.points_amount,
            "balance_after": self.balance_after,
            "reason": self.reason,
            "reference_type": self.reference_type,
            "reference_id": self.reference_id,
            "description": self.description,
            "metadata": self.metadata,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


class LeaderboardRecord(Base):
    """排行榜记录表（定期快照，用于历史查询）"""

    __tablename__ = "leaderboard_records"

    id = Column(Integer, primary_key=True, autoincrement=True)

    # 关联信息
    user_id = Column(
        Integer, ForeignKey("users.id"), nullable=False, index=True, comment="用户 ID"
    )

    # 排行榜信息
    leaderboard_type = Column(String(50), nullable=False, comment="排行榜类型")
    period = Column(
        String(20), nullable=False, comment="周期（daily/weekly/monthly/all_time）"
    )
    period_start = Column(
        DateTime(timezone=True), nullable=False, comment="周期开始时间"
    )
    period_end = Column(DateTime(timezone=True), nullable=False, comment="周期结束时间")

    # 排名信息
    rank = Column(Integer, nullable=False, index=True, comment="排名")
    score = Column(Integer, nullable=False, comment="分数/数值")

    # 变化信息
    rank_change = Column(Integer, default=0, comment="排名变化（相比上期）")
    score_change = Column(Integer, default=0, comment="分数变化")

    # 时间戳
    recorded_at = Column(
        DateTime(timezone=True), server_default=sql_func.now(), comment="记录时间"
    )

    # 唯一约束（同一用户同一周期同一类型的排行榜只有一条记录）
    __table_args__ = (
        UniqueConstraint(
            "user_id",
            "leaderboard_type",
            "period",
            "period_start",
            name="uix_leaderboard_unique",
        ),
        Index("idx_leaderboard_period", "period", "period_start"),
        Index("idx_leaderboard_type_rank", "leaderboard_type", "rank"),
    )

    def to_dict(self):
        """转换为字典"""
        return {
            "id": self.id,
            "user_id": self.user_id,
            "leaderboard_type": self.leaderboard_type,
            "period": self.period,
            "period_start": (
                self.period_start.isoformat() if self.period_start else None
            ),
            "period_end": self.period_end.isoformat() if self.period_end else None,
            "rank": self.rank,
            "score": self.score,
            "rank_change": self.rank_change,
            "score_change": self.score_change,
            "recorded_at": self.recorded_at.isoformat() if self.recorded_at else None,
        }


class UserStatistics(Base):
    """用户统计表（物化视图，加速查询）"""

    __tablename__ = "user_statistics"

    id = Column(Integer, primary_key=True, autoincrement=True)

    # 关联信息
    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False,
        unique=True,
        index=True,
        comment="用户 ID",
    )

    # 学习统计
    total_study_time_minutes = Column(Integer, default=0, comment="总学习时长（分钟）")
    courses_completed = Column(Integer, default=0, comment="完成课程数")
    quizzes_taken = Column(Integer, default=0, comment="参加测验次数")
    average_quiz_score = Column(Float, default=0.0, comment="平均测验分数")
    code_executions = Column(Integer, default=0, comment="代码执行次数")
    achievements_unlocked = Column(Integer, default=0, comment="解锁成就数")

    # 活跃统计
    current_streak_days = Column(Integer, default=0, comment="当前连续学习天数")
    longest_streak_days = Column(Integer, default=0, comment="最长连续学习天数")
    total_active_days = Column(Integer, default=0, comment="总活跃天数")
    last_active_date = Column(DateTime(timezone=True), comment="最后活跃日期")

    # 时间戳
    created_at = Column(DateTime(timezone=True), server_default=sql_func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=sql_func.now())

    # 关系
    user = relationship("User", backref="statistics")

    def to_dict(self):
        """转换为字典"""
        return {
            "id": self.id,
            "user_id": self.user_id,
            "total_study_time_minutes": self.total_study_time_minutes,
            "courses_completed": self.courses_completed,
            "quizzes_taken": self.quizzes_taken,
            "average_quiz_score": self.average_quiz_score,
            "code_executions": self.code_executions,
            "achievements_unlocked": self.achievements_unlocked,
            "current_streak_days": self.current_streak_days,
            "longest_streak_days": self.longest_streak_days,
            "total_active_days": self.total_active_days,
            "last_active_date": (
                self.last_active_date.isoformat() if self.last_active_date else None
            ),
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }


# ==================== 辅助函数 ====================


def calculate_period_bounds(
    period: LeaderboardPeriod, reference_date: DateTime = None
) -> tuple:
    """
    计算周期的起止时间

    Returns:
        (period_start, period_end)  datetime 元组
    """
    from datetime import timedelta

    if reference_date is None:
        reference_date = func.now()

    if period == LeaderboardPeriod.DAILY:
        # 当天 00:00:00 到 23:59:59
        period_start = func.date_trunc("day", reference_date)
        period_end = period_start + timedelta(days=1)

    elif period == LeaderboardPeriod.WEEKLY:
        # 本周一 00:00:00 到下周一 00:00:00
        period_start = func.date_trunc("week", reference_date)
        period_end = period_start + timedelta(weeks=1)

    elif period == LeaderboardPeriod.MONTHLY:
        # 本月 1 号 00:00:00 到下月 1 号 00:00:00
        period_start = func.date_trunc("month", reference_date)
        period_end = period_start + timedelta(days=32)
        period_end = func.date_trunc("month", period_end)

    else:  # ALL_TIME
        # 从创始到现在
        period_start = "2024-01-01 00:00:00"  # 或项目启动日期
        period_end = func.now()

    return period_start, period_end
