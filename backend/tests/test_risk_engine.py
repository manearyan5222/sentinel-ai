import pytest
import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from app.ai.risk_engine import risk_engine

def test_low_risk_authorized_resident():
    result = risk_engine.compute_risk(
        identity_type="RESIDENT",
        is_restricted_zone=False,
        dwell_time_seconds=5,
        has_expected_pass=True,
        zone_type="LOBBY",
        zone_severity="LOW"
    )
    assert result["risk_score"] < 30
    assert result["risk_level"] == "LOW"

def test_critical_risk_server_room_intrusion():
    result = risk_engine.compute_risk(
        identity_type="UNRECOGNIZED",
        is_restricted_zone=True,
        dwell_time_seconds=32,
        has_expected_pass=False,
        zone_type="SERVER_ROOM",
        zone_severity="CRITICAL",
        hour_of_day=23
    )
    assert result["risk_score"] >= 80
    assert result["risk_level"] == "CRITICAL"
    assert len(result["risk_reasons"]) >= 3
    assert any("Server Room" in r for r in result["risk_reasons"])
    assert any("authorization not found" in r.lower() for r in result["risk_reasons"])

def test_explainable_reasons_presence():
    result = risk_engine.compute_risk(
        identity_type="UNRECOGNIZED",
        is_restricted_zone=True,
        dwell_time_seconds=18,
        has_expected_pass=False,
        zone_type="RESTRICTED",
        zone_severity="HIGH"
    )
    assert isinstance(result["risk_reasons"], list)
    assert len(result["risk_reasons"]) > 0
    assert "breakdown" in result
    assert result["breakdown"]["zone_score"] > 0
    assert result["breakdown"]["authorization_score"] > 0
