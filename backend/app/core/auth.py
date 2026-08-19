import os
import hmac
import hashlib
import base64
import json
import time
from typing import Optional, Dict, Any, List
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.config import settings
from app.database.session import get_db
from app.models.user import User

security = HTTPBearer(auto_error=False)

def hash_password(password: str, salt: Optional[str] = None) -> str:
    """Hashes password using PBKDF2-HMAC-SHA256 with cryptographic salt."""
    if salt is None:
        salt = base64.b64encode(os.urandom(16)).decode('utf-8')
    dk = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt.encode('utf-8'), 100000)
    return f"{salt}${base64.b64encode(dk).decode('utf-8')}"

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Secure constant-time password verification."""
    try:
        parts = hashed_password.split('$')
        if len(parts) != 2:
            return False
        salt, _ = parts
        computed = hash_password(plain_password, salt)
        return hmac.compare_digest(computed, hashed_password)
    except Exception:
        return False

def create_access_token(user_id: str, username: str, role: str, expires_delta_seconds: int = 86400) -> str:
    """Generates an HMAC-SHA256 signed JSON Web Token."""
    header = {"alg": "HS256", "typ": "JWT"}
    payload = {
        "sub": user_id,
        "username": username,
        "role": role,
        "exp": int(time.time()) + expires_delta_seconds,
        "iat": int(time.time())
    }
    
    encoded_header = base64.urlsafe_b64encode(json.dumps(header).encode('utf-8')).decode('utf-8').rstrip('=')
    encoded_payload = base64.urlsafe_b64encode(json.dumps(payload).encode('utf-8')).decode('utf-8').rstrip('=')
    
    signing_input = f"{encoded_header}.{encoded_payload}"
    signature = hmac.new(settings.SECRET_KEY.encode('utf-8'), signing_input.encode('utf-8'), hashlib.sha256).digest()
    encoded_signature = base64.urlsafe_b64encode(signature).decode('utf-8').rstrip('=')
    
    return f"{signing_input}.{encoded_signature}"

def decode_token(token: str) -> Optional[Dict[str, Any]]:
    """Decodes and validates token signature & expiration."""
    try:
        parts = token.split('.')
        if len(parts) != 3:
            return None
        encoded_header, encoded_payload, encoded_sig = parts
        
        signing_input = f"{encoded_header}.{encoded_payload}"
        expected_sig = hmac.new(settings.SECRET_KEY.encode('utf-8'), signing_input.encode('utf-8'), hashlib.sha256).digest()
        
        pad_len = (4 - len(encoded_sig) % 4) % 4
        actual_sig = base64.urlsafe_b64decode(encoded_sig + '=' * pad_len)
        
        if not hmac.compare_digest(expected_sig, actual_sig):
            return None
            
        pad_payload = (4 - len(encoded_payload) % 4) % 4
        payload_data = json.loads(base64.urlsafe_b64decode(encoded_payload + '=' * pad_payload).decode('utf-8'))
        
        if payload_data.get("exp", 0) < time.time():
            return None # Expired
            
        return payload_data
    except Exception:
        return None

def get_user_from_token(token: Optional[str], db: Session) -> Optional[User]:
    """Validates a JWT token string directly and returns the User or None."""
    if not token:
        return None
    payload = decode_token(token)
    if not payload:
        return None
    user_id = payload.get("sub")
    if not user_id:
        return None
    return db.query(User).filter(User.id == user_id, User.is_active == True).first()

def get_current_user_optional(
    auth: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db: Session = Depends(get_db)
) -> Optional[User]:
    """Returns current authenticated User or None if unauthenticated."""
    if not auth or not auth.credentials:
        return None
    return get_user_from_token(auth.credentials, db)

def get_current_user(
    auth: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    """
    Enforces active authentication and returns User.
    In DEMO_MODE, permits fallback to demo administrator if unauthenticated.
    In production (DEMO_MODE=False), strictly rejects unauthenticated requests with HTTP 401.
    """
    user = get_current_user_optional(auth, db)
    if not user:
        if settings.DEMO_MODE:
            admin_user = db.query(User).filter(User.role == "ADMIN").first()
            if admin_user:
                return admin_user
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication credentials were not provided or have expired.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user

def require_role(allowed_roles: List[str]):
    """Decorator / dependency enforcing role-based permissions."""
    def role_checker(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role not in allowed_roles and current_user.role != "ADMIN":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access forbidden for role '{current_user.role}'. Required: {allowed_roles}"
            )
        return current_user
    return role_checker
