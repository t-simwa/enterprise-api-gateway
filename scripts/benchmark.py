"""Performance benchmark for Enterprise API Gateway.

Tests all critical endpoints against latency targets:
  - Simple queries: <200ms mean
  - Complex queries: <500ms mean

Usage:
  python scripts/benchmark.py [--host HOST] [--port PORT] [--samples N]

Requires a running server with seeded data.
"""

from __future__ import annotations

import argparse
import asyncio
import json
import sys
import time
from pathlib import Path
from statistics import mean, median, stdev

import httpx


class BenchmarkError(Exception):
    pass


SIMPLE_ENDPOINTS = [
    ("GET", "/health", None),
    ("GET", "/auth/me", None),
    ("GET", "/api/products?page=1&size=20", None),
    ("GET", "/api/warehouses", None),
]

COMPLEX_ENDPOINTS = [
    ("GET", "/api/orders?page=1&size=20", None),
    ("GET", "/api/inventory", None),
    ("GET", "/api/analytics/revenue?days=30", None),
]


def _fmt(ms: float) -> str:
    if ms < 1:
        return f"{ms*1000:.1f}μs"
    return f"{ms:.1f}ms"


async def _authenticate(client: httpx.AsyncClient, base: str) -> str:
    resp = await client.post(
        f"{base}/auth/login",
        json={"email": "admin@example.com", "password": "Admin123!"},
    )
    if resp.status_code != 200:
        raise BenchmarkError(
            f"Auth failed ({resp.status_code}): {resp.text[:200]}"
        )
    data = resp.json()
    return str(data["access_token"])


async def _warmup(client: httpx.AsyncClient, base: str, token: str) -> None:
    headers = {"Authorization": f"Bearer {token}"}
    endpoints = SIMPLE_ENDPOINTS + COMPLEX_ENDPOINTS
    for method, path, _ in endpoints:
        if method == "GET":
            await client.get(f"{base}{path}", headers=headers)
        elif method == "POST":
            sample_body = (
                json.dumps({
                    "customer_name": "Warmup",
                    "items": [],
                })
                if "/orders" in path
                else None
            )
            await client.post(
                f"{base}{path}",
                content=sample_body,
                headers=headers,
            )


async def _bench_endpoint(
    client: httpx.AsyncClient,
    base: str,
    method: str,
    path: str,
    body: dict | None,
    token: str,
    samples: int,
) -> list[float]:
    headers = {"Authorization": f"Bearer {token}"}
    latencies: list[float] = []

    for _ in range(samples):
        t0 = time.perf_counter()
        if method == "GET":
            resp = await client.get(f"{base}{path}", headers=headers)
        elif method == "POST":
            resp = await client.post(
                f"{base}{path}",
                json=body or {},
                headers=headers,
            )
        elapsed = (time.perf_counter() - t0) * 1000  # ms
        latencies.append(elapsed)

        if resp.status_code >= 400 and resp.status_code != 404:
            print(
                f"  ⚠ {method} {path} → {resp.status_code} "
                f"(ignored for perf, but endpoint may have issues)"
            )

    return latencies


def _print_results(
    label: str,
    latencies: list[float],
    threshold: float,
) -> tuple[bool, float]:
    mean_ms = mean(latencies)
    passed = mean_ms < threshold

    status = "PASS" if passed else "FAIL"
    n = len(latencies)
    p50 = median(latencies)
    p95 = sorted(latencies)[int(n * 0.95)]
    p99 = sorted(latencies)[int(n * 0.99)]
    std = stdev(latencies) if n > 1 else 0.0

    print(
        f"  [{status:4s}] {label:50s} "
        f"mean={_fmt(mean_ms):>8s}  "
        f"p50={_fmt(p50):>8s}  "
        f"p95={_fmt(p95):>8s}  "
        f"p99={_fmt(p99):>8s}  "
        f"σ={_fmt(std):>8s}"
    )
    return passed, mean_ms


async def run_benchmark(
    host: str = "127.0.0.1",
    port: int = 8000,
    samples: int = 10,
) -> dict[str, list[dict]]:
    base = f"http://{host}:{port}"

    print(f"\n{'='*80}")
    print(f"  Performance Benchmark — {base}")
    print(f"  Samples per endpoint: {samples}")
    print(f"{'='*80}\n")

    async with httpx.AsyncClient(timeout=30.0) as client:
        print("Authenticating...")
        token = await _authenticate(client, base)
        print(f"  Token obtained (sample: {token[:20]}...)\n")

        print("Warming up...")
        await _warmup(client, base, token)
        print("  Done.\n")

        results: dict[str, list[dict]] = {"simple": [], "complex": []}
        all_passed = True

        print("─" * 80)
        print("  SIMPLE ENDPOINTS (target <200ms mean)")
        print("─" * 80)
        for method, path, body in SIMPLE_ENDPOINTS:
            latencies = await _bench_endpoint(
                client, base, method, path, body, token, samples
            )
            passed, avg = _print_results(f"{method} {path}", latencies, 200.0)
            results["simple"].append({
                "method": method,
                "path": path,
                "passed": passed,
                "mean_ms": round(avg, 2),
                "p50_ms": round(median(latencies), 2),
                "p95_ms": round(sorted(latencies)[int(samples * 0.95)], 2),
                "p99_ms": round(sorted(latencies)[int(samples * 0.99)], 2),
            })
            if not passed:
                all_passed = False

        print()
        print("─" * 80)
        print("  COMPLEX ENDPOINTS (target <500ms mean)")
        print("─" * 80)
        for method, path, body in COMPLEX_ENDPOINTS:
            latencies = await _bench_endpoint(
                client, base, method, path, body, token, samples
            )
            passed, avg = _print_results(f"{method} {path}", latencies, 500.0)
            results["complex"].append({
                "method": method,
                "path": path,
                "passed": passed,
                "mean_ms": round(avg, 2),
                "p50_ms": round(median(latencies), 2),
                "p95_ms": round(sorted(latencies)[int(samples * 0.95)], 2),
                "p99_ms": round(sorted(latencies)[int(samples * 0.99)], 2),
            })
            if not passed:
                all_passed = False

        print()
        print("─" * 80)
        if all_passed:
            print("  ✅ ALL ENDPOINTS PASS latency thresholds")
        else:
            print("  ❌ SOME ENDPOINTS FAILED latency thresholds")
        print("─" * 80)
        print()

        return results


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Performance benchmark for Enterprise API Gateway"
    )
    parser.add_argument(
        "--host", default="127.0.0.1", help="Server host (default: 127.0.0.1)"
    )
    parser.add_argument(
        "--port", type=int, default=8000, help="Server port (default: 8000)"
    )
    parser.add_argument(
        "--samples",
        type=int,
        default=10,
        help="Requests per endpoint (default: 10)",
    )
    args = parser.parse_args()

    results = asyncio.run(
        run_benchmark(
            host=args.host, port=args.port, samples=args.samples
        )
    )

    all_simple = all(r["passed"] for r in results["simple"])
    all_complex = all(r["passed"] for r in results["complex"])

    if not (all_simple and all_complex):
        print("❌ Benchmark FAILED — some endpoints exceed latency targets")
        return 1

    print("✅ Benchmark PASSED — all endpoints meet latency targets")
    return 0


if __name__ == "__main__":
    sys.exit(main())
