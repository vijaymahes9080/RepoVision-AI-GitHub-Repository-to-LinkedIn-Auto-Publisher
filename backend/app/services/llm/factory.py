from __future__ import annotations

import logging

from app.config import settings
from app.services.llm.base import LLMProvider
from app.services.llm.ollama import build_ollama_provider
from app.services.llm.openai_compat import OpenAICompatibleProvider, build_openai_provider

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

    if provider == "gemini":
        key = settings.gemini_api_key or settings.openai_api_key
        if not key:
            logger.warning("LLM_PROVIDER=gemini but GEMINI_API_KEY is not set; using fallback")
            return None
        return OpenAICompatibleProvider(
            base_url="https://generativelanguage.googleapis.com/v1beta/openai",
            api_key=key,
            model=settings.gemini_model,
            timeout_seconds=settings.llm_timeout_seconds,
        )

    if provider in {"grok", "xai"}:
        key = settings.grok_api_key or settings.openai_api_key
        if not key:
            logger.warning("LLM_PROVIDER=grok but GROK_API_KEY is not set; using fallback")
            return None
        return OpenAICompatibleProvider(
            base_url="https://api.x.ai/v1",
            api_key=key,
            model=settings.grok_model,
            timeout_seconds=settings.llm_timeout_seconds,
        )

    if provider == "groq":
        key = settings.groq_api_key or settings.openai_api_key
        if not key:
            logger.warning("LLM_PROVIDER=groq but GROQ_API_KEY is not set; using fallback")
            return None
        return OpenAICompatibleProvider(
            base_url="https://api.groq.com/openai/v1",
            api_key=key,
            model=settings.groq_model,
            timeout_seconds=settings.llm_timeout_seconds,
        )

    if provider == "openrouter":
        key = settings.openrouter_api_key or settings.openai_api_key
        if not key:
            logger.warning("LLM_PROVIDER=openrouter but OPENROUTER_API_KEY is not set; using fallback")
            return None
        return OpenAICompatibleProvider(
            base_url="https://openrouter.ai/api/v1",
            api_key=key,
            model=settings.openrouter_model,
            timeout_seconds=settings.llm_timeout_seconds,
        )

    if provider == "deepseek":
        key = settings.deepseek_api_key or settings.openai_api_key
        if not key:
            logger.warning("LLM_PROVIDER=deepseek but DEEPSEEK_API_KEY is not set; using fallback")
            return None
        return OpenAICompatibleProvider(
            base_url="https://api.deepseek.com/v1",
            api_key=key,
            model=settings.deepseek_model,
            timeout_seconds=settings.llm_timeout_seconds,
        )

    logger.warning("Unknown LLM_PROVIDER=%s; using deterministic fallback", provider)
    return None
