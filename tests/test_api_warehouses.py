from __future__ import annotations

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_warehouses_create(client: AsyncClient, admin_headers: dict[str, str]) -> None:
    resp = await client.post(
        "/api/warehouses",
        json={"code": "NW-NWH-01", "name": "New Warehouse", "location": "Test Location"},
        headers=admin_headers,
    )
    assert resp.status_code == 201
    data = resp.json()
    assert data["code"] == "NW-NWH-01"
    assert data["name"] == "New Warehouse"


@pytest.mark.asyncio
async def test_warehouses_create_forbidden(client: AsyncClient, auth_headers: dict[str, str]) -> None:
    resp = await client.post(
        "/api/warehouses",
        json={"code": "FB-FBD-01", "name": "Forbidden"},
        headers=auth_headers,
    )
    assert resp.status_code == 403


@pytest.mark.asyncio
async def test_warehouses_list(client: AsyncClient) -> None:
    resp = await client.get("/api/warehouses")
    assert resp.status_code == 200
    data = resp.json()
    assert isinstance(data, list)
