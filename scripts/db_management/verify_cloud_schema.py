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
cur = conn.cursor()

# 确保表存在
cur.execute("""
    CREATE TABLE IF NOT EXISTS courses (
        id TEXT PRIMARY KEY,
        title TEXT,
        source TEXT,
        level TEXT,
        subject TEXT,
        description TEXT,
        url TEXT,
        metadata_json JSONB
    )
""")

conn.commit()
cur.close()
conn.close()
print("Table schema verified.")
