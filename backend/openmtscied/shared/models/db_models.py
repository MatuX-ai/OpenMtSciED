import os
from sqlalchemy import create_engine, Column, Integer, BigInteger, String, Float, Text, JSON
from sqlalchemy.orm import declarative_base, sessionmaker

# 数据库配置 (从环境变量读取，默认为 .env.local 中的 Neon 配置)
DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise EnvironmentError("DATABASE_URL environment variable is not set. Please check .env.local")

# 处理 SSL 模式 (Neon/Supabase 等云数据库通常需要)
# psycopg2 驱动需要在 URL 中通过参数传递 sslmode
if "neon.tech" in DATABASE_URL or "supabase" in DATABASE_URL:
    if "sslmode" not in DATABASE_URL:
        separator = "&" if "?" in DATABASE_URL else "?"
        DATABASE_URL += f"{separator}sslmode=require"

# 确保使用 psycopg2 驱动以支持同步操作和 URL 参数
if DATABASE_URL.startswith("postgresql+asyncpg://"):
    DATABASE_URL = DATABASE_URL.replace("postgresql+asyncpg://", "postgresql+psycopg2://")
elif DATABASE_URL.startswith("postgresql://"):
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+psycopg2://")

engine = create_engine(
    DATABASE_URL,
    echo=False
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class Course(Base):
    __tablename__ = "stem_courses"

    id = Column(BigInteger, primary_key=True, index=True)
    title = Column(String, index=True)
    source = Column(String, index=True)
    level = Column(String, index=True)  # elementary, middle, high, university
    subject = Column(String, index=True)
    description = Column(Text)
    url = Column(String)
    metadata_json = Column(JSON)

def init_db():
    Base.metadata.create_all(bind=engine)
