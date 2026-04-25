import os
from sqlalchemy import create_engine, Column, Integer, BigInteger, String, Float, Text, JSON, DateTime, ForeignKey
from sqlalchemy.orm import declarative_base, sessionmaker, relationship
from datetime import datetime

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
    echo=False,
    pool_size=20,              # 连接池大小
    max_overflow=10,           # 最大溢出连接数
    pool_timeout=30,           # 获取连接的超时时间（秒）
    pool_recycle=1800,         # 连接回收时间（秒），防止数据库断开空闲连接
    pool_pre_ping=True,        # 在使用前检查连接是否有效
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

class UserResource(Base):
    __tablename__ = "user_resources"

    id = Column(BigInteger, primary_key=True, index=True)
    original_resource_id = Column(String, index=True) # 原始资源ID（如果是从开源库同步的）
    title = Column(String, index=True)
    description = Column(Text)
    content_json = Column(JSON) # 存储完整的课程/项目结构
    contributor_id = Column(String, index=True) # 贡献者用户ID
    download_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class UserProfile(Base):
    __tablename__ = "user_profiles"

    id = Column(String, primary_key=True, index=True) # 用户ID
    username = Column(String, unique=True, index=True)
    points = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

class QuestionBank(Base):
    __tablename__ = "question_banks"

    id = Column(BigInteger, primary_key=True, index=True)
    name = Column(String, index=True) # 题库名称 (e.g., OpenStax Physics Ch1)
    description = Column(Text)
    source = Column(String, index=True) # 来源 (e.g., openstax, ted_ed)
    subject = Column(String, index=True) # 学科 (e.g., physics, biology)
    level = Column(String, index=True) # 难度等级 (elementary, middle, high, university)
    total_questions = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Question(Base):
    __tablename__ = "questions"

    id = Column(BigInteger, primary_key=True, index=True)
    bank_id = Column(BigInteger, ForeignKey("question_banks.id"), index=True)
    content = Column(Text) # 题目内容/题干
    question_type = Column(String, index=True) # 类型: multiple_choice, true_false, short_answer, essay
    options_json = Column(JSON) # 选项列表 (针对选择题)
    correct_answer = Column(Text) # 正确答案
    explanation = Column(Text) # 解析
    difficulty = Column(Float, default=0.5) # 难度系数 0-1
    knowledge_points = Column(JSON) # 关联的知识点标签 ["energy", "motion"]
    course_ids = Column(JSON) # 关联的课程ID列表 [101, 102]
    created_at = Column(DateTime, default=datetime.utcnow)

class UserAnswer(Base):
    __tablename__ = "user_answers"

    id = Column(BigInteger, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("user_profiles.id"), index=True)
    question_id = Column(BigInteger, ForeignKey("questions.id"), index=True)
    answer_content = Column(Text) # 用户作答内容
    is_correct = Column(Integer, default=0) # 是否正确 (0: 否, 1: 是)
    time_spent_seconds = Column(Integer, default=0) # 答题耗时
    answered_at = Column(DateTime, default=datetime.utcnow)

def init_db():
    Base.metadata.create_all(bind=engine)
