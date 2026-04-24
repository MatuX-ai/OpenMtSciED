"""临时脚本：检查数据库中课程level分布"""
import os
from dotenv import load_dotenv

# 加载环境变量 (从项目根目录)
env_path = os.path.join(os.path.dirname(__file__), '..', '.env.local')
load_dotenv(env_path)
print(f"✅ Loaded .env.local from {env_path}")

from openmtscied.models.db_models import SessionLocal, Course
from sqlalchemy import func

db = SessionLocal()

try:
    # 查询所有不同的level及其数量
    levels = db.query(Course.level, func.count(Course.id)).group_by(Course.level).all()
    
    print("\n📊 数据库中课程level分布：")
    print("=" * 40)
    for level, count in levels:
        print(f"{level or 'NULL':15}: {count}")
    
    print(f"\n总计: {db.query(Course).count()}")
    
    # 查看几个示例课程
    print("\n📝 示例课程（前5个）：")
    print("=" * 40)
    sample_courses = db.query(Course).limit(5).all()
    for course in sample_courses:
        print(f"ID: {course.id}, Title: {course.title[:50] if course.title else 'N/A'}, Level: {course.level}")
        
finally:
    db.close()
