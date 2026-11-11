from __future__ import annotations

import pytest

from app.core.errors import InvalidRepositoryUrl
from app.services.analysis.redaction import redact_text
from app.services.github.url import parse_repo_url


@pytest.mark.parametrize(
    "url",
    [
        "https://github.com/octocat/Hello-World",
        "https://github.com/octocat/Hello-World.git",
        "https://www.github.com/octocat/Hello-World/",
    ],
)
def test_parse_repo_url_accepts_public_https_urls(url):
    ref = parse_repo_url(url)
    assert ref.owner == "octocat"
    assert ref.name == "Hello-World"
    assert ref.canonical_url == "https://github.com/octocat/Hello-World"


@pytest.mark.parametrize(
    "url",
    [
        "",
        "git@github.com:octocat/Hello-World.git",
        "ssh://github.com/octocat/Hello-World",
        "http://github.com/octocat/Hello-World",
        "https://gitlab.com/octocat/Hello-World",
        "https://github.com.evil.example/octocat/Hello-World",
        "https://user:pass@github.com/octocat/Hello-World",
        "https://github.com/octocat",
        "https://github.com/octocat/Hello-World/tree/main",
        "https://github.com/octocat/Hello-World?tab=readme",
        "https://github.com/../Hello-World",
    ],
)
def test_parse_repo_url_rejects_unsafe_or_ambiguous_urls(url):
    with pytest.raises(InvalidRepositoryUrl):
        parse_repo_url(url)


def test_redaction_removes_known_secret_formats():
    text = (
        'api_key = "sk-abcdefghijklmnopqrstuvwxyz123456"\n'
        'token: "ghp_abcdefghijklmnopqrstuvwxyz1234567890"\n'
    )
    redacted = redact_text(text)
    assert "sk-abcdefghijklmnopqrstuvwxyz123456" not in redacted
    assert "ghp_abcdefghijklmnopqrstuvwxyz1234567890" not in redacted
    assert "[REDACTED" in redacted


def test_redaction_keeps_placeholders_readable():
    text = 'api_key = "your_api_key_here"'
    assert redact_text(text) == text
