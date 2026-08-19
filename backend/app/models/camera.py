from sqlalchemy import Column, String, Boolean, Integer, Float, DateTime
from datetime import datetime
from app.database.session import Base

class Camera(Base):
    __tablename__ = "cameras"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    location_zone = Column(String, nullable=False)
    stream_type = Column(String, default="DEMO") # DEMO, WEBCAM, RTSP
    source_path = Column(String, nullable=False)
    status = Column(String, default="ACTIVE") # ACTIVE, ONLINE, OFFLINE, DEGRADED
    is_restricted_zone = Column(Boolean, default=False)
    active_tracks_count = Column(Integer, default=0)
    fps = Column(Float, default=30.0)
    sensitivity = Column(String, default="MEDIUM") # LOW, MEDIUM, HIGH
    is_enabled = Column(Boolean, default=True)
    description = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
