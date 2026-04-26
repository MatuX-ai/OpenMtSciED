"""测试认证API功能"""
import requests
import json
import os
import pytest

# 检测 CI 环境
IS_CI = os.getenv('CI') == 'true' or os.getenv('GITHUB_ACTIONS') == 'true'

BASE_URL = "http://localhost:8000/api/v1/auth"

def _login():
    """辅助函数：登录并返回token"""
    login_data = {
        "username": "admin",
        "password": "12345678"
    }
    try:
        response = requests.post(f"{BASE_URL}/login", data=login_data)
        if response.status_code == 200:
            return response.json().get('access_token')
    except Exception:
        pass
    return None

@pytest.mark.skipif(IS_CI, reason="CI 环境，跳过需要后端服务的测试")
def test_get_me():
    """测试获取当前用户信息"""
    token = _login()
    assert token is not None, "无法登录获取token"
    
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(f"{BASE_URL}/me", headers=headers)
    assert response.status_code == 200, f"获取用户信息失败: {response.status_code}"
    user = response.json()
    assert 'username' in user

@pytest.mark.skipif(IS_CI, reason="CI 环境，跳过需要后端服务的测试")
def test_update_profile():
    """测试更新用户资料"""
    token = _login()
    assert token is not None, "无法登录获取token"
    
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    profile_data = {
        "full_name": "测试用户",
        "bio": "这是一个测试账户",
        "phone": "13800138000"
    }
    
    response = requests.put(f"{BASE_URL}/me/profile", json=profile_data, headers=headers)
    assert response.status_code == 200, f"更新资料失败: {response.status_code}"

@pytest.mark.skipif(IS_CI, reason="CI 环境，跳过需要后端服务的测试")
def test_change_password():
    """测试修改密码"""
    token = _login()
    assert token is not None, "无法登录获取token"
    
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    password_data = {
        "old_password": "12345678",
        "new_password": "newpass123"
    }
    
    response = requests.post(f"{BASE_URL}/me/password", json=password_data, headers=headers)
    assert response.status_code == 200, f"修改密码失败: {response.status_code}"
    
    # 恢复原密码
    new_login_data = {"username": "admin", "password": "newpass123"}
    new_response = requests.post(f"{BASE_URL}/login", data=new_login_data)
    if new_response.status_code == 200:
        new_token = new_response.json().get('access_token')
        headers["Authorization"] = f"Bearer {new_token}"
        restore_data = {"old_password": "newpass123", "new_password": "12345678"}
        requests.post(f"{BASE_URL}/me/password", json=restore_data, headers=headers)

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
