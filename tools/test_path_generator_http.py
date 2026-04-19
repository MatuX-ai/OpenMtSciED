"""
测试路径生成器 - 使用HTTP API
"""

import os
import requests
from pathlib import Path
from dotenv import load_dotenv

env_path = Path(__file__).parent.parent / ".env"
load_dotenv(env_path)

# 配置
BASE_URL = os.getenv("NEO4J_QUERY_API_URL")
USER = os.getenv("NEO4J_USER")
PASSWORD = os.getenv("NEO4J_PASSWORD")

import base64
auth_string = f"{USER}:{PASSWORD}"
auth_base64 = base64.b64encode(auth_string.encode('ascii')).decode('ascii')

HEADERS = {
    "Content-Type": "application/json",
    "Authorization": f"Basic {auth_base64}"
}

def execute_cypher(query: str, params: dict = None) -> dict:
    """执行Cypher查询"""
    data = {"statement": query, "parameters": params or {}}
    response = requests.post(BASE_URL, headers=HEADERS, json=data, timeout=10)
    
    if response.status_code in [200, 202]:
        return response.json()
    else:
        print(f"❌ 查询失败: HTTP {response.status_code}")
        print(f"响应: {response.text[:200]}")
        return None


def test_1_multi_hop():
    """测试1: 多跳查询"""
    print("\n" + "=" * 60)
    print("测试1: 多跳查询 (PROGRESSES_TO * 0..3)")
    print("=" * 60)
    
    # 先找一个实际的CourseUnit ID
    query_first = "MATCH (cu:CourseUnit) RETURN cu.id LIMIT 1"
    result_first = execute_cypher(query_first)
    
    if not result_first:
        print("❌ 无法获取CourseUnit ID")
        return False
    
    first_id = result_first["data"]["values"][0][0]
    print(f"\n使用CourseUnit ID: {first_id}")
    
    query = f"""
    MATCH path = (start:CourseUnit {{id: '{first_id}'}})-[:PROGRESSES_TO*0..3]->(cu:CourseUnit)
    WITH cu, length(path) AS depth
    ORDER BY depth
    LIMIT 5
    RETURN cu.id, cu.title, cu.subject, depth
    """
    
    result = execute_cypher(query)
    if result:
        records = result["data"]["values"]
        print(f"\n✅ 找到 {len(records)} 个课程单元:")
        for record in records:
            print(f"  [{record[3]}] {record[0]}: {record[1]} ({record[2]})")
        return True
    return False


def test_2_full_path():
    """测试2: 完整路径生成"""
    print("\n" + "=" * 60)
    print("测试2: 完整路径生成 (多跳+知识点+教材+硬件)")
    print("=" * 60)
    
    # 先获取CourseUnit ID
    query_first = "MATCH (cu:CourseUnit) RETURN cu.id LIMIT 1"
    result_first = execute_cypher(query_first)
    if not result_first:
        print("❌ 无法获取CourseUnit ID")
        return False
    first_id = result_first["data"]["values"][0][0]
    
    # 使用.format()避免f-string的转义问题
    query = """
    MATCH path = (start:CourseUnit {{id: '{start_id}'}})-[:PROGRESSES_TO*0..2]->(cu:CourseUnit)
    WITH cu, length(path) AS depth
    ORDER BY depth
    LIMIT 3
    
    OPTIONAL MATCH (cu)-[:CONTAINS]->(kp:KnowledgePoint)
    WITH cu, depth, collect(DISTINCT kp) AS all_kp
    WITH cu, depth, all_kp[0..2] AS knowledge_points
    
    OPTIONAL MATCH (cu)-[:PROGRESSES_TO]->(tc:TextbookChapter)
    WITH cu, depth, knowledge_points, collect(DISTINCT tc) AS all_tc
    WITH cu, depth, knowledge_points, all_tc[0..1] AS textbooks
    
    OPTIONAL MATCH (hp:HardwareProject)
    WHERE hp.subject = cu.subject AND hp.difficulty <= depth + 2
    WITH cu, depth, knowledge_points, textbooks, collect(DISTINCT hp) AS all_hp
    WITH cu, depth, knowledge_points, textbooks, all_hp[0..1] AS hardware_projects
    
    RETURN cu.id AS cu_id, cu.title AS cu_title, cu.subject AS cu_subject,
           depth,
           [kp IN knowledge_points | {{id: kp.id, name: kp.name}}] AS knowledge_points,
           [tc IN textbooks | {{id: tc.id, title: tc.title}}] AS textbooks,
           [hp IN hardware_projects | {{id: hp.id, title: hp.title}}] AS hardware_projects
    ORDER BY depth
    """.format(start_id=first_id)
    
    result = execute_cypher(query)
    if result:
        records = result["data"]["values"]
        print(f"\n✅ 生成 {len(records)} 个学习节点:\n")
        
        total_nodes = 0
        for record in records:
            cu_id = record[0]
            cu_title = record[1]
            cu_subject = record[2]
            depth = record[3]
            knowledge_points = record[4]
            textbooks = record[5]
            hardware_projects = record[6]
            
            print(f"[{depth}] 课程单元: {cu_title} ({cu_subject})")
            total_nodes += 1
            
            for kp in knowledge_points:
                print(f"    ├─ 知识点: {kp['name']}")
                total_nodes += 1
            
            for tc in textbooks:
                print(f"    ├─ 教材: {tc['title']}")
                total_nodes += 1
            
            for hp in hardware_projects:
                print(f"    └─ 硬件项目: {hp['title']}")
                total_nodes += 1
            
            print()
        
        print(f"总节点数: {total_nodes}")
        return True
    return False


def test_3_starting_units():
    """测试3: 起点推荐"""
    print("\n" + "=" * 60)
    print("测试3: 起点推荐 (无入边的CourseUnit)")
    print("=" * 60)
    
    query = """
    MATCH (cu:CourseUnit)
    WHERE NOT ()-[:PROGRESSES_TO]->(cu)
    RETURN cu.id, cu.title, cu.subject, cu.grade_level
    LIMIT 5
    """
    
    result = execute_cypher(query)
    if result:
        records = result["data"]["values"]
        print(f"\n✅ 找到 {len(records)} 个推荐起点:")
        for record in records:
            print(f"  - {record[0]}: {record[1]} ({record[2]}, {record[3]})")
        return True
    return False


if __name__ == "__main__":
    print("=" * 60)
    print("OpenMTSciEd - 路径生成器测试 (HTTP API)")
    print("=" * 60)
    
    success = True
    success = test_1_multi_hop() and success
    success = test_2_full_path() and success
    success = test_3_starting_units() and success
    
    print("\n" + "=" * 60)
    if success:
        print("✅ 所有测试通过！")
    else:
        print("⚠️  部分测试失败")
    print("=" * 60)
