from __future__ import annotations

import logging

from app.config import settings
from app.services.llm.base import LLMProvider
from app.services.llm.ollama import build_ollama_provider
from app.services.llm.openai_compat import build_openai_provider

logger = logging.getLogger(__name__)


def get_llm_provider() -> LLMProvider | None:
    """Return the configured provider, or None for the deterministic generator."""

    provider = settings.llm_provider.strip().lower()
    if provider in {"", "none", "disabled"}:
        return None
    if provider in {"openai", "openai_compatible", "openai-compatible"}:
        if not settings.openai_api_key:
            logger.warning("LLM_PROVIDER=openai but OPENAI_API_KEY is not set; using fallback")
            return None
        return build_openai_provider()
    if provider == "ollama":
        return build_ollama_provider()

    logger.warning("Unknown LLM_PROVIDER=%s; using deterministic fallback", provider)
    return None
