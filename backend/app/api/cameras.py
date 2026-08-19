from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from pydantic import BaseModel, ConfigDict, field_validator
from typing import List, Optional
import uuid
import re
import cv2
from app.database.session import get_db
from app.config import settings
from app.models.camera import Camera
from app.models.zone import Zone
from app.models.audit import AuditLog
from app.models.user import User
from app.ai.stream_manager import CameraStreamProcessor
from app.core.auth import require_role, get_current_user
from app.core.security_validation import validate_camera_source

router = APIRouter()

def sanitize_stream_url(url: str) -> str:
    """Masks credentials in RTSP or HTTP stream URLs."""
    if not url:
        return url
    return re.sub(r'(rtsp://|http://|https://)([^:]+):([^@]+)@', r'\1***:***@', url)

class CameraCreateRequest(BaseModel):
    name: str
    location_zone: str
    stream_type: Optional[str] = "DEMO" # DEMO, WEBCAM, RTSP
    source_path: str
    is_restricted_zone: Optional[bool] = False
    sensitivity: Optional[str] = "MEDIUM"
    description: Optional[str] = None

class CameraUpdateRequest(BaseModel):
    name: Optional[str] = None
    location_zone: Optional[str] = None
    stream_type: Optional[str] = None
    source_path: Optional[str] = None
    is_restricted_zone: Optional[bool] = None
    status: Optional[str] = None
    is_enabled: Optional[bool] = None
    sensitivity: Optional[str] = None
    description: Optional[str] = None

class CameraResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    name: str
    location_zone: str
    stream_type: str
    source_path: str
    status: str
    is_restricted_zone: bool
    active_tracks_count: int
    fps: float
    sensitivity: str
    is_enabled: bool
    description: Optional[str] = None

    @field_validator('source_path', mode='after')
    @classmethod
    def mask_credentials(cls, v: str) -> str:
        return sanitize_stream_url(v)

class StreamTestRequest(BaseModel):
    stream_type: str
    source_path: str

@router.get("/cameras", response_model=List[CameraResponse])
def get_cameras(db: Session = Depends(get_db)):
    """Returns all configured cameras."""
    cameras = db.query(Camera).all()
    if not cameras:
        # Initial fallback
        return [
            Camera(
                id="cam-01",
                name="Main Gate & Entry",
                location_zone="North Gate Access",
                stream_type="DEMO",
                source_path="../sample_data/demo_security.mp4",
                status="ACTIVE",
                is_restricted_zone=False,
                active_tracks_count=2,
                fps=30.0,
                sensitivity="MEDIUM",
                is_enabled=True
            ),
            Camera(
                id="cam-02",
                name="Perimeter Fence South",
                location_zone="Restricted Boundary",
                stream_type="DEMO",
                source_path="../sample_data/demo_security.mp4",
                status="ACTIVE",
                is_restricted_zone=True,
                active_tracks_count=1,
                fps=30.0,
                sensitivity="HIGH",
                is_enabled=True
            ),
            Camera(
                id="cam-03",
                name="Lobby Entrance",
                location_zone="Building A Reception",
                stream_type="DEMO",
                source_path="../sample_data/demo_security.mp4",
                status="ACTIVE",
                is_restricted_zone=False,
                active_tracks_count=3,
                fps=30.0,
                sensitivity="MEDIUM",
                is_enabled=True
            ),
            Camera(
                id="cam-04",
                name="Pool & Garden Area",
                location_zone="Amenities Area",
                stream_type="DEMO",
                source_path="../sample_data/demo_security.mp4",
                status="ACTIVE",
                is_restricted_zone=False,
                active_tracks_count=0,
                fps=30.0,
                sensitivity="LOW",
                is_enabled=True
            ),
        ]
    return cameras

@router.post("/cameras", response_model=CameraResponse)
def create_camera(
    payload: CameraCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["ADMIN", "SUPERVISOR"]))
):
    """Adds a new CCTV camera with SSRF validation (ADMIN/SUPERVISOR only)."""
    stream_type = payload.stream_type.upper() if payload.stream_type else "DEMO"
    
    # SSRF & protocol validation (SEC-M02)
    is_valid, error_msg = validate_camera_source(payload.source_path, stream_type, settings.DEMO_MODE)
    if not is_valid:
        raise HTTPException(status_code=400, detail=f"Invalid camera source: {error_msg}")

    cam_id = f"cam-{uuid.uuid4().hex[:4]}"
    camera = Camera(
        id=cam_id,
        name=payload.name,
        location_zone=payload.location_zone,
        stream_type=stream_type,
        source_path=payload.source_path,
        status="ACTIVE",
        is_restricted_zone=payload.is_restricted_zone or False,
        active_tracks_count=0,
        fps=30.0,
        sensitivity=payload.sensitivity or "MEDIUM",
        is_enabled=True,
        description=payload.description
    )
    db.add(camera)

    audit = AuditLog(
        id=f"aud-{uuid.uuid4().hex[:8]}",
        user_id=current_user.id if current_user else None,
        username=current_user.username if current_user else "system",
        action="CAMERA_CREATE",
        resource_type="CAMERA",
        resource_id=cam_id,
        details={"name": camera.name, "zone": camera.location_zone}
    )
    db.add(audit)
    db.commit()
    db.refresh(camera)
    return camera

@router.get("/cameras/{camera_id}", response_model=CameraResponse)
def get_camera(camera_id: str, db: Session = Depends(get_db)):
    """Retrieves single camera metadata."""
    camera = db.query(Camera).filter(Camera.id == camera_id).first()
    if not camera:
        raise HTTPException(status_code=404, detail="Camera not found.")
    return camera

@router.put("/cameras/{camera_id}", response_model=CameraResponse)
def update_camera(
    camera_id: str,
    payload: CameraUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["ADMIN", "SUPERVISOR"]))
):
    """Updates camera configuration with SSRF validation (ADMIN/SUPERVISOR only)."""
    camera = db.query(Camera).filter(Camera.id == camera_id).first()
    if not camera:
        raise HTTPException(status_code=404, detail="Camera not found.")

    if payload.source_path is not None:
        target_type = payload.stream_type.upper() if payload.stream_type else camera.stream_type
        is_valid, error_msg = validate_camera_source(payload.source_path, target_type, settings.DEMO_MODE)
        if not is_valid:
            raise HTTPException(status_code=400, detail=f"Invalid camera source: {error_msg}")
        camera.source_path = payload.source_path

    if payload.name is not None:
        camera.name = payload.name
    if payload.location_zone is not None:
        camera.location_zone = payload.location_zone
    if payload.stream_type is not None:
        camera.stream_type = payload.stream_type.upper()
    if payload.is_restricted_zone is not None:
        camera.is_restricted_zone = payload.is_restricted_zone
    if payload.status is not None:
        camera.status = payload.status.upper()
    if payload.is_enabled is not None:
        camera.is_enabled = payload.is_enabled
    if payload.sensitivity is not None:
        camera.sensitivity = payload.sensitivity.upper()
    if payload.description is not None:
        camera.description = payload.description

    audit = AuditLog(
        id=f"aud-{uuid.uuid4().hex[:8]}",
        user_id=current_user.id if current_user else None,
        username=current_user.username if current_user else "system",
        action="CAMERA_UPDATE",
        resource_type="CAMERA",
        resource_id=camera.id,
        details={"name": camera.name, "status": camera.status}
    )
    db.add(audit)
    db.commit()
    db.refresh(camera)
    return camera

@router.delete("/cameras/{camera_id}")
def delete_camera(
    camera_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["ADMIN"]))
):
    """Deletes a camera (ADMIN only)."""
    camera = db.query(Camera).filter(Camera.id == camera_id).first()
    if not camera:
        raise HTTPException(status_code=404, detail="Camera not found.")

    audit = AuditLog(
        id=f"aud-{uuid.uuid4().hex[:8]}",
        user_id=current_user.id if current_user else None,
        username=current_user.username if current_user else "system",
        action="CAMERA_DELETE",
        resource_type="CAMERA",
        resource_id=camera.id,
        details={"name": camera.name}
    )
    db.add(audit)
    db.delete(camera)
    db.commit()
    return {"status": "success", "message": f"Camera {camera_id} deleted."}

@router.post("/cameras/{camera_id}/test")
def test_camera_connection(
    camera_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["ADMIN", "SUPERVISOR", "GUARD"]))
):
    """Tests connection to the specified camera stream with SSRF protection."""
    camera = db.query(Camera).filter(Camera.id == camera_id).first()
    if not camera:
        raise HTTPException(status_code=404, detail="Camera not found.")

    source = camera.source_path
    
    # Re-validate source before opening
    is_valid, error_msg = validate_camera_source(source, camera.stream_type, settings.DEMO_MODE)
    if not is_valid:
        return {
            "camera_id": camera_id,
            "status": "BLOCKED",
            "message": f"Connection blocked by SSRF policy: {error_msg}"
        }

    is_ok = False
    msg = "Connected successfully"

    if camera.stream_type == "DEMO":
        is_ok = True
    elif camera.stream_type == "WEBCAM":
        try:
            cap = cv2.VideoCapture(int(source) if source.isdigit() else 0)
            is_ok = cap.isOpened()
            cap.release()
        except Exception as e:
            msg = str(e)
    else: # RTSP / HTTP
        try:
            cap = cv2.VideoCapture(source)
            is_ok = cap.isOpened()
            cap.release()
        except Exception as e:
            msg = str(e)

    return {
        "camera_id": camera_id,
        "status": "ONLINE" if is_ok else "UNREACHABLE",
        "message": msg if is_ok else f"Failed to open video source: {msg}"
    }


@router.get("/cameras/{camera_id}/stream")
def stream_camera_feed(camera_id: str, db: Session = Depends(get_db)):
    """Streams live MJPEG camera feed with computer vision overlays and polygon zones."""
    camera = db.query(Camera).filter(Camera.id == camera_id).first()
    zones = db.query(Zone).filter(Zone.camera_id == camera_id).all()
    zones_data = [
        {
            "id": z.id,
            "name": z.name,
            "severity": z.severity,
            "zone_type": z.zone_type,
            "is_restricted": z.is_restricted,
            "polygon_coordinates": z.polygon_coordinates
        }
        for z in zones
    ]

    if not camera:
        name = "Perimeter Fence South" if camera_id == "cam-02" else "Main Gate CCTV"
        is_restricted = True if camera_id == "cam-02" else False
        source = "../sample_data/demo_security.mp4"
        processor = CameraStreamProcessor(camera_id, name, source, is_restricted, "DEMO", zones_data)
    else:
        processor = CameraStreamProcessor(
            camera.id, camera.name, camera.source_path, camera.is_restricted_zone, camera.stream_type, zones_data
        )

    return StreamingResponse(
        processor.generate_frames(),
        media_type="multipart/x-mixed-replace; boundary=frame"
    )
