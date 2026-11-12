from __future__ import annotations

import base64
from datetime import datetime, timezone
from typing import Any
from urllib.parse import quote

import httpx

from app.config import settings
from app.core.errors import GitHubRateLimited, GitHubUnavailable, RepositoryNotFound
from app.schemas import RepositoryMetadata


class GitHubClient:
    def __init__(self, token: str | None = None) -> None:
        headers = {
            "Accept": "application/vnd.github+json",
            "X-GitHub-Api-Version": "2022-11-28",
            "User-Agent": "RepoVision-AI/0.1",
        }
        if token:
            headers["Authorization"] = f"Bearer {token}"
        self._client = httpx.Client(
            base_url=settings.github_api_base,
            headers=headers,
            timeout=httpx.Timeout(settings.github_timeout_seconds),
            follow_redirects=True,
        )

    def close(self) -> None:
        self._client.close()

    def __enter__(self) -> "GitHubClient":
        return self

    def __exit__(self, *_exc_info: object) -> None:
        self.close()

    def _request(
        self,
        method: str,
        path: str,
        *,
        params: dict[str, Any] | None = None,
        allow_404: bool = False,
    ) -> httpx.Response | None:
        try:
            response = self._client.request(method, path, params=params)
        except httpx.TimeoutException as exc:
            raise GitHubUnavailable("GitHub did not respond before the request timeout.") from exc
        except httpx.HTTPError as exc:
            raise GitHubUnavailable("Could not reach the GitHub API.") from exc

        if response.status_code == 404:
            if allow_404:
                return None
            raise RepositoryNotFound(
                "Repository not found. It may not exist, or it may be private and require "
                "authorization."
            )

        if response.status_code in {403, 429}:
            remaining = response.headers.get("x-ratelimit-remaining")
            reset = response.headers.get("x-ratelimit-reset")
            reset_at = None
            if reset and reset.isdigit():
                reset_at = datetime.fromtimestamp(int(reset), tz=timezone.utc).isoformat()
            if response.status_code == 429 or remaining == "0":
                raise GitHubRateLimited(
                    "GitHub API rate limit reached. Configure a server-side GitHub token or try "
                    "again later.",
                    details={"reset_at": reset_at},
                )
            raise GitHubUnavailable(
                "GitHub rejected the request. The repository may be inaccessible or GitHub may "
                "be rate limiting this server."
            )

        if response.status_code == 401:
            raise GitHubUnavailable(
                "GitHub authorization failed. Check the server-side GitHub token configuration."
            )

        if response.status_code >= 400:
            raise GitHubUnavailable(
                f"GitHub API returned HTTP {response.status_code}.",
                details={"status": response.status_code},
            )

        return response

    def get_repo(self, owner: str, name: str) -> RepositoryMetadata:
        response = self._request("GET", f"/repos/{quote(owner)}/{quote(name)}")
        assert response is not None
        data = response.json()
        license_info = data.get("license") or {}
        return RepositoryMetadata(
            owner=owner,
            name=name,
            url=f"https://github.com/{owner}/{name}",
            description=data.get("description"),
            default_branch=data.get("default_branch") or "main",
            stars=int(data.get("stargazers_count") or 0),
            forks=int(data.get("forks_count") or 0),
            language=data.get("language"),
            license=license_info.get("spdx_id") if isinstance(license_info, dict) else None,
            private=bool(data.get("private")),
            archived=bool(data.get("archived")),
            size_kb=int(data.get("size") or 0),
        )

    def get_branch_sha(self, owner: str, name: str, branch: str) -> str | None:
        response = self._request(
            "GET",
            f"/repos/{quote(owner)}/{quote(name)}/git/ref/heads/{quote(branch, safe='')}",
            allow_404=True,
        )
        if response is None:
            return None
        data = response.json()
        obj = data.get("object") or {}
        sha = obj.get("sha")
        return sha if isinstance(sha, str) else None

    def get_commit(self, owner: str, name: str, sha: str) -> dict[str, Any]:
        response = self._request(
            "GET", f"/repos/{quote(owner)}/{quote(name)}/git/commits/{quote(sha)}"
        )
        assert response is not None
        return response.json()

    def get_tree(self, owner: str, name: str, tree_sha: str) -> dict[str, Any]:
        response = self._request(
            "GET",
            f"/repos/{quote(owner)}/{quote(name)}/git/trees/{quote(tree_sha)}",
            params={"recursive": "1"},
        )
        assert response is not None
        return response.json()

    def get_readme(self, owner: str, name: str, ref: str) -> tuple[str, str] | None:
        response = self._request(
            "GET",
            f"/repos/{quote(owner)}/{quote(name)}/readme",
            params={"ref": ref},
            allow_404=True,
        )
        if response is None:
            return None
        data = response.json()
        path = data.get("path") or "README.md"
        content = _decode_content(data)
        if content is None:
            return None
        return path, content

    def get_file(self, owner: str, name: str, path: str, ref: str) -> str | None:
        response = self._request(
            "GET",
            f"/repos/{quote(owner)}/{quote(name)}/contents/{quote(path, safe='/')}",
            params={"ref": ref},
            allow_404=True,
        )
        if response is None:
            return None
        data = response.json()
        if not isinstance(data, dict):
            return None
        if int(data.get("size") or 0) > settings.max_file_bytes:
            return None
        content = _decode_content(data)
        if content is None:
            return None
        if "\x00" in content:
            return None
        return content


def _decode_content(data: dict[str, Any]) -> str | None:
    if data.get("encoding") != "base64" or not data.get("content"):
        return None
    try:
        raw = base64.b64decode(data["content"])
    except (ValueError, TypeError):
        return None
    return raw.decode("utf-8", errors="replace")
