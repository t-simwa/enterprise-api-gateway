from __future__ import annotations

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_comprehensive_e2e(
    client: AsyncClient,
    session_factory,
    admin_headers: dict[str, str],
    auth_headers: dict[str, str],
) -> None:
    # Create warehouse
    wh_resp = await client.post(
        "/api/warehouses",
        json={"code": "EZ-WHS-01", "name": "E2E WH"},
        headers=admin_headers,
    )
    assert wh_resp.status_code == 201
    wh_id = wh_resp.json()["id"]

    # Create product
    prod_resp = await client.post(
        "/api/products",
        json={"sku": "E2E-001", "name": "E2E Product", "unit_price": 50.00, "reorder_point": 5},
        headers=admin_headers,
    )
    assert prod_resp.status_code == 201
    prod_id = prod_resp.json()["id"]

    # Create inventory record and then adjust
    async with session_factory() as session:
        from src.models.inventory import Inventory
        inv = Inventory(product_id=prod_id, warehouse_id=wh_id, quantity=0, reserved_qty=0)
        session.add(inv)
        await session.flush()
        await session.commit()

    adj_resp = await client.post(
        "/api/inventory/adjust",
        json={"product_id": prod_id, "warehouse_id": wh_id, "change_qty": 50, "reason": "purchase"},
        headers=admin_headers,
    )
    assert adj_resp.status_code == 200

    # Create order
    order_resp = await client.post(
        "/api/orders",
        json={
            "customer_name": "E2E Customer",
            "items": [{"product_id": prod_id, "quantity": 3}],
        },
        headers=admin_headers,
    )
    assert order_resp.status_code == 201
    order_id = order_resp.json()["id"]
    assert order_resp.json()["status"] == "pending"

    # Get order
    get_resp = await client.get(f"/api/orders/{order_id}")
    assert get_resp.status_code == 200

    # List orders
    list_resp = await client.get("/api/orders")
    assert list_resp.status_code == 200
    assert list_resp.json()["total"] >= 1

    # Search orders
    search_resp = await client.get("/api/orders/search?q=E2E")
    assert search_resp.status_code == 200

    # Get timeline
    tl_resp = await client.get(f"/api/orders/{order_id}/timeline")
    assert tl_resp.status_code == 200
    assert len(tl_resp.json()) >= 1

    # Update order status through full flow
    for status in ["confirmed", "processing", "shipped", "delivered"]:
        r = await client.put(
            f"/api/orders/{order_id}/status",
            json={"status": status},
            headers=admin_headers,
        )
        assert r.status_code == 200, f"Status {status} failed: {r.text}"

    # Return order
    ret_resp = await client.post(f"/api/orders/{order_id}/return", headers=admin_headers)
    assert ret_resp.status_code == 200

    # Dashboard
    dash_resp = await client.get("/api/orders/dashboard")
    assert dash_resp.status_code == 200
    assert "total_orders" in dash_resp.json()

    # Create another order to cancel
    order2_resp = await client.post(
        "/api/orders",
        json={
            "customer_name": "Cancel E2E",
            "items": [{"product_id": prod_id, "quantity": 1}],
        },
        headers=admin_headers,
    )
    order2_id = order2_resp.json()["id"]

    cancel_resp = await client.post(f"/api/orders/{order2_id}/cancel", headers=admin_headers)
    assert cancel_resp.status_code == 200
    assert cancel_resp.json()["status"] == "cancelled"

    # Get inventory
    inv_resp = await client.get(f"/api/inventory/{prod_id}")
    assert inv_resp.status_code == 200

    # Low stock
    ls_resp = await client.get("/api/inventory/low-stock?threshold=1000")
    assert ls_resp.status_code == 200

    # Audit log
    al_resp = await client.get(f"/api/inventory/audit-log?product_id={prod_id}")
    assert al_resp.status_code == 200
    assert al_resp.json()["total"] >= 1

    # Admin endpoints
    users_resp = await client.get("/admin/users", headers=admin_headers)
    assert users_resp.status_code == 200

    usage_resp = await client.get("/admin/api-usage", headers=admin_headers)
    assert usage_resp.status_code == 200

    metrics_resp = await client.get("/admin/metrics", headers=admin_headers)
    assert metrics_resp.status_code == 200

    logs_resp = await client.get("/admin/logs", headers=admin_headers)
    assert logs_resp.status_code == 200

    cache_resp = await client.post("/admin/cache/clear", headers=admin_headers)
    assert cache_resp.status_code == 200

    # Viewer cannot access admin
    fb_resp = await client.get("/admin/users", headers=auth_headers)
    assert fb_resp.status_code == 403

    # Health check
    health_resp = await client.get("/health")
    assert health_resp.status_code == 200

    # Update product
    upd_resp = await client.put(
        f"/api/products/{prod_id}",
        json={"name": "Updated E2E", "unit_price": 55.00},
        headers=admin_headers,
    )
    assert upd_resp.status_code == 200
    assert upd_resp.json()["name"] == "Updated E2E"

    # Get product
    getp_resp = await client.get(f"/api/products/{prod_id}")
    assert getp_resp.status_code == 200

    # Soft delete product
    del_resp = await client.delete(f"/api/products/{prod_id}", headers=admin_headers)
    assert del_resp.status_code == 204
