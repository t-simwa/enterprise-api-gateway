from __future__ import annotations

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_auth_register_success(client: AsyncClient) -> None:
    resp = await client.post(
        "/auth/register",
        json={
            "email": "newuser@test.com",
            "password": "password123",
            "full_name": "New User",
        },
    )
    assert resp.status_code == 201
    data = resp.json()
    assert data["email"] == "newuser@test.com"
    assert data["full_name"] == "New User"
    assert "id" in data


@pytest.mark.asyncio
async def test_auth_register_duplicate(
    client: AsyncClient, auth_headers: dict[str, str]
) -> None:
    resp = await client.post(
        "/auth/register",
        json={
            "email": "testuser@test.com",
            "password": "password123",
            "full_name": "Duplicate",
        },
    )
    assert resp.status_code == 409
    assert resp.json()["code"] == "EMAIL_EXISTS"


@pytest.mark.asyncio
async def test_auth_login_success(client: AsyncClient) -> None:
    await client.post(
        "/auth/register",
        json={
            "email": "loginuser@test.com",
            "password": "password123",
            "full_name": "Login User",
        },
    )
    resp = await client.post(
        "/auth/login",
        json={"email": "loginuser@test.com", "password": "password123"},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert "access_token" in data
    assert "refresh_token" in data
    assert data["token_type"] == "bearer"


@pytest.mark.asyncio
async def test_auth_login_wrong_password(client: AsyncClient) -> None:
    await client.post(
        "/auth/register",
        json={
            "email": "wrongpw@test.com",
            "password": "password123",
            "full_name": "Wrong PW",
        },
    )
    resp = await client.post(
        "/auth/login",
        json={"email": "wrongpw@test.com", "password": "wrongpassword"},
    )
    assert resp.status_code == 401


@pytest.mark.asyncio
async def test_auth_login_locked_out(client: AsyncClient) -> None:
    await client.post(
        "/auth/register",
        json={
            "email": "lockout@test.com",
            "password": "password123",
            "full_name": "Lockout",
        },
    )
    for _ in range(6):
        resp = await client.post(
            "/auth/login",
            json={"email": "lockout@test.com", "password": "wrongpassword"},
        )
    assert resp.status_code == 429


@pytest.mark.asyncio
async def test_auth_refresh_valid(
    client: AsyncClient, auth_headers: dict[str, str]
) -> None:
    await client.post(
        "/auth/register",
        json={
            "email": "refreshtest@test.com",
            "password": "password123",
            "full_name": "Refresh",
        },
    )
    login_resp = await client.post(
        "/auth/login",
        json={"email": "refreshtest@test.com", "password": "password123"},
    )
    refresh_token = login_resp.json()["refresh_token"]
    resp = await client.post(
        "/auth/refresh",
        json={"refresh_token": refresh_token},
    )
    assert resp.status_code == 200
    assert "access_token" in resp.json()


@pytest.mark.asyncio
async def test_auth_refresh_expired(client: AsyncClient) -> None:
    resp = await client.post(
        "/auth/refresh",
        json={"refresh_token": "invalid-token"},
    )
    assert resp.status_code == 401


@pytest.mark.asyncio
async def test_auth_middleware_no_token(client: AsyncClient) -> None:
    resp = await client.get("/auth/me")
    assert resp.status_code == 401


@pytest.mark.asyncio
async def test_auth_middleware_expired(client: AsyncClient) -> None:
    resp = await client.get(
        "/auth/me",
        headers={"Authorization": "Bearer expired.token.here"},
    )
    assert resp.status_code == 401
