import requests
import base64
import os
from pathlib import Path
from dotenv import load_dotenv

# 加载环境变量
env_path = Path(__file__).parent.parent / ".env"
load_dotenv(env_path)

# 配置
base_url = os.getenv("NEO4J_QUERY_API_URL", "https://4abd5ef9.databases.neo4j.io/db/4abd5ef9/query/v2")
user = os.getenv("NEO4J_USER", "4abd5ef9")
password = os.getenv("NEO4J_PASSWORD", "password")

print(f"Base URL: {base_url}")
print(f"User: {user}")
print(f"Password length: {len(password)}")

# Basic Auth
auth_string = f"{user}:{password}"
auth_base64 = base64.b64encode(auth_string.encode('ascii')).decode('ascii')

headers = {
    "Content-Type": "application/json",
    "Authorization": f"Basic {auth_base64}"
}

# 测试简单查询
print("\n1. 测试简单查询...")
data = {"statement": "RETURN 1 as test"}
r = requests.post(base_url, headers=headers, json=data, timeout=10)
print(f"   Status: {r.status_code}")
print(f"   Response: {r.text[:200]}")

# 测试CourseUnit查询
print("\n2. 测试CourseUnit查询...")
query = """
MATCH (cu:CourseUnit {id: 'OS-MS-Phys-001'})
RETURN cu.id as id, cu.title as title
"""
data = {"statement": query}
r2 = requests.post(base_url, headers=headers, json=data, timeout=10)
print(f"   Status: {r2.status_code}")
if r2.status_code in [200, 202]:
    print(f"   Response: {r2.json()}")
else:
    print(f"   Error: {r2.text[:500]}")

# 测试路径查询
print("\n3. 测试路径查询...")
query = """
MATCH path = (start:CourseUnit {id: 'OS-MS-Phys-001'})-[:PROGRESSES_TO*0..2]->(cu:CourseUnit)
WITH cu, length(path) AS depth
ORDER BY depth
RETURN cu.id as id, cu.title as title, depth
LIMIT 5
"""
data = {"statement": query}
r3 = requests.post(base_url, headers=headers, json=data, timeout=10)
print(f"   Status: {r3.status_code}")
if r3.status_code in [200, 202]:
    result = r3.json()
    print(f"   Records found: {len(result.get('data', {}).get('values', []))}")
    if result.get('data', {}).get('values'):
        print(f"   First record: {result['data']['values'][0]}")
else:
    print(f"   Error: {r3.text[:500]}")
