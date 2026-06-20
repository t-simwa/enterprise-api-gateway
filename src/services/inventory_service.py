from __future__ import annotations

import asyncio
from typing import TYPE_CHECKING, Any
from uuid import UUID

import structlog
from sqlalchemy import Select, func, select

from src.exceptions import InsufficientStockException, NotFoundException
from src.middleware.metrics import stock_adjustments
from src.models.inventory import Inventory, InventoryTransaction, Warehouse
from src.models.product import Product

logger = structlog.get_logger(__name__)

if TYPE_CHECKING:
    from sqlalchemy.ext.asyncio import AsyncSession


class InventoryService:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def get_inventory_by_product(
        self, product_id: UUID
    ) -> dict[str, Any]:
        result = await self.db.execute(
            select(Product).where(Product.id == product_id, Product.is_active)
        )
        product = result.scalar_one_or_none()
        if product is None:
            raise NotFoundException("Product", str(product_id))

        result = await self.db.execute(
            select(Inventory, Warehouse)
            .join(Warehouse, Inventory.warehouse_id == Warehouse.id)
            .where(Inventory.product_id == product_id)
        )
        rows = result.all()

        warehouses: list[dict[str, Any]] = []
        total_qty = 0
        total_reserved = 0
        for inv, wh in rows:
            available = inv.quantity - inv.reserved_qty
            warehouses.append({
                "warehouse_id": inv.warehouse_id,
                "warehouse_name": wh.name,
                "warehouse_code": wh.code,
                "quantity": inv.quantity,
                "reserved_qty": inv.reserved_qty,
                "available_qty": max(available, 0),
            })
            total_qty += inv.quantity
            total_reserved += inv.reserved_qty

        total_available = total_qty - total_reserved
        return {
            "product_id": product.id,
            "sku": product.sku,
            "name": product.name,
            "total_qty": total_qty,
            "total_reserved": total_reserved,
            "total_available": max(total_available, 0),
            "warehouses": warehouses,
        }

    async def adjust_stock(
        self,
        product_id: UUID,
        warehouse_id: UUID,
        change_qty: int,
        reason: str,
        notes: str | None,
        user_id: UUID,
    ) -> dict[str, Any]:
        result = await self.db.execute(
            select(Product).where(Product.id == product_id, Product.is_active)
        )
        product = result.scalar_one_or_none()
        if product is None:
            raise NotFoundException("Product", str(product_id))

        inv_row = await self._lock_inventory(product_id, warehouse_id)
        if inv_row is None:
            raise NotFoundException(
                "Inventory",
                f"{product_id}:{warehouse_id}",
            )

        new_qty = inv_row.quantity + change_qty
        if new_qty < 0:
            available = inv_row.quantity - inv_row.reserved_qty
            raise InsufficientStockException(
                product.name,
                product.sku,
                max(available, 0),
                abs(change_qty),
            )

        inv_row.quantity = new_qty

        tx = InventoryTransaction(
            product_id=product_id,
            warehouse_id=warehouse_id,
            change_qty=change_qty,
            reason=reason,
            notes=notes,
            created_by=user_id,
        )
        self.db.add(tx)
        await self.db.flush()
        await self.db.refresh(inv_row)

        stock_adjustments.labels(reason=reason).inc()

        logger.info(
            "stock.adjusted",
            product_id=str(product_id),
            warehouse_id=str(warehouse_id),
            change_qty=change_qty,
            new_quantity=inv_row.quantity,
            reason=reason,
        )

        if new_qty < product.reorder_point:
            from src.api.websocket import manager

            asyncio.create_task(
                manager.broadcast_low_stock_alert(
                    product_id=str(product_id),
                    product_name=product.name,
                    sku=product.sku,
                    current_stock=new_qty,
                    reorder_point=product.reorder_point,
                    warehouse_id=str(warehouse_id),
                )
            )

        return {
            "product_id": inv_row.product_id,
            "warehouse_id": inv_row.warehouse_id,
            "quantity": inv_row.quantity,
            "reserved_qty": inv_row.reserved_qty,
            "change_qty": change_qty,
            "reason": reason,
        }

    async def transfer_stock(
        self,
        product_id: UUID,
        from_warehouse_id: UUID,
        to_warehouse_id: UUID,
        quantity: int,
        user_id: UUID,
    ) -> dict[str, Any]:
        result = await self.db.execute(
            select(Product).where(Product.id == product_id, Product.is_active)
        )
        product = result.scalar_one_or_none()
        if product is None:
            raise NotFoundException("Product", str(product_id))

        from_inv = await self._lock_inventory(product_id, from_warehouse_id)
        if from_inv is None:
            raise NotFoundException(
                "Inventory",
                f"{product_id}:{from_warehouse_id}",
            )

        available = from_inv.quantity - from_inv.reserved_qty
        if available < quantity:
            raise InsufficientStockException(
                product.name,
                product.sku,
                max(available, 0),
                quantity,
            )

        to_inv = await self._lock_inventory(product_id, to_warehouse_id)
        if to_inv is None:
            raise NotFoundException(
                "Inventory",
                f"{product_id}:{to_warehouse_id}",
            )

        from_inv.quantity -= quantity
        to_inv.quantity += quantity

        tx_out = InventoryTransaction(
            product_id=product_id,
            warehouse_id=from_warehouse_id,
            change_qty=-quantity,
            reason="transfer",
            notes=f"Transfer to warehouse {to_warehouse_id}",
            created_by=user_id,
        )
        tx_in = InventoryTransaction(
            product_id=product_id,
            warehouse_id=to_warehouse_id,
            change_qty=quantity,
            reason="transfer",
            notes=f"Transfer from warehouse {from_warehouse_id}",
            created_by=user_id,
        )
        self.db.add_all([tx_out, tx_in])
        await self.db.flush()
        await self.db.refresh(from_inv)
        await self.db.refresh(to_inv)

        logger.info(
            "stock.transferred",
            product_id=str(product_id),
            from_warehouse_id=str(from_warehouse_id),
            to_warehouse_id=str(to_warehouse_id),
            quantity=quantity,
        )

        if from_inv.quantity < product.reorder_point:
            from src.api.websocket import manager

            asyncio.create_task(
                manager.broadcast_low_stock_alert(
                    product_id=str(product_id),
                    product_name=product.name,
                    sku=product.sku,
                    current_stock=from_inv.quantity,
                    reorder_point=product.reorder_point,
                    warehouse_id=str(from_warehouse_id),
                )
            )

        return {
            "product_id": product_id,
            "from_warehouse_id": from_warehouse_id,
            "to_warehouse_id": to_warehouse_id,
            "quantity": quantity,
            "from_quantity": from_inv.quantity,
            "to_quantity": to_inv.quantity,
        }

    async def _lock_inventory(
        self, product_id: UUID, warehouse_id: UUID
    ) -> Inventory | None:
        stmt: Select[tuple[Inventory]] = (
            select(Inventory)
            .where(
                Inventory.product_id == product_id,
                Inventory.warehouse_id == warehouse_id,
            )
            .with_for_update()
        )
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def get_low_stock(
        self, threshold: int | None = None
    ) -> list[dict[str, Any]]:
        subq = (
            select(
                Inventory.product_id,
                func.coalesce(func.sum(Inventory.quantity), 0).label("total_qty"),
            )
            .group_by(Inventory.product_id)
            .subquery()
        )

        query = (
            select(Product, subq.c.total_qty)
            .join(subq, Product.id == subq.c.product_id)
            .where(Product.is_active)
        )

        if threshold is not None:
            query = query.where(subq.c.total_qty < threshold)
        else:
            query = query.where(subq.c.total_qty < Product.reorder_point)

        result = await self.db.execute(query)
        rows = result.all()

        return [
            {
                "product_id": p.id,
                "sku": p.sku,
                "name": p.name,
                "category": p.category,
                "total_qty": int(total_qty),
                "reorder_point": p.reorder_point,
            }
            for p, total_qty in rows
        ]

    async def get_audit_log(
        self,
        page: int = 1,
        size: int = 20,
        product_id: UUID | None = None,
    ) -> tuple[list[InventoryTransaction], int]:
        query = select(InventoryTransaction)

        if product_id is not None:
            query = query.where(InventoryTransaction.product_id == product_id)

        query = query.order_by(InventoryTransaction.created_at.desc())

        count_query = select(func.count()).select_from(query.subquery())
        total_result = await self.db.execute(count_query)
        total: int = total_result.scalar() or 0

        offset = (page - 1) * size
        query = query.offset(offset).limit(size)
        result = await self.db.execute(query)
        items = list(result.scalars().all())

        return items, total
