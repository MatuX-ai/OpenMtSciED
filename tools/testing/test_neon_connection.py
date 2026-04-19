"""
测试 Neon PostgreSQL 数据库连接
"""
import os
from dotenv import load_dotenv

# 加载 .env 文件
load_dotenv()

print("=" * 60)
print("Neon PostgreSQL 数据库连接测试")
print("=" * 60)

# 检查环境变量
database_url = os.getenv("DATABASE_URL")

print(f"\n1. 环境变量检查:")
print(f"   DATABASE_URL: {'✓ 已配置' if database_url else '✗ 未配置'}")

if not database_url:
    print("\n✗ 错误: DATABASE_URL 未配置")
    exit(1)

print(f"\n2. 数据库URL (部分): {database_url[:60]}...")

# 测试异步连接
print("\n3. 测试数据库连接...")
try:
    import asyncio
    from sqlalchemy.ext.asyncio import create_async_engine
    from sqlalchemy import text
    
    async def test_connection():
        engine = create_async_engine(database_url, echo=False)
        try:
            async with engine.connect() as conn:
                # 测试基本查询
                result = await conn.execute(text("SELECT 1"))
                await conn.commit()
                
                # 测试数据库版本查询
                version_result = await conn.execute(text("SELECT version()"))
                version_row = version_result.fetchone()
                if version_row:
                    print(f"   ✓ 数据库连接成功!")
                    print(f"   ✓ PostgreSQL 版本: {version_row[0][:50]}...")
                return True
        except Exception as e:
            print(f"   ✗ 连接失败: {str(e)}")
            return False
        finally:
            await engine.dispose()
    
    result = asyncio.run(test_connection())
    
except ImportError as e:
    print(f"   ✗ 缺少依赖: {str(e)}")
    print("   请运行: pip install asyncpg sqlalchemy[asyncio]")
except Exception as e:
    print(f"   ✗ 测试出错: {str(e)}")

print("\n" + "=" * 60)
print("测试完成")
print("=" * 60)
