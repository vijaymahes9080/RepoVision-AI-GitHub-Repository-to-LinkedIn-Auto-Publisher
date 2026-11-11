from __future__ import annotations

from cryptography.fernet import Fernet, InvalidToken

from app.config import settings
from app.core.errors import LinkedInNotConfigured


class TokenCipher:
    """Symmetric encryption for LinkedIn tokens at rest."""

    def __init__(self, key: str) -> None:
        try:
            self._fernet = Fernet(key.encode("utf-8"))
        except (ValueError, TypeError) as exc:
            raise LinkedInNotConfigured(
                "TOKEN_ENCRYPTION_KEY is not a valid Fernet key. Generate one with "
                'python -c "from cryptography.fernet import Fernet; '
                'print(Fernet.generate_key().decode())"'
            ) from exc

    def encrypt(self, value: str) -> str:
        return self._fernet.encrypt(value.encode("utf-8")).decode("utf-8")

    def decrypt(self, value: str) -> str:
        try:
            return self._fernet.decrypt(value.encode("utf-8")).decode("utf-8")
        except InvalidToken as exc:
            raise LinkedInNotConfigured(
                "Stored LinkedIn credentials cannot be decrypted with the configured "
                "TOKEN_ENCRYPTION_KEY. Reconnect LinkedIn after restoring the correct key."
            ) from exc


def get_cipher() -> TokenCipher:
    if not settings.token_encryption_key:
        raise LinkedInNotConfigured(
            "TOKEN_ENCRYPTION_KEY is required before LinkedIn OAuth can start. Generate one "
            'with python -c "from cryptography.fernet import Fernet; '
            'print(Fernet.generate_key().decode())"'
        )
    return TokenCipher(settings.token_encryption_key)
