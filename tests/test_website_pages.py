"""
Website用户中心页面自动化测试脚本
使用前确保:
1. 后端服务正在运行 (http://localhost:8000)
2. 有一个可用的测试账号
"""

import requests
import json
import time
import os
import pytest

# 检测 CI 环境
IS_CI = os.getenv('CI') == 'true' or os.getenv('GITHUB_ACTIONS') == 'true'

BASE_URL = "http://localhost:8000/api/v1/auth"

def _login():
    """辅助函数：登录并返回token"""
    login_data = {"username": "admin", "password": "12345678"}
    try:
        response = requests.post(f"{BASE_URL}/login", data=login_data)
        if response.status_code == 200:
            return response.json().get('access_token')
    except Exception:
        pass
    return None

@pytest.mark.skipif(IS_CI, reason="CI 环境，跳过需要后端服务的测试")
def test_get_profile():
    """测试获取用户信息"""
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
        "bio": "STEM教育爱好者",
        "phone": "13800138000",
        "location": "北京",
        "website": "https://example.com"
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

def test_html_files_exist():
    """测试HTML文件是否存在"""
    print("\n=== 测试5: HTML文件存在性 ===")
    
    import os
    
    files_to_check = [
        "g:/OpenMTSciEd/website/dashboard.html",
        "g:/OpenMTSciEd/website/profile.html",
        "g:/OpenMTSciEd/website/index.html",
        "g:/OpenMTSciEd/website/js/navbar.js"
    ]
    
    all_exist = True
    for file_path in files_to_check:
        if os.path.exists(file_path):
            size = os.path.getsize(file_path)
            print(f"[OK] {os.path.basename(file_path)} ({size} bytes)")
        else:
            print(f"[FAIL] {file_path} 不存在")
            all_exist = False
    
    return all_exist

def check_cors_config():
    """检查CORS配置"""
    print("\n=== 测试6: CORS配置检查 ===")
    
    try:
        # 尝试从不同源访问API
        response = requests.options(
            f"{BASE_URL}/me",
            headers={
                "Origin": "http://localhost:3000",
                "Access-Control-Request-Method": "GET"
            }
        )
        
        cors_headers = response.headers
        if 'access-control-allow-origin' in cors_headers:
            allowed_origins = cors_headers['access-control-allow-origin']
            print(f"[OK] CORS配置正常")
            print(f"   允许的源: {allowed_origins}")
            return True
        else:
            print("[WARN]  CORS头未找到，可能存在跨域问题")
            return False
    except Exception as e:
        print(f"[WARN]  无法检查CORS: {e}")
        return False

def main():
    print("=" * 60)
    print("Website用户中心页面 - API自动化测试")
    print("=" * 60)
    
    # 1. 检查HTML文件
    files_ok = test_html_files_exist()
    
    if not files_ok:
        print("\n[FAIL] HTML文件缺失，请先确保文件存在")
        return
    
    # 2. 检查CORS
    cors_ok = check_cors_config()
    
    # 3. 测试认证API
    token = test_auth_api()
    
    if not token:
        print("\n[FAIL] 认证API测试失败，无法继续")
        print("   请确保:")
        print("   1. 后端服务已启动")
        print("   2. SECRET_KEY环境变量已配置")
        print("   3. 测试账号存在 (admin/12345678)")
        return
    
    # 4. 测试获取用户信息
    user = test_get_profile(token)
    
    if not user:
        print("\n[FAIL] 获取用户信息失败")
        return
    
    # 5. 测试更新资料
    update_ok = test_update_profile(token)
    
    # 6. 测试修改密码
    password_ok = test_change_password(token)
    
    # 总结
    print("\n" + "=" * 60)
    print("测试总结")
    print("=" * 60)
    print(f"HTML文件: {'[OK] 通过' if files_ok else '[FAIL] 失败'}")
    print(f"CORS配置: {'[OK] 通过' if cors_ok else '[WARN]  警告'}")
    print(f"认证API: {'[OK] 通过' if token else '[FAIL] 失败'}")
    print(f"获取信息: {'[OK] 通过' if user else '[FAIL] 失败'}")
    print(f"更新资料: {'[OK] 通过' if update_ok else '[FAIL] 失败'}")
    print(f"修改密码: {'[OK] 通过' if password_ok else '[FAIL] 失败'}")
    print("=" * 60)
    
    if all([files_ok, token, user, update_ok, password_ok]):
        print("\n[SUCCESS] 所有测试通过！")
        print("\n下一步:")
        print("1. 在浏览器中打开: http://localhost:3000/dashboard.html")
        print("2. 在浏览器中打开: http://localhost:3000/profile.html")
        print("3. 手动测试页面交互功能")
    else:
        print("\n[WARN]  部分测试失败，请检查上述错误信息")

if __name__ == "__main__":
    main()
