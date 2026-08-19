from sqlalchemy import Column, String, Integer, DateTime, JSON, ForeignKey
from datetime import datetime
from app.database.session import Base

class Alert(Base):
    __tablename__ = "alerts"

    id = Column(String, primary_key=True, index=True)
    event_id = Column(String, ForeignKey("detection_events.id"), nullable=False)
    camera_id = Column(String, ForeignKey("cameras.id"), nullable=False, index=True)
    risk_score = Column(Integer, nullable=False, index=True)
    risk_level = Column(String, nullable=False) # LOW, MEDIUM, HIGH, CRITICAL
    severity = Column(String, default="HIGH", nullable=False) # LOW, MEDIUM, HIGH, CRITICAL
    risk_reasons = Column(JSON, default=list)
    entity_label = Column(String, nullable=False)
    identity_type = Column(String, default="UNRECOGNIZED")
    dwell_time_seconds = Column(Integer, default=0)
    status = Column(String, default="NEW", nullable=False, index=True) # NEW, ACKNOWLEDGED, INVESTIGATING, RESOLVED, FALSE_POSITIVE, LEGITIMATE, ESCALATED
    assigned_user_id = Column(String, nullable=True)
    guard_notes = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    acknowledged_at = Column(DateTime, nullable=True)
    resolved_at = Column(DateTime, nullable=True)
    action_protocol = Column(JSON, default=dict)
    snapshot_url = Column(String, nullable=True)

    # Gemini AI Explanation Persistence & Cache Fields
    ai_summary = Column(String, nullable=True)
    ai_risk_explanation = Column(String, nullable=True)
    ai_recommended_action = Column(String, nullable=True)
    ai_verification_steps = Column(JSON, default=list, nullable=True)
    ai_uncertainty = Column(String, nullable=True)
    ai_generated_at = Column(DateTime, nullable=True)
