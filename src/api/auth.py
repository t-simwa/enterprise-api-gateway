from __future__ import annotations

from typing import TYPE_CHECKING

from fastapi import APIRouter, Depends, status

from src.api.deps import get_current_user, get_db
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

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", status_code=status.HTTP_201_CREATED, response_model=UserResponse)
async def register(body: RegisterRequest, db: AsyncSession = Depends(get_db)) -> User:
    svc = AuthService(db)
    user = await svc.register_user(email=body.email, password=body.password, full_name=body.full_name)
    await db.commit()
    return UserResponse(id=user.id, email=user.email, full_name=user.full_name, role=user.role, created_at=user.created_at)


@router.post("/login", response_model=TokenResponse)
async def login(body: LoginRequest, db: AsyncSession = Depends(get_db)) -> TokenResponse:
    svc = AuthService(db)
    access_token, refresh_token = await svc.authenticate_user(email=body.email, password=body.password)
    return TokenResponse(access_token=access_token, refresh_token=refresh_token)


@router.post("/refresh", response_model=TokenResponse)
async def refresh(body: RefreshRequest, db: AsyncSession = Depends(get_db)) -> TokenResponse:
    svc = AuthService(db)
    new_access = await svc.refresh_access_token(body.refresh_token)
    return TokenResponse(access_token=new_access, refresh_token=body.refresh_token)


@router.post("/logout", status_code=status.HTTP_200_OK)
async def logout(
    current_user: User = Depends(get_current_user),
    body: RefreshRequest | None = None,
) -> dict[str, str]:
    if body and body.refresh_token:
        svc = AuthService.__new__(AuthService)
        svc.db = None  # type: ignore[assignment]
        await svc.logout_user(str(current_user.id), body.refresh_token)
    return {"message": "Logged out successfully"}


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)) -> User:
    return UserResponse(id=current_user.id, email=current_user.email, full_name=current_user.full_name, role=current_user.role, created_at=current_user.created_at)
