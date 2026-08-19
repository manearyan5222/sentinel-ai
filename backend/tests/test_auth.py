import pytest
import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from app.core.auth import hash_password, verify_password, create_access_token, decode_token

def test_password_hashing_and_verification():
    raw = "SecurityPass2026!"
    hashed = hash_password(raw)
    assert hashed != raw
    assert verify_password(raw, hashed) is True
    assert verify_password("WrongPassword", hashed) is False

def test_jwt_token_creation_and_decoding():
    token = create_access_token(user_id="usr-123", username="guard1", role="GUARD")
    payload = decode_token(token)
    assert payload is not None
    assert payload["sub"] == "usr-123"
    assert payload["username"] == "guard1"
    assert payload["role"] == "GUARD"
