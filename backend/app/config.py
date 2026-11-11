from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Central configuration. Secrets are read from the server environment only."""

    model_config = SettingsConfigDict(
        env_file=(".env", "../.env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    app_name: str = "RepoVision AI API"
    app_version: str = "0.1.0"
    app_env: str = Field(default="development")
    api_prefix: str = "/api/v1"

    database_url: str = "sqlite:///./repovision.db"
    cors_origins: str = "http://localhost:5173,http://127.0.0.1:5173"

    github_token: str | None = None
    github_api_base: str = "https://api.github.com"
    github_timeout_seconds: float = 20.0

    max_tree_entries: int = 5000
    max_analyzed_files: int = 40
    max_file_bytes: int = 100_000
    max_total_bytes: int = 2_000_000
    max_readme_bytes: int = 150_000

    llm_provider: str = "none"  # none | openai | ollama
    openai_api_key: str | None = None
    openai_base_url: str = "https://api.openai.com/v1"
    openai_model: str = "gpt-4o-mini"
    ollama_base_url: str = "http://localhost:11434"
    ollama_model: str = "llama3.1"
    llm_timeout_seconds: float = 60.0

    linkedin_client_id: str | None = None
    linkedin_client_secret: str | None = None
    linkedin_redirect_uri: str | None = None

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]

    @property
    def database_kind(self) -> str:
        return "postgresql" if self.database_url.startswith("postgresql") else "sqlite"

    @property
    def github_token_configured(self) -> bool:
        return bool(self.github_token)

    @property
    def llm_configured(self) -> bool:
        if self.llm_provider == "openai":
            return bool(self.openai_api_key)
        if self.llm_provider == "ollama":
            return bool(self.ollama_base_url and self.ollama_model)
        return False

    @property
    def linkedin_configured(self) -> bool:
        return bool(
            self.linkedin_client_id
            and self.linkedin_client_secret
            and self.linkedin_redirect_uri
        )


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
