# RepoVision

**Evidence-first GitHub repository intelligence with grounded LinkedIn drafts.**

![Status](https://img.shields.io/badge/status-M2-6366f1)
![Backend](https://img.shields.io/badge/backend-FastAPI-009688)
![Frontend](https://img.shields.io/badge/frontend-React%20%2B%20Vite-61dafb)
![License](https://img.shields.io/badge/license-MIT-emerald)

RepoVision analyzes a **public GitHub repository**, stores evidence for each finding, and generates
LinkedIn drafts that are checked against that evidence. It also exports a real PNG banner and a real
multi-page PDF carousel in the browser.

This is an M2 implementation. It can publish a reviewed draft and banner to a connected LinkedIn
member when an approved LinkedIn app is configured. It does **not** schedule posts, collect analytics,
or produce security grades. No sample data is used to pretend that a disabled feature works.

## What works

- Public GitHub snapshot ingestion with strict URL validation and bounded reads.
- Deterministic detection of technologies, README features, problem/solution sections, API route
  declarations, testing/CI signals, license, and static security patterns.
- An evidence index. Every technology, feature, and security finding references stored evidence IDs.
- Grounded draft generation with style and length options.
- Multi-LLM engine supporting Google Gemini, xAI Grok, Groq, OpenRouter, DeepSeek, OpenAI, Ollama, and built-in deterministic fallback.
- A fact verifier for unsupported numbers, external URLs, first-person claims, superlatives,
  security guarantees, attribution, and unsupported technologies.
- Real browser-side exports: banner PNG via `html-to-image`, carousel PDF via `jsPDF`.
- LinkedIn member OAuth with state + PKCE, Direct Access Token support, encrypted token storage, image upload, and post creation through the LinkedIn REST API.
- Turnkey Windows one-click scripts: `install.bat`, `run.bat`, and `test.bat`.
- Terminal LinkedIn Bot CLI (`linkedin_bot.py`) for automated repository analysis and publishing.
- Playwright end-to-end browser automation suite (`scripts/e2e_verify.py`).
- Explicit publish confirmation plus a fresh evidence verification before every post.
- Honest configuration, LinkedIn preflight, and connection status screens.

## What is intentionally not in M2

| Module | Status | Why |
| --- | --- | --- |
| Scheduler and queue | Disabled | Needs a durable queue; publishing is synchronous |
| Engagement analytics | Disabled | Needs LinkedIn analytics scopes and real post data |
| Video, blog, X thread, resume, portfolio | Disabled | Each needs a real integration or verified authorship; sample outputs are not substituted |
| Dependency/CVE scanning | Not run | No vulnerability counts or security grades are reported |
| User accounts / multi-tenancy | Not implemented | M2 is a local, single-operator application |

LinkedIn publishing is disabled by default. It becomes available only when `LINKEDIN_ENABLED=true`
and all OAuth credentials plus `TOKEN_ENCRYPTION_KEY` are configured on the server.

The UI shows a "Not yet available" panel with the requirements for each planned module.

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

### Turnkey One-Click Start (Windows)

1. **Install Dependencies & Initialize Database**:
   Double-click `install.bat` (or run `./install.bat` in PowerShell). This configures the Python virtual environment, installs backend and frontend packages, generates the Fernet `TOKEN_ENCRYPTION_KEY`, initializes `.env`, and stamps the database.
2. **Launch Application**:
   Double-click `run.bat`. This concurrently boots the FastAPI backend on `http://127.0.0.1:8000` and the Vite frontend on `http://localhost:5173`, then automatically opens your browser.
3. **Run Full Verification Suite**:
   Double-click `test.bat`. Runs backend pytest (38 tests), frontend build/lint, and Playwright E2E browser automation.

---

### Manual Setup

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
5. Open **Visual Studio** to review the banner PNG or carousel PDF.
6. To publish, connect LinkedIn in **Integrations**, then check the confirmation box in Visual Studio
   and press **Publish post + banner**. The backend re-runs the verifier before calling LinkedIn.
7. Alternatively, copy the verified text and attach the exported media manually.

## Configuration

All secrets are server-side environment variables. See `backend/.env.example` for the full list.

| Variable | Default | Notes |
| --- | --- | --- |
| `DATABASE_URL` | `sqlite:///./repovision.db` | Use `postgresql+psycopg://...` for PostgreSQL |
| `CORS_ORIGINS` | local Vite origins | Comma-separated exact origins |
| `GITHUB_TOKEN` | empty | Optional; raises GitHub API rate limits |
| `LLM_PROVIDER` | `none` | `none`, `gemini`, `grok`, `groq`, `openrouter`, `deepseek`, `openai`, or `ollama` |
| `GEMINI_API_KEY` | empty | Google Gemini API Key |
| `GEMINI_MODEL` | `gemini-2.5-flash` | Gemini model name |
| `GROK_API_KEY` | empty | xAI Grok API Key |
| `GROK_MODEL` | `grok-2-latest` | Grok model name |
| `GROQ_API_KEY` | empty | Groq Cloud API Key (open-source fast inference) |
| `GROQ_MODEL` | `llama-3.3-70b-versatile` | Open-source model name |
| `OPENROUTER_API_KEY` | empty | OpenRouter API Key |
| `OPENROUTER_MODEL` | `deepseek/deepseek-chat` | Model routed through OpenRouter |
| `DEEPSEEK_API_KEY` | empty | DeepSeek Direct API Key |
| `DEEPSEEK_MODEL` | `deepseek-chat` | DeepSeek model name |
| `OPENAI_API_KEY` | empty | Server-side only |
| `OPENAI_MODEL` | `gpt-4o-mini` | Model name |
| `OLLAMA_BASE_URL` | `http://localhost:11434` | Local Ollama server |
| `OLLAMA_MODEL` | `llama3.1` | Model name |
| `LINKEDIN_CLIENT_*` | empty | Required for OAuth; set on the server only |
| `LINKEDIN_REDIRECT_URI` | empty | Registered HTTPS callback ending in `/api/v1/linkedin/oauth/callback` |
| `LINKEDIN_ACCESS_TOKEN` | empty | Optional direct Developer/Bot Access Token |
| `LINKEDIN_ENABLED` | `false` | Explicit opt-in for real posting |
| `TOKEN_ENCRYPTION_KEY` | empty | Fernet key used to encrypt member tokens at rest |
| `FRONTEND_URL` | `http://localhost:5173` | Destination for the OAuth redirect |

Generate the token encryption key once and store it in the server secret manager:

```bash
python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"
```

LinkedIn requires the **Sign In with LinkedIn using OpenID Connect** and **Share on LinkedIn**
products, the scopes `openid profile w_member_social`, and a redirect URI that exactly matches the
value registered in the LinkedIn developer app.

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
| POST | `/api/v1/linkedin/oauth/start` | Begin member OAuth with state + PKCE |
| GET | `/api/v1/linkedin/oauth/callback` | Exchange the OAuth code and store encrypted tokens |
| GET | `/api/v1/linkedin/status` | Connection readiness without exposing tokens |
| POST | `/api/v1/linkedin/disconnect` | Remove the stored connection |
| POST | `/api/v1/linkedin/publish` | Verify, upload image, and create a post |
| GET | `/api/v1/linkedin/attempts` | Audit log of publish attempts |

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

- Backend: **38 passed**, 1 Starlette deprecation warning; `ruff` clean.
- Frontend: **lint clean**, production build passed; one chunk-size warning.
- Alembic upgrade/downgrade (including `0002_linkedin`) passed on temporary SQLite.
- LinkedIn OAuth exchange, encrypted storage, image upload, publish success, and failure auditing
  are covered by `respx` mocks.
- PostgreSQL, live LinkedIn OAuth/posting, live GitHub calls, live LLM calls, and browser E2E exports
  were **not** verified in this environment.

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
    api/routes/          health, config, analyses, content, linkedin
    core/                application errors
    services/
      github/            URL parser, client, bounded snapshot
      analysis/          evidence, redaction, stack, features, testing, security, architecture
      content/           grounded drafts, verifier
      linkedin/          OAuth, token encryption, REST client, publish audit
      llm/               provider interface, OpenAI-compatible, Ollama
    config.py            environment settings
    db.py                SQLAlchemy engine/session
    models.py            analysis runs, evidence, drafts, fact checks, LinkedIn records
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
- LinkedIn member tokens are encrypted with Fernet before storage and are never returned to the
  browser or written to logs.
- Publishing is opt-in, requires `confirm=true`, re-verifies the draft against evidence, and only
  reports success after a real LinkedIn API response.
- Image upload URLs returned by LinkedIn are restricted to HTTPS LinkedIn/Licdn hosts.
- `npm audit` currently reports 4 vulnerabilities (1 moderate, 3 high); see the security notes for
  the production-only breakdown and remediation policy.

Read [docs/REPOVISION_SECURITY.md](docs/REPOVISION_SECURITY.md) before deploying.

## License

MIT. See [LICENSE](LICENSE).
