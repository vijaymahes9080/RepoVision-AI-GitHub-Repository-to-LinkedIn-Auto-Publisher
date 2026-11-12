from __future__ import annotations

from urllib.parse import urlencode

from fastapi import APIRouter, Depends, Query
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session

from app.config import settings
from app.core.errors import AppError
from app.db import get_db
from app.models import LinkedInPublishAttempt
from app.schemas import (
    LinkedInAttemptOut,
    LinkedInDirectTokenRequest,
    LinkedInDisconnectResponse,
    LinkedInOAuthStartResponse,
    LinkedInPublishRequest,
    LinkedInPublishResponse,
    LinkedInStatusResponse,
)
from app.services import linkedin as linkedin_service

router = APIRouter(tags=["linkedin"])


def _frontend_redirect(**params: str) -> RedirectResponse:
    base = settings.frontend_url.rstrip("/")
    separator = "&" if "?" in base else "?"
    return RedirectResponse(
        url=f"{base}{separator}{urlencode(params)}",
        status_code=303,
    )


@router.post("/linkedin/oauth/start", response_model=LinkedInOAuthStartResponse)
def start_oauth(db: Session = Depends(get_db)) -> LinkedInOAuthStartResponse:
    authorization_url, state, expires_at = linkedin_service.start_oauth(db)
    return LinkedInOAuthStartResponse(
        authorization_url=authorization_url,
        state=state,
        expires_at=expires_at,
    )


@router.get("/linkedin/oauth/callback")
def oauth_callback(
    code: str | None = Query(default=None),
    state: str | None = Query(default=None),
    error: str | None = Query(default=None),
    error_description: str | None = Query(default=None),
    db: Session = Depends(get_db),
) -> RedirectResponse:
    if error:
        return _frontend_redirect(
            linkedin="error",
            code=error,
            message=(error_description or "LinkedIn authorization was cancelled.")[:300],
        )
    if not code or not state:
        return _frontend_redirect(
            linkedin="error",
            code="missing_code",
            message="LinkedIn did not return an authorization code.",
        )
    try:
        account = linkedin_service.handle_callback(db, code=code, state=state)
    except AppError as exc:
        return _frontend_redirect(
            linkedin="error",
            code=exc.code,
            message=exc.message[:300],
        )
    return _frontend_redirect(
        linkedin="connected",
        member=account.member_name,
    )


@router.get("/linkedin/status", response_model=LinkedInStatusResponse)
def status(db: Session = Depends(get_db)) -> LinkedInStatusResponse:
    return LinkedInStatusResponse(**linkedin_service.get_status(db))


@router.post("/linkedin/connect-token", response_model=LinkedInStatusResponse)
def connect_direct_token(
    payload: LinkedInDirectTokenRequest,
    db: Session = Depends(get_db),
) -> LinkedInStatusResponse:
    linkedin_service.connect_direct_token(
        db,
        access_token=payload.access_token,
        member_name=payload.member_name,
    )
    return LinkedInStatusResponse(**linkedin_service.get_status(db))


@router.post("/linkedin/disconnect", response_model=LinkedInDisconnectResponse)
def disconnect(db: Session = Depends(get_db)) -> LinkedInDisconnectResponse:
    removed = linkedin_service.disconnect(db)
    return LinkedInDisconnectResponse(disconnected=removed, connected=False)


@router.post("/linkedin/publish", response_model=LinkedInPublishResponse)
def publish(
    payload: LinkedInPublishRequest,
    db: Session = Depends(get_db),
) -> LinkedInPublishResponse:
    result = linkedin_service.publish(db, payload)
    return LinkedInPublishResponse(**result)


def _attempt_response(attempt: LinkedInPublishAttempt) -> LinkedInAttemptOut:
    return LinkedInAttemptOut(
        id=attempt.id,
        draft_id=attempt.draft_id,
        status=attempt.status,
        commentary=attempt.commentary,
        has_image=attempt.has_image,
        image_urn=attempt.image_urn,
        post_urn=attempt.post_urn,
        error_code=attempt.error_code,
        error_message=attempt.error_message,
        created_at=attempt.created_at,
        updated_at=attempt.updated_at,
    )


@router.get("/linkedin/attempts", response_model=list[LinkedInAttemptOut])
def list_attempts(
    limit: int = Query(default=20, ge=1, le=100),
    db: Session = Depends(get_db),
) -> list[LinkedInAttemptOut]:
    return [_attempt_response(attempt) for attempt in linkedin_service.list_attempts(db, limit)]
