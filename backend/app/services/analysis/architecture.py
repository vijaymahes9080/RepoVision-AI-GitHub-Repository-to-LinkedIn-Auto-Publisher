from __future__ import annotations

from app.schemas import ArchitectureComponent, ArchitectureOut, TechOut

_CATEGORY_ROLES = {
    "Frontend": "User interface layer",
    "Backend": "Application and API layer",
    "Database": "Persistence layer",
    "Cloud/DevOps": "Build, delivery, and infrastructure",
    "AI/ML": "AI or machine-learning integration",
    "Tools": "Development tooling",
}


def analyze_architecture(
    *,
    technologies: list[TechOut],
    tree_paths: list[str],
) -> ArchitectureOut:
    grouped: dict[str, list[TechOut]] = {}
    for technology in technologies:
        if technology.inferred and technology.confidence < 50:
            continue
        grouped.setdefault(technology.category, []).append(technology)

    components: list[ArchitectureComponent] = []
    evidence_ids: list[str] = []

    for category in ("Frontend", "Backend", "Database", "AI/ML", "Cloud/DevOps"):
        items = grouped.get(category)
        if not items:
            continue
        names = ", ".join(technology.name for technology in items[:5])
        item_evidence: list[str] = []
        for technology in items[:5]:
            item_evidence.extend(technology.evidence_ids)
        unique_item_evidence = list(dict.fromkeys(item_evidence))
        components.append(
            ArchitectureComponent(
                name=category,
                role=f"{_CATEGORY_ROLES[category]}: {names}",
                evidence_ids=unique_item_evidence,
            )
        )
        evidence_ids.extend(unique_item_evidence)

    has_frontend = "Frontend" in grouped
    has_backend = "Backend" in grouped
    has_database = "Database" in grouped

    data_flow: list[str] = []
    if has_frontend and has_backend:
        data_flow.append("Frontend client calls the backend application layer.")
    if has_backend and has_database:
        data_flow.append("Backend application layer reads from or writes to the database layer.")
    if has_frontend and not has_backend:
        data_flow.append("Frontend assets are built from the detected frontend toolchain.")

    if not components:
        return ArchitectureOut(
            summary=(
                "No application-layer architecture could be inferred from the analyzed "
                "manifests and configuration."
            ),
            components=[],
            data_flow=[],
            inferred=True,
            evidence_ids=[],
        )

    summary_parts = [
        f"{component.name} ({component.role.split(': ', 1)[1]})" for component in components
    ]
    summary = (
        "Inferred from manifest and configuration evidence: "
        + "; ".join(summary_parts)
        + ". This is a structural inference, not a runtime architecture review."
    )

    directory_hints: list[str] = []
    for prefix, label in (
        ("src/", "src/"),
        ("app/", "app/"),
        ("api/", "api/"),
        ("backend/", "backend/"),
        ("frontend/", "frontend/"),
        ("server/", "server/"),
        ("tests/", "tests/"),
    ):
        if any(path.startswith(prefix) for path in tree_paths) and label not in directory_hints:
            directory_hints.append(label)
    if directory_hints:
        summary += " Top-level directories observed: " + ", ".join(directory_hints) + "."

    return ArchitectureOut(
        summary=summary,
        components=components,
        data_flow=data_flow,
        inferred=True,
        evidence_ids=list(dict.fromkeys(evidence_ids)),
    )
