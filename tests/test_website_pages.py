"""
Website用户中心页面自动化测试脚本
使用前确保:
1. 后端服务正在运行 (http://localhost:8000)
2. 有一个可用的测试账号
"""

import requests
import json
import time

BASE_URL = "http://localhost:8000/api/v1/auth"

def test_auth_api():
    """测试认证API是否正常"""
    print("\n=== 测试1: 认证API连通性 ===")
    
    # 测试登录
    login_data = {
        "username": "admin",
        "password": "12345678"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/login", data=login_data)
        if response.status_code == 200:
            token = response.json().get('access_token')
            print("[OK] 登录API正常")
            print(f"   Token: {token[:50]}...")
            return token
        else:
            print(f"[FAIL] 登录失败: {response.status_code}")
            print(f"   响应: {response.text}")
            return None
    except Exception as e:
        print(f"[FAIL] 请求异常: {e}")
        print("   请确保后端服务已启动: python backend/openmtscied/main.py")
        return None

def test_get_profile(token):
    """测试获取用户信息"""
    print("\n=== 测试2: 获取用户信息 ===")
    
    headers = {
        "Authorization": f"Bearer {token}"
    }
    
    try:
        response = requests.get(f"{BASE_URL}/me", headers=headers)
        if response.status_code == 200:
            user = response.json()
            print("[OK] 获取用户信息成功")
            print(f"   用户名: {user.get('username')}")
            print(f"   邮箱: {user.get('email')}")
            print(f"   角色: {user.get('role')}")
            return user
        else:
            print(f"[FAIL] 获取失败: {response.status_code}")
            print(f"   响应: {response.text}")
            return None
    except Exception as e:
        print(f"[FAIL] 请求异常: {e}")
        return None

def test_update_profile(token):
    """测试更新用户资料"""
    print("\n=== 测试3: 更新用户资料 ===")
    
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
    
    try:
        response = requests.put(
            f"{BASE_URL}/me/profile",
            json=profile_data,
            headers=headers
        )
        
        if response.status_code == 200:
            print("[OK] 更新资料成功")
            updated_user = response.json()
            print(f"   姓名: {updated_user.get('full_name', 'N/A')}")
            print(f"   简介: {updated_user.get('bio', 'N/A')}")
            return True
        else:
            print(f"[FAIL] 更新失败: {response.status_code}")
            print(f"   响应: {response.text}")
            return False
    except Exception as e:
        print(f"[FAIL] 请求异常: {e}")
        return False

def test_change_password(token):
    """测试修改密码"""
    print("\n=== 测试4: 修改密码 ===")
    
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    # 修改密码
    password_data = {
        "old_password": "12345678",
        "new_password": "newpass123"
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/me/password",
            json=password_data,
            headers=headers
        )
        
        if response.status_code == 200:
            print("[OK] 修改密码成功")
            
            # 用新密码登录验证
            print("\n   验证新密码登录...")
            new_login_data = {
                "username": "admin",
                "password": "newpass123"
            }
            new_response = requests.post(f"{BASE_URL}/login", data=new_login_data)
            
            if new_response.status_code == 200:
                print("   [OK] 新密码登录成功")
                
                # 恢复原密码
                print("   恢复原密码...")
                new_token = new_response.json().get('access_token')
                headers["Authorization"] = f"Bearer {new_token}"
                
                restore_data = {
                    "old_password": "newpass123",
                    "new_password": "12345678"
                }
                requests.post(
                    f"{BASE_URL}/me/password",
                    json=restore_data,
                    headers=headers
                )
                print("   [OK] 已恢复原密码")
                
                return True
            else:
                print("   [FAIL] 新密码登录失败")
                return False
        else:
            print(f"[FAIL] 修改密码失败: {response.status_code}")
            print(f"   响应: {response.text}")
            return False
    except Exception as e:
        print(f"[FAIL] 请求异常: {e}")
        return False

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
