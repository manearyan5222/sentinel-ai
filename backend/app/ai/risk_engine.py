class RiskScoringEngine:
    def __init__(self):
        pass

    def compute_risk(self, identity_type, is_restricted_zone, dwell_time_seconds, has_expected_pass=False):
        """
        Computes risk score (0-100) and outputs breakdown reasons & risk level.
        """
        score = 0
        reasons = []

        # Rule 1: Identity status
        if identity_type == "UNRECOGNIZED":
            score += 25
            reasons.append("Unrecognized Person (+25)")
        elif identity_type == "EXPECTED_VISITOR" and not has_expected_pass:
            score += 15
            reasons.append("Unverified Visitor Entry (+15)")

        # Rule 2: Restricted Zone Access
        if is_restricted_zone:
            score += 30
            reasons.append("Restricted Zone Violation (+30)")

        # Rule 3: Extended Dwell Duration
        if dwell_time_seconds > 15:
            score += 15
            reasons.append(f"Extended Dwell Time {dwell_time_seconds}s (+15)")
        elif dwell_time_seconds > 30:
            score += 25
            reasons.append(f"Prolonged Loitering {dwell_time_seconds}s (+25)")

        # Rule 4: No pre-registration pass
        if identity_type == "UNRECOGNIZED" and not has_expected_pass:
            score += 20
            reasons.append("No Visitor Pre-Registration (+20)")

        # Clamp score between 0 and 100
        final_score = min(100, max(0, score))

        # Categorize risk level
        if final_score >= 75:
            level = "HIGH"
        elif final_score >= 50:
            level = "ELEVATED"
        elif final_score >= 30:
            level = "MODERATE"
        else:
            level = "LOW"

        return {
            "risk_score": final_score,
            "risk_level": level,
            "risk_reasons": reasons
        }

risk_engine = RiskScoringEngine()
