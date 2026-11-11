from __future__ import annotations

from datetime import datetime
from typing import Any, Literal

from pydantic import BaseModel, Field


class RepoRef(BaseModel):
    owner: str
    name: str
    canonical_url: str


class RepositoryMetadata(BaseModel):
    owner: str
    name: str
    url: str
    description: str | None = None
    default_branch: str
    stars: int = 0
    forks: int = 0
    language: str | None = None
    license: str | None = None
    private: bool = False
    archived: bool = False
    size_kb: int = 0


class SnapshotInfo(BaseModel):
    commit_sha: str
    tree_sha: str
    branch: str
    file_count: int
    analyzed_file_count: int
    analyzed_bytes: int
    tree_truncated: bool = False
    fetched_at: datetime


class EvidenceOut(BaseModel):
    id: str
    path: str
    symbol: str | None = None
    excerpt: str
    line_start: int | None = None
    line_end: int | None = None
    category: str
    confidence: int = Field(ge=0, le=100)
    commit_sha: str


class TechOut(BaseModel):
    name: str
    category: Literal["Frontend", "Backend", "Database", "Cloud/DevOps", "AI/ML", "Tools"]
    confidence: int = Field(ge=0, le=100)
    inferred: bool = False
    evidence_ids: list[str] = Field(default_factory=list)


class FeatureOut(BaseModel):
    title: str
    description: str = ""
    evidence_ids: list[str] = Field(default_factory=list)


class ArchitectureComponent(BaseModel):
    name: str
    role: str
    evidence_ids: list[str] = Field(default_factory=list)


class ArchitectureOut(BaseModel):
    summary: str = ""
    components: list[ArchitectureComponent] = Field(default_factory=list)
    data_flow: list[str] = Field(default_factory=list)
    inferred: bool = True
    evidence_ids: list[str] = Field(default_factory=list)


class TestingOut(BaseModel):
    frameworks: list[str] = Field(default_factory=list)
    test_file_count: int = 0
    ci_systems: list[str] = Field(default_factory=list)
    evidence_ids: list[str] = Field(default_factory=list)
    limitations: list[str] = Field(default_factory=list)


class SecurityFinding(BaseModel):
    id: str
    category: str
    severity: Literal["low", "medium", "high"]
    title: str
    description: str
    path: str | None = None
    evidence_ids: list[str] = Field(default_factory=list)
    recommendation: str = ""


class DependencyScan(BaseModel):
    status: Literal["not_run", "completed", "failed"] = "not_run"
    reason: str
    vulnerabilities_found: int | None = None


class SecurityOut(BaseModel):
    findings: list[SecurityFinding] = Field(default_factory=list)
    license: str | None = None
    license_evidence_ids: list[str] = Field(default_factory=list)
    dependency_scan: DependencyScan
    scanned_files: int = 0
    limitations: list[str] = Field(default_factory=list)


class AnalysisSummary(BaseModel):
    description: str = ""
    problem_statement: str = ""
    solution: str = ""
    primary_language: str | None = None
    license: str | None = None


class AnalysisMetrics(BaseModel):
    file_count: int = 0
    analyzed_file_count: int = 0
    analyzed_bytes: int = 0
    tree_truncated: bool = False


class Provenance(BaseModel):
    analysis_engine: str = "deterministic-v1"
    llm_used: bool = False
    model: str | None = None


class AnalysisResult(BaseModel):
    run_id: str
    repo: RepositoryMetadata
    snapshot: SnapshotInfo
    summary: AnalysisSummary
    technologies: list[TechOut] = Field(default_factory=list)
    features: list[FeatureOut] = Field(default_factory=list)
    architecture: ArchitectureOut
    testing: TestingOut
    security: SecurityOut
    api_endpoints: list[str] = Field(default_factory=list)
    evidence: list[EvidenceOut] = Field(default_factory=list)
    limitations: list[str] = Field(default_factory=list)
    metrics: AnalysisMetrics
    provenance: Provenance


class AnalysisRunResponse(BaseModel):
    run_id: str
    status: Literal["queued", "running", "completed", "failed"]
    stage: str
    progress: int = Field(ge=0, le=100)
    repo_url: str
    owner: str
    name: str
    branch: str | None = None
    commit_sha: str | None = None
    created_at: datetime
    updated_at: datetime
    error: dict[str, Any] | None = None
    result: AnalysisResult | None = None


class AnalyzeRequest(BaseModel):
    repo_url: str = Field(min_length=10, max_length=500)
    branch: str | None = Field(default=None, max_length=200)


class AnalyzeStartResponse(BaseModel):
    run_id: str
    status: str
    status_url: str


class EvidenceListResponse(BaseModel):
    run_id: str
    evidence: list[EvidenceOut]


class ClaimOut(BaseModel):
    claim: str
    status: Literal["supported", "rejected", "unverified"]
    evidence_ids: list[str] = Field(default_factory=list)
    reason: str = ""


class VerificationOut(BaseModel):
    ok: bool
    claims: list[ClaimOut] = Field(default_factory=list)
    warnings: list[str] = Field(default_factory=list)


class ContentGenerateRequest(BaseModel):
    run_id: str
    style: Literal[
        "professional",
        "technical",
        "storytelling",
        "educational",
        "innovation",
        "career",
        "concise",
    ] = "professional"
    length: Literal["short", "medium", "long"] = "medium"


class ContentDraftResponse(BaseModel):
    id: str
    run_id: str
    style: str
    length: str
    status: str
    title: str
    body: str
    hooks: list[str] = Field(default_factory=list)
    hashtags: list[str] = Field(default_factory=list)
    cta: str
    claims: list[ClaimOut] = Field(default_factory=list)
    warnings: list[str] = Field(default_factory=list)
    generator: str
    model: str | None = None
    created_at: datetime


class VerifyRequest(BaseModel):
    run_id: str
    text: str = Field(min_length=1, max_length=20_000)


class ConfigStatusResponse(BaseModel):
    app_version: str
    environment: str
    database: str
    github_token_configured: bool
    llm_provider: str
    llm_configured: bool
    llm_model: str | None = None
    linkedin_configured: bool
    linkedin_publishing_enabled: bool = False
    linkedin_required_scopes: list[str] = Field(default_factory=list)
    analysis_engine: str
    cors_origins: list[str]
    capabilities: list["CapabilityOut"] = Field(default_factory=list)


class CapabilityOut(BaseModel):
    id: str
    label: str
    enabled: bool
    reason: str


class LinkedInPreflightResponse(BaseModel):
    configured: bool
    publishing_enabled: bool = False
    required_scopes: list[str] = Field(default_factory=list)
    required_products: list[str] = Field(default_factory=list)
    steps: list[str] = Field(default_factory=list)
    note: str = ""


class HealthResponse(BaseModel):
    status: str
    version: str
