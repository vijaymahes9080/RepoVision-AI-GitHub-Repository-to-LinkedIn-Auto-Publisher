from __future__ import annotations

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.errors import (
    AnalysisNotFound,
    AnalysisNotReady,
    ContentNotFound,
)
from app.db import get_db
from app.models import AnalysisRun, ContentDraft
from app.schemas import (
    AnalysisResult,
    ContentDraftResponse,
    ContentGenerateRequest,
    VerificationOut,
    VerifyRequest,
)
from app.services.content.drafts import draft_claims, generate_draft
from app.services.content.verifier import verify_text

router = APIRouter(tags=["content"])


def _draft_response(draft: ContentDraft) -> ContentDraftResponse:
    return ContentDraftResponse(
        id=draft.id,
        run_id=draft.run_id,
        style=draft.style,
        length=draft.length,
        status=draft.status,
        title=draft.title,
        body=draft.body,
        hooks=draft.hooks or [],
        hashtags=draft.hashtags or [],
        cta=draft.cta,
        claims=draft_claims(draft),
        warnings=draft.warnings or [],
        generator=draft.generator,
        model=draft.model,
        created_at=draft.created_at,
    )


@router.post("/content", response_model=ContentDraftResponse, status_code=status.HTTP_201_CREATED)
def create_content(
    payload: ContentGenerateRequest,
    db: Session = Depends(get_db),
) -> ContentDraftResponse:
    run = db.get(AnalysisRun, payload.run_id)
    if run is None:
        raise AnalysisNotFound("Analysis run not found.")
    if run.status != "completed" or not run.result_json:
        raise AnalysisNotReady("Content can only be generated after the analysis completes.")
    draft = generate_draft(db, run, payload)
    return _draft_response(draft)


@router.get("/content/{draft_id}", response_model=ContentDraftResponse)
def get_content(draft_id: str, db: Session = Depends(get_db)) -> ContentDraftResponse:
    draft = db.get(ContentDraft, draft_id)
    if draft is None:
        raise ContentNotFound("Content draft not found.")
    return _draft_response(draft)


@router.get("/analyses/{run_id}/content", response_model=list[ContentDraftResponse])
def list_content(run_id: str, db: Session = Depends(get_db)) -> list[ContentDraftResponse]:
    run = db.get(AnalysisRun, run_id)
    if run is None:
        raise AnalysisNotFound("Analysis run not found.")
    drafts = (
        db.query(ContentDraft)
        .filter(ContentDraft.run_id == run_id)
        .order_by(ContentDraft.created_at.desc())
        .all()
    )
    return [_draft_response(draft) for draft in drafts]


@router.post("/content/verify", response_model=VerificationOut)
def verify_content(payload: VerifyRequest, db: Session = Depends(get_db)) -> VerificationOut:
    run = db.get(AnalysisRun, payload.run_id)
    if run is None:
        raise AnalysisNotFound("Analysis run not found.")
    if run.status != "completed" or not run.result_json:
        raise AnalysisNotReady("Verification requires a completed analysis.")
    result = AnalysisResult.model_validate(run.result_json)
    return verify_text(payload.text, result)
