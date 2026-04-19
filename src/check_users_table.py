"""
检查 Neon 数据库 users 表结构
"""
import asyncio
from sqlalchemy import text
from utils.database import engine

async def check_users_table():
    """检查 users 表结构"""
    try:
        async with engine.connect() as conn:
            # 查询表结构
            result = await conn.execute(text("""
                SELECT column_name, data_type, is_nullable, column_default
                FROM information_schema.columns
                WHERE table_name = 'users'
                ORDER BY ordinal_position;
            """))
            
            print("=" * 80)
            print("Users 表结构:")
            print("=" * 80)
            print(f"{'列名':<25} {'类型':<20} {'可空':<10} {'默认值'}")
            print("-" * 80)
            
            for row in result:
                column_name, data_type, is_nullable, column_default = row
                default_str = str(column_default) if column_default else "NULL"
                print(f"{column_name:<25} {data_type:<20} {is_nullable:<10} {default_str}")
            
            print("=" * 80)
            
            # 检查 organizations 表是否存在
            result = await conn.execute(text("""
                SELECT EXISTS (
                    SELECT FROM information_schema.tables 
                    WHERE table_name = 'organizations'
                );
            """))
            
            org_exists = result.scalar()
            print(f"\nOrganizations 表存在: {org_exists}")
            
            if org_exists:
                # 查询 organizations 表
                result = await conn.execute(text("SELECT id, name FROM organizations LIMIT 5;"))
                print("\nOrganizations 表示例数据:")
                for row in result:
                    print(f"  ID: {row[0]}, Name: {row[1]}")
            
    except Exception as e:
        print(f"错误: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(check_users_table())
