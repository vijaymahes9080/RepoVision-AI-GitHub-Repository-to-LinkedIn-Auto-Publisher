# RepoVision roadmap

## Guiding rules

1. Every displayed fact must be traceable to a source or stored evidence.
2. No simulated success states, placeholder metrics, or invented ownership claims.
3. LinkedIn publishing stays disabled until OAuth, token storage, and an explicit publish
   confirmation are implemented and tested.
4. Security language stays descriptive unless a real assessment was performed.

## M1 — Evidence-first foundation (complete)

Delivered:

- FastAPI backend with `/api/v1` health, config, preflight, analysis, evidence, content, and
  verification endpoints.
- SQLAlchemy models and an Alembic initial migration (verified on SQLite).
- Strict GitHub URL parsing and bounded snapshot ingestion.
- Deterministic analysis with an evidence index.
- Grounded draft generation with optional OpenAI-compatible/Ollama provider.
- Fact verifier and claim mapping.
- Real browser-side PNG banner and PDF carousel exports.
- Honest UI for disabled modules.
- Backend tests (26 passing) and a frontend production build.
- Documentation and CI.

M1 exit criteria met:

- `pytest` passes.
- `ruff check` passes.
- `npm run lint` passes with no findings.
- `npm run build` passes.
- No fake OAuth, publisher, analytics, or security-score code remains reachable.
- README and docs describe only verified behavior.

Known M1 limitations are listed in `REPOVISION_GAP_ANALYSIS.md`.

## M2 — LinkedIn OAuth and controlled publishing (complete, live verification pending)

Goal: publish a verified draft with explicit user consent, without pretending scheduling or analytics
exist.

Delivered:

- LinkedIn authorization-code flow with `state` and PKCE; the code verifier and tokens are encrypted
  with Fernet at rest.
- Connection status, disconnect, and publish-audit endpoints under `/api/v1/linkedin`.
- Banner PNG upload through the LinkedIn Images API and post creation through `/rest/posts`.
- Every publish request requires `confirm=true`, re-runs the evidence verifier, and is recorded in
  `linkedin_publish_attempts`.
- Frontend connection management in **Integrations** and a publish panel with a review checkbox in
  **Visual Studio**.
- Mocked integration tests for OAuth exchange, encrypted storage, status, publish success, verifier
  rejection, provider failure, and disconnect.
- Alembic migration `0002_linkedin`.

Acceptance criteria status:

- Connect and disconnect flows are implemented and covered by mocked tests.
- An expired token refreshes when a refresh token exists; otherwise the UI reports a reconnect path.
- A failed post is stored as `failed` and is never shown as published.
- Token values never appear in API responses, logs, or browser storage.
- Publishing requires explicit confirmation.

Open dependency: real posting still requires an approved LinkedIn app, an HTTPS callback, and the
operator's client ID/secret. Live LinkedIn verification has not been performed.

## M3 — Scheduling, analytics, and additional formats

Goal: add time-based publishing and measured outcomes, then broaden content formats.

Scope:

- Durable queue (Celery/RQ + Redis) with retries and dead-letter handling.
- Scheduled publish jobs with cancel/edit windows and timezone handling.
- LinkedIn analytics scopes; ingestion of impressions and engagement for posts RepoVision published.
- Explicit data retention and deletion controls.
- Additional formats:
  - long-form blog markdown export;
  - X thread export and optional publishing after API approval;
  - video script export, with rendered video only if a render pipeline is added.
- PostgreSQL in CI and staging; Alembic upgrade/downgrade tests.

Acceptance criteria:

- No analytics chart appears without ingested provider data and a timestamp.
- A scheduled post can be cancelled before execution.
- A failed job is visible with its failure reason and retry state.
- Every new integration has server-side secret storage and a preflight status.
- New formats are either genuinely generated/exported or visibly disabled.

## M4 — Hardening and productization

Goal: make the system operable for multiple users.

Scope:

- Authentication, authorization, and tenant isolation.
- Per-user quotas and GitHub rate-limit accounting.
- Observability: structured logs, metrics, traces, error budgets.
- Backup/restore, retention jobs, and data export/deletion.
- Billing only if a real paid product exists; no placeholder plans.
- Accessibility and browser E2E coverage, including export file validation.
- Dependency scanning in CI and a documented patch cadence.

Acceptance criteria:

- Cross-tenant access is prevented and tested.
- Secrets are managed by a secret manager or platform secret store.
- Restore and retention procedures are documented and rehearsed.
- CI runs backend, frontend, migration, and security checks.

## Risks and dependencies

| Risk | Impact | Mitigation |
| --- | --- | --- |
| LinkedIn app approval delayed | M2 publishing blocked | Keep manual workflow and preflight; do not fake a connection |
| GitHub API rate limits | Analysis failures | Server-side token, bounded reads, clear rate-limit errors |
| LLM hallucination | Misleading drafts | Deterministic fallback, facts-only prompt, verifier, warnings |
| Prompt injection in repository content | Manipulated drafts | Treat repository text as data; no tool access; strict output schema; verifier |
| Security false positives | Misleading findings | Label as pattern matches; show evidence; no grades |
| Token leakage | Account compromise | Server-only storage, encryption, no token in responses/logs/browser |
| Dependency vulnerabilities | Supply-chain risk | CI scanning, review upgrades, avoid unreviewed `npm audit fix` |
| Large repositories | Incomplete analysis | Explicit truncation limits and limitations in the result |

## Milestone discipline

A milestone is complete only when:

- its behavior is implemented, not mocked;
- tests cover the failure paths as well as the happy path;
- disabled or missing capabilities remain visibly disabled;
- docs and README match the verified commands and behavior.
