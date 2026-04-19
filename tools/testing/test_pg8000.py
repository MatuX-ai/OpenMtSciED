import pg8000
import os
from dotenv import load_dotenv

load_dotenv()

# 获取 DATABASE_URL
db_url = os.getenv('DATABASE_URL')
print(f"DATABASE_URL: {db_url}")

# 解析 URL
from urllib.parse import urlparse

parsed = urlparse(db_url)
host = parsed.hostname
port = parsed.port or 5432
database = parsed.path.lstrip('/')
username = parsed.username
password = parsed.password

print(f"Host: {host}")
print(f"Port: {port}")
print(f"Database: {database}")
print(f"Username: {username}")
print(f"Password: {'*' * len(password) if password else 'None'}")

try:
    conn = pg8000.connect(
        host=host,
        port=port,
        database=database,
        user=username,
        password=password,
        ssl_context=True
    )
    print("连接成功！")
    conn.close()
except Exception as e:
    print(f"连接失败：{e}")
