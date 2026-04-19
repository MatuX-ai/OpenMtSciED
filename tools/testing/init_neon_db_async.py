"""
异步初始化 NeonDB 表结构
使用异步数据库连接
"""
import sys
import os
import asyncio

# 将 backend 目录加入系统路径
backend_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'backend')
if backend_path not in sys.path:
    sys.path.insert(0, backend_path)

try:
    from openmtscied.async_database import async_engine, AsyncBase
    from openmtscied.models.user import User
except ImportError as e:
    print(f"❌ 导入失败: {e}")
    print("请确保已安装 sqlalchemy, asyncpg 等依赖。")
    sys.exit(1)


async def init_db():
    """异步初始化数据库"""
    print("🔄 正在连接 NeonDB 并创建表结构（异步模式）...")
    try:
        # 使用异步方式创建所有表
        async with async_engine.begin() as conn:
            await conn.run_sync(AsyncBase.metadata.create_all)
        print("✅ 成功！'users' 表已在 NeonDB 中创建（异步模式）。")
    except Exception as e:
        print(f"❌ 失败: {e}")
        print("请检查 .env.local 中的 DATABASE_URL 是否正确，以及网络是否通畅。")
    finally:
        # 关闭引擎
        await async_engine.dispose()


if __name__ == "__main__":
    asyncio.run(init_db())
