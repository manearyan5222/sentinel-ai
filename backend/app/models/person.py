from sqlalchemy import Column, String, DateTime, JSON
from datetime import datetime
from app.database.session import Base

class AuthorizedPerson(Base):
    __tablename__ = "authorized_persons"

    id = Column(String, primary_key=True, index=True)
    full_name = Column(String, nullable=False)
    identity_type = Column(String, nullable=False) # RESIDENT, CONTRACTOR, STAFF, VIP
    unit_number = Column(String, nullable=True)
    photo_url = Column(String, nullable=True)
    access_level = Column(String, default="FULL_RESIDENT")
    allowed_zones = Column(JSON, default=list)
    notes = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class ExpectedVisitor(Base):
    __tablename__ = "expected_visitors"

    id = Column(String, primary_key=True, index=True)
    pass_id = Column(String, unique=True, index=True, nullable=True)
    visitor_name = Column(String, nullable=False)
    resident_host_name = Column(String, nullable=False)
    unit_number = Column(String, nullable=False)
    purpose = Column(String, default="VISIT") # VISIT, DELIVERY, MAINTENANCE, CONTRACTOR, GUEST
    vehicle_number = Column(String, nullable=True)
    allowed_zones = Column(JSON, default=list) # List of zone names or IDs
    valid_from = Column(DateTime, default=datetime.utcnow)
    valid_until = Column(DateTime, default=datetime.utcnow)
    status = Column(String, default="PENDING", index=True) # PENDING, ACTIVE, CHECKED_IN, EXPIRED, REVOKED
    qr_code_data = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
