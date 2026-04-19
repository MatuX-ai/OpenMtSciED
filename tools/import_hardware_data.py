"""
使用纯 SQL 导入硬件项目数据
避免 SQLAlchemy 模型依赖问题
"""

import json
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


async def import_hardware_projects():
    """导入硬件项目数据"""
    
    # 读取 JSON 文件
    json_file = Path(__file__).parent.parent / "data" / "hardware_projects.json"
    
    if not json_file.exists():
        logger.error(f"JSON 文件不存在: {json_file}")
        return
    
    with open(json_file, 'r', encoding='utf-8') as f:
        projects_data = json.load(f)
    
    logger.info(f"读取到 {len(projects_data)} 个硬件项目")
    
    engine = create_async_engine(DATABASE_URL)
    
    async with engine.begin() as conn:
        try:
            for project_data in projects_data:
                logger.info(f"处理项目: {project_data.get('title')}")
                
                # 映射分类
                category_map = {
                    "传感器": "sensor",
                    "电机控制": "robotics",
                    "物联网": "iot",
                    "智能家居": "smart_home",
                    "化学/农业": "sensor",
                    "生物/工程": "robotics",
                    "物理/电子": "electronics",
                    "工程/机器人": "robotics",
                    "物理/机械": "mechanical",
                    "化学/环保": "sensor",
                    "生物/医疗": "sensor",
                    "工程/能源": "electronics",
                }
                
                category_str = project_data.get("category", "")
                category = category_map.get(category_str, "electronics")
                
                # 映射 MCU 类型
                mcu_map = {
                    "Arduino Nano": "arduino_nano",
                    "Arduino Uno": "arduino_uno",
                    "ESP32": "esp32",
                    "ESP8266": "esp8266",
                }
                
                mcu_str = project_data.get("mcu_type", "Arduino Nano")
                mcu_type = mcu_map.get(mcu_str, "arduino_nano")
                
                # 插入硬件项目模板
                result = await conn.execute(text("""
                    INSERT INTO hardware_project_templates (
                        project_id, title, category, difficulty, subject,
                        description, learning_objectives, estimated_time_hours,
                        total_cost, budget_verified, mcu_type, wiring_instructions,
                        safety_notes, common_issues, teaching_guide,
                        webusb_support, supported_boards, knowledge_point_ids,
                        is_active, is_featured
                    ) VALUES (
                        :project_id, :title, CAST(:category AS hardwarecategory), :difficulty, :subject,
                        :description, CAST(:learning_objectives AS json), :estimated_time_hours,
                        :total_cost, :budget_verified, CAST(:mcu_type AS mcuetype), :wiring_instructions,
                        CAST(:safety_notes AS json), CAST(:common_issues AS json), :teaching_guide,
                        :webusb_support, CAST(:supported_boards AS json), CAST(:knowledge_point_ids AS json),
                        :is_active, :is_featured
                    )
                    RETURNING id
                """), {
                    "project_id": project_data.get("project_id"),
                    "title": project_data.get("title"),
                    "category": category,
                    "difficulty": project_data.get("difficulty", 1),
                    "subject": project_data.get("subject", "工程"),
                    "description": project_data.get("description", ""),
                    "learning_objectives": json.dumps(project_data.get("learning_objectives", [])),
                    "estimated_time_hours": project_data.get("estimated_time_hours", 2.0),
                    "total_cost": project_data.get("total_cost", 0.0),
                    "budget_verified": True,
                    "mcu_type": mcu_type,
                    "wiring_instructions": project_data.get("wiring_instructions", ""),
                    "safety_notes": json.dumps(project_data.get("safety_notes", [])),
                    "common_issues": json.dumps(project_data.get("common_issues", [])),
                    "teaching_guide": project_data.get("teaching_guide", ""),
                    "webusb_support": False,
                    "supported_boards": json.dumps([mcu_str]),
                    "knowledge_point_ids": json.dumps(project_data.get("knowledge_point_ids", [])),
                    "is_active": True,
                    "is_featured": False,
                })
                
                template_id = result.scalar()
                logger.info(f"  ✅ 创建模板 ID: {template_id}")
                
                # 插入材料清单
                components = project_data.get("components", [])
                for comp in components:
                    await conn.execute(text("""
                        INSERT INTO hardware_materials (
                            template_id, name, quantity, unit, unit_price,
                            subtotal, supplier_link, component_type
                        ) VALUES (
                            :template_id, :name, :quantity, :unit, :unit_price,
                            :subtotal, :supplier_link, :component_type
                        )
                    """), {
                        "template_id": template_id,
                        "name": comp.get("name"),
                        "quantity": comp.get("quantity", 1),
                        "unit": "个",
                        "unit_price": comp.get("unit_price", 0.0),
                        "subtotal": comp.get("total_price", 0.0),
                        "supplier_link": comp.get("supplier_link"),
                        "component_type": "component",
                    })
                
                logger.info(f"  ✅ 添加 {len(components)} 个材料项")
            
            logger.info("\n" + "=" * 60)
            logger.info("✅ 硬件项目数据导入完成！")
            logger.info("=" * 60)
            
        except Exception as e:
            logger.error(f"❌ 导入失败: {str(e)}")
            import traceback
            traceback.print_exc()
            raise
        finally:
            await engine.dispose()


if __name__ == "__main__":
    logger.info("=" * 60)
    logger.info("开始导入硬件项目数据")
    logger.info("=" * 60 + "\n")
    
    try:
        asyncio.run(import_hardware_projects())
    except Exception as e:
        logger.error("\n" + "=" * 60)
        logger.error(f"❌ 导入失败: {e}")
        logger.error("=" * 60)
        sys.exit(1)
