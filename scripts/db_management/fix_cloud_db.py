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
cur.execute("SELECT column_name FROM information_schema.columns WHERE table_name = 'courses'")
print("Existing columns:", [row[0] for row in cur.fetchall()])

# 如果缺少字段，则添加
cols_to_add = {
    'source': 'TEXT',
    'level': 'TEXT',
    'subject': 'TEXT',
    'description': 'TEXT',
    'url': 'TEXT',
    'metadata_json': 'JSONB'
}

for col, typ in cols_to_add.items():
    try:
        cur.execute(f"ALTER TABLE courses ADD COLUMN {col} {typ}")
        print(f"Added column: {col}")
    except Exception as e:
        print(f"Column {col} already exists or error: {e}")

conn.commit()
cur.close()
conn.close()
print("Database schema updated.")
