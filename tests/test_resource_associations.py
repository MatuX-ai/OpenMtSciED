"""测试资源关联API"""

import requests
import json

# 基础URL
BASE_URL = "http://localhost:8000/api/v1/resources"

def test_associations():
    """测试资源关联功能"""
    
    print("=" * 60)
    print("测试资源关联API")
    print("=" * 60)
    
    # 1. 测试获取教程相关课件
    print("\n1. 测试获取教程相关课件...")
    try:
        response = requests.get(f"{BASE_URL}/tutorials/test-tutorial-1/related-materials")
        if response.status_code == 200:
            data = response.json()
            print(f"✓ 成功获取相关课件: {data.get('total', 0)} 个")
        else:
            print(f"✗ 请求失败: {response.status_code}")
    except Exception as e:
        print(f"✗ 错误: {e}")
    
    # 2. 测试获取课件所需硬件
    print("\n2. 测试获取课件所需硬件...")
    try:
        response = requests.get(f"{BASE_URL}/materials/test-material-1/required-hardware")
        if response.status_code == 200:
            data = response.json()
            print(f"✓ 成功获取所需硬件: {data.get('total', 0)} 个")
        else:
            print(f"✗ 请求失败: {response.status_code}")
    except Exception as e:
        print(f"✗ 错误: {e}")
    
    # 3. 测试获取完整学习路径
    print("\n3. 测试获取完整学习路径...")
    try:
        response = requests.get(f"{BASE_URL}/learning-path/test-tutorial-1")
        if response.status_code == 200:
            data = response.json()
            path_data = data.get('data', {})
            print(f"✓ 成功获取学习路径:")
            print(f"  - 教程: {path_data.get('tutorial', {}).get('title', 'N/A')}")
            print(f"  - 相关课件: {len(path_data.get('related_materials', []))} 个")
            print(f"  - 所需硬件: {len(path_data.get('required_hardware', []))} 个")
        else:
            print(f"✗ 请求失败: {response.status_code}")
    except Exception as e:
        print(f"✗ 错误: {e}")
    
    # 4. 测试关键词搜索
    print("\n4. 测试关键词搜索...")
    try:
        response = requests.get(f"{BASE_URL}/search-resources", params={"keyword": "物理"})
        if response.status_code == 200:
            data = response.json()
            search_data = data.get('data', {})
            print(f"✓ 成功搜索资源:")
            print(f"  - 教程: {len(search_data.get('tutorials', []))} 个")
            print(f"  - 课件: {len(search_data.get('materials', []))} 个")
            print(f"  - 硬件: {len(search_data.get('hardware_projects', []))} 个")
        else:
            print(f"✗ 请求失败: {response.status_code}")
    except Exception as e:
        print(f"✗ 错误: {e}")
    
    # 5. 测试资源概览
    print("\n5. 测试资源概览...")
    try:
        response = requests.get(f"{BASE_URL}/resources/summary")
        if response.status_code == 200:
            data = response.json()
            summary = data.get('data', {})
            print(f"✓ 成功获取资源概览:")
            print(f"  - 教程总数: {summary.get('total_tutorials', 0)}")
            print(f"  - 课件总数: {summary.get('total_materials', 0)}")
            print(f"  - 硬件总数: {summary.get('total_hardware', 0)}")
        else:
            print(f"✗ 请求失败: {response.status_code}")
    except Exception as e:
        print(f"✗ 错误: {e}")
    
    print("\n" + "=" * 60)
    print("测试完成")
    print("=" * 60)

if __name__ == "__main__":
    test_associations()
