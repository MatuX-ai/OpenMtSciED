"""
测试异步数据库配置
"""
import sys
import os
import asyncio

# 将 backend 目录加入系统路径
backend_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'backend')
if backend_path not in sys.path:
    sys.path.insert(0, backend_path)

try:
    from openmtscied.async_database import async_engine, AsyncSessionLocal, get_async_db
    from openmtscied.models.user import User
    from sqlalchemy import select
except ImportError as e:
    print(f"❌ 导入失败: {e}")
    sys.exit(1)


async def test_async_db():
    """测试异步数据库连接和操作"""
    print("=" * 60)
    print("🧪 异步数据库配置测试")
    print("=" * 60)
    
    # 测试 1: 检查引擎配置
    print("\n📋 测试 1: 检查异步引擎配置...")
    print(f"   ✓ 引擎类型: {type(async_engine).__name__}")
    print(f"   ✓ URL 包含 asyncpg: {'asyncpg' in str(async_engine.url)}")
    
    # 测试 2: 测试连接
    print("\n📋 测试 2: 测试数据库连接...")
    try:
        async with async_engine.connect() as conn:
            result = await conn.execute(select(1))
            print(f"   ✓ 连接成功: {result.scalar()}")
    except Exception as e:
        print(f"   ❌ 连接失败: {e}")
        return False
    
    # 测试 3: 测试会话工厂
    print("\n📋 测试 3: 测试会话工厂...")
    try:
        async with AsyncSessionLocal() as session:
            print(f"   ✓ 会话创建成功: {type(session).__name__}")
    except Exception as e:
        print(f"   ❌ 会话创建失败: {e}")
        return False
    
    # 测试 4: 查询用户表
    print("\n📋 测试 4: 查询用户表...")
    try:
        async with AsyncSessionLocal() as session:
            result = await session.execute(select(User))
            users = result.scalars().all()
            print(f"   ✓ 查询成功，共 {len(users)} 个用户")
            if users:
                for user in users[:3]:  # 显示前3个用户
                    print(f"      - {user.username} ({user.email})")
    except Exception as e:
        print(f"   ❌ 查询失败: {e}")
        return False
    
    # 测试 5: 测试依赖注入函数
    print("\n📋 测试 5: 测试 get_async_db 依赖注入...")
    try:
        async_gen = get_async_db()
        session = await async_gen.__anext__()
        print(f"   ✓ 依赖注入成功: {type(session).__name__}")
        await async_gen.aclose()
    except Exception as e:
        print(f"   ❌ 依赖注入失败: {e}")
        return False
    
    print("\n" + "=" * 60)
    print("✅ 所有测试通过！异步数据库配置正常。")
    print("=" * 60)
    return True


if __name__ == "__main__":
    success = asyncio.run(test_async_db())
    sys.exit(0 if success else 1)
