from __future__ import annotations

from fastapi import APIRouter, Depends, Query

from src.api.deps import require_roles
from src.models.user import User
from src.services.file_service import FileService

router = APIRouter(prefix="/api/files", tags=["Files"])


@router.post("/upload-url")
async def get_upload_url(
    filename: str = Query(...),
    content_type: str = Query(...),
    _current_user: User = Depends(require_roles("admin", "manager")),  # noqa: B008
) -> dict:
    svc = FileService()
    return await svc.generate_presigned_upload_url(filename, content_type)


@router.delete("/{key:path}")
async def delete_file(
    key: str,
    _current_user: User = Depends(require_roles("admin")),  # noqa: B008
) -> dict:
    svc = FileService()
    await svc.delete_file(key)
    return {"status": "deleted", "key": key}
