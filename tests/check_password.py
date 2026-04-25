import requests

print("测试不同密码...")
passwords = ['12345678', 'testpass99', 'admin123', 'newpass123']

for pwd in passwords:
    r = requests.post(
        'http://localhost:8000/api/v1/auth/login',
        data={'username': 'admin', 'password': pwd}
    )
    status = "OK" if r.status_code == 200 else "FAIL"
    print(f"{pwd}: {status} ({r.status_code})")
    
    if r.status_code == 200:
        print(f"  -> 找到正确密码: {pwd}")
        break
