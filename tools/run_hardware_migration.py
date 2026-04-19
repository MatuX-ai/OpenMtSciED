"""
直接执行数据库迁移脚本
不依赖 Alembic，直接使用 SQLAlchemy 创建表和修改表结构
"""

import sys
import asyncio
from pathlib import Path

# 添加项目根目录和 src 目录到 Python 路径
project_root = Path(__file__).parent.parent
src_dir = project_root / "src"
sys.path.insert(0, str(project_root))
sys.path.insert(0, str(src_dir))

from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
from models.hardware_project import (
    HardwareProjectTemplate,
    HardwareMaterial,
    CodeTemplate,
    HardwareCategory,
    CodeLanguage,
    MCUType,
)
from models.collaboration import StudyProject, PeerReview
from utils.logger import setup_logger
from dotenv import load_dotenv
import os

# 加载 .env 文件
load_dotenv(project_root / ".env")

logger = setup_logger("INFO")


async def create_tables():
    """创建所有表"""
    
    # 从环境变量读取数据库 URL，或使用默认值
    DATABASE_URL = os.getenv(
        "DATABASE_URL",
        "postgresql+asyncpg://user:password@localhost:5432/openmtscied"
    )
    
    logger.info(f"使用数据库: {DATABASE_URL}")
    
    engine = create_async_engine(DATABASE_URL, echo=False)
    
    # 步骤 1: 创建枚举类型
    logger.info("=" * 60)
    logger.info("步骤 1/3: 创建枚举类型")
    logger.info("=" * 60)
    async with engine.begin() as conn:
        try:
            # 创建枚举类型（PostgreSQL）- 使用独立事务
            logger.info("创建枚举类型...")
            
            await conn.execute(text("""
                DO $$ BEGIN
                    CREATE TYPE hardwarecategory AS ENUM (
                        'electronics', 'robotics', 'iot', 'mechanical', 
                        'smart_home', 'sensor', 'communication'
                    );
                EXCEPTION
                    WHEN duplicate_object THEN null;
                END $$;
            """))
            
            await conn.execute(text("""
                DO $$ BEGIN
                    CREATE TYPE codelanguage AS ENUM (
                        'arduino', 'python', 'blockly', 'scratch'
                    );
                EXCEPTION
                    WHEN duplicate_object THEN null;
                END $$;
            """))
            
            await conn.execute(text("""
                DO $$ BEGIN
                    CREATE TYPE mcuetype AS ENUM (
                        'arduino_nano', 'arduino_uno', 'esp32', 
                        'esp8266', 'raspberry_pi_pico'
                    );
                EXCEPTION
                    WHEN duplicate_object THEN null;
                END $$;
            """))
            
            logger.info("✅ 枚举类型创建成功")
            
            # 直接执行 SQL 创建表
            logger.info("创建 hardware_project_templates 表...")
            await conn.execute(text("""
                CREATE TABLE IF NOT EXISTS hardware_project_templates (
                    id SERIAL PRIMARY KEY,
                    project_id VARCHAR(50) UNIQUE NOT NULL,
                    title VARCHAR(200) NOT NULL,
                    category hardwarecategory NOT NULL,
                    difficulty INTEGER NOT NULL,
                    subject VARCHAR(50) NOT NULL,
                    description TEXT NOT NULL,
                    learning_objectives JSON DEFAULT '[]',
                    estimated_time_hours FLOAT NOT NULL,
                    total_cost FLOAT NOT NULL,
                    budget_verified BOOLEAN DEFAULT FALSE,
                    mcu_type mcuetype,
                    wiring_instructions TEXT,
                    circuit_diagram_path VARCHAR(500),
                    safety_notes JSON DEFAULT '[]',
                    common_issues JSON DEFAULT '[]',
                    teaching_guide TEXT,
                    webusb_support BOOLEAN DEFAULT FALSE,
                    supported_boards JSON DEFAULT '[]',
                    knowledge_point_ids JSON DEFAULT '[]',
                    thumbnail_path VARCHAR(500),
                    demo_video_url VARCHAR(500),
                    is_active BOOLEAN DEFAULT TRUE,
                    is_featured BOOLEAN DEFAULT FALSE,
                    usage_count INTEGER DEFAULT 0,
                    average_rating FLOAT DEFAULT 0.0,
                    review_count INTEGER DEFAULT 0,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                    updated_at TIMESTAMP WITH TIME ZONE,
                    created_by INTEGER
                );
            """))
            
            logger.info("创建 hardware_materials 表...")
            await conn.execute(text("""
                CREATE TABLE IF NOT EXISTS hardware_materials (
                    id SERIAL PRIMARY KEY,
                    template_id INTEGER NOT NULL REFERENCES hardware_project_templates(id),
                    name VARCHAR(200) NOT NULL,
                    quantity INTEGER NOT NULL DEFAULT 1,
                    unit VARCHAR(20) DEFAULT '个',
                    unit_price FLOAT NOT NULL,
                    subtotal FLOAT,
                    supplier_link VARCHAR(500),
                    alternative_suggestion TEXT,
                    component_type VARCHAR(50),
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
                );
            """))
            
            logger.info("创建 code_templates 表...")
            await conn.execute(text("""
                CREATE TABLE IF NOT EXISTS code_templates (
                    id SERIAL PRIMARY KEY,
                    hardware_template_id INTEGER REFERENCES hardware_project_templates(id),
                    study_project_id INTEGER,
                    language codelanguage NOT NULL,
                    title VARCHAR(200),
                    code TEXT NOT NULL,
                    description TEXT,
                    dependencies JSON DEFAULT '[]',
                    pin_configurations JSON DEFAULT '[]',
                    version INTEGER DEFAULT 1,
                    is_primary BOOLEAN DEFAULT FALSE,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                    updated_at TIMESTAMP WITH TIME ZONE,
                    created_by INTEGER
                );
            """))
            
            logger.info("✅ 所有表创建成功")
            
            # 创建索引
            logger.info("创建索引...")
            await conn.execute(text("CREATE INDEX IF NOT EXISTS idx_hw_template_category ON hardware_project_templates(category);"))
            await conn.execute(text("CREATE INDEX IF NOT EXISTS idx_hw_template_difficulty ON hardware_project_templates(difficulty);"))
            await conn.execute(text("CREATE INDEX IF NOT EXISTS idx_hw_template_subject ON hardware_project_templates(subject);"))
            await conn.execute(text("CREATE INDEX IF NOT EXISTS idx_hw_template_cost ON hardware_project_templates(total_cost);"))
            await conn.execute(text("CREATE INDEX IF NOT EXISTS idx_hw_material_template ON hardware_materials(template_id);"))
            await conn.execute(text("CREATE INDEX IF NOT EXISTS idx_code_hw_template ON code_templates(hardware_template_id);"))
            await conn.execute(text("CREATE INDEX IF NOT EXISTS idx_code_study_project ON code_templates(study_project_id);"))
            await conn.execute(text("CREATE INDEX IF NOT EXISTS idx_code_language ON code_templates(language);"))
            
            # study_projects 表的索引（如果表存在）
            try:
                await conn.execute(text("CREATE INDEX IF NOT EXISTS idx_study_projects_hw_template ON study_projects(hardware_template_id);"))
            except Exception as e:
                logger.warning(f"study_projects 表索引创建失败（表可能不存在）: {e}")
            
            logger.info("✅ 索引创建成功")
            
            # 为现有表添加新列
            logger.info("为 study_projects 表添加新字段...")
            try:
                await conn.execute(text("""
                    ALTER TABLE study_projects 
                    ADD COLUMN IF NOT EXISTS hardware_template_id INTEGER,
                    ADD COLUMN IF NOT EXISTS mcu_type_used mcuetype,
                    ADD COLUMN IF NOT EXISTS actual_cost FLOAT,
                    ADD COLUMN IF NOT EXISTS completion_photos JSON DEFAULT '[]',
                    ADD COLUMN IF NOT EXISTS demonstration_video_url VARCHAR(500),
                    ADD COLUMN IF NOT EXISTS webusb_flashed BOOLEAN DEFAULT FALSE,
                    ADD COLUMN IF NOT EXISTS flash_timestamp TIMESTAMP WITH TIME ZONE;
                """))
                logger.info("✅ study_projects 表扩展成功")
            except Exception as e:
                logger.warning(f"study_projects 表不存在或扩展失败: {e}")
            
            logger.info("为 peer_reviews 表添加新字段...")
            try:
                await conn.execute(text("""
                    ALTER TABLE peer_reviews 
                    ADD COLUMN IF NOT EXISTS hardware_functionality_score INTEGER,
                    ADD COLUMN IF NOT EXISTS code_quality_score INTEGER,
                    ADD COLUMN IF NOT EXISTS creativity_score INTEGER,
                    ADD COLUMN IF NOT EXISTS documentation_score INTEGER,
                    ADD COLUMN IF NOT EXISTS hardware_feedback TEXT,
                    ADD COLUMN IF NOT EXISTS code_feedback TEXT,
                    ADD COLUMN IF NOT EXISTS improvement_suggestions JSON DEFAULT '[]',
                    ADD COLUMN IF NOT EXISTS review_photos JSON DEFAULT '[]',
                    ADD COLUMN IF NOT EXISTS test_results JSON DEFAULT '{}';
                """))
                logger.info("✅ peer_reviews 表扩展成功")
            except Exception as e:
                logger.warning(f"peer_reviews 表不存在或扩展失败: {e}")
            
            logger.info("✅ 所有迁移完成！")
            
        except Exception as e:
            logger.error(f"❌ 迁移失败: {str(e)}")
            import traceback
            traceback.print_exc()
            raise
        finally:
            await engine.dispose()


if __name__ == "__main__":
    logger.info("=" * 60)
    logger.info("开始执行硬件项目数据模型迁移")
    logger.info("=" * 60)
    
    try:
        asyncio.run(create_tables())
        logger.info("\n" + "=" * 60)
        logger.info("✅ 迁移成功完成！")
        logger.info("=" * 60)
    except Exception as e:
        logger.error("\n" + "=" * 60)
        logger.error(f"❌ 迁移失败: {e}")
        logger.error("=" * 60)
        sys.exit(1)
