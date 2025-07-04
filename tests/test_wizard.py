"""
Tests for PMS Integration Wizard functionality
"""

import pytest
import json
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_analyze_message_format():
    """Test message format analysis"""
    sample_availability = {
        "hotel_id": "123",
        "room_type": "KING",
        "available": True,
        "booking_limit": 10,
        "start_date": "2025-01-01",
        "end_date": "2025-01-31"
    }
    
    sample_rate = {
        "hotel_id": "123",
        "room_type": "KING",
        "rate": 100.00,
        "currency": "USD",
        "start_date": "2025-01-01",
        "end_date": "2025-01-31"
    }
    
    response = client.post("/api/v1/wizard/analyze", json={
        "pms_code": "testpms",
        "availability_message": json.dumps(sample_availability),
        "rate_message": json.dumps(sample_rate),
        "message_format": "json"
    })
    
    assert response.status_code == 200
    data = response.json()
    
    # Check that mappings were generated
    assert "availability_mappings" in data
    assert "rate_mappings" in data
    assert "unmapped_fields" in data
    
    # Check specific mappings
    availability_mappings = data["availability_mappings"]
    assert "hotel_id" in availability_mappings
    assert availability_mappings["hotel_id"] == "HotelCode"
    assert "room_type" in availability_mappings
    assert availability_mappings["room_type"] == "InvCode"

def test_generate_code():
    """Test code generation"""
    availability_mappings = {
        "hotel_id": "HotelCode",
        "room_type": "InvCode",
        "available": "Status"
    }
    
    rate_mappings = {
        "hotel_id": "HotelCode",
        "room_type": "InvCode",
        "rate": "AmountBeforeTax"
    }
    
    response = client.post("/api/v1/wizard/generate", json={
        "pms_code": "testpms",
        "pms_name": "Test PMS",
        "availability_mappings": availability_mappings,
        "rate_mappings": rate_mappings,
        "custom_conversions": {},
        "message_format": "json"
    })
    
    assert response.status_code == 200
    data = response.json()
    
    # Check that code was generated
    assert "translator_code" in data
    assert "mapping_yaml" in data
    
    # Check translator code contains expected elements
    translator_code = data["translator_code"]
    assert "class TestpmsPMSTranslator" in translator_code
    assert "@register_translator" in translator_code
    assert "translate_availability" in translator_code
    assert "translate_rate" in translator_code
    
    # Check mapping YAML contains expected elements
    mapping_yaml = data["mapping_yaml"]
    assert "testpms" in mapping_yaml
    assert "availability:" in mapping_yaml
    assert "rate:" in mapping_yaml

def test_analyze_invalid_message():
    """Test analysis with invalid message format"""
    response = client.post("/api/v1/wizard/analyze", json={
        "pms_code": "testpms",
        "availability_message": "invalid json",
        "rate_message": "invalid json",
        "message_format": "json"
    })
    
    # Should handle gracefully and return empty mappings
    assert response.status_code == 200
    data = response.json()
    assert "availability_mappings" in data
    assert "rate_mappings" in data

def test_generate_missing_required_fields():
    """Test code generation with missing required fields"""
    response = client.post("/api/v1/wizard/generate", json={
        "pms_code": "",
        "pms_name": "",
        "availability_mappings": {},
        "rate_mappings": {},
        "custom_conversions": {},
        "message_format": "json"
    })
    
    assert response.status_code == 400
    assert "PMS code and name are required" in response.json()["detail"] 