from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel, ConfigDict
from typing import List, Optional, Any, Dict
from datetime import datetime
import uuid
from app.database.session import get_db
from app.models.incident import Incident, IncidentTimelineEvent
from app.models.audit import AuditLog

router = APIRouter()

class TimelineEventCreate(BaseModel):
    event_type: str
    description: str
    data: Optional[Dict[str, Any]] = {}

class IncidentCreateRequest(BaseModel):
    title: str
    camera_id: str
    alert_id: Optional[str] = None
    severity: Optional[str] = "HIGH"
    risk_score: Optional[int] = 50
    incident_type: Optional[str] = "RESTRICTED_ZONE_VIOLATION"
    summary: str
    ai_summary: Optional[str] = None
    guard_notes: Optional[str] = None
    initial_timeline: Optional[List[TimelineEventCreate]] = []

class IncidentStatusUpdate(BaseModel):
    status: str # OPEN, ACKNOWLEDGED, INVESTIGATING, RESOLVED, FALSE_POSITIVE
    guard_notes: Optional[str] = None
    root_cause: Optional[str] = None
    assigned_to: Optional[str] = None

class TimelineEventResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    incident_id: str
    timestamp: datetime
    event_type: str
    description: str
    data: Optional[Dict[str, Any]] = {}

class IncidentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    title: str
    camera_id: str
    alert_id: Optional[str] = None
    severity: str
    status: str
    assigned_to: Optional[str] = None
    risk_score: int
    incident_type: str
    summary: str
    ai_summary: Optional[str] = None
    root_cause: Optional[str] = None
    guard_notes: Optional[str] = None
    created_at: datetime
    acknowledged_at: Optional[datetime] = None
    resolved_at: Optional[datetime] = None

@router.get("/incidents", response_model=List[IncidentResponse])
def get_incidents(
    status: Optional[str] = None,
    severity: Optional[str] = None,
    camera_id: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Lists security incidents with optional filtering."""
    query = db.query(Incident).order_by(Incident.created_at.desc())
    if status:
        query = query.filter(Incident.status == status.upper())
    if severity:
        query = query.filter(Incident.severity == severity.upper())
    if camera_id:
        query = query.filter(Incident.camera_id == camera_id)
    return query.all()

@router.get("/incidents/{incident_id}", response_model=IncidentResponse)
def get_incident(incident_id: str, db: Session = Depends(get_db)):
    """Retrieves single incident details."""
    incident = db.query(Incident).filter(Incident.id == incident_id).first()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found.")
    return incident

@router.get("/incidents/{incident_id}/timeline", response_model=List[TimelineEventResponse])
def get_incident_timeline(incident_id: str, db: Session = Depends(get_db)):
    """Returns chronological timeline events for the incident."""
    events = db.query(IncidentTimelineEvent).filter(
        IncidentTimelineEvent.incident_id == incident_id
    ).order_by(IncidentTimelineEvent.timestamp.asc()).all()
    return events

@router.post("/incidents", response_model=IncidentResponse)
def create_incident(payload: IncidentCreateRequest, db: Session = Depends(get_db)):
    """Creates a new incident record and initial timeline events."""
    inc_id = f"inc-{uuid.uuid4().hex[:8]}"
    incident = Incident(
        id=inc_id,
        title=payload.title,
        camera_id=payload.camera_id,
        alert_id=payload.alert_id,
        severity=payload.severity.upper() if payload.severity else "HIGH",
        status="OPEN",
        risk_score=payload.risk_score or 50,
        incident_type=payload.incident_type or "RESTRICTED_ZONE_VIOLATION",
        summary=payload.summary,
        ai_summary=payload.ai_summary,
        guard_notes=payload.guard_notes,
        created_at=datetime.utcnow()
    )
    db.add(incident)

    # Initial timeline events
    if payload.initial_timeline:
        for item in payload.initial_timeline:
            evt = IncidentTimelineEvent(
                id=f"time-{uuid.uuid4().hex[:8]}",
                incident_id=inc_id,
                timestamp=datetime.utcnow(),
                event_type=item.event_type,
                description=item.description,
                data=item.data or {}
            )
            db.add(evt)
    else:
        # Default creation event
        evt = IncidentTimelineEvent(
            id=f"time-{uuid.uuid4().hex[:8]}",
            incident_id=inc_id,
            timestamp=datetime.utcnow(),
            event_type="ALERT_CREATED",
            description=f"Security alert triggered on {payload.camera_id} with risk {payload.risk_score}."
        )
        db.add(evt)

    audit = AuditLog(
        id=f"aud-{uuid.uuid4().hex[:8]}",
        action="INCIDENT_CREATE",
        resource_type="INCIDENT",
        resource_id=inc_id,
        details={"title": incident.title, "severity": incident.severity}
    )
    db.add(audit)

    db.commit()
    db.refresh(incident)
    return incident

@router.patch("/incidents/{incident_id}/status", response_model=IncidentResponse)
def update_incident_status(
    incident_id: str,
    payload: IncidentStatusUpdate,
    db: Session = Depends(get_db)
):
    """Transitions incident status (e.g. ACKNOWLEDGED, INVESTIGATING, RESOLVED, FALSE_POSITIVE)."""
    incident = db.query(Incident).filter(Incident.id == incident_id).first()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found.")

    prev_status = incident.status
    incident.status = payload.status.upper()
    
    if payload.guard_notes:
        incident.guard_notes = payload.guard_notes
    if payload.root_cause:
        incident.root_cause = payload.root_cause
    if payload.assigned_to:
        incident.assigned_to = payload.assigned_to

    now = datetime.utcnow()
    if payload.status.upper() == "ACKNOWLEDGED" and not incident.acknowledged_at:
        incident.acknowledged_at = now
    elif payload.status.upper() in ["RESOLVED", "FALSE_POSITIVE"] and not incident.resolved_at:
        incident.resolved_at = now

    # Append timeline event
    evt = IncidentTimelineEvent(
        id=f"time-{uuid.uuid4().hex[:8]}",
        incident_id=incident.id,
        timestamp=now,
        event_type=f"STATUS_{payload.status.upper()}",
        description=f"Status transitioned from {prev_status} to {payload.status.upper()}.",
        data={"guard_notes": payload.guard_notes, "assigned_to": payload.assigned_to}
    )
    db.add(evt)

    audit = AuditLog(
        id=f"aud-{uuid.uuid4().hex[:8]}",
        action="INCIDENT_UPDATE",
        resource_type="INCIDENT",
        resource_id=incident.id,
        details={"from": prev_status, "to": incident.status}
    )
    db.add(audit)

    db.commit()
    db.refresh(incident)
    return incident
