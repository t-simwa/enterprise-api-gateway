from __future__ import annotations

import csv
import io
from typing import Any
from uuid import UUID

from fastapi import APIRouter, BackgroundTasks, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from starlette.responses import StreamingResponse

from src.api.deps import get_db, require_roles
from src.models.order import Order
from src.models.user import User
from src.schemas.common import PaginatedResponse
from src.schemas.order import (
    DashboardResponse,
    OrderCreate,
    OrderEventResponse,
    OrderItemResponse,
    OrderResponse,
    OrderStatusUpdate,
)
from src.services.order_service import OrderService

router = APIRouter(prefix="/api/orders", tags=["Orders"])


def _build_order_response(order: Order) -> OrderResponse:
    return OrderResponse(
        id=order.id,
        order_number=order.order_number,
        customer_name=order.customer_name,
        customer_email=order.customer_email,
        status=order.status,
        total_amount=order.total_amount,
        notes=order.notes,
        items=[
            OrderItemResponse(
                id=item.id,
                product_id=item.product_id,
                product_name=item.product.name if item.product else "",
                sku=item.product.sku if item.product else "",
                quantity=item.quantity,
                unit_price=item.unit_price,
                total_price=item.total_price,
            )
            for item in order.items
        ],
        created_at=order.created_at,
        updated_at=order.created_at,
    )


def _build_order_response_list(orders: list[Order]) -> list[OrderResponse]:
    return [_build_order_response(o) for o in orders]


@router.post("", status_code=201, response_model=OrderResponse)
async def create_order(
    body: OrderCreate,
    db: AsyncSession = Depends(get_db),  # noqa: B008
    current_user: User = Depends(require_roles("admin", "manager")),  # noqa: B008
) -> OrderResponse:
    svc = OrderService(db)
    order = await svc.create_order(
        customer_name=body.customer_name,
        customer_email=body.customer_email,
        items=[item.model_dump() for item in body.items],
        user_id=current_user.id,
    )
    await db.commit()
    order = await svc.get_order(order.id)
    return _build_order_response(order)


@router.get("", response_model=PaginatedResponse)
async def list_orders(
    status: str | None = None,
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),  # noqa: B008
) -> PaginatedResponse:
    svc = OrderService(db)
    items, total = await svc.list_orders(status=status, page=page, size=size)
    return PaginatedResponse(
        items=[o.model_dump() for o in _build_order_response_list(items)],
        total=total,
        page=page,
        size=size,
        pages=0,
    )


@router.get("/search", response_model=PaginatedResponse)
async def search_orders(
    q: str = Query(..., min_length=1),
    status: str | None = None,
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),  # noqa: B008
) -> PaginatedResponse:
    svc = OrderService(db)
    items, total = await svc.search_orders(
        query_str=q, status=status, page=page, size=size
    )
    return PaginatedResponse(
        items=[o.model_dump() for o in _build_order_response_list(items)],
        total=total,
        page=page,
        size=size,
        pages=0,
    )


@router.get("/dashboard", response_model=DashboardResponse)
async def dashboard(
    db: AsyncSession = Depends(get_db),  # noqa: B008
) -> DashboardResponse:
    svc = OrderService(db)
    data = await svc.get_dashboard()
    return DashboardResponse(**data)


@router.get("/{order_id}", response_model=OrderResponse)
async def get_order(
    order_id: UUID,
    db: AsyncSession = Depends(get_db),  # noqa: B008
) -> OrderResponse:
    svc = OrderService(db)
    order = await svc.get_order(order_id)
    return _build_order_response(order)


@router.put("/{order_id}/status", response_model=OrderResponse)
async def update_order_status(
    order_id: UUID,
    body: OrderStatusUpdate,
    db: AsyncSession = Depends(get_db),  # noqa: B008
    current_user: User = Depends(require_roles("admin", "manager")),  # noqa: B008
) -> OrderResponse:
    svc = OrderService(db)
    order = await svc.update_status(
        order_id=order_id,
        new_status=body.status,
        notes=body.notes,
        user_id=current_user.id,
    )
    await db.commit()
    order = await svc.get_order(order.id)
    return _build_order_response(order)


@router.post("/{order_id}/cancel", response_model=OrderResponse)
async def cancel_order(
    order_id: UUID,
    db: AsyncSession = Depends(get_db),  # noqa: B008
    current_user: User = Depends(require_roles("admin")),  # noqa: B008
) -> OrderResponse:
    svc = OrderService(db)
    order = await svc.cancel_order(order_id, current_user.id)
    await db.commit()
    order = await svc.get_order(order.id)
    return _build_order_response(order)


@router.post("/{order_id}/return", response_model=OrderResponse)
async def return_order(
    order_id: UUID,
    db: AsyncSession = Depends(get_db),  # noqa: B008
    current_user: User = Depends(require_roles("admin", "manager")),  # noqa: B008
) -> OrderResponse:
    svc = OrderService(db)
    order = await svc.process_return(order_id, current_user.id)
    await db.commit()
    order = await svc.get_order(order.id)
    return _build_order_response(order)


@router.get("/{order_id}/timeline", response_model=list[OrderEventResponse])
async def get_timeline(
    order_id: UUID,
    db: AsyncSession = Depends(get_db),  # noqa: B008
) -> list[OrderEventResponse]:
    svc = OrderService(db)
    events = await svc.get_order_timeline(order_id)
    return [
        OrderEventResponse(
            id=e.id,
            from_status=e.from_status,
            to_status=e.to_status,
            notes=e.notes,
            created_by_name=e.user.full_name if e.user else None,
            created_at=e.created_at,
        )
        for e in events
    ]


@router.get("/export/csv")
async def export_orders_csv(
    status: str | None = None,
    db: AsyncSession = Depends(get_db),  # noqa: B008
    _current_user: User = Depends(require_roles("admin", "manager")),  # noqa: B008
) -> StreamingResponse:
    svc = OrderService(db)
    items, _ = await svc.list_orders(status=status, page=1, size=10000)
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "order_number", "customer_name", "customer_email", "status",
        "total_amount", "items_count", "created_at",
    ])
    for order in items:
        writer.writerow([
            order.order_number,
            order.customer_name,
            order.customer_email or "",
            order.status,
            str(order.total_amount),
            len(order.items),
            order.created_at.isoformat() if order.created_at else "",
        ])
    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=orders_export.csv"},
    )


@router.post("/batch", status_code=202)
async def batch_create_orders(
    body: list[OrderCreate],
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),  # noqa: B008
    current_user: User = Depends(require_roles("admin")),  # noqa: B008
) -> dict[str, Any]:
    from src.tasks.order_tasks import batch_create_orders_task

    task = batch_create_orders_task.delay(
        [item.model_dump(mode="json") for item in body],
        str(current_user.id),
    )
    return {"task_id": task.id, "status": "submitted", "total_items": len(body)}
