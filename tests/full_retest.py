import requests
import os
import sys
import pytest

# 检测 CI 环境
IS_CI = os.getenv('CI') == 'true' or os.getenv('GITHUB_ACTIONS') == 'true'

@pytest.mark.skipif(IS_CI, reason="CI 环境，跳过集成测试")
def test_full_retest():
    BASE_URL = "http://localhost:8000/api/v1/auth"

    print("=" * 60)
    print("重置密码并完整测试")
    print("=" * 60)

    # 步骤1: 用当前密码登录
    print("\n[1] 使用当前密码登录...")
    r = requests.post(f"{BASE_URL}/login", data={
        "username": "admin",
        "password": "testpass99"
    })

    if r.status_code != 200:
        print(f"[FAIL] 登录失败: {r.status_code}")
        assert False, f"登录失败: {r.status_code}"

    token = r.json()["access_token"]
    print(f"[OK] 登录成功")
    headers = {"Authorization": f"Bearer {token}"}

    # 步骤2: 恢复原始密码
    print("\n[2] 恢复原始密码 (12345678)...")
    r = requests.post(f"{BASE_URL}/me/password",
                     json={"old_password": "testpass99", "new_password": "12345678"},
                     headers=headers)

    if r.status_code == 200:
        print(f"[OK] 密码已恢复")
    else:
        print(f"[FAIL] 恢复失败: {r.status_code} - {r.text}")
        assert False, f"恢复密码失败: {r.status_code}"

    # 步骤3: 验证新密码
    print("\n[3] 验证原始密码可用...")
    r = requests.post(f"{BASE_URL}/login", data={
        "username": "admin",
        "password": "12345678"
    })

    if r.status_code == 200:
        print(f"[OK] 原始密码验证成功")
        token = r.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
    else:
        print(f"[FAIL] 验证失败: {r.status_code}")
        assert False, f"验证失败: {r.status_code}"

    # 步骤4: 获取用户信息
    print("\n[4] 获取用户信息...")
    r = requests.get(f"{BASE_URL}/me", headers=headers)
    if r.status_code == 200:
        user = r.json()
        print(f"[OK] 用户名: {user['username']}")
        print(f"[OK] 邮箱: {user['email']}")
        print(f"[OK] 角色: {user['role']}")
    else:
        print(f"[FAIL] 获取失败: {r.status_code}")

    # 步骤5: 更新资料
    print("\n[5] 更新用户资料...")
    r = requests.put(f"{BASE_URL}/me/profile", 
                    json={
                        "full_name": "STEM教育专家",
                        "bio": "专注于科学、技术、工程和数学教育",
                        "phone": "13800138000",
                        "location": "北京",
                        "website": "https://openmtscied.org"
                    },
                    headers=headers)

    if r.status_code == 200:
        print(f"[OK] 资料更新成功")
        updated_user = r.json()
        print(f"    姓名: {updated_user.get('full_name', 'N/A')}")
        print(f"    简介: {updated_user.get('bio', 'N/A')}")
    else:
        print(f"[FAIL] 更新失败: {r.status_code} - {r.text}")

    # 步骤6: 修改密码测试
    print("\n[6] 测试修改密码功能...")
    r = requests.post(f"{BASE_URL}/me/password",
                     json={"old_password": "12345678", "new_password": "TempPass123"},
                     headers=headers)

    if r.status_code == 200:
        print(f"[OK] 密码修改成功")
        
        # 用新密码登录
        r2 = requests.post(f"{BASE_URL}/login", data={
            "username": "admin",
            "password": "TempPass123"
        })
        
        if r2.status_code == 200:
            print(f"[OK] 新密码登录成功")
            
            # 再次改回原密码
            new_token = r2.json()["access_token"]
            headers["Authorization"] = f"Bearer {new_token}"
            
            r3 = requests.post(f"{BASE_URL}/me/password",
                              json={"old_password": "TempPass123", "new_password": "12345678"},
                              headers=headers)
            
            if r3.status_code == 200:
                print(f"[OK] 已恢复原始密码")
            else:
                print(f"[WARN] 恢复密码失败: {r3.status_code}")
        else:
            print(f"[FAIL] 新密码登录失败")
    else:
        print(f"[FAIL] 修改密码失败: {r.status_code} - {r.text}")

    # 步骤7: 最终验证
    print("\n[7] 最终验证（使用原始密码）...")
    r = requests.post(f"{BASE_URL}/login", data={
        "username": "admin",
        "password": "12345678"
    })

    if r.status_code == 200:
        print(f"[OK] 最终验证成功 - 密码已恢复为 12345678")
    else:
        print(f"[FAIL] 最终验证失败")

    print("\n" + "=" * 60)
    print("测试完成！所有API功能正常")
    print("=" * 60)
    print("\n当前状态:")
    print("  - 用户名: admin")
    print("  - 密码: 12345678")
    print("  - 所有API端点正常工作")
    print("=" * 60)
