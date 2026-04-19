"""
通过HTTP API测试Neo4j Aura连接
"""

import requests
import base64

url = "https://4abd5ef9.databases.neo4j.io/db/neo4j/query/v2"
username = "4abd5ef9"
password = "bXebDaB8hSalBxvvB5GhHmcvudO03ilZB7qItmI0Xbs"

# 创建Basic Auth header
auth_string = f"{username}:{password}"
auth_bytes = auth_string.encode('ascii')
auth_base64 = base64.b64encode(auth_bytes).decode('ascii')

headers = {
    "Content-Type": "application/json",
    "Authorization": f"Basic {auth_base64}"
}

data = {
    "statement": "RETURN 1 AS test"
}

print(f"正在测试Neo4j Aura HTTP API...")
print(f"URL: {url}")

try:
    response = requests.post(url, headers=headers, json=data, timeout=10)
    print(f"\n状态码: {response.status_code}")
    
    if response.status_code == 200:
        result = response.json()
        print(f"✅ 连接成功！")
        print(f"结果: {result}")
    else:
        print(f"❌ 请求失败")
        print(f"响应: {response.text[:500]}")
        
except requests.exceptions.SSLError as e:
    print(f"❌ SSL错误: {e}")
    print("提示：这可能是证书验证问题")
except requests.exceptions.ConnectionError as e:
    print(f"❌ 连接错误: {e}")
    print("提示：检查网络连接或防火墙设置")
except Exception as e:
    print(f"❌ 未知错误: {type(e).__name__}: {e}")
