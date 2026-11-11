from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import Any

from sqlalchemy import JSON, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db import Base


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


def new_id() -> str:
    return str(uuid.uuid4())


class AnalysisRun(Base):
    __tablename__ = "analysis_runs"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    repo_url: Mapped[str] = mapped_column(String(500), nullable=False)
    owner: Mapped[str] = mapped_column(String(120), nullable=False)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    branch: Mapped[str | None] = mapped_column(String(200), nullable=True)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="queued", index=True)
    stage: Mapped[str] = mapped_column(String(80), nullable=False, default="Queued")
    progress: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    error_code: Mapped[str | None] = mapped_column(String(80), nullable=True)
    error_message: Mapped[str | None] = mapped_column(Text, nullable=True)
    commit_sha: Mapped[str | None] = mapped_column(String(64), nullable=True)
    default_branch: Mapped[str | None] = mapped_column(String(200), nullable=True)
    result_json: Mapped[dict[str, Any] | None] = mapped_column(JSON, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utcnow, onupdate=utcnow
    )

    evidence: Mapped[list["EvidenceItem"]] = relationship(
        back_populates="run", cascade="all, delete-orphan"
    )
    drafts: Mapped[list["ContentDraft"]] = relationship(
        back_populates="run", cascade="all, delete-orphan"
    )


class EvidenceItem(Base):
    __tablename__ = "evidence_items"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    run_id: Mapped[str] = mapped_column(
        ForeignKey("analysis_runs.id", ondelete="CASCADE"), nullable=False, index=True
    )
    path: Mapped[str] = mapped_column(String(500), nullable=False)
    symbol: Mapped[str | None] = mapped_column(String(200), nullable=True)
    excerpt: Mapped[str] = mapped_column(Text, nullable=False)
    line_start: Mapped[int | None] = mapped_column(Integer, nullable=True)
    line_end: Mapped[int | None] = mapped_column(Integer, nullable=True)
    category: Mapped[str] = mapped_column(String(60), nullable=False, index=True)
    confidence: Mapped[int] = mapped_column(Integer, nullable=False, default=80)
    commit_sha: Mapped[str] = mapped_column(String(64), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)

    run: Mapped[AnalysisRun] = relationship(back_populates="evidence")


class ContentDraft(Base):
    __tablename__ = "content_drafts"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    run_id: Mapped[str] = mapped_column(
        ForeignKey("analysis_runs.id", ondelete="CASCADE"), nullable=False, index=True
    )
    style: Mapped[str] = mapped_column(String(40), nullable=False)
    length: Mapped[str] = mapped_column(String(20), nullable=False)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="ready")
    title: Mapped[str] = mapped_column(String(300), nullable=False)
    body: Mapped[str] = mapped_column(Text, nullable=False)
    hooks: Mapped[list[str]] = mapped_column(JSON, nullable=False, default=list)
    hashtags: Mapped[list[str]] = mapped_column(JSON, nullable=False, default=list)
    cta: Mapped[str] = mapped_column(Text, nullable=False, default="")
    claims: Mapped[list[dict[str, Any]]] = mapped_column(JSON, nullable=False, default=list)
    warnings: Mapped[list[str]] = mapped_column(JSON, nullable=False, default=list)
    generator: Mapped[str] = mapped_column(String(40), nullable=False, default="rule_based")
    model: Mapped[str | None] = mapped_column(String(120), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)

    run: Mapped[AnalysisRun] = relationship(back_populates="drafts")
    fact_checks: Mapped[list["FactCheck"]] = relationship(
        back_populates="draft", cascade="all, delete-orphan"
    )


class FactCheck(Base):
    __tablename__ = "fact_checks"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    draft_id: Mapped[str] = mapped_column(
        ForeignKey("content_drafts.id", ondelete="CASCADE"), nullable=False, index=True
    )
    claim_text: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[str] = mapped_column(String(20), nullable=False)
    evidence_ids: Mapped[list[str]] = mapped_column(JSON, nullable=False, default=list)
    reason: Mapped[str] = mapped_column(Text, nullable=False, default="")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)

    draft: Mapped[ContentDraft] = relationship(back_populates="fact_checks")


class LinkedInAccount(Base):
    """A single LinkedIn member connection. Token values are always encrypted."""

    __tablename__ = "linkedin_accounts"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    member_sub: Mapped[str] = mapped_column(String(200), nullable=False, unique=True, index=True)
    member_name: Mapped[str] = mapped_column(String(300), nullable=False, default="")
    member_picture: Mapped[str | None] = mapped_column(Text, nullable=True)
    access_token_encrypted: Mapped[str] = mapped_column(Text, nullable=False)
    refresh_token_encrypted: Mapped[str | None] = mapped_column(Text, nullable=True)
    scopes: Mapped[str] = mapped_column(String(300), nullable=False, default="")
    expires_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    connected_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utcnow, onupdate=utcnow
    )


class LinkedInOAuthState(Base):
    """Short-lived OAuth state and PKCE verifier for one authorization attempt."""

    __tablename__ = "linkedin_oauth_states"

    state: Mapped[str] = mapped_column(String(200), primary_key=True)
    code_verifier_encrypted: Mapped[str] = mapped_column(Text, nullable=False)
    redirect_uri: Mapped[str] = mapped_column(String(500), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    used_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)


class LinkedInPublishAttempt(Base):
    """Audit record for every attempted post. Never stores access tokens."""

    __tablename__ = "linkedin_publish_attempts"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    draft_id: Mapped[str | None] = mapped_column(
        ForeignKey("content_drafts.id", ondelete="SET NULL"), nullable=True, index=True
    )
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="pending", index=True)
    commentary: Mapped[str] = mapped_column(Text, nullable=False, default="")
    has_image: Mapped[bool] = mapped_column(nullable=False, default=False)
    image_urn: Mapped[str | None] = mapped_column(String(300), nullable=True)
    post_urn: Mapped[str | None] = mapped_column(String(300), nullable=True)
    error_code: Mapped[str | None] = mapped_column(String(80), nullable=True)
    error_message: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utcnow, onupdate=utcnow
    )
