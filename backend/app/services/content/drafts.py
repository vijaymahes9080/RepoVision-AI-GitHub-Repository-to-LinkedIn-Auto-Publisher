from __future__ import annotations

import json
import re
from dataclasses import dataclass, field

from sqlalchemy.orm import Session

from app.models import AnalysisRun, ContentDraft
from app.schemas import AnalysisResult, ClaimOut, ContentGenerateRequest
from app.services.content.verifier import verify_text
from app.services.llm.factory import get_llm_provider

_MAX_BODY = 2900

_OPENERS = {
    "professional": (
        "An evidence-based snapshot of {repo} shows what the project documents and which "
        "engineering signals are present in the repository."
    ),
    "technical": (
        "Repository snapshot: {repo}. This review is based on README content, manifests, "
        "configuration, and selected source files."
    ),
    "storytelling": (
        "Documentation often says more about a project than a repository name does. "
        "This snapshot looks at {repo} and separates documented intent from observable signals."
    ),
    "educational": (
        "A practical way to evaluate an unfamiliar repository is to separate what it documents "
        "from what the codebase can evidence. {repo} is a useful example."
    ),
    "innovation": (
        "An evidence-first look at {repo}: what the repository states, what its manifests "
        "confirm, and what remains unknown."
    ),
    "career": (
        "Public repositories are useful portfolio evidence when claims can be traced to "
        "something concrete. This snapshot of {repo} focuses on that traceability."
    ),
    "concise": "Evidence snapshot: {repo}.",
}

_CTAS = {
    "professional": "Review the repository and its documented limitations: {url}",
    "technical": "Commit-level evidence and limitations are summarized from the snapshot: {url}",
    "storytelling": "The repository is public; the documentation is the place to start: {url}",
    "educational": "Inspect the evidence and the limitations together: {url}",
    "innovation": "The snapshot and its evidence boundary are available here: {url}",
    "career": "Read the repository with the evidence boundary in mind: {url}",
    "concise": "Repository: {url}",
}


@dataclass
class GeneratedDraft:
    title: str
    body: str
    hooks: list[str] = field(default_factory=list)
    hashtags: list[str] = field(default_factory=list)
    cta: str = ""
    claims: list[dict] = field(default_factory=list)
    warnings: list[str] = field(default_factory=list)
    generator: str = "rule_based"
    model: str | None = None


def _short(text: str, limit: int) -> str:
    clean = re.sub(r"\s+", " ", text).strip()
    if len(clean) <= limit:
        return clean
    return clean[: limit - 1].rsplit(" ", 1)[0] + "…"


def _sentence(text: str) -> str:
    clean = re.sub(r"\s+", " ", text).strip()
    if not clean:
        return ""
    if clean[-1] not in ".!?":
        clean += "."
    return clean


def _evidence_ids_for(result: AnalysisResult, categories: set[str]) -> list[str]:
    return [
        item.id
        for item in result.evidence
        if item.category in categories
    ]


def _claim(text: str, evidence_ids: list[str]) -> dict:
    return {
        "claim": text,
        "status": "supported" if evidence_ids else "unverified",
        "evidence_ids": list(dict.fromkeys(evidence_ids)),
        "reason": (
            "Directly traceable to stored evidence."
            if evidence_ids
            else "No stored evidence supports this statement."
        ),
    }


def _hashtags(result: AnalysisResult) -> list[str]:
    tags: list[str] = []
    for technology in result.technologies[:8]:
        if technology.confidence < 70:
            continue
        tag = re.sub(r"[^A-Za-z0-9]", "", technology.name)
        if tag and tag not in tags:
            tags.append(tag)
    for tag in ("OpenSource", "GitHub", result.repo.language or ""):
        cleaned = re.sub(r"[^A-Za-z0-9]", "", tag)
        if cleaned and cleaned not in tags:
            tags.append(cleaned)
    return tags[:6]


def _feature_sentence(result: AnalysisResult) -> tuple[str, list[str]]:
    features = [feature for feature in result.features if feature.evidence_ids]
    if not features:
        return "", []
    titles = [feature.title for feature in features[:4]]
    evidence_ids: list[str] = []
    for feature in features[:4]:
        evidence_ids.extend(feature.evidence_ids)
    sentence = _sentence("Documented capabilities include " + "; ".join(titles))
    return sentence, evidence_ids


def _stack_sentence(result: AnalysisResult) -> tuple[str, list[str]]:
    technologies = [
        technology
        for technology in result.technologies
        if technology.confidence >= 75 and not technology.inferred and technology.evidence_ids
    ]
    if not technologies:
        return "", []
    names = [technology.name for technology in technologies[:6]]
    evidence_ids: list[str] = []
    for technology in technologies[:6]:
        evidence_ids.extend(technology.evidence_ids)
    sentence = _sentence(
        "Manifests and configuration in the snapshot support " + ", ".join(names)
    )
    return sentence, evidence_ids


def _testing_sentence(result: AnalysisResult) -> tuple[str, list[str]]:
    parts: list[str] = []
    if result.testing.test_file_count:
        parts.append("test files are present")
    if result.testing.frameworks:
        parts.append("test tooling includes " + ", ".join(result.testing.frameworks[:3]))
    if result.testing.ci_systems:
        parts.append("CI configuration includes " + ", ".join(result.testing.ci_systems[:3]))
    if not parts:
        return "", []
    sentence = _sentence(
        "In the analyzed snapshot, " + "; ".join(parts) + ", and tests were not executed"
    )
    return sentence, result.testing.evidence_ids


def _security_sentence(result: AnalysisResult) -> tuple[str, list[str]]:
    findings = result.security.findings
    if not findings:
        return "", []
    sentence = _sentence(
        "A static pattern review surfaced review items for maintainers; it is not a "
        "vulnerability assessment and no dependency scan was run"
    )
    evidence_ids: list[str] = []
    for finding in findings[:3]:
        evidence_ids.extend(finding.evidence_ids)
    return sentence, evidence_ids


def _architecture_sentence(result: AnalysisResult) -> tuple[str, list[str]]:
    if not result.architecture.components:
        return "", []
    roles = [component.name for component in result.architecture.components[:4]]
    sentence = _sentence(
        "The inferred structure includes " + ", ".join(roles) + " components, based on "
        "manifest evidence rather than runtime observation"
    )
    return sentence, result.architecture.evidence_ids


def build_rule_based_draft(
    result: AnalysisResult, *, style: str, length: str
) -> GeneratedDraft:
    repo_label = f"{result.repo.owner}/{result.repo.name}"
    opener = _OPENERS.get(style, _OPENERS["professional"]).format(repo=repo_label)
    cta = _CTAS.get(style, _CTAS["professional"]).format(url=result.repo.url)

    claims: list[dict] = []
    paragraphs: list[str] = [opener]

    description = ""
    description_evidence = _evidence_ids_for(result, {"readme_description"})
    if result.summary.description and description_evidence:
        description = _sentence(_short(result.summary.description, 360))
        claims.append(_claim(description, description_evidence))

    feature_sentence, feature_evidence = _feature_sentence(result)
    stack_sentence, stack_evidence = _stack_sentence(result)
    architecture_sentence, architecture_evidence = _architecture_sentence(result)
    testing_sentence, testing_evidence = _testing_sentence(result)
    security_sentence, security_evidence = _security_sentence(result)

    if description:
        paragraphs.append(description)
    if feature_sentence:
        paragraphs.append(feature_sentence)
        claims.append(_claim(feature_sentence, feature_evidence))
    if stack_sentence:
        paragraphs.append(stack_sentence)
        claims.append(_claim(stack_sentence, stack_evidence))
    if architecture_sentence:
        paragraphs.append(architecture_sentence)
        claims.append(_claim(architecture_sentence, architecture_evidence))

    if length in {"medium", "long"}:
        if testing_sentence:
            paragraphs.append(testing_sentence)
            claims.append(_claim(testing_sentence, testing_evidence))
        if security_sentence:
            paragraphs.append(security_sentence)
            claims.append(_claim(security_sentence, security_evidence))

    if length == "long":
        if result.limitations:
            paragraphs.append(
                "Evidence boundary: " + _short(result.limitations[0], 260)
            )
        if len(result.limitations) > 1:
            paragraphs.append(_short(result.limitations[1], 260))
        if result.api_endpoints:
            sample = result.api_endpoints[:4]
            api_sentence = _sentence(
                "The snapshot contains route declarations such as " + ", ".join(sample)
            )
            api_evidence = _evidence_ids_for(result, {"api_endpoint"})
            paragraphs.append(api_sentence)
            claims.append(_claim(api_sentence, api_evidence))

    limitation = (
        "This summary reflects a bounded static snapshot; the code was not executed, built, "
        "or tested."
    )
    paragraphs.append(limitation)

    if length == "short":
        body = "\n\n".join(paragraphs[:3] + [limitation, cta])
    elif length == "medium":
        body = "\n\n".join(paragraphs + [cta])
    else:
        body = "\n\n".join(paragraphs + [cta])

    # Keep within LinkedIn's practical limit without cutting a sentence in half.
    while len(body) > _MAX_BODY and len(paragraphs) > 2:
        paragraphs.pop(-2)
        body = "\n\n".join(paragraphs + [cta])

    title = f"{result.repo.name}: an evidence-based repository snapshot"
    hooks = [
        opener,
        f"What the snapshot of {repo_label} can and cannot show:",
        f"Documented signals from {repo_label}, with evidence attached.",
    ]

    hashtags = _hashtags(result)
    warnings = [
        "Generated from a static snapshot. No code execution, dependency scan, or security "
        "audit was performed.",
    ]
    if not result.features:
        warnings.append("The README did not contain a recognisable feature list.")
    if not result.testing.test_file_count:
        warnings.append("No test files were detected in the bounded snapshot.")

    return GeneratedDraft(
        title=title,
        body=body,
        hooks=hooks,
        hashtags=hashtags,
        cta=cta,
        claims=claims,
        warnings=warnings,
        generator="rule_based",
        model=None,
    )


def _llm_facts(result: AnalysisResult) -> dict:
    return {
        "repository": {
            "owner": result.repo.owner,
            "name": result.repo.name,
            "url": result.repo.url,
            "description": result.repo.description,
            "language": result.repo.language,
            "license": result.summary.license,
        },
        "documented_description": result.summary.description,
        "documented_features": [feature.title for feature in result.features],
        "technologies": [
            {
                "name": technology.name,
                "category": technology.category,
                "confidence": technology.confidence,
                "inferred": technology.inferred,
            }
            for technology in result.technologies
        ],
        "testing": {
            "frameworks": result.testing.frameworks,
            "test_file_count": result.testing.test_file_count,
            "ci_systems": result.testing.ci_systems,
        },
        "security_finding_titles": [finding.title for finding in result.security.findings],
        "api_endpoints": result.api_endpoints[:10],
        "limitations": result.limitations,
        "evidence": [
            {"id": item.id, "path": item.path, "excerpt": item.excerpt}
            for item in result.evidence[:20]
        ],
    }


def _build_llm_prompt(result: AnalysisResult, style: str, length: str) -> str:
    facts = json.dumps(_llm_facts(result), ensure_ascii=False, indent=2)
    length_hint = {
        "short": "roughly 500-700 characters",
        "medium": "roughly 900-1400 characters",
        "long": "roughly 1600-2400 characters",
    }[length]
    return (
        "You write LinkedIn posts about public GitHub repositories. Use only the facts in the "
        "JSON below. Do not invent metrics, users, downloads, stars, dates, CVEs, security "
        "grades, or ownership claims. Do not use first-person pronouns (I, we, my, our, us). "
        "Do not use superlatives or marketing hype. Do not add URLs other than the repository "
        "URL. Mention a technology only if it appears in the technologies list. State that the "
        "analysis is a static snapshot and that code was not executed. If a fact is missing, "
        "omit it instead of guessing.\n\n"
        f"Style: {style}. Target length: {length_hint}. LinkedIn maximum: 2900 characters.\n\n"
        "Return strict JSON with keys: title (string), body (string), hooks (array of 3 "
        "strings), hashtags (array of up to 6 strings without #), cta (string). No markdown "
        "fences, no commentary.\n\n"
        f"Facts:\n{facts}"
    )


def _parse_llm_output(raw: str, result: AnalysisResult) -> GeneratedDraft:
    cleaned = raw.strip()
    if cleaned.startswith("```"):
        cleaned = re.sub(r"^```[a-zA-Z]*\s*", "", cleaned)
        cleaned = re.sub(r"\s*```$", "", cleaned)
    payload = json.loads(cleaned)
    if not isinstance(payload, dict):
        raise ValueError("LLM output is not a JSON object")
    title = str(payload.get("title", "")).strip()
    body = str(payload.get("body", "")).strip()
    if not title or not body:
        raise ValueError("LLM output is missing a title or body")
    if len(body) > _MAX_BODY:
        raise ValueError("LLM output exceeds the LinkedIn body limit")

    hooks_raw = payload.get("hooks") or []
    hashtags_raw = payload.get("hashtags") or []
    hooks = [str(item).strip() for item in hooks_raw if str(item).strip()][:3]
    hashtags = [
        re.sub(r"^#+", "", str(item).strip())
        for item in hashtags_raw
        if str(item).strip()
    ][:6]
    cta = str(payload.get("cta", "")).strip()

    verification = verify_text(body, result)
    if not verification.ok:
        reasons = "; ".join(claim.reason for claim in verification.claims[:3])
        raise ValueError(f"LLM draft failed fact verification: {reasons}")

    warnings = [
        "LLM-generated text passed automated checks against stored evidence, but individual "
        "sentences are not mapped to evidence IDs.",
        "Generated from a static snapshot. No code execution, dependency scan, or security "
        "audit was performed.",
    ]
    return GeneratedDraft(
        title=title[:300],
        body=body,
        hooks=hooks,
        hashtags=hashtags,
        cta=cta,
        claims=[],
        warnings=warnings,
        generator="llm",
    )


def generate_draft(
    db: Session,
    run: AnalysisRun,
    request: ContentGenerateRequest,
) -> ContentDraft:
    result = AnalysisResult.model_validate(run.result_json)
    fallback_reason = ""

    provider = get_llm_provider()
    if provider is not None:
        try:
            raw = provider.generate(
                _build_llm_prompt(result, request.style, request.length)
            )
            generated = _parse_llm_output(raw, result)
            generated.model = provider.model
        except Exception as exc:  # LLM failures must never break draft generation.
            fallback_reason = f"LLM generation was unavailable or failed validation: {exc}"
            generated = build_rule_based_draft(
                result, style=request.style, length=request.length
            )
            generated.model = None
    else:
        generated = build_rule_based_draft(result, style=request.style, length=request.length)
        generated.model = None
        fallback_reason = (
            "No LLM provider is configured; the draft was generated by the deterministic, "
            "evidence-linked generator."
        )

    if generated.generator == "rule_based":
        verification = verify_text(generated.body, result)
        rejected = [claim for claim in verification.claims if claim.status != "supported"]
        if rejected:
            # The deterministic generator should never fail, but keep the guarantee explicit.
            generated.warnings.append(
                "Automated verification flagged generated text: "
                + "; ".join(claim.reason for claim in rejected[:3])
            )

    warnings = list(dict.fromkeys(generated.warnings))
    if fallback_reason:
        warnings.insert(0, fallback_reason)

    draft = ContentDraft(
        run_id=run.id,
        style=request.style,
        length=request.length,
        status="ready",
        title=generated.title,
        body=generated.body,
        hooks=generated.hooks,
        hashtags=generated.hashtags,
        cta=generated.cta,
        claims=generated.claims,
        warnings=warnings,
        generator=generated.generator,
        model=generated.model,
    )
    db.add(draft)
    db.commit()
    db.refresh(draft)
    return draft


def draft_claims(draft: ContentDraft) -> list[ClaimOut]:
    claims: list[ClaimOut] = []
    for item in draft.claims or []:
        try:
            claims.append(ClaimOut.model_validate(item))
        except Exception:
            continue
    return claims
