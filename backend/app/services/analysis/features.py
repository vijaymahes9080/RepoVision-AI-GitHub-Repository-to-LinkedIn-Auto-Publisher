from __future__ import annotations

import re
from dataclasses import dataclass
from pathlib import PurePosixPath

from app.schemas import FeatureOut
from app.services.analysis.evidence import EvidenceCollector

_HEADING_RE = re.compile(r"^(#{2,4})\s+(.+?)\s*#*\s*$")
_BULLET_RE = re.compile(r"^\s*(?:[-*+]|\d+[.)])\s+(.+?)\s*$")

_GENERIC_HEADINGS = {
    "features",
    "feature",
    "what's included",
    "what is included",
    "highlights",
    "key features",
    "overview",
    "about",
    "about the project",
    "description",
    "introduction",
    "demo",
    "screenshots",
    "preview",
    "installation",
    "install",
    "getting started",
    "quick start",
    "quickstart",
    "setup",
    "usage",
    "how to use",
    "configuration",
    "config",
    "environment variables",
    "env",
    "api",
    "api reference",
    "documentation",
    "docs",
    "testing",
    "tests",
    "test",
    "contributing",
    "contributors",
    "license",
    "licence",
    "acknowledgements",
    "acknowledgments",
    "changelog",
    "roadmap",
    "faq",
    "contact",
    "support",
    "table of contents",
    "contents",
    "tech stack",
    "technologies",
    "built with",
    "prerequisites",
    "deployment",
    "project structure",
    "folder structure",
    "architecture",
    "security",
}

_SKIP_BULLETS = {
    "none",
    "n/a",
    "todo",
    "tbd",
}


@dataclass
class ReadmeSection:
    heading: str
    level: int
    lines: list[str]


def _clean_markdown(text: str) -> str:
    cleaned = re.sub(r"!\[([^\]]*)\]\([^)]*\)", r"\1", text)
    cleaned = re.sub(r"\[([^\]]+)\]\([^)]*\)", r"\1", cleaned)
    cleaned = re.sub(r"`{1,3}([^`]+)`{1,3}", r"\1", cleaned)
    cleaned = re.sub(r"<[^>]+>", "", cleaned)
    cleaned = re.sub(r"[*_~]", "", cleaned)
    return re.sub(r"\s+", " ", cleaned).strip()


def split_readme_sections(readme: str) -> list[ReadmeSection]:
    sections: list[ReadmeSection] = []
    current = ReadmeSection(heading="", level=0, lines=[])
    in_fence = False

    for line in readme.splitlines():
        if line.strip().startswith(("```", "~~~")):
            in_fence = not in_fence
            if not in_fence:
                current.lines.append(line)
            continue
        if in_fence:
            continue
        match = _HEADING_RE.match(line)
        if match:
            if current.heading or current.lines:
                sections.append(current)
            current = ReadmeSection(
                heading=_clean_markdown(match.group(2)),
                level=len(match.group(1)),
                lines=[],
            )
        else:
            current.lines.append(line)

    if current.heading or current.lines:
        sections.append(current)
    return sections


def _is_useful_feature(text: str) -> bool:
    candidate = text.strip(" .-")
    if len(candidate) < 8 or len(candidate) > 220:
        return False
    if candidate.lower() in _SKIP_BULLETS:
        return False
    if candidate.lower().startswith(("http://", "https://")):
        return False
    if candidate.count(" ") < 1:
        return False
    return True


def _title_from_text(text: str) -> str:
    first_sentence = re.split(r"(?<=[.!?])\s+", text, maxsplit=1)[0]
    first_sentence = first_sentence.strip(" .-")
    if len(first_sentence) <= 90:
        return first_sentence
    shortened = first_sentence[:87].rsplit(" ", 1)[0]
    return f"{shortened}…"


def extract_features(
    *,
    readme: str,
    readme_path: str,
    collector: EvidenceCollector,
    limit: int = 8,
) -> list[FeatureOut]:
    """Extract explicitly documented features from README headings and bullets.

    Nothing is invented: every feature comes from a README line that is stored as
    evidence. If the README has no recognisable feature section, an empty list is
    returned instead of guessing from repository names.
    """

    if not readme.strip():
        return []

    sections = split_readme_sections(readme)
    candidates: list[tuple[str, str, str]] = []

    feature_headings = {
        "features",
        "feature",
        "key features",
        "highlights",
        "what's included",
        "what is included",
        "core features",
        "main features",
    }

    for section in sections:
        heading_lower = section.heading.lower()
        bullets = []
        for line in section.lines:
            match = _BULLET_RE.match(line)
            if match:
                bullets.append(_clean_markdown(match.group(1)))

        if heading_lower in feature_headings:
            for bullet in bullets:
                if _is_useful_feature(bullet):
                    candidates.append((_title_from_text(bullet), bullet, section.heading))
            continue

        # Non-English or unconventional READMEs often use headings like
        # "## Feature: ..." or "## What it does".
        if (heading_lower.startswith(("feature", "what it does", "capabilities"))) and bullets:
            for bullet in bullets:
                if _is_useful_feature(bullet):
                    candidates.append((_title_from_text(bullet), bullet, section.heading))

    if not candidates:
        # Fall back to descriptive bullets under a general overview heading only when
        # they read like capability statements, never marketing claims.
        for section in sections:
            if section.heading.lower() not in {
                "overview",
                "about",
                "about the project",
                "introduction",
                "description",
            }:
                continue
            for line in section.lines:
                match = _BULLET_RE.match(line)
                if not match:
                    continue
                bullet = _clean_markdown(match.group(1))
                if _is_useful_feature(bullet):
                    candidates.append((_title_from_text(bullet), bullet, section.heading))

    features: list[FeatureOut] = []
    seen: set[str] = set()
    for title, detail, heading in candidates:
        key = title.lower()
        if key in seen:
            continue
        seen.add(key)
        evidence_id = collector.add(
            path=readme_path,
            excerpt=detail,
            category="readme_feature",
            confidence=80,
            symbol=heading or None,
            content=readme,
        )
        features.append(
            FeatureOut(
                title=title,
                description=detail if detail != title else "",
                evidence_ids=[evidence_id],
            )
        )
        if len(features) >= limit:
            break

    return features


def extract_problem_and_solution(
    *,
    readme: str,
    readme_path: str,
    collector: EvidenceCollector,
) -> tuple[str, str, str]:
    """Return (description, problem, solution) grounded in README text.

    Problem and solution are only returned when the README explicitly labels them;
    otherwise they remain empty rather than being invented.
    """

    sections = split_readme_sections(readme)
    description = ""
    problem = ""
    solution = ""

    for section in sections:
        name = section.heading.lower()
        body = " ".join(_clean_markdown(line) for line in section.lines if line.strip()).strip()
        body = re.sub(r"\s+", " ", body)
        if not body:
            continue

        if name in {"the problem", "problem", "problem statement", "motivation", "why"}:
            if not problem:
                problem = body[:400]
                collector.add(
                    path=readme_path,
                    excerpt=problem,
                    category="readme_problem",
                    confidence=75,
                    symbol=section.heading,
                    content=readme,
                )
        elif name in {"the solution", "solution", "our solution", "how it works"}:
            if not solution:
                solution = body[:400]
                collector.add(
                    path=readme_path,
                    excerpt=solution,
                    category="readme_solution",
                    confidence=75,
                    symbol=section.heading,
                    content=readme,
                )
        elif name in {"", "overview", "about", "about the project", "description", "introduction"}:
            if not description:
                first_paragraph = _first_paragraph(section.lines)
                if first_paragraph:
                    description = first_paragraph[:400]
                    collector.add(
                        path=readme_path,
                        excerpt=description,
                        category="readme_description",
                        confidence=70,
                        symbol=section.heading or "README",
                        content=readme,
                    )

    if not description and readme:
        first_paragraph = _first_paragraph(readme.splitlines())
        if first_paragraph:
            description = first_paragraph[:400]
            collector.add(
                path=readme_path,
                excerpt=description,
                category="readme_description",
                confidence=60,
                symbol="README",
                content=readme,
            )

    return description, problem, solution


def _first_paragraph(lines: list[str]) -> str:
    collected: list[str] = []
    for line in lines:
        stripped = line.strip()
        if not stripped:
            if collected:
                break
            continue
        if stripped.startswith(("#", "```", "~~~", "<", "[!", "!", "|")):
            if collected:
                break
            continue
        match = _BULLET_RE.match(stripped)
        if match:
            if collected:
                break
            stripped = match.group(1)
        collected.append(_clean_markdown(stripped))
        if len(" ".join(collected)) > 320:
            break
    text = re.sub(r"\s+", " ", " ".join(collected)).strip()
    return text if len(text) >= 20 else ""


_ROUTE_PATTERNS: list[tuple[str, re.Pattern[str], str]] = [
    (
        "python",
        re.compile(
            r"@(?:app|router|bp|blueprint)\.(get|post|put|patch|delete)\(\s*[\"']([^\"']+)[\"']",
            re.I,
        ),
        "py",
    ),
    (
        "python",
        re.compile(
            r"@(?:app|router|bp|blueprint)\.route\(\s*[\"']([^\"']+)[\"'](?:[^)]*methods\s*=\s*\[([^\]]*)\])?",
            re.I,
        ),
        "py",
    ),
    (
        "node",
        re.compile(
            r"\b(?:app|router|server)\.(get|post|put|patch|delete)\(\s*[\"'`]([^\"'`]+)[\"'`]", re.I
        ),
        "js",
    ),
    (
        "node",
        re.compile(r"\b(?:app|router|server)\.(GET|POST|PUT|PATCH|DELETE)\(\s*[\"']([^\"']+)[\"']"),
        "js",
    ),
    (
        "java",
        re.compile(r"@(Get|Post|Put|Patch|Delete)Mapping\(\s*(?:value\s*=\s*)?[\"']([^\"']+)[\"']"),
        "java",
    ),
    ("go", re.compile(r"\.(GET|POST|PUT|PATCH|DELETE)\(\s*[\"']([^\"']+)[\"']"), "go"),
]

_ENDPOINT_LANGUAGES = {
    ".py": "python",
    ".js": "js",
    ".jsx": "js",
    ".ts": "js",
    ".tsx": "js",
    ".java": "java",
    ".kt": "java",
    ".go": "go",
}


def extract_api_endpoints(
    *,
    files: dict[str, str],
    collector: EvidenceCollector,
    limit: int = 80,
) -> list[str]:
    endpoints: list[str] = []
    seen: set[str] = set()

    for path, content in files.items():
        language = _ENDPOINT_LANGUAGES.get(PurePosixPath(path).suffix.lower())
        if not language:
            continue
        for _name, pattern, pattern_language in _ROUTE_PATTERNS:
            if pattern_language != language:
                continue
            for match in pattern.finditer(content):
                groups = match.groups()
                if language == "python" and pattern.pattern.startswith(
                    "@(?:app|router|bp|blueprint)\\.route"
                ):
                    route = groups[0]
                    methods = groups[1] if len(groups) > 1 else None
                    method = "GET"
                    if methods:
                        method_match = re.search(r"[\"']([A-Za-z]+)[\"']", methods)
                        if method_match:
                            method = method_match.group(1).upper()
                    endpoint = f"{method} {route}"
                else:
                    method, route = groups[0], groups[1]
                    endpoint = f"{method.upper()} {route}"

                if not endpoint.startswith(("GET ", "POST ", "PUT ", "PATCH ", "DELETE ")):
                    continue
                if len(endpoint) > 180 or "<" in endpoint and "{" not in endpoint:
                    continue
                if endpoint in seen:
                    continue
                seen.add(endpoint)
                endpoints.append(endpoint)
                collector.add(
                    path=path,
                    excerpt=match.group(0).strip(),
                    category="api_endpoint",
                    confidence=85,
                    symbol=endpoint,
                    content=content,
                )
                if len(endpoints) >= limit:
                    return endpoints

    return endpoints
