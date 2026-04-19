"""
简化版硬件项目数据库迁移脚本
分步执行，避免事务错误
"""

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
from utils.logger import setup_logger

logger = setup_logger("INFO")

DATABASE_URL = os.getenv("DATABASE_URL")


async def step1_create_enums():
    """步骤1: 创建枚举类型"""
    logger.info("=" * 60)
    logger.info("步骤 1/3: 创建枚举类型")
    logger.info("=" * 60)
    
    engine = create_async_engine(DATABASE_URL)
    async with engine.begin() as conn:
        for enum_name, enum_values in [
            ("hardwarecategory", "'electronics', 'robotics', 'iot', 'mechanical', 'smart_home', 'sensor', 'communication'"),
            ("codelanguage", "'arduino', 'python', 'blockly', 'scratch'"),
            ("mcuetype", "'arduino_nano', 'arduino_uno', 'esp32', 'esp8266', 'raspberry_pi_pico'"),
        ]:
            try:
                await conn.execute(text(f"""
                    DO $$ BEGIN
                        CREATE TYPE {enum_name} AS ENUM ({enum_values});
                    EXCEPTION
                        WHEN duplicate_object THEN null;
                    END $$;
                """))
                logger.info(f"✅ 枚举类型 {enum_name} 创建成功")
            except Exception as e:
                logger.warning(f"枚举类型 {enum_name} 可能已存在: {e}")
    
    await engine.dispose()


async def step2_create_tables():
    """步骤2: 创建新表"""
    logger.info("\n" + "=" * 60)
    logger.info("步骤 2/3: 创建硬件项目相关表")
    logger.info("=" * 60)
    
    engine = create_async_engine(DATABASE_URL)
    async with engine.begin() as conn:
        # 创建 hardware_project_templates 表
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
        logger.info("✅ hardware_project_templates 表创建成功")
        
        # 创建 hardware_materials 表
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
        logger.info("✅ hardware_materials 表创建成功")
        
        # 创建 code_templates 表
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
        logger.info("✅ code_templates 表创建成功")
    
    await engine.dispose()


async def step3_create_indexes():
    """步骤3: 创建索引"""
    logger.info("\n" + "=" * 60)
    logger.info("步骤 3/3: 创建索引")
    logger.info("=" * 60)
    
    engine = create_async_engine(DATABASE_URL)
    async with engine.begin() as conn:
        indexes = [
            ("idx_hw_template_category", "hardware_project_templates", "category"),
            ("idx_hw_template_difficulty", "hardware_project_templates", "difficulty"),
            ("idx_hw_template_subject", "hardware_project_templates", "subject"),
            ("idx_hw_template_cost", "hardware_project_templates", "total_cost"),
            ("idx_hw_material_template", "hardware_materials", "template_id"),
            ("idx_code_hw_template", "code_templates", "hardware_template_id"),
            ("idx_code_study_project", "code_templates", "study_project_id"),
            ("idx_code_language", "code_templates", "language"),
        ]
        
        for idx_name, table, column in indexes:
            try:
                await conn.execute(text(f"CREATE INDEX IF NOT EXISTS {idx_name} ON {table}({column});"))
                logger.info(f"✅ 索引 {idx_name} 创建成功")
            except Exception as e:
                logger.error(f"❌ 索引 {idx_name} 创建失败: {e}")
    
    await engine.dispose()


async def main():
    logger.info("\n" + "=" * 60)
    logger.info("开始执行硬件项目数据模型迁移")
    logger.info("=" * 60 + "\n")
    
    try:
        await step1_create_enums()
        await step2_create_tables()
        await step3_create_indexes()
        
        logger.info("\n" + "=" * 60)
        logger.info("✅ 迁移成功完成！")
        logger.info("=" * 60)
        logger.info("\n下一步:")
        logger.info("1. 运行 verify_migration.py 验证表是否创建成功")
        logger.info("2. 运行 migrate_hardware_projects.py 导入示例数据")
        
    except Exception as e:
        logger.error("\n" + "=" * 60)
        logger.error(f"❌ 迁移失败: {e}")
        logger.error("=" * 60)
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    asyncio.run(main())
