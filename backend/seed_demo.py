import sys
import os
from datetime import datetime, timedelta

# Ensure backend root is on sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.database.session import SessionLocal, engine, Base
from app.models.camera import Camera
from app.models.person import AuthorizedPerson, ExpectedVisitor
from app.models.event import DetectionEvent
from app.models.alert import Alert

def seed():
    print("Initializing Database tables...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # Clear existing data for clean re-seeding
        db.query(Alert).delete()
        db.query(DetectionEvent).delete()
        db.query(ExpectedVisitor).delete()
        db.query(AuthorizedPerson).delete()
        db.query(Camera).delete()

        print("Seeding Cameras...")
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
        db.add_all(cameras)

        print("Seeding Authorized Persons & Residents...")
        residents = [
            AuthorizedPerson(
                id="p-01",
                full_name="Dr. Sarah Jenkins",
                identity_type="RESIDENT",
                unit_number="A-402",
                access_level="FULL_RESIDENT",
                notes="Primary resident, vehicle CA-9801",
            ),
            AuthorizedPerson(
                id="p-02",
                full_name="Marcus Vance",
                identity_type="RESIDENT",
                unit_number="B-104",
                access_level="FULL_RESIDENT",
                notes="HOA Board Member",
            ),
            AuthorizedPerson(
                id="p-03",
                full_name="Elena Rostova",
                identity_type="CONTRACTOR",
                unit_number="FACILITIES",
                access_level="RESTRICTED_DAYTIME",
                notes="Landscape maintenance head",
            ),
        ]
        db.add_all(residents)

        print("Seeding Expected Visitors...")
        visitors = [
            ExpectedVisitor(
                id="v-01",
                visitor_name="Robert Chen",
                resident_host_name="Dr. Sarah Jenkins (A-402)",
                unit_number="A-402",
                vehicle_number="NY-4591",
                valid_from=datetime.utcnow(),
                valid_until=datetime.utcnow() + timedelta(days=1),
                status="PENDING",
            ),
            ExpectedVisitor(
                id="v-02",
                visitor_name="FedEx Express Courier",
                resident_host_name="Building Reception",
                unit_number="LOBBY",
                vehicle_number="US-8812",
                valid_from=datetime.utcnow(),
                valid_until=datetime.utcnow() + timedelta(hours=4),
                status="CHECKED_IN",
            ),
        ]
        db.add_all(visitors)

        print("Seeding High Priority Alerts...")
        alerts = [
            Alert(
                id="alt-101",
                event_id="evt-801",
                camera_id="cam-02",
                risk_score=85,
                risk_level="HIGH",
                risk_reasons=[
                    "Unrecognized Person (+25)",
                    "Restricted Zone Violation (+30)",
                    "Extended Dwell Time 24s (+15)",
                    "No Active Visitor Reg (+15)",
                ],
                entity_label="Track #0104 (Unrecognized)",
                identity_type="UNRECOGNIZED",
                dwell_time_seconds=24,
                status="ACTIVE",
                created_at=datetime.utcnow() - timedelta(minutes=2),
                action_protocol={
                    "who": "Unrecognized Subject (Track #0104)",
                    "where": "Perimeter Fence South (Restricted Zone)",
                    "when": "2 minutes ago",
                    "what": "Person loitering near restricted fence boundary for 24s",
                    "why": [
                        "No matching face/embedding in Resident DB",
                        "Boundary zone marked strict restricted",
                        "Extended dwell duration exceeds threshold",
                    ],
                    "recommended_action": "Dispatch patrol guard to verify identity or escort off premises.",
                },
            ),
            Alert(
                id="alt-102",
                event_id="evt-802",
                camera_id="cam-01",
                risk_score=60,
                risk_level="ELEVATED",
                risk_reasons=["Unrecognized Person (+25)", "No Active Visitor Reg (+20)", "Night Access (+15)"],
                entity_label="Track #0109 (Delivery Driver)",
                identity_type="UNRECOGNIZED",
                dwell_time_seconds=12,
                status="ACTIVE",
                created_at=datetime.utcnow() - timedelta(minutes=5),
                action_protocol={
                    "who": "Unrecognized Individual",
                    "where": "Main Gate Access",
                    "when": "5 minutes ago",
                    "what": "Individual approaching intercom without pre-registered QR code",
                    "why": ["Unrecognized face ID", "No expected visitor pass for Unit 402"],
                    "recommended_action": "Verify driver ID over intercom before granting gate open.",
                },
            ),
        ]
        db.add_all(alerts)

        db.commit()
        print("Database seeded successfully!")
    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed()
