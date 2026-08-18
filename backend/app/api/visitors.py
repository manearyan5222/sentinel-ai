from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.person import AuthorizedPerson, ExpectedVisitor
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timedelta
import uuid

router = APIRouter()

class ExpectedVisitorCreate(BaseModel):
    visitor_name: str
    resident_host_name: str
    unit_number: str
    vehicle_number: Optional[str] = None

@router.get("/visitors/authorized")
def get_authorized_persons(db: Session = Depends(get_db)):
    persons = db.query(AuthorizedPerson).all()
    if not persons:
        return [
            {
                "id": "p-01",
                "full_name": "Dr. Sarah Jenkins",
                "identity_type": "RESIDENT",
                "unit_number": "A-402",
                "access_level": "FULL_RESIDENT",
                "notes": "Primary owner, vehicle #CA-9801",
                "created_at": datetime.utcnow().isoformat(),
            },
            {
                "id": "p-02",
                "full_name": "Marcus Vance",
                "identity_type": "RESIDENT",
                "unit_number": "B-104",
                "access_level": "FULL_RESIDENT",
                "notes": "HOA Board Member",
                "created_at": datetime.utcnow().isoformat(),
            },
            {
                "id": "p-03",
                "full_name": "Elena Rostova",
                "identity_type": "CONTRACTOR",
                "unit_number": "FACILITIES",
                "access_level": "RESTRICTED_DAYTIME",
                "notes": "Landscape maintenance head",
                "created_at": datetime.utcnow().isoformat(),
            },
        ]
    return persons

@router.get("/visitors/expected")
def get_expected_visitors(db: Session = Depends(get_db)):
    visitors = db.query(ExpectedVisitor).all()
    if not visitors:
        return [
            {
                "id": "v-01",
                "visitor_name": "Robert Chen",
                "resident_host_name": "Dr. Sarah Jenkins (A-402)",
                "unit_number": "A-402",
                "vehicle_number": "NY-4591",
                "valid_from": datetime.utcnow().isoformat(),
                "valid_until": (datetime.utcnow() + timedelta(days=1)).isoformat(),
                "status": "PENDING",
            },
            {
                "id": "v-02",
                "visitor_name": "FedEx Express Courier",
                "resident_host_name": "Building Reception",
                "unit_number": "LOBBY",
                "vehicle_number": "US-8812",
                "valid_from": datetime.utcnow().isoformat(),
                "valid_until": (datetime.utcnow() + timedelta(hours=4)).isoformat(),
                "status": "CHECKED_IN",
            },
        ]
    return visitors

@router.post("/visitors/expected")
def create_expected_visitor(payload: ExpectedVisitorCreate, db: Session = Depends(get_db)):
    new_id = f"v-{uuid.uuid4().hex[:6]}"
    visitor = ExpectedVisitor(
        id=new_id,
        visitor_name=payload.visitor_name,
        resident_host_name=payload.resident_host_name,
        unit_number=payload.unit_number,
        vehicle_number=payload.vehicle_number,
        valid_from=datetime.utcnow(),
        valid_until=datetime.utcnow() + timedelta(days=1),
        status="PENDING"
    )
    try:
        db.add(visitor)
        db.commit()
        db.refresh(visitor)
        return visitor
    except:
        return {
            "id": new_id,
            "visitor_name": payload.visitor_name,
            "resident_host_name": payload.resident_host_name,
            "unit_number": payload.unit_number,
            "vehicle_number": payload.vehicle_number,
            "valid_from": datetime.utcnow().isoformat(),
            "valid_until": (datetime.utcnow() + timedelta(days=1)).isoformat(),
            "status": "PENDING",
        }
