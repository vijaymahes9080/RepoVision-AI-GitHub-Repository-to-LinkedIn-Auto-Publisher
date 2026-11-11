from __future__ import annotations

from datetime import datetime, timedelta, timezone

import httpx
import pytest
import respx
from cryptography.fernet import Fernet
from sqlalchemy import select

from app.config import settings
from app.db import SessionLocal
from app.models import AnalysisRun, ContentDraft, LinkedInAccount, LinkedInOAuthState
from app.services.analysis.orchestrator import build_analysis_result
from app.services.content.drafts import build_rule_based_draft
from app.services.linkedin.crypto import get_cipher
from tests.test_analysis import make_snapshot

PNG_BASE64 = (
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII="
)
TOKEN_URL = "https://www.linkedin.com/oauth/v2/accessToken"
USERINFO_URL = "https://api.linkedin.com/v2/userinfo"
IMAGE_INIT_URL = "https://api.linkedin.com/rest/images?action=initializeUpload"
POSTS_URL = "https://api.linkedin.com/rest/posts"
UPLOAD_URL = "https://media.licdn.com/media/upload/abc"


@pytest.fixture()
def linkedin_env(monkeypatch):
    key = Fernet.generate_key().decode()
    monkeypatch.setattr(settings, "linkedin_client_id", "test-client-id")
    monkeypatch.setattr(settings, "linkedin_client_secret", "test-client-secret")
    monkeypatch.setattr(
        settings,
        "linkedin_redirect_uri",
        "https://api.repovision.test/api/v1/linkedin/oauth/callback",
    )
    monkeypatch.setattr(settings, "linkedin_enabled", True)
    monkeypatch.setattr(settings, "token_encryption_key", key)
    monkeypatch.setattr(settings, "frontend_url", "https://app.repovision.test")
    return key


def _make_run_and_draft() -> tuple[str, str]:
    result = build_analysis_result("run-linkedin", make_snapshot())
    draft = build_rule_based_draft(result, style="professional", length="medium")
    with SessionLocal() as db:
        run = AnalysisRun(
            id=result.run_id,
            repo_url=result.repo.url,
            owner=result.repo.owner,
            name=result.repo.name,
            branch=result.snapshot.branch,
            status="completed",
            stage="Done",
            progress=100,
            commit_sha=result.snapshot.commit_sha,
            default_branch=result.snapshot.branch,
            result_json=result.model_dump(mode="json"),
        )
        db.add(run)
        db.flush()
        row = ContentDraft(
            run_id=run.id,
            style="professional",
            length="medium",
            status="ready",
            title=draft.title,
            body=draft.body,
            hooks=draft.hooks,
            hashtags=draft.hashtags,
            cta=draft.cta,
            claims=draft.claims,
            warnings=draft.warnings,
            generator=draft.generator,
            model=draft.model,
        )
        db.add(row)
        db.commit()
        return run.id, row.id


def _seed_account(access_token: str = "access-token-123") -> None:
    cipher = get_cipher()
    with SessionLocal() as db:
        db.add(
            LinkedInAccount(
                member_sub="member-123",
                member_name="Test Member",
                access_token_encrypted=cipher.encrypt(access_token),
                scopes="openid profile w_member_social",
                expires_at=datetime.now(timezone.utc) + timedelta(hours=1),
            )
        )
        db.commit()


def test_status_reports_disabled_by_default(client):
    response = client.get("/api/v1/linkedin/status")
    assert response.status_code == 200
    payload = response.json()
    assert payload["publishing_enabled"] is False
    assert payload["can_publish"] is False
    assert payload["connected"] is False
    assert "LINKEDIN_ENABLED" in payload["reason"]


def test_oauth_start_requires_explicit_opt_in(client, linkedin_env, monkeypatch):
    monkeypatch.setattr(settings, "linkedin_enabled", False)
    response = client.post("/api/v1/linkedin/oauth/start")
    assert response.status_code == 503
    assert response.json()["error"]["code"] == "LINKEDIN_PUBLISHING_DISABLED"


def test_oauth_start_returns_state_and_stores_encrypted_verifier(client, linkedin_env):
    response = client.post("/api/v1/linkedin/oauth/start")
    assert response.status_code == 200
    payload = response.json()
    assert "linkedin.com/oauth/v2/authorization" in payload["authorization_url"]
    assert payload["state"] in payload["authorization_url"]
    assert "code_challenge=" in payload["authorization_url"]
    assert "client_secret" not in response.text

    with SessionLocal() as db:
        row = db.get(LinkedInOAuthState, payload["state"])
        assert row is not None
        assert row.code_verifier_encrypted != ""


def test_oauth_callback_encrypts_tokens_and_never_returns_them(client, linkedin_env):
    with respx.mock(assert_all_called=False) as router:
        router.post(TOKEN_URL).mock(
            return_value=httpx.Response(
                200,
                json={
                    "access_token": "plain-access-token",
                    "refresh_token": "plain-refresh-token",
                    "expires_in": 3600,
                    "scope": "openid profile w_member_social",
                },
            )
        )
        router.get(USERINFO_URL).mock(
            return_value=httpx.Response(
                200,
                json={
                    "sub": "member-123",
                    "name": "Test Member",
                    "picture": "https://media.licdn.com/pic.jpg",
                },
            )
        )

        start = client.post("/api/v1/linkedin/oauth/start")
        state = start.json()["state"]

        callback = client.get(
            f"/api/v1/linkedin/oauth/callback?code=code-123&state={state}",
            follow_redirects=False,
        )

    assert callback.status_code == 303
    location = callback.headers["location"]
    assert location.startswith("https://app.repovision.test?")
    assert "linkedin=connected" in location
    assert "plain-access-token" not in callback.text

    with SessionLocal() as db:
        account = db.scalars(select(LinkedInAccount)).one()
        assert account.member_sub == "member-123"
        assert account.access_token_encrypted != "plain-access-token"
        assert account.refresh_token_encrypted != "plain-refresh-token"
        assert get_cipher().decrypt(account.access_token_encrypted) == "plain-access-token"
        assert get_cipher().decrypt(account.refresh_token_encrypted) == "plain-refresh-token"

    status = client.get("/api/v1/linkedin/status").json()
    assert status["connected"] is True
    assert status["can_publish"] is True
    assert status["member_name"] == "Test Member"
    assert "token" not in status


def test_oauth_callback_rejects_reused_state(client, linkedin_env):
    with respx.mock(assert_all_called=False) as router:
        router.post(TOKEN_URL).mock(
            return_value=httpx.Response(
                200,
                json={"access_token": "token", "expires_in": 3600},
            )
        )
        router.get(USERINFO_URL).mock(
            return_value=httpx.Response(200, json={"sub": "member-123", "name": "Test Member"})
        )
        state = client.post("/api/v1/linkedin/oauth/start").json()["state"]
        first = client.get(
            f"/api/v1/linkedin/oauth/callback?code=code-123&state={state}",
            follow_redirects=False,
        )
        second = client.get(
            f"/api/v1/linkedin/oauth/callback?code=code-123&state={state}",
            follow_redirects=False,
        )

    assert "linkedin=connected" in first.headers["location"]
    assert "linkedin=error" in second.headers["location"]
    assert "LINKEDIN_OAUTH_ERROR" in second.headers["location"]


def test_publish_requires_confirmation(client, linkedin_env):
    _, draft_id = _make_run_and_draft()
    _seed_account()
    response = client.post(
        "/api/v1/linkedin/publish",
        json={"draft_id": draft_id, "confirm": False},
    )
    assert response.status_code == 422
    assert response.json()["error"]["code"] == "PUBLISH_CONFIRMATION_REQUIRED"


def test_publish_requires_a_connection(client, linkedin_env):
    _, draft_id = _make_run_and_draft()
    response = client.post(
        "/api/v1/linkedin/publish",
        json={"draft_id": draft_id, "confirm": True},
    )
    assert response.status_code == 409
    assert response.json()["error"]["code"] == "LINKEDIN_NOT_CONNECTED"


def test_publish_rejects_unsupported_claims(client, linkedin_env):
    _, draft_id = _make_run_and_draft()
    _seed_account()
    response = client.post(
        "/api/v1/linkedin/publish",
        json={
            "draft_id": draft_id,
            "confirm": True,
            "commentary": "I built this with Rust and 500 stars.",
        },
    )
    assert response.status_code == 422
    assert response.json()["error"]["code"] == "CONTENT_VERIFICATION_FAILED"


def test_publish_with_image_reports_only_real_api_success(client, linkedin_env):
    _, draft_id = _make_run_and_draft()
    _seed_account()
    with SessionLocal() as db:
        draft = db.get(ContentDraft, draft_id)
        commentary = draft.body

    with respx.mock(assert_all_called=True) as router:
        init = router.post(IMAGE_INIT_URL).mock(
            return_value=httpx.Response(
                200,
                json={
                    "value": {
                        "uploadUrl": UPLOAD_URL,
                        "image": "urn:li:image:123",
                    }
                },
            )
        )
        upload = router.put(UPLOAD_URL).mock(return_value=httpx.Response(201))
        post = router.post(POSTS_URL).mock(
            return_value=httpx.Response(201, headers={"x-restli-id": "urn:li:share:456"})
        )

        response = client.post(
            "/api/v1/linkedin/publish",
            json={
                "draft_id": draft_id,
                "confirm": True,
                "commentary": commentary,
                "image_base64": f"data:image/png;base64,{PNG_BASE64}",
            },
        )

    assert response.status_code == 200
    payload = response.json()
    assert payload["status"] == "published"
    assert payload["post_urn"] == "urn:li:share:456"
    assert payload["has_image"] is True
    assert init.called and upload.called and post.called

    attempts = client.get("/api/v1/linkedin/attempts").json()
    assert attempts[0]["status"] == "published"
    assert attempts[0]["has_image"] is True
    assert attempts[0]["image_urn"] == "urn:li:image:123"


def test_publish_failure_is_audited_and_not_reported_as_success(client, linkedin_env):
    _, draft_id = _make_run_and_draft()
    _seed_account()
    with SessionLocal() as db:
        commentary = db.get(ContentDraft, draft_id).body

    with respx.mock(assert_all_called=False) as router:
        router.post(POSTS_URL).mock(
            return_value=httpx.Response(500, json={"message": "LinkedIn is unavailable"})
        )
        response = client.post(
            "/api/v1/linkedin/publish",
            json={"draft_id": draft_id, "confirm": True, "commentary": commentary},
        )

    assert response.status_code == 502
    assert response.json()["error"]["code"] == "LINKEDIN_PUBLISH_FAILED"
    attempts = client.get("/api/v1/linkedin/attempts").json()
    assert attempts[0]["status"] == "failed"
    assert attempts[0]["error_code"] == "LINKEDIN_PUBLISH_FAILED"


def test_disconnect_removes_stored_account(client, linkedin_env):
    _seed_account()
    response = client.post("/api/v1/linkedin/disconnect")
    assert response.status_code == 200
    assert response.json() == {"disconnected": 1, "connected": False}
    assert client.get("/api/v1/linkedin/status").json()["connected"] is False


def test_config_reflects_linkedin_enablement(client, linkedin_env):
    config = client.get("/api/v1/config/status").json()
    assert config["linkedin_configured"] is True
    assert config["linkedin_publishing_enabled"] is True
    capabilities = {item["id"]: item for item in config["capabilities"]}
    assert capabilities["linkedin_publishing"]["enabled"] is True

    preflight = client.get("/api/v1/linkedin/preflight").json()
    assert preflight["configured"] is True
    assert preflight["publishing_enabled"] is True
