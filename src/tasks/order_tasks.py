from __future__ import annotations

from typing import Any
from uuid import UUID

import structlog

from src.celery_app import celery_app
from src.database import async_session
from src.services.order_service import OrderService

logger = structlog.get_logger(__name__)


@celery_app.task(bind=True, max_retries=3, default_retry_delay=60)  # type: ignore[misc]
def batch_create_orders_task(
    self: Any, items_data: list[dict[str, Any]], user_id: str
) -> dict[str, Any]:
    import asyncio

    async def _run() -> dict[str, Any]:
        async with async_session() as db:
            service = OrderService(db)
            results: dict[str, Any] = {
                "success_count": 0,
                "failure_count": 0,
                "errors": [],
            }
            for item in items_data:
                try:
                    order = await service.create_order(
                        customer_name=item["customer_name"],
                        customer_email=item.get("customer_email"),
                        items=item["items"],
                        user_id=UUID(user_id),
                    )
                    results["success_count"] += 1
                    logger.info("batch.order.created", order_number=order.order_number)
                except Exception as e:
                    results["failure_count"] += 1
                    results["errors"].append({"item": item, "error": str(e)})
                    logger.error("batch.order.failed", error=str(e))
            return results

    return asyncio.run(_run())
