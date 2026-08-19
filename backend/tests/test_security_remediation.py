import pytest
import sys
import os
import time
from fastapi.testclient import TestClient
from fastapi import HTTPException

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from app.main import app
from app.config import settings, Settings
from app.core.security_validation import validate_camera_source, is_private_or_local_host
from app.core.auth import create_access_token, decode_token, get_current_user
from app.database.session import SessionLocal
from app.models.user import User

client = TestClient(app)

# =====================================================================
# 1. SSRF & CAMERA SOURCE VALIDATION TESTS (SEC-M02)
# =====================================================================

def test_allowed_rtsp_url():
    is_valid, msg = validate_camera_source("rtsp://camera.example.com:554/live", stream_type="RTSP")
    assert is_valid is True
    assert "Valid" in msg

def test_allowed_https_url():
    is_valid, msg = validate_camera_source("https://streams.example.com/hls/feed.m3u8", stream_type="RTSP")
    assert is_valid is True
    assert "Valid" in msg

def test_blocked_localhost():
    is_valid, msg = validate_camera_source("http://localhost:8000/api/secret", stream_type="RTSP")
    assert is_valid is False
    assert "localhost" in msg.lower() or "blocked" in msg.lower()

def test_blocked_127_0_0_1():
    is_valid, msg = validate_camera_source("rtsp://127.0.0.1:554/live", stream_type="RTSP")
    assert is_valid is False
    assert "127.0.0.1" in msg or "blocked" in msg.lower()

def test_blocked_169_254_metadata():
    is_valid, msg = validate_camera_source("http://169.254.169.254/latest/meta-data/", stream_type="RTSP")
    assert is_valid is False
    assert "169.254" in msg or "blocked" in msg.lower()

def test_blocked_file_scheme():
    is_valid, msg = validate_camera_source("file:///etc/passwd", stream_type="RTSP")
    assert is_valid is False
    assert "prohibited" in msg.lower() or "file://" in msg.lower()

def test_allowed_demo_sample_data_in_demo_mode():
    is_valid, msg = validate_camera_source("../sample_data/demo_security.mp4", stream_type="DEMO", demo_mode=True)
    assert is_valid is True
    assert "Valid demo sample video" in msg

def test_blocked_demo_sample_data_outside_demo_mode():
    is_valid, msg = validate_camera_source("../sample_data/demo_security.mp4", stream_type="DEMO", demo_mode=False)
    assert is_valid is False
    assert "only permitted in DEMO_MODE" in msg

def test_blocked_directory_traversal_demo_path():
    is_valid, msg = validate_camera_source("../../../../Windows/System32/calc.exe", stream_type="DEMO", demo_mode=True)
    assert is_valid is False

# =====================================================================
# 2. WEBSOCKET AUTHENTICATION TESTS (SEC-L01)
# =====================================================================

def test_websocket_valid_token():
    db = SessionLocal()
    try:
        user = db.query(User).first()
        if not user:
            user = User(id="usr-test-ws", username="test_guard", email="guard@sentinel.ai", hashed_password="x", role="GUARD", is_active=True)
            db.add(user)
            db.commit()
            db.refresh(user)
        token = create_access_token(user_id=user.id, username=user.username, role=user.role)
    finally:
        db.close()

    with client.websocket_connect(f"/ws/alerts?token={token}") as ws:
        assert ws is not None


def test_websocket_invalid_token():
    with pytest.raises(Exception):
        with client.websocket_connect("/ws/alerts?token=invalid.tampered.token") as ws:
            ws.receive_text()

def test_websocket_expired_token():
    expired_token = create_access_token(user_id="usr-test", username="guard_test", role="GUARD", expires_delta_seconds=-100)
    with pytest.raises(Exception):
        with client.websocket_connect(f"/ws/alerts?token={expired_token}") as ws:
            ws.receive_text()

def test_websocket_missing_token_production_mode(monkeypatch):
    monkeypatch.setattr(settings, "DEMO_MODE", False)
    with pytest.raises(Exception):
        with client.websocket_connect("/ws/alerts") as ws:
            ws.receive_text()

# =====================================================================
# 3. DEMO_MODE ISOLATION & JWT SECRET (SEC-M01 & DEMO ISOLATION)
# =====================================================================

def test_secret_key_missing_production_mode_fails_safely():
    test_settings = Settings()
    test_settings._raw_secret_key = ""
    test_settings.DEMO_MODE = False
    
    with pytest.raises(RuntimeError) as exc_info:
        _ = test_settings.SECRET_KEY
    assert "CRITICAL SECURITY CONFIGURATION ERROR" in str(exc_info.value)

def test_secret_key_missing_demo_mode_uses_safe_demo_key():
    test_settings = Settings()
    test_settings._raw_secret_key = ""
    test_settings.DEMO_MODE = True
    assert "demo" in test_settings.SECRET_KEY.lower()

def test_auth_fallback_rejected_when_demo_mode_false(monkeypatch):
    monkeypatch.setattr(settings, "DEMO_MODE", False)
    db = SessionLocal()
    try:
        with pytest.raises(HTTPException) as exc:
            get_current_user(auth=None, db=db)
        assert exc.value.status_code == 401
    finally:
        db.close()
