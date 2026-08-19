from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database.session import engine, Base, auto_migrate_db
from app.api import auth, cameras, zones, alerts, incidents, visitors, analytics, audit, system, websocket, ai

# Create DB tables & run lightweight column migrations
Base.metadata.create_all(bind=engine)
auto_migrate_db()

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    description="SentinelAI — AI-Powered CCTV Security Awareness & Incident Intelligence Platform."
)

# Enable CORS for Next.js frontend and local file protocols
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_origin_regex=".*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router, prefix=settings.API_V1_STR, tags=["Authentication & RBAC"])
app.include_router(cameras.router, prefix=settings.API_V1_STR, tags=["Cameras"])
app.include_router(zones.router, prefix=settings.API_V1_STR, tags=["Spatial Zones"])
app.include_router(alerts.router, prefix=settings.API_V1_STR, tags=["Alerts"])
app.include_router(incidents.router, prefix=settings.API_V1_STR, tags=["Incidents & Timeline"])
app.include_router(visitors.router, prefix=settings.API_V1_STR, tags=["Visitor Directory"])
app.include_router(analytics.router, prefix=settings.API_V1_STR, tags=["Analytics"])
app.include_router(audit.router, prefix=settings.API_V1_STR, tags=["Audit Trail"])
app.include_router(system.router, prefix=settings.API_V1_STR, tags=["System & Telemetry"])
app.include_router(ai.router, prefix=settings.API_V1_STR, tags=["Gemini AI Layer"])
app.include_router(websocket.router, tags=["WebSockets"])

@app.get("/")
def root():
    return {
        "status": "online",
        "system": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "docs": "/docs"
    }
