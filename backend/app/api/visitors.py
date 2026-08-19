from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel, ConfigDict
from typing import List, Optional
from datetime import datetime, timedelta
import uuid
from app.database.session import get_db
from app.models.person import AuthorizedPerson, ExpectedVisitor
from app.models.audit import AuditLog

router = APIRouter()

class ExpectedVisitorCreate(BaseModel):
    visitor_name: str
    resident_host_name: str
    unit_number: str
    purpose: Optional[str] = "VISIT" # VISIT, DELIVERY, MAINTENANCE, CONTRACTOR, GUEST
    vehicle_number: Optional[str] = None
    allowed_zones: Optional[List[str]] = []
    valid_hours: Optional[int] = 24

class VisitorStatusUpdate(BaseModel):
    status: str # PENDING, ACTIVE, CHECKED_IN, EXPIRED, REVOKED

class ExpectedVisitorResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    pass_id: Optional[str] = None
    visitor_name: str
    resident_host_name: str
    unit_number: str
    purpose: str
    vehicle_number: Optional[str] = None
    allowed_zones: Optional[List[str]] = []
    valid_from: datetime
    valid_until: datetime
    status: str
    qr_code_data: Optional[str] = None
    created_at: datetime

class AuthorizedPersonResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    full_name: str
    identity_type: str
    unit_number: Optional[str] = None
    photo_url: Optional[str] = None
    access_level: str
    allowed_zones: Optional[List[str]] = []
    notes: Optional[str] = None
    created_at: datetime

@router.get("/visitors/authorized", response_model=List[AuthorizedPersonResponse])
def get_authorized_persons(db: Session = Depends(get_db)):
    """Returns resident whitelist & authorized staff directory."""
    persons = db.query(AuthorizedPerson).all()
    if not persons:
        return [
            AuthorizedPerson(
                id="p-01",
                full_name="Dr. Sarah Jenkins",
                identity_type="RESIDENT",
                unit_number="A-402",
                access_level="FULL_RESIDENT",
                notes="Primary owner, vehicle #CA-9801",
                created_at=datetime.utcnow()
            ),
            AuthorizedPerson(
                id="p-02",
                full_name="Marcus Vance",
                identity_type="RESIDENT",
                unit_number="B-104",
                access_level="FULL_RESIDENT",
                notes="HOA Board Member",
                created_at=datetime.utcnow()
            ),
            AuthorizedPerson(
                id="p-03",
                full_name="Elena Rostova",
                identity_type="CONTRACTOR",
                unit_number="FACILITIES",
                access_level="RESTRICTED_DAYTIME",
                notes="Landscape maintenance head",
                created_at=datetime.utcnow()
            ),
        ]
    return persons

@router.get("/visitors/expected", response_model=List[ExpectedVisitorResponse])
def get_expected_visitors(db: Session = Depends(get_db)):
    """Returns pre-registered expected visitor passes."""
    visitors = db.query(ExpectedVisitor).order_by(ExpectedVisitor.created_at.desc()).all()
    if not visitors:
        return [
            ExpectedVisitor(
                id="v-01",
                pass_id="VP-4091",
                visitor_name="Robert Chen",
                resident_host_name="Dr. Sarah Jenkins (A-402)",
                unit_number="A-402",
                purpose="VISIT",
                vehicle_number="NY-4591",
                allowed_zones=["Main Gate & Entry", "Lobby Entrance"],
                valid_from=datetime.utcnow(),
                valid_until=datetime.utcnow() + timedelta(days=1),
                status="ACTIVE",
                qr_code_data="PASS:VP-4091:ROBERT_CHEN:A402",
                created_at=datetime.utcnow()
            ),
            ExpectedVisitor(
                id="v-02",
                pass_id="VP-1120",
                visitor_name="FedEx Express Courier",
                resident_host_name="Building Reception",
                unit_number="LOBBY",
                purpose="DELIVERY",
                vehicle_number="US-8812",
                allowed_zones=["Main Gate & Entry", "Lobby Entrance"],
                valid_from=datetime.utcnow(),
                valid_until=datetime.utcnow() + timedelta(hours=4),
                status="CHECKED_IN",
                qr_code_data="PASS:VP-1120:FEDEX:LOBBY",
                created_at=datetime.utcnow()
            ),
        ]
    return visitors

@router.post("/visitors/expected", response_model=ExpectedVisitorResponse)
def create_expected_visitor(payload: ExpectedVisitorCreate, db: Session = Depends(get_db)):
    """Creates a new pre-registered visitor access pass with unique pass ID."""
    pass_number = f"VP-{uuid.uuid4().hex[:4].upper()}"
    new_id = f"v-{uuid.uuid4().hex[:6]}"
    valid_from = datetime.utcnow()
    valid_until = valid_from + timedelta(hours=payload.valid_hours or 24)

    visitor = ExpectedVisitor(
        id=new_id,
        pass_id=pass_number,
        visitor_name=payload.visitor_name,
        resident_host_name=payload.resident_host_name,
        unit_number=payload.unit_number,
        purpose=payload.purpose.upper() if payload.purpose else "VISIT",
        vehicle_number=payload.vehicle_number,
        allowed_zones=payload.allowed_zones or ["Main Gate & Entry", "Lobby Entrance"],
        valid_from=valid_from,
        valid_until=valid_until,
        status="ACTIVE",
        qr_code_data=f"PASS:{pass_number}:{payload.visitor_name.replace(' ', '_')}:{payload.unit_number}",
        created_at=datetime.utcnow()
    )
    db.add(visitor)

    audit = AuditLog(
        id=f"aud-{uuid.uuid4().hex[:8]}",
        action="VISITOR_PASS_CREATE",
        resource_type="VISITOR",
        resource_id=visitor.id,
        details={"name": visitor.visitor_name, "pass_id": visitor.pass_id, "host": visitor.resident_host_name}
    )
    db.add(audit)
    db.commit()
    db.refresh(visitor)
    return visitor

@router.patch("/visitors/expected/{visitor_id}/status", response_model=ExpectedVisitorResponse)
def update_visitor_status(visitor_id: str, payload: VisitorStatusUpdate, db: Session = Depends(get_db)):
    """Updates visitor pass status (e.g. CHECKED_IN, REVOKED, EXPIRED)."""
    visitor = db.query(ExpectedVisitor).filter(ExpectedVisitor.id == visitor_id).first()
    if not visitor:
        raise HTTPException(status_code=404, detail="Visitor pass not found.")

    prev = visitor.status
    visitor.status = payload.status.upper()

    audit = AuditLog(
        id=f"aud-{uuid.uuid4().hex[:8]}",
        action="VISITOR_PASS_STATUS_UPDATE",
        resource_type="VISITOR",
        resource_id=visitor.id,
        details={"from": prev, "to": visitor.status, "name": visitor.visitor_name}
    )
    db.add(audit)
    db.commit()
    db.refresh(visitor)
    return visitor

@router.delete("/visitors/expected/{visitor_id}")
def delete_expected_visitor(visitor_id: str, db: Session = Depends(get_db)):
    """Deletes or cancels an expected visitor pass."""
    visitor = db.query(ExpectedVisitor).filter(ExpectedVisitor.id == visitor_id).first()
    if not visitor:
        raise HTTPException(status_code=404, detail="Visitor pass not found.")

    audit = AuditLog(
        id=f"aud-{uuid.uuid4().hex[:8]}",
        action="VISITOR_PASS_DELETE",
        resource_type="VISITOR",
        resource_id=visitor.id,
        details={"name": visitor.visitor_name}
    )
    db.add(audit)
    db.delete(visitor)
    db.commit()
    return {"status": "success", "message": f"Visitor pass {visitor_id} deleted."}
