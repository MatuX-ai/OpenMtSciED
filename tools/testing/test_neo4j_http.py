import requests
import base64

url = "https://4abd5ef9.databases.neo4j.io/db/4abd5ef9/query/v2"
username = "4abd5ef9"
password = "bXebDaB8hSalBxvvB5GhHmcvudO03ilZB7qItmI0Xbs"

# 正确的base64编码
auth_string = f"{username}:{password}"
auth_bytes = auth_string.encode('ascii')
auth_base64 = base64.b64encode(auth_bytes).decode('ascii')

print(f"Auth string: {auth_string}")
print(f"Base64: {auth_base64}")

headers = {
    "Content-Type": "application/json",
    "Authorization": f"Basic {auth_base64}"
}

# 测试连接
r = requests.post(url, headers=headers, json={"statement": "RETURN 1 AS test"}, timeout=10)
print(f"\nStatus: {r.status_code}")
print(f"Response: {r.text[:300]}")
