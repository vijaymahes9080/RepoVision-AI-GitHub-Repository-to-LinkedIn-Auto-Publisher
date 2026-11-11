from __future__ import annotations

from pathlib import PurePosixPath

from app.schemas import TechOut, TestingOut
from app.services.analysis.evidence import EvidenceCollector

_FRAMEWORK_TESTS = {
    "pytest": "pytest",
    "jest": "Jest",
    "vitest": "Vitest",
    "playwright": "Playwright",
    "cypress": "Cypress",
    "mocha": "Mocha",
    "jasmine": "Jasmine",
    "testify": "Testify",
    "junit": "JUnit",
}

_TEST_CONFIG_NAMES = {
    "pytest.ini",
    "tox.ini",
    "noxfile.py",
    "jest.config.js",
    "jest.config.ts",
    "jest.config.mjs",
    "vitest.config.ts",
    "vitest.config.js",
    "playwright.config.ts",
    "playwright.config.js",
    "cypress.config.ts",
    "cypress.config.js",
    ".coveragerc",
}

_CI_FILES: list[tuple[str, str]] = [
    (".github/workflows/", "GitHub Actions"),
    (".gitlab-ci.yml", "GitLab CI"),
    ("jenkinsfile", "Jenkins"),
    (".circleci/config.yml", "CircleCI"),
    ("azure-pipelines.yml", "Azure Pipelines"),
    (".travis.yml", "Travis CI"),
    ("bitbucket-pipelines.yml", "Bitbucket Pipelines"),
]


def _is_test_path(path: str) -> bool:
    lowered = path.lower()
    name = PurePosixPath(lowered).name
    parts = [part.lower() for part in PurePosixPath(lowered).parts]
    if any(part in {"tests", "__tests__", "test", "spec", "e2e", "integration_tests"} for part in parts[:-1]):
        return True
    return (
        name.startswith("test_")
        or name.endswith("_test.py")
        or ".test." in name
        or ".spec." in name
        or name.endswith("test.java")
        or name.endswith("_test.go")
    )


def analyze_testing(
    *,
    tree_paths: list[str],
    files: dict[str, str],
    technologies: list[TechOut],
    collector: EvidenceCollector,
) -> TestingOut:
    test_paths = sorted({path for path in tree_paths if _is_test_path(path)})
    evidence_ids: list[str] = []

    if test_paths:
        evidence_ids.append(
            collector.add(
                path=test_paths[0],
                excerpt=f"Test file detected: {test_paths[0]}",
                category="testing",
                confidence=85,
            )
        )
        if len(test_paths) > 1:
            evidence_ids.append(
                collector.add(
                    path=test_paths[-1],
                    excerpt=f"Additional test file detected: {test_paths[-1]}",
                    category="testing",
                    confidence=85,
                )
            )

    frameworks: list[str] = []
    for technology in technologies:
        mapped = _FRAMEWORK_TESTS.get(technology.name.lower())
        if mapped and mapped not in frameworks:
            frameworks.append(mapped)
            evidence_ids.extend(technology.evidence_ids)

    for path in tree_paths:
        name = PurePosixPath(path).name.lower()
        if name not in _TEST_CONFIG_NAMES:
            continue
        content = files.get(path, "")
        evidence_ids.append(
            collector.add(
                path=path,
                excerpt=f"Test configuration file detected: {name}",
                category="testing",
                confidence=85,
                content=content or None,
            )
        )

    # A test runner in a manifest is strong evidence even when no test file was
    # selected for content analysis.
    for path, content in files.items():
        if PurePosixPath(path).name.lower() not in {
            "package.json",
            "pyproject.toml",
            "requirements.txt",
            "pipfile",
            "go.mod",
            "cargo.toml",
            "pom.xml",
        }:
            continue
        lowered = content.lower()
        for key, framework in _FRAMEWORK_TESTS.items():
            if key not in lowered or framework in frameworks:
                continue
            if PurePosixPath(path).name.lower() == "package.json" and f'"{key}"' not in lowered:
                continue
            frameworks.append(framework)
            line = next((item for item in content.splitlines() if key in item.lower()), None)
            if line:
                evidence_ids.append(
                    collector.add(
                        path=path,
                        excerpt=line.strip(),
                        category="testing",
                        confidence=85,
                        content=content,
                    )
                )

    ci_systems: list[str] = []
    for path in tree_paths:
        lowered = path.lower()
        for marker, label in _CI_FILES:
            if marker not in lowered or label in ci_systems:
                continue
            ci_systems.append(label)
            content = files.get(path, "")
            line = next(
                (item for item in content.splitlines() if item.strip()),
                f"CI configuration detected: {path}",
            )
            evidence_ids.append(
                collector.add(
                    path=path,
                    excerpt=line.strip(),
                    category="ci",
                    confidence=90,
                    content=content or None,
                )
            )

    limitations = [
        "No tests were executed. Test presence does not prove that tests pass or cover "
        "critical paths.",
        "Test discovery only covers paths visible in the bounded GitHub tree response.",
    ]
    if not test_paths:
        limitations.insert(
            0,
            "No test files were detected in the analyzed snapshot; tests may exist in paths "
            "that were not returned.",
        )
    if not ci_systems:
        limitations.append("No supported CI configuration was detected in the analyzed snapshot.")

    # Deduplicate evidence while preserving order.
    unique_evidence = list(dict.fromkeys(evidence_ids))

    return TestingOut(
        frameworks=frameworks,
        test_file_count=len(test_paths),
        ci_systems=ci_systems,
        evidence_ids=unique_evidence,
        limitations=limitations,
    )
