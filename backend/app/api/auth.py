from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime
import uuid
from app.database.session import get_db
from app.models.user import User
from app.models.audit import AuditLog
from app.core.auth import hash_password, verify_password, create_access_token, get_current_user

router = APIRouter()

class UserRegisterRequest(BaseModel):
    username: str
    email: str
    password: str
    full_name: str
    role: Optional[str] = "GUARD" # GUARD, SUPERVISOR, ADMIN
    badge_number: Optional[str] = None

class UserLoginRequest(BaseModel):
    username: str
    password: str

class UserResponse(BaseModel):
    id: str
    username: str
    email: str
    full_name: str
    role: str
    badge_number: Optional[str] = None
    created_at: datetime
    last_login: Optional[datetime] = None

class LoginResponse(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

@router.post("/auth/register", response_model=UserResponse)
def register(payload: UserRegisterRequest, db: Session = Depends(get_db)):
    """Registers a new user (Secured)."""
    existing = db.query(User).filter((User.username == payload.username) | (User.email == payload.email)).first()
    if existing:
        raise HTTPException(status_code=400, detail="Username or email already registered.")

    user = User(
        id=f"usr-{uuid.uuid4().hex[:8]}",
        username=payload.username,
        email=payload.email,
        hashed_password=hash_password(payload.password),
        full_name=payload.full_name,
        role=payload.role.upper() if payload.role else "GUARD",
        badge_number=payload.badge_number,
        is_active=True
    )
    db.add(user)
    
    # Audit log
    audit = AuditLog(
        id=f"aud-{uuid.uuid4().hex[:8]}",
        user_id=user.id,
        username=user.username,
        action="USER_REGISTER",
        resource_type="USER",
        resource_id=user.id,
        details={"role": user.role}
    )
    db.add(audit)
    db.commit()
    db.refresh(user)
    return user

@router.post("/auth/login", response_model=LoginResponse)
def login(payload: UserLoginRequest, db: Session = Depends(get_db)):
    """Authenticates user credentials and returns JWT Bearer token."""
    user = db.query(User).filter(User.username == payload.username).first()
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password."
        )

    user.last_login = datetime.utcnow()
    token = create_access_token(user_id=user.id, username=user.username, role=user.role)
    
    audit = AuditLog(
        id=f"aud-{uuid.uuid4().hex[:8]}",
        user_id=user.id,
        username=user.username,
        action="LOGIN",
        resource_type="USER",
        resource_id=user.id,
        details={"status": "SUCCESS"}
    )
    db.add(audit)
    db.commit()

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": user
    }

@router.get("/auth/me", response_model=UserResponse)
def get_current_user_profile(current_user: User = Depends(get_current_user)):
    """Returns profile information for the authenticated user."""
    return current_user
