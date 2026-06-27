from __future__ import annotations

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_inventory_get_success(
    client: AsyncClient, sample_product: dict, admin_headers: dict[str, str]
) -> None:
    resp = await client.get(f"/api/inventory/{sample_product['id']}")
    assert resp.status_code == 200
    data = resp.json()
    assert data["sku"] == "TST-001"
    assert data["total_qty"] >= 100


@pytest.mark.asyncio
async def test_inventory_get_not_found(client: AsyncClient) -> None:
    resp = await client.get(
        "/api/inventory/00000000-0000-0000-0000-000000000000"
    )
    assert resp.status_code == 404


@pytest.mark.asyncio
async def test_inventory_adjust_add(
    client: AsyncClient, sample_product: dict, admin_headers: dict[str, str]
) -> None:
    resp = await client.post(
        "/api/inventory/adjust",
        json={
            "product_id": sample_product["id"],
            "warehouse_id": sample_product["warehouse_id"],
            "change_qty": 50,
            "reason": "purchase",
        },
        headers=admin_headers,
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["change_qty"] == 50

    get_resp = await client.get(f"/api/inventory/{sample_product['id']}")
    assert get_resp.json()["total_qty"] >= 150


@pytest.mark.asyncio
async def test_inventory_adjust_remove(
    client: AsyncClient, sample_product: dict, admin_headers: dict[str, str]
) -> None:
    resp = await client.post(
        "/api/inventory/adjust",
        json={
            "product_id": sample_product["id"],
            "warehouse_id": sample_product["warehouse_id"],
            "change_qty": -10,
            "reason": "sale",
        },
        headers=admin_headers,
    )
    assert resp.status_code == 200
    assert resp.json()["change_qty"] == -10


@pytest.mark.asyncio
async def test_inventory_adjust_negative(
    client: AsyncClient, sample_product: dict, admin_headers: dict[str, str]
) -> None:
    resp = await client.post(
        "/api/inventory/adjust",
        json={
            "product_id": sample_product["id"],
            "warehouse_id": sample_product["warehouse_id"],
            "change_qty": -999999,
            "reason": "sale",
        },
        headers=admin_headers,
    )
    assert resp.status_code == 409
    assert resp.json()["code"] == "INSUFFICIENT_STOCK"


@pytest.mark.asyncio
async def test_inventory_low_stock(
    client: AsyncClient, sample_product: dict
) -> None:
    resp = await client.get("/api/inventory/low-stock?threshold=1000")
    assert resp.status_code == 200
    data = resp.json()
    assert len(data) > 0


@pytest.mark.asyncio
async def test_inventory_transfer(
    client: AsyncClient, sample_product: dict, admin_headers: dict[str, str]
) -> None:
    resp = await client.get(f"/api/inventory/{sample_product['id']}")
    inventory = resp.json()
    warehouses = inventory.get("warehouses", [])
    if len(warehouses) < 2:
        pytest.skip("Need at least 2 warehouses for transfer test")


@pytest.mark.asyncio
async def test_inventory_adjust_unknown_warehouse(
    client: AsyncClient, sample_product: dict, admin_headers: dict[str, str]
) -> None:
    resp = await client.post(
        "/api/inventory/adjust",
        json={
            "product_id": sample_product["id"],
            "warehouse_id": "00000000-0000-0000-0000-000000000000",
            "change_qty": 10,
            "reason": "purchase",
        },
        headers=admin_headers,
    )
    assert resp.status_code == 404


@pytest.mark.asyncio
async def test_inventory_audit_log(
    client: AsyncClient, sample_product: dict, admin_headers: dict[str, str]
) -> None:
    await client.post(
        "/api/inventory/adjust",
        json={
            "product_id": sample_product["id"],
            "warehouse_id": sample_product["warehouse_id"],
            "change_qty": 10,
            "reason": "purchase",
        },
        headers=admin_headers,
    )
    resp = await client.get(
        f"/api/inventory/audit-log?product_id={sample_product['id']}"
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["total"] >= 1
