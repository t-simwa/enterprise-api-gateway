# ruff: noqa: E501, ANN001, ANN201
"""add partial_fill to orders, discount_percent to order_items

Revision ID: 0002
Revises: 0001
Create Date: 2026-06-11
"""

from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op

revision: str = "0002"
down_revision: str | None = "0001"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.add_column(
        "orders",
        sa.Column("partial_fill", sa.Boolean(), server_default="false"),
    )
    op.add_column(
        "order_items",
        sa.Column("discount_percent", sa.Numeric(5, 2), server_default="0"),
    )


def downgrade() -> None:
    op.drop_column("order_items", "discount_percent")
    op.drop_column("orders", "partial_fill")
