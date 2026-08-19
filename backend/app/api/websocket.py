from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query, Depends, status
from sqlalchemy.orm import Session
import json
import asyncio
from typing import List, Optional
from app.config import settings
from app.database.session import get_db
from app.core.auth import decode_token
from app.models.user import User

router = APIRouter()

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        for connection in self.active_connections:
            try:
                await connection.send_text(json.dumps(message))
            except Exception:
                pass

manager = ConnectionManager()

@router.websocket("/ws/alerts")
async def websocket_alerts_endpoint(
    websocket: WebSocket,
    token: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """
    WebSocket endpoint for real-time alert streaming with JWT authentication (SEC-L01).
    Query parameter: /ws/alerts?token=<JWT>
    """
    authenticated = False
    
    if token:
        payload = decode_token(token)
        if payload and payload.get("sub"):
            user = db.query(User).filter(User.id == payload.get("sub"), User.is_active == True).first()
            if user:
                authenticated = True
        
        if not authenticated:
            # Token was provided but is invalid or expired
            await websocket.close(code=status.WS_1008_POLICY_VIOLATION, reason="Invalid or expired authentication token")
            return
            
    elif settings.DEMO_MODE:
        # Seamless demo mode allows connection if token is omitted
        authenticated = True
    else:
        # Production strictly requires token
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION, reason="Authentication token is required")
        return

    await manager.connect(websocket)
    try:
        while True:
            # Keepalive ping loop
            await asyncio.sleep(15)
            await websocket.send_text(json.dumps({"type": "PING", "data": "keepalive"}))
    except WebSocketDisconnect:
        manager.disconnect(websocket)
