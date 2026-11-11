from __future__ import annotations

import re

from app.services.analysis.orchestrator import build_analysis_result
from app.services.content.drafts import build_rule_based_draft
from app.services.content.verifier import verify_text
from tests.test_analysis import make_snapshot


def build_result():
    return build_analysis_result("run-verifier", make_snapshot())


def test_verifier_accepts_grounded_third_person_text():
    result = build_result()
    text = (
        "The repository documents evidence links and uses FastAPI, PostgreSQL, and React. "
        "Read the source: https://github.com/octo/demo"
    )
    verification = verify_text(text, result)
    assert verification.ok is True, [claim.reason for claim in verification.claims]


def test_verifier_rejects_first_person_metrics_and_external_urls():
    result = build_result()
    text = (
        "I built this repository with Rust. It has 37 contributors and zero vulnerabilities. "
        "More at https://example.com/demo"
    )
    verification = verify_text(text, result)
    reasons = " ".join(claim.reason for claim in verification.claims)
    assert verification.ok is False
    assert "First-person" in reasons
    assert "Rust" in reasons
    assert "37" in reasons
    assert "zero vulnerabilities" in reasons
    assert "https://example.com/demo" in reasons


def test_verifier_rejects_superlatives_and_unverified_attribution():
    result = build_result()
    text = "This groundbreaking repository was built by a world-class team."
    verification = verify_text(text, result)
    reasons = " ".join(claim.reason for claim in verification.claims)
    assert verification.ok is False
    assert "groundbreaking" in reasons
    assert "built by" in reasons
    assert "world-class" in reasons


def test_rule_based_draft_is_grounded_and_passes_verification():
    result = build_result()
    draft = build_rule_based_draft(result, style="professional", length="medium")

    assert draft.generator == "rule_based"
    assert draft.claims
    assert all(claim["status"] == "supported" for claim in draft.claims)
    assert len(draft.body) <= 2900
    assert not re.search(r"\b(?:I|we|my|our|us)\b", draft.body, re.IGNORECASE)
    assert "https://github.com/octo/demo" in draft.body

    verification = verify_text(draft.body, result)
    assert verification.ok is True, [claim.reason for claim in verification.claims]

    evidence_ids = {item.id for item in result.evidence}
    for claim in draft.claims:
        assert set(claim["evidence_ids"]) <= evidence_ids


def test_rule_based_draft_never_invents_features_when_readme_lacks_them():
    snapshot = make_snapshot()
    snapshot.readme_text = "# Demo\n\nMinimal readme without a feature section.\n"
    snapshot.files["README.md"] = snapshot.readme_text
    result = build_analysis_result("run-minimal", snapshot)
    draft = build_rule_based_draft(result, style="concise", length="short")

    assert result.features == []
    assert "Documented capabilities include" not in draft.body
    assert any("feature list" in warning for warning in draft.warnings)
