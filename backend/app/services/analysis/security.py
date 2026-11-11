from __future__ import annotations

import re
from dataclasses import dataclass
from pathlib import PurePosixPath

from app.schemas import DependencyScan, SecurityFinding, SecurityOut
from app.services.analysis.evidence import EvidenceCollector
from app.services.analysis.redaction import redact_text

_SECRET_PATTERNS: list[tuple[str, re.Pattern[str]]] = [
    ("private key", re.compile(r"-----BEGIN [A-Z ]*PRIVATE KEY-----")),
    ("OpenAI-style API key", re.compile(r"\bsk-[A-Za-z0-9_-]{16,}\b")),
    ("GitHub token", re.compile(r"\bgh[pousr]_[A-Za-z0-9]{20,}\b")),
    ("AWS access key", re.compile(r"\bAKIA[0-9A-Z]{16}\b")),
    (
        "credential assignment",
        re.compile(
            r"""(?ix)
            \b(?:api[_-]?key|secret|token|password|passwd|authorization)\b
            \s*[:=]\s*
            ["'][A-Za-z0-9_\-./+=]{16,}["']
            """
        ),
    ),
]

_PLACEHOLDER_HINTS = (
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

_DANGEROUS_PATTERNS: list[tuple[str, re.Pattern[str], str, str, str]] = [
    (
        "shell-injection",
        re.compile(r"\bsubprocess\.[a-zA-Z_]+\([^)]*shell\s*=\s*True", re.DOTALL),
        "Shell execution enabled",
        "A subprocess call enables a shell. If any arguments come from user input, this can "
        "allow command injection.",
        "Avoid shell=True and pass an argument list instead.",
    ),
    (
        "dynamic-execution",
        re.compile(r"(?<![\w.])(?:eval|exec)\s*\("),
        "Dynamic code execution",
        "Dynamic evaluation can execute attacker-controlled strings when input is not strictly "
        "validated.",
        "Replace dynamic evaluation with explicit parsing or an allowlisted operation.",
    ),
    (
        "node-child-process",
        re.compile(r"\bchild_process\.(?:exec|execSync)\s*\("),
        "Node child process execution",
        "child_process.exec runs through a shell and can be unsafe with untrusted input.",
        "Prefer execFile/spawn with a fixed argument list and validate input.",
    ),
    (
        "dangerous-html",
        re.compile(r"dangerouslySetInnerHTML"),
        "Raw HTML injection point",
        "React raw HTML rendering bypasses escaping. Content must be sanitised or trusted.",
        "Sanitise HTML with a maintained library, or render text instead.",
    ),
    (
        "tls-verification-disabled",
        re.compile(r"\bverify\s*=\s*False\b"),
        "TLS verification disabled",
        "Disabling certificate verification exposes the client to man-in-the-middle attacks.",
        "Enable certificate verification and configure a trusted CA if required.",
    ),
    (
        "debug-enabled",
        re.compile(r"\b(?:DEBUG|debug)\s*[=:]\s*True\b"),
        "Debug mode enabled in source",
        "Debug mode can expose stack traces and interactive debuggers in production.",
        "Drive debug mode from an environment flag that defaults to off.",
    ),
    (
        "wildcard-cors",
        re.compile(
            r"(?:allow_origins\s*=\s*\[\s*[\"']\*[\"']|origin\s*:\s*[\"']\*[\"']|"
            r"Access-Control-Allow-Origin[\"']?\s*[:=]\s*[\"']?\*)"
        ),
        "Permissive CORS policy",
        "A wildcard CORS origin allows any website to read responses that do not require "
        "credentials.",
        "Restrict allowed origins to the deployment domains.",
    ),
]

_SCANNED_SUFFIXES = {
    ".py",
    ".js",
    ".jsx",
    ".ts",
    ".tsx",
    ".go",
    ".rs",
    ".java",
    ".kt",
    ".rb",
    ".php",
    ".cs",
    ".env",
    ".yaml",
    ".yml",
    ".toml",
    ".json",
    ".sh",
}

_LICENSE_SIGNATURES: list[tuple[str, re.Pattern[str]]] = [
    ("MIT", re.compile(r"\bMIT License\b", re.I)),
    ("Apache-2.0", re.compile(r"\bApache License,?\s+Version 2\.0\b", re.I)),
    ("GPL-3.0", re.compile(r"\bGNU GENERAL PUBLIC LICENSE\b[\s\S]{0,200}Version 3", re.I)),
    ("GPL-2.0", re.compile(r"\bGNU GENERAL PUBLIC LICENSE\b[\s\S]{0,200}Version 2", re.I)),
    ("LGPL-3.0", re.compile(r"\bGNU LESSER GENERAL PUBLIC LICENSE\b[\s\S]{0,200}Version 3", re.I)),
    ("AGPL-3.0", re.compile(r"\bGNU AFFERO GENERAL PUBLIC LICENSE\b", re.I)),
    ("BSD-3-Clause", re.compile(r"Redistribution and use in source and binary forms", re.I)),
    ("MPL-2.0", re.compile(r"\bMozilla Public License\b[\s\S]{0,200}2\.0", re.I)),
    ("Unlicense", re.compile(r"\bThis is free and unencumbered software released into the public domain", re.I)),
]

_LICENSE_FILE_NAMES = {
    "license",
    "license.md",
    "license.txt",
    "licence",
    "licence.md",
    "licence.txt",
    "copying",
    "copying.md",
}


@dataclass
class _Finding:
    category: str
    severity: str
    title: str
    description: str
    path: str
    evidence_id: str
    recommendation: str


def detect_license(
    *,
    metadata_license: str | None,
    files: dict[str, str],
    collector: EvidenceCollector,
) -> tuple[str | None, list[str]]:
    license_text_path = None
    license_text = ""
    for path, content in files.items():
        if PurePosixPath(path).name.lower() in _LICENSE_FILE_NAMES:
            license_text_path = path
            license_text = content
            break

    if license_text_path and license_text:
        for name, pattern in _LICENSE_SIGNATURES:
            if pattern.search(license_text):
                excerpt = license_text.strip().splitlines()[0] if license_text.strip() else name
                evidence_id = collector.add(
                    path=license_text_path,
                    excerpt=excerpt,
                    category="license",
                    confidence=95,
                    content=license_text,
                )
                return name, [evidence_id]

    if metadata_license and metadata_license.upper() not in {"NOASSERTION", "NONE", ""}:
        evidence_id = collector.add(
            path="(GitHub repository metadata)",
            excerpt=f"GitHub reports the license as {metadata_license}.",
            category="license",
            confidence=85,
        )
        return metadata_license, [evidence_id]

    return None, []


def _is_placeholder_line(line: str) -> bool:
    lowered = line.lower()
    return any(hint in lowered for hint in _PLACEHOLDER_HINTS)


def _scan_secrets(
    files: dict[str, str],
    collector: EvidenceCollector,
    findings: list[_Finding],
    *,
    limit: int,
) -> None:
    for path, content in files.items():
        lowered = path.lower()
        name = PurePosixPath(lowered).name
        if name.endswith((".example", ".sample", ".template", ".md")):
            continue
        suffix = PurePosixPath(name).suffix
        if suffix not in _SCANNED_SUFFIXES and name not in {".env", "dockerfile", "makefile"}:
            continue

        for line_number, line in enumerate(content.splitlines(), start=1):
            if len(line) > 4000 or _is_placeholder_line(line):
                continue
            for description, pattern in _SECRET_PATTERNS:
                if not pattern.search(line):
                    continue
                safe_line = redact_text(line.strip(), max_length=300)
                if "[REDACTED" not in safe_line:
                    safe_line = "[REDACTED — credential-like value]"
                evidence_id = collector.add(
                    path=path,
                    excerpt=f"Line {line_number}: {safe_line}",
                    category="security_secret",
                    confidence=80,
                    line_start=line_number,
                    line_end=line_number,
                )
                findings.append(
                    _Finding(
                        category="secret",
                        severity="high",
                        title=f"Potential {description} committed in source",
                        description=(
                            "A line matches a credential-like pattern. The value is redacted "
                            "here and was not stored. Confirm whether it is a real secret and "
                            "rotate it if so."
                        ),
                        path=path,
                        evidence_id=evidence_id,
                        recommendation=(
                            "Remove the value from the repository, rotate the credential, and "
                            "load secrets from environment variables or a secret manager."
                        ),
                    )
                )
                if len(findings) >= limit:
                    return


def _scan_dangerous_patterns(
    files: dict[str, str],
    collector: EvidenceCollector,
    findings: list[_Finding],
    *,
    limit: int,
) -> None:
    seen: set[tuple[str, str]] = set()
    for path, content in files.items():
        lowered = path.lower()
        if lowered.endswith((".md", ".lock", ".min.js", ".map")):
            continue
        for category, pattern, title, description, recommendation in _DANGEROUS_PATTERNS:
            if (path, category) in seen:
                continue
            match = pattern.search(content)
            if not match:
                continue
            seen.add((path, category))
            line_number = content.count("\n", 0, match.start()) + 1
            line_start = content.rfind("\n", 0, match.start()) + 1
            line_end = content.find("\n", match.end())
            if line_end == -1:
                line_end = len(content)
            line = content[line_start:line_end].strip()
            evidence_id = collector.add(
                path=path,
                excerpt=line[:300],
                category="security_pattern",
                confidence=70,
                line_start=line_number,
                line_end=line_number,
            )
            findings.append(
                _Finding(
                    category=category,
                    severity="medium",
                    title=title,
                    description=(
                        f"{description} This is a pattern match for review, not a confirmed "
                        "vulnerability."
                    ),
                    path=path,
                    evidence_id=evidence_id,
                    recommendation=recommendation,
                )
            )
            if len(findings) >= limit:
                return


def _detect_committed_env(
    tree_paths: list[str], collector: EvidenceCollector, findings: list[_Finding]
) -> None:
    for path in tree_paths:
        name = PurePosixPath(path).name.lower()
        if name not in {".env", ".env.local", ".env.production", ".env.development"}:
            continue
        evidence_id = collector.add(
            path=path,
            excerpt=f"Environment file present in the repository tree: {path}",
            category="security_secret",
            confidence=90,
        )
        findings.append(
            _Finding(
                category="committed-env",
                severity="high",
                title="Environment file present in repository",
                description=(
                    "A .env file exists in the repository tree. Its contents were not fetched "
                    "or displayed. Real environment files often contain secrets."
                ),
                path=path,
                evidence_id=evidence_id,
                recommendation=(
                    "Confirm the file contains no secrets, remove it from version control, "
                    "and commit a .env.example template instead."
                ),
            )
        )
        return


def analyze_security(
    *,
    repo_license: str | None,
    files: dict[str, str],
    tree_paths: list[str],
    collector: EvidenceCollector,
) -> SecurityOut:
    findings: list[_Finding] = []
    limit = 20

    _detect_committed_env(tree_paths, collector, findings)
    _scan_secrets(files, collector, findings, limit=limit)
    _scan_dangerous_patterns(files, collector, findings, limit=limit)

    license_name, license_evidence = detect_license(
        metadata_license=repo_license,
        files=files,
        collector=collector,
    )

    limitations = [
        "Security review is limited to pattern matching over the bounded snapshot. It is not a "
        "pentest, dependency audit, or guarantee that the repository is secure.",
        "Dependency vulnerability scanning was not run; no CVE counts or security grades are "
        "reported.",
    ]

    return SecurityOut(
        findings=[
            SecurityFinding(
                id=f"sec_{index}",
                category=item.category,
                severity=item.severity,  # type: ignore[arg-type]
                title=item.title,
                description=item.description,
                path=item.path,
                evidence_ids=[item.evidence_id],
                recommendation=item.recommendation,
            )
            for index, item in enumerate(findings, start=1)
        ],
        license=license_name,
        license_evidence_ids=license_evidence,
        dependency_scan=DependencyScan(
            status="not_run",
            reason=(
                "Dependency vulnerability scanning is outside M1. No CVE data is collected, "
                "counted, or displayed."
            ),
            vulnerabilities_found=None,
        ),
        scanned_files=len(files),
        limitations=limitations,
    )
