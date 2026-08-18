from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.camera import Camera
from app.ai.stream_manager import CameraStreamProcessor
from pydantic import BaseModel
from typing import List
import os

router = APIRouter()

class CameraSchema(BaseModel):
    id: str
    name: str
    location_zone: str
    stream_type: str
    source_path: str
    status: str
    is_restricted_zone: bool
    active_tracks_count: int

    class Config:
        from_attributes = True

@router.get("/cameras", response_model=List[CameraSchema])
def get_cameras(db: Session = Depends(get_db)):
    cameras = db.query(Camera).all()
    if not cameras:
        # Return fallback list if database is freshly initialized
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
            ),
        ]
    return cameras

@router.get("/cameras/{camera_id}/stream")
def stream_camera_feed(camera_id: str, db: Session = Depends(get_db)):
    camera = db.query(Camera).filter(Camera.id == camera_id).first()
    if not camera:
        name = "Perimeter Fence South" if camera_id == "cam-02" else "Main Gate CCTV"
        is_restricted = True if camera_id == "cam-02" else False
        source = "../sample_data/demo_security.mp4"
        processor = CameraStreamProcessor(camera_id, name, source, is_restricted, "DEMO")
    else:
        processor = CameraStreamProcessor(
            camera.id, camera.name, camera.source_path, camera.is_restricted_zone, camera.stream_type
        )

    return StreamingResponse(
        processor.generate_frames(),
        media_type="multipart/x-mixed-replace; boundary=frame"
    )
