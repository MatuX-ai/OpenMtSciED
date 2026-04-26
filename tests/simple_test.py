import requests
import time
import os
import pytest

# 检测 CI 环境
IS_CI = os.getenv('CI') == 'true' or os.getenv('GITHUB_ACTIONS') == 'true'
BASE = "http://localhost:8000"

@pytest.mark.skipif(IS_CI, reason="CI 环境，跳过需要后端服务的测试")
def test_simple_health_check():
    """测试1: 健康检查"""
    r = requests.get(f"{BASE}/health")
    assert r.status_code == 200, f"健康检查失败: {r.status_code}"

@pytest.mark.skipif(IS_CI, reason="CI 环境，跳过需要后端服务的测试")
def test_simple_login():
    """测试2: 用户登录"""
    r = requests.post(f"{BASE}/api/v1/auth/login", data={"username": "admin", "password": "12345678"})
    assert r.status_code == 200, f"登录失败: {r.status_code}"

@pytest.mark.skipif(IS_CI, reason="CI 环境，跳过需要后端服务的测试")
def test_simple_response_time():
    """测试3: 响应时间"""
    start = time.time()
    r = requests.get(f"{BASE}/health")
    ms = (time.time() - start) * 1000
    assert ms < 1000, f"响应时间过长: {ms:.0f}ms"
