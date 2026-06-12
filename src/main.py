from __future__ import annotations

import logging
from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager
from datetime import datetime
from logging.handlers import TimedRotatingFileHandler

import structlog
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from redis import asyncio as aioredis
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from sqlalchemy import text

from src.api.auth import router as auth_router
from src.api.health import router as health_router
from src.config import settings
from src.database import engine
from src.exceptions import AppException
from src.limiter import limiter
from src.middleware.request_id import RequestIDMiddleware

logger = structlog.get_logger(__name__)

_file_handler = TimedRotatingFileHandler(
    filename="logs/api.log",
    when="midnight",
    interval=1,
    backupCount=30,
    encoding="utf-8",
)
_file_handler.setLevel(getattr(logging, settings.LOG_LEVEL.upper()))
_file_handler.setFormatter(logging.Formatter("%(message)s"))
logging.getLogger().addHandler(_file_handler)


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    logger.info("Starting up...")
    async with engine.begin() as conn:
        await conn.run_sync(lambda sync_conn: sync_conn.execute(text("SELECT 1")))
    logger.info("Database connection verified")
    r = aioredis.from_url(str(settings.REDIS_URL))  # type: ignore[no-untyped-call]
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

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)  # type: ignore[arg-type]

app.add_middleware(RequestIDMiddleware)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/auth", tags=["Authentication"])
app.include_router(health_router, prefix="", tags=["Health"])


@app.exception_handler(AppException)
async def app_exception_handler(request: Request, exc: AppException) -> JSONResponse:
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "status": "error",
            "code": exc.code,
            "message": exc.message,
            "details": exc.details,
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "request_id": getattr(request.state, "request_id", None),
        },
    )


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    req_id = getattr(request.state, "request_id", None)
    logger.error("Unhandled exception", exc_info=exc, request_id=req_id)
    return JSONResponse(
        status_code=500,
        content={
            "status": "error",
            "code": "INTERNAL_ERROR",
            "message": "An unexpected error occurred",
            "details": {},
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "request_id": getattr(request.state, "request_id", None),
        },
    )
# app.include_router(auth_router, prefix="/auth", tags=["Authentication"])
# app.include_router(products_router, prefix="/api/products", tags=["Products"])
# app.include_router(inventory_router, prefix="/api/inventory", tags=["Inventory"])
# app.include_router(warehouses_router, prefix="/api/warehouses", tags=["Warehouses"])
# app.include_router(orders_router, prefix="/api/orders", tags=["Orders"])
# app.include_router(admin_router, prefix="/admin", tags=["Admin"])
# app.include_router(ws_router)
