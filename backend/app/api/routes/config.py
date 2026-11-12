from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.config import settings
from app.db import get_db
from app.schemas import CapabilityOut, ConfigStatusResponse, LinkedInPreflightResponse
from app.services import linkedin as linkedin_service

router = APIRouter(tags=["config"])

_LINKEDIN_SCOPES = ["openid", "profile", "w_member_social"]
_LINKEDIN_PRODUCTS = ["Sign In with LinkedIn using OpenID Connect", "Share on LinkedIn"]


def _capabilities(publishing_allowed: bool) -> list[CapabilityOut]:
    return [
        CapabilityOut(
            id="analysis",
            label="Repository analysis",
            enabled=True,
            reason="Static, evidence-first analysis of a public GitHub snapshot.",
        ),
        CapabilityOut(
            id="content",
            label="Grounded content drafts",
            enabled=True,
            reason="Drafts are generated from stored evidence and checked against it.",
        ),
        CapabilityOut(
            id="exports",
            label="PNG and PDF exports",
            enabled=True,
            reason="Generated locally in the browser from the rendered draft.",
        ),
        CapabilityOut(
            id="scheduler",
            label="Scheduling",
            enabled=False,
            reason=(
                "Scheduling is not implemented. It requires a durable job queue and is out of "
                "scope for this milestone."
            ),
        ),
        CapabilityOut(
            id="analytics",
            label="Engagement analytics",
            enabled=False,
            reason="Engagement analytics are not implemented and no LinkedIn data is collected.",
        ),
        CapabilityOut(
            id="linkedin_publishing",
            label="LinkedIn publishing",
            enabled=publishing_allowed,
            reason=(
                "Publishing is enabled. Every post still requires explicit confirmation."
                if publishing_allowed
                else (
                    "Member OAuth, encrypted token storage, image upload, and posting are wired up. "
                    "Set LINKEDIN_ENABLED=true and configure the LinkedIn app credentials to publish."
                )
            ),
        ),
    ]


def _llm_model() -> str | None:
    provider = settings.llm_provider.strip().lower()
    if provider in {"openai", "openai_compatible", "openai-compatible"}:
        return settings.openai_model
    if provider == "ollama":
        return settings.ollama_model
    if provider == "gemini":
        return settings.gemini_model
    if provider in {"grok", "xai"}:
        return settings.grok_model
    if provider == "groq":
        return settings.groq_model
    if provider == "openrouter":
        return settings.openrouter_model
    if provider == "deepseek":
        return settings.deepseek_model
    return None


@router.get("/config/status", response_model=ConfigStatusResponse)
def config_status(db: Session = Depends(get_db)) -> ConfigStatusResponse:
    linkedin_st = linkedin_service.get_status(db)
    is_publishing_enabled = settings.linkedin_publishing_allowed or linkedin_st["publishing_enabled"]
    is_configured = settings.linkedin_ready or linkedin_st["configured"]

    return ConfigStatusResponse(
        app_version=settings.app_version,
        environment=settings.app_env,
        database=settings.database_kind,
        github_token_configured=settings.github_token_configured,
        llm_provider=settings.llm_provider,
        llm_configured=settings.llm_configured,
        llm_model=_llm_model(),
        linkedin_configured=is_configured,
        linkedin_publishing_enabled=is_publishing_enabled,
        linkedin_required_scopes=_LINKEDIN_SCOPES,
        analysis_engine="deterministic-v1",
        cors_origins=settings.cors_origin_list,
        capabilities=_capabilities(is_publishing_enabled),
    )


@router.get("/linkedin/preflight", response_model=LinkedInPreflightResponse)
def linkedin_preflight() -> LinkedInPreflightResponse:
    return LinkedInPreflightResponse(
        configured=settings.linkedin_ready,
        publishing_enabled=settings.linkedin_publishing_allowed,
        required_scopes=_LINKEDIN_SCOPES,
        required_products=_LINKEDIN_PRODUCTS,
        steps=[
            "Create a LinkedIn developer app and associate it with a verified company page.",
            "Request Share on LinkedIn and Sign In with LinkedIn using OpenID Connect.",
            "Register an HTTPS callback that points to /api/v1/linkedin/oauth/callback.",
            "Set LINKEDIN_CLIENT_ID, LINKEDIN_CLIENT_SECRET, LINKEDIN_REDIRECT_URI, and "
            "TOKEN_ENCRYPTION_KEY on the server.",
            "Set LINKEDIN_ENABLED=true only after the app is approved.",
            "Connect the member account, review the draft and banner, then publish explicitly.",
        ],
        note=(
            "Tokens are encrypted at rest and never sent to the browser. Publishing re-runs the "
            "evidence verifier and refuses to report success without a LinkedIn API response."
        ),
    )
