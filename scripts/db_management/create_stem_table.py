from dotenv import load_dotenv
import os
load_dotenv('.env.local')

url = os.getenv('DATABASE_URL')
if url.startswith("postgresql+asyncpg://"):
    url = url.replace("postgresql+asyncpg://", "postgresql://")
if "sslmode" not in url:
    url += "?sslmode=require"

import psycopg2

conn = psycopg2.connect(url)
conn.autocommit = True
cur = conn.cursor()

# 删除旧表（如果有）
cur.execute("DROP TABLE IF EXISTS stem_courses CASCADE")

# 创建专门用于 STEM 课程的新表
cur.execute("""
    CREATE TABLE stem_courses (
        id BIGINT PRIMARY KEY,
        title TEXT,
        source TEXT,
        level TEXT,
        subject TEXT,
        description TEXT,
        url TEXT,
        metadata_json JSONB
    )
""")

cur.close()
conn.close()
print("Created clean stem_courses table.")
