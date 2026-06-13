from __future__ import annotations

from datetime import UTC, datetime
from typing import TYPE_CHECKING, Any
from uuid import UUID

import structlog
from sqlalchemy import func, or_, select
from sqlalchemy.orm import selectinload

from src.exceptions import ConflictException, InsufficientStockException, NotFoundException
from src.models.inventory import Inventory, InventoryTransaction
from src.models.order import Order, OrderEvent, OrderItem
from src.models.product import Product

logger = structlog.get_logger(__name__)

ORDER_LOAD_OPTS = [
    selectinload(Order.items).selectinload(OrderItem.product),
    selectinload(Order.events),
]

if TYPE_CHECKING:
    from sqlalchemy.ext.asyncio import AsyncSession

VALID_TRANSITIONS: dict[str, list[str]] = {
    "pending": ["confirmed", "cancelled"],
    "confirmed": ["processing", "cancelled"],
    "processing": ["shipped"],
    "shipped": ["delivered"],
    "delivered": ["returned"],
    "cancelled": [],
    "returned": [],
}


class OrderService:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def generate_order_number(self) -> str:
        from uuid import uuid4

        year = datetime.now(tz=UTC).year
        suffix = uuid4().hex[:8].upper()
        return f"ORD-{year}-{suffix}"

    async def create_order(
        self,
        customer_name: str,
        customer_email: str | None,
        items: list[dict[str, Any]],
        user_id: UUID,
    ) -> Order:
        order_number = await self.generate_order_number()
        order_items_data: list[dict[str, Any]] = []
        total_amount = 0

        for item in items:
            product_id = item["product_id"]
            quantity = item["quantity"]

            result = await self.db.execute(
                select(Product).where(Product.id == product_id, Product.is_active)
            )
            product = result.scalar_one_or_none()
            if product is None:
                raise NotFoundException("Product", str(product_id))

            inv_result = await self.db.execute(
                select(Inventory)
                .where(
                    Inventory.product_id == product_id,
                    Inventory.quantity - Inventory.reserved_qty >= quantity,
                )
                .order_by(Inventory.quantity.desc())
                .limit(1)
                .with_for_update()
            )
            inventory = inv_result.scalar_one_or_none()
            if inventory is None:
                available = await self._get_total_available(product_id)
                raise InsufficientStockException(
                    product.name, product.sku, available, quantity
                )

            inventory.reserved_qty += quantity

            line_total = product.unit_price * quantity
            total_amount += line_total

            order_items_data.append({
                "product_id": product_id,
                "product_name": product.name,
                "sku": product.sku,
                "quantity": quantity,
                "unit_price": product.unit_price,
                "total_price": line_total,
            })

        order = Order(
            order_number=order_number,
            customer_name=customer_name,
            customer_email=customer_email,
            status="pending",
            total_amount=total_amount,
            created_by=user_id,
        )
        self.db.add(order)
        await self.db.flush()

        for oi in order_items_data:
            order_item = OrderItem(
                order_id=order.id,
                product_id=oi["product_id"],
                quantity=oi["quantity"],
                unit_price=oi["unit_price"],
                total_price=oi["total_price"],
            )
            self.db.add(order_item)

        event = OrderEvent(
            order_id=order.id,
            from_status=None,
            to_status="pending",
            created_by=user_id,
        )
        self.db.add(event)
        await self.db.flush()
        await self.db.refresh(order)
        logger.info(
            "order.created",
            order_id=str(order.id),
            order_number=order.order_number,
            total_amount=str(order.total_amount),
            customer_name=order.customer_name,
        )
        return order

    async def cancel_order(self, order_id: UUID, user_id: UUID) -> Order:
        order = await self._get_order_with_items(order_id)

        if order.status not in ("pending", "confirmed"):
            raise ConflictException(
                "STATUS_CONFLICT",
                f"Cannot cancel order in status '{order.status}'",
            )

        for item in order.items:
            inv_result = await self.db.execute(
                select(Inventory)
                .where(
                    Inventory.product_id == item.product_id,
                )
                .with_for_update()
            )
            inventory = inv_result.scalar_one_or_none()
            if inventory:
                inventory.reserved_qty = max(0, inventory.reserved_qty - item.quantity)

        old_status = order.status
        order.status = "cancelled"
        event = OrderEvent(
            order_id=order.id,
            from_status=old_status,
            to_status="cancelled",
            created_by=user_id,
        )
        self.db.add(event)
        await self.db.flush()
        await self.db.refresh(order)
        logger.info(
            "order.cancelled",
            order_id=str(order.id),
            order_number=order.order_number,
            previous_status=old_status,
        )
        return order

    async def process_return(self, order_id: UUID, user_id: UUID) -> Order:
        order = await self._get_order_with_items(order_id)

        if order.status != "delivered":
            raise ConflictException(
                "STATUS_CONFLICT",
                f"Cannot return order in status '{order.status}'",
            )

        for item in order.items:
            inv_result = await self.db.execute(
                select(Inventory)
                .where(Inventory.product_id == item.product_id)
                .with_for_update()
            )
            inventories = list(inv_result.scalars().all())
            if not inventories:
                raise NotFoundException("Inventory", str(item.product_id))

            remaining = item.quantity
            for inv in inventories:
                if remaining <= 0:
                    break
                add_qty = remaining
                inv.quantity += add_qty
                tx = InventoryTransaction(
                    product_id=item.product_id,
                    warehouse_id=inv.warehouse_id,
                    change_qty=add_qty,
                    reason="return",
                    notes=f"Return from order {order.order_number}",
                    created_by=user_id,
                )
                self.db.add(tx)
                remaining -= add_qty

        old_status = order.status
        order.status = "returned"
        event = OrderEvent(
            order_id=order.id,
            from_status=old_status,
            to_status="returned",
            created_by=user_id,
        )
        self.db.add(event)
        await self.db.flush()
        await self.db.refresh(order)
        logger.info(
            "order.returned",
            order_id=str(order.id),
            order_number=order.order_number,
        )
        return order

    async def update_status(
        self,
        order_id: UUID,
        new_status: str,
        notes: str | None,
        user_id: UUID,
    ) -> Order:
        order = await self._get_order_with_items(order_id)

        allowed = VALID_TRANSITIONS.get(order.status, [])
        if new_status not in allowed:
            raise ConflictException(
                "INVALID_TRANSITION",
                f"Cannot transition from '{order.status}' to '{new_status}'",
            )

        old_status = order.status
        order.status = new_status
        event = OrderEvent(
            order_id=order.id,
            from_status=old_status,
            to_status=new_status,
            notes=notes,
            created_by=user_id,
        )
        self.db.add(event)
        await self.db.flush()
        await self.db.refresh(order)
        logger.info(
            "order.status_changed",
            order_id=str(order.id),
            order_number=order.order_number,
            from_status=old_status,
            to_status=new_status,
        )
        return order

    async def get_order(self, order_id: UUID) -> Order:
        return await self._get_order_with_items(order_id)

    async def list_orders(
        self,
        status: str | None = None,
        page: int = 1,
        size: int = 20,
    ) -> tuple[list[Order], int]:
        query = select(Order).options(*ORDER_LOAD_OPTS)

        if status is not None:
            query = query.where(Order.status == status)

        query = query.order_by(Order.created_at.desc())

        count_query = select(func.count()).select_from(query.subquery())
        total_result = await self.db.execute(count_query)
        total: int = total_result.scalar() or 0

        offset = (page - 1) * size
        query = query.offset(offset).limit(size)
        result = await self.db.execute(query)
        items = list(result.scalars().all())

        return items, total

    async def search_orders(
        self,
        query_str: str,
        status: str | None = None,
        page: int = 1,
        size: int = 20,
    ) -> tuple[list[Order], int]:
        pattern = f"%{query_str}%"
        query = (
            select(Order)
            .options(*ORDER_LOAD_OPTS)
            .where(
                or_(
                    Order.order_number.ilike(pattern),
                    Order.customer_name.ilike(pattern),
                    Order.customer_email.ilike(pattern),
                )
            )
        )

        if status is not None:
            query = query.where(Order.status == status)

        query = query.order_by(Order.created_at.desc())

        count_query = select(func.count()).select_from(query.subquery())
        total_result = await self.db.execute(count_query)
        total: int = total_result.scalar() or 0

        offset = (page - 1) * size
        query = query.offset(offset).limit(size)
        result = await self.db.execute(query)
        items = list(result.scalars().all())

        return items, total

    async def get_order_timeline(self, order_id: UUID) -> list[OrderEvent]:
        result = await self.db.execute(
            select(OrderEvent)
            .options(selectinload(OrderEvent.user))
            .where(OrderEvent.order_id == order_id)
            .order_by(OrderEvent.created_at.asc())
        )
        return list(result.scalars().all())

    async def get_dashboard(self) -> dict[str, Any]:
        today = datetime.now(tz=UTC).replace(hour=0, minute=0, second=0, microsecond=0)

        total_orders_result = await self.db.execute(
            select(func.count()).select_from(select(Order).subquery())
        )
        total_orders: int = total_orders_result.scalar() or 0

        revenue_result = await self.db.execute(
            select(func.coalesce(func.sum(Order.total_amount), 0)).where(
                Order.status.in_(["delivered", "returned"])
            )
        )
        revenue_val = revenue_result.scalar() or 0
        total_revenue: float = float(revenue_val)

        result = await self.db.execute(
            select(
                Order.status,
                func.count(Order.id),
            )
            .group_by(Order.status)
        )
        orders_by_status: dict[str, int] = {}
        for status, count in result.all():
            orders_by_status[status] = count

        orders_today_result = await self.db.execute(
            select(func.count()).where(Order.created_at >= today)
        )
        orders_today: int = orders_today_result.scalar() or 0

        pending_result = await self.db.execute(
            select(func.count()).where(
                Order.status.in_(["pending", "confirmed", "processing"])
            )
        )
        pending_orders_count: int = pending_result.scalar() or 0

        from src.models.inventory import Inventory
        from src.models.product import Product

        subq = (
            select(
                Inventory.product_id,
                func.coalesce(func.sum(Inventory.quantity), 0).label("total_qty"),
            )
            .group_by(Inventory.product_id)
            .subquery()
        )
        low_stock_result = await self.db.execute(
            select(func.count())
            .select_from(
                select(Product)
                .join(subq, Product.id == subq.c.product_id)
                .where(Product.is_active, subq.c.total_qty < Product.reorder_point)
                .subquery()
            )
        )
        low_stock_count: int = low_stock_result.scalar() or 0

        avg_time_result = await self.db.execute(
            select(
                func.avg(
                    func.extract("epoch", Order.created_at)
                )
            ).where(
                Order.status == "delivered"
            )
        )
        avg_time = avg_time_result.scalar()

        avg_processing_hours = 0.0
        if avg_time:
            created_events = await self.db.execute(
                select(func.avg(func.extract("epoch", OrderEvent.created_at)))
                .where(
                    OrderEvent.to_status == "delivered",
                    OrderEvent.order_id.in_(
                        select(Order.id).where(Order.status == "delivered")
                    ),
                )
            )
            delivered_time = created_events.scalar()
            if delivered_time:
                avg_processing_hours = round(
                    (delivered_time - avg_time) / 3600, 2
                )

        return {
            "total_orders": total_orders,
            "total_revenue": round(total_revenue, 2),
            "avg_processing_hours": avg_processing_hours,
            "orders_by_status": orders_by_status,
            "orders_today": orders_today,
            "pending_orders_count": pending_orders_count,
            "low_stock_count": low_stock_count,
        }

    async def _get_order_with_items(self, order_id: UUID) -> Order:
        result = await self.db.execute(
            select(Order).options(*ORDER_LOAD_OPTS).where(Order.id == order_id)
        )
        order = result.scalar_one_or_none()
        if order is None:
            raise NotFoundException("Order", str(order_id))
        return order

    async def _get_total_available(self, product_id: UUID) -> int:
        result = await self.db.execute(
            select(func.coalesce(func.sum(Inventory.quantity - Inventory.reserved_qty), 0))
            .where(Inventory.product_id == product_id)
        )
        return result.scalar() or 0
