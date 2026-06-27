from __future__ import annotations

from typing import Any
from uuid import UUID

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from src.api.deps import get_db, require_roles
from src.models.user import User
from src.schemas.common import PaginatedResponse
from src.schemas.inventory import (
    LowStockItem,
    ProductInventoryResponse,
    StockAdjustRequest,
    StockTransferRequest,
)
from src.services.inventory_service import InventoryService

router = APIRouter(prefix="/api/inventory", tags=["Inventory"])


@router.get("")
async def list_inventory(
    db: AsyncSession = Depends(get_db),  # noqa: B008
) -> list[dict[str, Any]]:
    svc = InventoryService(db)
    return await svc.get_all_inventory()


@router.get("/low-stock", response_model=list[LowStockItem])
async def low_stock(
    threshold: int | None = Query(None, ge=0),
    db: AsyncSession = Depends(get_db),  # noqa: B008
) -> list[LowStockItem]:
    svc = InventoryService(db)
    data = await svc.get_low_stock(threshold)
    return [LowStockItem(**item) for item in data]


@router.get("/audit-log", response_model=PaginatedResponse)
async def audit_log(
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    product_id: UUID | None = None,
    db: AsyncSession = Depends(get_db),  # noqa: B008
) -> PaginatedResponse:
    svc = InventoryService(db)
    items, total = await svc.get_audit_log(
        page=page, size=size, product_id=product_id
    )
    return PaginatedResponse(
        items=[
            {
                "id": str(t.id),
                "product_id": str(t.product_id),
                "warehouse_id": str(t.warehouse_id),
                "change_qty": t.change_qty,
                "reason": t.reason,
                "notes": t.notes,
                "created_by": str(t.created_by) if t.created_by else None,
                "created_at": (
                    t.created_at.isoformat()
                    if hasattr(t, "created_at")
                    else str(t.created_at)
                ),
            }
            for t in items
        ],
        total=total,
        page=page,
        size=size,
        pages=0,
    )


@router.get("/{product_id}", response_model=ProductInventoryResponse)
async def get_inventory(
    product_id: UUID,
    db: AsyncSession = Depends(get_db),  # noqa: B008
) -> ProductInventoryResponse:
    svc = InventoryService(db)
    data = await svc.get_inventory_by_product(product_id)
    return ProductInventoryResponse(**data)


@router.post("/adjust")
async def adjust_stock(
    body: StockAdjustRequest,
    db: AsyncSession = Depends(get_db),  # noqa: B008
    current_user: User = Depends(require_roles("admin", "manager")),  # noqa: B008
) -> dict[str, Any]:
    svc = InventoryService(db)
    result = await svc.adjust_stock(
        product_id=body.product_id,
        warehouse_id=body.warehouse_id,
        change_qty=body.change_qty,
        reason=body.reason,
        notes=body.notes,
        user_id=current_user.id,
    )
    await db.commit()
    return result


@router.post("/transfer")
async def transfer_stock(
    body: StockTransferRequest,
    db: AsyncSession = Depends(get_db),  # noqa: B008
    current_user: User = Depends(require_roles("admin", "manager")),  # noqa: B008
) -> dict[str, Any]:
    svc = InventoryService(db)
    result = await svc.transfer_stock(
        product_id=body.product_id,
        from_warehouse_id=body.from_warehouse_id,
        to_warehouse_id=body.to_warehouse_id,
        quantity=body.quantity,
        user_id=current_user.id,
    )
    await db.commit()
    return result
