from __future__ import annotations

from abc import ABC, abstractmethod


class LLMProvider(ABC):
    """Minimal provider-agnostic interface. Providers return raw text only."""

    name: str = "none"
    model: str = ""

    @abstractmethod
    def generate(self, prompt: str) -> str:
        raise NotImplementedError
