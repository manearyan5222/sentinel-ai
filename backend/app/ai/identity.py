import random

class IdentityMatcher:
    def __init__(self):
        pass

    def match_identity(self, track_id, camera_is_restricted, db_session=None):
        """
        Matches track_id against authorized residents & expected visitors.
        Returns:
            identity_type: 'RESIDENT' | 'EXPECTED_VISITOR' | 'CONTRACTOR' | 'UNRECOGNIZED'
            person_name: str
            confidence: float
        """
        # For restricted zone, simulate unrecognized subject flagging
        if camera_is_restricted:
            return {
                "identity_type": "UNRECOGNIZED",
                "person_name": f"Unrecognized Subject ({track_id})",
                "person_id": None,
                "confidence": 0.92,
            }
        
        # Consistent hash-based mock matching for demo stability
        hash_val = hash(track_id) % 100
        if hash_val < 50:
            return {
                "identity_type": "RESIDENT",
                "person_name": "Dr. Sarah Jenkins",
                "person_id": "p-01",
                "confidence": 0.96,
            }
        elif hash_val < 75:
            return {
                "identity_type": "EXPECTED_VISITOR",
                "person_name": "Robert Chen (Visitor)",
                "person_id": "v-01",
                "confidence": 0.89,
            }
        else:
            return {
                "identity_type": "UNRECOGNIZED",
                "person_name": f"Unrecognized Subject ({track_id})",
                "person_id": None,
                "confidence": 0.88,
            }

identity_matcher = IdentityMatcher()
