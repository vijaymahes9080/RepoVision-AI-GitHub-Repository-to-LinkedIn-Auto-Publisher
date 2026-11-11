# RepoVision

**Evidence-first GitHub repository intelligence with grounded LinkedIn drafts.**

![Status](https://img.shields.io/badge/status-M1-6366f1)
![Backend](https://img.shields.io/badge/backend-FastAPI-009688)
![Frontend](https://img.shields.io/badge/frontend-React%20%2B%20Vite-61dafb)
![License](https://img.shields.io/badge/license-MIT-emerald)

RepoVision analyzes a **public GitHub repository**, stores evidence for each finding, and generates
LinkedIn drafts that are checked against that evidence. It also exports a real PNG banner and a real
multi-page PDF carousel in the browser.

This is an M1 implementation. It does **not** publish to LinkedIn, schedule posts, collect analytics,
or produce security grades. Those features are either absent or visibly disabled; no sample data is
used to pretend otherwise.

## What works

- Public GitHub snapshot ingestion with strict URL validation and bounded reads.
- Deterministic detection of technologies, README features, problem/solution sections, API route
  declarations, testing/CI signals, license, and static security patterns.
- An evidence index. Every technology, feature, and security finding references stored evidence IDs.
- Grounded draft generation with style and length options.
- Optional OpenAI-compatible or Ollama provider; deterministic fallback when none is configured.
- A fact verifier for unsupported numbers, external URLs, first-person claims, superlatives,
  security guarantees, attribution, and unsupported technologies.
- Real browser-side exports: banner PNG via `html-to-image`, carousel PDF via `jsPDF`.
- Honest configuration and LinkedIn preflight screens.

## What is intentionally not in M1

| Module | Status | Why |
| --- | --- | --- |
| LinkedIn OAuth and publishing | Disabled | Needs approved LinkedIn products, HTTPS callback, state + PKCE, encrypted token storage |
| Scheduler and queue | Disabled | Needs a durable queue plus publishing access |
| Engagement analytics | Disabled | Needs LinkedIn analytics scopes and real post data |
| Video, blog, X thread, resume, portfolio | Disabled | Each needs a real integration or verified authorship; sample outputs are not substituted |
| Dependency/CVE scanning | Not run | No vulnerability counts or security grades are reported |
| User accounts / multi-tenancy | Not implemented | M1 is a local, single-operator application |

The UI shows a "Not in M1" panel with the requirements for each planned module.

## Architecture

```text
React + Vite frontend
  │  /api/v1
  ▼
FastAPI backend
  ├── Strict GitHub URL parser ──> api.github.com (fixed host, no redirects)
  ├── Bounded snapshot (tree, README, prioritized files)
  ├── Deterministic analysis ──> evidence index
  ├── Grounded draft generator ── optional LLM ──> fact verifier
  └── SQLAlchemy ──> SQLite locally / PostgreSQL-ready models
```

Repository code is never cloned, installed, built, or executed. The backend reads file text only.

## Quick start

Requirements: Python 3.12+, Node.js 20.19+ or 22.12+.

### 1. Backend

Windows PowerShell:

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\python -m pip install -e ".[dev]"
Copy-Item .env.example .env
.\.venv\Scripts\alembic upgrade head
.\.venv\Scripts\python -m uvicorn app.main:app --reload
```

macOS/Linux:

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
python -m pip install -e ".[dev]"
cp .env.example .env
alembic upgrade head
python -m uvicorn app.main:app --reload
```

API: `http://127.0.0.1:8000` · Docs: `http://127.0.0.1:8000/docs`

### 2. Frontend

From the repository root:

```bash
npm install
npm run dev
```

Open `http://localhost:5173`. Vite proxies `/api` to `http://127.0.0.1:8000`.

### 3. Analyze

1. Open **Repo Analyzer**.
2. Enter a public URL such as `https://github.com/tiangolo/fastapi`.
3. Review the snapshot summary, evidence index, and limitations.
4. Open **Content Studio** to generate and verify a draft.
5. Open **Visual Studio** to download a banner PNG or carousel PDF.
6. Publish manually: copy the verified text, attach the exported media, and open LinkedIn yourself.

## Configuration

All secrets are server-side environment variables. See `backend/.env.example` for the full list.

| Variable | Default | Notes |
| --- | --- | --- |
| `DATABASE_URL` | `sqlite:///./repovision.db` | Use `postgresql+psycopg://...` for PostgreSQL |
| `CORS_ORIGINS` | local Vite origins | Comma-separated exact origins |
| `GITHUB_TOKEN` | empty | Optional; raises GitHub API rate limits |
| `LLM_PROVIDER` | `none` | `none`, `openai`, or `ollama` |
| `OPENAI_API_KEY` | empty | Server-side only |
| `OPENAI_MODEL` | `gpt-4o-mini` | Model name |
| `OLLAMA_BASE_URL` | `http://localhost:11434` | Local Ollama server |
| `OLLAMA_MODEL` | `llama3.1` | Model name |
| `LINKEDIN_CLIENT_*` | empty | Optional in M1; preflight only |

Frontend:

| Variable | Default | Notes |
| --- | --- | --- |
| `VITE_API_BASE_URL` | `/api/v1` | Public API base; never put secrets in `VITE_*` |

**Never** place API keys or tokens in frontend environment variables. Vite embeds them in the
public bundle.

## Evidence guarantees

- Technologies come from manifests, configuration, source extensions, or README mentions. README-only
  mentions are marked inferred with low confidence.
- Features come only from README headings and bullets. If none are recognizable, the list is empty.
- Problem and solution are returned only when the README explicitly labels them.
- Security findings are pattern matches with file evidence. There is no score, grade, or CVE count.
- Analysis provenance is always `deterministic-v1`, `llm_used: false`.
- Draft claims store evidence IDs. The verifier blocks unsupported numbers, external URLs,
  first-person voice, superlatives, security guarantees, and unverified attribution.

## API

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/api/v1/health` | Liveness |
| GET | `/api/v1/config/status` | Non-secret runtime status |
| GET | `/api/v1/linkedin/preflight` | Required LinkedIn products/scopes |
| POST | `/api/v1/analyses` | Start an analysis |
| GET | `/api/v1/analyses/{id}` | Status and result |
| GET | `/api/v1/analyses/{id}/evidence` | Evidence index |
| GET | `/api/v1/analyses/{id}/content` | Drafts for a run |
| POST | `/api/v1/content` | Generate a draft |
| POST | `/api/v1/content/verify` | Verify text against evidence |

Errors use `{ "error": { "code", "message" }, "request_id" }`.

## Testing

```powershell
# Backend
cd backend
.\.venv\Scripts\python -m ruff check app tests migrations
.\.venv\Scripts\python -m pytest

# Frontend
npm run lint
npm run build
```

Verified on 2026-11-11:

- Backend: **26 passed**, 1 Starlette deprecation warning; `ruff` clean.
- Frontend: **lint clean**, production build passed; one chunk-size warning.
- Alembic upgrade/downgrade passed on temporary SQLite.
- PostgreSQL, live GitHub calls, live LLM calls, and browser E2E exports were **not** verified in this
  environment.

Details: [docs/REPOVISION_TESTING.md](docs/REPOVISION_TESTING.md).

## Documentation

- [Audit and remediation record](docs/REPOVISION_AUDIT.md)
- [Architecture](docs/REPOVISION_ARCHITECTURE.md)
- [Gap analysis](docs/REPOVISION_GAP_ANALYSIS.md)
- [Roadmap](docs/REPOVISION_ROADMAP.md)
- [Testing](docs/REPOVISION_TESTING.md)
- [Security notes](docs/REPOVISION_SECURITY.md)
- [Deployment](docs/REPOVISION_DEPLOYMENT.md)

## Project structure

```text
backend/
  app/
    api/routes/          health, config, analyses, content
    core/                application errors
    services/
      github/            URL parser, client, bounded snapshot
      analysis/          evidence, redaction, stack, features, testing, security, architecture
      content/           grounded drafts, verifier
      llm/               provider interface, OpenAI-compatible, Ollama
    config.py            environment settings
    db.py                SQLAlchemy engine/session
    models.py            analysis runs, evidence, drafts, fact checks
    schemas.py           API models
    main.py              FastAPI application
  migrations/            Alembic
  tests/                 backend test suite

src/
  api/                   typed API client
  components/            analyzer, content studio, visual studio, security, integrations, admin
  services/              banner/carousel builders, real PNG/PDF exports
  types/                 API and UI types
```

## Security

- Strict GitHub URL parsing and a fixed GitHub API host.
- No repository code execution.
- Secret-like values are redacted before evidence is stored.
- The browser receives configuration booleans, never secrets.
- LinkedIn publishing is always disabled in M1.
- `npm audit` currently reports 4 vulnerabilities (1 moderate, 3 high); see the security notes for
  the production-only breakdown and remediation policy.

Read [docs/REPOVISION_SECURITY.md](docs/REPOVISION_SECURITY.md) before deploying.

## License

MIT. See [LICENSE](LICENSE).
