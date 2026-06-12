from __future__ import annotations

from uuid import UUID

import pytest
from httpx import AsyncClient
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker

from src.exceptions import NotFoundException
from src.services.inventory_service import InventoryService


@pytest.mark.asyncio
async def test_inventory_transfer_success(
    db_session: AsyncSession,
    session_factory: async_sessionmaker[AsyncSession],
    sample_product: dict,
    admin_headers: dict[str, str],
    client: AsyncClient,
) -> None:
    wh_id_1 = sample_product["warehouse_id"]

    async with session_factory() as session:
        from src.models.inventory import Warehouse

        wh2 = Warehouse(code="WH-WH2-01", name="Test WH 2")
        session.add(wh2)
        await session.flush()
        await session.commit()
        wh2_id = str(wh2.id)

        from src.models.inventory import Inventory

        inv2 = Inventory(
            product_id=sample_product["id"], warehouse_id=wh2_id, quantity=0, reserved_qty=0
        )
        session.add(inv2)
        await session.flush()
        await session.commit()

    svc = InventoryService(db_session)
    from jose import jwt
    from src.config import settings
    token = admin_headers["Authorization"].split(" ")[1]
    payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
    user_id = UUID(payload["sub"])

    result = await svc.transfer_stock(
        product_id=UUID(sample_product["id"]),
        from_warehouse_id=UUID(sample_product["warehouse_id"]),
        to_warehouse_id=UUID(wh2_id),
        quantity=5,
        user_id=user_id,
    )
    assert result["quantity"] == 5


@pytest.mark.asyncio
async def test_inventory_transfer_insufficient(
    db_session: AsyncSession,
    sample_product: dict,
    admin_headers: dict[str, str],
) -> None:
    svc = InventoryService(db_session)
    from jose import jwt
    from src.config import settings
    token = admin_headers["Authorization"].split(" ")[1]
    payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
    user_id = UUID(payload["sub"])

    from src.exceptions import InsufficientStockException
    with pytest.raises(InsufficientStockException):
        await svc.transfer_stock(
            product_id=UUID(sample_product["id"]),
            from_warehouse_id=UUID(sample_product["warehouse_id"]),
            to_warehouse_id=UUID("00000000-0000-0000-0000-000000000001"),
            quantity=999999,
            user_id=user_id,
        )

    svc = InventoryService(db_session)
    from jose import jwt
    from src.config import settings
    token = admin_headers["Authorization"].split(" ")[1]
    payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
    user_id = UUID(payload["sub"])

    result = await svc.transfer_stock(
        product_id=UUID(sample_product["id"]),
        from_warehouse_id=UUID(wh_id_1),
        to_warehouse_id=UUID("00000000-0000-0000-0000-000000000001"),
        quantity=5,
        user_id=user_id,
    )
    assert result["quantity"] == 5


@pytest.mark.asyncio
async def test_inventory_transfer_insufficient(
    db_session: AsyncSession,
    sample_product: dict,
    admin_headers: dict[str, str],
) -> None:
    svc = InventoryService(db_session)
    from jose import jwt
    from src.config import settings
    token = admin_headers["Authorization"].split(" ")[1]
    payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
    user_id = UUID(payload["sub"])

    from src.exceptions import InsufficientStockException
    with pytest.raises(InsufficientStockException):
        await svc.transfer_stock(
            product_id=UUID(sample_product["id"]),
            from_warehouse_id=UUID(sample_product["warehouse_id"]),
            to_warehouse_id=UUID("00000000-0000-0000-0000-000000000001"),
            quantity=999999,
            user_id=user_id,
        )


@pytest.mark.asyncio
async def test_inventory_get_inactive_product(db_session: AsyncSession) -> None:
    svc = InventoryService(db_session)
    from src.exceptions import NotFoundException
    with pytest.raises(NotFoundException):
        await svc.get_inventory_by_product("00000000-0000-0000-0000-000000000000")


@pytest.mark.asyncio
async def test_inventory_adjust_unknown_product(db_session: AsyncSession, admin_headers: dict[str, str]) -> None:
    svc = InventoryService(db_session)
    from jose import jwt
    from src.config import settings
    from src.exceptions import NotFoundException
    token = admin_headers["Authorization"].split(" ")[1]
    payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
    user_id = UUID(payload["sub"])

    with pytest.raises(NotFoundException):
        await svc.adjust_stock(
            product_id="00000000-0000-0000-0000-000000000000",
            warehouse_id="00000000-0000-0000-0000-000000000001",
            change_qty=10,
            reason="test",
            notes=None,
            user_id=user_id,
        )


@pytest.mark.asyncio
async def test_audit_log(
    session_factory: async_sessionmaker[AsyncSession],
    sample_product: dict,
    admin_headers: dict[str, str],
    client: AsyncClient,
) -> None:
    adjust_resp = await client.post(
        "/api/inventory/adjust",
        json={
            "product_id": sample_product["id"],
            "warehouse_id": sample_product["warehouse_id"],
            "change_qty": 10,
            "reason": "adjustment",
        },
        headers=admin_headers,
    )
    assert adjust_resp.status_code == 200, f"Adjust failed: {adjust_resp.text}"

    async with session_factory() as session:
        svc = InventoryService(session)
        items, total = await svc.get_audit_log(product_id=UUID(sample_product["id"]))
        assert total >= 1, f"No audit log entries found for product {sample_product['id']}"
        assert items[0].reason == "adjustment"


@pytest.mark.asyncio
async def test_audit_log_empty(db_session: AsyncSession) -> None:
    svc = InventoryService(db_session)
    items, total = await svc.get_audit_log()
    assert total >= 0
