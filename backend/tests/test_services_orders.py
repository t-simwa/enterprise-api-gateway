from __future__ import annotations

from uuid import UUID

import pytest
from httpx import AsyncClient
from jose import jwt
from sqlalchemy.ext.asyncio import AsyncSession

from src.config import settings
from src.exceptions import ConflictException, NotFoundException
from src.services.order_service import OrderService


def _user_id_from_headers(headers: dict[str, str]) -> UUID:
    token = headers["Authorization"].split(" ")[1]
    payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
    return UUID(payload["sub"])


@pytest.mark.asyncio
async def test_cancel_non_pending_confirmed(
    db_session: AsyncSession, sample_product: dict, admin_headers: dict[str, str], client: AsyncClient
) -> None:
    create_resp = await client.post(
        "/api/orders",
        json={
            "customer_name": "Cancel Test",
            "items": [{"product_id": sample_product["id"], "quantity": 1}],
        },
        headers=admin_headers,
    )
    order_id = create_resp.json()["id"]

    await client.put(
        f"/api/orders/{order_id}/status",
        json={"status": "confirmed"},
        headers=admin_headers,
    )

    svc = OrderService(db_session)
    user_id = _user_id_from_headers(admin_headers)
    order = await svc.cancel_order(order_id, user_id)
    assert order.status == "cancelled"


@pytest.mark.asyncio
async def test_cancel_invalid_status(
    db_session: AsyncSession, sample_product: dict, admin_headers: dict[str, str], client: AsyncClient
) -> None:
    create_resp = await client.post(
        "/api/orders",
        json={
            "customer_name": "Invalid Cancel",
            "items": [{"product_id": sample_product["id"], "quantity": 1}],
        },
        headers=admin_headers,
    )
    order_id = create_resp.json()["id"]

    for s in ["confirmed", "processing"]:
        await client.put(f"/api/orders/{order_id}/status", json={"status": s}, headers=admin_headers)

    svc = OrderService(db_session)
    user_id = _user_id_from_headers(admin_headers)
    with pytest.raises(ConflictException) as exc:
        await svc.cancel_order(order_id, user_id)
    assert exc.value.code == "STATUS_CONFLICT"


@pytest.mark.asyncio
async def test_return_invalid_status(
    db_session: AsyncSession, sample_product: dict, admin_headers: dict[str, str], client: AsyncClient
) -> None:
    create_resp = await client.post(
        "/api/orders",
        json={
            "customer_name": "Invalid Return",
            "items": [{"product_id": sample_product["id"], "quantity": 1}],
        },
        headers=admin_headers,
    )
    order_id = create_resp.json()["id"]

    svc = OrderService(db_session)
    user_id = _user_id_from_headers(admin_headers)
    with pytest.raises(ConflictException) as exc:
        await svc.process_return(order_id, user_id)
    assert exc.value.code == "STATUS_CONFLICT"


@pytest.mark.asyncio
async def test_invalid_status_transition(
    db_session: AsyncSession, sample_product: dict, admin_headers: dict[str, str], client: AsyncClient
) -> None:
    create_resp = await client.post(
        "/api/orders",
        json={
            "customer_name": "Bad Transition",
            "items": [{"product_id": sample_product["id"], "quantity": 1}],
        },
        headers=admin_headers,
    )
    order_id = create_resp.json()["id"]

    svc = OrderService(db_session)
    user_id = _user_id_from_headers(admin_headers)
    with pytest.raises(ConflictException) as exc:
        await svc.update_status(order_id, "shipped", notes=None, user_id=user_id)
    assert exc.value.code == "INVALID_TRANSITION"


@pytest.mark.asyncio
async def test_get_order_not_found(db_session: AsyncSession) -> None:
    svc = OrderService(db_session)
    with pytest.raises(NotFoundException):
        await svc.get_order("00000000-0000-0000-0000-000000000000")


@pytest.mark.asyncio
async def test_list_orders_empty(db_session: AsyncSession) -> None:
    svc = OrderService(db_session)
    items, total = await svc.list_orders()
    assert total == 0
    assert items == []


@pytest.mark.asyncio
async def test_list_orders_with_status(
    db_session: AsyncSession, sample_product: dict, admin_headers: dict[str, str], client: AsyncClient
) -> None:
    await client.post(
        "/api/orders",
        json={
            "customer_name": "Status Filter",
            "items": [{"product_id": sample_product["id"], "quantity": 1}],
        },
        headers=admin_headers,
    )

    svc = OrderService(db_session)
    items, total = await svc.list_orders(status="pending")
    assert total >= 1
    assert all(o.status == "pending" for o in items)


@pytest.mark.asyncio
async def test_search_orders(
    db_session: AsyncSession, sample_product: dict, admin_headers: dict[str, str], client: AsyncClient
) -> None:
    await client.post(
        "/api/orders",
        json={
            "customer_name": "Searchable Customer",
            "items": [{"product_id": sample_product["id"], "quantity": 1}],
        },
        headers=admin_headers,
    )

    svc = OrderService(db_session)
    items, total = await svc.search_orders("Searchable")
    assert total >= 1


@pytest.mark.asyncio
async def test_get_order_timeline(
    db_session: AsyncSession, sample_product: dict, admin_headers: dict[str, str], client: AsyncClient
) -> None:
    create_resp = await client.post(
        "/api/orders",
        json={
            "customer_name": "Timeline Test",
            "items": [{"product_id": sample_product["id"], "quantity": 1}],
        },
        headers=admin_headers,
    )
    order_id = create_resp.json()["id"]

    svc = OrderService(db_session)
    events = await svc.get_order_timeline(order_id)
    assert len(events) >= 1
    assert events[0].to_status == "pending"
