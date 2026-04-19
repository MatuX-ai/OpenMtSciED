"""诊断Neon数据库连接问题"""
from sqlalchemy import create_engine, text
from sqlalchemy.ext.asyncio import create_async_engine
import asyncio

DATABASE_URL = "postgresql+asyncpg://neondb_owner:npg_gOwZRiQYy8W3@ep-dark-violet-a13zs25i-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"

print("=" * 60)
print("测试1: 检查URL解析")
print("=" * 60)

from sqlalchemy.engine import url as sqlalchemy_url
parsed = sqlalchemy_url.make_url(DATABASE_URL)
print(f"Driver: {parsed.drivername}")
print(f"Host: {parsed.host}")
print(f"Port: {parsed.port}")
print(f"Database: {parsed.database}")
print(f"Username: {parsed.username}")
print(f"Query params: {parsed.query}")

print("\n" + "=" * 60)
print("测试2: 创建异步引擎")
print("=" * 60)

try:
    # 移除sslmode参数，通过connect_args配置SSL
    clean_url = "postgresql+asyncpg://neondb_owner:npg_gOwZRiQYy8W3@ep-dark-violet-a13zs25i-pooler.ap-southeast-1.aws.neon.tech/neondb"
    
    engine = create_async_engine(
        clean_url,
        echo=True,
        pool_pre_ping=True,
        connect_args={
            "ssl": "require"
        }
    )
    print("✅ 引擎创建成功")
    
    async def test_query():
        async with engine.begin() as conn:
            result = await conn.execute(text("SELECT 1"))
            print(f"✅ 查询成功: {result.fetchone()}")
    
    asyncio.run(test_query())
    print("✅ 所有测试通过！")
    
except Exception as e:
    print(f"❌ 失败: {e}")
    import traceback
    traceback.print_exc()
