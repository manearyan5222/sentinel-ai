from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel, ConfigDict
from typing import List, Optional, Any, Dict
from datetime import datetime
import uuid
from app.database.session import get_db
from app.models.alert import Alert
from app.models.audit import AuditLog

router = APIRouter()

class AlertStatusUpdate(BaseModel):
    status: str # NEW, ACKNOWLEDGED, INVESTIGATING, RESOLVED, FALSE_POSITIVE, LEGITIMATE, ESCALATED
    guard_notes: Optional[str] = None
    assigned_user_id: Optional[str] = None

class AlertAssignRequest(BaseModel):
    assigned_user_id: str

class AlertResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    event_id: str
    camera_id: str
    risk_score: int
    risk_level: str
    severity: str
    risk_reasons: List[str]
    entity_label: str
    identity_type: str
    dwell_time_seconds: int
    status: str
    assigned_user_id: Optional[str] = None
    guard_notes: Optional[str] = None
    created_at: datetime
    acknowledged_at: Optional[datetime] = None
    resolved_at: Optional[datetime] = None
    action_protocol: Dict[str, Any]
    snapshot_url: Optional[str] = None
    ai_summary: Optional[str] = None
    ai_risk_explanation: Optional[str] = None
    ai_recommended_action: Optional[str] = None
    ai_verification_steps: Optional[List[str]] = None
    ai_uncertainty: Optional[str] = None
    ai_generated_at: Optional[datetime] = None

@router.get("/alerts", response_model=List[AlertResponse])
def get_alerts(
    status: Optional[str] = None,
    severity: Optional[str] = None,
    camera_id: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Retrieves all security alerts with optional status/severity filtering."""
    query = db.query(Alert).order_by(Alert.created_at.desc())
    if status:
        query = query.filter(Alert.status == status.upper())
    if severity:
        query = query.filter(Alert.severity == severity.upper())
    if camera_id:
        query = query.filter(Alert.camera_id == camera_id)
    
    alerts = query.all()
    if not alerts and not status and not camera_id:
        # Return fallback seeded alerts if database is freshly initialized
        return [
            Alert(
                id="alt-101",
                event_id="evt-801",
                camera_id="cam-02",
                risk_score=85,
                risk_level="HIGH",
                severity="HIGH",
                risk_reasons=[
                    "Unrecognized Person (+25)",
                    "Restricted Zone Violation (+30)",
                    "Extended Dwell Time 24s (+15)",
                    "No Active Visitor Reg (+15)",
                ],
                entity_label="Track #0104 (Unrecognized)",
                identity_type="UNRECOGNIZED",
                dwell_time_seconds=24,
                status="NEW",
                created_at=datetime.utcnow(),
                action_protocol={
                    "who": "Unrecognized Subject (Track #0104)",
                    "where": "Perimeter Fence South (Restricted Zone)",
                    "when": "Just now",
                    "what": "Person loitering near restricted fence boundary for 24s",
                    "why": [
                        "No matching face/embedding in Resident DB",
                        "Boundary zone marked strict restricted",
                        "Extended dwell duration exceeds threshold",
                    ],
                    "recommended_action": "Dispatch patrol guard to verify identity or escort off premises.",
                },
            ),
            Alert(
                id="alt-102",
                event_id="evt-802",
                camera_id="cam-01",
                risk_score=60,
                risk_level="ELEVATED",
                severity="MEDIUM",
                risk_reasons=["Unrecognized Person (+25)", "No Active Visitor Reg (+20)", "Night Access (+15)"],
                entity_label="Track #0109 (Delivery Driver)",
                identity_type="UNRECOGNIZED",
                dwell_time_seconds=12,
                status="NEW",
                created_at=datetime.utcnow(),
                action_protocol={
                    "who": "Unrecognized Individual",
                    "where": "Main Gate Access",
                    "when": "5 minutes ago",
                    "what": "Individual approaching intercom without pre-registered QR code",
                    "why": ["Unrecognized face ID", "No expected visitor pass for Unit 402"],
                    "recommended_action": "Verify driver ID over intercom before granting gate open.",
                },
            ),
        ]
    return alerts

@router.get("/alerts/{alert_id}", response_model=AlertResponse)
def get_alert(alert_id: str, db: Session = Depends(get_db)):
    """Retrieves detailed alert metadata."""
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found.")
    return alert

@router.patch("/alerts/{alert_id}/status", response_model=AlertResponse)
def update_alert_status(alert_id: str, payload: AlertStatusUpdate, db: Session = Depends(get_db)):
    """Transitions alert triage status and creates audit log entry."""
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found.")
    
    prev_status = alert.status
    alert.status = payload.status.upper()
    
    if payload.guard_notes:
        alert.guard_notes = payload.guard_notes
    if payload.assigned_user_id:
        alert.assigned_user_id = payload.assigned_user_id

    now = datetime.utcnow()
    if payload.status.upper() == "ACKNOWLEDGED" and not alert.acknowledged_at:
        alert.acknowledged_at = now
    elif payload.status.upper() in ["RESOLVED", "FALSE_POSITIVE", "LEGITIMATE", "ESCALATED"]:
        alert.resolved_at = now

    audit = AuditLog(
        id=f"aud-{uuid.uuid4().hex[:8]}",
        action="ALERT_STATUS_UPDATE",
        resource_type="ALERT",
        resource_id=alert.id,
        details={"from": prev_status, "to": alert.status, "guard_notes": payload.guard_notes}
    )
    db.add(audit)
    db.commit()
    db.refresh(alert)
    return alert

@router.post("/alerts/{alert_id}/assign", response_model=AlertResponse)
def assign_alert(alert_id: str, payload: AlertAssignRequest, db: Session = Depends(get_db)):
    """Assigns an alert to a specific security guard."""
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found.")

    alert.assigned_user_id = payload.assigned_user_id
    audit = AuditLog(
        id=f"aud-{uuid.uuid4().hex[:8]}",
        action="ALERT_ASSIGN",
        resource_type="ALERT",
        resource_id=alert.id,
        details={"assigned_to": payload.assigned_user_id}
    )
    db.add(audit)
    db.commit()
    db.refresh(alert)
    return alert
