from pydantic_settings import BaseSettings
from pydantic import field_validator


class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql://postgres:postgres@localhost:5432/inventory_db"
    REDIS_URL: str = "redis://localhost:6379/0"
    SECRET_KEY: str = "change-me"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    CORS_ORIGINS: list[str] = ["http://localhost:5173", "https://enterprise-api-gateway-gilt.vercel.app"]
    ALLOWED_HOSTS: list[str] = ["*"]
    SECURITY_BCRYPT_ROUNDS: int = 12
    JWT_ALGORITHM: str = "HS256"
    ENVIRONMENT: str = "development"
    LOG_LEVEL: str = "INFO"
    SENTRY_DSN: str = ""
    AWS_ACCESS_KEY_ID: str = ""
    AWS_SECRET_ACCESS_KEY: str = ""
    AWS_REGION: str = "us-east-1"
    S3_BUCKET_NAME: str = "enterprise-api-gateway-images"
    S3_PRESIGNED_URL_EXPIRY: int = 3600

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def parse_cors_origins(cls, v):
        if isinstance(v, str):
            return [o.strip() for o in v.split(",") if o.strip()]
        return v


settings = Settings()
