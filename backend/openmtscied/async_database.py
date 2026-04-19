"""
OpenMTSciEd 异步数据库配置
提供基于 asyncpg 的异步数据库连接和会话管理
"""
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base
import os
from dotenv import load_dotenv
from pathlib import Path

# 加载环境变量 (优先加载 .env.local)
env_path = Path(__file__).parent.parent.parent / ".env.local"
if env_path.exists():
    load_dotenv(dotenv_path=env_path)
else:
    load_dotenv()  # 尝试加载默认的 .env

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise ValueError("⚠️ 错误: 未在环境变量中找到 DATABASE_URL (NeonDB 连接字符串)")

# 确保使用 asyncpg 驱动
if "asyncpg" not in DATABASE_URL:
    # 如果不是 asyncpg，则转换 URL
    if DATABASE_URL.startswith("postgresql://"):
        ASYNC_DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://")
    elif DATABASE_URL.startswith("postgresql+psycopg2://"):
        ASYNC_DATABASE_URL = DATABASE_URL.replace("postgresql+psycopg2://", "postgresql+asyncpg://")
    else:
        ASYNC_DATABASE_URL = DATABASE_URL
else:
    ASYNC_DATABASE_URL = DATABASE_URL

# 创建异步引擎
# NeonDB 需要 SSL 连接，asyncpg 通过 ssl 参数处理
async_engine = create_async_engine(
    ASYNC_DATABASE_URL,
    connect_args={"ssl": "require"},  # asyncpg 使用 ssl 而不是 sslmode
    pool_pre_ping=True,  # 连接池健康检查
    pool_recycle=3600,   # 连接回收时间（秒）
    echo=False           # 设置为 True 可以看到 SQL 日志
)

# 创建异步会话工厂
AsyncSessionLocal = async_sessionmaker(
    bind=async_engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False
)

# 基础模型类
AsyncBase = declarative_base()


async def get_async_db() -> AsyncSession:
    """
    获取异步数据库会话
    用于 FastAPI 依赖注入
    """
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()


async def init_async_db():
    """
    初始化异步数据库表结构
    """
    async with async_engine.begin() as conn:
        await conn.run_sync(AsyncBase.metadata.create_all)


async def close_async_db():
    """
    关闭异步数据库引擎
    """
    await async_engine.dispose()
