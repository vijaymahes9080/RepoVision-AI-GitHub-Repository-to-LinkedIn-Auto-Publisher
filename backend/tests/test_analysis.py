from __future__ import annotations

from datetime import datetime, timezone

from app.schemas import RepositoryMetadata
from app.services.analysis.orchestrator import build_analysis_result
from app.services.github.snapshot import RepoSnapshot

README = """# Demo Project

A demo repository used to verify evidence-first extraction.

## Features

- Grounded repository analysis with evidence links
- Export drafts as PNG and PDF

## The Problem

Repository summaries often invent details that the code does not support.

## The Solution

This demo keeps statements tied to stored evidence.
"""

PACKAGE_JSON = """{
  "name": "demo",
  "private": true,
  "dependencies": {
    "react": "^18.3.1",
    "express": "^4.19.2"
  },
  "devDependencies": {
    "typescript": "^5.5.0",
    "vite": "^5.4.0",
    "vitest": "^2.0.0"
  }
}
"""

REQUIREMENTS = """fastapi>=0.115
uvicorn>=0.30
sqlalchemy>=2.0
psycopg[binary]>=3.2
pytest>=8.3
"""

APP_TSX = """import { useState } from "react";

router.get("/api/items", handler);
router.post("/api/items", handler);

export function App() {
  return <div dangerouslySetInnerHTML={{ __html: "<p>demo</p>" }} />;
}
"""

CONFIG_TS = 'export const apiKey = "sk-abcdefghijklmnopqrstuvwxyz123456";\n'

TEST_APP = """def test_demo():
    assert True
"""

CI_YML = """on:
  push:
    branches: [main]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - run: pytest
"""

LICENSE = """MIT License

Copyright (c) 2026 Demo

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction.
"""

BACKEND_MAIN = """from fastapi import FastAPI

app = FastAPI()

@app.get("/health")
def health():
    return {"status": "ok"}
"""


def make_snapshot() -> RepoSnapshot:
    files = {
        "README.md": README,
        "package.json": PACKAGE_JSON,
        "requirements.txt": REQUIREMENTS,
        "src/App.tsx": APP_TSX,
        "src/config.ts": CONFIG_TS,
        "tests/test_app.py": TEST_APP,
        ".github/workflows/ci.yml": CI_YML,
        "LICENSE": LICENSE,
        "backend/main.py": BACKEND_MAIN,
    }
    tree_paths = [
        *files.keys(),
        "node_modules/ignored/package.json",
        "dist/bundle.js",
    ]
    return RepoSnapshot(
        repo=RepositoryMetadata(
            owner="octo",
            name="demo",
            url="https://github.com/octo/demo",
            description="A demo repository for evidence-first analysis.",
            default_branch="main",
            stars=5,
            forks=2,
            language="TypeScript",
            license="MIT",
        ),
        commit_sha="a" * 40,
        tree_sha="b" * 40,
        branch="main",
        readme_path="README.md",
        readme_text=README,
        files=files,
        tree_paths=tree_paths,
        analyzed_bytes=sum(len(content) for content in files.values()),
        file_count=len(tree_paths),
        fetched_at=datetime.now(timezone.utc),
    )


def test_analysis_extracts_only_evidenced_signals():
    result = build_analysis_result("run-1", make_snapshot())

    technology_names = {technology.name for technology in result.technologies}
    assert {"React", "FastAPI", "PostgreSQL", "TypeScript", "Vitest", "pytest"} <= technology_names
    assert "Docker" not in technology_names

    assert len(result.features) >= 2
    assert all(feature.evidence_ids for feature in result.features)
    assert "evidence links" in result.features[0].title
    assert "GET /api/items" in result.api_endpoints
    assert "POST /api/items" in result.api_endpoints
    assert "GET /health" in result.api_endpoints

    assert result.security.license == "MIT"
    assert result.security.dependency_scan.status == "not_run"
    assert result.security.dependency_scan.vulnerabilities_found is None
    assert any(finding.category == "secret" for finding in result.security.findings)
    assert any(finding.category == "dangerous-html" for finding in result.security.findings)

    raw_secret = "sk-abcdefghijklmnopqrstuvwxyz123456"
    assert all(raw_secret not in item.excerpt for item in result.evidence)
    assert all(raw_secret not in finding.description for finding in result.security.findings)

    assert result.testing.test_file_count >= 1
    assert "pytest" in result.testing.frameworks
    assert "Vitest" in result.testing.frameworks
    assert "GitHub Actions" in result.testing.ci_systems

    # Metrics must come from the snapshot, never invented.
    assert result.metrics.file_count == len(make_snapshot().tree_paths)
    assert result.metrics.analyzed_file_count == len(make_snapshot().files)
    assert result.provenance.analysis_engine == "deterministic-v1"
    assert result.provenance.llm_used is False

    evidence_ids = {item.id for item in result.evidence}
    for technology in result.technologies:
        assert set(technology.evidence_ids) <= evidence_ids
    for feature in result.features:
        assert set(feature.evidence_ids) <= evidence_ids
    for finding in result.security.findings:
        assert set(finding.evidence_ids) <= evidence_ids

    assert result.summary.problem_statement.startswith("Repository summaries")
    assert result.summary.solution.startswith("This demo")
    assert result.architecture.inferred is True
    assert any("not executed" in limitation for limitation in result.limitations)
