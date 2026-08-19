import sys
import os
import pytest
from unittest.mock import MagicMock, patch
import json

# Ensure backend folder is on sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from fastapi.testclient import TestClient
from app.main import app
from app.ai.gemini_service import GeminiService
from app.ai.risk_engine import risk_engine

client = TestClient(app)

# 1. Test Deterministic Risk Engine intact
def test_risk_engine_integrity():
    res = risk_engine.compute_risk(
        identity_type="UNRECOGNIZED",
        is_restricted_zone=True,
        dwell_time_seconds=20,
        has_expected_pass=False
    )
    assert res["risk_score"] > 50
    assert res["risk_level"] in ["MEDIUM", "HIGH", "CRITICAL"]
    assert len(res["risk_reasons"]) > 0


# 2. Test Gemini Service Disabled Mode
def test_gemini_disabled_mode():
    service = GeminiService()
    service.api_key = "" # Unset key
    assert not service.is_enabled()
    status = service.get_status()
    assert status["status"] == "DISABLED"

    # Test explanation fallback
    alert_dict = {
        "id": "alt-test-01",
        "camera_name": "Test Cam",
        "risk_score": 80,
        "risk_level": "HIGH",
        "risk_reasons": ["Unrecognized Person (+25)"]
    }
    explanation = service.explain_alert(alert_dict)
    assert explanation["summary"] is not None
    assert "Fallback" in explanation["uncertainty"]

# 3. Test Gemini API Success Mock
def test_gemini_success_mock():
    service = GeminiService()
    service.api_key = "dummy_key_for_testing"
    service.client = MagicMock()

    mock_json_response = json.dumps({
        "summary": "Mocked AI Summary of test incident.",
        "risk_explanation": "Risk is high due to boundary trespass.",
        "recommended_action": "Verify credentials over radio.",
        "verification_steps": ["Check ID", "Verify clearance"],
        "uncertainty": "Camera distance limitation."
    })

    with patch.object(service, '_call_gemini_raw', return_value=mock_json_response):
        alert_dict = {
            "id": "alt-test-02",
            "camera_name": "Perimeter South",
            "risk_score": 85,
            "risk_level": "HIGH"
        }
        res = service.explain_alert(alert_dict)
        assert res["summary"] == "Mocked AI Summary of test incident."
        assert len(res["verification_steps"]) == 2

# 4. Test Malformed JSON Fallback
def test_gemini_malformed_json_fallback():
    service = GeminiService()
    service.api_key = "dummy_key"
    
    with patch.object(service, '_call_gemini_raw', return_value="INVALID NON-JSON TEXT"):
        alert_dict = {"id": "alt-test-03", "camera_name": "Gate", "risk_score": 60, "risk_level": "ELEVATED"}
        res = service.explain_alert(alert_dict)
        assert "Fallback" in res["uncertainty"]
        assert res["summary"] is not None

# 5. Test AI Status Endpoint
def test_ai_status_endpoint():
    response = client.get("/api/ai/status")
    assert response.status_code == 200
    data = response.json()
    assert "status" in data

# 6. Test Explain Alert REST Endpoint
def test_explain_alert_endpoint():
    payload = {"alert_id": "alt-101", "force_refresh": False}
    response = client.post("/api/ai/explain-alert", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "summary" in data
    assert "recommended_action" in data

# 7. Test AI Chat Assistant Endpoint
def test_ai_chat_endpoint():
    payload = {"message": "Summarize active alerts today"}
    response = client.post("/api/ai/chat", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "answer" in data
