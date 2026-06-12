from __future__ import annotations

from typing import TYPE_CHECKING, Any

from fastapi import Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from redis import asyncio as aioredis
from sqlalchemy import select

from src.config import settings
from src.database import async_session
from src.exceptions import ForbiddenException, UnauthorizedException
from src.models.user import User
from src.services.auth_service import AuthService

if TYPE_CHECKING:
    from collections.abc import AsyncGenerator, Awaitable, Callable

    from sqlalchemy.ext.asyncio import AsyncSession

security_scheme = HTTPBearer(auto_error=False)


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with async_session() as session:
        yield session


async def get_redis() -> Any:
    r = aioredis.from_url(str(settings.REDIS_URL))  # type: ignore[no-untyped-call]
    try:
        yield r
    finally:
        await r.aclose()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(security_scheme),  # noqa: B008
    db: AsyncSession = Depends(get_db),  # noqa: B008
) -> User:
    if credentials is None:
        raise UnauthorizedException("Not authenticated")
    svc = AuthService(db)
    payload = svc.decode_token(credentials.credentials)
    user_id: str | None = payload.get("sub")
    if user_id is None:
        raise UnauthorizedException("Invalid token payload")
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if user is None:
        raise UnauthorizedException("User not found")
    if not user.is_active:
        raise ForbiddenException("User account is disabled")
    return user


def require_roles(*roles: str) -> Callable[..., Awaitable[User]]:
    async def role_checker(current_user: User = Depends(get_current_user)) -> User:  # noqa: B008
        if current_user.role not in roles:
            raise ForbiddenException(f"Requires one of: {roles}")
        return current_user

    return role_checker


async def get_current_user_ws(token: str = "") -> User:
    if not token:
        raise UnauthorizedException("Missing token")
    async with async_session() as db:
        svc = AuthService(db)
        payload = svc.decode_token(token)
        user_id: str | None = payload.get("sub")
        if user_id is None:
            raise UnauthorizedException("Invalid token payload")
        result = await db.execute(select(User).where(User.id == user_id))
        user = result.scalar_one_or_none()
        if user is None:
            raise UnauthorizedException("User not found")
        if not user.is_active:
            raise ForbiddenException("User account is disabled")
        return user
