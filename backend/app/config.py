import os
from dotenv import load_dotenv

# Load environment variables from .env file if present
load_dotenv()

class Settings:
    PROJECT_NAME: str = "SentinelAI Residential CCTV Alerting System"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./sentinel_ai.db")
    SAMPLE_VIDEO_PATH: str = os.getenv("SAMPLE_VIDEO_PATH", "../sample_data/demo_security.mp4")
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")

settings = Settings()
