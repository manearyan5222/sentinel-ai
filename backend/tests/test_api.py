import pytest
from fastapi.testclient import TestClient
import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from app.main import app

client = TestClient(app)

def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["status"] == "online"

def test_get_cameras():
    response = client.get("/api/cameras")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_get_alerts():
    response = client.get("/api/alerts")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_get_system_status():
    response = client.get("/api/system/status")
    assert response.status_code == 200
    data = response.json()
    assert "ai_device" in data
    assert "active_cameras" in data

def test_get_analytics():
    response = client.get("/api/analytics")
    assert response.status_code == 200
    data = response.json()
    assert "hourly_risk" in data
    assert "risk_distribution" in data

def test_get_visitors():
    response = client.get("/api/visitors/authorized")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_create_expected_visitor():
    payload = {
        "visitor_name": "Alex Morgan",
        "resident_host_name": "Dr. Sarah Jenkins",
        "unit_number": "A-402",
        "purpose": "VISIT",
        "vehicle_number": "CA-8899"
    }
    response = client.post("/api/visitors/expected", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["visitor_name"] == "Alex Morgan"
    assert "pass_id" in data
