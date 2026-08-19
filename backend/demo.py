import sys
import os
import time
from datetime import datetime, timedelta
import uuid

# Ensure backend root is on sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.database.session import SessionLocal, engine, Base
from app.models.camera import Camera
from app.models.zone import Zone
from app.models.alert import Alert
from app.models.incident import Incident, IncidentTimelineEvent
from app.models.audit import AuditLog
from app.ai.risk_engine import risk_engine
from app.ai.identity import identity_matcher
from app.ai.gemini_service import gemini_service

def run_demo_scenario():
    print("=" * 72)
    print("      SENTINEL AI — END-TO-END SECURITY INCIDENT REPRODUCIBLE DEMO")
    print("=" * 72)
    print("Scenario: Unrecognized person enters restricted South Perimeter Boundary\n")

    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # Step 1: Detection
        time.sleep(0.5)
        now = datetime.utcnow()
        track_id = f"TRACK-#{uuid.uuid4().hex[:4].upper()}"
        print(f"[{now.strftime('%H:%M:%S')}] [CV PIPELINE] Detection: Subject spotted on Camera 02 (Perimeter Fence South). ID: {track_id}")

        # Step 2: Zone Entry
        time.sleep(0.5)
        print(f"[{now.strftime('%H:%M:%S')}] [SPATIAL ZONE] Zone Entry: Subject crossed boundary polygon into 'Perimeter Fence Line' (Restricted).")

        # Step 3: Dwell Threshold & Authorization Check
        time.sleep(0.5)
        dwell_s = 22
        identity = identity_matcher.match_identity(track_id, camera_is_restricted=True, zone_name="Perimeter Fence Line")
        print(f"[{now.strftime('%H:%M:%S')}] [IDENTITY] Registry Check: {identity['notes']} ({identity['identity_type']})")
        print(f"[{now.strftime('%H:%M:%S')}] [DWELL TIMER] Dwell Duration: {dwell_s}s (Exceeds 10s critical boundary threshold)")

        # Step 4: Risk Scoring
        risk_result = risk_engine.compute_risk(
            identity_type=identity["identity_type"],
            is_restricted_zone=True,
            dwell_time_seconds=dwell_s,
            has_expected_pass=False,
            zone_type="RESTRICTED",
            zone_severity="CRITICAL",
            hour_of_day=23
        )
        print(f"[{now.strftime('%H:%M:%S')}] [RISK ENGINE] Computed Score: {risk_result['risk_score']}/100 ({risk_result['risk_level']})")
        for r in risk_result['risk_reasons']:
            print(f"     ↳ Rule Factor: {r}")

        # Step 5: Security Alert & Incident Creation
        alert_id = f"alt-{uuid.uuid4().hex[:6]}"
        alert = Alert(
            id=alert_id,
            event_id=f"evt-{uuid.uuid4().hex[:6]}",
            camera_id="cam-02",
            risk_score=risk_result["risk_score"],
            risk_level=risk_result["risk_level"],
            severity=risk_result["severity"],
            risk_reasons=risk_result["risk_reasons"],
            entity_label=f"{track_id} (Unrecognized)",
            identity_type=identity["identity_type"],
            dwell_time_seconds=dwell_s,
            status="NEW",
            created_at=datetime.utcnow(),
            action_protocol={
                "who": f"Unrecognized Subject ({track_id})",
                "where": "Perimeter Fence South (Restricted Boundary)",
                "when": "Just now",
                "what": f"Person entered restricted zone and lingered for {dwell_s}s",
                "why": risk_result["risk_reasons"],
                "recommended_action": "Dispatch patrol guard to verify identity."
            }
        )
        db.add(alert)

        inc_id = f"inc-{uuid.uuid4().hex[:6]}"
        incident = Incident(
            id=inc_id,
            title=f"Perimeter Intrusion Event ({track_id})",
            camera_id="cam-02",
            alert_id=alert_id,
            severity=risk_result["severity"],
            status="OPEN",
            risk_score=risk_result["risk_score"],
            incident_type="RESTRICTED_ZONE_VIOLATION",
            summary=f"Unrecognized subject loitered in restricted perimeter boundary for {dwell_s}s without visitor authorization.",
            created_at=datetime.utcnow()
        )
        db.add(incident)

        timeline_events = [
            IncidentTimelineEvent(
                id=f"time-{uuid.uuid4().hex[:6]}",
                incident_id=inc_id,
                timestamp=datetime.utcnow() - timedelta(seconds=dwell_s),
                event_type="DETECTION",
                description=f"Person detected entering Camera 02 field of view. ({track_id})"
            ),
            IncidentTimelineEvent(
                id=f"time-{uuid.uuid4().hex[:6]}",
                incident_id=inc_id,
                timestamp=datetime.utcnow() - timedelta(seconds=dwell_s - 4),
                event_type="ZONE_ENTRY",
                description="Subject crossed boundary line into 'Perimeter Fence Line'."
            ),
            IncidentTimelineEvent(
                id=f"time-{uuid.uuid4().hex[:6]}",
                incident_id=inc_id,
                timestamp=datetime.utcnow() - timedelta(seconds=dwell_s - 12),
                event_type="DWELL_EXCEEDED",
                description=f"Dwell threshold exceeded ({dwell_s}s loitering)."
            ),
            IncidentTimelineEvent(
                id=f"time-{uuid.uuid4().hex[:6]}",
                incident_id=inc_id,
                timestamp=datetime.utcnow(),
                event_type="ALERT_CREATED",
                description=f"Critical security alert {alert_id} generated. Risk score: {risk_result['risk_score']}/100."
            )
        ]
        db.add_all(timeline_events)
        db.commit()

        print(f"\n[{datetime.utcnow().strftime('%H:%M:%S')}] [ALERT GENERATED] Created Alert {alert_id} & Incident {inc_id}")

        # Step 6: Gemini AI Decision-Support Layer
        print(f"[{datetime.utcnow().strftime('%H:%M:%S')}] [GEMINI AI] Generating structured incident explanation...")
        alert_dict = {
            "id": alert.id,
            "camera_name": "Perimeter Fence South",
            "location_zone": "Restricted Boundary",
            "created_at": alert.created_at.isoformat(),
            "identity_type": alert.identity_type,
            "entity_label": alert.entity_label,
            "dwell_time_seconds": alert.dwell_time_seconds,
            "risk_score": alert.risk_score,
            "risk_level": alert.risk_level,
            "risk_reasons": alert.risk_reasons,
            "action_protocol": alert.action_protocol
        }
        ai_resp = gemini_service.explain_alert(alert_dict, db_session=db)
        print(f"     ↳ Summary: {ai_resp.get('summary')}")
        print(f"     ↳ Recommended Action: {ai_resp.get('recommended_action')}")

        # Step 7: Guard Triage & Resolution
        time.sleep(0.5)
        alert.status = "ACKNOWLEDGED"
        alert.acknowledged_at = datetime.utcnow()
        incident.status = "INVESTIGATING"
        incident.guard_notes = "Officer Cole dispatched to perimeter sector."

        audit = AuditLog(
            id=f"aud-{uuid.uuid4().hex[:8]}",
            timestamp=datetime.utcnow(),
            username="guard",
            action="ALERT_ACKNOWLEDGE",
            resource_type="ALERT",
            resource_id=alert.id,
            details={"guard_notes": incident.guard_notes}
        )
        db.add(audit)
        db.commit()

        print(f"\n[{datetime.utcnow().strftime('%H:%M:%S')}] [SOC TRIAGE] Guard Acknowledged Alert: Patrol Officer Dispatched.")
        print(f"[{datetime.utcnow().strftime('%H:%M:%S')}] [AUDIT LOG] Recorded compliance action: ALERT_ACKNOWLEDGE by user 'guard'.")
        print("\n" + "=" * 72)
        print("DEMO RUN COMPLETED SUCCESSFULLY! All records live in SQLite DB.")
        print("=" * 72)

    except Exception as e:
        db.rollback()
        print(f"Demo error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    run_demo_scenario()
