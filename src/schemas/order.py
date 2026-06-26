from __future__ import annotations

from datetime import datetime
from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, EmailStr, Field


class OrderItemCreate(BaseModel):
    product_id: UUID
    quantity: int = Field(..., gt=0)


class OrderCreate(BaseModel):
    customer_name: str = Field(..., min_length=1, max_length=200)
    customer_email: EmailStr | None = None
    items: list[OrderItemCreate] = Field(..., min_length=1)


class OrderStatusUpdate(BaseModel):
    status: str = Field(
        ...,
        pattern=r"^(confirmed|processing|shipped|delivered|cancelled|returned)$",
    )
    notes: str | None = None


class OrderItemResponse(BaseModel):
    id: UUID
    product_id: UUID
    product_name: str
    sku: str
    quantity: int
    unit_price: Decimal
    total_price: Decimal

    model_config = {"from_attributes": True}


class OrderResponse(BaseModel):
    id: UUID
    order_number: str
    customer_name: str
    customer_email: str | None
    status: str
    total_amount: Decimal
    notes: str | None
    items: list[OrderItemResponse]
    items_count: int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class OrderEventResponse(BaseModel):
    id: UUID
    from_status: str | None
    to_status: str
    notes: str | None
    created_by_name: str | None
    created_at: datetime

    model_config = {"from_attributes": True}


class DashboardResponse(BaseModel):
    total_orders: int
    total_revenue: Decimal
    avg_processing_hours: float
    orders_by_status: dict[str, int]
    orders_today: int
    pending_orders_count: int
    low_stock_count: int
