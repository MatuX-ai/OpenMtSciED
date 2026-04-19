"""快速验证推荐起点ID是否存在于Neo4j"""
import os
from dotenv import load_dotenv
load_dotenv()

import requests
import base64

BASE_URL = os.getenv("NEO4J_QUERY_API_URL")
USER = os.getenv("NEO4J_USER")
PASSWORD = os.getenv("NEO4J_PASSWORD")

auth_string = f"{USER}:{PASSWORD}"
auth_base64 = base64.b64encode(auth_string.encode('ascii')).decode('ascii')
HEADERS = {
    "Content-Type": "application/json",
    "Authorization": f"Basic {auth_base64}"
}

# 需要验证的ID
ids_to_check = [
    "OS-MS-Phys-001",  # 光与物质相互作用
    "OS-MS-Phys-002",  # 热能与温度
    "OS-MS-Phys-003",  # 碰撞与动量
]

print("验证推荐起点ID是否存在于Neo4j:\n")

for unit_id in ids_to_check:
    query = f"MATCH (cu:CourseUnit {{id: '{unit_id}'}}) RETURN cu.title LIMIT 1"
    try:
        response = requests.post(BASE_URL, headers=HEADERS, json={"statement": query}, timeout=5)
        if response.status_code in [200, 202]:
            data = response.json()
            values = data.get("data", {}).get("values", [])
            if values:
                print(f"✅ {unit_id}: {values[0][0]}")
            else:
                print(f"❌ {unit_id}: 不存在")
        else:
            print(f"⚠️  {unit_id}: HTTP {response.status_code}")
    except Exception as e:
        print(f"⚠️  {unit_id}: {str(e)[:50]}")
