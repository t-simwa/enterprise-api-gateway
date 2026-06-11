from __future__ import annotations

import os
import tempfile
import time

from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse
from redis import asyncio as aioredis
from sqlalchemy import text

from src.config import settings
from src.database import async_session
from src.schemas.common import HealthResponse

router = APIRouter(tags=["Health"])
startup_time = time.time()


@router.get("/health")
async def health_check() -> JSONResponse:
    errors: list[str] = []

    db_status = "connected"
    try:
        async with async_session() as session:
            await session.execute(text("SELECT 1"))
    except Exception:
        db_status = "disconnected"
        errors.append("database")

    redis_status = "connected"
    try:
        r = aioredis.from_url(str(settings.REDIS_URL))
        await r.ping()
        await r.aclose()
    except Exception:
        redis_status = "disconnected"
        errors.append("redis")

    disk_status = "writable"
    try:
        with tempfile.NamedTemporaryFile(dir="/tmp", delete=True) as f:
            f.write(b"ok")
    except (OSError, PermissionError):
        disk_status = "readonly"
        errors.append("disk")

    overall = "degraded" if errors else "healthy"
    status_code = 503 if errors else 200

    resp = HealthResponse(
        status=overall,
        database=db_status,
        redis=redis_status,
        disk=disk_status,
        version="1.0.0",
        uptime_seconds=time.time() - startup_time,
    )

    return JSONResponse(content=resp.model_dump(), status_code=status_code)


@router.get("/")
async def root() -> dict:
    return {
        "name": "Enterprise Inventory & Order Management API",
        "version": "1.0.0",
        "docs": "/docs",
        "redoc": "/redoc",
    }
