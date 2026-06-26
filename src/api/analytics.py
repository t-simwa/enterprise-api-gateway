from __future__ import annotations

from typing import Any

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from src.api.deps import get_db
from src.services.analytics_service import AnalyticsService

router = APIRouter(prefix="/api/analytics", tags=["Analytics"])


@router.get("/revenue")
async def revenue_series(
    days: int = Query(30, ge=1, le=365),
    db: AsyncSession = Depends(get_db),
) -> list[dict[str, Any]]:
    svc = AnalyticsService(db)
    return await svc.get_daily_revenue(days)
