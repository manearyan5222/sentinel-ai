from sqlalchemy import Column, String, Boolean, Integer, DateTime, JSON, ForeignKey
from datetime import datetime
from app.database.session import Base

class Zone(Base):
    __tablename__ = "zones"

    id = Column(String, primary_key=True, index=True)
    camera_id = Column(String, ForeignKey("cameras.id"), nullable=False, index=True)
    name = Column(String, nullable=False)
    zone_type = Column(String, default="RESTRICTED", nullable=False) # PUBLIC, LOBBY, RESTRICTED, SERVER_ROOM, PARKING, STAFF_ONLY
    severity = Column(String, default="HIGH", nullable=False) # LOW, MEDIUM, HIGH, CRITICAL
    is_restricted = Column(Boolean, default=True, nullable=False)
    
    # Polygon coordinates as normalized vertices: [[x1, y1], [x2, y2], [x3, y3], ...] where x,y are in [0, 1]
    polygon_coordinates = Column(JSON, default=list, nullable=False)
    
    max_dwell_seconds = Column(Integer, default=15)
    rules = Column(JSON, default=dict) # e.g. {"operating_hours": "08:00-18:00", "required_clearance": "STAFF"}
    created_at = Column(DateTime, default=datetime.utcnow)
