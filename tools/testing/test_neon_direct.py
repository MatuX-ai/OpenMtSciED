"""测试Neon数据库连接"""
import asyncio
import asyncpg

async def test_connection():
    try:
        print("正在连接到 Neon 数据库...")
        conn = await asyncpg.connect(
            dsn="postgresql://neondb_owner:npg_gOwZRiQYy8W3@ep-dark-violet-a13zs25i-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require",
            timeout=10
        )
        print("✅ 连接成功！")
        
        # 测试查询
        version = await conn.fetchval("SELECT version()")
        print(f"数据库版本: {version[:50]}...")
        
        await conn.close()
        print("✅ 测试完成")
        
    except Exception as e:
        print(f"❌ 连接失败: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_connection())
