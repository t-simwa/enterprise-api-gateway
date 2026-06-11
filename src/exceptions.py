from __future__ import annotations


class AppException(Exception):
    def __init__(self, status_code: int, code: str, message: str, details: dict | None = None):
        self.status_code = status_code
        self.code = code
        self.message = message
        self.details = details or {}


class NotFoundException(AppException):
    def __init__(self, entity: str, entity_id: str):
        super().__init__(404, "NOT_FOUND", f"{entity} '{entity_id}' not found", {"entity": entity, "id": entity_id})


class ConflictException(AppException):
    def __init__(self, code: str, message: str, details: dict | None = None):
        super().__init__(409, code, message, details)


class UnauthorizedException(AppException):
    def __init__(self, message: str = "Invalid credentials"):
        super().__init__(401, "UNAUTHORIZED", message)


class ForbiddenException(AppException):
    def __init__(self, message: str = "Insufficient permissions"):
        super().__init__(403, "FORBIDDEN", message)


class InsufficientStockException(AppException):
    def __init__(self, product_name: str, sku: str, available: int, requested: int):
        details = {"product_name": product_name, "sku": sku, "available": available, "requested": requested}
        super().__init__(
            409, "INSUFFICIENT_STOCK",
            f"Product '{product_name}' (SKU: {sku}) has only {available} units available. Requested: {requested}.",
            details,
        )


class RateLimitExceededException(AppException):
    def __init__(self, retry_after: int = 900):
        super().__init__(
            429, "RATE_LIMIT_EXCEEDED",
            f"Too many requests. Retry after {retry_after}s",
            {"retry_after_seconds": retry_after},
        )


class ValidationException(AppException):
    def __init__(self, message: str, details: dict | None = None):
        super().__init__(422, "VALIDATION_ERROR", message, details)
