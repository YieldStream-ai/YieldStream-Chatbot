from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",        # Load from .env file in the working directory
        env_file_encoding="utf-8",
        case_sensitive=False,   # DATABASE_URL and database_url both work
    )

    # --- Database ---
    # SQLite for dev, Postgres for prod. The URL format tells SQLAlchemy which driver to use.
    database_url: str = "sqlite+aiosqlite:///./dev.db"

    # --- Security ---
    # Used to sign JWT tokens. If this changes, all existing tokens become invalid.
    secret_key: str = "change-me-to-a-random-string"

    # --- Gemini ---
    gemini_api_key: str = ""

    # --- Admin ---
    admin_email: str = "admin@example.com"
    admin_password: str = "change-me"

    # --- CORS ---
    # The dashboard's origin, so it can make API calls to the backend.
    dashboard_origin: str = "http://localhost:5173"

    # --- Rate Limiting ---
    # "memory" for single-instance dev, "redis" for distributed prod
    rate_limit_backend: str = "memory"
    redis_url: str | None = None

    # --- Environment ---
    environment: str = "development"


# Singleton — import this from anywhere to access config
settings = Settings()
