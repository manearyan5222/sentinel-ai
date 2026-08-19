from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel, ConfigDict
from typing import List, Optional, Any, Dict
from datetime import datetime
import uuid
from app.database.session import get_db
from app.models.zone import Zone
from app.models.camera import Camera
from app.models.audit import AuditLog

router = APIRouter()

class ZoneCreateRequest(BaseModel):
    camera_id: str
    name: str
    zone_type: Optional[str] = "RESTRICTED" # PUBLIC, LOBBY, RESTRICTED, SERVER_ROOM, PARKING, STAFF_ONLY
    severity: Optional[str] = "HIGH" # LOW, MEDIUM, HIGH, CRITICAL
    is_restricted: Optional[bool] = True
    polygon_coordinates: List[List[float]] = []
    max_dwell_seconds: Optional[int] = 15
    rules: Optional[Dict[str, Any]] = {}

class ZoneResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    camera_id: str
    name: str
    zone_type: str
    severity: str
    is_restricted: bool
    polygon_coordinates: List[List[float]]
    max_dwell_seconds: int
    rules: Optional[Dict[str, Any]] = {}
    created_at: datetime

@router.get("/zones", response_model=List[ZoneResponse])
def get_zones(camera_id: Optional[str] = None, db: Session = Depends(get_db)):
    """Retrieves list of defined polygon security zones."""
    query = db.query(Zone)
    if camera_id:
        query = query.filter(Zone.camera_id == camera_id)
    return query.all()

@router.post("/zones", response_model=ZoneResponse)
def create_zone(payload: ZoneCreateRequest, db: Session = Depends(get_db)):
    """Creates a new spatial polygon security zone."""
    camera = db.query(Camera).filter(Camera.id == payload.camera_id).first()
    if not camera:
        raise HTTPException(status_code=404, detail="Camera ID not found.")

    zone = Zone(
        id=f"zone-{uuid.uuid4().hex[:8]}",
        camera_id=payload.camera_id,
        name=payload.name,
        zone_type=payload.zone_type.upper(),
        severity=payload.severity.upper(),
        is_restricted=payload.is_restricted,
        polygon_coordinates=payload.polygon_coordinates,
        max_dwell_seconds=payload.max_dwell_seconds,
        rules=payload.rules
    )
    db.add(zone)

    audit = AuditLog(
        id=f"aud-{uuid.uuid4().hex[:8]}",
        action="ZONE_CREATE",
        resource_type="ZONE",
        resource_id=zone.id,
        details={"name": zone.name, "camera_id": zone.camera_id, "type": zone.zone_type}
    )
    db.add(audit)
    db.commit()
    db.refresh(zone)
    return zone

@router.delete("/zones/{zone_id}")
def delete_zone(zone_id: str, db: Session = Depends(get_db)):
    """Deletes a polygon security zone."""
    zone = db.query(Zone).filter(Zone.id == zone_id).first()
    if not zone:
        raise HTTPException(status_code=404, detail="Zone not found.")

    audit = AuditLog(
        id=f"aud-{uuid.uuid4().hex[:8]}",
        action="ZONE_DELETE",
        resource_type="ZONE",
        resource_id=zone.id,
        details={"name": zone.name}
    )
    db.add(audit)
    db.delete(zone)
    db.commit()
    return {"status": "success", "message": f"Zone {zone_id} deleted."}
