# RepoVision architecture (M2)

## Overview

RepoVision M2 is a two-process application:

1. A React + Vite single-page frontend that collects a public GitHub URL, displays analysis and
   evidence, edits grounded drafts, renders PNG/PDF exports in the browser, and manages a LinkedIn
   connection.
2. A FastAPI backend that fetches a bounded GitHub snapshot, performs deterministic analysis, stores
   evidence and drafts, and publishes a reviewed post to LinkedIn when explicitly configured.

The analysis pipeline is deterministic. A language model is optional and is used only for drafting
text, never for inventing analysis facts. When no model is configured, drafts come from a
deterministic generator that links sentences to evidence.

```text
Browser
  React UI ── /api/v1 ──> FastAPI
                           ├── GitHub client ──> api.github.com (fixed host)
                           ├── Snapshot builder (bounded reads)
                           ├── Deterministic analysis
                           │     ├── stack.py
                           │     ├── features.py
                           │     ├── testing.py
                           │     ├── security.py
                           │     └── architecture.py
                           ├── Evidence collector ──> evidence_items
                           ├── Draft generator ── optional LLM → verifier
                           ├── LinkedIn OAuth / encrypted tokens / publisher
                           └── SQLAlchemy ──> SQLite (local) / PostgreSQL (target)
```

## Frontend

Key modules:

| Path | Responsibility |
| --- | --- |
| `src/App.tsx` | Application state, analysis start/poll/resume, draft generation, tab routing |
| `src/api/client.ts` | Typed API client, base URL configuration, error contract |
| `src/components/RepoAnalyzer.tsx` | URL input, run progress, analysis summary, evidence index |
| `src/components/ContentStudio.tsx` | Style/length selection, editable draft, claims, verifier, manual copy actions |
| `src/components/VisualStudio.tsx` | Banner configuration, carousel editing, real PNG/PDF exports, confirmed LinkedIn publish |
| `src/components/SecurityView.tsx` | Static findings, license, dependency scan status, limitations |
| `src/components/IntegrationsView.tsx` | GitHub/LLM configuration, LinkedIn preflight, connection management |
| `src/components/AdminView.tsx` | Read-only runtime status; no secret inputs |
| `src/components/DisabledModuleView.tsx` | Explicit "not yet available" panels for planned modules |
| `src/services/exportService.ts` | `html-to-image` PNG capture and `jsPDF` multi-page PDF |

The frontend persists only the active analysis run ID in `localStorage`. It never persists secrets,
tokens, or draft content beyond the current session.

The API base URL is `/api/v1` by default. The Vite dev server proxies `/api` to
`http://127.0.0.1:8000`. Deployments can override the base with `VITE_API_BASE_URL`, but that value
must be a public, non-secret URL.

## Backend

| Module | Responsibility |
| --- | --- |
| `app/main.py` | FastAPI app, CORS, request IDs, error handlers, router registration |
| `app/config.py` | Environment settings, derived status flags |
| `app/db.py` | Engine/session creation, `init_db`, `get_db` dependency |
| `app/models.py` | SQLAlchemy models |
| `app/schemas.py` | Pydantic request/response models |
| `app/core/errors.py` | Typed application errors with HTTP status and error codes |
| `app/services/github/url.py` | Strict GitHub URL parser |
| `app/services/github/client.py` | GitHub REST client with a fixed base host |
| `app/services/github/snapshot.py` | Bounded snapshot: metadata, commit, tree, README, selected files |
| `app/services/analysis/evidence.py` | Evidence collector and stable evidence IDs |
| `app/services/analysis/redaction.py` | Secret-like value redaction |
| `app/services/analysis/stack.py` | Manifest/config/README technology detection |
| `app/services/analysis/features.py` | README feature and problem/solution extraction, route declarations |
| `app/services/analysis/testing.py` | Test files, frameworks, CI detection |
| `app/services/analysis/security.py` | License and static security patterns; dependency scan marked not run |
| `app/services/analysis/architecture.py` | Manifest-based structural inference |
| `app/services/analysis/orchestrator.py` | Run lifecycle, persistence, analysis result assembly |
| `app/services/content/drafts.py` | Deterministic drafts, optional LLM prompts, claims |
| `app/services/content/verifier.py` | Claim and content checks against stored evidence |
| `app/services/linkedin/crypto.py` | Fernet encryption/decryption for member tokens |
| `app/services/linkedin/client.py` | Fixed-host OAuth, userinfo, image upload, and post client |
| `app/services/linkedin/service.py` | OAuth state/PKCE, direct token connect, status, refresh, publish orchestration, audit |
| `app/services/llm/*` | Provider interface, multi-model engine (Gemini, Grok, Groq, OpenRouter, DeepSeek, OpenAI, Ollama), factory |
| `migrations/` | Alembic environment and schema revisions (`0001_initial`, `0002_linkedin`) |

## API

All routes are under `/api/v1`.

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/health` | Liveness and version |
| GET | `/config/status` | Non-secret runtime status and capability list |
| GET | `/linkedin/preflight` | Required LinkedIn products, scopes, and setup steps |
| POST | `/analyses` | Start an analysis; returns `202` with a run ID |
| GET | `/analyses/{run_id}` | Run status, progress, error, and completed result |
| GET | `/analyses/{run_id}/evidence` | Stored evidence for a completed run |
| GET | `/analyses/{run_id}/content` | Drafts for a run, newest first |
| POST | `/content` | Generate a grounded draft |
| GET | `/content/{draft_id}` | Retrieve a draft |
| POST | `/content/verify` | Verify arbitrary text against a run's evidence |
| POST | `/linkedin/oauth/start` | Start member OAuth with state + PKCE |
| GET | `/linkedin/oauth/callback` | Exchange the code, encrypt tokens, redirect to the frontend |
| GET | `/linkedin/status` | Connection readiness and member display name |
| POST | `/linkedin/connect-token` | Connect member directly using a Developer Access Token |
| POST | `/linkedin/disconnect` | Delete the stored connection |
| POST | `/linkedin/publish` | Confirm, verify, upload the banner, and create the post |
| GET | `/linkedin/attempts` | Audit rows for publish attempts |

Errors use a stable envelope:

```json
{
  "error": { "code": "INVALID_REPOSITORY_URL", "message": "..." },
  "request_id": "..."
}
```

## Data model

- `analysis_runs`: repository identity, branch, status, stage, progress, commit SHA, error, and the
  serialized analysis result.
- `evidence_items`: path, optional symbol and line range, excerpt, category, confidence, commit SHA.
- `content_drafts`: style, length, title, body, hooks, hashtags, CTA, claims, warnings, generator,
  and model.
- `fact_checks`: schema exists for persisted verification results; M2 computes verification on
  request and does not yet write rows here.
- `linkedin_accounts`: member identity, encrypted access/refresh tokens, scopes, and expiry.
- `linkedin_oauth_states`: single-use OAuth `state`, encrypted PKCE verifier, redirect URI, and expiry.
- `linkedin_publish_attempts`: draft ID, status, commentary, image/post URNs, and error details. No
  tokens are stored here.

Evidence IDs have the form `ev_<commit-prefix>_<counter>` and are stable within a run.

## Analysis pipeline

1. Validate the URL. Only `https://github.com/{owner}/{repo}` (optionally `www.`, optionally `.git`)
   is accepted. Credentials, query strings, subpaths, and non-GitHub hosts are rejected.
2. Fetch repository metadata, the target branch SHA, the commit, and the recursive tree from the
   fixed `https://api.github.com` host with redirects disabled.
3. Fetch the README and a prioritized, bounded set of files. Lockfiles, vendored dependencies, build
   output, binaries, and minified assets are skipped. Default budgets: 5,000 tree entries, 40 files,
   100 KB per file, 2 MB total, 150 KB README.
4. Collect evidence for each signal. Excerpts are capped and secret-like values are redacted.
5. Derive technologies, README features, problem/solution, API routes, testing/CI signals, license,
   static security patterns, and inferred architecture.
6. Attach explicit limitations (truncated tree, skipped files, no README, tests not executed, code not
   executed) and persist the result.

### Evidence-first invariants

- A technology without evidence is not emitted, except for README-only mentions, which are marked
  `inferred: true` with low confidence.
- Features are extracted only from README headings and bullets. If no recognizable feature section
  exists, the feature list is empty.
- Problem and solution are returned only when the README labels them.
- Security findings are pattern matches with file evidence. No CVE counts, grades, or scores exist.
- Analysis provenance always reports `analysis_engine: deterministic-v1` and `llm_used: false`.

## Content pipeline

1. Load the completed analysis result for the run.
2. If an LLM provider is configured, send a facts-only JSON payload with strict instructions. The
   response must be JSON and must pass the verifier, or generation falls back to the deterministic
   draft.
3. The deterministic generator builds sentences from evidence-linked facts: description, documented
   features, high-confidence technologies, inferred structure, testing/CI, and security review scope.
   Every generated claim stores the evidence IDs that support it.
4. The verifier rejects:
   - first-person voice (`I`, `we`, `my`, `our`, `us`);
   - numbers that do not appear in stored evidence;
   - URLs other than the analyzed repository URL;
   - superlatives and marketing hype;
   - security guarantees and security grades/scores;
   - unverified attribution (`built by`, `maintained by`, ...);
   - technology names that are not supported by evidence;
   - CVE or vulnerability counts.
5. Warnings disclose the generator, missing provider, missing feature list, and static-analysis limits.

## Exports and publishing

Exports are client-side only:

- Banner: the rendered preview node is captured with `html-to-image` at 2× pixel ratio and downloaded
  as a PNG.
- Carousel: ten fixed-size 1080×1350 slides are rendered off-screen and captured one by one, then
  assembled into a multi-page PDF with `jsPDF`.

Publishing is server-side and opt-in:

1. `POST /linkedin/oauth/start` creates a single-use state and PKCE verifier, encrypts the verifier, and
   returns the LinkedIn authorization URL.
2. The callback exchanges the code, looks up the member, encrypts the access/refresh tokens, and
   redirects to the frontend with a non-secret status.
3. `POST /linkedin/publish` requires `confirm=true`, reloads the draft, re-runs the verifier, validates
   the PNG, initializes the LinkedIn image upload, uploads it, and creates the post.
4. An audit row moves from `pending` to `published` only after LinkedIn responds; any exception marks
   it `failed` and is surfaced to the client.

No object storage or server-side rendering is involved. A failed capture surfaces an error; no success
state is shown.

## Trust boundaries and non-goals

- Repository code is never cloned, installed, built, or executed.
- The browser never receives GitHub, LLM, LinkedIn client secrets, or member tokens.
- The GitHub API host is fixed in configuration; users cannot supply arbitrary hosts.
- LinkedIn image upload URLs must be HTTPS and end in `.licdn.com` or `.linkedin.com`.
- Publishing is disabled unless `LINKEDIN_ENABLED=true` and all credentials plus
  `TOKEN_ENCRYPTION_KEY` are present.
- M2 has no user accounts, authorization, multi-tenancy, billing, durable queue, or scheduled jobs.
- M2 does not run dependency vulnerability scans or produce security grades.
