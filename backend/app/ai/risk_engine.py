from datetime import datetime
from typing import Dict, List, Any, Optional

class RiskScoringEngine:
    def __init__(self):
        # Default Configurable Thresholds & Weights
        self.thresholds = {
            "low_max": 29,
            "medium_max": 59,
            "high_max": 79,
            "critical_min": 80
        }
        self.dwell_thresholds = {
            "mild": 10,       # +10 pts
            "elevated": 20,   # +15 pts
            "prolonged": 30   # +25 pts
        }

    def compute_risk(
        self,
        identity_type: str = "UNRECOGNIZED",
        is_restricted_zone: bool = False,
        dwell_time_seconds: int = 0,
        has_expected_pass: bool = False,
        zone_type: str = "RESTRICTED",
        zone_severity: str = "HIGH",
        hour_of_day: Optional[int] = None,
        is_operating_hours: bool = True,
        is_repeated_violation: bool = False,
        pacing_boundary_detected: bool = False
    ) -> Dict[str, Any]:
        """
        Computes structured, explainable contextual risk score (0-100) using weighted scoring:
        risk_score = zone_score + authorization_score + dwell_score + temporal_score + behavior_score
        """
        reasons = []
        breakdown = {
            "zone_score": 0,
            "authorization_score": 0,
            "dwell_score": 0,
            "temporal_score": 0,
            "behavior_score": 0
        }

        # 1. ZONE SEVERITY & RESTRICTION (0 - 35 points)
        if zone_type == "SERVER_ROOM" or zone_severity == "CRITICAL":
            breakdown["zone_score"] = 35
            reasons.append("Entered High-Security Restricted Server Room (+35)")
        elif is_restricted_zone or zone_type == "RESTRICTED" or zone_severity == "HIGH":
            breakdown["zone_score"] = 30
            reasons.append("Restricted Zone Perimeter Violation (+30)")
        elif zone_type == "STAFF_ONLY" or zone_severity == "MEDIUM":
            breakdown["zone_score"] = 15
            reasons.append("Entered Staff-Only Zone without clearance (+15)")
        elif zone_type == "LOBBY":
            breakdown["zone_score"] = 5
            # Low base points for public/lobby entry

        # 2. VISITOR & IDENTITY AUTHORIZATION (0 - 30 points)
        if identity_type == "UNRECOGNIZED" and not has_expected_pass:
            breakdown["authorization_score"] = 25
            reasons.append("Visitor authorization not found (+25)")
        elif identity_type == "EXPECTED_VISITOR" and not has_expected_pass:
            breakdown["authorization_score"] = 15
            reasons.append("Unverified Visitor entry (+15)")
        elif identity_type == "EXPIRED_PASS":
            breakdown["authorization_score"] = 20
            reasons.append("Visitor access pass expired (+20)")
        elif identity_type == "UNAUTHORIZED_ZONE":
            breakdown["authorization_score"] = 20
            reasons.append("Access pass not authorized for this zone (+20)")

        # 3. DWELL DURATION & LOITERING (0 - 25 points)
        if dwell_time_seconds >= self.dwell_thresholds["prolonged"]:
            breakdown["dwell_score"] = 25
            reasons.append(f"Dwell time exceeded {dwell_time_seconds}s prolonged loitering (+25)")
        elif dwell_time_seconds >= self.dwell_thresholds["elevated"]:
            breakdown["dwell_score"] = 15
            reasons.append(f"Dwell time exceeded {dwell_time_seconds}s threshold (+15)")
        elif dwell_time_seconds >= self.dwell_thresholds["mild"]:
            breakdown["dwell_score"] = 10
            reasons.append(f"Extended presence {dwell_time_seconds}s (+10)")

        # 4. TEMPORAL / TIME-OF-DAY SCORE (0 - 15 points)
        if hour_of_day is None:
            hour_of_day = datetime.utcnow().hour

        # Outside operating hours (e.g. 22:00 - 06:00)
        if not is_operating_hours or (hour_of_day >= 22 or hour_of_day < 6):
            if is_restricted_zone or zone_type in ["RESTRICTED", "SERVER_ROOM", "STAFF_ONLY"]:
                breakdown["temporal_score"] = 15
                reasons.append("Event occurred outside normal operating hours (+15)")

        # 5. BEHAVIOR & REPEAT PATTERNS (0 - 15 points)
        if is_repeated_violation:
            breakdown["behavior_score"] = 15
            reasons.append("Repeated boundary violations detected (+15)")
        elif pacing_boundary_detected:
            breakdown["behavior_score"] = 10
            reasons.append("Pacing behavior along property boundary (+10)")

        # Calculate Total Score & Normalize 0 - 100
        raw_score = sum(breakdown.values())
        final_score = min(100, max(0, raw_score))

        # Categorize Severity Level according to exact specifications
        if final_score >= self.thresholds["critical_min"]:
            level = "CRITICAL"
        elif final_score > self.thresholds["medium_max"]:
            level = "HIGH"
        elif final_score > self.thresholds["low_max"]:
            level = "MEDIUM"
        else:
            level = "LOW"

        return {
            "risk_score": final_score,
            "risk_level": level,
            "severity": level,
            "risk_reasons": reasons,
            "breakdown": breakdown
        }

risk_engine = RiskScoringEngine()
