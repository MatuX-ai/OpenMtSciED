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

# 修改 id 字段类型为 BIGINT
try:
    cur.execute("ALTER TABLE courses ALTER COLUMN id TYPE BIGINT")
    print("Modified id column to BIGINT")
except Exception as e:
    print(f"Error modifying id column: {e}")

cur.close()
conn.close()
print("Schema update complete.")
