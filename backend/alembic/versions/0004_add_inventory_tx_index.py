# ruff: noqa: E501, ANN001, ANN201
"""add index on inventory_transactions(created_at, reason)

Revision ID: 0004
Revises: 0003
Create Date: 2026-06-11
"""

from collections.abc import Sequence

from alembic import op

revision: str = "0004"
down_revision: str | None = "0003"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_index(
        "ix_inventory_transactions_created_at_reason",
        "inventory_transactions",
        ["created_at", "reason"],
    )


def downgrade() -> None:
    op.drop_index("ix_inventory_transactions_created_at_reason")
