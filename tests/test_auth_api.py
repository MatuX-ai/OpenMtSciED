"""测试认证API功能"""
import requests
import json

BASE_URL = "http://localhost:8000/api/v1/auth"

def test_register():
    """测试用户注册"""
    print("\n=== 测试用户注册 ===")
    
    # 测试数据
    user_data = {
        "username": "testuser",
        "email": "test@example.com",
        "password": "testpass123"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/register", json=user_data)
        print(f"状态码: {response.status_code}")
        print(f"响应: {json.dumps(response.json(), indent=2, ensure_ascii=False)}")
        
        if response.status_code == 200:
            print("✅ 注册成功")
            return True
        else:
            print(f"❌ 注册失败: {response.json().get('detail')}")
            return False
    except Exception as e:
        print(f"❌ 请求异常: {e}")
        return False

def test_login():
    """测试用户登录"""
    print("\n=== 测试用户登录 ===")
    
    # 使用表单数据登录
    login_data = {
        "username": "admin",
        "password": "12345678"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/login", data=login_data)
        print(f"状态码: {response.status_code}")
        
        if response.status_code == 200:
            token = response.json().get('access_token')
            print(f"✅ 登录成功")
            print(f"Token: {token[:50]}...")
            return token
        else:
            print(f"❌ 登录失败: {response.json().get('detail')}")
            return None
    except Exception as e:
        print(f"❌ 请求异常: {e}")
        return None

def test_get_me(token):
    """测试获取当前用户信息"""
    print("\n=== 测试获取当前用户信息 ===")
    
    if not token:
        print("❌ 没有有效的token")
        return
    
    headers = {
        "Authorization": f"Bearer {token}"
    }
    
    try:
        response = requests.get(f"{BASE_URL}/me", headers=headers)
        print(f"状态码: {response.status_code}")
        print(f"响应: {json.dumps(response.json(), indent=2, ensure_ascii=False)}")
        
        if response.status_code == 200:
            print("✅ 获取用户信息成功")
        else:
            print(f"❌ 获取失败: {response.json().get('detail')}")
    except Exception as e:
        print(f"❌ 请求异常: {e}")

def test_update_profile(token):
    """测试更新用户资料"""
    print("\n=== 测试更新用户资料 ===")
    
    if not token:
        print("❌ 没有有效的token")
        return
    
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    profile_data = {
        "full_name": "测试用户",
        "bio": "这是一个测试账户",
        "phone": "13800138000"
    }
    
    try:
        response = requests.put(f"{BASE_URL}/me/profile", json=profile_data, headers=headers)
        print(f"状态码: {response.status_code}")
        print(f"响应: {json.dumps(response.json(), indent=2, ensure_ascii=False)}")
        
        if response.status_code == 200:
            print("✅ 更新资料成功")
        else:
            print(f"❌ 更新失败: {response.json().get('detail')}")
    except Exception as e:
        print(f"❌ 请求异常: {e}")

def test_change_password(token):
    """测试修改密码"""
    print("\n=== 测试修改密码 ===")
    
    if not token:
        print("❌ 没有有效的token")
        return
    
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    password_data = {
        "old_password": "12345678",
        "new_password": "newpass123"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/me/password", json=password_data, headers=headers)
        print(f"状态码: {response.status_code}")
        print(f"响应: {json.dumps(response.json(), indent=2, ensure_ascii=False)}")
        
        if response.status_code == 200:
            print("✅ 修改密码成功")
            
            # 尝试用新密码登录
            print("\n=== 测试新密码登录 ===")
            login_data = {
                "username": "admin",
                "password": "newpass123"
            }
            login_response = requests.post(f"{BASE_URL}/login", data=login_data)
            if login_response.status_code == 200:
                print("✅ 新密码登录成功")
                
                # 恢复原密码
                new_token = login_response.json().get('access_token')
                headers["Authorization"] = f"Bearer {new_token}"
                restore_data = {
                    "old_password": "newpass123",
                    "new_password": "12345678"
                }
                requests.post(f"{BASE_URL}/me/password", json=restore_data, headers=headers)
                print("✅ 已恢复原密码")
            else:
                print("❌ 新密码登录失败")
        else:
            print(f"❌ 修改密码失败: {response.json().get('detail')}")
    except Exception as e:
        print(f"❌ 请求异常: {e}")

def test_duplicate_register():
    """测试重复注册"""
    print("\n=== 测试重复注册 ===")
    
    user_data = {
        "username": "admin",
        "email": "duplicate@example.com",
        "password": "testpass123"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/register", json=user_data)
        print(f"状态码: {response.status_code}")
        print(f"响应: {json.dumps(response.json(), indent=2, ensure_ascii=False)}")
        
        if response.status_code == 400:
            print("✅ 正确拒绝了重复用户名")
        else:
            print("❌ 应该拒绝重复用户名")
    except Exception as e:
        print(f"❌ 请求异常: {e}")

if __name__ == "__main__":
    print("=" * 60)
    print("OpenMTSciEd 认证API测试")
    print("=" * 60)
    
    # 1. 测试注册
    test_register()
    
    # 2. 测试登录
    token = test_login()
    
    # 3. 测试获取用户信息
    if token:
        test_get_me(token)
        
        # 4. 测试更新资料
        test_update_profile(token)
        
        # 5. 测试修改密码
        test_change_password(token)
    
    # 6. 测试重复注册
    test_duplicate_register()
    
    print("\n" + "=" * 60)
    print("测试完成")
    print("=" * 60)
