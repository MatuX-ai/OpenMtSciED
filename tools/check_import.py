"""快速验证数据导入结果"""
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
        # 检查项目数量
        result = await conn.execute(text("SELECT COUNT(*) FROM hardware_project_templates"))
        project_count = result.scalar()
        
        # 检查材料数量
        result = await conn.execute(text("SELECT COUNT(*) FROM hardware_materials"))
        material_count = result.scalar()
        
        print("=" * 60)
        print("✅ 数据导入验证结果:")
        print("=" * 60)
        print(f"  硬件项目模板: {project_count} 个")
        print(f"  材料清单项:   {material_count} 个")
        print("=" * 60)
        
        if project_count == 14:
            print("✅ 所有14个硬件项目已成功导入！")
        else:
            print(f"⚠️  预期14个项目，实际导入 {project_count} 个")
        
    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(verify())
