from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, declarative_base
from app.config import settings

engine = create_engine(
    settings.DATABASE_URL,
    connect_args={"check_same_thread": False} if "sqlite" in settings.DATABASE_URL else {}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def auto_migrate_db():
    """Applies lightweight SQLite column migrations for new fields if DB already exists."""
    if "sqlite" not in settings.DATABASE_URL:
        return

    try:
        with engine.connect() as conn:
            # Check alerts columns
            result = conn.execute(text("PRAGMA table_info(alerts);"))
            alert_cols = [row[1] for row in result.fetchall()]
            if alert_cols:
                for col_name, col_type in [
                    ("severity", "TEXT DEFAULT 'HIGH'"),
                    ("assigned_user_id", "TEXT"),
                    ("acknowledged_at", "DATETIME"),
                    ("ai_summary", "TEXT"),
                    ("ai_risk_explanation", "TEXT"),
                    ("ai_recommended_action", "TEXT"),
                    ("ai_verification_steps", "JSON"),
                    ("ai_uncertainty", "TEXT"),
                    ("ai_generated_at", "DATETIME")
                ]:
                    if col_name not in alert_cols:
                        try:
                            conn.execute(text(f"ALTER TABLE alerts ADD COLUMN {col_name} {col_type};"))
                            conn.commit()
                        except Exception:
                            pass

            # Check cameras columns
            result = conn.execute(text("PRAGMA table_info(cameras);"))
            camera_cols = [row[1] for row in result.fetchall()]
            if camera_cols:
                for col_name, col_type in [
                    ("fps", "FLOAT DEFAULT 30.0"),
                    ("sensitivity", "TEXT DEFAULT 'MEDIUM'"),
                    ("is_enabled", "BOOLEAN DEFAULT 1"),
                    ("description", "TEXT")
                ]:
                    if col_name not in camera_cols:
                        try:
                            conn.execute(text(f"ALTER TABLE cameras ADD COLUMN {col_name} {col_type};"))
                            conn.commit()
                        except Exception:
                            pass

            # Check expected_visitors columns
            result = conn.execute(text("PRAGMA table_info(expected_visitors);"))
            visitor_cols = [row[1] for row in result.fetchall()]
            if visitor_cols:
                for col_name, col_type in [
                    ("pass_id", "TEXT"),
                    ("purpose", "TEXT DEFAULT 'VISIT'"),
                    ("allowed_zones", "JSON"),
                    ("qr_code_data", "TEXT"),
                    ("created_at", "DATETIME")
                ]:
                    if col_name not in visitor_cols:
                        try:
                            conn.execute(text(f"ALTER TABLE expected_visitors ADD COLUMN {col_name} {col_type};"))
                            conn.commit()
                        except Exception:
                            pass


            # Check authorized_persons columns
            result = conn.execute(text("PRAGMA table_info(authorized_persons);"))
            person_cols = [row[1] for row in result.fetchall()]
            if person_cols:
                for col_name, col_type in [
                    ("allowed_zones", "JSON")
                ]:
                    if col_name not in person_cols:
                        try:
                            conn.execute(text(f"ALTER TABLE authorized_persons ADD COLUMN {col_name} {col_type};"))
                            conn.commit()
                        except Exception:
                            pass

    except Exception:
        pass

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
