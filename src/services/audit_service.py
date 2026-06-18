from __future__ import annotations

from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

from src.models.admin_audit_log import AdminAuditLog


async def log_admin_action(
    db: AsyncSession,
    admin_id: UUID,
    action: str,
    resource_type: str,
    resource_id: str,
    before_state: dict | None = None,
    after_state: dict | None = None,
) -> AdminAuditLog:
    entry = AdminAuditLog(
        admin_id=admin_id,
        action=action,
        resource_type=resource_type,
        resource_id=resource_id,
        before_state=before_state,
        after_state=after_state,
    )
    db.add(entry)
    await db.flush()
    return entry
