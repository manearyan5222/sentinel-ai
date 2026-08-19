from sqlalchemy import Column, String, Integer, DateTime, JSON, ForeignKey
from datetime import datetime
from app.database.session import Base

class Incident(Base):
    __tablename__ = "incidents"

    id = Column(String, primary_key=True, index=True)
    title = Column(String, nullable=False)
    camera_id = Column(String, ForeignKey("cameras.id"), nullable=False, index=True)
    alert_id = Column(String, ForeignKey("alerts.id"), nullable=True, index=True)
    severity = Column(String, default="HIGH", nullable=False) # LOW, MEDIUM, HIGH, CRITICAL
    status = Column(String, default="OPEN", nullable=False) # OPEN, ACKNOWLEDGED, INVESTIGATING, RESOLVED, FALSE_POSITIVE
    assigned_to = Column(String, nullable=True)
    risk_score = Column(Integer, default=50, nullable=False)
    incident_type = Column(String, default="RESTRICTED_ZONE_VIOLATION", nullable=False) # RESTRICTED_ZONE, DWELL_TIME, UNAUTHORIZED_ACCESS, SUSPICIOUS_MOVEMENT, OTHER
    
    summary = Column(String, nullable=False)
    ai_summary = Column(String, nullable=True)
    root_cause = Column(String, nullable=True)
    guard_notes = Column(String, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    acknowledged_at = Column(DateTime, nullable=True)
    resolved_at = Column(DateTime, nullable=True)

class IncidentTimelineEvent(Base):
    __tablename__ = "incident_timeline_events"

    id = Column(String, primary_key=True, index=True)
    incident_id = Column(String, ForeignKey("incidents.id"), nullable=False, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False)
    event_type = Column(String, nullable=False) # DETECTION, ZONE_ENTRY, DWELL_EXCEEDED, RISK_INCREASE, ALERT_CREATED, ACKNOWLEDGED, RESOLVED, NOTE_ADDED
    description = Column(String, nullable=False)
    data = Column(JSON, default=dict)
