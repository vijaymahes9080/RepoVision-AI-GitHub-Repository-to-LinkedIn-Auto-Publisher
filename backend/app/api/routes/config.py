from __future__ import annotations

from fastapi import APIRouter

from app.config import settings
from app.schemas import CapabilityOut, ConfigStatusResponse, LinkedInPreflightResponse

router = APIRouter(tags=["config"])

_LINKEDIN_SCOPES = ["openid", "profile", "w_member_social"]
_LINKEDIN_PRODUCTS = ["Sign In with LinkedIn using OpenID Connect", "Share on LinkedIn"]

_CAPABILITIES = [
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
        reason="Scheduling is not implemented in M1. It requires publishing access and a durable job queue.",
    ),
    CapabilityOut(
        id="analytics",
        label="Engagement analytics",
        enabled=False,
        reason="Engagement analytics are not implemented in M1 and no LinkedIn data is collected.",
    ),
    CapabilityOut(
        id="linkedin_publishing",
        label="LinkedIn publishing",
        enabled=False,
        reason=(
            "Publishing is not implemented in M1. Real posting requires a LinkedIn app with "
            "approved Share on LinkedIn access, an HTTPS callback, and member OAuth."
        ),
    ),
]


def _llm_model() -> str | None:
    provider = settings.llm_provider.strip().lower()
    if provider in {"openai", "openai_compatible", "openai-compatible"}:
        return settings.openai_model
    if provider == "ollama":
        return settings.ollama_model
    return None


@router.get("/config/status", response_model=ConfigStatusResponse)
def config_status() -> ConfigStatusResponse:
    return ConfigStatusResponse(
        app_version=settings.app_version,
        environment=settings.app_env,
        database=settings.database_kind,
        github_token_configured=settings.github_token_configured,
        llm_provider=settings.llm_provider,
        llm_configured=settings.llm_configured,
        llm_model=_llm_model(),
        linkedin_configured=settings.linkedin_configured,
        linkedin_publishing_enabled=False,
        linkedin_required_scopes=_LINKEDIN_SCOPES,
        analysis_engine="deterministic-v1",
        cors_origins=settings.cors_origin_list,
        capabilities=_CAPABILITIES,
    )


@router.get("/linkedin/preflight", response_model=LinkedInPreflightResponse)
def linkedin_preflight() -> LinkedInPreflightResponse:
    return LinkedInPreflightResponse(
        configured=settings.linkedin_configured,
        publishing_enabled=False,
        required_scopes=_LINKEDIN_SCOPES,
        required_products=_LINKEDIN_PRODUCTS,
        steps=[
            "Create a LinkedIn developer app and associate it with a company page.",
            "Request Share on LinkedIn and Sign In with LinkedIn using OpenID Connect.",
            "Register an HTTPS callback URL and store the client ID and secret server-side.",
            "Implement member OAuth with state and PKCE in M2.",
            "Add a manual review step before any post is published.",
            "Store the returned access token server-side; never send it to the browser.",
        ],
        note=(
            "M1 only reports configuration. It does not start OAuth, post to LinkedIn, or claim "
            "that a connection exists. Use the copy action to publish manually."
        ),
    )
