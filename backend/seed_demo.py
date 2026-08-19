import sys
import os
from datetime import datetime, timedelta
import uuid

# Ensure backend root is on sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.database.session import SessionLocal, engine, Base, auto_migrate_db
from app.models.user import User
from app.models.camera import Camera
from app.models.zone import Zone
from app.models.person import AuthorizedPerson, ExpectedVisitor
from app.models.event import DetectionEvent
from app.models.alert import Alert
from app.models.incident import Incident, IncidentTimelineEvent
from app.models.audit import AuditLog
from app.core.auth import hash_password

def seed():
    print("Initializing Database tables & migrations...")
    Base.metadata.create_all(bind=engine)
    auto_migrate_db()
    db = SessionLocal()


    try:
        # Clear existing data for clean re-seeding
        db.query(AuditLog).delete()
        db.query(IncidentTimelineEvent).delete()
        db.query(Incident).delete()
        db.query(Alert).delete()
        db.query(DetectionEvent).delete()
        db.query(ExpectedVisitor).delete()
        db.query(AuthorizedPerson).delete()
        db.query(Zone).delete()
        db.query(Camera).delete()
        db.query(User).delete()

        print("[1/7] Seeding Users & Security Roles...")
        users = [
            User(
                id="usr-admin",
                username="admin",
                email="admin@sentinelai.local",
                hashed_password=hash_password("admin123"),
                full_name="Chief Security Officer",
                role="ADMIN",
                badge_number="SEC-001",
                is_active=True
            ),
            User(
                id="usr-supervisor",
                username="supervisor",
                email="supervisor@sentinelai.local",
                hashed_password=hash_password("supervisor123"),
                full_name="Elena Vance",
                role="SUPERVISOR",
                badge_number="SEC-014",
                is_active=True
            ),
            User(
                id="usr-guard1",
                username="guard",
                email="guard@sentinelai.local",
                hashed_password=hash_password("guard123"),
                full_name="Officer Marcus Cole",
                role="GUARD",
                badge_number="SEC-108",
                is_active=True
            ),
        ]
        db.add_all(users)

        print("[2/7] Seeding Cameras...")
        cameras = [
            Camera(
                id="cam-01",
                name="Main Gate & Entry",
                location_zone="North Gate Access",
                stream_type="DEMO",
                source_path="../sample_data/demo_security.mp4",
                status="ACTIVE",
                is_restricted_zone=False,
                active_tracks_count=2,
                fps=29.8,
                sensitivity="MEDIUM",
                is_enabled=True,
                description="North perimeter vehicular & pedestrian entrance."
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
                is_enabled=True,
                description="Critical south perimeter boundary fence monitoring."
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
                fps=28.5,
                sensitivity="MEDIUM",
                is_enabled=True,
                description="Main residential lobby & concierge reception desk."
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
                is_enabled=True,
                description="Outdoor residential pool deck and garden amenities."
            ),
        ]
        db.add_all(cameras)

        print("[3/7] Seeding Spatial Polygon Zones...")
        zones = [
            Zone(
                id="zone-01",
                camera_id="cam-02",
                name="Perimeter Fence Line",
                zone_type="RESTRICTED",
                severity="CRITICAL",
                is_restricted=True,
                polygon_coordinates=[[0.05, 0.40], [0.95, 0.40], [0.95, 0.95], [0.05, 0.95]],
                max_dwell_seconds=10,
                rules={"operating_hours": "00:00-24:00", "required_clearance": "SECURITY_PATROL"}
            ),
            Zone(
                id="zone-02",
                camera_id="cam-03",
                name="Lobby Concierge Desk",
                zone_type="LOBBY",
                severity="LOW",
                is_restricted=False,
                polygon_coordinates=[[0.20, 0.30], [0.80, 0.30], [0.80, 0.90], [0.20, 0.90]],
                max_dwell_seconds=60,
                rules={"operating_hours": "06:00-22:00", "required_clearance": "GUEST"}
            ),
            Zone(
                id="zone-03",
                camera_id="cam-01",
                name="Intercom Access Bay",
                zone_type="STAFF_ONLY",
                severity="MEDIUM",
                is_restricted=True,
                polygon_coordinates=[[0.10, 0.20], [0.60, 0.20], [0.60, 0.85], [0.10, 0.85]],
                max_dwell_seconds=20,
                rules={"operating_hours": "00:00-24:00", "required_clearance": "AUTHORIZED"}
            ),
        ]
        db.add_all(zones)

        print("[4/7] Seeding Authorized Residents & Contractors...")
        residents = [
            AuthorizedPerson(
                id="p-01",
                full_name="Dr. Sarah Jenkins",
                identity_type="RESIDENT",
                unit_number="A-402",
                access_level="FULL_RESIDENT",
                allowed_zones=["North Gate Access", "Building A Reception", "Amenities Area"],
                notes="Primary owner, vehicle CA-9801",
            ),
            AuthorizedPerson(
                id="p-02",
                full_name="Marcus Vance",
                identity_type="RESIDENT",
                unit_number="B-104",
                access_level="FULL_RESIDENT",
                allowed_zones=["North Gate Access", "Building A Reception", "Amenities Area"],
                notes="HOA Board Member",
            ),
            AuthorizedPerson(
                id="p-03",
                full_name="Elena Rostova",
                identity_type="CONTRACTOR",
                unit_number="FACILITIES",
                access_level="RESTRICTED_DAYTIME",
                allowed_zones=["North Gate Access", "Amenities Area"],
                notes="Landscape maintenance head",
            ),
        ]
        db.add_all(residents)

        print("[5/7] Seeding Expected Visitor Passes...")
        visitors = [
            ExpectedVisitor(
                id="v-01",
                pass_id="VP-4091",
                visitor_name="Robert Chen",
                resident_host_name="Dr. Sarah Jenkins (A-402)",
                unit_number="A-402",
                purpose="VISIT",
                vehicle_number="NY-4591",
                allowed_zones=["North Gate Access", "Building A Reception"],
                valid_from=datetime.utcnow() - timedelta(hours=1),
                valid_until=datetime.utcnow() + timedelta(days=1),
                status="ACTIVE",
                qr_code_data="PASS:VP-4091:ROBERT_CHEN:A402"
            ),
            ExpectedVisitor(
                id="v-02",
                pass_id="VP-1120",
                visitor_name="FedEx Express Courier",
                resident_host_name="Building Reception",
                unit_number="LOBBY",
                purpose="DELIVERY",
                vehicle_number="US-8812",
                allowed_zones=["North Gate Access", "Building A Reception"],
                valid_from=datetime.utcnow() - timedelta(hours=2),
                valid_until=datetime.utcnow() + timedelta(hours=2),
                status="CHECKED_IN",
                qr_code_data="PASS:VP-1120:FEDEX:LOBBY"
            ),
        ]
        db.add_all(visitors)

        print("[6/7] Seeding High-Priority Explainable Alerts...")
        alerts = [
            Alert(
                id="alt-101",
                event_id="evt-801",
                camera_id="cam-02",
                risk_score=85,
                risk_level="CRITICAL",
                severity="CRITICAL",
                risk_reasons=[
                    "Entered High-Security Restricted Perimeter Zone (+30)",
                    "Visitor authorization not found (+25)",
                    "Dwell time exceeded 24s threshold (+15)",
                    "Event occurred outside normal operating hours (+15)"
                ],
                entity_label="Track #0104 (Unrecognized)",
                identity_type="UNRECOGNIZED",
                dwell_time_seconds=24,
                status="NEW",
                assigned_user_id="usr-guard1",
                created_at=datetime.utcnow() - timedelta(minutes=3),
                action_protocol={
                    "who": "Unrecognized Subject (Track #0104)",
                    "where": "Perimeter Fence South (Restricted Boundary)",
                    "when": "3 minutes ago (Dwell: 24s)",
                    "what": "Individual detected lingering near south perimeter boundary fence.",
                    "why": [
                        "No matching facial embedding or resident badge in registry",
                        "South perimeter sector flagged as strict restricted zone",
                        "Continuous dwell time of 24s exceeds the 10s boundary threshold",
                        "Nighttime event outside approved maintenance hours"
                    ],
                    "recommended_action": "Dispatch on-duty patrol guard to visually verify identity and request credentials."
                },
                ai_summary="An unrecognized individual entered the restricted south perimeter fence boundary and remained stationary for 24 seconds during off-hours with no visitor authorization.",
                ai_risk_explanation="Elevated risk score (85/100) due to strict restricted zone violation (+30), lack of active visitor pass (+25), dwell duration (+15), and temporal off-hours (+15).",
                ai_recommended_action="Dispatch patrol guard Officer Cole to investigate and verify credentials immediately.",
                ai_verification_steps=[
                    "Check live feed on Camera 02 for physical boundary tampering",
                    "Verify if any unannounced maintenance contractors were dispatched",
                    "Challenge subject presence via two-way intercom or on-foot patrol"
                ],
                ai_uncertainty="Subject face partially obscured by ambient night lighting. No weapons detected in camera sector."
            ),
            Alert(
                id="alt-102",
                event_id="evt-802",
                camera_id="cam-01",
                risk_score=60,
                risk_level="HIGH",
                severity="HIGH",
                risk_reasons=[
                    "Visitor authorization not found (+25)",
                    "Extended presence 14s at intercom (+10)",
                    "Event occurred outside normal operating hours (+15)",
                    "Pacing behavior along property boundary (+10)"
                ],
                entity_label="Track #0109 (Delivery Driver)",
                identity_type="UNRECOGNIZED",
                dwell_time_seconds=14,
                status="ACKNOWLEDGED",
                assigned_user_id="usr-guard1",
                created_at=datetime.utcnow() - timedelta(minutes=8),
                acknowledged_at=datetime.utcnow() - timedelta(minutes=7),
                action_protocol={
                    "who": "Unrecognized Individual",
                    "where": "Main Gate & Entry (North Access)",
                    "when": "8 minutes ago (Dwell: 14s)",
                    "what": "Subject attempting gate entry without pre-registered QR pass.",
                    "why": [
                        "No visitor pre-registration for Unit A-402",
                        "Vehicle not matching resident whitelist"
                    ],
                    "recommended_action": "Inquire host resident name over intercom before releasing gate lock."
                }
            ),
        ]
        db.add_all(alerts)

        print("[7/7] Seeding Incidents & Incident Timelines...")
        incident = Incident(
            id="inc-001",
            title="South Perimeter Boundary Violation by Unrecognized Subject",
            camera_id="cam-02",
            alert_id="alt-101",
            severity="CRITICAL",
            status="INVESTIGATING",
            assigned_to="usr-guard1",
            risk_score=85,
            incident_type="RESTRICTED_ZONE_VIOLATION",
            summary="Unrecognized entity detected loitering at south fence line for 24 seconds with no matching visitor authorization.",
            ai_summary="Unrecognized subject loitered in restricted perimeter boundary for 24s. Patrol guard dispatched to verify.",
            guard_notes="Guard Cole en route to south fence post.",
            created_at=datetime.utcnow() - timedelta(minutes=3),
            acknowledged_at=datetime.utcnow() - timedelta(minutes=2)
        )
        db.add(incident)

        timeline_events = [
            IncidentTimelineEvent(
                id="time-01",
                incident_id="inc-001",
                timestamp=datetime.utcnow() - timedelta(minutes=3, seconds=24),
                event_type="DETECTION",
                description="Person detected entering Camera 02 frame field of view."
            ),
            IncidentTimelineEvent(
                id="time-02",
                incident_id="inc-001",
                timestamp=datetime.utcnow() - timedelta(minutes=3, seconds=18),
                event_type="ZONE_ENTRY",
                description="Subject crossed boundary line into 'Perimeter Fence Line' (Restricted Zone)."
            ),
            IncidentTimelineEvent(
                id="time-03",
                incident_id="inc-001",
                timestamp=datetime.utcnow() - timedelta(minutes=3, seconds=10),
                event_type="DWELL_EXCEEDED",
                description="Dwell time exceeded 10s zone threshold."
            ),
            IncidentTimelineEvent(
                id="time-04",
                incident_id="inc-001",
                timestamp=datetime.utcnow() - timedelta(minutes=3, seconds=5),
                event_type="AUTHORIZATION_NOT_FOUND",
                description="Access pass check returned: Authorization not found."
            ),
            IncidentTimelineEvent(
                id="time-05",
                incident_id="inc-001",
                timestamp=datetime.utcnow() - timedelta(minutes=3),
                event_type="ALERT_CREATED",
                description="Critical security alert ALT-101 generated (Risk: 85/100)."
            ),
            IncidentTimelineEvent(
                id="time-06",
                incident_id="inc-001",
                timestamp=datetime.utcnow() - timedelta(minutes=2),
                event_type="ACKNOWLEDGED",
                description="Security Officer Marcus Cole acknowledged alert in SOC dashboard."
            ),
        ]
        db.add_all(timeline_events)

        # Audit logs
        audit_records = [
            AuditLog(
                id=f"aud-{uuid.uuid4().hex[:8]}",
                timestamp=datetime.utcnow() - timedelta(minutes=15),
                username="admin",
                action="SYSTEM_STARTUP",
                resource_type="SYSTEM",
                details={"version": "1.0.0", "engine": "SentinelAI Core"}
            ),
            AuditLog(
                id=f"aud-{uuid.uuid4().hex[:8]}",
                timestamp=datetime.utcnow() - timedelta(minutes=2),
                username="guard",
                action="ALERT_ACKNOWLEDGE",
                resource_type="ALERT",
                resource_id="alt-101",
                details={"status": "INVESTIGATING"}
            ),
        ]
        db.add_all(audit_records)

        db.commit()
        print("Database seeded with production-style realistic security dataset!")
    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed()
