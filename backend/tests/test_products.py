from __future__ import annotations

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_products_create_success(
    client: AsyncClient, admin_headers: dict[str, str]
) -> None:
    resp = await client.post(
        "/api/products",
        json={"sku": "LAP-100", "name": "Test Laptop", "unit_price": 999.99},
        headers=admin_headers,
    )
    assert resp.status_code == 201
    data = resp.json()
    assert data["sku"] == "LAP-100"
    assert data["name"] == "Test Laptop"
    assert data["is_active"] is True


@pytest.mark.asyncio
async def test_products_create_duplicate_sku(
    client: AsyncClient, admin_headers: dict[str, str]
) -> None:
    await client.post(
        "/api/products",
        json={"sku": "DUP-001", "name": "Original", "unit_price": 10.00},
        headers=admin_headers,
    )
    resp = await client.post(
        "/api/products",
        json={"sku": "DUP-001", "name": "Duplicate", "unit_price": 20.00},
        headers=admin_headers,
    )
    assert resp.status_code == 409
    assert resp.json()["code"] == "SKU_EXISTS"


@pytest.mark.asyncio
async def test_products_list_pagination(
    client: AsyncClient, admin_headers: dict[str, str]
) -> None:
    for i in range(5):
        await client.post(
            "/api/products",
            json={
                "sku": f"PAG-{i:03d}",
                "name": f"Product {i}",
                "unit_price": 10.00 + i,
            },
            headers=admin_headers,
        )
    resp = await client.get("/api/products?page=1&size=3")
    assert resp.status_code == 200
    data = resp.json()
    assert len(data["items"]) == 3
    assert data["total"] >= 5
    assert data["page"] == 1


@pytest.mark.asyncio
async def test_products_list_filter(
    client: AsyncClient, admin_headers: dict[str, str]
) -> None:
    await client.post(
        "/api/products",
        json={
            "sku": "CAT-001",
            "name": "Category Item",
            "category": "Testing",
            "unit_price": 15.00,
        },
        headers=admin_headers,
    )
    resp = await client.get("/api/products?category=Testing")
    assert resp.status_code == 200
    data = resp.json()
    assert all(item["category"] == "Testing" for item in data["items"])


@pytest.mark.asyncio
async def test_products_list_search(
    client: AsyncClient, admin_headers: dict[str, str]
) -> None:
    await client.post(
        "/api/products",
        json={
            "sku": "SRCH-001",
            "name": "Searchable Widget",
            "description": "A widget for testing search",
            "unit_price": 5.00,
        },
        headers=admin_headers,
    )
    resp = await client.get("/api/products?search=widget")
    assert resp.status_code == 200
    data = resp.json()
    assert any("widget" in item["name"].lower() for item in data["items"])


@pytest.mark.asyncio
async def test_products_soft_delete(
    client: AsyncClient, admin_headers: dict[str, str]
) -> None:
    resp = await client.post(
        "/api/products",
        json={"sku": "DEL-001", "name": "Delete Me", "unit_price": 1.00},
        headers=admin_headers,
    )
    product_id = resp.json()["id"]

    del_resp = await client.delete(
        f"/api/products/{product_id}", headers=admin_headers
    )
    assert del_resp.status_code == 204

    list_resp = await client.get("/api/products")
    ids = [item["id"] for item in list_resp.json()["items"]]
    assert product_id not in ids


@pytest.mark.asyncio
async def test_products_get_success(
    client: AsyncClient, admin_headers: dict[str, str], sample_product: dict
) -> None:
    resp = await client.get(f"/api/products/{sample_product['id']}")
    assert resp.status_code == 200
    assert resp.json()["sku"] == "TST-001"


@pytest.mark.asyncio
async def test_products_get_not_found(client: AsyncClient) -> None:
    resp = await client.get("/api/products/00000000-0000-0000-0000-000000000000")
    assert resp.status_code == 404


@pytest.mark.asyncio
async def test_products_update(
    client: AsyncClient, admin_headers: dict[str, str], sample_product: dict
) -> None:
    resp = await client.put(
        f"/api/products/{sample_product['id']}",
        json={"name": "Updated Product", "unit_price": 35.00},
        headers=admin_headers,
    )
    assert resp.status_code == 200
    assert resp.json()["name"] == "Updated Product"


@pytest.mark.asyncio
async def test_products_create_forbidden(
    client: AsyncClient, auth_headers: dict[str, str]
) -> None:
    resp = await client.post(
        "/api/products",
        json={"sku": "FORBIDDEN", "name": "Forbidden", "unit_price": 1.00},
        headers=auth_headers,
    )
    assert resp.status_code == 403


@pytest.mark.asyncio
async def test_products_delete_forbidden(
    client: AsyncClient, auth_headers: dict[str, str], sample_product: dict
) -> None:
    resp = await client.delete(
        f"/api/products/{sample_product['id']}", headers=auth_headers
    )
    assert resp.status_code == 403
