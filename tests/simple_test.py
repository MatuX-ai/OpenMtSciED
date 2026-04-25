import requests, time
BASE = "http://localhost:8000"

print("测试1: 健康检查")
r = requests.get(f"{BASE}/health")
print(f"  状态: {r.status_code} {'✅' if r.status_code == 200 else '❌'}")

print("\n测试2: 用户登录")
r = requests.post(f"{BASE}/api/v1/auth/login", data={"username": "admin", "password": "12345678"})
print(f"  状态: {r.status_code} {'✅' if r.status_code == 200 else '❌'}")

print("\n测试3: 响应时间")
start = time.time()
r = requests.get(f"{BASE}/health")
ms = (time.time() - start) * 1000
print(f"  耗时: {ms:.0f}ms {'✅' if ms < 200 else '⚠️' if ms < 1000 else '❌'}")

print("\n✅ 核心功能验证完成！")
