"""
学习路径API测试脚本
测试新生成的API端点
"""

import requests
import json
from datetime import datetime

# API基础URL
BASE_URL = "http://localhost:8000"

def test_health_check():
    """测试健康检查端点"""
    print("=" * 60)
    print("测试1: 健康检查")
    print("=" * 60)
    
    response = requests.get(f"{BASE_URL}/api/v1/learning-path/health")
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2, ensure_ascii=False)}")
    print()


def test_generate_path():
    """测试路径生成端点"""
    print("=" * 60)
    print("测试2: 生成学习路径")
    print("=" * 60)
    
    payload = {
        "user_id": "test_user_001",
        "current_level": "beginner",
        "target_subject": "物理",
        "interests": ["物理", "工程"],
        "completed_nodes": [],
        "max_nodes": 8,
        "max_hours": 40.0,
        "available_hours_per_week": 10.0
    }
    
    print(f"Request Payload:")
    print(json.dumps(payload, indent=2, ensure_ascii=False))
    print()
    
    response = requests.post(
        f"{BASE_URL}/api/v1/learning-path/generate",
        json=payload
    )
    
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        result = response.json()
        print(f"\nGenerated Path:")
        print(f"  User ID: {result['user_id']}")
        print(f"  Total Nodes: {len(result['nodes'])}")
        print(f"  Total Hours: {result['total_hours']}")
        print(f"  Quality Score: {result['path_quality_score']:.2f}")
        print(f"  Difficulty Progression: {result['difficulty_progression']}")
        print(f"\nFirst 3 nodes:")
        for i, node in enumerate(result['nodes'][:3]):
            print(f"  {i+1}. {node['title']} ({node['difficulty']}) - {node['estimated_hours']}h")
    else:
        print(f"Error: {response.text}")
    print()


def test_get_progress():
    """测试获取进度端点"""
    print("=" * 60)
    print("测试3: 获取用户进度")
    print("=" * 60)
    
    user_id = "test_user_001"
    response = requests.get(f"{BASE_URL}/api/v1/learning-path/{user_id}/progress")
    
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        result = response.json()
        print(f"Response: {json.dumps(result, indent=2, ensure_ascii=False)}")
    else:
        print(f"Error: {response.text}")
    print()


def test_submit_feedback():
    """测试提交反馈端点"""
    print("=" * 60)
    print("测试4: 提交学习反馈")
    print("=" * 60)
    
    user_id = "test_user_001"
    payload = {
        "user_id": user_id,
        "completed_node_id": "OS-Unit-001",
        "completion_date": datetime.now().isoformat(),
        "rating": 4,
        "feedback": "内容很好，难度适中"
    }
    
    print(f"Request Payload:")
    print(json.dumps(payload, indent=2, ensure_ascii=False))
    print()
    
    response = requests.post(
        f"{BASE_URL}/api/v1/learning-path/{user_id}/feedback",
        json=payload
    )
    
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        result = response.json()
        print(f"Response: {json.dumps(result, indent=2, ensure_ascii=False)}")
    else:
        print(f"Error: {response.text}")
    print()


def test_explore():
    """测试探索式推荐端点"""
    print("=" * 60)
    print("测试5: 探索式学习推荐")
    print("=" * 60)
    
    response = requests.get(
        f"{BASE_URL}/api/v1/learning-path/explore",
        params={"subject": "物理", "difficulty": "beginner", "limit": 5}
    )
    
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        result = response.json()
        print(f"Response: {json.dumps(result, indent=2, ensure_ascii=False)}")
    else:
        print(f"Error: {response.text}")
    print()


def main():
    """运行所有测试"""
    print("\n")
    print("╔" + "=" * 58 + "╗")
    print("║" + " " * 10 + "OpenMTSciEd 学习路径API测试" + " " * 18 + "║")
    print("╚" + "=" * 58 + "╝")
    print()
    
    try:
        test_health_check()
        test_generate_path()
        test_get_progress()
        test_submit_feedback()
        test_explore()
        
        print("=" * 60)
        print("✅ 所有测试完成！")
        print("=" * 60)
        
    except requests.exceptions.ConnectionError:
        print("❌ 错误: 无法连接到API服务器")
        print("请确保已启动FastAPI服务: python -m src.openmtscied.main")
    except Exception as e:
        print(f"❌ 测试失败: {e}")


if __name__ == "__main__":
    main()
