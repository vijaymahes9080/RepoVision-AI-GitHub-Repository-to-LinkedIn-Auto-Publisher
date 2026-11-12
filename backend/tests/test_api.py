from __future__ import annotations

import base64

import httpx
import respx

from tests.test_analysis import (
    APP_TSX,
    BACKEND_MAIN,
    CI_YML,
    CONFIG_TS,
    LICENSE,
    PACKAGE_JSON,
    README,
    REQUIREMENTS,
    TEST_APP,
)

COMMIT_SHA = "a" * 40
TREE_SHA = "b" * 40

FILES = {
    "README.md": README,
    "package.json": PACKAGE_JSON,
    "requirements.txt": REQUIREMENTS,
    "src/App.tsx": APP_TSX,
    "src/config.ts": CONFIG_TS,
    "tests/test_app.py": TEST_APP,
    ".github/workflows/ci.yml": CI_YML,
    "LICENSE": LICENSE,
    "backend/main.py": BACKEND_MAIN,
}


def _encoded(content: str) -> dict:
    return {
        "encoding": "base64",
        "content": base64.b64encode(content.encode("utf-8")).decode("ascii"),
        "size": len(content.encode("utf-8")),
    }


def _repo_payload() -> dict:
    return {
        "description": "A demo repository for evidence-first analysis.",
        "default_branch": "main",
        "stargazers_count": 5,
        "forks_count": 2,
        "language": "TypeScript",
        "license": {"spdx_id": "MIT"},
        "private": False,
        "archived": False,
        "size": 120,
    }


def mock_github_success(router: respx.MockRouter) -> None:
    base = "https://api.github.com/repos/octo/demo"

    router.get(f"{base}").mock(return_value=httpx.Response(200, json=_repo_payload()))
    router.get(f"{base}/git/ref/heads/main").mock(
        return_value=httpx.Response(200, json={"object": {"sha": COMMIT_SHA}})
    )
    router.get(f"{base}/git/commits/{COMMIT_SHA}").mock(
        return_value=httpx.Response(200, json={"sha": COMMIT_SHA, "tree": {"sha": TREE_SHA}})
    )

    tree_entries = [
        {"path": path, "type": "blob", "size": len(content)} for path, content in FILES.items()
    ]
    router.get(url__regex=rf"{base}/git/trees/{TREE_SHA}(?:\?.*)?$").mock(
        return_value=httpx.Response(
            200,
            json={"sha": TREE_SHA, "truncated": False, "tree": tree_entries},
        )
    )

    router.get(url__regex=rf"{base}/readme(?:\?.*)?$").mock(
        return_value=httpx.Response(
            200,
            json={"path": "README.md", **_encoded(README)},
        )
    )

    def contents_handler(request: httpx.Request) -> httpx.Response:
        path = request.url.path.split("/contents/", 1)[1]
        path = path.replace("%2F", "/")
        content = FILES.get(path)
        if content is None:
            return httpx.Response(404, json={"message": "Not Found"})
        return httpx.Response(200, json={"path": path, **_encoded(content)})

    router.get(url__regex=rf"{base}/contents/.+").mock(side_effect=contents_handler)


def wait_for_run(client, run_id: str) -> dict:
    response = client.get(f"/api/v1/analyses/{run_id}")
    assert response.status_code == 200
    payload = response.json()
    assert payload["status"] in {"completed", "failed"}
    return payload


def test_health_and_config_are_honest(client):
    for path in ("/api/v1/health", "/health", "/healthz"):
        health = client.get(path)
        assert health.status_code == 200
        assert health.json()["status"] == "ok"

    config_response = client.get("/api/v1/config/status")
    assert config_response.status_code == 200
    payload = config_response.json()
    assert payload["linkedin_publishing_enabled"] is False
    capabilities = {item["id"]: item for item in payload["capabilities"]}
    assert capabilities["analysis"]["enabled"] is True
    assert capabilities["scheduler"]["enabled"] is False
    assert capabilities["analytics"]["enabled"] is False
    assert capabilities["linkedin_publishing"]["enabled"] is False
    assert "secret" not in config_response.text.lower()
    assert "api_key" not in config_response.text.lower()

    preflight = client.get("/api/v1/linkedin/preflight")
    assert preflight.status_code == 200
    preflight_payload = preflight.json()
    assert preflight_payload["publishing_enabled"] is False
    assert "w_member_social" in preflight_payload["required_scopes"]


def test_invalid_repository_url_is_rejected(client):
    response = client.post(
        "/api/v1/analyses",
        json={"repo_url": "https://gitlab.com/octo/demo"},
    )
    assert response.status_code == 422
    payload = response.json()
    assert payload["error"]["code"] == "INVALID_REPOSITORY_URL"
    assert payload["request_id"]


def test_full_analysis_content_and_verification_flow(client):
    with respx.mock(assert_all_called=False) as router:
        mock_github_success(router)

        start = client.post(
            "/api/v1/analyses",
            json={"repo_url": "https://github.com/octo/demo"},
        )
        assert start.status_code == 202
        run_id = start.json()["run_id"]

        run = wait_for_run(client, run_id)
        assert run["status"] == "completed", run.get("error")
        assert run["commit_sha"] == COMMIT_SHA
        assert run["branch"] == "main"

        result = run["result"]
        names = {technology["name"] for technology in result["technologies"]}
        assert {"React", "FastAPI", "PostgreSQL"} <= names
        assert result["features"]
        assert "GET /api/items" in result["api_endpoints"]
        assert result["security"]["dependency_scan"]["status"] == "not_run"
        assert result["security"]["dependency_scan"]["vulnerabilities_found"] is None
        assert result["testing"]["test_file_count"] >= 1

        evidence_response = client.get(f"/api/v1/analyses/{run_id}/evidence")
        assert evidence_response.status_code == 200
        evidence = evidence_response.json()["evidence"]
        assert evidence
        assert all(item["id"].startswith("ev_") for item in evidence)
        assert "sk-abcdefghijklmnopqrstuvwxyz123456" not in evidence_response.text

        content_response = client.post(
            "/api/v1/content",
            json={"run_id": run_id, "style": "professional", "length": "medium"},
        )
        assert content_response.status_code == 201
        draft = content_response.json()
        assert draft["generator"] == "rule_based"
        assert draft["claims"]
        assert all(claim["status"] == "supported" for claim in draft["claims"])
        assert "no llm provider is configured" in " ".join(draft["warnings"]).lower()
        assert len(draft["body"]) <= 2900

        verify_ok = client.post(
            "/api/v1/content/verify",
            json={
                "run_id": run_id,
                "text": "The repository uses FastAPI and PostgreSQL.",
            },
        )
        assert verify_ok.status_code == 200
        assert verify_ok.json()["ok"] is True

        verify_bad = client.post(
            "/api/v1/content/verify",
            json={
                "run_id": run_id,
                "text": "I built this with Rust and 500 stars.",
            },
        )
        assert verify_bad.status_code == 200
        assert verify_bad.json()["ok"] is False
        reasons = " ".join(claim["reason"] for claim in verify_bad.json()["claims"])
        assert "First-person" in reasons
        assert "Rust" in reasons
        assert "500" in reasons

        listed = client.get(f"/api/v1/analyses/{run_id}/content")
        assert listed.status_code == 200
        assert len(listed.json()) == 1


def test_rate_limited_github_failure_is_reported(client):
    with respx.mock(assert_all_called=False) as router:
        router.get("https://api.github.com/repos/octo/demo").mock(
            return_value=httpx.Response(
                403,
                headers={"x-ratelimit-remaining": "0", "x-ratelimit-reset": "1700000000"},
                json={"message": "API rate limit exceeded"},
            )
        )

        start = client.post(
            "/api/v1/analyses",
            json={"repo_url": "https://github.com/octo/demo"},
        )
        assert start.status_code == 202
        run = wait_for_run(client, start.json()["run_id"])

        assert run["status"] == "failed"
        assert run["error"]["code"] == "GITHUB_RATE_LIMITED"
        assert run["result"] is None
