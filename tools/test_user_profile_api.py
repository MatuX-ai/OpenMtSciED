"""
测试用户画像API和动态路径调整功能
"""

import requests
import json
import sys
from datetime import datetime

# 设置UTF-8编码
if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

BASE_URL = "http://localhost:8000/api/v1/user-profile"

def print_section(title):
    print("\n" + "=" * 60)
    print(title)
    print("=" * 60)

def test_create_user():
    """测试1: 创建用户"""
    print_section("测试1: 创建用户")
    
    user_data = {
        "user_id": "test_student_001",
        "age": 13,
        "grade_level": "初中"
    }
    
    response = requests.post(f"{BASE_URL}/create", json=user_data)
    
    if response.status_code == 200:
        print("✅ 用户创建成功")
        print(json.dumps(response.json(), indent=2, ensure_ascii=False))
        return True
    else:
        print(f"❌ 创建失败: {response.status_code}")
        print(response.text)
        return False


def test_get_user():
    """测试2: 获取用户信息"""
    print_section("测试2: 获取用户信息")
    
    response = requests.get(f"{BASE_URL}/test_student_001")
    
    if response.status_code == 200:
        print("✅ 获取用户成功")
        data = response.json()
        print(f"  年龄: {data['age']}岁")
        print(f"  年级: {data['grade_level']}")
        print(f"  平均分: {data['average_score']}")
        print(f"  推荐起点: {data['recommended_starting_unit']}")
        return True
    else:
        print(f"❌ 获取失败: {response.status_code}")
        return False


def test_submit_test_score():
    """测试3: 提交测试成绩"""
    print_section("测试3: 提交测试成绩")
    
    score_data = {
        "knowledge_point_id": "KP-Phys-001",
        "score": 85.0
    }
    
    response = requests.post(
        f"{BASE_URL}/test_student_001/test-score",
        json=score_data
    )
    
    if response.status_code == 200:
        print("✅ 成绩提交成功")
        data = response.json()
        print(f"  新平均分: {data['new_average_score']}")
        print(f"  总测试数: {data['total_tests']}")
        return True
    else:
        print(f"❌ 提交失败: {response.status_code}")
        return False


def test_complete_unit():
    """测试4: 完成课程单元"""
    print_section("测试4: 完成课程单元")
    
    unit_data = {
        "unit_id": "OS-MS-Phys-001",
        "duration_hours": 12.5,
        "performance_score": 78.0
    }
    
    response = requests.post(
        f"{BASE_URL}/test_student_001/complete-unit",
        json=unit_data
    )
    
    if response.status_code == 200:
        print("✅ 单元完成记录成功")
        data = response.json()
        print(f"  已完成单元数: {data['completed_units_count']}")
        print(f"  平均表现分: {data['average_performance']}")
        return True
    else:
        print(f"❌ 记录失败: {response.status_code}")
        return False


def test_learning_progress():
    """测试5: 获取学习进度"""
    print_section("测试5: 获取学习进度")
    
    response = requests.get(f"{BASE_URL}/test_student_001/learning-progress")
    
    if response.status_code == 200:
        print("✅ 获取学习进度成功")
        data = response.json()
        print(f"  已完成单元: {data['total_completed_units']}")
        print(f"  总学习时长: {data['total_study_hours']}小时")
        print(f"  平均表现: {data['average_performance']}")
        print(f"  知识掌握情况:")
        for kp_id, info in data['knowledge_mastery'].items():
            print(f"    - {kp_id}: {info['score']}分 ({info['level']})")
        return True
    else:
        print(f"❌ 获取失败: {response.status_code}")
        return False


def test_generate_path():
    """测试6: 生成学习路径"""
    print_section("测试6: 生成学习路径")
    
    response = requests.get(f"{BASE_URL}/test_student_001/generate-path?max_nodes=10")
    
    if response.status_code == 200:
        print("✅ 路径生成成功")
        data = response.json()
        print(f"  起始单元: {data['starting_unit']}")
        print(f"  节点总数: {len(data['path_nodes'])}")
        print(f"  摘要:")
        print(f"    - 总时长: {data['summary']['total_hours']}小时")
        print(f"    - 平均难度: {data['summary']['avg_difficulty']}")
        
        print(f"\n  路径节点预览 (前5个):")
        for i, node in enumerate(data['path_nodes'][:5]):
            print(f"    {i+1}. [{node['node_type']}] {node['title']}")
            print(f"       难度: {node['difficulty']}, 预计: {node['estimated_hours']}小时")
        
        return True
    else:
        print(f"❌ 生成失败: {response.status_code}")
        print(response.text)
        return False


def test_adjust_path():
    """测试7: 动态调整路径"""
    print_section("测试7: 动态调整路径")
    
    feedback_types = ["too_hard", "too_easy", "bored", "perfect"]
    
    for feedback in feedback_types:
        print(f"\n  反馈类型: {feedback}")
        
        response = requests.post(
            f"{BASE_URL}/test_student_001/adjust-path",
            json={"feedback_type": feedback}
        )
        
        if response.status_code == 200:
            data = response.json()
            print(f"    ✅ 调整成功")
            print(f"    原因: {data['adjustment_reason']}")
            print(f"    难度变化: {data['difficulty_change']}")
            print(f"    节点数: {len(data['adjusted_path'])}")
        else:
            print(f"    ❌ 调整失败: {response.status_code}")
    
    return True


def main():
    print("=" * 60)
    print("OpenMTSciEd - 用户画像API测试")
    print("=" * 60)
    
    tests = [
        ("创建用户", test_create_user),
        ("获取用户", test_get_user),
        ("提交成绩", test_submit_test_score),
        ("完成单元", test_complete_unit),
        ("学习进度", test_learning_progress),
        ("生成路径", test_generate_path),
        ("动态调整", test_adjust_path),
    ]
    
    results = []
    for name, test_func in tests:
        try:
            success = test_func()
            results.append((name, success))
        except Exception as e:
            print(f"\n❌ {name} 异常: {str(e)}")
            results.append((name, False))
    
    # 总结
    print_section("测试总结")
    passed = sum(1 for _, success in results if success)
    total = len(results)
    
    for name, success in results:
        status = "✅ 通过" if success else "❌ 失败"
        print(f"  {status} - {name}")
    
    print(f"\n总计: {passed}/{total} 通过")
    
    if passed == total:
        print("\n🎉 所有测试通过！")
    else:
        print(f"\n⚠️  {total - passed} 个测试失败")


if __name__ == "__main__":
    main()
