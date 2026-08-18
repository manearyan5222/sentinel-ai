from sqlalchemy import Column, String, Integer, Float, DateTime, JSON, ForeignKey
from datetime import datetime
from app.database.session import Base

class DetectionEvent(Base):
    __tablename__ = "detection_events"

    id = Column(String, primary_key=True, index=True)
    camera_id = Column(String, ForeignKey("cameras.id"), nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)
    track_id = Column(String, nullable=False)
    person_id = Column(String, nullable=True)
    identity_type = Column(String, default="UNRECOGNIZED")
    confidence = Column(Float, default=0.0)
    risk_score = Column(Integer, default=0)
    risk_level = Column(String, default="LOW") # LOW, MODERATE, ELEVATED, HIGH
    risk_reasons = Column(JSON, default=list)
    bounding_box = Column(JSON, default=dict)
    dwell_time_seconds = Column(Integer, default=0)
    snapshot_url = Column(String, nullable=True)
