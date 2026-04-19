"""
测试 Supabase API 连接
"""
import os
from dotenv import load_dotenv
import requests

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_ANON_KEY")

print("=" * 60)
print("Supabase API 连接测试")
print("=" * 60)

print(f"\n项目URL: {SUPABASE_URL}")

# 测试 REST API
try:
    url = f"{SUPABASE_URL}/rest/v1/"
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
    }
    response = requests.get(url, headers=headers, timeout=10)
    print(f"\n✓ Supabase REST API 可访问")
    print(f"  状态码: {response.status_code}")
except Exception as e:
    print(f"\n✗ Supabase REST API 连接失败: {str(e)}")

# 测试 GraphQL API
try:
    url = f"{SUPABASE_URL}/graphql/v1"
    response = requests.post(url, headers=headers, json={"query": "{ __typename }"}, timeout=10)
    print(f"\n✓ Supabase GraphQL API 可访问")
    print(f"  状态码: {response.status_code}")
except Exception as e:
    print(f"\n✗ Supabase GraphQL API 连接失败: {str(e)}")

print("\n" + "=" * 60)
print("测试完成")
print("=" * 60)
