"""
AI-Edu-for-Kids 独立数据模型

这些模型完全独立于项目其他模块，避免 Role 等模型的依赖冲突
使用 SQLAlchemy Core + Lite 的方式实现
"""

from datetime import datetime

from sqlalchemy import (
    JSON,
    Boolean,
    Column,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
    create_engine,
    text,
)
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()


class AIEduModule(Base):
    """AI 课程模块表"""

    __tablename__ = "ai_edu_modules"

    id = Column(Integer, primary_key=True, autoincrement=True)
    module_code = Column(String(50), unique=True, nullable=False)
    name = Column(String(100), nullable=False)
    description = Column(Text)
    category = Column(String(50))
    grade_ranges = Column(JSON)  # [{'min': 1, 'max': 6}]
    expected_lessons = Column(Integer, default=0)
    expected_duration_minutes = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    display_order = Column(Integer, default=0)

    def to_dict(self):
        return {
            "id": self.id,
            "module_code": self.module_code,
            "name": self.name,
            "description": self.description,
            "category": self.category,
            "grade_ranges": self.grade_ranges,
            "expected_lessons": self.expected_lessons,
            "expected_duration_minutes": self.expected_duration_minutes,
            "is_active": self.is_active,
            "display_order": self.display_order,
        }


class AIEduLesson(Base):
    """AI 课程课时表"""

    __tablename__ = "ai_edu_lessons"

    id = Column(Integer, primary_key=True, autoincrement=True)
    module_id = Column(Integer, ForeignKey("ai_edu_modules.id"))
    lesson_code = Column(String(50), unique=True, nullable=False)
    title = Column(String(100), nullable=False)
    subtitle = Column(String(200))
    content_type = Column(String(20))  # theory, practice, hybrid
    content_url = Column(String(500))
    resources = Column(JSON)  # [{type, url, title, description}]
    learning_objectives = Column(JSON)
    knowledge_points = Column(JSON)
    estimated_duration_minutes = Column(Integer)
    has_quiz = Column(Boolean, default=False)
    quiz_passing_score = Column(Float, default=60.0)
    has_practice = Column(Boolean, default=False)
    practice_type = Column(String(20))  # python, scratch, etc.
    base_points = Column(Integer, default=20)
    is_active = Column(Boolean, default=True)
    display_order = Column(Integer, default=0)

    def to_dict(self):
        return {
            "id": self.id,
            "module_id": self.module_id,
            "lesson_code": self.lesson_code,
            "title": self.title,
            "subtitle": self.subtitle,
            "content_type": self.content_type,
            "content_url": self.content_url,
            "resources": self.resources,
            "learning_objectives": self.learning_objectives,
            "knowledge_points": self.knowledge_points,
            "estimated_duration_minutes": self.estimated_duration_minutes,
            "has_quiz": self.has_quiz,
            "quiz_passing_score": self.quiz_passing_score,
            "has_practice": self.has_practice,
            "practice_type": self.practice_type,
            "base_points": self.base_points,
            "is_active": self.is_active,
            "display_order": self.display_order,
        }


class AIEduLearningProgress(Base):
    """用户学习进度表"""

    __tablename__ = "ai_edu_learning_progress"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, nullable=False, index=True)
    lesson_id = Column(Integer, nullable=False)
    progress_percentage = Column(Float, default=0.0)
    status = Column(
        String(20), default="not_started"
    )  # not_started, in_progress, completed
    time_spent_seconds = Column(Integer, default=0)
    quiz_score = Column(Float)
    code_quality_score = Column(Float)
    start_time = Column(DateTime)
    completion_time = Column(DateTime)
    last_accessed_time = Column(DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "progress_id": self.id,
            "user_id": self.user_id,
            "lesson_id": self.lesson_id,
            "progress_percentage": self.progress_percentage,
            "status": self.status,
            "time_spent_seconds": self.time_spent_seconds,
            "quiz_score": self.quiz_score,
            "code_quality_score": self.code_quality_score,
            "start_time": self.start_time.isoformat() if self.start_time else None,
            "completion_time": (
                self.completion_time.isoformat() if self.completion_time else None
            ),
            "last_accessed_time": (
                self.last_accessed_time.isoformat() if self.last_accessed_time else None
            ),
        }


class AIEduPointsTransaction(Base):
    """积分交易记录表"""

    __tablename__ = "ai_edu_points_transactions"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, nullable=False, index=True)
    transaction_type = Column(String(10), nullable=False)  # earn, spend
    points_amount = Column(Integer, nullable=False)
    source_type = Column(String(50))  # course_completion, quiz, practice
    source_id = Column(Integer)
    base_points = Column(Integer, default=0)
    quality_bonus = Column(Integer, default=0)
    streak_bonus = Column(Integer, default=0)
    final_points = Column(Integer, default=0)
    status = Column(String(20), default="pending")  # pending, completed, cancelled
    transaction_time = Column(DateTime, default=datetime.utcnow)
    notes = Column(Text)

    def to_dict(self):
        return {
            "transaction_id": self.id,
            "user_id": self.user_id,
            "transaction_type": self.transaction_type,
            "points_amount": self.points_amount,
            "source_type": self.source_type,
            "source_id": self.source_id,
            "base_points": self.base_points,
            "quality_bonus": self.quality_bonus,
            "streak_bonus": self.streak_bonus,
            "final_points": self.final_points,
            "status": self.status,
            "transaction_time": self.transaction_time.isoformat(),
            "notes": self.notes,
        }


# 数据库管理器
class AIEduDatabaseManager:
    """AI-Edu 数据库管理器

    提供简化的数据库操作接口，避免复杂的项目依赖
    """

    def __init__(self, db_path: str = None):
        from pathlib import Path

        if db_path is None:
            db_path = Path(__file__).parent.parent / "data" / "ai_edu_standalone.db"

        self.db_path = db_path
        self.database_url = f"sqlite:///{db_path}"
        self.engine = create_engine(self.database_url, echo=False)

        # 创建所有表
        Base.metadata.create_all(self.engine)

    def get_connection(self):
        """获取数据库连接"""
        return self.engine.connect()

    def execute_query(self, query: str, params: dict = None):
        """执行 SQL 查询"""
        with self.engine.connect() as conn:
            result = conn.execute(text(query), params or {})
            conn.commit()
            return result

    # ========== 模块相关操作 ==========

    def get_all_modules(self, active_only=True):
        """获取所有课程模块"""
        query = "SELECT * FROM ai_edu_modules"
        if active_only:
            query += " WHERE is_active = 1"
        query += " ORDER BY display_order"

        result = self.execute_query(query)
        return [dict(row._mapping) for row in result]

    def get_module_by_id(self, module_id: int):
        """根据 ID 获取模块"""
        query = "SELECT * FROM ai_edu_modules WHERE id = :id"
        result = self.execute_query(query, {"id": module_id})
        row = result.fetchone()
        return dict(row._mapping) if row else None

    def get_lessons_by_module(self, module_id: int, active_only=True):
        """获取指定模块的所有课时"""
        query = "SELECT * FROM ai_edu_lessons WHERE module_id = :module_id"
        if active_only:
            query += " AND is_active = 1"
        query += " ORDER BY display_order"

        result = self.execute_query(query, {"module_id": module_id})
        return [dict(row._mapping) for row in result]

    # ========== 学习进度相关操作 ==========

    def get_user_progress(self, user_id: int, lesson_id: int = None):
        """获取用户学习进度"""
        query = "SELECT * FROM ai_edu_learning_progress WHERE user_id = :user_id"
        params = {"user_id": user_id}

        if lesson_id:
            query += " AND lesson_id = :lesson_id"
            params["lesson_id"] = lesson_id

        result = self.execute_query(query, params)
        return [dict(row._mapping) for row in result]

    def update_or_create_progress(
        self, user_id: int, lesson_id: int, progress_data: dict
    ):
        """更新或创建学习进度记录"""
        # 检查是否已存在
        existing = self.get_user_progress(user_id, lesson_id)

        if existing:
            # 更新现有记录
            progress_id = existing[0]["id"]
            update_fields = []
            for key, value in progress_data.items():
                if value is not None:
                    update_fields.append(f"{key} = :{key}")

            if update_fields:
                update_fields.append("last_accessed_time = :last_accessed_time")
                progress_data["last_accessed_time"] = datetime.utcnow().isoformat()

                query = f"UPDATE ai_edu_learning_progress SET {', '.join(update_fields)} WHERE id = :id"
                progress_data["id"] = progress_id

                self.execute_query(query, progress_data)
        else:
            # 创建新记录
            progress_data["user_id"] = user_id
            progress_data["lesson_id"] = lesson_id
            progress_data["start_time"] = datetime.utcnow().isoformat()
            progress_data["last_accessed_time"] = datetime.utcnow().isoformat()

            columns = list(progress_data.keys())
            values = [f":{col}" for col in columns]

            query = f"""
                INSERT INTO ai_edu_learning_progress ({', '.join(columns)})
                VALUES ({', '.join(values)})
            """

            self.execute_query(query, progress_data)

        return self.get_user_progress(user_id, lesson_id)[0]

    # ========== 积分相关操作 ==========

    def add_points_transaction(self, user_id: int, points_data: dict):
        """添加积分交易记录"""
        points_data["user_id"] = user_id
        points_data["transaction_time"] = datetime.utcnow().isoformat()

        columns = list(points_data.keys())
        values = [f":{col}" for col in columns]

        query = f"""
            INSERT INTO ai_edu_points_transactions ({', '.join(columns)})
            VALUES ({', '.join(values)})
        """

        self.execute_query(query, points_data)

    def get_user_total_points(self, user_id: int):
        """获取用户总积分"""
        query = """
            SELECT COALESCE(SUM(final_points), 0) as total
            FROM ai_edu_points_transactions
            WHERE user_id = :user_id AND transaction_type = 'earn' AND status = 'completed'
        """

        result = self.execute_query(query, {"user_id": user_id})
        row = result.fetchone()
        return row["total"] if row else 0

    # ========== 统计相关操作 ==========

    def get_user_statistics(self, user_id: int):
        """获取用户学习统计"""
        stats = {}

        # 学习进度统计
        progress_query = """
            SELECT 
                COUNT(*) as total_courses,
                SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_courses,
                SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress_courses,
                SUM(CASE WHEN status = 'not_started' THEN 1 ELSE 0 END) as not_started_courses,
                COALESCE(SUM(time_spent_seconds), 0) as total_time_seconds,
                AVG(quiz_score) as avg_quiz_score,
                AVG(code_quality_score) as avg_code_score
            FROM ai_edu_learning_progress
            WHERE user_id = :user_id
        """

        result = self.execute_query(progress_query, {"user_id": user_id})
        row = result.fetchone()

        if row:
            stats["total_courses"] = row["total_courses"] or 0
            stats["completed_courses"] = row["completed_courses"] or 0
            stats["in_progress_courses"] = row["in_progress_courses"] or 0
            stats["not_started_courses"] = row["not_started_courses"] or 0
            stats["total_time_hours"] = round(
                (row["total_time_seconds"] or 0) / 3600, 2
            )
            stats["average_quiz_score"] = round(row["avg_quiz_score"] or 0, 2)
            stats["average_code_score"] = round(row["avg_code_score"] or 0, 2)

        # 总积分
        stats["total_points"] = self.get_user_total_points(user_id)

        # 完成率
        if stats["total_courses"] > 0:
            stats["completion_rate"] = round(
                stats["completed_courses"] / stats["total_courses"] * 100, 2
            )
        else:
            stats["completion_rate"] = 0

        return stats


# 全局单例
_db_manager = None


def get_ai_edu_db():
    """获取 AI-Edu 数据库管理器单例"""
    global _db_manager
    if _db_manager is None:
        _db_manager = AIEduDatabaseManager()
    return _db_manager
