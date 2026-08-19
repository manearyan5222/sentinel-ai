from sqlalchemy import Column, String, DateTime, JSON
from datetime import datetime
from app.database.session import Base

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(String, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    user_id = Column(String, nullable=True, index=True)
    username = Column(String, default="system", nullable=False)
    action = Column(String, nullable=False, index=True) # LOGIN, LOGOUT, CAMERA_CREATE, CAMERA_UPDATE, CAMERA_DELETE, ZONE_CREATE, ZONE_UPDATE, VISITOR_CREATE, VISITOR_REVOKE, ALERT_ACKNOWLEDGE, ALERT_RESOLVE, INCIDENT_CREATE, INCIDENT_UPDATE, SETTING_CHANGE
    resource_type = Column(String, nullable=False) # CAMERA, ZONE, VISITOR, ALERT, INCIDENT, USER, SYSTEM
    resource_id = Column(String, nullable=True)
    details = Column(JSON, default=dict)
    ip_address = Column(String, nullable=True)
