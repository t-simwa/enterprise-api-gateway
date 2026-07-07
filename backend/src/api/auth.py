from __future__ import annotations

from typing import TYPE_CHECKING

from fastapi import APIRouter, Depends, Request, status
from redis import asyncio as aioredis

from src.api.deps import get_current_user, get_db, get_redis
from src.exceptions import RateLimitExceededException
from src.limiter import limiter
from src.schemas.auth import (
    LoginRequest,
    RefreshRequest,
    RegisterRequest,
    TokenResponse,
    UserResponse,
)
from src.services.auth_service import AuthService

if TYPE_CHECKING:
    from sqlalchemy.ext.asyncio import AsyncSession

    from src.models.user import User

FAILED_LOGIN_LIMIT = 5
LOCKOUT_DURATION = 900

router = APIRouter(prefix="/auth", tags=["Authentication"])


async def check_login_rate_limit(email: str, redis: aioredis.Redis) -> None:
    attempts = await redis.get(f"login_attempts:{email}")
    if attempts and int(attempts) >= FAILED_LOGIN_LIMIT:
        ttl = await redis.ttl(f"login_attempts:{email}")
        raise RateLimitExceededException(retry_after=max(ttl, 1))


async def record_failed_attempt(email: str, redis: aioredis.Redis) -> None:
    key = f"login_attempts:{email}"
    current = await redis.incr(key)
    if current == 1:
        await redis.expire(key, LOCKOUT_DURATION)


async def clear_login_attempts(email: str, redis: aioredis.Redis) -> None:
    await redis.delete(f"login_attempts:{email}")


@router.post("/register", status_code=status.HTTP_201_CREATED, response_model=UserResponse)
async def register(
    body: RegisterRequest,
    db: AsyncSession = Depends(get_db),  # noqa: B008
) -> UserResponse:
    svc = AuthService(db)
    user = await svc.register_user(
        email=body.email, password=body.password, full_name=body.full_name,
    )
    await db.commit()
    return UserResponse(
        id=user.id, email=user.email, full_name=user.full_name,
        role=user.role, created_at=user.created_at,
    )


@limiter.limit("30/minute")
@router.post("/login", response_model=TokenResponse)
async def login(
    request: Request,
    body: LoginRequest,
    db: AsyncSession = Depends(get_db),  # noqa: B008
    redis: aioredis.Redis = Depends(get_redis),  # noqa: B008
) -> TokenResponse:
    await check_login_rate_limit(body.email, redis)
    svc = AuthService(db)
    try:
        access_token, refresh_token = await svc.authenticate_user(
            email=body.email, password=body.password,
        )
    except Exception:
        await record_failed_attempt(body.email, redis)
        raise
    await clear_login_attempts(body.email, redis)
    return TokenResponse(access_token=access_token, refresh_token=refresh_token)


@router.post("/refresh", response_model=TokenResponse)
async def refresh(
    body: RefreshRequest,
    db: AsyncSession = Depends(get_db),  # noqa: B008
) -> TokenResponse:
    svc = AuthService(db)
    new_access = await svc.refresh_access_token(body.refresh_token)
    return TokenResponse(access_token=new_access, refresh_token=body.refresh_token)


@router.post("/logout", status_code=status.HTTP_200_OK)
async def logout(
    current_user: User = Depends(get_current_user),  # noqa: B008
    body: RefreshRequest | None = None,
) -> dict[str, str]:
    if body and body.refresh_token:
        svc = AuthService.__new__(AuthService)
        svc.db = None  # type: ignore[assignment]
        await svc.logout_user(str(current_user.id), body.refresh_token)
    return {"message": "Logged out successfully"}


@router.get("/me", response_model=UserResponse)
async def get_me(
    current_user: User = Depends(get_current_user),  # noqa: B008
) -> UserResponse:
    return UserResponse(
        id=current_user.id, email=current_user.email,
        full_name=current_user.full_name, role=current_user.role,
        created_at=current_user.created_at,
    )
