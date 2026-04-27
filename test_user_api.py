import requests
import json

# 测试用户管理API
BASE_URL = "http://localhost:8000/api/v1"

def test_user_management():
    print("=== 测试用户管理API ===\n")
    
    # 1. 测试获取用户列表
    print("1. 测试获取用户列表...")
    try:
        response = requests.get(f"{BASE_URL}/users/")
        if response.status_code == 200:
            users = response.json()
            print(f"   ✓ 成功获取用户列表，共 {len(users)} 个用户")
            for user in users[:2]:  # 只显示前两个用户
                print(f"     - ID: {user['id']}, 用户名: {user['username']}, 邮箱: {user['email']}")
        else:
            print(f"   ✗ 获取用户列表失败: {response.status_code} - {response.text}")
    except Exception as e:
        print(f"   ✗ 请求异常: {e}")
    
    print()
    
    # 2. 测试获取用户统计信息
    print("2. 测试获取用户统计信息...")
    try:
        response = requests.get(f"{BASE_URL}/users/stats/")
        if response.status_code == 200:
            stats = response.json()
            print(f"   ✓ 成功获取用户统计信息:")
            print(f"     - 总用户数: {stats['totalUsers']}")
            print(f"     - 活跃用户: {stats['activeUsers']}")
            print(f"     - 非活跃用户: {stats['inactiveUsers']}")
            print(f"     - 管理员: {stats['adminUsers']}")
            print(f"     - 机构管理员: {stats['orgAdminUsers']}")
        else:
            print(f"   ✗ 获取用户统计信息失败: {response.status_code} - {response.text}")
    except Exception as e:
        print(f"   ✗ 请求异常: {e}")
    
    print()
    
    # 3. 测试获取单个用户详情
    print("3. 测试获取用户详情 (ID: 1)...")
    try:
        response = requests.get(f"{BASE_URL}/users/1")
        if response.status_code == 200:
            user = response.json()
            print(f"   ✓ 成功获取用户详情:")
            print(f"     - ID: {user['id']}")
            print(f"     - 用户名: {user['username']}")
            print(f"     - 邮箱: {user['email']}")
            print(f"     - 角色: {user['role']}")
            print(f"     - 激活状态: {user['is_active']}")
        else:
            print(f"   ✗ 获取用户详情失败: {response.status_code} - {response.text}")
    except Exception as e:
        print(f"   ✗ 请求异常: {e}")
    
    print()
    
    # 4. 测试创建新用户
    print("4. 测试创建新用户...")
    new_user_data = {
        "username": "testuser",
        "email": "test@example.com",
        "password": "password123",
        "role": "user"
    }
    try:
        response = requests.post(f"{BASE_URL}/users/", json=new_user_data)
        if response.status_code == 200:
            user = response.json()
            print(f"   ✓ 成功创建新用户:")
            print(f"     - ID: {user['id']}")
            print(f"     - 用户名: {user['username']}")
            print(f"     - 邮箱: {user['email']}")
            print(f"     - 角色: {user['role']}")
        else:
            print(f"   ✗ 创建用户失败: {response.status_code} - {response.text}")
    except Exception as e:
        print(f"   ✗ 请求异常: {e}")
    
    print()
    
    # 5. 测试更新用户
    print("5. 测试更新用户 (ID: 1)...")
    update_data = {
        "username": "admin_updated",
        "is_active": True
    }
    try:
        response = requests.put(f"{BASE_URL}/users/1", json=update_data)
        if response.status_code == 200:
            user = response.json()
            print(f"   ✓ 成功更新用户:")
            print(f"     - ID: {user['id']}")
            print(f"     - 用户名: {user['username']}")
            print(f"     - 邮箱: {user['email']}")
            print(f"     - 角色: {user['role']}")
            print(f"     - 激活状态: {user['is_active']}")
        else:
            print(f"   ✗ 更新用户失败: {response.status_code} - {response.text}")
    except Exception as e:
        print(f"   ✗ 请求异常: {e}")
    
    print()
    
    # 6. 测试删除用户
    print("6. 测试删除用户 (ID: 4)...")
    try:
        response = requests.delete(f"{BASE_URL}/users/4")
        if response.status_code == 200:
            result = response.json()
            print(f"   ✓ 成功删除用户: {result['message']}")
        else:
            print(f"   ✗ 删除用户失败: {response.status_code} - {response.text}")
    except Exception as e:
        print(f"   ✗ 请求异常: {e}")
    
    print("\n=== API测试完成 ===")

if __name__ == "__main__":
    test_user_management()