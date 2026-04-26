"""最终完整测试 - 自动处理密码状态"""
import requests
import sys
import os
import pytest

# 检测 CI 环境
CI_ENV = os.getenv('CI') == 'true' or os.getenv('GITHUB_ACTIONS') == 'true'

@pytest.mark.skipif(CI_ENV, reason="CI 环境，跳过集成测试")
def test_final_complete():
    BASE_URL = "http://localhost:8000/api/v1/auth"

    print("=" * 70)
    print(" " * 15 + "Web端用户中心 - 最终完整测试")
    print("=" * 70)

    # 尝试多个可能的密码
    possible_passwords = ['12345678', 'testpass99', 'TempPass123', 'admin123']
    current_password = None
    token = None

    print("\n[步骤1] 查找可用密码...")
    for pwd in possible_passwords:
        r = requests.post(f"{BASE_URL}/login", data={
            "username": "admin",
            "password": pwd
        })
        if r.status_code == 200:
            current_password = pwd
            token = r.json()["access_token"]
            print(f"[OK] 找到可用密码: {pwd}")
            break

    if not token:
        print("[FAIL] 无法登录，所有密码都失败")
        assert False, "无法登录"

    headers = {"Authorization": f"Bearer {token}"}

    # 确保使用标准密码
    if current_password != "12345678":
        print(f"\n[步骤2] 恢复标准密码 (12345678)...")
        r = requests.post(f"{BASE_URL}/me/password",
                         json={"old_password": current_password, "new_password": "12345678"},
                         headers=headers)
        if r.status_code == 200:
            print("[OK] 密码已恢复为 12345678")
            current_password = "12345678"
            
            # 重新登录获取新token
            r = requests.post(f"{BASE_URL}/login", data={
                "username": "admin",
                "password": "12345678"
            })
            if r.status_code == 200:
                token = r.json()["access_token"]
                headers = {"Authorization": f"Bearer {token}"}
        else:
            print(f"[WARN] 恢复密码失败: {r.status_code}")

    # 测试1: 获取用户信息
    print("\n[测试1] GET /auth/me - 获取用户信息")
    r = requests.get(f"{BASE_URL}/me", headers=headers)
    if r.status_code == 200:
        user = r.json()
        print(f"  [PASS] 用户名: {user['username']}")
        print(f"  [PASS] 邮箱: {user['email']}")
        print(f"  [PASS] 角色: {user['role']}")
        test1_pass = True
    else:
        print(f"  [FAIL] 状态码: {r.status_code}")
        test1_pass = False

    # 测试2: 更新用户资料
    print("\n[测试2] PUT /auth/me/profile - 更新用户资料")
    profile_data = {
        "full_name": "STEM教育专家",
        "bio": "专注于科学、技术、工程和数学教育创新",
        "phone": "138-0013-8000",
        "location": "北京市海淀区",
        "website": "https://openmtscied.org"
    }
    r = requests.put(f"{BASE_URL}/me/profile", json=profile_data, headers=headers)
    if r.status_code == 200:
        updated = r.json()
        print(f"  [PASS] 资料更新成功")
        print(f"  [PASS] 姓名: {updated.get('full_name', 'N/A')}")
        print(f"  [PASS] 简介: {updated.get('bio', 'N/A')[:30]}...")
        test2_pass = True
    else:
        print(f"  [FAIL] 状态码: {r.status_code}")
        print(f"  [FAIL] 响应: {r.text}")
        test2_pass = False

    # 测试3: 修改密码
    print("\n[测试3] POST /auth/me/password - 修改密码")
    r = requests.post(f"{BASE_URL}/me/password",
                     json={"old_password": "12345678", "new_password": "TestNew99"},
                     headers=headers)
    if r.status_code == 200:
        print(f"  [PASS] 密码修改成功")
        
        # 验证新密码可用
        r2 = requests.post(f"{BASE_URL}/login", data={
            "username": "admin",
            "password": "TestNew99"
        })
        if r2.status_code == 200:
            print(f"  [PASS] 新密码登录验证成功")
            
            # 恢复原密码
            new_token = r2.json()["access_token"]
            headers2 = {"Authorization": f"Bearer {new_token}"}
            
            r3 = requests.post(f"{BASE_URL}/me/password",
                              json={"old_password": "TestNew99", "new_password": "12345678"},
                              headers=headers2)
            if r3.status_code == 200:
                print(f"  [PASS] 已恢复原始密码")
                
                # 最终验证
                r4 = requests.post(f"{BASE_URL}/login", data={
                    "username": "admin",
                    "password": "12345678"
                })
                if r4.status_code == 200:
                    print(f"  [PASS] 最终验证成功")
                    token = r4.json()["access_token"]
                    headers = {"Authorization": f"Bearer {token}"}
                    test3_pass = True
                else:
                    print(f"  [FAIL] 最终验证失败")
                    test3_pass = False
            else:
                print(f"  [FAIL] 恢复密码失败")
                test3_pass = False
        else:
            print(f"  [FAIL] 新密码登录失败")
            test3_pass = False
    else:
        print(f"  [FAIL] 状态码: {r.status_code}")
        print(f"  [FAIL] 响应: {r.text}")
        test3_pass = False

    # 测试4: 验证HTML文件
    print("\n[测试4] 检查前端页面文件")
    files = [
        "g:/OpenMTSciEd/website/dashboard.html",
        "g:/OpenMTSciEd/website/profile.html",
        "g:/OpenMTSciEd/website/index.html"
    ]
    all_exist = True
    for f in files:
        if os.path.exists(f):
            size = os.path.getsize(f)
            print(f"  [PASS] {os.path.basename(f)} ({size:,} bytes)")
        else:
            print(f"  [FAIL] {f} 不存在")
            all_exist = False
    test4_pass = all_exist

    # 总结
    print("\n" + "=" * 70)
    print("测试结果汇总")
    print("=" * 70)
    print(f"  [{'PASS' if test1_pass else 'FAIL'}] 获取用户信息 API")
    print(f"  [{'PASS' if test2_pass else 'FAIL'}] 更新用户资料 API")
    print(f"  [{'PASS' if test3_pass else 'FAIL'}] 修改密码 API")
    print(f"  [{'PASS' if test4_pass else 'FAIL'}] 前端页面文件")
    print("=" * 70)

    all_pass = all([test1_pass, test2_pass, test3_pass, test4_pass])

    if all_pass:
        print("\n  SUCCESS! 所有测试通过!")
        print("\n  当前登录凭证:")
        print(f"    用户名: admin")
        print(f"    密码: 12345678")
        print("\n  可访问的页面:")
        print(f"    http://localhost:3000/dashboard.html")
        print(f"    http://localhost:3000/profile.html")
    else:
        print("\n  WARNING! 部分测试失败，请检查上述错误")
        assert False, "部分测试失败"

    print("=" * 70)
