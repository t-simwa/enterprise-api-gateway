from __future__ import annotations

import math
from typing import Any

from pydantic import BaseModel


class PaginationParams(BaseModel):
    page: int = 1
    size: int = 20


class PaginatedResponse(BaseModel):
    items: list[Any]
    total: int
    page: int
    size: int
    pages: int

    def __init__(self, **data: Any) -> None:
        total = data.get("total", 0)
        size = data.get("size", 20)
        data["pages"] = max(1, math.ceil(total / size)) if size > 0 else 1
        super().__init__(**data)


class ErrorResponse(BaseModel):
    status: str = "error"
    code: str
    message: str
    details: dict[str, Any] = {}
    timestamp: str
    request_id: str | None = None


class HealthResponse(BaseModel):
    status: str
    database: str
    redis: str
    disk: str
    version: str
    uptime_seconds: float
