from __future__ import annotations

import platform
import time as time_module
from typing import Any
from uuid import UUID

import psutil
from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from src.api.deps import get_db, get_redis, require_roles
from src.exceptions import NotFoundException
from src.models.order import Order
from src.models.user import User
from src.schemas.auth import RoleChangeRequest, UserResponse

router = APIRouter(prefix="/admin", tags=["Admin"])

_start_time = time_module.time()


@router.get("/users", response_model=list[UserResponse])
async def list_users(
    db: AsyncSession = Depends(get_db),  # noqa: B008
    _: User = Depends(require_roles("admin")),  # noqa: B008
) -> list[UserResponse]:
    result = await db.execute(select(User))
    users = result.scalars().all()
    return [UserResponse.model_validate(u) for u in users]


@router.put("/users/{user_id}/role", response_model=UserResponse)
async def change_user_role(
    user_id: UUID,
    body: RoleChangeRequest,
    db: AsyncSession = Depends(get_db),  # noqa: B008
    _: User = Depends(require_roles("admin")),  # noqa: B008
) -> UserResponse:
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if user is None:
        raise NotFoundException("User", str(user_id))
    user.role = body.role
    await db.flush()
    await db.refresh(user)
    return UserResponse.model_validate(user)


@router.get("/logs")
async def get_logs(
    _: User = Depends(require_roles("admin")),  # noqa: B008
) -> dict[str, Any]:
    log_file = "logs/api.log"
    lines: list[str] = []
    try:
        with open(log_file, encoding="utf-8") as f:
            all_lines = f.readlines()
            lines = all_lines[-100:]
    except (FileNotFoundError, OSError):
        lines = ["Log file not available"]
    return {"logs": lines, "total_lines": len(lines)}


@router.get("/metrics")
async def get_system_metrics(
    _: User = Depends(require_roles("admin")),  # noqa: B008
) -> dict[str, Any]:
    uptime_seconds = time_module.time() - _start_time
    return {
        "uptime_seconds": round(uptime_seconds, 2),
        "platform": platform.platform(),
        "cpu_percent": psutil.cpu_percent(interval=0.1),
        "memory_percent": psutil.virtual_memory().percent,
        "memory_available_mb": round(
            psutil.virtual_memory().available / 1024 / 1024, 2
        ),
        "disk_usage_percent": psutil.disk_usage("/").percent,
    }


@router.post("/cache/clear")
async def clear_cache(
    redis: Any = Depends(get_redis),  # noqa: B008
    _: User = Depends(require_roles("admin")),  # noqa: B008
) -> dict[str, str]:
    await redis.flushall()
    return {"status": "cache cleared"}


@router.get("/api-usage")
async def get_api_usage(
    db: AsyncSession = Depends(get_db),  # noqa: B008
    _: User = Depends(require_roles("admin")),  # noqa: B008
) -> dict[str, Any]:
    total_users_result = await db.execute(
        select(func.count()).select_from(select(User).subquery())
    )
    total_users: int = total_users_result.scalar() or 0

    total_orders_result = await db.execute(
        select(func.count()).select_from(select(Order).subquery())
    )
    total_orders: int = total_orders_result.scalar() or 0

    return {
        "total_users": total_users,
        "total_orders": total_orders,
        "metrics": "/admin/metrics",
        "logs": "/admin/logs",
    }
