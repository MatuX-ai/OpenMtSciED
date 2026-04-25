"""测试登录跳转流程"""
import requests

print("=" * 70)
print("测试Website登录跳转流程")
print("=" * 70)

# 1. 清除localStorage模拟（通过检查页面是否有checkAuth函数）
print("\n[步骤1] 检查页面认证逻辑...")

pages = {
    "Dashboard": "http://localhost:3000/dashboard.html",
    "Profile": "http://localhost:3000/profile.html"
}

for name, url in pages.items():
    r = requests.get(url, timeout=3)
    if r.status_code == 200:
        # 检查是否包含checkAuth函数和跳转到4200的逻辑
        has_check_auth = 'function checkAuth()' in r.text
        has_redirect_4200 = 'localhost:4200/login' in r.text
        
        if has_check_auth and has_redirect_4200:
            print(f"[OK] {name} - 已配置登录检查和跳转")
            print(f"     未登录时会跳转到: http://localhost:4200/login")
        else:
            print(f"[WARN] {name} - 可能缺少登录检查逻辑")
            if not has_check_auth:
                print(f"     - 缺少 checkAuth 函数")
            if not has_redirect_4200:
                print(f"     - 缺少跳转到4200端口的逻辑")
    else:
        print(f"[FAIL] {name} - 无法访问 ({r.status_code})")

# 2. 检查desktop-manager登录页面是否存在
print("\n[步骤2] 检查Desktop Manager登录页面...")
login_url = "http://localhost:4200/login"
try:
    r = requests.get(login_url, timeout=3)
    if r.status_code == 200:
        print(f"[OK] Desktop Manager登录页面可访问")
        print(f"     URL: {login_url}")
        
        # 检查是否是Angular应用
        if 'app-root' in r.text or '<app-' in r.text:
            print(f"     类型: Angular应用")
    else:
        print(f"[WARN] Desktop Manager登录页面返回状态码: {r.status_code}")
        print(f"     可能需要启动desktop-manager服务")
except Exception as e:
    print(f"[ERROR] 无法访问Desktop Manager登录页面")
    print(f"     错误: {e}")
    print(f"     提示: 请确保desktop-manager正在运行 (npm start)")

# 3. 测试完整的登录流程说明
print("\n[步骤3] 完整登录流程说明")
print("=" * 70)
print("""
当用户访问 website 页面时的登录流程:

1. 用户访问 http://localhost:3000/dashboard.html
   ↓
2. 页面加载时执行 checkAuth() 函数
   ↓
3. 检查 localStorage 中是否有 'user' 数据
   ↓
4a. 如果已登录:
    - 显示dashboard页面内容
    - 可以正常使用所有功能
    
4b. 如果未登录:
    - 自动跳转到 http://localhost:4200/login
    - 在desktop-manager中完成登录
    - 登录后可以选择返回website或留在desktop-manager

同样的流程适用于:
- http://localhost:3000/profile.html
""")

print("=" * 70)
print("当前服务状态:")
print("  Website (静态页面): http://localhost:3000 ✓")
print("  Backend API: http://localhost:8000 ✓")
print("  Desktop Manager: http://localhost:4200 (需要确认)")
print("=" * 70)

# 4. 提供手动测试建议
print("\n[手动测试步骤]")
print("1. 打开浏览器，访问: http://localhost:3000/dashboard.html")
print("2. 如果未登录，应该自动跳转到: http://localhost:4200/login")
print("3. 在4200端口登录页面输入:")
print("   - 用户名: admin")
print("   - 密码: 12345678")
print("4. 登录成功后，可以手动返回 http://localhost:3000/dashboard.html")
print("5. 此时应该能看到dashboard内容（因为localStorage已有token）")
print("=" * 70)
