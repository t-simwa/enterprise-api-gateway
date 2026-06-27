from __future__ import annotations

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_full_order_flow(
    client: AsyncClient, sample_product: dict, admin_headers: dict[str, str]
) -> None:
    resp = await client.post(
        "/api/orders",
        json={
            "customer_name": "Integration Flow",
            "items": [{"product_id": sample_product["id"], "quantity": 2}],
        },
        headers=admin_headers,
    )
    assert resp.status_code == 201
    order_id = resp.json()["id"]

    for status in ["confirmed", "processing", "shipped", "delivered"]:
        r = await client.put(
            f"/api/orders/{order_id}/status",
            json={"status": status},
            headers=admin_headers,
        )
        assert r.status_code == 200

    r = await client.post(
        f"/api/orders/{order_id}/return", headers=admin_headers
    )
    assert r.status_code == 200
    assert r.json()["status"] == "returned"


@pytest.mark.asyncio
async def test_auth_flow(client: AsyncClient) -> None:
    register_resp = await client.post(
        "/auth/register",
        json={
            "email": "flowuser@test.com",
            "password": "password123",
            "full_name": "Flow User",
        },
    )
    assert register_resp.status_code == 201

    login_resp = await client.post(
        "/auth/login",
        json={"email": "flowuser@test.com", "password": "password123"},
    )
    assert login_resp.status_code == 200
    access_token = login_resp.json()["access_token"]
    refresh_token = login_resp.json()["refresh_token"]

    me_resp = await client.get(
        "/auth/me", headers={"Authorization": f"Bearer {access_token}"}
    )
    assert me_resp.status_code == 200

    refresh_resp = await client.post(
        "/auth/refresh", json={"refresh_token": refresh_token}
    )
    assert refresh_resp.status_code == 200
    assert "access_token" in refresh_resp.json()


@pytest.mark.asyncio
async def test_inventory_consistency(
    client: AsyncClient, sample_product: dict, admin_headers: dict[str, str]
) -> None:
    product_id = sample_product["id"]
    wh_id = sample_product["warehouse_id"]

    for _ in range(5):
        r = await client.post(
            "/api/inventory/adjust",
            json={
                "product_id": product_id,
                "warehouse_id": wh_id,
                "change_qty": 10,
                "reason": "purchase",
            },
            headers=admin_headers,
        )
        assert r.status_code == 200

    for _ in range(3):
        r = await client.post(
            "/api/inventory/adjust",
            json={
                "product_id": product_id,
                "warehouse_id": wh_id,
                "change_qty": -5,
                "reason": "sale",
            },
            headers=admin_headers,
        )
        assert r.status_code == 200

    get_resp = await client.get(f"/api/inventory/{product_id}")
    data = get_resp.json()
    expected = 100 + (5 * 10) + (3 * -5)
    assert data["total_qty"] == expected, (
        f"Expected {expected}, got {data['total_qty']}"
    )


@pytest.mark.asyncio
async def test_concurrent_orders(
    client: AsyncClient, sample_product: dict, admin_headers: dict[str, str]
) -> None:
    import asyncio

    product_id = sample_product["id"]

    async def place_order(n: int) -> int:
        r = await client.post(
            "/api/orders",
            json={
                "customer_name": f"Concurrent {n}",
                "items": [{"product_id": product_id, "quantity": 15}],
            },
            headers=admin_headers,
        )
        return r.status_code

    tasks = [place_order(i) for i in range(10)]
    results = await asyncio.gather(*tasks)
    success_count = sum(1 for s in results if s == 201)
    fail_count = sum(1 for s in results if s == 409)
    assert success_count >= 1
    assert fail_count >= 1


@pytest.mark.asyncio
async def test_rate_limiting(
    client: AsyncClient, admin_headers: dict[str, str]
) -> None:
    import asyncio

    async def request() -> int:
        r = await client.get("/health")
        return r.status_code

    tasks = [request() for _ in range(110)]
    results = await asyncio.gather(*tasks)
    rate_limited = sum(1 for s in results if s == 429)
    assert rate_limited >= 1
