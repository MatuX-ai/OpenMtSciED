import requests
import json

# 创建测试用户
print("1. 创建测试用户...")
r = requests.post('http://localhost:8000/api/v1/user-profile/create', 
                  json={'user_id': 'test_debug_001', 'age': 13, 'grade_level': '初中'})
print(f"   Status: {r.status_code}")
print(f"   Response: {r.json()}\n")

# 生成学习路径
print("2. 生成学习路径...")
r2 = requests.get('http://localhost:8000/api/v1/user-profile/test_debug_001/generate-path?max_nodes=5')
print(f"   Status: {r2.status_code}")
print(f"   Response Text: {r2.text[:1000]}\n")

if r2.status_code != 200:
    print("❌ 路径生成失败")
else:
    print("✅ 路径生成成功")
    data = r2.json()
    print(f"   路径节点数: {len(data)}")
    if data:
        print(f"   第一个节点: {json.dumps(data[0], indent=2, ensure_ascii=False)}")
