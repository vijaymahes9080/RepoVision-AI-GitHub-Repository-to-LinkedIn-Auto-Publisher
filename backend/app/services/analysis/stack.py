from __future__ import annotations

import json
import re
import tomllib
from dataclasses import dataclass, field
from pathlib import PurePosixPath

from app.schemas import TechOut
from app.services.analysis.evidence import EvidenceCollector

TechCategory = str

_JS_MAP: dict[str, tuple[str, TechCategory, int]] = {
    "react": ("React", "Frontend", 98),
    "react-dom": ("React", "Frontend", 98),
    "next": ("Next.js", "Frontend", 98),
    "vue": ("Vue.js", "Frontend", 98),
    "@angular/core": ("Angular", "Frontend", 98),
    "svelte": ("Svelte", "Frontend", 96),
    "solid-js": ("SolidJS", "Frontend", 94),
    "electron": ("Electron", "Frontend", 95),
    "express": ("Express", "Backend", 98),
    "fastify": ("Fastify", "Backend", 96),
    "koa": ("Koa", "Backend", 94),
    "@nestjs/core": ("NestJS", "Backend", 97),
    "typescript": ("TypeScript", "Tools", 98),
    "tailwindcss": ("Tailwind CSS", "Frontend", 96),
    "vite": ("Vite", "Tools", 96),
    "webpack": ("Webpack", "Tools", 90),
    "prisma": ("Prisma", "Database", 96),
    "@prisma/client": ("Prisma", "Database", 96),
    "mongoose": ("MongoDB", "Database", 95),
    "pg": ("PostgreSQL", "Database", 95),
    "mysql2": ("MySQL", "Database", 94),
    "redis": ("Redis", "Database", 95),
    "ioredis": ("Redis", "Database", 95),
    "sqlite3": ("SQLite", "Database", 94),
    "better-sqlite3": ("SQLite", "Database", 94),
    "openai": ("OpenAI API", "AI/ML", 96),
    "@anthropic-ai/sdk": ("Anthropic API", "AI/ML", 95),
    "langchain": ("LangChain", "AI/ML", 96),
    "@langchain/core": ("LangChain", "AI/ML", 96),
    "ollama": ("Ollama", "AI/ML", 94),
    "aws-sdk": ("AWS SDK", "Cloud/DevOps", 94),
    "graphql": ("GraphQL", "Backend", 92),
    "socket.io": ("Socket.IO", "Backend", 92),
    "jest": ("Jest", "Tools", 94),
    "vitest": ("Vitest", "Tools", 94),
    "playwright": ("Playwright", "Tools", 94),
    "@playwright/test": ("Playwright", "Tools", 94),
    "cypress": ("Cypress", "Tools", 94),
    "eslint": ("ESLint", "Tools", 90),
    "prettier": ("Prettier", "Tools", 88),
    "dockerode": ("Docker", "Cloud/DevOps", 92),
}

_PY_MAP: dict[str, tuple[str, TechCategory, int]] = {
    "fastapi": ("FastAPI", "Backend", 98),
    "django": ("Django", "Backend", 98),
    "flask": ("Flask", "Backend", 96),
    "starlette": ("Starlette", "Backend", 94),
    "uvicorn": ("Uvicorn", "Backend", 92),
    "gunicorn": ("Gunicorn", "Backend", 90),
    "sqlalchemy": ("SQLAlchemy", "Database", 96),
    "alembic": ("Alembic", "Database", 90),
    "psycopg2": ("PostgreSQL", "Database", 95),
    "psycopg2-binary": ("PostgreSQL", "Database", 95),
    "psycopg": ("PostgreSQL", "Database", 95),
    "asyncpg": ("PostgreSQL", "Database", 95),
    "redis": ("Redis", "Database", 95),
    "pymongo": ("MongoDB", "Database", 94),
    "pydantic": ("Pydantic", "Backend", 94),
    "celery": ("Celery", "Backend", 92),
    "httpx": ("httpx", "Backend", 88),
    "openai": ("OpenAI API", "AI/ML", 96),
    "anthropic": ("Anthropic API", "AI/ML", 95),
    "langchain": ("LangChain", "AI/ML", 96),
    "transformers": ("Hugging Face Transformers", "AI/ML", 95),
    "torch": ("PyTorch", "AI/ML", 96),
    "tensorflow": ("TensorFlow", "AI/ML", 96),
    "scikit-learn": ("scikit-learn", "AI/ML", 94),
    "pandas": ("pandas", "AI/ML", 90),
    "numpy": ("NumPy", "AI/ML", 90),
    "streamlit": ("Streamlit", "Frontend", 94),
    "gradio": ("Gradio", "Frontend", 94),
    "pytest": ("pytest", "Tools", 94),
    "ruff": ("Ruff", "Tools", 90),
    "mypy": ("mypy", "Tools", 88),
}

_GO_MAP: dict[str, tuple[str, TechCategory, int]] = {
    "github.com/gin-gonic/gin": ("Gin", "Backend", 96),
    "github.com/labstack/echo": ("Echo", "Backend", 95),
    "github.com/gofiber/fiber": ("Fiber", "Backend", 95),
    "gorm.io/gorm": ("GORM", "Database", 94),
    "github.com/jackc/pgx": ("PostgreSQL", "Database", 94),
    "github.com/redis/go-redis": ("Redis", "Database", 94),
    "github.com/stretchr/testify": ("Testify", "Tools", 90),
}

_RUST_MAP: dict[str, tuple[str, TechCategory, int]] = {
    "actix-web": ("Actix Web", "Backend", 95),
    "axum": ("Axum", "Backend", 95),
    "rocket": ("Rocket", "Backend", 94),
    "tokio": ("Tokio", "Backend", 92),
    "sqlx": ("SQLx", "Database", 92),
    "diesel": ("Diesel", "Database", 92),
    "serde": ("Serde", "Tools", 88),
}

_README_NAMES: dict[str, tuple[str, TechCategory]] = {
    "react": ("React", "Frontend"),
    "next.js": ("Next.js", "Frontend"),
    "vue": ("Vue.js", "Frontend"),
    "angular": ("Angular", "Frontend"),
    "svelte": ("Svelte", "Frontend"),
    "fastapi": ("FastAPI", "Backend"),
    "django": ("Django", "Backend"),
    "flask": ("Flask", "Backend"),
    "express": ("Express", "Backend"),
    "nestjs": ("NestJS", "Backend"),
    "postgresql": ("PostgreSQL", "Database"),
    "postgres": ("PostgreSQL", "Database"),
    "mongodb": ("MongoDB", "Database"),
    "redis": ("Redis", "Database"),
    "docker": ("Docker", "Cloud/DevOps"),
    "kubernetes": ("Kubernetes", "Cloud/DevOps"),
    "langchain": ("LangChain", "AI/ML"),
    "openai": ("OpenAI API", "AI/ML"),
    "ollama": ("Ollama", "AI/ML"),
    "pytorch": ("PyTorch", "AI/ML"),
    "tensorflow": ("TensorFlow", "AI/ML"),
}


KNOWN_TECHNOLOGY_NAMES: list[str] = sorted(
    {
        value[0]
        for mapping in (_JS_MAP, _PY_MAP, _GO_MAP, _RUST_MAP, _README_NAMES)
        for value in mapping.values()
    },
    key=len,
    reverse=True,
)


@dataclass
class TechAccumulator:
    items: dict[str, TechOut] = field(default_factory=dict)

    def add(
        self,
        name: str,
        category: TechCategory,
        confidence: int,
        evidence_id: str | None,
        *,
        inferred: bool = False,
    ) -> None:
        existing = self.items.get(name)
        if existing:
            existing.confidence = max(existing.confidence, confidence)
            existing.inferred = existing.inferred and inferred
            if evidence_id and evidence_id not in existing.evidence_ids:
                existing.evidence_ids.append(evidence_id)
            return
        self.items[name] = TechOut(
            name=name,
            category=category,  # type: ignore[arg-type]
            confidence=confidence,
            inferred=inferred,
            evidence_ids=[evidence_id] if evidence_id else [],
        )

    def as_list(self) -> list[TechOut]:
        return sorted(
            self.items.values(),
            key=lambda item: (-item.confidence, item.name.lower()),
        )


def _line_for(content: str, needle: str) -> str | None:
    for line in content.splitlines():
        if needle in line:
            return line.strip()
    return None


def _add_dependency(
    collector: EvidenceCollector,
    accumulator: TechAccumulator,
    *,
    path: str,
    content: str,
    package: str,
    mapping: dict[str, tuple[str, TechCategory, int]],
    category: str = "dependency",
) -> None:
    key = package.lower()
    mapped = mapping.get(key)
    if not mapped:
        if key.startswith("@aws-sdk/"):
            mapped = ("AWS SDK", "Cloud/DevOps", 94)
        else:
            return
    name, tech_category, confidence = mapped
    excerpt = _line_for(content, package) or f"{package} dependency detected"
    evidence_id = collector.add(
        path=path,
        excerpt=excerpt,
        category=category,
        confidence=confidence,
        content=content,
    )
    accumulator.add(name, tech_category, confidence, evidence_id)


def _detect_package_json(
    path: str, content: str, collector: EvidenceCollector, acc: TechAccumulator
) -> None:
    try:
        data = json.loads(content)
    except json.JSONDecodeError:
        collector.add(
            path=path,
            excerpt="package.json could not be parsed as JSON.",
            category="limitation",
            confidence=95,
        )
        return
    if not isinstance(data, dict):
        return
    if "package.json" == PurePosixPath(path).name:
        collector.add(
            path=path,
            excerpt='Package manifest detected: "package.json".',
            category="manifest",
            confidence=95,
        )
    for section in (
        "dependencies",
        "devDependencies",
        "peerDependencies",
        "optionalDependencies",
    ):
        deps = data.get(section)
        if not isinstance(deps, dict):
            continue
        for package in deps:
            _add_dependency(
                collector,
                acc,
                path=path,
                content=content,
                package=str(package),
                mapping=_JS_MAP,
            )


def _detect_requirements(
    path: str, content: str, collector: EvidenceCollector, acc: TechAccumulator
) -> None:
    for line in content.splitlines():
        stripped = line.strip()
        if not stripped or stripped.startswith("#") or stripped.startswith("-"):
            continue
        match = re.match(r"^([A-Za-z0-9_.-]+)", stripped)
        if not match:
            continue
        _add_dependency(
            collector,
            acc,
            path=path,
            content=content,
            package=match.group(1),
            mapping=_PY_MAP,
        )


def _iter_pyproject_deps(data: dict) -> list[str]:
    deps: list[str] = []
    project = data.get("project")
    if isinstance(project, dict):
        for item in project.get("dependencies") or []:
            if isinstance(item, str):
                deps.append(item)
        optional = project.get("optional-dependencies")
        if isinstance(optional, dict):
            for group in optional.values():
                if isinstance(group, list):
                    deps.extend(item for item in group if isinstance(item, str))
    poetry = data.get("tool", {}).get("poetry", {})
    if isinstance(poetry, dict):
        for section in ("dependencies", "dev-dependencies"):
            values = poetry.get(section)
            if isinstance(values, dict):
                deps.extend(str(name) for name in values if str(name).lower() != "python")
        groups = poetry.get("group")
        if isinstance(groups, dict):
            for group in groups.values():
                if isinstance(group, dict) and isinstance(group.get("dependencies"), dict):
                    deps.extend(str(name) for name in group["dependencies"])
    return deps


def _detect_pyproject(
    path: str, content: str, collector: EvidenceCollector, acc: TechAccumulator
) -> None:
    try:
        data = tomllib.loads(content)
    except tomllib.TOMLDecodeError:
        collector.add(
            path=path,
            excerpt="pyproject.toml could not be parsed as TOML.",
            category="limitation",
            confidence=95,
        )
        return
    for spec in _iter_pyproject_deps(data):
        name_match = re.match(r"^([A-Za-z0-9_.-]+)", spec.strip())
        if not name_match:
            continue
        _add_dependency(
            collector,
            acc,
            path=path,
            content=content,
            package=name_match.group(1),
            mapping=_PY_MAP,
        )


def _detect_go_mod(
    path: str, content: str, collector: EvidenceCollector, acc: TechAccumulator
) -> None:
    for line in content.splitlines():
        stripped = line.strip()
        match = re.match(r"^([A-Za-z0-9_.\-/]+)\s+v[0-9]", stripped)
        if not match:
            match = re.match(r"^require\s+([A-Za-z0-9_.\-/]+)\s+v[0-9]", stripped)
        if not match:
            continue
        package = match.group(1)
        for key, mapped in _GO_MAP.items():
            if package == key or package.startswith(key + "/"):
                name, category, confidence = mapped
                evidence_id = collector.add(
                    path=path,
                    excerpt=stripped,
                    category="dependency",
                    confidence=confidence,
                    content=content,
                )
                acc.add(name, category, confidence, evidence_id)


def _detect_cargo(
    path: str, content: str, collector: EvidenceCollector, acc: TechAccumulator
) -> None:
    try:
        data = tomllib.loads(content)
    except tomllib.TOMLDecodeError:
        return
    for section in ("dependencies", "dev-dependencies", "build-dependencies"):
        deps = data.get(section)
        if not isinstance(deps, dict):
            continue
        for package in deps:
            mapped = _RUST_MAP.get(str(package).lower())
            if not mapped:
                continue
            name, category, confidence = mapped
            evidence_id = collector.add(
                path=path,
                excerpt=_line_for(content, str(package)) or f"{package} dependency detected",
                category="dependency",
                confidence=confidence,
                content=content,
            )
            acc.add(name, category, confidence, evidence_id)


def _detect_docker(
    files: dict[str, str], collector: EvidenceCollector, acc: TechAccumulator
) -> None:
    for path, content in files.items():
        name = PurePosixPath(path).name.lower()
        if name == "dockerfile" or name.startswith("dockerfile."):
            evidence_id = collector.add(
                path=path,
                excerpt=_line_for(content, "FROM") or "Dockerfile detected",
                category="configuration",
                confidence=95,
                content=content,
            )
            acc.add("Docker", "Cloud/DevOps", 95, evidence_id)
        if name in {"docker-compose.yml", "docker-compose.yaml"}:
            for image in ("postgres", "postgresql", "redis", "mongo", "mysql"):
                if image in content.lower():
                    mapped_name = {
                        "postgres": "PostgreSQL",
                        "postgresql": "PostgreSQL",
                        "redis": "Redis",
                        "mongo": "MongoDB",
                        "mysql": "MySQL",
                    }[image]
                    evidence_id = collector.add(
                        path=path,
                        excerpt=_line_for(content, image) or f"{image} service detected",
                        category="configuration",
                        confidence=95,
                        content=content,
                    )
                    acc.add(mapped_name, "Database", 95, evidence_id)


def _detect_ci(
    tree_paths: list[str], files: dict[str, str], collector: EvidenceCollector, acc: TechAccumulator
) -> None:
    workflow_paths = [path for path in tree_paths if path.lower().startswith(".github/workflows/")]
    if not workflow_paths:
        return
    path = workflow_paths[0]
    content = files.get(path, "")
    evidence_id = collector.add(
        path=path,
        excerpt=_line_for(content, "on:") or "GitHub Actions workflow detected",
        category="ci",
        confidence=95,
        content=content,
    )
    acc.add("GitHub Actions", "Cloud/DevOps", 95, evidence_id)


def _detect_readme_inference(
    readme: str, collector: EvidenceCollector, acc: TechAccumulator, readme_path: str
) -> None:
    lowered = readme.lower()
    for needle, (name, category) in _README_NAMES.items():
        if name in acc.items:
            continue
        if not re.search(rf"(?<![a-z0-9]){re.escape(needle)}(?![a-z0-9])", lowered):
            continue
        evidence_id = collector.add(
            path=readme_path,
            excerpt=_line_for(readme, needle) or f"Mentioned in README: {name}",
            category="readme_mention",
            confidence=35,
            content=readme,
        )
        acc.add(name, category, 35, evidence_id, inferred=True)


def detect_technologies(
    *,
    files: dict[str, str],
    tree_paths: list[str],
    readme_text: str,
    readme_path: str | None,
    collector: EvidenceCollector,
) -> list[TechOut]:
    acc = TechAccumulator()

    for path, content in files.items():
        lower = path.lower()
        name = PurePosixPath(lower).name
        if name == "package.json":
            _detect_package_json(path, content, collector, acc)
            if "Node.js" not in acc.items:
                evidence_id = collector.add(
                    path=path,
                    excerpt="Node.js package manifest detected.",
                    category="manifest",
                    confidence=90,
                    content=content,
                )
                acc.add("Node.js", "Backend", 90, evidence_id)
        elif name == "requirements.txt":
            _detect_requirements(path, content, collector, acc)
        elif name == "pyproject.toml":
            _detect_pyproject(path, content, collector, acc)
        elif name == "go.mod":
            _detect_go_mod(path, content, collector, acc)
        elif name == "cargo.toml":
            _detect_cargo(path, content, collector, acc)
        elif lower.endswith(".py"):
            pass
        elif lower.endswith((".ts", ".tsx")):
            if "TypeScript" not in acc.items:
                evidence_id = collector.add(
                    path=path,
                    excerpt=f"TypeScript source file detected: {path}",
                    category="source",
                    confidence=80,
                    content=content,
                )
                acc.add("TypeScript", "Tools", 80, evidence_id)

    _detect_docker(files, collector, acc)
    _detect_ci(tree_paths, files, collector, acc)

    if readme_text and readme_path:
        _detect_readme_inference(readme_text, collector, acc, readme_path)

    # Remove low-confidence README-only entries when a stronger signal exists for the same name.
    return acc.as_list()[:30]
