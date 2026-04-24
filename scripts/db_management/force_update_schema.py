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
conn.autocommit = True  # 强制自动提交，避免事务中止
cur = conn.cursor()

# 获取当前列
cur.execute("SELECT column_name FROM information_schema.columns WHERE table_name = 'courses'")
existing_cols = [row[0] for row in cur.fetchall()]
print(f"Existing columns: {existing_cols}")

# 强制添加缺失列
required_cols = {
    'source': 'TEXT',
    'level': 'TEXT',
    'subject': 'TEXT',
    'description': 'TEXT',
    'url': 'TEXT',
    'metadata_json': 'JSONB'
}

for col, typ in required_cols.items():
    if col not in existing_cols:
        try:
            cur.execute(f"ALTER TABLE courses ADD COLUMN {col} {typ}")
            print(f"Added column: {col}")
        except Exception as e:
            print(f"Error adding {col}: {e}")
    else:
        print(f"Column {col} already exists")

cur.close()
conn.close()
print("Schema update complete.")
