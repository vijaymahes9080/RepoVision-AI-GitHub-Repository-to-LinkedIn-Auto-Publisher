from __future__ import annotations

from typing import Any


class AppError(Exception):
    """Application error with a stable machine-readable code."""

    code = "APP_ERROR"
    status_code = 500

    def __init__(
        self,
        message: str,
        *,
        code: str | None = None,
        status_code: int | None = None,
        details: dict[str, Any] | None = None,
    ) -> None:
        super().__init__(message)
        self.message = message
        if code is not None:
            self.code = code
        if status_code is not None:
            self.status_code = status_code
        self.details = details or {}

    def to_dict(self) -> dict[str, Any]:
        payload: dict[str, Any] = {"code": self.code, "message": self.message}
        if self.details:
            payload["details"] = self.details
        return payload


class InvalidRepositoryUrl(AppError):
    code = "INVALID_REPOSITORY_URL"
    status_code = 422


class RepositoryNotFound(AppError):
    code = "REPOSITORY_NOT_FOUND"
    status_code = 404


class RepositoryPrivate(AppError):
    code = "REPOSITORY_PRIVATE"
    status_code = 403


class BranchNotFound(AppError):
    code = "BRANCH_NOT_FOUND"
    status_code = 404


class GitHubRateLimited(AppError):
    code = "GITHUB_RATE_LIMITED"
    status_code = 429


class GitHubUnavailable(AppError):
    code = "GITHUB_UNAVAILABLE"
    status_code = 502


class AnalysisNotFound(AppError):
    code = "ANALYSIS_NOT_FOUND"
    status_code = 404


class AnalysisNotReady(AppError):
    code = "ANALYSIS_NOT_READY"
    status_code = 409


class AnalysisFailed(AppError):
    code = "ANALYSIS_FAILED"
    status_code = 422


class InsufficientEvidence(AppError):
    code = "INSUFFICIENT_EVIDENCE"
    status_code = 422


class ContentNotFound(AppError):
    code = "CONTENT_NOT_FOUND"
    status_code = 404


class ContentVerificationFailed(AppError):
    code = "CONTENT_VERIFICATION_FAILED"
    status_code = 422


class LLMUnavailable(AppError):
    code = "LLM_UNAVAILABLE"
    status_code = 503


class LinkedInNotConfigured(AppError):
    code = "LINKEDIN_NOT_CONFIGURED"
    status_code = 503


class LinkedInPublishingDisabled(AppError):
    code = "LINKEDIN_PUBLISHING_DISABLED"
    status_code = 503


class LinkedInNotConnected(AppError):
    code = "LINKEDIN_NOT_CONNECTED"
    status_code = 409


class LinkedInOAuthError(AppError):
    code = "LINKEDIN_OAUTH_ERROR"
    status_code = 400


class LinkedInPublishConfirmationRequired(AppError):
    code = "PUBLISH_CONFIRMATION_REQUIRED"
    status_code = 422


class LinkedInPublishFailed(AppError):
    code = "LINKEDIN_PUBLISH_FAILED"
    status_code = 502


class LinkedInUnavailable(AppError):
    code = "LINKEDIN_UNAVAILABLE"
    status_code = 502
