# ruff: noqa: E501, ANN001, ANN201
"""add admin_audit_log table

Revision ID: 0005
Revises: 0004
Create Date: 2026-06-18
"""

from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID, JSONB

revision: str = "0005"
down_revision: str | None = "0004"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "admin_audit_log",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "admin_id", UUID(as_uuid=True),
            sa.ForeignKey("users.id"), nullable=False,
        ),
        sa.Column("action", sa.String(50), nullable=False),
        sa.Column("resource_type", sa.String(50), nullable=False),
        sa.Column("resource_id", sa.String(100), nullable=False),
        sa.Column("before_state", JSONB, nullable=True),
        sa.Column("after_state", JSONB, nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index(
        "ix_admin_audit_log_admin_id", "admin_audit_log", ["admin_id"],
    )
    op.create_index(
        "ix_admin_audit_log_resource", "admin_audit_log",
        ["resource_type", "resource_id"],
    )


def downgrade() -> None:
    op.drop_index("ix_admin_audit_log_resource")
    op.drop_index("ix_admin_audit_log_admin_id")
    op.drop_table("admin_audit_log")
