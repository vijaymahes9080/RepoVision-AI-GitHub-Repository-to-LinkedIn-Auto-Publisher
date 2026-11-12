# RepoVision testing and verification

Date of last verified run: 2026-11-11
Environment: Windows, Python 3.12.10, Node.js/npm, SQLite only (no PostgreSQL or Docker).

## Automated Test & Run Scripts (Windows)

RepoVision provides three turn-key batch scripts for automated setup, execution, and testing:

| Script | Responsibility | Command Equivalent |
| --- | --- | --- |
| `install.bat` | One-click environment bootstrap | Sets up venv, installs Python & Node packages, generates Fernet `TOKEN_ENCRYPTION_KEY`, creates `.env`, and stamps Alembic head. |
| `run.bat` | One-click dual-server boot | Concurrently starts FastAPI backend (:8000) and Vite frontend (:5173), and opens the browser. |
| `test.bat` | Comprehensive test runner | Executes pytest (38 tests), frontend build/lint, and Playwright E2E browser automation. |

---

## Backend

Setup:

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\python -m pip install -e ".[dev]"
```

Commands and actual results:

| Command | Result |
| --- | --- |
| `.\.venv\Scripts\python -m ruff check app tests migrations` | All checks passed |
| `.\.venv\Scripts\python -m pytest` | 38 passed, 1 warning |
| `alembic upgrade head` then `alembic downgrade base` with `DATABASE_URL=sqlite:///./migration_test.db` | Both migrations (`0001_initial`, `0002_linkedin`) upgraded and downgraded; temporary database removed |

The single pytest warning is a Starlette deprecation notice about installing `httpx2` for
`TestClient`. It is not a test failure.

### Test coverage

| File | What it verifies |
| --- | --- |
| `tests/test_url_and_redaction.py` | Strict GitHub URL acceptance/rejection and secret redaction |
| `tests/test_analysis.py` | Technology, feature, route, testing/CI, license, and security extraction; evidence linkage; redaction; snapshot-derived metrics |
| `tests/test_verifier.py` | First-person, number, URL, superlative, attribution, technology, and security-claim rejection; grounded draft passes verification; no invented features when the README lacks them |
| `tests/test_api.py` | Health/config honesty, LinkedIn preflight, invalid URL error contract, full mocked GitHub analysis → evidence → draft → verify flow, rate-limit failure handling |
| `tests/test_linkedin.py` | OAuth opt-in, state + PKCE start, callback token encryption, reused-state rejection, status, confirmation requirement, not-connected path, verifier rejection, image upload + publish success, failed-attempt auditing, disconnect, and config reflection |

Notable assertions:

- `/config/status` never contains secret values and reports publishing disabled while `LINKEDIN_ENABLED=false`.
- Scheduler and analytics capabilities are reported disabled with reasons.
- Injected credentials in test files are redacted from evidence and findings.
- `dependency_scan.status == "not_run"` and `vulnerabilities_found is None`.
- A rate-limited GitHub response yields a failed run with `GITHUB_RATE_LIMITED`, not a partial result.
- Drafts produced by the deterministic generator pass the verifier and stay under 2,900 characters.
- LinkedIn access and refresh tokens are stored as ciphertext and only decrypt with the configured key.
- A publish attempt is stored as `failed` when LinkedIn returns an error and only becomes `published`
  after a real API response with a post URN.

## Frontend

Commands and actual results:

| Command | Result |
| --- | --- |
| `npm run lint` | 0 errors, 0 warnings |
| `npm run build` | Passed (`tsc -b` + `vite build`) |
| `npm audit --omit=dev` | 3 vulnerabilities: 1 moderate, 2 high |
| `npm audit` | 4 vulnerabilities: 1 moderate, 3 high |

The build emits one warning: a JavaScript chunk is larger than 500 kB after minification. This is a
performance warning, not a build failure. `npm audit fix` was deliberately not run because it can
change dependency behavior without review.

## Migration verification

The Alembic revisions were applied and rolled back against a temporary SQLite database, including
`0002_linkedin`. PostgreSQL was not available in this environment. The models use portable SQLAlchemy
types and `psycopg` is a declared dependency, but a PostgreSQL migration run remains unverified and is
tracked in the gap analysis.

```powershell
cd backend
$env:DATABASE_URL='sqlite:///./migration_test.db'
.\.venv\Scripts\alembic upgrade head
.\.venv\Scripts\alembic downgrade base
Remove-Item -Force migration_test.db
```

## Manual verification checklist

These checks require a running backend and network access:

1. Start the backend with `.\.venv\Scripts\python -m uvicorn app.main:app --reload`.
2. Start the frontend with `npm run dev`.
3. Open `http://localhost:5173` and analyze a small public repository.
4. Confirm the progress stages advance and the result shows a real commit SHA.
5. Confirm technologies, features, and findings each show evidence IDs that exist in the evidence
   index.
6. Generate a draft; confirm claims are marked supported with evidence IDs.
7. Edit the draft to include `I built this with Rust and 500 stars`; confirm the verifier rejects it.
8. Export a banner PNG and a carousel PDF; confirm both files download and open.
9. Reload the page; confirm the active run is restored from `localStorage`.
10. Open Integrations and Runtime; confirm no secret value is displayed.
11. With LinkedIn configured, connect a member and confirm the browser returns to Integrations with a
    success notice and the member name.
12. Generate a draft, open Visual Studio, check the review box, and publish. Confirm the success panel
    shows a post URN; verify the post exists on LinkedIn.
13. Reject a publish attempt by removing confirmation, and confirm unsupported commentary is blocked
    by the verifier before any LinkedIn call.
14. Force a LinkedIn API failure and confirm the attempt is shown as failed, not published.

## Not covered

- Live GitHub API calls (DNS resolution failed in this environment). The client and API flow are
  covered with `respx` mocks.
- Live OpenAI-compatible or Ollama generation. Deterministic fallback is tested.
- PostgreSQL migrations and queries.
- Docker or container deployment.
- Browser end-to-end tests and automated inspection of exported PNG/PDF files for M2 (M1 export
  verification was performed earlier; M2 UI changes have not been re-run in a browser).
- Live LinkedIn OAuth, image upload, and posting. These are covered by `respx` mocks and require an
  approved LinkedIn app plus member consent.
- Scheduling and analytics, which are not implemented.
- Load, concurrency, and rate-limit behavior under parallel users.

## Continuous integration

`.github/workflows/ci.yml` runs on pushes to `main`, pull requests, and manual dispatch:

- backend: Python 3.12, dependency install, `ruff`, `pytest`, and an Alembic upgrade/downgrade on
  SQLite;
- frontend: Node.js 22, `npm ci`, `npm run lint`, and `npm run build`.

The workflow uses read-only repository permissions. It does not receive GitHub, LLM, or LinkedIn
secrets.

## Adding tests

- Put backend tests in `backend/tests/` and use the existing `client` and `clean_database` fixtures.
- Mock outbound HTTP with `respx`; tests must not depend on live GitHub or LLM access.
- Assert on evidence linkage, error codes, and honesty constraints, not only HTTP status codes.
- For new UI behavior, add component or Playwright tests; the current frontend checks are lint and
  type/build checks only.
