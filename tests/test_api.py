import pytest
from fastapi.testclient import TestClient
from backend.openmtscied.main import app

client = TestClient(app)

def test_root():
    response = client.get("/")
    assert response.status_code == 200
    assert "OpenMTSciEd" in response.json()["service"]

def test_health_check():
    response = client.get("/api/v1/path/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_generate_path():
    # 模拟一个简单的路径生成请求
    payload = {"user_level": "beginner", "subject": "physics"}
    response = client.post("/api/v1/path/generate", json=payload)
    assert response.status_code == 200
    assert "path" in response.json()
