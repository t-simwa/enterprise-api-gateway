from __future__ import annotations

from datetime import datetime
from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, Field

from src.schemas.common import PaginatedResponse


class ProductCreate(BaseModel):
    sku: str = Field(..., min_length=3, max_length=50, pattern=r"^[A-Z0-9-]+$")
    name: str = Field(..., min_length=1, max_length=200)
    description: str | None = None
    category: str | None = Field(None, max_length=100)
    unit_price: Decimal = Field(..., gt=0)
    unit_cost: Decimal | None = Field(None)
    reorder_point: int = Field(default=10, ge=0)


class ProductUpdate(BaseModel):
    name: str | None = Field(None, max_length=200)
    description: str | None = None
    category: str | None = Field(None, max_length=100)
    unit_price: Decimal | None = Field(None, gt=0)
    unit_cost: Decimal | None = Field(None)
    reorder_point: int | None = Field(None, ge=0)


class ProductResponse(BaseModel):
    id: UUID
    sku: str
    name: str
    description: str | None
    category: str | None
    unit_price: Decimal
    unit_cost: Decimal | None
    reorder_point: int
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class ProductListResponse(PaginatedResponse):
    items: list[ProductResponse]
