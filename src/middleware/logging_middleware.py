from __future__ import annotations

import time
from collections.abc import Awaitable, Callable, MutableMapping
from typing import Any

import structlog
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

SENSITIVE_FIELDS = {"password", "token", "secret", "authorization", "refresh_token"}


def scrub_sensitive_keys(logger: Any, method_name: str, event_dict: MutableMapping[str, Any]) -> MutableMapping[str, Any]:  # noqa: ARG001
    for key in list(event_dict.keys()):
        lower_key = key.lower()
        if any(field in lower_key for field in SENSITIVE_FIELDS):
            event_dict[key] = "***"
    return event_dict


class LoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(
        self, request: Request, call_next: Callable[[Request], Awaitable[Response]]
    ) -> Response:
        request_id = request.state.request_id
        logger = structlog.get_logger("api.request")

        query_params = dict(request.query_params)
        client_host = request.client.host if request.client else "unknown"
        user_agent = request.headers.get("user-agent", "")

        logger.info(
            "request.started",
            request_id=request_id,
            method=request.method,
            path=request.url.path,
            query_params=query_params,
            client_ip=client_host,
            user_agent=user_agent,
        )

        start = time.monotonic()
        try:
            response = await call_next(request)
        except Exception as exc:
            duration = time.monotonic() - start
            logger.error(
                "request.failed",
                request_id=request_id,
                method=request.method,
                path=request.url.path,
                duration_ms=round(duration * 1000, 2),
                error=str(exc),
            )
            raise

        duration = time.monotonic() - start
        content_length = response.headers.get("content-length")
        logger.info(
            "request.completed",
            request_id=request_id,
            method=request.method,
            path=request.url.path,
            status_code=response.status_code,
            duration_ms=round(duration * 1000, 2),
            content_length=content_length,
        )

        return response
