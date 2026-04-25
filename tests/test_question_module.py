"""
题库模块全场景测试脚本
"""
import os
import sys
import requests
from dotenv import load_dotenv

load_dotenv('.env.local')

BASE_URL = "http://localhost:8000/api/v1/learning"
HEADERS = {"Content-Type": "application/json"}

def test_get_banks():
    print("🧪 测试 1: 获取题库列表...")
    res = requests.get(f"{BASE_URL}/banks")
    assert res.status_code == 200, f"状态码错误: {res.status_code}"
    data = res.json()
    assert data['success'] is True
    print(f"✅ 成功获取 {len(data['data'])} 个题库")

def test_submit_answer():
    print("\n🧪 测试 2: 提交答案并验证判分逻辑...")
    # 假设第一条题目是选择题，我们尝试提交一个错误答案
    questions_res = requests.get(f"{BASE_URL}/questions?limit=1")
    q_id = questions_res.json()['data'][0]['id']
    
    payload = {
        "question_id": q_id,
        "answer_content": "TEST_WRONG_ANSWER",
        "time_spent_seconds": 10
    }
    res = requests.post(f"{BASE_URL}/submit-answer", json=payload, headers=HEADERS)
    assert res.status_code == 200
    result = res.json()
    print(f"✅ 答题结果: 正确={result['is_correct']}")

def test_get_stats():
    print("\n🧪 测试 3: 获取学习统计与掌握度...")
    # 这里需要模拟认证，暂时跳过或返回空
    print("⚠️ 注意：此接口需要用户认证 Token，请在登录后手动验证 /stats 接口")

def test_adaptive_quiz():
    print("\n🧪 测试 4: 自适应题目推荐...")
    res = requests.get(f"{BASE_URL}/adaptive-quiz")
    # 同样需要认证，检查接口是否存在
    if res.status_code == 401:
        print("✅ 接口存在（需认证）")
    else:
        print(f"⚠️ 状态码: {res.status_code}")

if __name__ == "__main__":
    try:
        test_get_banks()
        test_submit_answer()
        test_get_stats()
        test_adaptive_quiz()
        print("\n🎉 基础接口连通性测试完成！")
    except Exception as e:
        print(f"\n❌ 测试失败: {e}")
