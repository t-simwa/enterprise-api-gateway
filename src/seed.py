from __future__ import annotations

import asyncio
from datetime import UTC, datetime, timedelta

import structlog
from passlib.hash import bcrypt
from sqlalchemy import select

from src.database import Base, async_session, engine
from src.models.inventory import Inventory, InventoryTransaction, Warehouse
from src.models.order import Order, OrderEvent, OrderItem
from src.models.product import Product
from src.models.user import User

logger = structlog.get_logger(__name__)

# ── Mock data constants matching frontend src/lib/api.ts ──────────────

PRODUCT_NAMES = [
    "Carbon Mesh Hoodie",
    "Tungsten Bolt M6",
    "Helix Cable USB-C",
    "Quartz Sensor v2",
    "Atlas Backpack 30L",
    "Vector Multitool",
    "Orbit Mouse Pad",
    "Photon LED Strip",
    "Nimbus Wireless Hub",
    "Cipher Mechanical Keyboard",
    "Pulse Headset Pro",
    "Mantis Tripod",
]
CATEGORIES = ["Hardware", "Apparel", "Accessories", "Components", "Tools"]

CUSTOMERS = [
    "Acme Inc.",
    "Globex",
    "Initech",
    "Umbrella Co.",
    "Wayne Enterprises",
    "Stark Industries",
    "Hooli",
    "Pied Piper",
    "Soylent",
    "Massive Dynamic",
]

STATUSES = ["pending", "processing", "shipped", "delivered", "cancelled"]

WAREHOUSE_DATA = [
    ("WH-USE-01", "US-East", "New York, USA"),
    ("WH-USW-01", "US-West", "San Francisco, USA"),
    ("WH-EUC-01", "EU-Central", "Frankfurt, Germany"),
    ("WH-APC-01", "APAC", "Singapore"),
]


async def seed_database() -> None:
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with async_session() as session:
        existing = (await session.execute(select(Warehouse))).scalars().all()
        if existing:
            logger.info("Database already seeded, skipping...")
            return

        # ── 1. Products (12, matching mock) ──────────────────────────
        product_objs: list[Product] = []
        for i, name in enumerate(PRODUCT_NAMES):
            unit_price = round(20.00 + (i * 17) % 180 + 0.99, 2)
            product = Product(
                sku=f"SKU-{1000 + i}",
                name=name,
                category=CATEGORIES[i % len(CATEGORIES)],
                unit_price=unit_price,
                reorder_point=20 + (i % 5) * 10,
                is_active=True,
            )
            session.add(product)
            product_objs.append(product)
        await session.flush()

        # ── 2. Warehouses (4, matching mock) ─────────────────────────
        warehouse_objs: list[Warehouse] = []
        for code, name, location in WAREHOUSE_DATA:
            wh = Warehouse(code=code, name=name, location=location)
            session.add(wh)
            warehouse_objs.append(wh)
        await session.flush()

        # ── 3. Inventory (48 rows, matching mock formula) ────────────
        # Mock formula: qty = max(0, ((i*7 + j*11) % 90) - (80 if j==0 and i%4==0 else 0))
        # where i = product index, j = warehouse index
        _low_stock_products = {0, 3, 6, 10}  # indices to make low stock (total_qty < reorder_point)
        for i, product in enumerate(product_objs):
            for j, warehouse in enumerate(warehouse_objs):
                qty = max(0, ((i * 7 + j * 11) % 90) - (80 if j == 0 and i % 4 == 0 else 0))
                # Ensure some products are below reorder point
                if i in _low_stock_products:
                    qty = max(0, qty - 60)
                reserved = min(qty, round(qty * 0.15))
                inventory = Inventory(
                    product_id=product.id,
                    warehouse_id=warehouse.id,
                    quantity=qty,
                    reserved_qty=reserved,
                )
                session.add(inventory)
                tx = InventoryTransaction(
                    product_id=product.id,
                    warehouse_id=warehouse.id,
                    change_qty=qty,
                    reason="initial_stock",
                    notes="Initial stock on setup",
                )
                session.add(tx)
        await session.flush()

        # ── 4. Users ─────────────────────────────────────────────────
        admin = User(
            email="admin@example.com",
            password_hash=bcrypt.hash("Admin123!"),
            full_name="System Administrator",
            role="admin",
            is_active=True,
        )
        manager = User(
            email="manager@example.com",
            password_hash=bcrypt.hash("Manager123!"),
            full_name="Operations Manager",
            role="manager",
            is_active=True,
        )
        session.add_all([admin, manager])
        await session.flush()

        # ── 5. Orders (60, matching mock) ────────────────────────────
        now = datetime.now(tz=UTC)
        for i in range(60):
            items_count = 1 + (i % 6)
            order = Order(
                order_number=f"EAG-{10240 + i}",
                customer_name=CUSTOMERS[i % len(CUSTOMERS)],
                status=STATUSES[i % len(STATUSES)],
                total_amount=0,
                created_by=admin.id,
            )
            spread_hours = i * (1 + (i * 7 + 13) % 3)
            order.created_at = now - timedelta(hours=spread_hours)
            session.add(order)
            await session.flush()

            total = 0
            for oi in range(items_count):
                product = product_objs[(i + oi) % len(product_objs)]
                qty = 1 + ((i + oi) % 3)
                line_total = round(float(product.unit_price) * qty, 2)
                total += line_total
                item = OrderItem(
                    order_id=order.id,
                    product_id=product.id,
                    quantity=qty,
                    unit_price=product.unit_price,
                    total_price=line_total,
                )
                session.add(item)

            order.total_amount = round(total, 2)

            status = order.status
            event = OrderEvent(
                order_id=order.id,
                from_status=None,
                to_status=status,
                created_by=admin.id,
            )
            session.add(event)

            # Add a transition to "delivered" for delivered orders
            # so avg_processing_hours is meaningful
            if status == "delivered":
                transit = OrderEvent(
                    order_id=order.id,
                    from_status="pending",
                    to_status="delivered",
                    created_by=admin.id,
                )
                session.add(transit)

        await session.commit()

    logger.info(
        "Database seeded successfully",
        products=12,
        warehouses=4,
        inventory_records=48,
        orders=60,
        users=2,
    )


if __name__ == "__main__":
    asyncio.run(seed_database())
