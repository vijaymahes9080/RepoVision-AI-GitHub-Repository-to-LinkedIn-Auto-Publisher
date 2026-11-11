# RepoVision deployment guide (M2)

M2 runs as two local processes: a FastAPI backend and a Vite frontend. This guide covers local setup,
a production-style deployment, and known hosting limits. Docker and PostgreSQL were not available in
the development environment, so those paths are documented but unverified here.

LinkedIn publishing additionally requires an approved LinkedIn developer app, a public HTTPS callback,
server-side credentials, and a Fernet token-encryption key.

## Prerequisites

- Python 3.12+
- Node.js 20.19+ or 22.12+ (Vite 8 requirement)
- npm
- Optional: PostgreSQL 15+ and Docker
- Optional: a GitHub token for higher API rate limits
- Optional: an OpenAI-compatible API key or a local Ollama model
- Optional: an approved LinkedIn app for publishing

## Backend setup

Windows PowerShell:

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\python -m pip install --upgrade pip
.\.venv\Scripts\python -m pip install -e ".[dev]"
Copy-Item .env.example .env
```

macOS/Linux:

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
python -m pip install -e ".[dev]"
cp .env.example .env
```

Edit `backend/.env` locally. Never commit it. At minimum, set:

```dotenv
APP_ENV=development
DATABASE_URL=sqlite:///./repovision.db
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

Apply migrations:

```powershell
.\.venv\Scripts\alembic upgrade head
```

Run the API:

```powershell
.\.venv\Scripts\python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Health check:

```powershell
Invoke-RestMethod http://127.0.0.1:8000/api/v1/health
Invoke-RestMethod http://127.0.0.1:8000/api/v1/config/status
```

Interactive API docs are at `http://127.0.0.1:8000/docs`.

## Frontend setup

From the repository root:

```powershell
npm install
npm run dev
```

Open `http://localhost:5173`. The Vite dev server proxies `/api` to `http://127.0.0.1:8000`, so the
default API base `/api/v1` works without extra configuration.

Production build:

```powershell
npm run build
npm run preview
```

The build output is `dist/`.

## Configuration reference

| Variable | Default | Purpose |
| --- | --- | --- |
| `APP_ENV` | `development` | Environment label |
| `API_PREFIX` | `/api/v1` | API route prefix |
| `DATABASE_URL` | `sqlite:///./repovision.db` | SQLAlchemy database URL |
| `CORS_ORIGINS` | local Vite origins | Comma-separated allowed origins |
| `GITHUB_TOKEN` | empty | Optional server-side GitHub token |
| `GITHUB_API_BASE` | `https://api.github.com` | Fixed GitHub API host |
| `GITHUB_TIMEOUT_SECONDS` | `20` | GitHub request timeout |
| `MAX_TREE_ENTRIES` | `5000` | Recursive tree entry budget |
| `MAX_ANALYZED_FILES` | `40` | Files selected for content reads |
| `MAX_FILE_BYTES` | `100000` | Per-file read limit |
| `MAX_TOTAL_BYTES` | `2000000` | Total analyzed byte budget |
| `MAX_README_BYTES` | `150000` | README read limit |
| `LLM_PROVIDER` | `none` | `none`, `openai`, or `ollama` |
| `OPENAI_API_KEY` | empty | Server-side key for an OpenAI-compatible API |
| `OPENAI_BASE_URL` | `https://api.openai.com/v1` | OpenAI-compatible base URL |
| `OPENAI_MODEL` | `gpt-4o-mini` | Model name |
| `OLLAMA_BASE_URL` | `http://localhost:11434` | Ollama server |
| `OLLAMA_MODEL` | `llama3.1` | Ollama model |
| `LLM_TIMEOUT_SECONDS` | `60` | Provider timeout |
| `LINKEDIN_CLIENT_ID` | empty | Required for OAuth; server-side only |
| `LINKEDIN_CLIENT_SECRET` | empty | Required for OAuth; server-side only |
| `LINKEDIN_REDIRECT_URI` | empty | Exact registered HTTPS callback |
| `LINKEDIN_ENABLED` | `false` | Explicit opt-in for real posting |
| `LINKEDIN_API_VERSION` | `202501` | `LinkedIn-Version` request header |
| `TOKEN_ENCRYPTION_KEY` | empty | Fernet key for member tokens at rest |
| `FRONTEND_URL` | `http://localhost:5173` | OAuth redirect destination |

LinkedIn setup:

1. Create a LinkedIn developer app and associate it with a verified company page.
2. Request **Sign In with LinkedIn using OpenID Connect** and **Share on LinkedIn**.
3. Register `https://<api-host>/api/v1/linkedin/oauth/callback` as an allowed redirect URI.
4. Put the client ID, secret, and exact redirect URI in the server environment.
5. Generate `TOKEN_ENCRYPTION_KEY` once and store it in a secret manager:
   `python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"`.
6. Set `LINKEDIN_ENABLED=true` only after the app is approved.
7. Keep the frontend origin in `FRONTEND_URL` and `CORS_ORIGINS` consistent.

`VITE_API_BASE_URL` is a frontend build-time variable. It must be a public URL and must never contain
a secret. When unset, the frontend uses same-origin `/api/v1`.

## PostgreSQL

Set a PostgreSQL URL:

```dotenv
DATABASE_URL=postgresql+psycopg://repovision:change-me@localhost:5432/repovision
```

Then run:

```powershell
.\.venv\Scripts\alembic upgrade head
```

The models and migration use portable SQLAlchemy types. PostgreSQL execution has not been verified
in this environment. Add a PostgreSQL service to CI or staging and run the full test suite before
production use.

## Production-style deployment

M2 does not include a Dockerfile, Compose file, or infrastructure templates. A minimal production
setup is:

1. Build the frontend with the public API URL:

   ```powershell
   $env:VITE_API_BASE_URL='https://app.example.com/api/v1'
   npm run build
   ```

2. Serve `dist/` from a static host or the reverse proxy.
3. Run the API with a production process manager:

   ```bash
   uvicorn app.main:app --host 127.0.0.1 --port 8000 --workers 2
   ```

4. Terminate TLS at a reverse proxy (Caddy, nginx, or a platform load balancer).
5. Proxy `/api` to the FastAPI process. Serving the frontend and API on the same origin avoids CORS.
6. Set `CORS_ORIGINS` to the exact frontend origin if they are separated.
7. Use PostgreSQL and a managed secret store.
8. Persist uploads/exports only if you add server-side storage; M2 exports happen in the browser and
   publishing sends the rendered banner directly to LinkedIn.
9. Add authentication before exposing the API to untrusted users.
10. Replace the in-process background task with a durable queue for production workloads.

Recommended headers at the proxy:

- `Strict-Transport-Security`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- A Content Security Policy that allows the fonts and API origins actually used

## GitHub Pages

The repository includes a GitHub Pages workflow that publishes `dist/`. GitHub Pages is static
hosting and cannot run FastAPI. The page will load, but analysis, drafts, and verification require a
reachable backend.

To make Pages useful, set a repository variable named `VITE_API_BASE_URL` to the public backend base
URL, for example `https://repovision-api.example.com/api/v1`. The deploy workflow passes it at build
time. Also add the Pages origin to the backend `CORS_ORIGINS`.

If no public backend exists, treat the Pages deployment as a UI preview with API features
unavailable, not as a working application.

## Operations

### Health and readiness

- `GET /api/v1/health` returns `{"status":"ok","version":"0.1.0"}`.
- `GET /api/v1/config/status` returns non-secret configuration and capability flags.
- `GET /api/v1/linkedin/preflight` returns required LinkedIn products/scopes and M2 steps.

### Database backup and reset

SQLite backup:

```powershell
Copy-Item backend\repovision.db backend\repovision-backup.db
```

Local reset:

```powershell
Remove-Item backend\repovision.db
cd backend
.\.venv\Scripts\alembic upgrade head
```

PostgreSQL: use `pg_dump`/`pg_restore` and your platform's backup tooling.

### Logs

The backend logs to stdout using the standard logging format. Do not log request bodies, tokens, or
authorization headers. Use a reverse proxy that redacts sensitive headers if you enable access logs.

## Troubleshooting

| Symptom | Likely cause | Action |
| --- | --- | --- |
| UI shows "API offline" | Backend not running or wrong base URL | Start uvicorn; check `/api/v1/health`; confirm `VITE_API_BASE_URL` |
| Browser CORS error | Frontend origin missing from `CORS_ORIGINS` | Add the exact scheme/host/port and restart the backend |
| `GITHUB_RATE_LIMITED` | Public GitHub rate limit | Configure `GITHUB_TOKEN` server-side, then retry |
| `REPOSITORY_NOT_FOUND` | Private or missing repository | Only public repositories are supported |
| Migration error | Wrong `DATABASE_URL` or stale local database | Verify the URL; recreate a local SQLite database if appropriate |
| LLM always falls back | Provider not configured or output failed verification | Check server logs, provider credentials, and model name |
| Export fails | Browser capture failure | Check the console; exports use DOM rendering and may fail in restricted browsers |
| `LINKEDIN_PUBLISHING_DISABLED` | `LINKEDIN_ENABLED` is false | Enable it after the LinkedIn app is approved |
| `LINKEDIN_NOT_CONFIGURED` | Missing client credentials or `TOKEN_ENCRYPTION_KEY` | Set all four values and restart the backend |
| OAuth redirect error | Redirect URI mismatch or expired state | Match the registered URI exactly; retry the connection from Integrations |
| Publish rejected by verifier | Commentary contains unsupported claims | Regenerate/fix the draft, re-run verification, then publish |
| Pages deployment loads but API fails | Static hosting has no backend | Set `VITE_API_BASE_URL` and deploy the API separately |

## Deployment checklist

- [ ] `.env` is not committed and contains strong, unique values.
- [ ] `DATABASE_URL` points at the intended database.
- [ ] `alembic upgrade head` completed.
- [ ] `CORS_ORIGINS` lists only real frontend origins.
- [ ] TLS is enforced.
- [ ] Secrets live in a secret store, not in the frontend bundle.
- [ ] Backend tests and frontend build pass on the deployment commit.
- [ ] A GitHub token with minimal scopes is configured if rate limits matter.
- [ ] LinkedIn app is approved and `LINKEDIN_ENABLED=true` is intentional.
- [ ] `LINKEDIN_REDIRECT_URI` exactly matches the registered HTTPS callback.
- [ ] `TOKEN_ENCRYPTION_KEY` is stored in a secret manager and backed up.
- [ ] Retention and backup expectations are documented for your environment.
