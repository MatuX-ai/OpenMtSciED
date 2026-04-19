"""
测试登录和获取用户资料
"""
import requests
import json

BASE_URL = "http://localhost:8000/api/v1"

def test_login():
    """测试用户登录"""
    print("=" * 60)
    print("测试: 用户登录")
    print("=" * 60)
    
    login_data = {
        "username": "testuser",
        "password": "TestPass123"
    }
    
    print(f"\n请求数据: {json.dumps(login_data, indent=2)}")
    
    try:
        response = requests.post(
            f"{BASE_URL}/auth/token",
            data=login_data
        )
        print(f"\n状态码: {response.status_code}")
        
        if response.status_code == 200:
            token_data = response.json()
            print(f"响应: {json.dumps(token_data, indent=2, ensure_ascii=False)}")
            print("\n✅ 登录成功！")
            return token_data.get("access_token")
        else:
            print(f"响应: {response.text}")
            print(f"\n❌ 登录失败")
            return None
    except Exception as e:
        print(f"\n❌ 请求异常: {e}")
        return None

def test_get_profile(token):
    """测试获取用户资料"""
    print("\n" + "=" * 60)
    print("测试: 获取用户资料")
    print("=" * 60)
    
    headers = {
        "Authorization": f"Bearer {token}"
    }
    
    try:
        response = requests.get(f"{BASE_URL}/auth/me", headers=headers)
        print(f"\n状态码: {response.status_code}")
        
        if response.status_code == 200:
            user_info = response.json()
            print(f"响应: {json.dumps(user_info, indent=2, ensure_ascii=False)}")
            print("\n✅ 获取资料成功！")
            return user_info
        else:
            print(f"响应: {response.text}")
            print(f"\n❌ 获取资料失败")
            return None
    except Exception as e:
        print(f"\n❌ 请求异常: {e}")
        return None

if __name__ == "__main__":
    print("\n🚀 开始测试登录和用户资料 API\n")
    
    # 测试登录
    token = test_login()
    
    if token:
        # 测试获取资料
        test_get_profile(token)
    
    print("\n" + "=" * 60)
    print("测试完成")
    print("=" * 60)
