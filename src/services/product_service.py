from __future__ import annotations

from typing import TYPE_CHECKING
from uuid import UUID

from sqlalchemy import func, select

from src.exceptions import ConflictException, NotFoundException
from src.models.product import Product
from src.schemas.product import ProductCreate, ProductUpdate

if TYPE_CHECKING:
    from sqlalchemy.ext.asyncio import AsyncSession


class ProductService:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def list_products(
        self,
        page: int = 1,
        size: int = 20,
        category: str | None = None,
        search: str | None = None,
        sort: str = "-created_at",
    ) -> tuple[list[Product], int]:
        query = select(Product).where(Product.is_active)

        if category:
            query = query.where(Product.category == category)

        if search:
            pattern = f"%{search}%"
            query = query.where(
                Product.name.ilike(pattern)
                | Product.description.ilike(pattern)
                | Product.sku.ilike(pattern)
            )

        sort_field = sort.lstrip("+-")
        sort_col = getattr(Product, sort_field, Product.created_at)
        if sort.startswith("-"):
            sort_col = sort_col.desc()
        query = query.order_by(sort_col)

        count_query = select(func.count()).select_from(query.subquery())
        total_result = await self.db.execute(count_query)
        total: int = total_result.scalar() or 0

        offset = (page - 1) * size
        query = query.offset(offset).limit(size)
        result = await self.db.execute(query)
        items = list(result.scalars().all())

        return items, total

    async def get_product(self, product_id: UUID) -> Product:
        result = await self.db.execute(
            select(Product).where(Product.id == product_id, Product.is_active)
        )
        product = result.scalar_one_or_none()
        if product is None:
            raise NotFoundException("Product", str(product_id))
        return product

    async def create_product(self, data: ProductCreate) -> Product:
        result = await self.db.execute(
            select(Product).where(Product.sku == data.sku)
        )
        if result.scalar_one_or_none() is not None:
            raise ConflictException("SKU_EXISTS", f"SKU '{data.sku}' already exists")

        product = Product(
            sku=data.sku,
            name=data.name,
            description=data.description,
            category=data.category,
            unit_price=data.unit_price,
            unit_cost=data.unit_cost,
            reorder_point=data.reorder_point,
        )
        self.db.add(product)
        await self.db.flush()
        await self.db.refresh(product)
        return product

    async def update_product(self, product_id: UUID, data: ProductUpdate) -> Product:
        product = await self.get_product(product_id)
        update_data = data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(product, field, value)
        await self.db.flush()
        await self.db.refresh(product)
        return product

    async def soft_delete_product(self, product_id: UUID) -> None:
        product = await self.get_product(product_id)
        product.is_active = False
        await self.db.flush()
