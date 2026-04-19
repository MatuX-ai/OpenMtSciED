"""
测试登录 API
"""
import requests
import json

# 后端地址
BASE_URL = "http://localhost:8000"

def test_login():
    """测试登录接口"""
    url = f"{BASE_URL}/api/v1/auth/token"
    
    # 测试数据
    data = {
        "username": "testorg_admin",
        "password": "admin123"
    }
    
    try:
        response = requests.post(url, data=data)
        print(f"状态码: {response.status_code}")
        print(f"响应内容: {json.dumps(response.json(), indent=2, ensure_ascii=False)}")
        
        if response.status_code == 200:
            print("\n✅ 登录成功！")
            token = response.json().get("access_token")
            return token
        else:
            print(f"\n❌ 登录失败: {response.json().get('detail')}")
            return None
            
    except Exception as e:
        print(f"请求错误: {e}")
        return None

if __name__ == "__main__":
    print("正在测试登录 API...")
    test_login()
