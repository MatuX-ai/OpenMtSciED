"""快速验证修复效果"""
import requests
import time

BASE_URL = "http://localhost:8000"

print("=" * 60)
print("  OpenMTSciEd 修复验证测试")
print("=" * 60)

results = []

# 1. 健康检查
print("\n[1/4] 测试健康检查...")
try:
    r = requests.get(f"{BASE_URL}/health", timeout=5)
    status = "PASS" if r.status_code == 200 else "FAIL"
    results.append(("健康检查", status, f"HTTP {r.status_code}"))
    print(f"  {'✅' if status == 'PASS' else '❌'} 健康检查: {r.status_code}")
except Exception as e:
    results.append(("健康检查", "FAIL", str(e)))
    print(f"  ❌ 健康检查失败: {e}")

# 2. 用户登录
print("\n[2/4] 测试用户登录...")
try:
    r = requests.post(
        f"{BASE_URL}/api/v1/auth/login",
        data={"username": "admin", "password": "12345678"},
        timeout=5
    )
    status = "PASS" if r.status_code == 200 else "FAIL"
    results.append(("用户登录", status, f"HTTP {r.status_code}"))
    print(f"  {'✅' if status == 'PASS' else '❌'} 用户登录: {r.status_code}")
except Exception as e:
    results.append(("用户登录", "FAIL", str(e)))
    print(f"  ❌ 登录失败: {e}")

# 3. 速率限制测试（连续10次登录）
print("\n[3/4] 测试速率限制（10次快速请求）...")
success_count = 0
for i in range(10):
    try:
        r = requests.post(
            f"{BASE_URL}/api/v1/auth/login",
            data={"username": "admin", "password": "wrong"},
            timeout=5
        )
        if r.status_code == 200 or r.status_code == 401:
            success_count += 1
        elif r.status_code == 429:
            print(f"  ⚠️  第{i+1}次请求被限流 (429)")
            break
    except:
        break

status = "PASS" if success_count >= 8 else "WARN"
results.append(("速率限制", status, f"成功{success_count}/10次"))
print(f"  {'✅' if status == 'PASS' else '⚠️'} 速率限制: {success_count}/10 次成功")

# 4. API响应时间
print("\n[4/4] 测试API响应时间...")
try:
    start = time.time()
    r = requests.get(f"{BASE_URL}/health", timeout=5)
    elapsed = (time.time() - start) * 1000
    
    if elapsed < 200:
        status = "PASS"
    elif elapsed < 1000:
        status = "WARN"
    else:
        status = "FAIL"
    
    results.append(("响应时间", status, f"{elapsed:.0f}ms"))
    print(f"  {'✅' if status == 'PASS' else '⚠️' if status == 'WARN' else '❌'} 响应时间: {elapsed:.0f}ms")
except Exception as e:
    results.append(("响应时间", "FAIL", str(e)))
    print(f"  ❌ 响应时间测试失败: {e}")

# 汇总
print("\n" + "=" * 60)
print("  测试结果汇总")
print("=" * 60)

passed = sum(1 for _, s, _ in results if s == "PASS")
total = len(results)

for name, status, detail in results:
    icon = "✅" if status == "PASS" else "⚠️" if status == "WARN" else "❌"
    print(f"{icon} {name:12s} | {status:4s} | {detail}")

print("\n" + "-" * 60)
print(f"总计: {passed}/{total} 通过 ({passed/total*100:.1f}%)")
print("-" * 60)

if passed == total:
    print("\n🎉 所有测试通过！系统已准备好部署。")
elif passed >= total * 0.8:
    print("\n✅ 大部分测试通过，可以部署（有少量警告）。")
else:
    print("\n❌ 测试通过率不足，建议修复后再部署。")
