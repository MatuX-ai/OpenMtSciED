"""
ArcadeDB 适配器 - 用于替代 Neo4j 的图数据库适配层
支持通过 HTTP API 和 Cypher 查询语言进行交互
"""

import requests
import json
import logging
from typing import Any, Dict, List, Optional
from datetime import datetime

logger = logging.getLogger(__name__)


class ArcadeDBClient:
    """ArcadeDB HTTP API 客户端"""
    
    def __init__(
        self, 
        host: str = "localhost", 
        port: int = 2480, 
        database: str = "OpenMTSciEd",
        username: str = "root", 
        password: str = "playwithdata",
        use_https: bool = False
    ):
        """
        初始化 ArcadeDB 客户端
        
        Args:
            host: ArcadeDB 服务器主机地址
            port: ArcadeDB 服务器端口 (默认 2480)
            database: 数据库名称
            username: 用户名
            password: 密码
            use_https: 是否使用 HTTPS
        """
        protocol = "https" if use_https else "http"
        self.base_url = f"{protocol}://{host}:{port}/api/v1"
        self.database = database
        self.auth = (username, password)
        self.session = requests.Session()
        self.session.auth = self.auth
        self.session.headers.update({
            "Content-Type": "application/json"
        })
        
        logger.info(f"ArcadeDB 客户端初始化: {self.base_url}")
    
    def test_connection(self) -> bool:
        """测试连接是否正常"""
        try:
            # 获取服务器信息
            response = self.session.get(f"{self.base_url}/server")
            response.raise_for_status()
            
            server_info = response.json()
            logger.info(f"✅ ArcadeDB 连接成功! 版本: {server_info.get('version', 'unknown')}")
            return True
            
        except Exception as e:
            logger.error(f"❌ ArcadeDB 连接失败: {e}")
            return False
    
    def execute_cypher(self, query: str, params: Optional[Dict] = None) -> Dict[str, Any]:
        """
        执行 Cypher 查询
        
        Args:
            query: Cypher 查询语句
            params: 查询参数
            
        Returns:
            查询结果字典
        """
        try:
            payload = {
                "language": "cypher",
                "command": query,
                "params": params or {}
            }
            
            response = self.session.post(
                f"{self.base_url}/command/{self.database}",
                json=payload
            )
            response.raise_for_status()
            
            result = response.json()
            logger.debug(f"Cypher 查询执行成功: {query[:50]}...")
            return result
            
        except Exception as e:
            logger.error(f"Cypher 查询执行失败: {e}\nQuery: {query}")
            raise
    
    def execute_sql(self, query: str, params: Optional[Dict] = None) -> Dict[str, Any]:
        """
        执行 SQL 查询
        
        Args:
            query: SQL 查询语句
            params: 查询参数
            
        Returns:
            查询结果字典
        """
        try:
            payload = {
                "language": "sql",
                "command": query,
                "params": params or {}
            }
            
            response = self.session.post(
                f"{self.base_url}/command/{self.database}",
                json=payload
            )
            response.raise_for_status()
            
            result = response.json()
            logger.debug(f"SQL 查询执行成功: {query[:50]}...")
            return result
            
        except Exception as e:
            logger.error(f"SQL 查询执行失败: {e}\nQuery: {query}")
            raise
    
    def create_database(self, database_name: str) -> bool:
        """创建新数据库"""
        try:
            payload = {
                "command": f"CREATE DATABASE {database_name}"
            }
            
            response = self.session.post(
                f"{self.base_url}/server",
                json=payload
            )
            response.raise_for_status()
            
            logger.info(f"✅ 数据库 '{database_name}' 创建成功")
            return True
            
        except Exception as e:
            logger.error(f"❌ 数据库创建失败: {e}")
            return False
    
    def close(self):
        """关闭会话"""
        self.session.close()
        logger.info("ArcadeDB 会话已关闭")


class ArcadeDBAdapter:
    """
    ArcadeDB 适配器 - 提供与 KnowledgeGraphManager 兼容的接口
    
    这个适配器旨在提供与现有 Neo4j-based KnowledgeGraphManager 相同的接口，
    以便可以无缝切换后端数据库。
    """
    
    def __init__(
        self,
        host: str = "localhost",
        port: int = 2480,
        database: str = "OpenMTSciEd",
        username: str = "root",
        password: str = "playwithdata"
    ):
        """
        初始化 ArcadeDB 适配器
        
        Args:
            host: ArcadeDB 服务器主机地址
            port: ArcadeDB 服务器端口
            database: 数据库名称
            username: 用户名
            password: 密码
        """
        self.client = ArcadeDBClient(
            host=host,
            port=port,
            database=database,
            username=username,
            password=password
        )
        self.database = database
        self._mock_mode = False
        
        # 测试连接
        if not self.client.test_connection():
            logger.warning("ArcadeDB 连接失败，将使用模拟模式")
            self._mock_mode = True
        
        # 初始化 schema
        if not self._mock_mode:
            self._initialize_schema()
            logger.info("ArcadeDB 适配器初始化成功")
    
    def _initialize_schema(self):
        """初始化数据库模式和索引"""
        try:
            # 创建类型（类似于 Neo4j 的标签）
            types_to_create = [
                ("KnowledgeNode", [
                    ("node_id", "STRING"),
                    ("title", "STRING"),
                    ("description", "STRING"),
                    ("category", "STRING"),
                    ("difficulty_level", "STRING"),
                    ("estimated_hours", "DOUBLE"),
                    ("prerequisites", "STRING[]"),
                    ("learning_outcomes", "STRING[]"),
                    ("tags", "STRING[]"),
                    ("created_at", "DATETIME"),
                    ("updated_at", "DATETIME")
                ]),
                ("UserNode", [
                    ("user_id", "STRING"),
                    ("username", "STRING"),
                    ("email", "STRING")
                ]),
                ("SkillNode", [
                    ("skill_name", "STRING"),
                    ("proficiency", "DOUBLE")
                ])
            ]
            
            for type_name, properties in types_to_create:
                try:
                    # 检查类型是否已存在
                    check_query = f"SELECT FROM schema:types WHERE name = '{type_name}'"
                    result = self.client.execute_sql(check_query)
                    
                    if not result.get("result"):
                        # 创建类型
                        props_def = ", ".join([f"{name} {dtype}" for name, dtype in properties])
                        create_query = f"CREATE DOCUMENT TYPE {type_name} IF NOT EXISTS PROPERTIES ({props_def})"
                        self.client.execute_sql(create_query)
                        logger.info(f"✅ 创建类型: {type_name}")
                    
                    # 为 node_id/skill_name/user_id 创建唯一索引
                    id_field = next((name for name, _ in properties if name in ["node_id", "skill_name", "user_id"]), None)
                    if id_field:
                        index_query = f"CREATE INDEX ON {type_name} ({id_field}) UNIQUE"
                        try:
                            self.client.execute_sql(index_query)
                            logger.info(f"✅ 创建唯一索引: {type_name}.{id_field}")
                        except Exception as e:
                            logger.debug(f"索引可能已存在: {e}")
                
                except Exception as e:
                    logger.warning(f"创建类型 {type_name} 时出错: {e}")
            
            # 创建边类型（关系）
            edge_types = [
                "PREREQUISITE",
                "SIMILAR", 
                "DEPENDS_ON",
                "EXTENDS",
                "PROGRESSES_TO"
            ]
            
            for edge_type in edge_types:
                try:
                    create_edge_query = f"CREATE EDGE TYPE {edge_type} IF NOT EXISTS"
                    self.client.execute_sql(create_edge_query)
                    logger.debug(f"✅ 创建边类型: {edge_type}")
                except Exception as e:
                    logger.debug(f"边类型 {edge_type} 可能已存在: {e}")
        
        except Exception as e:
            logger.error(f"Schema 初始化失败: {e}")
    
    def close(self):
        """关闭数据库连接"""
        self.client.close()
        logger.info("ArcadeDB 连接已关闭")
    
    def create_knowledge_node(self, node_data: Dict[str, Any]) -> bool:
        """
        创建知识点节点
        
        Args:
            node_data: 节点数据字典，包含 node_id, title, description 等字段
            
        Returns:
            bool: 创建是否成功
        """
        if self._mock_mode:
            logger.info(f"[模拟模式] 创建知识点节点: {node_data.get('node_id')}")
            return True
        
        try:
            # 使用 UPSERT 模式：如果存在则更新，不存在则创建
            node_id = node_data["node_id"]
            
            # 构建属性列表
            properties = []
            for key, value in node_data.items():
                if isinstance(value, list):
                    # 数组类型需要特殊处理
                    properties.append(f"{key} = {json.dumps(value)}")
                elif isinstance(value, str):
                    properties.append(f"{key} = '{value.replace("'", "''")}'")
                elif isinstance(value, (int, float)):
                    properties.append(f"{key} = {value}")
                elif isinstance(value, datetime):
                    properties.append(f"{key} = DATETIME('{value.isoformat()}')")
                else:
                    properties.append(f"{key} = NULL")
            
            props_str = ", ".join(properties)
            
            # 使用 Cypher MERGE 实现 upsert
            cypher_query = f"""
            MERGE (n:KnowledgeNode {{node_id: '{node_id}'}})
            SET n.title = '{node_data.get('title', '').replace("'", "''")}',
                n.description = '{node_data.get('description', '').replace("'", "''")}',
                n.category = '{node_data.get('category', '').replace("'", "''")}',
                n.difficulty_level = '{node_data.get('difficulty_level', '').replace("'", "''")}',
                n.estimated_hours = {node_data.get('estimated_hours', 0)},
                n.prerequisites = {json.dumps(node_data.get('prerequisites', []))},
                n.learning_outcomes = {json.dumps(node_data.get('learning_outcomes', []))},
                n.tags = {json.dumps(node_data.get('tags', []))},
                n.updated_at = DATETIME()
            RETURN n
            """
            
            result = self.client.execute_cypher(cypher_query)
            logger.info(f"✅ 知识点节点创建/更新成功: {node_id}")
            return True
            
        except Exception as e:
            logger.error(f"❌ 创建知识点节点失败 {node_data.get('node_id')}: {e}")
            return False
    
    def create_relationship(self, from_node_id: str, to_node_id: str, 
                          relationship_type: str = "PREREQUISITE",
                          weight: float = 1.0, description: str = "") -> bool:
        """
        创建节点间的关系
        
        Args:
            from_node_id: 起始节点 ID
            to_node_id: 目标节点 ID
            relationship_type: 关系类型
            weight: 关系权重
            description: 关系描述
            
        Returns:
            bool: 创建是否成功
        """
        if self._mock_mode:
            logger.info(f"[模拟模式] 创建关系: {from_node_id} -[{relationship_type}]-> {to_node_id}")
            return True
        
        try:
            cypher_query = f"""
            MATCH (from:KnowledgeNode {{node_id: '{from_node_id}'}})
            MATCH (to:KnowledgeNode {{node_id: '{to_node_id}'}})
            MERGE (from)-[r:{relationship_type}]->(to)
            SET r.weight = {weight},
                r.description = '{description.replace("'", "''")}',
                r.created_at = DATETIME()
            RETURN r
            """
            
            result = self.client.execute_cypher(cypher_query)
            logger.info(f"✅ 关系创建成功: {from_node_id} -> {to_node_id}")
            return True
            
        except Exception as e:
            logger.error(f"❌ 创建关系失败 {from_node_id}->{to_node_id}: {e}")
            return False
    
    def batch_create_nodes(self, nodes: List[Dict[str, Any]]) -> Dict[str, int]:
        """
        批量创建知识点节点
        
        Args:
            nodes: 节点数据列表
            
        Returns:
            Dict: 成功/失败统计
        """
        results = {"success": 0, "failed": 0}
        
        for node in nodes:
            if self.create_knowledge_node(node):
                results["success"] += 1
            else:
                results["failed"] += 1
        
        logger.info(f"批量创建完成: 成功{results['success']}, 失败{results['failed']}")
        return results
    
    def batch_create_relationships(self, relationships: List[Dict]) -> Dict[str, int]:
        """
        批量创建关系
        
        Args:
            relationships: 关系列表，每个元素包含 from_node_id, to_node_id, relationship_type 等
            
        Returns:
            Dict: 成功/失败统计
        """
        results = {"success": 0, "failed": 0}
        
        for rel in relationships:
            if self.create_relationship(
                from_node_id=rel["from_node_id"],
                to_node_id=rel["to_node_id"],
                relationship_type=rel.get("relationship_type", "PREREQUISITE"),
                weight=rel.get("weight", 1.0),
                description=rel.get("description", "")
            ):
                results["success"] += 1
            else:
                results["failed"] += 1
        
        logger.info(f"批量关系创建完成: 成功{results['success']}, 失败{results['failed']}")
        return results
    
    def find_shortest_path(self, start_node_id: str, end_node_id: str, 
                          max_depth: int = 10) -> Optional[List[str]]:
        """
        查找两个节点间的最短路径
        
        Args:
            start_node_id: 起始节点 ID
            end_node_id: 目标节点 ID
            max_depth: 最大搜索深度
            
        Returns:
            List[str]: 路径节点 ID 列表，如果找不到则返回 None
        """
        if self._mock_mode:
            logger.info(f"[模拟模式] 查找路径: {start_node_id} -> {end_node_id}")
            return [start_node_id, end_node_id]
        
        try:
            cypher_query = f"""
            MATCH path = shortestPath(
                (start:KnowledgeNode {{node_id: '{start_node_id}'}})-[:PREREQUISITE*1..{max_depth}]->(end:KnowledgeNode {{node_id: '{end_node_id}'}})
            )
            RETURN [node IN nodes(path) | node.node_id] AS path_nodes
            """
            
            result = self.client.execute_cypher(cypher_query)
            
            if result.get("result") and len(result["result"]) > 0:
                path = result["result"][0].get("path_nodes", [])
                logger.info(f"找到最短路径: {len(path)} 个节点")
                return path
            else:
                logger.warning(f"未找到从 {start_node_id} 到 {end_node_id} 的路径")
                return None
                
        except Exception as e:
            logger.error(f"路径查找失败: {e}")
            return None
    
    def get_node_recommendations(self, node_id: str, limit: int = 5) -> List[Dict[str, Any]]:
        """
        获取指定节点的推荐后续学习内容
        
        Args:
            node_id: 节点 ID
            limit: 返回数量限制
            
        Returns:
            List[Dict]: 推荐节点列表
        """
        if self._mock_mode:
            logger.info(f"[模拟模式] 获取节点推荐: {node_id}")
            return []
        
        try:
            cypher_query = f"""
            MATCH (current:KnowledgeNode {{node_id: '{node_id}'}})-[:PREREQUISITE]->(next:KnowledgeNode)
            RETURN next.node_id AS node_id, 
                   next.title AS title, 
                   next.difficulty_level AS difficulty_level, 
                   next.estimated_hours AS estimated_hours
            ORDER BY next.difficulty_level, next.estimated_hours
            LIMIT {limit}
            """
            
            result = self.client.execute_cypher(cypher_query)
            recommendations = []
            
            if result.get("result"):
                for record in result["result"]:
                    recommendations.append({
                        "node_id": record.get("node_id"),
                        "title": record.get("title"),
                        "difficulty_level": record.get("difficulty_level"),
                        "estimated_hours": record.get("estimated_hours")
                    })
            
            return recommendations
            
        except Exception as e:
            logger.error(f"获取节点推荐失败: {e}")
            return []
    
    def get_statistics(self) -> Dict[str, Any]:
        """
        获取数据库统计信息
        
        Returns:
            Dict: 包含节点数、关系数等统计信息
        """
        if self._mock_mode:
            return {
                "nodes": {"KnowledgeNode": 0},
                "relationships": {},
                "total_nodes": 0,
                "total_relationships": 0
            }
        
        try:
            stats = {}
            
            # 获取各类型节点数量
            node_query = """
            SELECT type, count(*) as count 
            FROM (
                MATCH (n) 
                RETURN labels(n)[0] as type
            )
            GROUP BY type
            """
            
            try:
                node_result = self.client.execute_sql(node_query)
                stats["nodes"] = {}
                total_nodes = 0
                
                if node_result.get("result"):
                    for record in node_result["result"]:
                        node_type = record.get("type", "Unknown")
                        count = record.get("count", 0)
                        stats["nodes"][node_type] = count
                        total_nodes += count
                
                stats["total_nodes"] = total_nodes
            except Exception as e:
                logger.warning(f"获取节点统计失败: {e}")
                stats["nodes"] = {}
                stats["total_nodes"] = 0
            
            # 获取关系统计
            rel_query = """
            SELECT type, count(*) as count
            FROM (
                MATCH ()-[r]->()
                RETURN type(r) as type
            )
            GROUP BY type
            """
            
            try:
                rel_result = self.client.execute_sql(rel_query)
                stats["relationships"] = {}
                total_rels = 0
                
                if rel_result.get("result"):
                    for record in rel_result["result"]:
                        rel_type = record.get("type", "Unknown")
                        count = record.get("count", 0)
                        stats["relationships"][rel_type] = count
                        total_rels += count
                
                stats["total_relationships"] = total_rels
            except Exception as e:
                logger.warning(f"获取关系统计失败: {e}")
                stats["relationships"] = {}
                stats["total_relationships"] = 0
            
            return stats
            
        except Exception as e:
            logger.error(f"获取统计信息失败: {e}")
            return {}


def create_sample_data(adapter: ArcadeDBAdapter) -> bool:
    """创建示例数据用于测试"""
    try:
        # 创建示例知识点
        nodes = [
            {
                "node_id": "python_basics",
                "title": "Python基础语法",
                "description": "Python编程语言基础概念和语法",
                "category": "programming",
                "difficulty_level": "beginner",
                "estimated_hours": 10.0,
                "prerequisites": [],
                "learning_outcomes": ["掌握变量和数据类型", "理解基本语法结构"],
                "tags": ["python", "programming", "basics"]
            },
            {
                "node_id": "python_oop",
                "title": "Python面向对象编程",
                "description": "Python中的类和对象概念",
                "category": "programming",
                "difficulty_level": "intermediate",
                "estimated_hours": 15.0,
                "prerequisites": ["python_basics"],
                "learning_outcomes": ["理解类和对象", "掌握继承和多态"],
                "tags": ["python", "oop", "programming"]
            },
            {
                "node_id": "python_advanced",
                "title": "Python高级特性",
                "description": "Python高级特性和最佳实践",
                "category": "programming",
                "difficulty_level": "advanced",
                "estimated_hours": 20.0,
                "prerequisites": ["python_oop"],
                "learning_outcomes": ["掌握装饰器和生成器", "理解并发编程"],
                "tags": ["python", "advanced", "programming"]
            },
            {
                "node_id": "python_expert",
                "title": "Python专家级应用",
                "description": "Python在实际项目中的专家级应用",
                "category": "programming",
                "difficulty_level": "expert",
                "estimated_hours": 25.0,
                "prerequisites": ["python_advanced"],
                "learning_outcomes": ["构建大型应用", "性能优化"],
                "tags": ["python", "expert", "applications"]
            }
        ]
        
        # 批量创建节点
        print("\n📝 创建示例知识点节点...")
        node_results = adapter.batch_create_nodes(nodes)
        print(f"   成功: {node_results['success']}, 失败: {node_results['failed']}")
        
        # 创建关系
        relationships = [
            {
                "from_node_id": "python_basics",
                "to_node_id": "python_oop",
                "relationship_type": "PREREQUISITE",
                "weight": 1.0,
                "description": "学习OOP前需要掌握基础语法"
            },
            {
                "from_node_id": "python_oop",
                "to_node_id": "python_advanced",
                "relationship_type": "PREREQUISITE",
                "weight": 1.0,
                "description": "学习高级特性前需要掌握OOP"
            },
            {
                "from_node_id": "python_advanced",
                "to_node_id": "python_expert",
                "relationship_type": "PREREQUISITE",
                "weight": 1.0,
                "description": "成为专家前需要掌握高级特性"
            }
        ]
        
        print("\n🔗 创建示例关系...")
        rel_results = adapter.batch_create_relationships(relationships)
        print(f"   成功: {rel_results['success']}, 失败: {rel_results['failed']}")
        
        # 获取统计信息
        print("\n📊 数据库统计:")
        stats = adapter.get_statistics()
        print(f"   总节点数: {stats.get('total_nodes', 0)}")
        print(f"   总关系数: {stats.get('total_relationships', 0)}")
        print(f"   节点类型: {stats.get('nodes', {})}")
        print(f"   关系类型: {stats.get('relationships', {})}")
        
        # 测试路径查询
        print("\n🛤️  测试路径查询 (python_basics -> python_expert)...")
        path = adapter.find_shortest_path("python_basics", "python_expert")
        if path:
            print(f"   找到路径: {' -> '.join(path)}")
        else:
            print("   未找到路径")
        
        # 测试推荐查询
        print("\n💡 测试节点推荐 (python_basics)...")
        recommendations = adapter.get_node_recommendations("python_basics", limit=3)
        if recommendations:
            for i, rec in enumerate(recommendations, 1):
                print(f"   {i}. {rec.get('title')} (难度: {rec.get('difficulty_level')})")
        else:
            print("   暂无推荐")
        
        print("\n✅ 示例数据创建完成!")
        return True
        
    except Exception as e:
        logger.error(f"创建示例数据失败: {e}")
        import traceback
        traceback.print_exc()
        return False


if __name__ == "__main__":
    """测试脚本入口"""
    import sys
    
    print("=" * 70)
    print("ArcadeDB 适配器测试")
    print("=" * 70)
    
    # 配置连接参数
    ARCADEDB_HOST = "localhost"
    ARCADEDB_PORT = 2480
    ARCADEDB_DATABASE = "OpenMTSciEd"
    ARCADEDB_USERNAME = "root"
    ARCADEDB_PASSWORD = "playwithdata"
    
    print(f"\n🔌 连接到 ArcadeDB...")
    print(f"   主机: {ARCADEDB_HOST}")
    print(f"   端口: {ARCADEDB_PORT}")
    print(f"   数据库: {ARCADEDB_DATABASE}")
    
    # 创建适配器实例
    adapter = ArcadeDBAdapter(
        host=ARCADEDB_HOST,
        port=ARCADEDB_PORT,
        database=ARCADEDB_DATABASE,
        username=ARCADEDB_USERNAME,
        password=ARCADEDB_PASSWORD
    )
    
    if adapter._mock_mode:
        print("\n⚠️  警告: 运行在模拟模式下")
        print("   请确保 ArcadeDB 服务器正在运行:")
        print("   docker run --rm -p 2480:2480 -p 2424:2424 \\")
        print("     -e JAVA_OPTS=\"-Darcadedb.server.rootPassword=playwithdata\" \\")
        print("     arcadedata/arcadedb:latest")
        print()
        
        # 即使在模拟模式下也运行测试
        response = input("是否在模拟模式下继续测试? (y/n): ")
        if response.lower() != 'y':
            sys.exit(0)
    
    # 运行测试
    success = create_sample_data(adapter)
    
    # 清理
    adapter.close()
    
    if success:
        print("\n" + "=" * 70)
        print("✅ 所有测试通过!")
        print("=" * 70)
        sys.exit(0)
    else:
        print("\n" + "=" * 70)
        print("❌ 测试失败!")
        print("=" * 70)
        sys.exit(1)
