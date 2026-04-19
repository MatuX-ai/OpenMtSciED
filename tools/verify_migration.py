"""验证硬件项目表是否创建成功"""
import asyncio
import sys
import os
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))
sys.path.insert(0, str(Path(__file__).parent.parent / "src"))

from dotenv import load_dotenv
load_dotenv(Path(__file__).parent.parent / ".env")

from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text

async def verify():
    engine = create_async_engine(os.getenv("DATABASE_URL"))
    
    async with engine.connect() as conn:
        # 检查新创建的表
        result = await conn.execute(text("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema='public' 
            AND (table_name LIKE 'hardware%' OR table_name='code_templates')
            ORDER BY table_name
        """))
        
        print("=" * 60)
        print("✅ 已创建的硬件项目相关表:")
        print("=" * 60)
        tables = [row[0] for row in result]
        for table in tables:
            print(f"  - {table}")
        
        if not tables:
            print("  ⚠️  未找到任何表！")
        
        # 检查枚举类型
        result = await conn.execute(text("""
            SELECT typname 
            FROM pg_type 
            WHERE typcategory = 'E' 
            AND typname IN ('hardwarecategory', 'codelanguage', 'mcuetype')
            ORDER BY typname
        """))
        
        print("\n" + "=" * 60)
        print("✅ 已创建的枚举类型:")
        print("=" * 60)
        enums = [row[0] for row in result]
        for enum in enums:
            print(f"  - {enum}")
        
        if not enums:
            print("  ⚠️  未找到任何枚举类型！")
        
        print("\n" + "=" * 60)
        print("迁移验证完成！")
        print("=" * 60)
        
    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(verify())
