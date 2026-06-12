from __future__ import annotations

from uuid import UUID

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from src.api.deps import get_db, require_roles
from src.models.user import User
from src.schemas.product import (
    ProductCreate,
    ProductListResponse,
    ProductResponse,
    ProductUpdate,
)
from src.services.product_service import ProductService

router = APIRouter(prefix="/api/products", tags=["Products"])


@router.get("", response_model=ProductListResponse)
async def list_products(
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    category: str | None = None,
    search: str | None = None,
    sort: str = Query("-created_at", pattern=r"^[+-]?\w+$"),
    db: AsyncSession = Depends(get_db),  # noqa: B008
) -> ProductListResponse:
    svc = ProductService(db)
    items, total = await svc.list_products(
        page=page, size=size, category=category, search=search, sort=sort
    )
    return ProductListResponse(
        items=[ProductResponse.model_validate(p) for p in items],
        total=total,
        page=page,
        size=size,
        pages=0,
    )


@router.get("/{product_id}", response_model=ProductResponse)
async def get_product(
    product_id: UUID,
    db: AsyncSession = Depends(get_db),  # noqa: B008
) -> ProductResponse:
    svc = ProductService(db)
    product = await svc.get_product(product_id)
    return ProductResponse.model_validate(product)


@router.post("", status_code=201, response_model=ProductResponse)
async def create_product(
    body: ProductCreate,
    db: AsyncSession = Depends(get_db),  # noqa: B008
    _: User = Depends(require_roles("admin", "manager")),  # noqa: B008
) -> ProductResponse:
    svc = ProductService(db)
    product = await svc.create_product(body)
    await db.commit()
    return ProductResponse.model_validate(product)


@router.put("/{product_id}", response_model=ProductResponse)
async def update_product(
    product_id: UUID,
    body: ProductUpdate,
    db: AsyncSession = Depends(get_db),  # noqa: B008
    _: User = Depends(require_roles("admin", "manager")),  # noqa: B008
) -> ProductResponse:
    svc = ProductService(db)
    product = await svc.update_product(product_id, body)
    await db.commit()
    return ProductResponse.model_validate(product)


@router.delete("/{product_id}", status_code=204, response_model=None)
async def delete_product(
    product_id: UUID,
    db: AsyncSession = Depends(get_db),  # noqa: B008
    _: User = Depends(require_roles("admin")),  # noqa: B008
) -> None:
    svc = ProductService(db)
    await svc.soft_delete_product(product_id)
    await db.commit()
