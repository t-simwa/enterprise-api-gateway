from __future__ import annotations

from uuid import UUID

from pydantic import BaseModel, Field


class WarehouseCreate(BaseModel):
    code: str = Field(
        ..., min_length=3, max_length=20, pattern=r"^[A-Z]{2,3}-[A-Z]{3}-\d{2}$"
    )
    name: str = Field(..., min_length=1, max_length=200)
    location: str | None = None


class WarehouseResponse(BaseModel):
    id: UUID
    code: str
    name: str
    location: str | None
    is_active: bool
    created_at: str

    model_config = {"from_attributes": True}


class StockAdjustRequest(BaseModel):
    product_id: UUID
    warehouse_id: UUID
    change_qty: int
    reason: str = Field(
        ...,
        pattern=r"^(purchase|sale|adjustment|transfer|return|damage)$",
    )
    notes: str | None = None


class StockTransferRequest(BaseModel):
    product_id: UUID
    from_warehouse_id: UUID
    to_warehouse_id: UUID
    quantity: int = Field(..., gt=0)


class InventoryItem(BaseModel):
    warehouse_id: UUID
    warehouse_name: str
    warehouse_code: str
    quantity: int
    reserved_qty: int
    available_qty: int


class ProductInventoryResponse(BaseModel):
    product_id: UUID
    sku: str
    name: str
    total_qty: int
    total_reserved: int
    total_available: int
    warehouses: list[InventoryItem]

    model_config = {"from_attributes": True}


class LowStockItem(BaseModel):
    product_id: UUID
    sku: str
    name: str
    category: str | None
    total_qty: int
    reorder_point: int
