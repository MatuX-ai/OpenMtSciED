#!/usr/bin/env python3
"""
OpenMTSciEd 快速健康检查脚本
用于日常快速验证系统状态
"""

import requests
import sys
import os
import pytest
from datetime import datetime

# 检测 CI 环境
IS_CI = os.getenv('CI') == 'true' or os.getenv('GITHUB_ACTIONS') == 'true'

BASE_URL = os.getenv("API_BASE_URL", "http://localhost:8000")

def print_header(title):
    print("\n" + "=" * 60)
    print(f"  {title}")
    print("=" * 60)

def check_service(name, url, expected_status=200):
    """检查服务状态"""
    try:
        response = requests.get(url, timeout=5)
        if response.status_code == expected_status:
            print(f"✅ {name}: 正常 (HTTP {response.status_code})")
            return True
        else:
            print(f"❌ {name}: 异常 (HTTP {response.status_code})")
            return False
    except Exception as e:
        print(f"❌ {name}: 无法连接 - {str(e)}")
        return False

def main():
    print("=" * 60)
    print("  OpenMTSciEd 快速健康检查")
    print(f"  时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 60)
    
    results = []
    
    # 1. 后端 API
    print_header("后端服务")
    results.append(check_service("根路径", f"{BASE_URL}/"))
    results.append(check_service("健康检查", f"{BASE_URL}/health"))
    
    # 2. 前端页面
    print_header("前端页面")
    frontend_urls = [
        ("营销首页", "http://localhost:3000/index.html"),
        ("学习仪表盘", "http://localhost:3000/dashboard.html"),
        ("个人中心", "http://localhost:3000/profile.html"),
    ]
    for name, url in frontend_urls:
        results.append(check_service(name, url))
    
    # 3. 管理后台
    print_header("管理后台")
    results.append(check_service("Admin登录", "http://localhost:4200/login"))
    
    # 汇总
    print_header("检查结果汇总")
    total = len(results)
    passed = sum(results)
    failed = total - passed
    
    print(f"总检查项: {total}")
    print(f"通过: {passed} ✅")
    print(f"失败: {failed} ❌")
    
    if failed == 0:
        print("\n🟢 所有服务正常运行！")
        return 0
    elif failed <= 2:
        print(f"\n🟡 有 {failed} 个服务异常，建议检查")
        return 1
    else:
        print(f"\n🔴 有 {failed} 个服务异常，需要立即处理！")
        return 2

@pytest.mark.skipif(IS_CI, reason="CI 环境，跳过健康检查")
def test_quick_health_check():
    """pytest 测试入口"""
    result = main()
    assert result == 0, f"健康检查失败，返回码: {result}"
