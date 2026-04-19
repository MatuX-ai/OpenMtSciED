import requests
import base64
import os
from pathlib import Path
from dotenv import load_dotenv
import json

# 加载环境变量
env_path = Path(__file__).parent.parent / ".env"
load_dotenv(env_path)

# 配置
base_url = os.getenv("NEO4J_QUERY_API_URL")
user = os.getenv("NEO4J_USER")
password = os.getenv("NEO4J_PASSWORD")

auth_string = f"{user}:{password}"
auth_base64 = base64.b64encode(auth_string.encode('ascii')).decode('ascii')

headers = {
    "Content-Type": "application/json",
    "Authorization": f"Basic {auth_base64}"
}

# 使用与path_generator完全相同的查询
query = """
MATCH path = (start:CourseUnit {id: $start_id})-[:PROGRESSES_TO*0..4]->(cu:CourseUnit)
WITH cu, length(path) AS depth
ORDER BY depth

// 获取每个CourseUnit相关的知识点
OPTIONAL MATCH (cu)-[:CONTAINS]->(kp:KnowledgePoint)
WITH cu, depth, collect(kp) AS knowledge_points

// 获取相关的教材章节
OPTIONAL MATCH (cu)-[:PROGRESSES_TO]->(tc:TextbookChapter)
WITH cu, depth, knowledge_points, collect(DISTINCT tc) AS textbooks

// 获取相关的硬件项目（通过学科匹配）
OPTIONAL MATCH (hp:HardwareProject {subject: cu.subject})
WHERE hp.difficulty <= cu.difficulty + 1
WITH cu, depth, knowledge_points, textbooks, collect(DISTINCT hp) AS hardware_projects

RETURN cu, depth, 
       [kp IN knowledge_points | {id: kp.id, name: kp.name}] AS knowledge_points,
       [tc IN textbooks | {id: tc.id, title: tc.title}] AS textbooks,
       [hp IN hardware_projects | {id: hp.id, title: hp.title}] AS hardware_projects
ORDER BY depth
LIMIT 5
"""

params = {"start_id": "OS-MS-Phys-001"}

print("执行path_generator相同的查询...")
data = {
    "statement": query,
    "parameters": params
}

r = requests.post(base_url, headers=headers, json=data, timeout=10)
print(f"Status: {r.status_code}")

if r.status_code in [200, 202]:
    result = r.json()
    print(f"\nResponse structure: {list(result.keys())}")
    print(f"Data structure: {list(result.get('data', {}).keys())}")
    
    records = result.get("data", {}).get("values", [])
    print(f"\nRecords found: {len(records)}")
    
    if records:
        print(f"\nFirst record structure:")
        first_record = records[0]
        print(f"  Record length: {len(first_record)}")
        print(f"  Element 0 (cu) type: {type(first_record[0])}")
        print(f"  Element 1 (depth): {first_record[1]}")
        print(f"  Element 2 (knowledge_points): {first_record[2]}")
        print(f"  Element 3 (textbooks): {first_record[3]}")
        print(f"  Element 4 (hardware_projects): {first_record[4]}")
        
        if first_record[0]:
            print(f"\n  cu details:")
            print(f"    Type: {type(first_record[0])}")
            if isinstance(first_record[0], dict):
                print(f"    Keys: {list(first_record[0].keys())}")
                print(f"    Content: {json.dumps(first_record[0], indent=2, ensure_ascii=False)[:500]}")
else:
    print(f"Error: {r.text[:1000]}")
