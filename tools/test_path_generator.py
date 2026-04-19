"""
测试学习路径生成器
验证多跳查询功能
"""

import os
import sys
import json
import requests
from pathlib import Path
from dotenv import load_dotenv

# 加载环境变量
env_path = Path(__file__).parent.parent / ".env"
load_dotenv(env_path)

import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def test_multi_hop_query():
    """测试多跳查询"""
    logger.info("=" * 60)
    logger.info("测试多跳查询功能")
    logger.info("=" * 60)
    
    # 连接配置
    base_url = os.getenv("NEO4J_QUERY_API_URL", "https://4abd5ef9.databases.neo4j.io/db/4abd5ef9/query/v2")
    user = os.getenv("NEO4J_USER", "4abd5ef9")
    password = os.getenv("NEO4J_PASSWORD")
    
    import base64
    auth_string = f"{user}:{password}"
    auth_bytes = auth_string.encode('ascii')
    auth_base64 = base64.b64encode(auth_bytes).decode('ascii')
    
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Basic {auth_base64}"
    }
    
    logger.info(f"连接Neo4j HTTP API: {base_url}")
    
    # 测试查询：从某个课程单元开始，沿PROGRESSES_TO关系遍历
    query = """
    MATCH path = (start:CourseUnit {id: 'CS-Middle-Unit-001'})-[:PROGRESSES_TO*0..3]->(cu:CourseUnit)
    WITH cu, length(path) AS depth
    ORDER BY depth
    LIMIT 10
    RETURN cu.id AS id, cu.title AS title, cu.subject AS subject, depth
    """
    
    data = {"statement": query}
    response = requests.post(base_url, headers=headers, json=data, timeout=10)
    
    if response.status_code in [200, 202]:
        result = response.json()
        records = result["data"]["values"]
        
        logger.info(f"\n找到 {len(records)} 个课程单元:")
        for record in records:
            logger.info(f"  - [{record[3]}] {record[0]}: {record[1]} ({record[2]})")
    else:
        logger.error(f"查询失败: HTTP {response.status_code}")
        logger.error(f"响应: {response.text[:200]}")
        return False
    
    logger.info("\n✅ 多跳查询测试完成")
    return True


def test_full_path_generation():
    """测试完整的路径生成（包含知识点、教材、硬件项目）"""
    logger.info("=" * 60)
    logger.info("测试完整路径生成")
    logger.info("=" * 60)
    
    uri = os.getenv("NEO4J_URI", "neo4j+s://4abd5ef9.databases.neo4j.io")
    user = os.getenv("NEO4J_USER", "4abd5ef9")
    password = os.getenv("NEO4J_PASSWORD")
    
    driver = GraphDatabase.driver(uri, auth=(user, password))
    
    query = """
    MATCH (start:CourseUnit {id: 'CS-Middle-Unit-001'})
    OPTIONAL MATCH path = (start)-[:PROGRESSES_TO*0..2]->(cu:CourseUnit)
    WITH cu, length(path) AS depth
    ORDER BY depth
    LIMIT 5
    
    OPTIONAL MATCH (cu)-[:CONTAINS]->(kp:KnowledgePoint)
    WITH cu, depth, collect(DISTINCT kp) AS knowledge_points
    
    OPTIONAL MATCH (cu)-[:PROGRESSES_TO]->(tc:TextbookChapter)
    WITH cu, depth, knowledge_points, collect(DISTINCT tc) AS textbooks
    
    OPTIONAL MATCH (hp:HardwareProject {subject: cu.subject})
    WHERE hp.difficulty <= depth + 2
    WITH cu, depth, knowledge_points, textbooks, collect(DISTINCT hp) AS hardware_projects
    
    RETURN cu, depth,
           [kp IN knowledge_points | {id: kp.id, name: kp.name}][0..2] AS knowledge_points,
           [tc IN textbooks | {id: tc.id, title: tc.title}][0..1] AS textbooks,
           [hp IN hardware_projects | {id: hp.id, title: hp.title}][0..1] AS hardware_projects
    ORDER BY depth
    """
    
    with driver.session(database="4abd5ef9") as session:
        result = session.run(query)
        records = list(result)
        
        logger.info(f"\n生成 {len(records)} 个学习节点:")
        
        node_count = 0
        for record in records:
            cu = record["cu"]
            depth = record["depth"]
            
            logger.info(f"\n[{depth}] 课程单元: {cu['title']} ({cu['subject']})")
            node_count += 1
            
            # 知识点
            for kp in record["knowledge_points"]:
                logger.info(f"    ├─ 知识点: {kp['name']}")
                node_count += 1
            
            # 教材章节
            for tc in record["textbooks"]:
                logger.info(f"    ├─ 教材: {tc['title']}")
                node_count += 1
            
            # 硬件项目
            for hp in record["hardware_projects"]:
                logger.info(f"    └─ 硬件项目: {hp['title']}")
                node_count += 1
        
        logger.info(f"\n总节点数: {node_count}")
    
    driver.close()
    logger.info("\n✅ 完整路径生成测试完成")


def test_starting_unit_recommendation():
    """测试起点推荐"""
    logger.info("=" * 60)
    logger.info("测试起点推荐")
    logger.info("=" * 60)
    
    uri = os.getenv("NEO4J_URI", "neo4j+s://4abd5ef9.databases.neo4j.io")
    user = os.getenv("NEO4J_USER", "4abd5ef9")
    password = os.getenv("NEO4J_PASSWORD")
    
    driver = GraphDatabase.driver(uri, auth=(user, password))
    
    # 查询所有可能的起点（没有入边的CourseUnit）
    query = """
    MATCH (cu:CourseUnit)
    WHERE NOT ()-[:PROGRESSES_TO]->(cu)
    RETURN cu.id, cu.title, cu.subject, cu.grade_level
    LIMIT 10
    """
    
    with driver.session(database="4abd5ef9") as session:
        result = session.run(query)
        records = list(result)
        
        logger.info(f"\n找到 {len(records)} 个推荐起点:")
        for record in records:
            logger.info(f"  - {record['cu.id']}: {record['cu.title']} ({record['cu.subject']}, {record['cu.grade_level']})")
    
    driver.close()
    logger.info("\n✅ 起点推荐测试完成")


if __name__ == "__main__":
    try:
        test_multi_hop_query()
        print()
        test_full_path_generation()
        print()
        test_starting_unit_recommendation()
        
        print("\n" + "=" * 60)
        print("✅ 所有测试完成！")
        print("=" * 60)
        
    except Exception as e:
        logger.error(f"❌ 测试失败: {e}", exc_info=True)
        sys.exit(1)
