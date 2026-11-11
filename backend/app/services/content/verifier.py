from __future__ import annotations

import re

from app.schemas import AnalysisResult, ClaimOut, VerificationOut
from app.services.analysis.stack import KNOWN_TECHNOLOGY_NAMES

_SUPERLATIVES = (
    "revolutionary",
    "revolutionize",
    "revolutionizes",
    "groundbreaking",
    "game-changing",
    "game changing",
    "world-class",
    "best-in-class",
    "cutting-edge",
    "cutting edge",
    "unparalleled",
    "unmatched",
    "industry-leading",
    "industry leading",
    "seamless",
    "seamlessly",
    "effortless",
    "effortlessly",
    "next-generation",
    "state-of-the-art",
    "unrivalled",
    "unrivaled",
)

_SECURITY_CLAIMS = (
    "fully secure",
    "100% secure",
    "zero vulnerabilities",
    "no vulnerabilities",
    "no security issues",
    "bug-free",
    "bug free",
    "production-ready",
    "enterprise-grade",
    "military-grade",
    "security grade",
    "security score",
)

_ATTRIBUTION_CLAIMS = (
    "built by",
    "created by",
    "developed by",
    "authored by",
    "maintained by",
    "the author",
    "the maintainer",
)

_AMBIGUOUS_TECH = {
    "Echo",
    "Express",
    "Fiber",
    "Gin",
    "Koa",
    "React",
    "Rocket",
    "Svelte",
    "Angular",
    "Vue",
    "Pandas",
    "NumPy",
    "Ruff",
    "Serde",
    "Tokio",
    "Jest",
}

_FIRST_PERSON_RE = re.compile(
    r"\b(?:I|I'm|I've|I'd|I'll|my|mine|we|we're|we've|we'd|we'll|our|ours|us)\b",
    re.IGNORECASE,
)
_URL_RE = re.compile(r"https?://[^\s<>()\[\]\"']+")
_NUMBER_RE = re.compile(r"\b\d[\d,]*(?:\.\d+)?%?\b")
_SENTENCE_SPLIT_RE = re.compile(r"(?<=[.!?])\s+")
_HEX_RE = re.compile(r"\b[0-9a-f]{7,40}\b", re.IGNORECASE)


def _sentences(text: str) -> list[str]:
    parts = _SENTENCE_SPLIT_RE.split(text)
    return [part.strip() for part in parts if part.strip()]


def _sentence_for(text: str, start: int, end: int) -> str:
    boundaries = [0]
    boundaries.extend(match.end() for match in _SENTENCE_SPLIT_RE.finditer(text))
    boundaries.append(len(text))
    lower = 0
    for boundary in boundaries:
        if boundary <= start:
            lower = boundary
    upper = len(text)
    for boundary in boundaries:
        if boundary >= end:
            upper = boundary
            break
    sentence = text[lower:upper].strip()
    return sentence[:300] if sentence else text[start:end][:300]


def _strip_non_claims(text: str, result: AnalysisResult) -> str:
    cleaned = _URL_RE.sub(" ", text)
    cleaned = cleaned.replace(result.repo.url, " ")
    cleaned = cleaned.replace(f"{result.repo.owner}/{result.repo.name}", " ")
    cleaned = cleaned.replace(result.repo.name, " ")
    cleaned = _HEX_RE.sub(" ", cleaned)
    cleaned = re.sub(r"(?<!\w)#[A-Za-z0-9_]+", " ", cleaned)
    # Ignore ordered-list markers, which are formatting rather than claims.
    cleaned = re.sub(r"(?m)^\s*\d+[.)]\s+", "", cleaned)
    return cleaned


def _evidence_corpus(result: AnalysisResult) -> str:
    parts = [item.excerpt for item in result.evidence]
    parts.append(result.repo.description or "")
    parts.append(result.summary.description)
    parts.append(result.summary.license or "")
    parts.append(", ".join(result.testing.frameworks))
    parts.append(", ".join(result.testing.ci_systems))
    return "\n".join(part for part in parts if part)


def verify_text(text: str, result: AnalysisResult) -> VerificationOut:
    """Verify text against the stored analysis evidence.

    M1 intentionally takes a conservative stance: first-person ownership,
    unsupported numbers, external URLs, superlatives, unverifiable attribution,
    security guarantees, and technology names without evidence are rejected.
    """

    issues: list[ClaimOut] = []
    seen: set[tuple[str, str]] = set()

    def add_issue(claim: str, reason: str) -> None:
        key = (claim, reason)
        if key in seen:
            return
        seen.add(key)
        issues.append(
            ClaimOut(
                claim=claim,
                status="rejected",
                evidence_ids=[],
                reason=reason,
            )
        )

    if not text.strip():
        return VerificationOut(
            ok=False,
            claims=[
                ClaimOut(
                    claim="(empty text)",
                    status="rejected",
                    reason="Text is empty.",
                )
            ],
        )

    for match in _FIRST_PERSON_RE.finditer(text):
        token = match.group(0)
        if token == "US":
            continue
        add_issue(
            _sentence_for(text, match.start(), match.end()),
            "First-person voice is blocked in M1. Describe the repository in neutral third person.",
        )

    allowed_urls = {result.repo.url.rstrip("/"), result.repo.url.rstrip("/") + "/"}
    for match in _URL_RE.finditer(text):
        raw_url = match.group(0).rstrip(".,;:!?")
        if raw_url.rstrip("/") not in {url.rstrip("/") for url in allowed_urls}:
            add_issue(
                _sentence_for(text, match.start(), match.end()),
                f"URL '{raw_url}' is not the analyzed repository URL. External URLs are "
                "not verified in M1.",
            )

    lowered = text.lower()
    for phrase in _SUPERLATIVES:
        if phrase not in lowered:
            continue
        index = lowered.find(phrase)
        add_issue(
            _sentence_for(text, index, index + len(phrase)),
            f"Superlative or marketing phrase '{phrase}' cannot be supported by repository "
            "evidence.",
        )

    for phrase in _SECURITY_CLAIMS:
        if phrase not in lowered:
            continue
        index = lowered.find(phrase)
        add_issue(
            _sentence_for(text, index, index + len(phrase)),
            f"Security claim '{phrase}' is not supported. M1 does not compute grades or run "
            "vulnerability scans.",
        )

    for phrase in _ATTRIBUTION_CLAIMS:
        if phrase not in lowered:
            continue
        index = lowered.find(phrase)
        add_issue(
            _sentence_for(text, index, index + len(phrase)),
            f"Attribution '{phrase}' is not verified by the available evidence.",
        )

    evidence_numbers: set[str] = set()
    corpus = _evidence_corpus(result)
    for match in _NUMBER_RE.finditer(corpus):
        evidence_numbers.add(match.group(0).replace(",", ""))
        evidence_numbers.add(match.group(0))

    scanned_text = _strip_non_claims(text, result)
    for match in _NUMBER_RE.finditer(scanned_text):
        value = match.group(0)
        if value in evidence_numbers or value.replace(",", "") in evidence_numbers:
            continue
        add_issue(
            _sentence_for(scanned_text, match.start(), match.end()),
            f"Number '{value}' does not appear in the stored evidence. Numeric claims must "
            "be traceable to a snapshot excerpt.",
        )

    detected_names = {
        technology.name.lower() for technology in result.technologies if technology.evidence_ids
    }
    tech_scan_text = _strip_non_claims(text, result)
    for name in KNOWN_TECHNOLOGY_NAMES:
        if name in _AMBIGUOUS_TECH:
            continue
        if name.lower() in detected_names:
            continue
        pattern = re.compile(rf"(?<![A-Za-z0-9]){re.escape(name)}(?![A-Za-z0-9])", re.IGNORECASE)
        match = pattern.search(tech_scan_text)
        if not match:
            continue
        add_issue(
            _sentence_for(tech_scan_text, match.start(), match.end()),
            f"Technology '{name}' is not supported by evidence in this snapshot.",
        )

    # Unconfirmed references to vulnerability counts or security ratings are a
    # recurring source of fabricated content, so block them explicitly.
    for pattern, reason in (
        (
            re.compile(r"\b\d+\s+(?:CVEs?|vulnerabilit(?:y|ies))\b", re.IGNORECASE),
            "CVE and vulnerability counts are not collected in M1.",
        ),
        (
            re.compile(r"\b(?:security|risk)\s+(?:grade|score)\b", re.IGNORECASE),
            "Security grades and scores are not computed in M1.",
        ),
    ):
        for match in pattern.finditer(text):
            add_issue(
                _sentence_for(text, match.start(), match.end()),
                reason,
            )

    return VerificationOut(ok=not issues, claims=issues, warnings=[])
