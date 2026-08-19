import os
import logging
from typing import List
from dotenv import load_dotenv

# Load environment variables from .env file if present
load_dotenv()

logger = logging.getLogger("sentinel.config")

class Settings:
    PROJECT_NAME: str = "SentinelAI CCTV Incident Intelligence Platform"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./sentinel_ai.db")
    SAMPLE_VIDEO_PATH: str = os.getenv("SAMPLE_VIDEO_PATH", "../sample_data/demo_security.mp4")
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    
    # Operational Mode & Security Configuration
    DEMO_MODE: bool = os.getenv("DEMO_MODE", "true").lower() in ("true", "1", "yes", "on")
    
    # Secret Key Management (SEC-M01)
    _raw_secret_key: str = os.getenv("SECRET_KEY", "").strip()
    
    @property
    def SECRET_KEY(self) -> str:
        if self._raw_secret_key:
            return self._raw_secret_key
        if self.DEMO_MODE:
            return "sentinel-demo-secret-key-do-not-use-in-production"
        raise RuntimeError(
            "CRITICAL SECURITY CONFIGURATION ERROR: SECRET_KEY environment variable "
            "must be explicitly configured when DEMO_MODE is disabled."
        )

    # CORS Configuration (SEC-L02)
    @property
    def ALLOWED_ORIGINS(self) -> List[str]:
        custom_origins = os.getenv("CORS_ORIGINS", "").strip()
        if custom_origins:
            return [o.strip() for o in custom_origins.split(",") if o.strip()]
        return [
            "http://localhost:3000",
            "http://127.0.0.1:3000",
            "http://localhost:8000",
            "http://127.0.0.1:8000"
        ]

settings = Settings()
