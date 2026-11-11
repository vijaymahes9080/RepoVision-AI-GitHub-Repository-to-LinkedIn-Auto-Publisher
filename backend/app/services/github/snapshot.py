from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timezone
from pathlib import PurePosixPath

from app.config import settings
from app.core.errors import BranchNotFound
from app.schemas import RepositoryMetadata
from app.services.github.client import GitHubClient
from app.services.github.url import parse_repo_url

_SKIP_DIRS = {
    ".git",
    ".github/ISSUE_TEMPLATE",
    "node_modules",
    "vendor",
    "dist",
    "build",
    "target",
    "coverage",
    "htmlcov",
    "__pycache__",
    ".venv",
    "venv",
    ".idea",
    ".vscode",
}

_SKIP_FILES = {
    "package-lock.json",
    "yarn.lock",
    "pnpm-lock.yaml",
    "poetry.lock",
    "pipfile.lock",
    "cargo.lock",
    "go.sum",
}

_BINARY_EXTENSIONS = {
    ".png",
    ".jpg",
    ".jpeg",
    ".gif",
    ".webp",
    ".ico",
    ".svg",
    ".pdf",
    ".zip",
    ".gz",
    ".tar",
    ".7z",
    ".rar",
    ".mp3",
    ".mp4",
    ".mov",
    ".avi",
    ".webm",
    ".wav",
    ".ttf",
    ".otf",
    ".woff",
    ".woff2",
    ".eot",
    ".pyc",
    ".pyo",
    ".class",
    ".jar",
    ".so",
    ".dylib",
    ".dll",
    ".exe",
    ".bin",
    ".map",
}

_PRIORITY_NAMES = {
    "package.json",
    "pyproject.toml",
    "requirements.txt",
    "setup.py",
    "setup.cfg",
    "go.mod",
    "cargo.toml",
    "pom.xml",
    "build.gradle",
    "build.gradle.kts",
    "composer.json",
    "gemfile",
    "dockerfile",
    "docker-compose.yml",
    "docker-compose.yaml",
    "makefile",
    "tsconfig.json",
    "vite.config.ts",
    "vite.config.js",
    "next.config.js",
    "next.config.mjs",
    "next.config.ts",
    "license",
    "license.md",
    "license.txt",
    "copying",
}

_ENTRY_NAMES = {
    "main.py",
    "app.py",
    "server.py",
    "manage.py",
    "wsgi.py",
    "asgi.py",
    "main.ts",
    "main.js",
    "main.tsx",
    "main.jsx",
    "app.tsx",
    "app.jsx",
    "index.ts",
    "index.js",
    "index.tsx",
    "index.jsx",
    "server.ts",
    "server.js",
    "main.go",
    "lib.rs",
    "main.rs",
}


@dataclass
class RepoSnapshot:
    repo: RepositoryMetadata
    commit_sha: str
    tree_sha: str
    branch: str
    readme_path: str | None
    readme_text: str
    files: dict[str, str] = field(default_factory=dict)
    tree_paths: list[str] = field(default_factory=list)
    tree_truncated: bool = False
    limitations: list[str] = field(default_factory=list)
    analyzed_bytes: int = 0
    file_count: int = 0
    fetched_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))

    @property
    def analyzed_file_count(self) -> int:
        return len(self.files)


def _is_skipped_path(path: str) -> bool:
    lowered = path.lower()
    parts = [part.lower() for part in PurePosixPath(lowered).parts]
    if any(part in _SKIP_DIRS for part in parts[:-1]):
        return True
    name = parts[-1] if parts else ""
    if name in _SKIP_FILES:
        return True
    suffix = PurePosixPath(name).suffix
    if suffix in _BINARY_EXTENSIONS:
        return True
    return name.endswith(".min.js") or name.endswith(".min.css")


def _priority(path: str) -> int:
    lowered = path.lower()
    name = PurePosixPath(lowered).name
    if name in _PRIORITY_NAMES:
        return 0
    if lowered.startswith(".github/workflows/"):
        return 1
    if name in _ENTRY_NAMES or lowered.endswith("/main.go") or lowered.endswith("/main.rs"):
        return 2
    if "test" in lowered or "spec" in lowered:
        return 3
    if any(part in lowered for part in ("/routes/", "/api/", "/controllers/", "/endpoints/")):
        return 4
    if lowered.startswith(("src/", "app/", "lib/", "internal/", "cmd/")):
        return 5
    return 6


def select_candidate_paths(tree_entries: list[dict], limit: int) -> list[str]:
    candidates: list[tuple[int, str]] = []
    for entry in tree_entries[: settings.max_tree_entries]:
        if entry.get("type") != "blob":
            continue
        path = entry.get("path")
        if not isinstance(path, str) or _is_skipped_path(path):
            continue
        candidates.append((_priority(path), path))

    candidates.sort(key=lambda item: (item[0], item[1].lower()))
    selected: list[str] = []
    seen: set[str] = set()
    for _priority_value, path in candidates:
        if path in seen:
            continue
        seen.add(path)
        selected.append(path)
        if len(selected) >= limit:
            break
    return selected


def build_snapshot(repo_url: str, branch: str | None = None) -> RepoSnapshot:
    ref = parse_repo_url(repo_url)
    limitations: list[str] = []

    with GitHubClient(settings.github_token) as client:
        repo = client.get_repo(ref.owner, ref.name)
        target_branch = branch or repo.default_branch

        commit_sha = client.get_branch_sha(ref.owner, ref.name, target_branch)
        if not commit_sha:
            raise BranchNotFound(f"Branch '{target_branch}' was not found in {ref.owner}/{ref.name}.")

        commit = client.get_commit(ref.owner, ref.name, commit_sha)
        tree_info = commit.get("tree") or {}
        tree_sha = tree_info.get("sha")
        if not isinstance(tree_sha, str):
            raise BranchNotFound("Could not resolve the repository tree for this branch.")

        tree = client.get_tree(ref.owner, ref.name, tree_sha)
        entries = tree.get("tree") or []
        tree_truncated = bool(tree.get("truncated"))
        if tree_truncated:
            limitations.append(
                "GitHub truncated the recursive tree response; analysis covers only the visible paths."
            )
        if len(entries) > settings.max_tree_entries:
            limitations.append(
                f"The repository has more than {settings.max_tree_entries} tree entries; analysis used a bounded subset."
            )

        blob_paths = [
            entry["path"]
            for entry in entries[: settings.max_tree_entries]
            if entry.get("type") == "blob" and isinstance(entry.get("path"), str)
        ]

        readme_path: str | None = None
        readme_text = ""
        readme = client.get_readme(ref.owner, ref.name, commit_sha)
        if readme:
            readme_path, readme_text = readme
            if len(readme_text) > settings.max_readme_bytes:
                readme_text = readme_text[: settings.max_readme_bytes]
                limitations.append("README content was truncated to the configured size limit.")
        else:
            limitations.append("No README file was found in the analyzed snapshot.")

        candidate_paths = select_candidate_paths(entries, settings.max_analyzed_files)
        files: dict[str, str] = {}
        analyzed_bytes = 0
        skipped_for_size = 0

        for path in candidate_paths:
            content = client.get_file(ref.owner, ref.name, path, commit_sha)
            if content is None:
                skipped_for_size += 1
                continue
            size = len(content.encode("utf-8"))
            if analyzed_bytes + size > settings.max_total_bytes:
                limitations.append("The analyzed file budget was reached; remaining files were skipped.")
                break
            files[path] = content
            analyzed_bytes += size

        if readme_path and readme_text and readme_path not in files:
            readme_size = len(readme_text.encode("utf-8"))
            if analyzed_bytes + readme_size <= settings.max_total_bytes:
                files[readme_path] = readme_text
                analyzed_bytes += readme_size

        if skipped_for_size:
            limitations.append(
                f"{skipped_for_size} file(s) were skipped because they exceeded size limits or could not be read."
            )
        if not blob_paths:
            limitations.append("The repository snapshot contains no files.")

    return RepoSnapshot(
        repo=repo,
        commit_sha=commit_sha,
        tree_sha=tree_sha,
        branch=target_branch,
        readme_path=readme_path,
        readme_text=readme_text,
        files=files,
        tree_paths=blob_paths,
        tree_truncated=tree_truncated,
        limitations=limitations,
        analyzed_bytes=analyzed_bytes,
        file_count=len(blob_paths),
    )
