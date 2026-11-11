from __future__ import annotations

from urllib.parse import urlencode, urlparse

import httpx

from app.config import settings
from app.core.errors import (
    LinkedInOAuthError,
    LinkedInPublishFailed,
    LinkedInUnavailable,
)

LINKEDIN_SCOPES = ["openid", "profile", "w_member_social"]
_UPLOAD_HOST_SUFFIXES = (".licdn.com", ".linkedin.com")
_MAX_ERROR_CHARS = 300


def _safe_error_detail(response: httpx.Response) -> str:
    try:
        payload = response.json()
    except ValueError:
        return ""
    if isinstance(payload, dict):
        for key in ("message", "error_description", "error"):
            value = payload.get(key)
            if isinstance(value, str) and value.strip():
                return value.strip()[:_MAX_ERROR_CHARS]
    return ""


def _validate_upload_url(upload_url: str) -> str:
    parsed = urlparse(upload_url)
    host = (parsed.hostname or "").lower()
    if parsed.scheme != "https" or not any(
        host.endswith(suffix) for suffix in _UPLOAD_HOST_SUFFIXES
    ):
        raise LinkedInPublishFailed(
            "LinkedIn returned an untrusted image upload URL. The post was not created."
        )
    return upload_url


class LinkedInClient:
    """Minimal LinkedIn REST client using fixed LinkedIn hosts."""

    def __init__(self) -> None:
        self._timeout = httpx.Timeout(settings.linkedin_timeout_seconds)

    def build_authorization_url(self, *, state: str, code_challenge: str, redirect_uri: str) -> str:
        if not settings.linkedin_client_id:
            raise LinkedInOAuthError("LINKEDIN_CLIENT_ID is not configured.")
        params = {
            "response_type": "code",
            "client_id": settings.linkedin_client_id,
            "redirect_uri": redirect_uri,
            "state": state,
            "scope": " ".join(LINKEDIN_SCOPES),
            "code_challenge": code_challenge,
            "code_challenge_method": "S256",
        }
        return f"{settings.linkedin_oauth_base}/authorization?{urlencode(params)}"

    def _token_request(self, data: dict[str, str]) -> dict:
        try:
            with httpx.Client(timeout=self._timeout, follow_redirects=False) as client:
                response = client.post(
                    f"{settings.linkedin_oauth_base}/accessToken",
                    data=data,
                    headers={"Content-Type": "application/x-www-form-urlencoded"},
                )
        except httpx.RequestError as exc:
            raise LinkedInUnavailable(
                "The LinkedIn token endpoint could not be reached. Try again."
            ) from exc

        if response.status_code >= 400:
            detail = _safe_error_detail(response)
            raise LinkedInOAuthError(
                f"LinkedIn token exchange failed with HTTP {response.status_code}."
                + (f" {detail}" if detail else "")
            )
        try:
            payload = response.json()
        except ValueError as exc:
            raise LinkedInOAuthError("LinkedIn returned an unreadable token response.") from exc
        if not isinstance(payload, dict) or not payload.get("access_token"):
            raise LinkedInOAuthError("LinkedIn did not return an access token.")
        return payload

    def exchange_code(self, *, code: str, code_verifier: str, redirect_uri: str) -> dict:
        if not settings.linkedin_client_id or not settings.linkedin_client_secret:
            raise LinkedInOAuthError("LinkedIn client credentials are not configured.")
        return self._token_request(
            {
                "grant_type": "authorization_code",
                "code": code,
                "redirect_uri": redirect_uri,
                "client_id": settings.linkedin_client_id,
                "client_secret": settings.linkedin_client_secret,
                "code_verifier": code_verifier,
            }
        )

    def refresh_access_token(self, refresh_token: str) -> dict:
        if not settings.linkedin_client_id or not settings.linkedin_client_secret:
            raise LinkedInOAuthError("LinkedIn client credentials are not configured.")
        return self._token_request(
            {
                "grant_type": "refresh_token",
                "refresh_token": refresh_token,
                "client_id": settings.linkedin_client_id,
                "client_secret": settings.linkedin_client_secret,
            }
        )

    def _headers(self, access_token: str) -> dict[str, str]:
        return {
            "Authorization": f"Bearer {access_token}",
            "LinkedIn-Version": settings.linkedin_api_version,
            "X-Restli-Protocol-Version": "2.0.0",
            "Content-Type": "application/json",
        }

    def get_userinfo(self, access_token: str) -> dict:
        try:
            with httpx.Client(timeout=self._timeout, follow_redirects=False) as client:
                response = client.get(
                    f"{settings.linkedin_api_base}/v2/userinfo",
                    headers=self._headers(access_token),
                )
        except httpx.RequestError as exc:
            raise LinkedInUnavailable(
                "The LinkedIn profile endpoint could not be reached. Try again."
            ) from exc

        if response.status_code >= 400:
            detail = _safe_error_detail(response)
            raise LinkedInOAuthError(
                f"LinkedIn profile lookup failed with HTTP {response.status_code}."
                + (f" {detail}" if detail else "")
            )
        try:
            payload = response.json()
        except ValueError as exc:
            raise LinkedInOAuthError("LinkedIn returned an unreadable profile response.") from exc
        if not isinstance(payload, dict) or not payload.get("sub"):
            raise LinkedInOAuthError("LinkedIn did not return a member identifier.")
        return payload

    def initialize_image_upload(self, access_token: str, owner_urn: str) -> tuple[str, str]:
        try:
            with httpx.Client(timeout=self._timeout, follow_redirects=False) as client:
                response = client.post(
                    f"{settings.linkedin_api_base}/rest/images?action=initializeUpload",
                    headers=self._headers(access_token),
                    json={"initializeUploadRequest": {"owner": owner_urn}},
                )
        except httpx.RequestError as exc:
            raise LinkedInUnavailable(
                "The LinkedIn image upload endpoint could not be reached. Try again."
            ) from exc

        if response.status_code >= 400:
            detail = _safe_error_detail(response)
            raise LinkedInPublishFailed(
                f"LinkedIn image initialization failed with HTTP {response.status_code}."
                + (f" {detail}" if detail else "")
            )
        try:
            payload = response.json()
        except ValueError as exc:
            raise LinkedInPublishFailed(
                "LinkedIn returned an unreadable image upload response."
            ) from exc
        value = payload.get("value") if isinstance(payload, dict) else None
        if not isinstance(value, dict):
            raise LinkedInPublishFailed("LinkedIn did not return an upload URL.")
        upload_url = value.get("uploadUrl")
        image_urn = value.get("image")
        if not isinstance(upload_url, str) or not isinstance(image_urn, str):
            raise LinkedInPublishFailed("LinkedIn did not return an upload URL and image URN.")
        return _validate_upload_url(upload_url), image_urn

    def upload_image(self, upload_url: str, png_bytes: bytes) -> None:
        _validate_upload_url(upload_url)
        try:
            with httpx.Client(timeout=self._timeout, follow_redirects=False) as client:
                response = client.put(
                    upload_url,
                    content=png_bytes,
                    headers={"Content-Type": "image/png"},
                )
        except httpx.RequestError as exc:
            raise LinkedInUnavailable(
                "The LinkedIn media upload could not be reached. Try again."
            ) from exc
        if response.status_code >= 400:
            detail = _safe_error_detail(response)
            raise LinkedInPublishFailed(
                f"LinkedIn media upload failed with HTTP {response.status_code}."
                + (f" {detail}" if detail else "")
            )

    def create_post(
        self,
        *,
        access_token: str,
        owner_urn: str,
        commentary: str,
        image_urn: str | None,
    ) -> str | None:
        payload: dict = {
            "author": owner_urn,
            "commentary": commentary,
            "visibility": "PUBLIC",
            "distribution": {
                "feedDistribution": "MAIN_FEED",
                "targetEntities": [],
                "thirdPartyDistributionChannels": [],
            },
            "lifecycleState": "PUBLISHED",
            "isReshareDisabledByAuthor": False,
        }
        if image_urn:
            payload["content"] = {"media": {"id": image_urn}}

        try:
            with httpx.Client(timeout=self._timeout, follow_redirects=False) as client:
                response = client.post(
                    f"{settings.linkedin_api_base}/rest/posts",
                    headers=self._headers(access_token),
                    json=payload,
                )
        except httpx.RequestError as exc:
            raise LinkedInUnavailable(
                "The LinkedIn publishing endpoint could not be reached. The post may not exist; "
                "check LinkedIn before retrying."
            ) from exc

        if response.status_code >= 400:
            detail = _safe_error_detail(response)
            raise LinkedInPublishFailed(
                f"LinkedIn rejected the post with HTTP {response.status_code}."
                + (f" {detail}" if detail else "")
            )
        return response.headers.get("x-restli-id") or response.headers.get("X-Restli-Id")
