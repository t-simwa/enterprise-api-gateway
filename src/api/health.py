from __future__ import annotations

from fastapi import APIRouter
from sqlalchemy import text

from src.database import async_session

router = APIRouter(tags=["Health"])


@router.get("/health")
async def health_check() -> dict:
    async with async_session() as session:
        await session.execute(text("SELECT 1"))
    return {"status": "healthy", "database": "connected"}


@router.get("/")
async def root() -> dict:
    return {
        "name": "Enterprise Inventory & Order Management API",
        "version": "1.0.0",
        "docs": "/docs",
        "redoc": "/redoc",
    }
