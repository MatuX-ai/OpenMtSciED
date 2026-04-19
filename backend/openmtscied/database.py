from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

# 加载环境变量 (优先加载 .env.local)
from pathlib import Path
env_path = Path(__file__).parent.parent.parent / ".env.local"
if env_path.exists():
    load_dotenv(dotenv_path=env_path)
else:
    load_dotenv() # 尝试加载默认的 .env

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise ValueError("⚠️ 错误: 未在环境变量中找到 DATABASE_URL (NeonDB 连接字符串)")

# 检查是否使用异步驱动
if "asyncpg" in DATABASE_URL:
    # 对于异步驱动，我们需要使用同步版本的URL或转换为同步驱动
    # 将 asyncpg 替换为 psycopg2 用于同步操作
    sync_database_url = DATABASE_URL.replace("postgresql+asyncpg://", "postgresql+psycopg2://")
    engine = create_engine(sync_database_url, connect_args={"sslmode": "require"})
else:
    # NeonDB 强制要求 SSL
    engine = create_engine(DATABASE_URL, connect_args={"sslmode": "require"})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
