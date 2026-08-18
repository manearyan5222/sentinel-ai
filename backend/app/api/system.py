from fastapi import APIRouter
from app.ai.device_manager import device_manager

router = APIRouter()

@router.get("/system/status")
def get_system_status():
    info = device_manager.get_device_info()
    return {
        "ai_device": info["ai_device"],
        "device_name": info["device_name"],
        "active_cameras": 4,
        "total_cameras": 4,
        "active_alerts": 2,
        "today_detections": 148,
        "fps": 30,
    }
