from __future__ import annotations

import httpx

from app.config import settings
from app.core.errors import LLMUnavailable
from app.services.llm.base import LLMProvider


class OllamaProvider(LLMProvider):
    name = "ollama"
    model = ""

    def __init__(self, *, base_url: str, model: str, timeout_seconds: float) -> None:
        self._base_url = base_url.rstrip("/")
        self.model = model
        self._timeout = timeout_seconds

    def generate(self, prompt: str) -> str:
        payload = {
            "model": self.model,
            "messages": [
                {
                    "role": "system",
                    "content": (
                        "You write grounded LinkedIn drafts. You never invent facts and you "
                        "never use first-person voice."
                    ),
                },
                {"role": "user", "content": prompt},
            ],
            "stream": False,
            "options": {"temperature": 0.2},
        }
        try:
            with httpx.Client(timeout=httpx.Timeout(self._timeout)) as client:
                response = client.post(f"{self._base_url}/api/chat", json=payload)
        except httpx.TimeoutException as exc:
            raise LLMUnavailable("Ollama did not respond before the timeout.") from exc
        except httpx.HTTPError as exc:
            raise LLMUnavailable("Could not reach the configured Ollama server.") from exc

        if response.status_code >= 400:
            raise LLMUnavailable(f"Ollama returned HTTP {response.status_code}.")

        try:
            data = response.json()
            content = (data.get("message") or {}).get("content")
        except (ValueError, TypeError, AttributeError) as exc:
            raise LLMUnavailable("Ollama returned an unexpected response shape.") from exc

        if not isinstance(content, str) or not content.strip():
            raise LLMUnavailable("Ollama returned an empty response.")
        return content


def build_ollama_provider() -> OllamaProvider | None:
    if not settings.ollama_base_url or not settings.ollama_model:
        return None
    return OllamaProvider(
        base_url=settings.ollama_base_url,
        model=settings.ollama_model,
        timeout_seconds=settings.llm_timeout_seconds,
    )
