from __future__ import annotations

from datetime import UTC, datetime, timedelta
from typing import TYPE_CHECKING, Any

from sqlalchemy import func, select

from src.models.order import Order

if TYPE_CHECKING:
    from sqlalchemy.ext.asyncio import AsyncSession


class AnalyticsService:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def get_daily_revenue(self, days: int) -> list[dict[str, Any]]:
        since = datetime.now(tz=UTC) - timedelta(days=days)
        result = await self.db.execute(
            select(
                func.date(Order.created_at).label("date"),
                func.coalesce(func.sum(Order.total_amount), 0).label("revenue"),
            )
            .where(
                Order.status.in_(["delivered", "returned"]),
                Order.created_at >= since,
            )
            .group_by(func.date(Order.created_at))
            .order_by(func.date(Order.created_at))
        )
        return [
            {"date": str(row.date), "revenue": float(row.revenue)}
            for row in result.all()
        ]
