from __future__ import annotations

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_auth_refresh(client: AsyncClient) -> None:
    await client.post(
        "/auth/register",
        json={"email": "refreshtest@test.com", "password": "password123", "full_name": "Refresh"},
    )
    login_resp = await client.post(
        "/auth/login", json={"email": "refreshtest@test.com", "password": "password123"}
    )
    refresh_token = login_resp.json()["refresh_token"]

    resp = await client.post("/auth/refresh", json={"refresh_token": refresh_token})
    assert resp.status_code == 200
    assert "access_token" in resp.json()


@pytest.mark.asyncio
async def test_auth_refresh_invalid_token(client: AsyncClient) -> None:
    resp = await client.post("/auth/refresh", json={"refresh_token": "invalid-token"})
    assert resp.status_code == 401


@pytest.mark.asyncio
async def test_auth_refresh_wrong_type(client: AsyncClient) -> None:
    await client.post(
        "/auth/register",
        json={"email": "wrongtype@test.com", "password": "password123", "full_name": "Wrong"},
    )
    login_resp = await client.post(
        "/auth/login", json={"email": "wrongtype@test.com", "password": "password123"}
    )
    access_token = login_resp.json()["access_token"]

    resp = await client.post("/auth/refresh", json={"refresh_token": access_token})
    assert resp.status_code == 401


@pytest.mark.asyncio
async def test_auth_me(client: AsyncClient) -> None:
    await client.post(
        "/auth/register",
        json={"email": "metest@test.com", "password": "password123", "full_name": "Me"},
    )
    login_resp = await client.post(
        "/auth/login", json={"email": "metest@test.com", "password": "password123"}
    )
    access_token = login_resp.json()["access_token"]

    resp = await client.get("/auth/me", headers={"Authorization": f"Bearer {access_token}"})
    assert resp.status_code == 200
    data = resp.json()
    assert data["email"] == "metest@test.com"


@pytest.mark.asyncio
async def test_auth_me_invalid_token(client: AsyncClient) -> None:
    resp = await client.get("/auth/me", headers={"Authorization": "Bearer invalid-token"})
    assert resp.status_code == 401


@pytest.mark.asyncio
async def test_auth_me_no_token(client: AsyncClient) -> None:
    resp = await client.get("/auth/me")
    assert resp.status_code == 401


@pytest.mark.asyncio
async def test_auth_logout(client: AsyncClient) -> None:
    await client.post(
        "/auth/register",
        json={"email": "logouttest@test.com", "password": "password123", "full_name": "Logout"},
    )
    login_resp = await client.post(
        "/auth/login", json={"email": "logouttest@test.com", "password": "password123"}
    )
    access_token = login_resp.json()["access_token"]
    refresh_token = login_resp.json()["refresh_token"]

    resp = await client.post(
        "/auth/logout",
        json={"refresh_token": refresh_token},
        headers={"Authorization": f"Bearer {access_token}"},
    )
    assert resp.status_code == 200


@pytest.mark.asyncio
async def test_auth_logout_invalid_token(client: AsyncClient, auth_headers: dict[str, str]) -> None:
    resp = await client.post(
        "/auth/logout",
        json={"refresh_token": "invalid-token"},
        headers=auth_headers,
    )
    assert resp.status_code == 401


@pytest.mark.asyncio
async def test_auth_register_duplicate(client: AsyncClient) -> None:
    await client.post(
        "/auth/register",
        json={"email": "dupe@test.com", "password": "password123", "full_name": "Dupe"},
    )
    resp = await client.post(
        "/auth/register",
        json={"email": "dupe@test.com", "password": "password123", "full_name": "Dupe"},
    )
    assert resp.status_code == 409
    assert resp.json()["code"] == "EMAIL_EXISTS"


@pytest.mark.asyncio
async def test_auth_login_invalid(client: AsyncClient) -> None:
    resp = await client.post(
        "/auth/login", json={"email": "nonexistent@test.com", "password": "wrong"}
    )
    assert resp.status_code == 401


@pytest.mark.asyncio
async def test_auth_login_wrong_password(client: AsyncClient) -> None:
    await client.post(
        "/auth/register",
        json={"email": "wrongpw@test.com", "password": "password123", "full_name": "Wrong"},
    )
    resp = await client.post(
        "/auth/login", json={"email": "wrongpw@test.com", "password": "wrongpassword"}
    )
    assert resp.status_code == 401
