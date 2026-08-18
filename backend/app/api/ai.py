from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.alert import Alert
from app.models.person import AuthorizedPerson, ExpectedVisitor
from app.models.camera import Camera
from app.ai.gemini_service import gemini_service
from app.ai.ai_schemas import (
    AlertExplainRequest,
    AIChatRequest,
    IncidentSummaryRequest
)
from datetime import datetime, timedelta

router = APIRouter()

@router.get("/ai/status")
def get_ai_status():
    """Returns the current operating status of the Gemini AI Intelligence Layer."""
    return gemini_service.get_status()

@router.post("/api/ai/explain-alert")
@router.post("/ai/explain-alert")
def explain_alert(payload: AlertExplainRequest, db: Session = Depends(get_db)):
    """
    Generates or retrieves a cached structured AI explanation for a given alert ID.
    Does NOT expose the Gemini API key to the frontend.
    """
    alert = db.query(Alert).filter(Alert.id == payload.alert_id).first()
    
    if not alert:
        # Check fallback seeded alerts if DB not initialized
        fallback_alert_dict = {
            "id": payload.alert_id,
            "camera_name": "Perimeter Fence South",
            "location_zone": "Restricted Boundary",
            "created_at": datetime.utcnow().isoformat(),
            "identity_type": "UNRECOGNIZED",
            "entity_label": "Track #0104 (Unrecognized)",
            "dwell_time_seconds": 24,
            "risk_score": 85,
            "risk_level": "HIGH",
            "risk_reasons": ["Unrecognized Person (+25)", "Restricted Zone Violation (+30)", "Extended Dwell Time 24s (+15)"],
            "action_protocol": {
                "what": "Unrecognized subject loitering in restricted perimeter zone for 24s.",
                "recommended_action": "Dispatch security patrol guard to check credentials."
            }
        }
        return gemini_service.explain_alert(fallback_alert_dict, db_session=None, force_refresh=payload.force_refresh)

    alert_dict = {
        "id": alert.id,
        "camera_name": alert.camera_id,
        "location_zone": "Monitored Zone",
        "created_at": alert.created_at.isoformat() if alert.created_at else datetime.utcnow().isoformat(),
        "identity_type": alert.identity_type,
        "entity_label": alert.entity_label,
        "dwell_time_seconds": alert.dwell_time_seconds,
        "risk_score": alert.risk_score,
        "risk_level": alert.risk_level,
        "risk_reasons": alert.risk_reasons or [],
        "action_protocol": alert.action_protocol or {},
        "ai_summary": alert.ai_summary,
        "ai_risk_explanation": alert.ai_risk_explanation,
        "ai_recommended_action": alert.ai_recommended_action,
        "ai_verification_steps": alert.ai_verification_steps,
        "ai_uncertainty": alert.ai_uncertainty,
    }

    explanation = gemini_service.explain_alert(alert_dict, db_session=db, force_refresh=payload.force_refresh)
    return explanation

@router.post("/api/ai/chat")
@router.post("/ai/chat")
def chat_assistant(payload: AIChatRequest, db: Session = Depends(get_db)):
    """
    Read-only AI Security Assistant endpoint to query event logs using database context.
    """
    alerts = db.query(Alert).order_by(Alert.created_at.desc()).limit(10).all()
    active_count = db.query(Alert).filter(Alert.status == "ACTIVE").count()
    residents_count = db.query(AuthorizedPerson).count()
    visitors_count = db.query(ExpectedVisitor).count()
    cameras_count = db.query(Camera).count()

    alerts_summary_list = []
    for a in alerts:
        alerts_summary_list.append(
            f"[{a.id}] {a.entity_label} on Cam {a.camera_id} - Risk {a.risk_score} ({a.risk_level}) - Status: {a.status}"
        )

    system_context = {
        "active_alerts_count": active_count,
        "total_alerts_count": len(alerts),
        "alerts_summary": "\n".join(alerts_summary_list) if alerts_summary_list else "No active alerts recorded.",
        "residents_count": residents_count,
        "visitors_count": visitors_count,
        "cameras": f"{cameras_count} Active Cameras"
    }

    return gemini_service.chat_assistant(payload.message, system_context)

@router.post("/api/ai/summarize-incidents")
@router.post("/ai/summarize-incidents")
def summarize_incidents(payload: IncidentSummaryRequest, db: Session = Depends(get_db)):
    """
    Summarizes multiple security events recorded within a specified timeframe.
    """
    query = db.query(Alert)
    if payload.camera_id:
        query = query.filter(Alert.camera_id == payload.camera_id)
    
    since_time = datetime.utcnow() - timedelta(hours=payload.hours or 24)
    query = query.filter(Alert.created_at >= since_time)
    
    alerts = query.all()
    
    events_summary = []
    for a in alerts:
        events_summary.append(
            f"- Time: {a.created_at}, Entity: {a.entity_label}, Zone: {a.camera_id}, Risk: {a.risk_score} ({a.risk_level}), Dwell: {a.dwell_time_seconds}s"
        )
    
    events_text = "\n".join(events_summary) if events_summary else "No incidents recorded in timeframe."
    return gemini_service.summarize_incidents(events_text, len(alerts))
