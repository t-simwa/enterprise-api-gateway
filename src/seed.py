from __future__ import annotations

import asyncio

from passlib.hash import bcrypt
from sqlalchemy import select

from src.database import Base, async_session, engine
from src.models.inventory import Inventory, InventoryTransaction, Warehouse
from src.models.product import Product
from src.models.user import User

WAREHOUSES = [
    {"code": "WH-NAI-01", "name": "Nairobi Central", "location": "Nairobi, Kenya"},
    {"code": "WH-NAI-02", "name": "Industrial Area", "location": "Nairobi, Kenya"},
    {"code": "WH-MBA-01", "name": "Mombasa Port", "location": "Mombasa, Kenya"},
    {"code": "WH-KSM-01", "name": "Kisumu Lakeside", "location": "Kisumu, Kenya"},
    {"code": "WH-NKR-01", "name": "Nakuru", "location": "Nakuru, Kenya"},
]

PRODUCT_DATA = [
    ("ELEC-001", 'Laptop Pro 15"',     "Electronics",       1499.99, 1100.00),
    ("ELEC-002", "Wireless Mouse",       "Electronics",         49.99,   25.00),
    ("ELEC-003", "USB-C Hub 7-in-1",     "Electronics",         79.99,   40.00),
    ("ELEC-004", "Bluetooth Headphones",  "Electronics",        199.99,  120.00),
    ("CLTH-001", "Cotton T-Shirt",       "Clothing",            29.99,   12.00),
    ("CLTH-002", "Denim Jeans",          "Clothing",            89.99,   45.00),
    ("CLTH-003", "Running Sneakers",     "Clothing",           129.99,   70.00),
    ("CLTH-004", "Winter Jacket",        "Clothing",           199.99,  110.00),
    ("FOOD-001", "Organic Coffee Beans 1kg", "Food & Beverages", 24.99, 15.00),
    ("FOOD-002", "Green Tea 100 bags",   "Food & Beverages",    12.99,    6.00),
    ("FOOD-003", "Dark Chocolate 200g",  "Food & Beverages",     8.99,    4.00),
    ("FOOD-004", "Almond Milk 1L",       "Food & Beverages",     6.99,    3.50),
    ("HOME-001", "Stainless Steel Cookware Set", "Home & Garden", 299.99, 180.00),
    ("HOME-002", "Scented Candle Set",    "Home & Garden",       34.99,   15.00),
    ("HOME-003", "Bamboo Cutting Board",  "Home & Garden",       19.99,    8.00),
    ("HOME-004", "Memory Foam Pillow",    "Home & Garden",       59.99,   30.00),
    ("OFFC-001", "Ergonomic Office Chair", "Office Supplies",   599.99,  350.00),
    ("OFFC-002", 'Standing Desk 60"',     "Office Supplies",    799.99,  500.00),
    ("OFFC-003", 'Monitor 27" 4K',        "Office Supplies",    449.99,  300.00),
    ("OFFC-004", "Mechanical Keyboard",   "Office Supplies",    149.99,   80.00),
]

PRODUCTS = [
    {"sku": sku, "name": name, "category": cat,
     "unit_price": price, "unit_cost": cost}
    for sku, name, cat, price, cost in PRODUCT_DATA
]


async def seed_database() -> None:
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with async_session() as session:
        existing_warehouses = (await session.execute(select(Warehouse))).scalars().all()
        if existing_warehouses:
            print("Database already seeded, skipping...")
            return

        warehouse_objs: list[Warehouse] = []
        for w_data in WAREHOUSES:
            warehouse = Warehouse(**w_data)
            session.add(warehouse)
            warehouse_objs.append(warehouse)
        await session.flush()

        product_objs: list[Product] = []
        for p_data in PRODUCTS:
            product = Product(**p_data)
            session.add(product)
            product_objs.append(product)
        await session.flush()

        import random
        for warehouse in warehouse_objs:
            for product in product_objs:
                qty = random.randint(100, 500)
                inventory = Inventory(
                    product_id=product.id,
                    warehouse_id=warehouse.id,
                    quantity=qty,
                    reserved_qty=random.randint(0, 20),
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
        await session.commit()

    print("Database seeded successfully!")
    print(f"  - {len(warehouse_objs)} warehouses")
    print(f"  - {len(product_objs)} products")
    print(f"  - {len(warehouse_objs) * len(product_objs)} inventory records")
    print("  - 2 users (admin@example.com, manager@example.com)")


if __name__ == "__main__":
    asyncio.run(seed_database())
