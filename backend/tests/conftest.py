from __future__ import annotations

from collections.abc import AsyncGenerator
from typing import Any

import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from sqlalchemy import text
from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)

from src.database import Base
from src.main import app

TEST_DB_URL = "postgresql+asyncpg://postgres:postgres@localhost:5432/test_inventory_db"


@pytest_asyncio.fixture
async def engine() -> AsyncGenerator[create_async_engine, None]:  # type: ignore[no-any-unimported]
    _engine = create_async_engine(TEST_DB_URL, echo=False)
    async with _engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)
    yield _engine
    async with _engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    await _engine.dispose()


@pytest_asyncio.fixture
async def session_factory(engine) -> async_sessionmaker[AsyncSession]:
    factory = async_sessionmaker(
        bind=engine, class_=AsyncSession, expire_on_commit=False
    )

    from src.api import deps

    async def _get_test_db() -> AsyncGenerator[AsyncSession, None]:
        async with factory() as session:
            yield session

    app.dependency_overrides[deps.get_db] = _get_test_db
    return factory


@pytest_asyncio.fixture
async def db_session(
    session_factory: async_sessionmaker[AsyncSession],
) -> AsyncGenerator[AsyncSession, None]:
    async with session_factory() as session:
        yield session


@pytest_asyncio.fixture
async def client(session_factory) -> AsyncGenerator[AsyncClient, None]:
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac


async def _make_user(
    factory: async_sessionmaker[AsyncSession],
    client: AsyncClient,
    email: str,
    password: str = "password123",
    role: str = "viewer",
) -> tuple[str, str]:
    await client.post(
        "/auth/register",
        json={"email": email, "password": password, "full_name": email.split("@")[0]},
    )
    if role != "viewer":
        async with factory() as session:
            result = await session.execute(
                text(f"SELECT id FROM users WHERE email = '{email}'")
            )
            row = result.one_or_none()
            if row:
                await session.execute(
                    text(f"UPDATE users SET role = '{role}' WHERE id = '{row[0]}'")
                )
                await session.commit()
    resp = await client.post(
        "/auth/login", json={"email": email, "password": password}
    )
    data = resp.json()
    return data.get("access_token", ""), data.get("refresh_token", "")


@pytest_asyncio.fixture
async def auth_headers(
    client: AsyncClient, session_factory: async_sessionmaker[AsyncSession]
) -> dict[str, str]:
    token, _ = await _make_user(session_factory, client, "testuser@test.com")
    return {"Authorization": f"Bearer {token}"}


@pytest_asyncio.fixture
async def admin_headers(
    client: AsyncClient, session_factory: async_sessionmaker[AsyncSession]
) -> dict[str, str]:
    token, _ = await _make_user(
        session_factory, client, "adminuser@test.com", role="admin"
    )
    return {"Authorization": f"Bearer {token}"}


@pytest_asyncio.fixture
async def sample_product(
    client: AsyncClient,
    admin_headers: dict[str, str],
    session_factory: async_sessionmaker[AsyncSession],
) -> dict[str, Any]:
    async with session_factory() as session:
        from src.models.inventory import Warehouse

        wh = Warehouse(code="TST-WH-01", name="Test Warehouse")
        session.add(wh)
        await session.flush()
        await session.commit()
        wh_id = str(wh.id)

    resp = await client.post(
        "/api/products",
        json={
            "sku": "TST-001",
            "name": "Test Product",
            "unit_price": 25.00,
            "reorder_point": 10,
        },
        headers=admin_headers,
    )
    assert resp.status_code == 201
    product = resp.json()
    product_id = product["id"]

    async with session_factory() as session:
        from src.models.inventory import Inventory

        inv = Inventory(
            product_id=product_id, warehouse_id=wh_id, quantity=100, reserved_qty=0
        )
        session.add(inv)
        await session.flush()
        await session.commit()

    product["warehouse_id"] = wh_id
    return product
