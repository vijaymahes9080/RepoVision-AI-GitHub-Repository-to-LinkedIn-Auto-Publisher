from __future__ import annotations

import re
from urllib.parse import urlparse

from app.core.errors import InvalidRepositoryUrl
from app.schemas import RepoRef

_OWNER_RE = re.compile(r"^[A-Za-z0-9](?:[A-Za-z0-9._-]{0,98}[A-Za-z0-9])?$")
_REPO_RE = re.compile(r"^[A-Za-z0-9._-]{1,100}$")
_ALLOWED_HOSTS = {"github.com", "www.github.com"}


def parse_repo_url(raw_url: str) -> RepoRef:
    """Parse and strictly validate a public GitHub repository URL.

    Only https://github.com/{owner}/{repo} is accepted. SSH remotes, arbitrary
    hosts, credentials, query strings, fragments, and extra path segments are
    rejected to keep outbound requests inside an allowlist.
    """

    raw = (raw_url or "").strip()
    if not raw:
        raise InvalidRepositoryUrl("Enter a GitHub repository URL.")

    if raw.startswith("git@") or raw.startswith("ssh://"):
        raise InvalidRepositoryUrl(
            "SSH repository URLs are not accepted. Use https://github.com/owner/repository."
        )

    parsed = urlparse(raw)
    if parsed.scheme != "https":
        raise InvalidRepositoryUrl("Only HTTPS GitHub URLs are accepted.")
    if parsed.hostname not in _ALLOWED_HOSTS:
        raise InvalidRepositoryUrl("The repository URL must point to github.com.")
    if parsed.username or parsed.password:
        raise InvalidRepositoryUrl("Credentials must not be included in the repository URL.")
    if parsed.query or parsed.fragment:
        raise InvalidRepositoryUrl("Remove query strings and fragments from the repository URL.")

    path = parsed.path.strip("/")
    if path.endswith(".git"):
        path = path[:-4]
    if not path or path.count("/") != 1:
        raise InvalidRepositoryUrl(
            "Expected https://github.com/owner/repository with no extra path segments."
        )

    owner, name = path.split("/", 1)
    owner = owner.strip()
    name = name.strip()

    if not _OWNER_RE.match(owner) or owner in {".", ".."}:
        raise InvalidRepositoryUrl("The GitHub owner name is not valid.")
    if not _REPO_RE.match(name) or name in {".", ".."}:
        raise InvalidRepositoryUrl("The GitHub repository name is not valid.")
    if len(owner) > 100 or len(name) > 100:
        raise InvalidRepositoryUrl("The GitHub owner or repository name is too long.")

    return RepoRef(
        owner=owner,
        name=name,
        canonical_url=f"https://github.com/{owner}/{name}",
    )
