from __future__ import annotations

import hashlib
from typing import Iterable

from app.schemas import EvidenceOut
from app.services.analysis.redaction import redact_text

_MAX_EXCERPT = 500


def find_line(content: str, needle: str) -> int | None:
    if not needle:
        return None
    for index, line in enumerate(content.splitlines(), start=1):
        if needle in line:
            return index
    return None


class EvidenceCollector:
    def __init__(self, commit_sha: str) -> None:
        self.commit_sha = commit_sha
        self._items: list[EvidenceOut] = []
        self._dedupe: dict[str, str] = {}

    def add(
        self,
        *,
        path: str,
        excerpt: str,
        category: str,
        confidence: int = 80,
        symbol: str | None = None,
        content: str | None = None,
        line_start: int | None = None,
        line_end: int | None = None,
    ) -> str:
        safe_excerpt = redact_text(excerpt.strip(), max_length=_MAX_EXCERPT)
        if not safe_excerpt:
            safe_excerpt = "(empty excerpt)"
        key = hashlib.sha256(
            f"{path}|{category}|{symbol or ''}|{safe_excerpt}".encode("utf-8")
        ).hexdigest()
        existing = self._dedupe.get(key)
        if existing:
            return existing

        if line_start is None and content is not None:
            line_start = find_line(content, excerpt.strip().splitlines()[0] if excerpt.strip() else "")
        if line_end is None:
            line_end = line_start

        item = EvidenceOut(
            id=f"ev_{len(self._items) + 1}",
            path=path,
            symbol=symbol,
            excerpt=safe_excerpt,
            line_start=line_start,
            line_end=line_end,
            category=category,
            confidence=max(0, min(100, confidence)),
            commit_sha=self.commit_sha,
        )
        self._items.append(item)
        self._dedupe[key] = item.id
        return item.id

    def add_many(
        self,
        *,
        path: str,
        excerpts: Iterable[str],
        category: str,
        confidence: int = 80,
        content: str | None = None,
    ) -> list[str]:
        return [
            self.add(
                path=path,
                excerpt=excerpt,
                category=category,
                confidence=confidence,
                content=content,
            )
            for excerpt in excerpts
            if excerpt.strip()
        ]

    @property
    def items(self) -> list[EvidenceOut]:
        return list(self._items)
