from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    database_url: str = "postgresql+asyncpg://endurance:endurance@localhost:5432/enduranceai"
    redis_url: str = "redis://localhost:6379/0"
    api_secret_key: str = "change-me-in-production"
    cors_origins: str = "http://localhost:3000"
    llm_api_key: str | None = None
    llm_model: str = "claude-sonnet-5"  # any Anthropic-compatible model id

    strava_client_id: str | None = None
    strava_client_secret: str | None = None

    @property
    def cors_origins_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
