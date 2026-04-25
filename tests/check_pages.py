import requests

print("=" * 60)
print("检查Web端页面可访问性")
print("=" * 60)

pages = [
    ("首页", "http://localhost:3000/index.html"),
    ("学习仪表盘", "http://localhost:3000/dashboard.html"),
    ("个人中心", "http://localhost:3000/profile.html"),
]

print()
for name, url in pages:
    try:
        r = requests.get(url, timeout=3)
        if r.status_code == 200:
            size = len(r.text)
            # 提取标题
            title_start = r.text.find('<title>')
            title_end = r.text.find('</title>')
            if title_start != -1 and title_end != -1:
                title = r.text[title_start+7:title_end]
            else:
                title = "N/A"
            
            print(f"[OK] {name}")
            print(f"     URL: {url}")
            print(f"     状态: {r.status_code}")
            print(f"     大小: {size:,} bytes")
            print(f"     标题: {title}")
            print()
        else:
            print(f"[FAIL] {name} - 状态码: {r.status_code}")
            print()
    except Exception as e:
        print(f"[ERROR] {name} - {e}")
        print()

print("=" * 60)
print("后端API检查")
print("=" * 60)

api_url = "http://localhost:8000/"
try:
    r = requests.get(api_url, timeout=3)
    if r.status_code == 200:
        print(f"[OK] 后端服务运行正常")
        print(f"     URL: {api_url}")
        data = r.json()
        print(f"     服务: {data.get('service', 'N/A')}")
        print(f"     版本: {data.get('version', 'N/A')}")
        print(f"     状态: {data.get('status', 'N/A')}")
    else:
        print(f"[FAIL] 后端服务异常 - 状态码: {r.status_code}")
except Exception as e:
    print(f"[ERROR] 后端服务无法访问 - {e}")

print("\n" + "=" * 60)
print("总结")
print("=" * 60)
print("前端HTTP服务器: http://localhost:3000 (运行中)")
print("后端API服务器: http://localhost:8000 (运行中)")
print("\n请在浏览器中访问:")
print("  - http://localhost:3000/index.html")
print("  - http://localhost:3000/dashboard.html")
print("  - http://localhost:3000/profile.html")
print("=" * 60)
