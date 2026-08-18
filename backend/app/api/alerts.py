from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.alert import Alert
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

router = APIRouter()

class AlertStatusUpdate(BaseModel):
    status: str # LEGITIMATE | ESCALATED | RESOLVED
    guard_notes: Optional[str] = None

@router.get("/alerts")
def get_alerts(db: Session = Depends(get_db)):
    alerts = db.query(Alert).order_by(Alert.created_at.desc()).all()
    if not alerts:
        # Fallback seeded alerts
        return [
            {
                "id": "alt-101",
                "event_id": "evt-801",
                "camera_id": "cam-02",
                "camera_name": "Perimeter Fence South",
                "location_zone": "Restricted Boundary",
                "risk_score": 85,
                "risk_level": "HIGH",
                "risk_reasons": [
                    "Unrecognized Person (+25)",
                    "Restricted Zone Violation (+30)",
                    "Extended Dwell Time 24s (+15)",
                    "No Active Visitor Reg (+15)",
                ],
                "entity_label": "Track #0104 (Unrecognized)",
                "identity_type": "UNRECOGNIZED",
                "dwell_time_seconds": 24,
                "status": "ACTIVE",
                "created_at": datetime.utcnow().isoformat(),
                "action_protocol": {
                    "who": "Unrecognized Subject (Track #0104)",
                    "where": "Perimeter Fence South (Restricted Zone)",
                    "when": "2 minutes ago",
                    "what": "Person loitering near restricted fence boundary for 24s",
                    "why": [
                        "No matching face/embedding in Resident DB",
                        "Boundary zone marked strict restricted",
                        "Extended dwell duration exceeds threshold",
                    ],
                    "recommended_action": "Dispatch patrol guard to verify identity or escort off premises.",
                },
            },
            {
                "id": "alt-102",
                "event_id": "evt-802",
                "camera_id": "cam-01",
                "camera_name": "Main Gate & Entry",
                "location_zone": "North Gate Access",
                "risk_score": 60,
                "risk_level": "ELEVATED",
                "risk_reasons": ["Unrecognized Person (+25)", "No Active Visitor Reg (+20)", "Night Access (+15)"],
                "entity_label": "Track #0109 (Delivery Driver)",
                "identity_type": "UNRECOGNIZED",
                "dwell_time_seconds": 12,
                "status": "ACTIVE",
                "created_at": datetime.utcnow().isoformat(),
                "action_protocol": {
                    "who": "Unrecognized Individual",
                    "where": "Main Gate Access",
                    "when": "5 minutes ago",
                    "what": "Individual approaching intercom without pre-registered QR code",
                    "why": ["Unrecognized face ID", "No expected visitor pass for Unit 402"],
                    "recommended_action": "Verify driver ID over intercom before granting gate open.",
                },
            },
        ]
    return alerts

@router.patch("/alerts/{alert_id}/status")
def update_alert_status(alert_id: str, payload: AlertStatusUpdate, db: Session = Depends(get_db)):
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        return {"id": alert_id, "status": payload.status, "guard_notes": payload.guard_notes}
    
    alert.status = payload.status
    if payload.guard_notes:
        alert.guard_notes = payload.guard_notes
    alert.resolved_at = datetime.utcnow()
    db.commit()
    db.refresh(alert)
    return alert
