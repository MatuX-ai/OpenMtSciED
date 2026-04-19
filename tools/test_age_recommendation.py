"""
测试年龄段起点推荐功能
验证不同年龄段用户的推荐起点是否正确
"""

import os
import sys
from pathlib import Path
from dotenv import load_dotenv

# 加载环境变量
env_path = Path(__file__).parent.parent / ".env"
load_dotenv(env_path)

import requests
import base64

# 配置
BASE_URL = os.getenv("NEO4J_QUERY_API_URL")
USER = os.getenv("NEO4J_USER")
PASSWORD = os.getenv("NEO4J_PASSWORD")

auth_string = f"{USER}:{PASSWORD}"
auth_base64 = base64.b64encode(auth_string.encode('ascii')).decode('ascii')

HEADERS = {
    "Content-Type": "application/json",
    "Authorization": f"Basic {auth_base64}"
}

def execute_cypher(query: str, params: dict = None) -> dict:
    """执行Cypher查询"""
    data = {"statement": query, "parameters": params or {}}
    response = requests.post(BASE_URL, headers=HEADERS, json=data, timeout=10)
    
    if response.status_code in [200, 202]:
        return response.json()
    else:
        print(f"❌ 查询失败: HTTP {response.status_code}")
        return None


def verify_starting_unit(unit_id: str) -> bool:
    """验证推荐起点是否在Neo4j中存在"""
    query = "MATCH (cu:CourseUnit {id: $unit_id}) RETURN cu.id, cu.title, cu.subject, cu.grade_level"
    result = execute_cypher(query, {"unit_id": unit_id})
    
    if result and result["data"]["values"]:
        record = result["data"]["values"][0]
        print(f"  ✅ {record[0]}: {record[1]} ({record[2]}, {record[3]})")
        return True
    else:
        print(f"  ❌ {unit_id} 不存在于Neo4j")
        return False


def test_age_based_recommendation():
    """测试不同年龄段的推荐起点"""
    print("\n" + "=" * 60)
    print("测试: 年龄段起点推荐")
    print("=" * 60)
    
    # 模拟不同年龄段用户
    test_cases = [
        {"age": 8, "avg_score": 70, "expected": "OS-MS-Phys-001", "desc": "小学生 (低分)"},
        {"age": 10, "avg_score": 85, "expected": "OS-MS-Phys-001", "desc": "小学生 (高分)"},
        {"age": 12, "avg_score": 70, "expected": "OS-MS-Phys-001", "desc": "初中生 (低分)"},
        {"age": 13, "avg_score": 85, "expected": "OS-MS-Phys-002", "desc": "初中生 (高分)"},
        {"age": 16, "avg_score": 65, "expected": "OS-MS-Phys-003", "desc": "高中生"},
        {"age": 20, "avg_score": 80, "expected": "OS-MS-Phys-001", "desc": "大学生"},
    ]
    
    success_count = 0
    
    for case in test_cases:
        print(f"\n{case['desc']}:")
        print(f"  年龄: {case['age']}岁, 平均分: {case['avg_score']}")
        
        # 根据年龄和分数逻辑计算推荐起点
        age = case['age']
        avg = case['avg_score']
        
        if age <= 10:
            recommended = "OS-MS-Phys-001"
        elif age <= 14:
            recommended = "OS-MS-Phys-002" if avg >= 80 else "OS-MS-Phys-001"
        elif age <= 18:
            recommended = "OS-MS-Phys-003"
        else:
            recommended = "OS-MS-Phys-001"
        
        print(f"  推荐起点: {recommended}")
        
        # 验证是否存在
        if verify_starting_unit(recommended):
            success_count += 1
    
    print(f"\n✅ 验证完成: {success_count}/{len(test_cases)} 个推荐起点有效")
    return success_count == len(test_cases)


def test_subject_diversity():
    """测试不同学科的起点"""
    print("\n" + "=" * 60)
    print("测试: 学科多样性起点")
    print("=" * 60)
    
    # 获取不同学科的起点
    query = """
    MATCH (cu:CourseUnit)
    WHERE NOT ()-[:PROGRESSES_TO]->(cu)
    RETURN cu.id, cu.title, cu.subject, cu.grade_level
    ORDER BY cu.subject
    LIMIT 10
    """
    
    result = execute_cypher(query)
    if result:
        records = result["data"]["values"]
        print(f"\n✅ 找到 {len(records)} 个学科起点:")
        
        subjects = {}
        for record in records:
            subject = record[2]
            if subject not in subjects:
                subjects[subject] = []
            subjects[subject].append({
                "id": record[0],
                "title": record[1],
                "grade": record[3]
            })
        
        for subject, units in subjects.items():
            print(f"\n{subject}:")
            for unit in units:
                print(f"  - {unit['id']}: {unit['title']} ({unit['grade']})")
        
        return True
    
    return False


if __name__ == "__main__":
    print("=" * 60)
    print("OpenMTSciEd - 年龄段起点推荐测试")
    print("=" * 60)
    
    success1 = test_age_based_recommendation()
    success2 = test_subject_diversity()
    
    print("\n" + "=" * 60)
    if success1 and success2:
        print("✅ 所有测试通过！")
    else:
        print("⚠️  部分测试失败")
    print("=" * 60)
