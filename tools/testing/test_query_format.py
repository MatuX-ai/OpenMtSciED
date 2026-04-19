import requests
import base64
import json
import sys

if sys.stdout.encoding != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8')

url = "https://4abd5ef9.databases.neo4j.io/db/4abd5ef9/query/v2"
username = "4abd5ef9"
password = "bXebDaB8hSalBxvvB5GhHmcvudO03ilZB7qItmI0Xbs"

auth_string = f"{username}:{password}"
auth_bytes = auth_string.encode('ascii')
auth_base64 = base64.b64encode(auth_bytes).decode('ascii')

headers = {
    "Content-Type": "application/json",
    "Authorization": f"Basic {auth_base64}"
}

# 测试查询
query = "MATCH (cu:CourseUnit) RETURN count(cu) AS count"
payload = {"statement": query}

print(f"Query: {query}\n")
response = requests.post(url, headers=headers, json=payload, timeout=30)

print(f"Status: {response.status_code}")
print(f"\nRaw Response:")
print(json.dumps(response.json(), indent=2, ensure_ascii=False))
