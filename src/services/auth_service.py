from __future__ import annotations

import uuid
from datetime import UTC, datetime, timedelta
from typing import TYPE_CHECKING, Any

import structlog
from jose import JWTError, jwt
from passlib.context import CryptContext
from redis import asyncio as aioredis
from sqlalchemy import select

from src.config import settings
from src.exceptions import ConflictException, ForbiddenException, UnauthorizedException
from src.models.user import User

if TYPE_CHECKING:
    from sqlalchemy.ext.asyncio import AsyncSession

logger = structlog.get_logger(__name__)

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

ACCESS_TOKEN_EXPIRE = timedelta(minutes=30)
REFRESH_TOKEN_EXPIRE = timedelta(days=7)


class AuthService:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    def hash_password(self, password: str) -> str:
        return pwd_context.hash(password)  # type: ignore[no-any-return]

    def verify_password(self, plain_password: str, hashed_password: str) -> bool:
        return pwd_context.verify(plain_password, hashed_password)  # type: ignore[no-any-return]

    def create_access_token(self, user_id: str, role: str) -> str:
        now = datetime.now(tz=UTC)
        payload = {
            "sub": user_id,
            "role": role,
            "type": "access",
            "iat": now,
            "exp": now + ACCESS_TOKEN_EXPIRE,
        }
        return jwt.encode(payload, settings.SECRET_KEY, algorithm="HS256")  # type: ignore[no-any-return]

    def create_refresh_token(self, user_id: str) -> str:
        now = datetime.now(tz=UTC)
        payload = {
            "sub": user_id,
            "type": "refresh",
            "jti": str(uuid.uuid4()),
            "iat": now,
            "exp": now + REFRESH_TOKEN_EXPIRE,
        }
        return jwt.encode(payload, settings.SECRET_KEY, algorithm="HS256")  # type: ignore[no-any-return]

    def decode_token(self, token: str) -> dict[str, Any]:
        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
            return payload  # type: ignore[no-any-return]
        except JWTError:
            raise UnauthorizedException("Invalid or expired token") from None

    async def register_user(self, email: str, password: str, full_name: str) -> User:
        result = await self.db.execute(select(User).where(User.email == email))
        if result.scalar_one_or_none() is not None:
            raise ConflictException("EMAIL_EXISTS", f"Email '{email}' already registered")
        user = User(
            email=email,
            password_hash=self.hash_password(password),
            full_name=full_name,
            role="viewer",
            is_active=True,
        )
        self.db.add(user)
        await self.db.flush()
        logger.info(
            "user.registered",
            user_id=str(user.id),
            email=user.email,
            role=user.role,
        )
        return user

    async def authenticate_user(self, email: str, password: str) -> tuple[str, str]:
        result = await self.db.execute(select(User).where(User.email == email))
        user = result.scalar_one_or_none()
        if user is None:
            raise UnauthorizedException("Invalid email or password")
        if not self.verify_password(password, user.password_hash):
            raise UnauthorizedException("Invalid email or password")
        if not user.is_active:
            raise ForbiddenException("User account is disabled")
        access_token = self.create_access_token(str(user.id), user.role)
        refresh_token = self.create_refresh_token(str(user.id))
        logger.info(
            "user.login",
            user_id=str(user.id),
            email=user.email,
            role=user.role,
        )
        return access_token, refresh_token

    async def refresh_access_token(self, refresh_token: str) -> str:
        payload = self.decode_token(refresh_token)
        if payload.get("type") != "refresh":
            raise UnauthorizedException("Invalid token type")
        user_id = payload.get("sub")
        if user_id is None:
            raise UnauthorizedException("Invalid token payload")
        result = await self.db.execute(select(User).where(User.id == user_id))
        user = result.scalar_one_or_none()
        if user is None:
            raise UnauthorizedException("User not found")
        if not user.is_active:
            raise ForbiddenException("User account is disabled")
        new_token = self.create_access_token(str(user.id), user.role)
        logger.info(
            "user.token_refreshed",
            user_id=str(user.id),
        )
        return new_token

    async def logout_user(self, user_id: str, refresh_token: str) -> None:
        try:
            payload = jwt.decode(
                refresh_token,
                settings.SECRET_KEY,
                algorithms=["HS256"],
                options={"verify_exp": True},
            )
        except JWTError:
            raise UnauthorizedException("Invalid refresh token") from None
        exp = payload.get("exp")
        if exp is None:
            return
        remaining = exp - datetime.now(tz=UTC).timestamp()
        if remaining <= 0:
            return
        r = aioredis.from_url(str(settings.REDIS_URL))  # type: ignore[no-untyped-call]
        await r.setex(f"blacklist:{refresh_token}", int(remaining), "1")
        await r.aclose()
        logger.info(
            "user.logout",
            user_id=user_id,
        )
