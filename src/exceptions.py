from __future__ import annotations

from typing import Any


class AppException(Exception):  # noqa: N818
    def __init__(
        self,
        status_code: int,
        code: str,
        message: str,
        details: dict[str, Any] | None = None,
    ) -> None:
        self.status_code = status_code
        self.code = code
        self.message = message
        self.details = details or {}


class NotFoundException(AppException):
    def __init__(self, entity: str, entity_id: str) -> None:
        details: dict[str, str] = {"entity": entity, "id": entity_id}
        msg = f"{entity} '{entity_id}' not found"
        super().__init__(404, "NOT_FOUND", msg, details)


class ConflictException(AppException):
    def __init__(self, code: str, message: str, details: dict[str, Any] | None = None) -> None:
        super().__init__(409, code, message, details)


class UnauthorizedException(AppException):
    def __init__(self, message: str = "Invalid credentials") -> None:
        super().__init__(401, "UNAUTHORIZED", message)


class ForbiddenException(AppException):
    def __init__(self, message: str = "Insufficient permissions") -> None:
        super().__init__(403, "FORBIDDEN", message)


class InsufficientStockException(AppException):
    def __init__(self, product_name: str, sku: str, available: int, requested: int) -> None:
        details: dict[str, Any] = {
            "product_name": product_name, "sku": sku,
            "available": available, "requested": requested,
        }
        msg = (
            f"Product '{product_name}' (SKU: {sku}) has only"
            f" {available} units available. Requested: {requested}."
        )
        super().__init__(409, "INSUFFICIENT_STOCK", msg, details)


class RateLimitExceededException(AppException):
    def __init__(self, retry_after: int = 900) -> None:
        details: dict[str, int] = {"retry_after_seconds": retry_after}
        msg = f"Too many requests. Retry after {retry_after}s"
        super().__init__(429, "RATE_LIMIT_EXCEEDED", msg, details)


class ValidationException(AppException):
    def __init__(self, message: str, details: dict[str, Any] | None = None) -> None:
        super().__init__(422, "VALIDATION_ERROR", message, details)
