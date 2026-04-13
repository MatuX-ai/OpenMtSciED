"""
数据库工具模块
"""

from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

from config.settings import settings
from database.tenant_aware_session import TenantAwareSession

# 创建异步引擎
engine = create_async_engine(
    settings.DATABASE_URL, echo=settings.DEBUG, pool_pre_ping=True
)

# 创建异步会话工厂
AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

# 创建租户感知的同步会话工厂
SyncSessionLocal = sessionmaker(
    bind=engine.sync_engine if hasattr(engine, "sync_engine") else None,
    class_=TenantAwareSession,
    expire_on_commit=False,
)

# 创建基类
Base = declarative_base()


async def get_db():
    """
    数据库会话依赖项（异步）
    """
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()


async def get_async_db():
    """
    数据库会话依赖项（异步）- 别名
    """
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()


def get_sync_db():
    """
    数据库会话依赖项（同步）
    """
    session = SyncSessionLocal()
    try:
        yield session
    finally:
        session.close()


async def create_db_and_tables():
    """
    创建数据库表
    """
    # 导入所有模型以确保它们被注册到 Base.metadata
    # 按依赖顺序导入：先导入基础模型，再导入依赖模型
    from models.license import Organization, License
    from models.user import User
    from models.ar_vr_content import ARVRContent
    from models.content_store import ContentItem
    from models.course_version import CourseVersion
    from models.dynamic_course import GeneratedCourse
    from models.hardware_certification import HardwareCertificationDB
    from models.hardware_module import HardwareModule
    from models.learning_source import LearningSource
    from models.payment import Payment
    from models.permission import Permission
    from models.subscription import SubscriptionPlan
    from models.subscription_fsm import SubscriptionFSM
    from models.unified_learning_record import UnifiedLearningRecord
    from models.user_license import UserLicense
    from models.user_organization import UserOrganization
    from models.ai_request import AIRequest
    from models.course import Course, CourseLesson, CourseAssignment

    async with engine.begin() as conn:
        # 导入所有模型以确保它们被注册
        # 使用 run_sync 运行同步的 SQLAlchemy 操作
        try:
            await conn.run_sync(Base.metadata.create_all)
        except Exception as e:
            # 如果创建失败，记录错误但继续
            import logging
            logger = logging.getLogger(__name__)
            logger.warning(f"创建表时出错 (将继续): {e}")


async def close_db():
    """
    关闭数据库连接
    """
    await engine.dispose()
