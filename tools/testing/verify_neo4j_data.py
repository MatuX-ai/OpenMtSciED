"""验证Neo4j中的数据导入情况"""
import requests
import base64
import json
import sys

# 设置stdout编码为UTF-8
if sys.stdout.encoding != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8')

# Neo4j Aura配置
base_url = "https://4abd5ef9.databases.neo4j.io/db/4abd5ef9/query/v2"
username = "4abd5ef9"
password = "bXebDaB8hSalBxvvB5GhHmcvudO03ilZB7qItmI0Xbs"

# 创建认证header
auth_string = f"{username}:{password}"
auth_bytes = auth_string.encode('ascii')
auth_base64 = base64.b64encode(auth_bytes).decode('ascii')

headers = {
    "Content-Type": "application/json",
    "Authorization": f"Basic {auth_base64}"
}

# 查询各类节点数量
queries = {
    "CourseUnit节点数": "MATCH (cu:CourseUnit) RETURN count(cu) AS count",
    "KnowledgePoint节点数": "MATCH (kp:KnowledgePoint) RETURN count(kp) AS count",
    "TextbookChapter节点数": "MATCH (tc:TextbookChapter) RETURN count(tc) AS count",
    "HardwareProject节点数": "MATCH (hp:HardwareProject) RETURN count(hp) AS count",
    "CONTAINS关系数": "MATCH ()-[:CONTAINS]->() RETURN count(*) AS count",
    "PROGRESSES_TO关系数": "MATCH ()-[:PROGRESSES_TO]->() RETURN count(*) AS count",
}

print("=" * 60)
print("Neo4j知识图谱数据统计")
print("=" * 60)

total_nodes = 0
total_relationships = 0

for name, query in queries.items():
    payload = {
        "statement": query
    }
    
    try:
        response = requests.post(base_url, headers=headers, json=payload, timeout=30)
        if response.status_code in [200, 202]:
            result = response.json()
            # HTTP API v2 返回格式: {"data": {"fields": [...], "values": [[value]]}}
            if result.get('data') and result['data'].get('values'):
                count = result['data']['values'][0][0]
            else:
                count = 0
            
            print(f"{name}: {count}")
            
            if "节点数" in name:
                total_nodes += count
            elif "关系数" in name:
                total_relationships += count
        else:
            print(f"{name}: 查询失败 - {response.status_code}")
            print(f"  Response: {response.text[:200]}")
    except Exception as e:
        print(f"{name}: 错误 - {type(e).__name__}: {e}")

print("=" * 60)
print(f"总节点数: {total_nodes}")
print(f"总关系数: {total_relationships}")
print("=" * 60)
