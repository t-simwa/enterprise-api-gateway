from __future__ import annotations

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_orders_create_success(
    client: AsyncClient, sample_product: dict, admin_headers: dict[str, str]
) -> None:
    resp = await client.post(
        "/api/orders",
        json={
            "customer_name": "John Doe",
            "customer_email": "john@example.com",
            "items": [{"product_id": sample_product["id"], "quantity": 2}],
        },
        headers=admin_headers,
    )
    assert resp.status_code == 201
    data = resp.json()
    assert data["customer_name"] == "John Doe"
    assert data["status"] == "pending"
    assert len(data["items"]) == 1
    assert data["items"][0]["quantity"] == 2
    assert data["order_number"].startswith("ORD-")


@pytest.mark.asyncio
async def test_orders_create_insufficient(
    client: AsyncClient, sample_product: dict, admin_headers: dict[str, str]
) -> None:
    resp = await client.post(
        "/api/orders",
        json={
            "customer_name": "Bad Order",
            "items": [{"product_id": sample_product["id"], "quantity": 999999}],
        },
        headers=admin_headers,
    )
    assert resp.status_code == 409
    assert resp.json()["code"] == "INSUFFICIENT_STOCK"


@pytest.mark.asyncio
async def test_orders_create_invalid_product(
    client: AsyncClient, admin_headers: dict[str, str]
) -> None:
    resp = await client.post(
        "/api/orders",
        json={
            "customer_name": "Bad Product",
            "items": [
                {
                    "product_id": "00000000-0000-0000-0000-000000000000",
                    "quantity": 1,
                }
            ],
        },
        headers=admin_headers,
    )
    assert resp.status_code == 404


@pytest.mark.asyncio
async def test_orders_cancel(
    client: AsyncClient, sample_product: dict, admin_headers: dict[str, str]
) -> None:
    create_resp = await client.post(
        "/api/orders",
        json={
            "customer_name": "Cancel Me",
            "items": [{"product_id": sample_product["id"], "quantity": 1}],
        },
        headers=admin_headers,
    )
    order_id = create_resp.json()["id"]

    cancel_resp = await client.post(
        f"/api/orders/{order_id}/cancel", headers=admin_headers
    )
    assert cancel_resp.status_code == 200
    assert cancel_resp.json()["status"] == "cancelled"


@pytest.mark.asyncio
async def test_orders_return(
    client: AsyncClient, sample_product: dict, admin_headers: dict[str, str]
) -> None:
    create_resp = await client.post(
        "/api/orders",
        json={
            "customer_name": "Return Me",
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
    await client.put(
        f"/api/orders/{order_id}/status",
        json={"status": "processing"},
        headers=admin_headers,
    )
    await client.put(
        f"/api/orders/{order_id}/status",
        json={"status": "shipped"},
        headers=admin_headers,
    )
    await client.put(
        f"/api/orders/{order_id}/status",
        json={"status": "delivered"},
        headers=admin_headers,
    )

    return_resp = await client.post(
        f"/api/orders/{order_id}/return", headers=admin_headers
    )
    assert return_resp.status_code == 200
    assert return_resp.json()["status"] == "returned"


@pytest.mark.asyncio
async def test_orders_dashboard(
    client: AsyncClient, sample_product: dict, admin_headers: dict[str, str]
) -> None:
    resp = await client.get("/api/orders/dashboard")
    assert resp.status_code == 200
    data = resp.json()
    assert "total_orders" in data
    assert "total_revenue" in data
    assert "orders_by_status" in data


@pytest.mark.asyncio
async def test_orders_full_flow(
    client: AsyncClient, sample_product: dict, admin_headers: dict[str, str]
) -> None:
    create_resp = await client.post(
        "/api/orders",
        json={
            "customer_name": "Full Flow",
            "items": [{"product_id": sample_product["id"], "quantity": 1}],
        },
        headers=admin_headers,
    )
    order_id = create_resp.json()["id"]
    assert create_resp.status_code == 201

    for status in ["confirmed", "processing", "shipped", "delivered"]:
        resp = await client.put(
            f"/api/orders/{order_id}/status",
            json={"status": status},
            headers=admin_headers,
        )
        assert resp.status_code == 200
        assert resp.json()["status"] == status

    return_resp = await client.post(
        f"/api/orders/{order_id}/return", headers=admin_headers
    )
    assert return_resp.status_code == 200
    assert return_resp.json()["status"] == "returned"


@pytest.mark.asyncio
async def test_orders_list(
    client: AsyncClient, sample_product: dict, admin_headers: dict[str, str]
) -> None:
    await client.post(
        "/api/orders",
        json={
            "customer_name": "List Test",
            "items": [{"product_id": sample_product["id"], "quantity": 1}],
        },
        headers=admin_headers,
    )
    resp = await client.get("/api/orders")
    assert resp.status_code == 200
    data = resp.json()
    assert data["total"] >= 1
    assert len(data["items"]) >= 1


@pytest.mark.asyncio
async def test_orders_get(
    client: AsyncClient, sample_product: dict, admin_headers: dict[str, str]
) -> None:
    create_resp = await client.post(
        "/api/orders",
        json={
            "customer_name": "Get Test",
            "items": [{"product_id": sample_product["id"], "quantity": 1}],
        },
        headers=admin_headers,
    )
    order_id = create_resp.json()["id"]

    resp = await client.get(f"/api/orders/{order_id}")
    assert resp.status_code == 200
    assert resp.json()["customer_name"] == "Get Test"


@pytest.mark.asyncio
async def test_orders_search(
    client: AsyncClient, sample_product: dict, admin_headers: dict[str, str]
) -> None:
    await client.post(
        "/api/orders",
        json={
            "customer_name": "Search Target",
            "items": [{"product_id": sample_product["id"], "quantity": 1}],
        },
        headers=admin_headers,
    )
    resp = await client.get("/api/orders/search?q=Search")
    assert resp.status_code == 200
    data = resp.json()
    assert data["total"] >= 1


@pytest.mark.asyncio
async def test_orders_timeline(
    client: AsyncClient, sample_product: dict, admin_headers: dict[str, str]
) -> None:
    create_resp = await client.post(
        "/api/orders",
        json={
            "customer_name": "Timeline",
            "items": [{"product_id": sample_product["id"], "quantity": 1}],
        },
        headers=admin_headers,
    )
    order_id = create_resp.json()["id"]

    resp = await client.get(f"/api/orders/{order_id}/timeline")
    assert resp.status_code == 200
    data = resp.json()
    assert len(data) >= 1
    assert data[0]["to_status"] == "pending"
