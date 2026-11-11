from __future__ import annotations

import logging
from datetime import datetime, timezone

from sqlalchemy.orm import Session

from app.config import settings
from app.core.errors import AppError
from app.db import SessionLocal
from app.models import AnalysisRun, EvidenceItem
from app.schemas import (
    AnalysisMetrics,
    AnalysisResult,
    AnalysisSummary,
    EvidenceOut,
    Provenance,
    SnapshotInfo,
)
from app.services.analysis.architecture import analyze_architecture
from app.services.analysis.evidence import EvidenceCollector
from app.services.analysis.features import (
    extract_api_endpoints,
    extract_features,
    extract_problem_and_solution,
)
from app.services.analysis.security import analyze_security
from app.services.analysis.stack import detect_technologies
from app.services.analysis.testing import analyze_testing
from app.services.github.snapshot import RepoSnapshot, build_snapshot

logger = logging.getLogger(__name__)


def _update(
    db: Session,
    run: AnalysisRun,
    *,
    stage: str,
    progress: int,
    status: str | None = None,
) -> None:
    run.stage = stage
    run.progress = max(0, min(100, progress))
    if status:
        run.status = status
    run.updated_at = datetime.now(timezone.utc)
    db.commit()


def build_analysis_result(run_id: str, snapshot: RepoSnapshot) -> AnalysisResult:
    collector = EvidenceCollector(snapshot.commit_sha)

    technologies = detect_technologies(
        files=snapshot.files,
        tree_paths=snapshot.tree_paths,
        readme_text=snapshot.readme_text,
        readme_path=snapshot.readme_path,
        collector=collector,
    )

    features = extract_features(
        readme=snapshot.readme_text,
        readme_path=snapshot.readme_path or "README.md",
        collector=collector,
    )

    description, problem, solution = extract_problem_and_solution(
        readme=snapshot.readme_text,
        readme_path=snapshot.readme_path or "README.md",
        collector=collector,
    )

    api_endpoints = extract_api_endpoints(files=snapshot.files, collector=collector)

    testing = analyze_testing(
        tree_paths=snapshot.tree_paths,
        files=snapshot.files,
        technologies=technologies,
        collector=collector,
    )

    security = analyze_security(
        repo_license=snapshot.repo.license,
        files=snapshot.files,
        tree_paths=snapshot.tree_paths,
        collector=collector,
    )

    architecture = analyze_architecture(
        technologies=technologies,
        tree_paths=snapshot.tree_paths,
    )

    limitations = list(snapshot.limitations)
    limitations.extend(testing.limitations)
    limitations.extend(security.limitations)
    limitations.append(
        "Repository code was not executed, built, or tested. Findings describe the static "
        "snapshot only."
    )
    if not snapshot.readme_text:
        limitations.append(
            "No README text was available, so feature and problem/solution extraction is empty."
        )

    summary = AnalysisSummary(
        description=snapshot.repo.description or description,
        problem_statement=problem,
        solution=solution,
        primary_language=snapshot.repo.language,
        license=security.license or snapshot.repo.license,
    )

    return AnalysisResult(
        run_id=run_id,
        repo=snapshot.repo,
        snapshot=SnapshotInfo(
            commit_sha=snapshot.commit_sha,
            tree_sha=snapshot.tree_sha,
            branch=snapshot.branch,
            file_count=snapshot.file_count,
            analyzed_file_count=snapshot.analyzed_file_count,
            analyzed_bytes=snapshot.analyzed_bytes,
            tree_truncated=snapshot.tree_truncated,
            fetched_at=snapshot.fetched_at,
        ),
        summary=summary,
        technologies=technologies,
        features=features,
        architecture=architecture,
        testing=testing,
        security=security,
        api_endpoints=api_endpoints,
        evidence=collector.items,
        limitations=list(dict.fromkeys(limitations)),
        metrics=AnalysisMetrics(
            file_count=snapshot.file_count,
            analyzed_file_count=snapshot.analyzed_file_count,
            analyzed_bytes=snapshot.analyzed_bytes,
            tree_truncated=snapshot.tree_truncated,
        ),
        provenance=Provenance(
            analysis_engine="deterministic-v1",
            llm_used=False,
            model=None,
        ),
    )


def _persist_evidence(db: Session, run_id: str, evidence: list[EvidenceOut]) -> None:
    db.query(EvidenceItem).filter(EvidenceItem.run_id == run_id).delete()
    for item in evidence:
        db.add(
            EvidenceItem(
                run_id=run_id,
                path=item.path,
                symbol=item.symbol,
                excerpt=item.excerpt,
                line_start=item.line_start,
                line_end=item.line_end,
                category=item.category,
                confidence=item.confidence,
                commit_sha=item.commit_sha,
            )
        )


def run_analysis(run_id: str) -> None:
    """Execute an analysis run. Safe to call from a background worker."""

    db = SessionLocal()
    try:
        run = db.get(AnalysisRun, run_id)
        if run is None:
            logger.warning("Analysis run %s disappeared before execution", run_id)
            return

        run.status = "running"
        run.error_code = None
        run.error_message = None
        run.result_json = None
        _update(db, run, stage="Fetching repository snapshot", progress=10)

        try:
            snapshot = build_snapshot(run.repo_url, run.branch)
            run.commit_sha = snapshot.commit_sha
            run.default_branch = snapshot.repo.default_branch
            run.branch = snapshot.branch
            _update(db, run, stage="Extracting evidence", progress=45)

            result = build_analysis_result(run_id, snapshot)
            _update(db, run, stage="Verifying limitations", progress=85)

            _persist_evidence(db, run_id, result.evidence)
            run.result_json = result.model_dump(mode="json")
            run.status = "completed"
            run.stage = "Completed"
            run.progress = 100
            run.updated_at = datetime.now(timezone.utc)
            db.commit()
        except AppError as exc:
            run.status = "failed"
            run.stage = "Failed"
            run.error_code = exc.code
            run.error_message = exc.message
            run.updated_at = datetime.now(timezone.utc)
            db.commit()
            logger.info("Analysis run %s failed: %s", run_id, exc.code)
        except Exception:
            run.status = "failed"
            run.stage = "Failed"
            run.error_code = "INTERNAL_ERROR"
            run.error_message = (
                "The analysis failed unexpectedly. Check server logs for diagnostic details."
            )
            run.updated_at = datetime.now(timezone.utc)
            db.commit()
            logger.exception("Analysis run %s failed unexpectedly", run_id)
    finally:
        db.close()


def enqueue_snapshot_analysis(run: AnalysisRun) -> None:
    """Placeholder hook kept explicit: M1 runs the analysis in a FastAPI background task.

    A production deployment should replace this with a durable queue such as Celery or RQ.
    """

    if settings.app_env == "production":
        logger.info("Running analysis %s in-process; a durable queue is not configured.", run.id)
