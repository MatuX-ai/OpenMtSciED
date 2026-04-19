import requests
import base64

url = "https://4abd5ef9.databases.neo4j.io/db/4abd5ef9/query/v2"
auth = base64.b64encode(b'4abd5ef9:bXebDaB8hSalBxvvB5GhHmcvudO03ilZB7qItmI0Xbs').decode()
headers = {'Content-Type':'application/json','Authorization':f'Basic {auth}'}

queries = [
    ('CourseUnit', 'MATCH (cu:CourseUnit) RETURN count(cu)'),
    ('KnowledgePoint', 'MATCH (kp:KnowledgePoint) RETURN count(kp)'),
    ('TextbookChapter', 'MATCH (tc:TextbookChapter) RETURN count(tc)'),
]

for name, q in queries:
    r = requests.post(url, headers=headers, json={"statement": q})
    data = r.json()
    count = data["data"]["values"][0][0]
    print(f'{name}: {count}')
