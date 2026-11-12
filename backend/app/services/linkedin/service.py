from __future__ import annotations

import base64
import binascii
import hashlib
import secrets
from datetime import datetime, timedelta, timezone
from urllib.parse import urlencode

from sqlalchemy.orm import Session

from app.config import settings
from app.core.errors import (
    ContentNotFound,
    ContentVerificationFailed,
    LinkedInNotConfigured,
    LinkedInNotConnected,
    LinkedInOAuthError,
    LinkedInPublishConfirmationRequired,
    LinkedInPublishFailed,
    LinkedInPublishingDisabled,
)
from app.models import (
    AnalysisRun,
    ContentDraft,
    LinkedInAccount,
    LinkedInOAuthState,
    LinkedInPublishAttempt,
)
from app.schemas import AnalysisResult, LinkedInPublishRequest
from app.services.content.verifier import verify_text
from app.services.linkedin.client import LINKEDIN_SCOPES, LinkedInClient
from app.services.linkedin.crypto import get_cipher

OAUTH_STATE_TTL = timedelta(minutes=10)
MAX_COMMENTARY = 3000
MAX_IMAGE_BYTES = 8 * 1024 * 1024


def _now() -> datetime:
    return datetime.now(timezone.utc)


def _aware(value: datetime | None) -> datetime | None:
    if value is None:
        return None
    if value.tzinfo is None:
        return value.replace(tzinfo=timezone.utc)
    return value


def _frontend_redirect(**params: str) -> str:
    base = settings.frontend_url.rstrip("/")
    separator = "&" if "?" in base else "?"
    return f"{base}{separator}{urlencode(params)}"


def start_oauth(db: Session) -> tuple[str, str, datetime]:
    if not settings.linkedin_enabled:
        raise LinkedInPublishingDisabled(
            "LinkedIn publishing is disabled. Set LINKEDIN_ENABLED=true after the LinkedIn app "
            "is approved."
        )
    if not settings.linkedin_ready:
        missing = []
        if not settings.linkedin_configured:
            missing.append("LINKEDIN_CLIENT_ID/SECRET/REDIRECT_URI")
        if not settings.token_encryption_key:
            missing.append("TOKEN_ENCRYPTION_KEY")
        raise LinkedInNotConfigured(
            "LinkedIn OAuth is not configured. Missing: " + ", ".join(missing) + "."
        )

    cipher = get_cipher()
    state = secrets.token_urlsafe(32)
    code_verifier = secrets.token_urlsafe(64)
    code_challenge = (
        base64.urlsafe_b64encode(hashlib.sha256(code_verifier.encode("ascii")).digest())
        .decode("ascii")
        .rstrip("=")
    )
    now = _now()
    expires_at = now + OAUTH_STATE_TTL

    db.query(LinkedInOAuthState).filter(LinkedInOAuthState.expires_at < now).delete()
    db.add(
        LinkedInOAuthState(
            state=state,
            code_verifier_encrypted=cipher.encrypt(code_verifier),
            redirect_uri=settings.linkedin_redirect_uri or "",
            created_at=now,
            expires_at=expires_at,
        )
    )
    db.commit()

    client = LinkedInClient()
    authorization_url = client.build_authorization_url(
        state=state,
        code_challenge=code_challenge,
        redirect_uri=settings.linkedin_redirect_uri or "",
    )
    return authorization_url, state, expires_at


def handle_callback(db: Session, *, code: str, state: str) -> LinkedInAccount:
    cipher = get_cipher()
    row = db.get(LinkedInOAuthState, state)
    if row is None or row.used_at is not None or (_aware(row.expires_at) or _now()) < _now():
        raise LinkedInOAuthError(
            "This LinkedIn authorization link is invalid or expired. Start the connection again."
        )

    row.used_at = _now()
    db.commit()

    client = LinkedInClient()
    token = client.exchange_code(
        code=code,
        code_verifier=cipher.decrypt(row.code_verifier_encrypted),
        redirect_uri=row.redirect_uri,
    )
    profile = client.get_userinfo(str(token["access_token"]))

    member_sub = str(profile["sub"])
    expires_in = token.get("expires_in")
    expires_at = None
    if isinstance(expires_in, (int, float)) and expires_in > 0:
        expires_at = _now() + timedelta(seconds=float(expires_in))

    account = (
        db.query(LinkedInAccount).filter(LinkedInAccount.member_sub == member_sub).one_or_none()
    )
    if account is None:
        account = LinkedInAccount(member_sub=member_sub)
        db.add(account)

    account.member_name = str(profile.get("name") or profile.get("given_name") or "LinkedIn member")
    picture = profile.get("picture")
    account.member_picture = str(picture) if picture else None
    account.access_token_encrypted = cipher.encrypt(str(token["access_token"]))
    refresh_token = token.get("refresh_token")
    account.refresh_token_encrypted = cipher.encrypt(str(refresh_token)) if refresh_token else None
    scope = token.get("scope")
    account.scopes = str(scope) if isinstance(scope, str) else " ".join(LINKEDIN_SCOPES)
    account.expires_at = expires_at
    account.updated_at = _now()
    db.commit()
    db.refresh(account)
    return account


def connect_direct_token(
    db: Session,
    access_token: str,
    member_name: str | None = None,
) -> LinkedInAccount:
    cipher = get_cipher()
    client = LinkedInClient()
    try:
        profile = client.get_userinfo(access_token)
        member_sub = str(profile.get("sub") or "member:direct")
        resolved_name = str(profile.get("name") or profile.get("given_name") or member_name or "LinkedIn Member")
        picture = profile.get("picture")
    except Exception:
        member_sub = "member:direct"
        resolved_name = member_name or "LinkedIn Member"
        picture = None

    account = (
        db.query(LinkedInAccount).filter(LinkedInAccount.member_sub == member_sub).one_or_none()
    )
    if account is None:
        account = LinkedInAccount(member_sub=member_sub)
        db.add(account)

    account.member_name = resolved_name
    account.member_picture = str(picture) if picture else None
    account.access_token_encrypted = cipher.encrypt(access_token)
    account.refresh_token_encrypted = None
    account.scopes = " ".join(LINKEDIN_SCOPES)
    account.expires_at = _now() + timedelta(days=60)
    account.updated_at = _now()
    db.commit()
    db.refresh(account)
    return account


def disconnect(db: Session) -> int:
    count = db.query(LinkedInAccount).delete()
    db.commit()
    return count


def get_status(db: Session) -> dict:
    account = db.query(LinkedInAccount).order_by(LinkedInAccount.connected_at.desc()).first()
    if account is None and settings.linkedin_access_token and settings.token_encryption_key:
        try:
            account = connect_direct_token(db, settings.linkedin_access_token)
        except Exception:
            pass

    expires_at = _aware(account.expires_at) if account else None
    token_expired = bool(expires_at and expires_at <= _now())
    configured = bool(settings.linkedin_ready or (account and settings.token_encryption_key))
    publishing_allowed = bool(settings.linkedin_enabled and (settings.linkedin_ready or account))

    if not settings.linkedin_enabled:
        reason = "LINKEDIN_ENABLED is false. Real posting stays disabled until you opt in."
    elif not configured and not account:
        reason = (
            "LinkedIn OAuth is not configured. Add client credentials and TOKEN_ENCRYPTION_KEY or connect direct token."
        )
    elif account is None:
        reason = "Connect a LinkedIn member account to publish."
    elif token_expired and not account.refresh_token_encrypted:
        reason = "The LinkedIn access token expired. Reconnect the account."
    else:
        reason = "Ready to publish with explicit confirmation."

    return {
        "configured": configured,
        "publishing_enabled": publishing_allowed,
        "connected": account is not None,
        "member_name": account.member_name if account else None,
        "member_picture": account.member_picture if account else None,
        "scopes": account.scopes.split() if account and account.scopes else LINKEDIN_SCOPES,
        "expires_at": expires_at,
        "can_publish": publishing_allowed and account is not None,
        "reason": reason,
        "required_scopes": LINKEDIN_SCOPES,
    }


def _decode_png(image_base64: str) -> bytes:
    payload = image_base64.strip()
    if payload.startswith("data:"):
        _, _, payload = payload.partition(",")
    try:
        data = base64.b64decode(payload, validate=True)
    except (binascii.Error, ValueError) as exc:
        raise LinkedInPublishFailed("The banner image is not valid base64.") from exc
    if not data.startswith(b"\x89PNG\r\n\x1a\n"):
        raise LinkedInPublishFailed("The banner image must be a PNG.")
    if len(data) > MAX_IMAGE_BYTES:
        raise LinkedInPublishFailed("The banner image exceeds LinkedIn's 8 MB image limit.")
    return data


def _commentary_for(draft: ContentDraft, override: str | None) -> str:
    if override is not None and override.strip():
        commentary = override.strip()
    else:
        tags = " ".join(tag if tag.startswith("#") else f"#{tag}" for tag in (draft.hashtags or []))
        commentary = draft.body.strip()
        if tags:
            commentary = f"{commentary}\n\n{tags}".strip()
    if not commentary:
        raise LinkedInPublishFailed("The draft has no text to publish.")
    if len(commentary) > MAX_COMMENTARY:
        raise LinkedInPublishFailed(
            f"The post is {len(commentary)} characters. LinkedIn allows at most {MAX_COMMENTARY}. "
            "Shorten the draft before publishing."
        )
    return commentary


def _verify_commentary(db: Session, draft: ContentDraft, commentary: str) -> None:
    run = db.get(AnalysisRun, draft.run_id)
    if run is None or not run.result_json:
        raise ContentNotFound("The analysis for this draft is no longer available.")
    result = AnalysisResult.model_validate(run.result_json)
    verification = verify_text(commentary, result)
    if not verification.ok:
        raise ContentVerificationFailed(
            "The post contains claims that are not supported by the stored evidence. "
            "Run the verifier and fix the draft before publishing.",
            details={"claims": [claim.model_dump() for claim in verification.claims]},
        )


def _refresh_if_needed(db: Session, account: LinkedInAccount) -> str:
    cipher = get_cipher()
    expires_at = _aware(account.expires_at)
    if expires_at is None or expires_at > _now() + timedelta(seconds=60):
        return cipher.decrypt(account.access_token_encrypted)

    if not account.refresh_token_encrypted:
        raise LinkedInNotConnected(
            "The LinkedIn access token expired and no refresh token is stored. Reconnect LinkedIn."
        )

    client = LinkedInClient()
    token = client.refresh_access_token(cipher.decrypt(account.refresh_token_encrypted))
    account.access_token_encrypted = cipher.encrypt(str(token["access_token"]))
    refresh_token = token.get("refresh_token")
    if refresh_token:
        account.refresh_token_encrypted = cipher.encrypt(str(refresh_token))
    expires_in = token.get("expires_in")
    if isinstance(expires_in, (int, float)) and expires_in > 0:
        account.expires_at = _now() + timedelta(seconds=float(expires_in))
    account.updated_at = _now()
    db.commit()
    return str(token["access_token"])


def publish(db: Session, payload: LinkedInPublishRequest) -> dict:
    if not settings.linkedin_enabled:
        raise LinkedInPublishingDisabled(
            "LinkedIn publishing is disabled. Set LINKEDIN_ENABLED=true after the LinkedIn app "
            "is approved."
        )
    if not settings.linkedin_ready:
        raise LinkedInNotConfigured(
            "LinkedIn OAuth is not configured. Add client credentials and TOKEN_ENCRYPTION_KEY."
        )
    if not payload.confirm:
        raise LinkedInPublishConfirmationRequired(
            "Publishing requires confirm=true after reviewing the post and image."
        )

    account = db.query(LinkedInAccount).order_by(LinkedInAccount.connected_at.desc()).first()
    if account is None:
        raise LinkedInNotConnected("Connect a LinkedIn account before publishing.")

    draft = db.get(ContentDraft, payload.draft_id)
    if draft is None:
        raise ContentNotFound("Content draft not found.")

    commentary = _commentary_for(draft, payload.commentary)
    _verify_commentary(db, draft, commentary)
    png_bytes = _decode_png(payload.image_base64) if payload.image_base64 else None

    attempt = LinkedInPublishAttempt(
        draft_id=draft.id,
        status="pending",
        commentary=commentary,
        has_image=png_bytes is not None,
        created_at=_now(),
        updated_at=_now(),
    )
    db.add(attempt)
    db.commit()
    db.refresh(attempt)

    client = LinkedInClient()
    owner_urn = f"urn:li:person:{account.member_sub}"
    try:
        access_token = _refresh_if_needed(db, account)
        image_urn = None
        if png_bytes is not None:
            upload_url, image_urn = client.initialize_image_upload(access_token, owner_urn)
            client.upload_image(upload_url, png_bytes)
        post_urn = client.create_post(
            access_token=access_token,
            owner_urn=owner_urn,
            commentary=commentary,
            image_urn=image_urn,
        )
    except Exception as exc:
        attempt.status = "failed"
        attempt.error_code = getattr(exc, "code", "LINKEDIN_PUBLISH_FAILED")
        attempt.error_message = getattr(exc, "message", str(exc))[:2000]
        attempt.updated_at = _now()
        db.commit()
        raise

    attempt.status = "published"
    attempt.post_urn = post_urn
    attempt.image_urn = image_urn
    attempt.error_code = None
    attempt.error_message = None
    attempt.updated_at = _now()
    db.commit()
    db.refresh(attempt)

    return {
        "status": "published",
        "attempt_id": attempt.id,
        "post_urn": post_urn,
        "published_at": attempt.updated_at,
        "has_image": attempt.has_image,
    }


def list_attempts(db: Session, limit: int = 20) -> list[LinkedInPublishAttempt]:
    return (
        db.query(LinkedInPublishAttempt)
        .order_by(LinkedInPublishAttempt.created_at.desc())
        .limit(max(1, min(limit, 100)))
        .all()
    )
