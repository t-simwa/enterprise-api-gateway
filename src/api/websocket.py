from __future__ import annotations

import contextlib
from datetime import datetime
from typing import Any

import structlog
from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from src.api.deps import get_current_user_ws

logger = structlog.get_logger(__name__)


class ConnectionManager:
    def __init__(self) -> None:
        self.active_connections: dict[str, list[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, user_id: str) -> None:
        await websocket.accept()
        self.active_connections.setdefault(user_id, []).append(websocket)
        logger.info("ws.connected", user_id=user_id)

    def disconnect(self, websocket: WebSocket, user_id: str) -> None:
        if user_id in self.active_connections:
            self.active_connections[user_id].remove(websocket)
            if not self.active_connections[user_id]:
                del self.active_connections[user_id]
        logger.info("ws.disconnected", user_id=user_id)

    async def broadcast_to_user(self, user_id: str, message: dict[str, Any]) -> None:
        if user_id not in self.active_connections:
            return
        for ws in self.active_connections[user_id]:
            with contextlib.suppress(Exception):
                await ws.send_json(message)

    async def broadcast_to_all(self, message: dict[str, Any]) -> None:
        for user_id in list(self.active_connections.keys()):
            await self.broadcast_to_user(user_id, message)

    async def broadcast_low_stock_alert(
        self,
        product_id: str,
        product_name: str,
        sku: str,
        current_stock: int,
        reorder_point: int,
        warehouse_id: str,
    ) -> None:
        await self.broadcast_to_all({
            "type": "low_stock_alert",
            "product_id": product_id,
            "product_name": product_name,
            "sku": sku,
            "current_stock": current_stock,
            "reorder_point": reorder_point,
            "warehouse_id": warehouse_id,
            "timestamp": datetime.utcnow().isoformat() + "Z",
        })


manager = ConnectionManager()
router = APIRouter()


@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket, token: str = "") -> None:
    try:
        user = await get_current_user_ws(token)
    except Exception as exc:
        logger.warning("ws.auth_failed", error=str(exc))
        await websocket.close(code=4001)
        return

    await manager.connect(websocket, str(user.id))
    try:
        while True:
            data = await websocket.receive_text()
            if data == "ping":
                await websocket.send_json({"type": "pong"})
    except WebSocketDisconnect:
        manager.disconnect(websocket, str(user.id))
    except Exception as exc:
        logger.error("ws.error", error=str(exc))
        manager.disconnect(websocket, str(user.id))
