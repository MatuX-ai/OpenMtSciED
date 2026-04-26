import sys
import os
import pytest
from pathlib import Path

# 检测 CI 环境
IS_CI = os.getenv('CI') == 'true' or os.getenv('GITHUB_ACTIONS') == 'true'

# 添加项目根目录到Python路径
project_root = Path(__file__).parent.parent
backend_path = project_root / "backend"
sys.path.insert(0, str(backend_path))

try:
    from openmtscied.main import app
    from fastapi.testclient import TestClient
    client = TestClient(app)
    HAS_BACKEND = True
except ImportError:
    HAS_BACKEND = False
    client = None

@pytest.mark.skipif(IS_CI or not HAS_BACKEND, reason="CI 环境或缺少后端模块，跳过测试")
def test_root():
    response = client.get("/")
    assert response.status_code == 200
    assert "OpenMTSciEd" in response.json()["service"]

@pytest.mark.skipif(IS_CI or not HAS_BACKEND, reason="CI 环境或缺少后端模块，跳过测试")
def test_health_check():
    response = client.get("/api/v1/path/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

@pytest.mark.skipif(IS_CI or not HAS_BACKEND, reason="CI 环境或缺少后端模块，跳过测试")
def test_generate_path():
    # 模拟一个简单的路径生成请求
    payload = {"user_level": "beginner", "subject": "physics"}
    response = client.post("/api/v1/path/generate", json=payload)
    assert response.status_code == 200
    assert "path" in response.json()
