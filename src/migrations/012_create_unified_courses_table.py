"""
统一教程库数据库迁移脚本
创建unified_courses表及相关索引
支持多场景STEM教程管理
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

from config.settings import settings
from models.unified_course import UnifiedCourse, Base

# 导入所有相关模型以确保外键关系正确
from models.license import Organization
from models.user import User
from models.unified_material import UnifiedMaterial


def create_unified_courses_table():
    """创建统一教程库数据表"""

    # 将异步 URL 转换为同步 URL
    db_url = settings.DATABASE_URL
    if db_url.startswith("sqlite+aiosqlite://"):
        db_url = db_url.replace("sqlite+aiosqlite://", "sqlite:///")
    elif db_url.startswith("postgresql+asyncpg://"):
        db_url = db_url.replace("postgresql+asyncpg://", "postgresql://")

    print(f"🔗 连接数据库: {db_url[:50]}...")

    # 创建数据库引擎
    engine = create_engine(db_url)

    try:
        # 创建所有表（包括unified_courses）
        print("📝 正在创建 unified_courses 表...")
        Base.metadata.create_all(bind=engine)
        
        print("✅ 统一教程库数据表创建成功!")
        print("\n📊 表结构信息:")
        print("  - 表名: unified_courses")
        print("  - 主键: id (Integer)")
        print("  - 唯一索引: course_code")
        print("  - 普通索引: org_id, category, level, status, scenario_type, subject")
        print("  - 外键: organizations.id, users.id")
        print("\n📋 主要字段:")
        print("  - 基础信息: course_code, title, description, category, level")
        print("  - 场景类型: scenario_type (校本/培训机构/在线平台/AI生成等)")
        print("  - 学习路径: learning_path_stage, hardware_budget_level")
        print("  - 教师信息: primary_teacher_id, assistant_teacher_ids")
        print("  - 状态管理: status, visibility, is_active")
        print("  - AI增强: ai_generated, ai_model_version, ai_confidence_score")
        print("  - 统计数据: enrollment_count, completion_count, average_rating")
        print("\n✨ 现在可以在Admin后台管理STEM教程了！")
        
        return True
        
    except Exception as e:
        print(f"❌ 创建表失败: {e}")
        import traceback
        traceback.print_exc()
        return False


def verify_table_exists():
    """验证表是否创建成功"""
    
    db_url = settings.DATABASE_URL
    if db_url.startswith("sqlite+aiosqlite://"):
        db_url = db_url.replace("sqlite+aiosqlite://", "sqlite:///")
    elif db_url.startswith("postgresql+asyncpg://"):
        db_url = db_url.replace("postgresql+asyncpg://", "postgresql://")

    engine = create_engine(db_url)
    
    try:
        with engine.connect() as conn:
            # 检查表是否存在
            result = conn.execute(text("""
                SELECT EXISTS (
                    SELECT FROM information_schema.tables 
                    WHERE table_name = 'unified_courses'
                );
            """))
            
            exists = result.scalar()
            
            if exists:
                print("✅ 验证通过: unified_courses 表已存在")
                
                # 获取列信息
                result = conn.execute(text("""
                    SELECT column_name, data_type 
                    FROM information_schema.columns 
                    WHERE table_name = 'unified_courses'
                    ORDER BY ordinal_position;
                """))
                
                columns = result.fetchall()
                print(f"📊 表包含 {len(columns)} 个字段")
                
                return True
            else:
                print("❌ 验证失败: unified_courses 表不存在")
                return False
                
    except Exception as e:
        print(f"❌ 验证失败: {e}")
        return False


if __name__ == "__main__":
    print("="*60)
    print("🚀 OpenMTSciEd - 统一教程库数据表创建")
    print("="*60)
    print()
    
    # 创建表
    success = create_unified_courses_table()
    
    if success:
        print()
        print("="*60)
        print("🔍 验证表结构...")
        print("="*60)
        verify_table_exists()
    
    print()
    print("="*60)
