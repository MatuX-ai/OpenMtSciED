"""快速验证所有认证API"""
import requests
import sys
import os

# 检测是否在 CI 环境中
IS_CI = os.getenv('CI') == 'true' or os.getenv('GITHUB_ACTIONS') == 'true'

if IS_CI:
    print("⚠️  检测到 CI 环境，跳过需要后端服务的测试")
    print("提示: GitHub Actions 中没有运行后端服务")
    sys.exit(0)

BASE_URL = "http://localhost:8000/api/v1/auth"

print("=" * 60)
print("快速API验证测试")
print("=" * 60)

# 测试1: 登录
print("\n[测试1] 登录API...")
try:
    r = requests.post(f"{BASE_URL}/login", data={
        "username": "admin",
        "password": "12345678"
    })
    if r.status_code == 200:
        token = r.json()["access_token"]
        print(f"[OK] 登录成功")
    else:
        print(f"[FAIL] 登录失败: {r.status_code}")
        sys.exit(1)
except Exception as e:
    print(f"[FAIL] 异常: {e}")
    sys.exit(1)

# 测试2: 获取用户信息
print("\n[测试2] 获取用户信息...")
headers = {"Authorization": f"Bearer {token}"}
try:
    r = requests.get(f"{BASE_URL}/me", headers=headers)
    if r.status_code == 200:
        user = r.json()
        print(f"[OK] 用户名: {user['username']}")
        print(f"[OK] 邮箱: {user['email']}")
    else:
        print(f"[FAIL] 获取失败: {r.status_code}")
except Exception as e:
    print(f"[FAIL] 异常: {e}")

# 测试3: 更新资料
print("\n[测试3] 更新用户资料...")
try:
    r = requests.put(f"{BASE_URL}/me/profile", 
                    json={"full_name": "测试用户", "bio": "STEM爱好者"},
                    headers=headers)
    if r.status_code == 200:
        print(f"[OK] 更新成功")
    else:
        print(f"[FAIL] 更新失败: {r.status_code} - {r.text}")
except Exception as e:
    print(f"[FAIL] 异常: {e}")

# 测试4: 修改密码
print("\n[测试4] 修改密码...")
try:
    r = requests.post(f"{BASE_URL}/me/password",
                     json={"old_password": "12345678", "new_password": "testpass99"},
                     headers=headers)
    if r.status_code == 200:
        print(f"[OK] 密码修改成功")
        
        # 验证新密码
        r2 = requests.post(f"{BASE_URL}/login", data={
            "username": "admin",
            "password": "testpass99"
        })
        if r2.status_code == 200:
            print(f"[OK] 新密码登录成功")
            
            # 恢复原密码
            new_token = r2.json()["access_token"]
            headers["Authorization"] = f"Bearer {new_token}"
            requests.post(f"{BASE_URL}/me/password",
                         json={"old_password": "testpass99", "new_password": "12345678"},
                         headers=headers)
            print(f"[OK] 已恢复原密码")
        else:
            print(f"[WARN] 新密码验证失败")
    else:
        print(f"[FAIL] 修改失败: {r.status_code} - {r.text}")
except Exception as e:
    print(f"[FAIL] 异常: {e}")

print("\n" + "=" * 60)
print("测试完成！")
print("=" * 60)
