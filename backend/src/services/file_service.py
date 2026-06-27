from __future__ import annotations

import uuid

import boto3
from botocore.config import Config

from src.config import settings


def _sanitize_filename(filename: str) -> str:
    import re
    name = re.sub(r"[^\w.-]", "_", filename)
    return name


class FileService:
    def __init__(self) -> None:
        self.s3_client = boto3.client(
            "s3",
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID or None,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY or None,
            region_name=settings.AWS_REGION,
            config=Config(signature_version="s3v4"),
        )

    async def generate_presigned_upload_url(
        self, filename: str, content_type: str
    ) -> dict:
        ext = filename.rsplit(".", 1)[-1] if "." in filename else ""
        sanitized = _sanitize_filename(filename)
        key = f"products/{uuid.uuid4()}-{sanitized}"
        url = self.s3_client.generate_presigned_url(
            ClientMethod="put_object",
            Params={
                "Bucket": settings.S3_BUCKET_NAME,
                "Key": key,
                "ContentType": content_type,
            },
            ExpiresIn=settings.S3_PRESIGNED_URL_EXPIRY,
        )
        public_url = f"https://{settings.S3_BUCKET_NAME}.s3.{settings.AWS_REGION}.amazonaws.com/{key}"
        return {"upload_url": url, "public_url": public_url, "key": key, "extension": ext}

    async def delete_file(self, key: str) -> None:
        self.s3_client.delete_object(Bucket=settings.S3_BUCKET_NAME, Key=key)
