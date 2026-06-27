from __future__ import annotations

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_admin_list_users(client: AsyncClient, admin_headers: dict[str, str]) -> None:
    resp = await client.get("/admin/users", headers=admin_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert len(data) >= 1


@pytest.mark.asyncio
async def test_admin_list_users_forbidden(client: AsyncClient, auth_headers: dict[str, str]) -> None:
    resp = await client.get("/admin/users", headers=auth_headers)
    assert resp.status_code == 403


@pytest.mark.asyncio
async def test_admin_api_usage(client: AsyncClient, admin_headers: dict[str, str]) -> None:
    resp = await client.get("/admin/api-usage", headers=admin_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert "total_users" in data
    assert "total_orders" in data


@pytest.mark.asyncio
async def test_admin_get_logs(client: AsyncClient, admin_headers: dict[str, str]) -> None:
    resp = await client.get("/admin/logs", headers=admin_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert "logs" in data


@pytest.mark.asyncio
async def test_admin_get_metrics(client: AsyncClient, admin_headers: dict[str, str]) -> None:
    resp = await client.get("/admin/metrics", headers=admin_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert "uptime_seconds" in data
    assert "cpu_percent" in data


@pytest.mark.asyncio
async def test_admin_clear_cache(
    client: AsyncClient, admin_headers: dict[str, str], session_factory
) -> None:
    resp = await client.post(
        "/admin/cache/clear",
        headers={**admin_headers, "Content-Type": "application/json"},
        json={},
    )
    assert resp.status_code == 200
    assert resp.json()["status"] == "cache cleared"


@pytest.mark.asyncio
async def test_admin_unauthorized(client: AsyncClient) -> None:
    resp = await client.get("/admin/users")
    assert resp.status_code == 401
