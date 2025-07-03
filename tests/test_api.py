import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_root():
    response = client.get("/")
    assert response.status_code == 200
    assert "RGBridge PMS Integration Platform" in response.json().get("message", "")

def test_pms_endpoint():
    # Adjust PMS code as needed for your test data
    response = client.get("/api/v1/pms/cloudbeds")
    # Acceptable: 200 (if no auth), 401 (if auth required), 404 (if not found)
    assert response.status_code in (200, 401, 404) 