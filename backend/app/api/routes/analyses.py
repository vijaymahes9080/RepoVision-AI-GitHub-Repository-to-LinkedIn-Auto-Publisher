from __future__ import annotations

from fastapi import APIRouter, BackgroundTasks, Depends, status
from sqlalchemy.orm import Session

from app.core.errors import AnalysisNotFound, AnalysisNotReady
from app.db import get_db
from app.models import AnalysisRun
from app.schemas import (
    AnalysisResult,
    AnalysisRunResponse,
    AnalyzeRequest,
    AnalyzeStartResponse,
    EvidenceListResponse,
)
from app.services.analysis.orchestrator import run_analysis
from app.services.github.url import parse_repo_url

router = APIRouter(prefix="/analyses", tags=["analyses"])


def _run_response(run: AnalysisRun) -> AnalysisRunResponse:
    result = None
    if run.status == "completed" and run.result_json:
        result = AnalysisResult.model_validate(run.result_json)
    error = None
    if run.status == "failed" and run.error_code:
        error = {
            "code": run.error_code,
            "message": run.error_message or "Analysis failed.",
        }
    return AnalysisRunResponse(
        run_id=run.id,
        status=run.status,  # type: ignore[arg-type]
        stage=run.stage,
        progress=run.progress,
        repo_url=run.repo_url,
        owner=run.owner,
        name=run.name,
        branch=run.branch,
        commit_sha=run.commit_sha,
        created_at=run.created_at,
        updated_at=run.updated_at,
        error=error,
        result=result,
    )


@router.post("", response_model=AnalyzeStartResponse, status_code=status.HTTP_202_ACCEPTED)
def start_analysis(
    payload: AnalyzeRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
) -> AnalyzeStartResponse:
    reference = parse_repo_url(payload.repo_url)
    run = AnalysisRun(
        repo_url=reference.canonical_url,
        owner=reference.owner,
        name=reference.name,
        branch=payload.branch,
        status="queued",
        stage="Queued",
        progress=0,
    )
    db.add(run)
    db.commit()
    db.refresh(run)

    background_tasks.add_task(run_analysis, run.id)

    return AnalyzeStartResponse(
        run_id=run.id,
        status=run.status,
        status_url=f"/api/v1/analyses/{run.id}",
    )


@router.get("/{run_id}", response_model=AnalysisRunResponse)
def get_analysis(run_id: str, db: Session = Depends(get_db)) -> AnalysisRunResponse:
    run = db.get(AnalysisRun, run_id)
    if run is None:
        raise AnalysisNotFound("Analysis run not found.")
    return _run_response(run)


@router.get("/{run_id}/evidence", response_model=EvidenceListResponse)
def get_evidence(run_id: str, db: Session = Depends(get_db)) -> EvidenceListResponse:
    run = db.get(AnalysisRun, run_id)
    if run is None:
        raise AnalysisNotFound("Analysis run not found.")
    if run.status != "completed" or not run.result_json:
        raise AnalysisNotReady("Evidence is only available after the analysis completes.")
    result = AnalysisResult.model_validate(run.result_json)
    return EvidenceListResponse(run_id=run.id, evidence=result.evidence)
