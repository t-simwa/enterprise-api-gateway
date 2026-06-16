from __future__ import annotations

import time
from collections.abc import Awaitable, Callable

from prometheus_client import CONTENT_TYPE_LATEST, Counter, Histogram, generate_latest
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

http_requests_total = Counter(
    "http_requests_total", "Total HTTP requests",
    ["method", "endpoint", "status"],
)
http_request_duration_seconds = Histogram(
    "http_request_duration_seconds", "HTTP request duration",
    ["method", "endpoint"],
    buckets=[0.01, 0.05, 0.1, 0.5, 1.0, 2.0, 5.0],
)
db_query_duration_seconds = Histogram(
    "db_query_duration_seconds", "DB query duration",
    ["operation"],
)
active_orders = Counter("active_orders_total", "Total orders created")
stock_adjustments = Counter(
    "stock_adjustments_total", "Total stock adjustments",
    ["reason"],
)


class MetricsMiddleware(BaseHTTPMiddleware):
    async def dispatch(
        self, request: Request, call_next: Callable[[Request], Awaitable[Response]]
    ) -> Response:
        start = time.time()
        response = await call_next(request)
        duration = time.time() - start
        path = request.url.path
        http_requests_total.labels(
            method=request.method,
            endpoint=path,
            status=response.status_code,
        ).inc()
        http_request_duration_seconds.labels(
            method=request.method,
            endpoint=path,
        ).observe(duration)
        return response


async def metrics_endpoint(request: Request) -> Response:
    return Response(content=generate_latest(), media_type=CONTENT_TYPE_LATEST)
