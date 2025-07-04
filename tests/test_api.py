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

def test_list_mappings():
    response = client.get("/api/v1/mappings")
    assert response.status_code == 200
    data = response.json()
    assert "mappings" in data
    assert isinstance(data["mappings"], list)

def test_register_and_list_pms():
    # Register a new PMS
    pms_code = "testpms"
    pms_name = "Test PMS"
    pms_desc = "Test PMS for integration test"
    response = client.post(
        "/api/v1/pms",
        data={"code": pms_code, "name": pms_name, "description": pms_desc}
    )
    assert response.status_code == 200
    # List PMSs
    response = client.get("/api/v1/pms")
    assert response.status_code == 200
    data = response.json()
    # Accept both list and dict with endpoints
    if isinstance(data, list):
        assert any(p.get("code") == pms_code for p in data)
    elif isinstance(data, dict) and "endpoints" in data:
        assert pms_code in data["endpoints"]

def test_update_and_delete_pms():
    pms_code = "testpms"
    # Update PMS
    response = client.put(
        f"/api/v1/pms/{pms_code}",
        data={"name": "Updated PMS", "description": "Updated desc"}
    )
    assert response.status_code == 200
    # Delete PMS
    response = client.delete(f"/api/v1/pms/{pms_code}")
    assert response.status_code == 200 