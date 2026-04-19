"""
硬件项目数据迁移脚本
将 data/hardware_projects.json 中的数据导入到数据库
"""

import json
import sys
from pathlib import Path

# 添加项目根目录和 src 目录到 Python 路径
project_root = Path(__file__).parent.parent
src_dir = project_root / "src"
sys.path.insert(0, str(project_root))
sys.path.insert(0, str(src_dir))

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from models.hardware_project import (
    HardwareProjectTemplate,
    HardwareMaterial,
    CodeTemplate,
    HardwareCategory,
    CodeLanguage,
    MCUType,
)
# 只导入需要的模型，避免循环依赖
# from models.collaboration import StudyProject, PeerReview
from utils.logger import setup_logger

logger = setup_logger("INFO")


async def migrate_hardware_projects():
    """迁移硬件项目数据"""
    
    # 数据库连接配置（需要根据实际环境调整）
    DATABASE_URL = "postgresql+asyncpg://user:password@localhost:5432/openmtscied"
    
    engine = create_async_engine(DATABASE_URL, echo=True)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    # 读取 JSON 文件
    json_file = project_root / "data" / "hardware_projects.json"
    
    if not json_file.exists():
        logger.error(f"JSON 文件不存在: {json_file}")
        return
    
    with open(json_file, 'r', encoding='utf-8') as f:
        projects_data = json.load(f)
    
    logger.info(f"读取到 {len(projects_data)} 个硬件项目")
    
    async with async_session() as session:
        try:
            for project_data in projects_data:
                logger.info(f"处理项目: {project_data.get('title')}")
                
                # 映射分类
                category_map = {
                    "传感器": HardwareCategory.SENSOR,
                    "电机控制": HardwareCategory.ROBOTICS,
                    "物联网": HardwareCategory.IOT,
                    "智能家居": HardwareCategory.SMART_HOME,
                    "化学/农业": HardwareCategory.SENSOR,
                    "生物/工程": HardwareCategory.ROBOTICS,
                    "物理/电子": HardwareCategory.ELECTRONICS,
                    "工程/机器人": HardwareCategory.ROBOTICS,
                    "物理/机械": HardwareCategory.MECHANICAL,
                    "化学/环保": HardwareCategory.SENSOR,
                    "生物/医疗": HardwareCategory.SENSOR,
                    "工程/能源": HardwareCategory.ELECTRONICS,
                }
                
                category_str = project_data.get("category", "")
                category = category_map.get(category_str, HardwareCategory.ELECTRONICS)
                
                # 映射 MCU 类型
                mcu_map = {
                    "Arduino Nano": MCUType.ARDUINO_NANO,
                    "Arduino Uno": MCUType.ARDUINO_UNO,
                    "ESP32": MCUType.ESP32,
                    "ESP8266": MCUType.ESP8266,
                }
                
                mcu_str = project_data.get("mcu_type", "Arduino Nano")
                mcu_type = mcu_map.get(mcu_str, MCUType.ARDUINO_NANO)
                
                # 创建硬件项目模板
                template = HardwareProjectTemplate(
                    project_id=project_data.get("project_id"),
                    title=project_data.get("title"),
                    category=category,
                    difficulty=project_data.get("difficulty", 1),
                    subject=project_data.get("subject", "工程"),
                    description=project_data.get("description", ""),
                    learning_objectives=project_data.get("learning_objectives", []),
                    estimated_time_hours=project_data.get("estimated_time_hours", 2.0),
                    total_cost=project_data.get("total_cost", 0.0),
                    budget_verified=True,
                    mcu_type=mcu_type,
                    wiring_instructions=project_data.get("wiring_instructions", ""),
                    safety_notes=[],
                    common_issues=[],
                    teaching_guide="",
                    webusb_support=False,  # 默认不支持，后续可更新
                    supported_boards=[mcu_str],
                    knowledge_point_ids=project_data.get("knowledge_point_ids", []),
                    is_active=True,
                    is_featured=False,
                )
                
                session.add(template)
                await session.flush()  # 获取 template.id
                
                logger.info(f"  创建模板 ID: {template.id}")
                
                # 添加材料清单
                components = project_data.get("components", [])
                for comp in components:
                    material = HardwareMaterial(
                        template_id=template.id,
                        name=comp.get("name"),
                        quantity=comp.get("quantity", 1),
                        unit="个",
                        unit_price=comp.get("unit_price", 0.0),
                        subtotal=comp.get("total_price", 0.0),
                        supplier_link=comp.get("supplier_link"),
                        component_type="component",
                    )
                    session.add(material)
                
                logger.info(f"  添加 {len(components)} 个材料项")
                
                # 注意：code_examples 在当前 JSON 中没有包含，如果需要可以后续添加
            
            # 提交所有更改
            await session.commit()
            logger.info("✅ 硬件项目数据迁移完成！")
            
        except Exception as e:
            await session.rollback()
            logger.error(f"❌ 迁移失败: {str(e)}")
            import traceback
            traceback.print_exc()
            raise
        finally:
            await engine.dispose()


if __name__ == "__main__":
    import asyncio
    asyncio.run(migrate_hardware_projects())
