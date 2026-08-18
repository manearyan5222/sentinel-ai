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
    """Applies lightweight SQLite column migrations for new Gemini fields if DB already exists."""
    if "sqlite" not in settings.DATABASE_URL:
        return

    try:
        with engine.connect() as conn:
            # Check existing columns in 'alerts'
            result = conn.execute(text("PRAGMA table_info(alerts);"))
            columns = [row[1] for row in result.fetchall()]
            
            if columns: # Table exists
                new_columns = [
                    ("ai_summary", "TEXT"),
                    ("ai_risk_explanation", "TEXT"),
                    ("ai_recommended_action", "TEXT"),
                    ("ai_verification_steps", "JSON"),
                    ("ai_uncertainty", "TEXT"),
                    ("ai_generated_at", "DATETIME")
                ]
                for col_name, col_type in new_columns:
                    if col_name not in columns:
                        try:
                            conn.execute(text(f"ALTER TABLE alerts ADD COLUMN {col_name} {col_type};"))
                            conn.commit()
                        except Exception as e:
                            pass
    except Exception as e:
        pass

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
