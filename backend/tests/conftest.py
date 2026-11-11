from __future__ import annotations

import os

os.environ["DATABASE_URL"] = "sqlite://"
os.environ["LLM_PROVIDER"] = "none"
os.environ["APP_ENV"] = "test"
os.environ["GITHUB_TOKEN"] = ""
os.environ["LINKEDIN_CLIENT_ID"] = ""
os.environ["LINKEDIN_CLIENT_SECRET"] = ""
os.environ["LINKEDIN_REDIRECT_URI"] = ""
os.environ["LINKEDIN_ENABLED"] = "false"
os.environ["TOKEN_ENCRYPTION_KEY"] = ""

import pytest  # noqa: E402

from app.db import Base, engine  # noqa: E402


@pytest.fixture(autouse=True)
def clean_database():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture()
def client():
    from fastapi.testclient import TestClient

    from app.main import app

    with TestClient(app) as test_client:
        yield test_client
