from __future__ import annotations

from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager

import structlog
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from redis import asyncio as aioredis
from sqlalchemy import text

from src.api.health import router as health_router
from src.config import settings
from src.database import engine

logger = structlog.get_logger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    logger.info("Starting up...")
    async with engine.begin() as conn:
        await conn.run_sync(lambda sync_conn: sync_conn.execute(text("SELECT 1")))
    logger.info("Database connection verified")
    r = aioredis.from_url(str(settings.REDIS_URL))
    await r.ping()
    await r.aclose()
    logger.info("Redis connection verified")
    yield
    logger.info("Shutting down...")
    await engine.dispose()


app = FastAPI(
    title="Enterprise Inventory & Order Management API",
    description="Real-time inventory tracking across 5 warehouses with order processing",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_router, prefix="", tags=["Health"])
# app.include_router(auth_router, prefix="/auth", tags=["Authentication"])
# app.include_router(products_router, prefix="/api/products", tags=["Products"])
# app.include_router(inventory_router, prefix="/api/inventory", tags=["Inventory"])
# app.include_router(warehouses_router, prefix="/api/warehouses", tags=["Warehouses"])
# app.include_router(orders_router, prefix="/api/orders", tags=["Orders"])
# app.include_router(admin_router, prefix="/admin", tags=["Admin"])
# app.include_router(ws_router)
