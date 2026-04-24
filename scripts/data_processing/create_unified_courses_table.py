"""
快速创建统一教程库表
"""

import sys
from pathlib import Path

# 添加项目根目录到路径
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root / "src"))

from sqlalchemy import create_engine
from models.unified_course import Base

# 使用SQLite进行测试（生产环境应使用PostgreSQL）
db_url = "sqlite:///test_unified_courses.db"

print("="*60)
print("🚀 创建统一教程库数据表")
print("="*60)
print()

try:
    engine = create_engine(db_url)
    print(f"🔗 数据库: {db_url}")
    print()
    
    print("📝 正在创建 unified_courses 表...")
    Base.metadata.create_all(bind=engine)
    
    print("✅ 表创建成功！")
    print()
    print("📊 表结构:")
    print("  - 表名: unified_courses")
    print("  - 字段数: 50+")
    print("  - 索引: course_code (unique), org_id, category, level, status, scenario_type, subject")
    print()
    print("✨ 统一教程库表已就绪！")
    
except Exception as e:
    print(f"❌ 创建失败: {e}")
    import traceback
    traceback.print_exc()
