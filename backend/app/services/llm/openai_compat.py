from __future__ import annotations

import httpx

from app.config import settings
from app.core.errors import LLMUnavailable
from app.services.llm.base import LLMProvider


class OpenAICompatibleProvider(LLMProvider):
    """Works with the OpenAI API and compatible servers exposing /chat/completions."""

    name = "openai_compatible"
    model = ""

    def __init__(
        self,
        *,
        base_url: str,
        api_key: str,
        model: str,
        timeout_seconds: float,
    ) -> None:
        self._base_url = base_url.rstrip("/")
        self._api_key = api_key
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
            "temperature": 0.2,
        }
        try:
            with httpx.Client(timeout=httpx.Timeout(self._timeout)) as client:
                response = client.post(
                    f"{self._base_url}/chat/completions",
                    headers={
                        "Authorization": f"Bearer {self._api_key}",
                        "Content-Type": "application/json",
                    },
                    json=payload,
                )
        except httpx.TimeoutException as exc:
            raise LLMUnavailable("The LLM provider did not respond before the timeout.") from exc
        except httpx.HTTPError as exc:
            raise LLMUnavailable("Could not reach the configured LLM provider.") from exc

        if response.status_code == 401:
            raise LLMUnavailable("The LLM provider rejected the configured API key.")
        if response.status_code >= 400:
            raise LLMUnavailable(
                f"The LLM provider returned HTTP {response.status_code}.",
                details={"status": response.status_code},
            )

        try:
            data = response.json()
            choices = data.get("choices") or []
            content = choices[0]["message"]["content"]
        except (ValueError, KeyError, IndexError, TypeError) as exc:
            raise LLMUnavailable("The LLM provider returned an unexpected response shape.") from exc

        if not isinstance(content, str) or not content.strip():
            raise LLMUnavailable("The LLM provider returned an empty response.")
        return content


def build_openai_provider() -> OpenAICompatibleProvider | None:
    if not settings.openai_api_key:
        return None
    return OpenAICompatibleProvider(
        base_url=settings.openai_base_url,
        api_key=settings.openai_api_key,
        model=settings.openai_model,
        timeout_seconds=settings.llm_timeout_seconds,
    )
