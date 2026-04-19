"""
数据库工具模块
"""

from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import asyncpg

from config.settings import settings
from database.tenant_aware_session import TenantAwareSession

# 自定义Neon连接创建器
def create_neon_connect_args(url):
    """为Neon数据库创建自定义连接参数"""
    # 移除channel_binding参数（asyncpg不支持）
    connect_args = {
        "ssl": "require",
    }
    return connect_args

# 创建异步引擎
if "neon" in settings.DATABASE_URL.lower():
    # Neon特殊配置
    engine = create_async_engine(
        settings.DATABASE_URL,
        echo=settings.DEBUG,
        pool_pre_ping=True,
        connect_args=create_neon_connect_args(settings.DATABASE_URL)
    )
else:
    engine = create_async_engine(
        settings.DATABASE_URL, echo=settings.DEBUG, pool_pre_ping=True
    )

# 创建异步会话工厂
AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

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


async def create_db_and_tables():
    """
    创建数据库表
    """
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
        try:
            await conn.run_sync(Base.metadata.create_all)
        except Exception as e:
            import logging
            logger = logging.getLogger(__name__)
            logger.warning(f"创建表时出错 (将继续): {e}")


async def close_db():
    """
    关闭数据库连接
    """
    await engine.dispose()


# 临时兼容层：为尚未迁移的代码提供 get_sync_db
def get_sync_db():
    """
    同步数据库会话依赖项（临时兼容层）
    注意：这只是一个占位符，实际使用时应该改为异步
    """
    import warnings
    warnings.warn(
        "get_sync_db is deprecated and will be removed. Use get_db (async) instead.",
        DeprecationWarning,
        stacklevel=2
    )
    # 返回一个空的生成器，避免立即报错
    # 实际使用时会失败，但这可以让导入成功
    yield None
