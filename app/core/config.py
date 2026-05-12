from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )

    # App
    app_name: str = "School ERP"
    app_version: str = "0.1.0"
    debug: bool = False

    # Database
    database_url: str
    db_echo: bool = False
    db_pool_size: int = 10
    db_max_overflow: int = 20

    # Security
    secret_key: str
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60

    # CORS
    allowed_origins: list[str] = ["http://localhost:3000"]


settings = Settings()