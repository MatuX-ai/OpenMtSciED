"""删除学科类课程"""
import requests
import base64

url = "https://4abd5ef9.databases.neo4j.io/db/4abd5ef9/query/v2"
auth = base64.b64encode(b'4abd5ef9:bXebDaB8hSalBxvvB5GhHmcvudO03ilZB7qItmI0Xbs').decode()
headers = {'Content-Type': 'application/json', 'Authorization': f'Basic {auth}'}

subjects = ['数学', '物理', '化学', '生物']

print("开始删除学科类课程...")
for s in subjects:
    print(f"删除: {s}")
    r = requests.post(url, headers=headers, json={'statement': f'MATCH (cu:CourseUnit {{subject: "{s}"}}) DETACH DELETE cu'}, timeout=60)
    print(f"  状态: {r.status_code}")

print("删除完成")

# 验证
print("\n剩余课程:")
r = requests.post(url, headers=headers, json={'statement': 'MATCH (cu:CourseUnit) RETURN cu.subject AS subject, count(cu) AS count ORDER BY subject'}, timeout=30)
data = r.json()
for row in data['data']['values']:
    print(f"  {row[0]}: {row[1]}")

