from __future__ import annotations

import re

_OPENAI = re.compile(r"\bsk-[A-Za-z0-9_-]{16,}\b")
_GITHUB = re.compile(r"\bgh[pousr]_[A-Za-z0-9]{20,}\b")
_AWS = re.compile(r"\bAKIA[0-9A-Z]{16}\b")
_PRIVATE_KEY = re.compile(
    r"-----BEGIN [A-Z ]*PRIVATE KEY-----.*?-----END [A-Z ]*PRIVATE KEY-----",
    re.DOTALL,
)
_BEARER = re.compile(r"(?i)\bBearer\s+[A-Za-z0-9\-._~+/]{12,}=*")
_GENERIC = re.compile(
    r"""(?ix)
    (?P<key>\b(?:api[_-]?key|secret|token|password|passwd|authorization)\b)
    \s*[:=]\s*
    (?P<quote>["']?)
    (?P<value>[A-Za-z0-9_\-./+=]{12,})
    (?P=quote)
    """
)

_PLACEHOLDER_MARKERS = (
    "your",
    "example",
    "placeholder",
    "change_me",
    "changeme",
    "xxx",
    "****",
    "...",
    "process.env",
    "import.meta.env",
    "os.environ",
    "os.getenv",
    "getenv(",
    "redacted",
)


def _is_placeholder(value: str) -> bool:
    lower = value.lower()
    return any(marker in lower for marker in _PLACEHOLDER_MARKERS)


def redact_text(text: str, *, max_length: int | None = None) -> str:
    """Redact obvious secrets before evidence is stored, logged, or sent to an LLM."""

    if not text:
        return ""

    redacted = _PRIVATE_KEY.sub("[REDACTED PRIVATE KEY]", text)
    redacted = _OPENAI.sub("[REDACTED OPENAI KEY]", redacted)
    redacted = _GITHUB.sub("[REDACTED GITHUB TOKEN]", redacted)
    redacted = _AWS.sub("[REDACTED AWS KEY]", redacted)
    redacted = _BEARER.sub("Bearer [REDACTED]", redacted)

    def _replace_generic(match: re.Match[str]) -> str:
        value = match.group("value")
        if _is_placeholder(value):
            return match.group(0)
        key = match.group("key")
        quote = match.group("quote") or ""
        return f"{key}={quote}[REDACTED]{quote}"

    redacted = _GENERIC.sub(_replace_generic, redacted)

    if max_length is not None and len(redacted) > max_length:
        redacted = redacted[: max_length - 1].rstrip() + "…"
    return redacted
