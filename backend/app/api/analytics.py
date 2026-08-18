from fastapi import APIRouter

router = APIRouter()

@router.get("/analytics")
def get_analytics():
    return {
        "hourly_risk": [
            {"hour": "00:00", "avg_score": 12, "alert_count": 0},
            {"hour": "04:00", "avg_score": 18, "alert_count": 1},
            {"hour": "08:00", "avg_score": 45, "alert_count": 4},
            {"hour": "12:00", "avg_score": 30, "alert_count": 2},
            {"hour": "16:00", "avg_score": 55, "alert_count": 6},
            {"hour": "20:00", "avg_score": 72, "alert_count": 8},
        ],
        "zone_breakdown": [
            {"zone": "Restricted Boundary", "count": 18},
            {"zone": "North Gate Access", "count": 12},
            {"zone": "Building A Reception", "count": 5},
            {"zone": "Amenities Area", "count": 3},
        ],
        "identity_distribution": [
            {"type": "RESIDENT", "count": 85},
            {"type": "EXPECTED_VISITOR", "count": 34},
            {"type": "CONTRACTOR", "count": 14},
            {"type": "UNRECOGNIZED", "count": 22},
        ],
        "resolution_stats": [
            {"status": "LEGITIMATE", "count": 24},
            {"status": "ESCALATED", "count": 5},
            {"status": "RESOLVED", "count": 11},
        ],
    }
