#!/bin/bash
set -euo pipefail

# ── Full Performance Verification Suite ──────────────────────────────
# Usage: ./scripts/run.sh [--host HOST] [--port PORT]
#
# Requires the server to be running (e.g., `docker compose up -d api db redis`)

HOST="${1:-127.0.0.1}"
PORT="${2:-8000}"
BASE="http://${HOST}:${PORT}"

echo "=== Enterprise API Gateway — Verification Suite ==="
echo "Target: ${BASE}"
echo ""

# 1. Performance benchmark
echo "=== Performance Benchmark ==="
python scripts/benchmark.py --host "${HOST}" --port "${PORT}" --samples 10
echo ""

# 2. API Smoke Tests
echo "=== API Smoke Tests ==="

echo -n "Health check: "
curl -sf "${BASE}/health" > /dev/null && echo "PASS" || echo "FAIL"

echo -n "Swagger UI: "
curl -sf -o /dev/null -w "HTTP %{http_code}" "${BASE}/docs" && echo "" || echo "FAIL"

echo -n "Login as admin: "
TOKEN=$(curl -sf -X POST "${BASE}/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"Admin123!"}' \
  | python -c "import sys,json; print(json.load(sys.stdin)['access_token'])")
echo "PASS (token: ${TOKEN:0:20}...)"

echo -n "List products: "
curl -sf -H "Authorization: Bearer ${TOKEN}" "${BASE}/api/products?page=1&size=5" \
  | python -c "import sys,json; d=json.load(sys.stdin); print(f'PASS ({d[\"total\"]} products)')"

echo -n "List warehouses: "
curl -sf -H "Authorization: Bearer ${TOKEN}" "${BASE}/api/warehouses" \
  | python -c "import sys,json; d=json.load(sys.stdin); print(f'PASS ({len(d)} warehouses)')"

echo -n "Low stock report: "
curl -sf -H "Authorization: Bearer ${TOKEN}" "${BASE}/api/inventory/low-stock" \
  | python -c "import sys,json; d=json.load(sys.stdin); print(f'PASS ({len(d)} items)')"

echo -n "Revenue analytics: "
curl -sf -H "Authorization: Bearer ${TOKEN}" "${BASE}/api/analytics/revenue?days=30" \
  | python -c "import sys,json; d=json.load(sys.stdin); print(f'PASS ({d[\"total_revenue\"]})')"

echo ""
echo "=== All smoke tests complete ==="
