from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.api.deps import get_db, require_roles
from src.models.inventory import Warehouse
from src.models.user import User
from src.schemas.inventory import WarehouseCreate, WarehouseResponse

router = APIRouter(prefix="/api/warehouses", tags=["Warehouses"])


@router.get("", response_model=list[WarehouseResponse])
async def list_warehouses(
    db: AsyncSession = Depends(get_db),  # noqa: B008
) -> list[WarehouseResponse]:
    result = await db.execute(select(Warehouse).where(Warehouse.is_active))
    warehouses = result.scalars().all()
    return [WarehouseResponse.model_validate(w) for w in warehouses]


@router.post("", status_code=201, response_model=WarehouseResponse)
async def create_warehouse(
    body: WarehouseCreate,
    db: AsyncSession = Depends(get_db),  # noqa: B008
    _: User = Depends(require_roles("admin")),  # noqa: B008
) -> WarehouseResponse:
    wh = Warehouse(code=body.code, name=body.name, location=body.location)
    db.add(wh)
    await db.flush()
    await db.refresh(wh)
    await db.commit()
    return WarehouseResponse.model_validate(wh)
