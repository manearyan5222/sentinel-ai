from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel, ConfigDict
from typing import List, Optional, Any, Dict
from datetime import datetime
from app.database.session import get_db
from app.models.audit import AuditLog

router = APIRouter()

class AuditLogResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    timestamp: datetime
    user_id: Optional[str] = None
    username: str
    action: str
    resource_type: str
    resource_id: Optional[str] = None
    details: Optional[Dict[str, Any]] = {}
    ip_address: Optional[str] = None

@router.get("/audit-logs", response_model=List[AuditLogResponse])
def get_audit_logs(
    action: Optional[str] = None,
    resource_type: Optional[str] = None,
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db)
):
    """Retrieves paginated audit log entries."""
    query = db.query(AuditLog).order_by(AuditLog.timestamp.desc())
    if action:
        query = query.filter(AuditLog.action == action.upper())
    if resource_type:
        query = query.filter(AuditLog.resource_type == resource_type.upper())
    return query.offset(offset).limit(limit).all()
