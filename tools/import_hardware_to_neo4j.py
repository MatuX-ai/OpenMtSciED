"""
导入硬件项目数据到Neo4j知识图谱
使用HTTP API绕过Bolt协议问题
"""

import json
import os
import logging
from pathlib import Path
from datetime import datetime
import requests
from dotenv import load_dotenv

# 加载环境变量
env_path = Path(__file__).parent.parent / ".env"
load_dotenv(env_path)

# 配置日志
import sys
stream_handler = logging.StreamHandler(sys.stdout)
stream_handler.encoding = 'utf-8'

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        stream_handler
    ]
)
logger = logging.getLogger(__name__)


class HardwareProjectImporter:
    """硬件项目Neo4j导入器"""
    
    def __init__(self):
        # 从环境变量读取配置
        self.base_url = os.getenv("NEO4J_QUERY_API_URL", "https://4abd5ef9.databases.neo4j.io/db/4abd5ef9/query/v2")
        self.username = os.getenv("NEO4J_USER", "4abd5ef9")
        self.password = os.getenv("NEO4J_PASSWORD")
        
        if not self.password:
            raise ValueError("NEO4J_PASSWORD环境变量未设置")
        
        # 创建Basic Auth header
        import base64
        auth_string = f"{self.username}:{self.password}"
        auth_bytes = auth_string.encode('ascii')
        auth_base64 = base64.b64encode(auth_bytes).decode('ascii')
        
        self.headers = {
            "Content-Type": "application/json",
            "Authorization": f"Basic {auth_base64}"
        }
        
        logger.info(f"初始化硬件项目导入器")
        logger.info(f"Neo4j API: {self.base_url}")
        
        # 测试连接
        if not self.test_connection():
            raise Exception("Neo4j连接失败，请检查配置")
    
    def test_connection(self) -> bool:
        """测试连接"""
        try:
            data = {"statement": "RETURN 1 AS test"}
            response = requests.post(self.base_url, headers=self.headers, json=data, timeout=10)
            
            if response.status_code in [200, 202]:
                logger.info("✅ Neo4j连接成功")
                return True
            else:
                logger.error(f"连接失败: HTTP {response.status_code}")
                return False
        except Exception as e:
            logger.error(f"连接异常: {e}")
            return False
    
    def execute_query(self, statement: str, parameters: dict = None) -> dict:
        """执行Cypher查询"""
        try:
            data = {
                "statement": statement,
                "parameters": parameters or {}
            }
            
            response = requests.post(
                self.base_url,
                headers=self.headers,
                json=data,
                timeout=30
            )
            
            if response.status_code in [200, 202]:
                return response.json()
            else:
                logger.error(f"查询失败: HTTP {response.status_code}")
                logger.error(f"响应: {response.text[:200]}")
                return None
        except Exception as e:
            logger.error(f"查询异常: {e}")
            return None
    
    def create_constraint(self):
        """创建HardwareProject唯一性约束"""
        logger.info("创建HardwareProject约束...")
        
        query = "CREATE CONSTRAINT hardware_project_id IF NOT EXISTS FOR (hp:HardwareProject) REQUIRE hp.id IS UNIQUE"
        result = self.execute_query(query)
        
        if result:
            logger.info("✅ 约束创建成功")
        else:
            logger.warning("⚠️ 约束可能已存在")
    
    def import_projects(self, projects_file: Path):
        """导入硬件项目"""
        logger.info(f"从 {projects_file} 加载硬件项目...")
        
        with open(projects_file, 'r', encoding='utf-8') as f:
            projects = json.load(f)
        
        logger.info(f"加载了 {len(projects)} 个硬件项目")
        
        # 预处理：将复杂对象转为JSON字符串
        for project in projects:
            # components是对象数组，需要转为JSON字符串
            if 'components' in project:
                project['components_json'] = json.dumps(project['components'], ensure_ascii=False)
            # knowledge_point_ids已经是简单数组，可以直接存储
        
        # 批量导入
        batch_size = 5
        success_count = 0
        
        for i in range(0, len(projects), batch_size):
            batch = projects[i:i+batch_size]
            
            query = """
            UNWIND $projects AS project
            MERGE (hp:HardwareProject {id: project.project_id})
            SET hp.title = project.title,
                hp.category = project.category,
                hp.difficulty = project.difficulty,
                hp.subject = project.subject,
                hp.description = project.description,
                hp.estimated_time_hours = project.estimated_time_hours,
                hp.total_cost = project.total_cost,
                hp.mcu_type = project.mcu_type,
                hp.wiring_instructions = project.wiring_instructions,
                hp.knowledge_point_ids = project.knowledge_point_ids,
                hp.components_json = project.components_json,
                hp.updated_at = datetime()
            """
            
            result = self.execute_query(query, {"projects": batch})
            
            if result:
                success_count += len(batch)
                logger.info(f"已导入 {min(i+batch_size, len(projects))}/{len(projects)} 个项目")
            else:
                logger.error(f"批次 {i}-{i+batch_size} 导入失败")
        
        logger.info(f"✅ 成功导入 {success_count}/{len(projects)} 个硬件项目")
        return success_count
    
    def create_knowledge_point_relationships(self):
        """建立HardwareProject与KnowledgePoint的关联"""
        logger.info("建立HardwareProject → KnowledgePoint关联...")
        
        query = """
        MATCH (hp:HardwareProject)
        WITH hp, hp.knowledge_point_ids AS kp_ids
        UNWIND kp_ids AS kp_id
        MATCH (kp:KnowledgePoint {id: kp_id})
        MERGE (hp)-[:APPLIES {applied_at: datetime()}]->(kp)
        RETURN count(*) AS relationship_count
        """
        
        result = self.execute_query(query)
        
        if result:
            # 解析结果
            try:
                count = result["data"]["values"][0][0]
                logger.info(f"✅ 建立了 {count} 条APPLIES关系")
            except (KeyError, IndexError):
                logger.info("✅ 关系建立完成")
        else:
            logger.warning("⚠️ 关系建立可能失败")
    
    def create_subject_relationships(self):
        """建立HardwareProject与CourseUnit的学科关联"""
        logger.info("建立HardwareProject → CourseUnit学科关联...")
        
        query = """
        MATCH (hp:HardwareProject), (cu:CourseUnit)
        WHERE hp.subject = cu.subject
        MERGE (hp)-[:RELATED_TO_SUBJECT {
            relationship_type: 'subject_match',
            created_at: datetime()
        }]->(cu)
        RETURN count(*) AS relationship_count
        """
        
        result = self.execute_query(query)
        
        if result:
            try:
                count = result["data"]["values"][0][0]
                logger.info(f"✅ 建立了 {count} 条RELATED_TO_SUBJECT关系")
            except (KeyError, IndexError):
                logger.info("✅ 关系建立完成")
        else:
            logger.warning("⚠️ 关系建立可能失败")
    
    def verify_import(self):
        """验证导入结果"""
        logger.info("验证导入结果...")
        
        queries = {
            "HardwareProject节点数": "MATCH (hp:HardwareProject) RETURN count(hp) AS count",
            "APPLIES关系数": "MATCH ()-[:APPLIES]->() RETURN count(*) AS count",
            "RELATED_TO_SUBJECT关系数": "MATCH ()-[:RELATED_TO_SUBJECT]->() RETURN count(*) AS count",
        }
        
        for name, query in queries.items():
            result = self.execute_query(query)
            if result:
                try:
                    count = result["data"]["values"][0][0]
                    logger.info(f"  {name}: {count}")
                except (KeyError, IndexError):
                    logger.info(f"  {name}: 查询完成")
    
    def import_all(self):
        """执行完整导入流程"""
        try:
            # 1. 创建约束
            self.create_constraint()
            
            # 2. 导入硬件项目
            projects_file = Path("data/hardware_projects.json")
            if not projects_file.exists():
                logger.error(f"硬件项目文件不存在: {projects_file}")
                return
            
            success_count = self.import_projects(projects_file)
            
            if success_count == 0:
                logger.error("没有成功导入任何项目，停止后续操作")
                return
            
            # 3. 建立KnowledgePoint关联
            self.create_knowledge_point_relationships()
            
            # 4. 建立学科关联
            self.create_subject_relationships()
            
            # 5. 验证
            self.verify_import()
            
            logger.info("=" * 60)
            logger.info("✅ 硬件项目数据导入完成！")
            logger.info("=" * 60)
            
        except Exception as e:
            logger.error(f"❌ 导入失败: {e}", exc_info=True)
            raise


def main():
    """主函数"""
    logger.info("=" * 60)
    logger.info("OpenMTSciEd - 硬件项目Neo4j导入开始")
    logger.info("=" * 60)
    
    importer = HardwareProjectImporter()
    importer.import_all()


if __name__ == "__main__":
    main()
