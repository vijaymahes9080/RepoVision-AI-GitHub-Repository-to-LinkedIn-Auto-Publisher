# RepoVision audit — Phase Zero and remediation record

Date: 2026-11-11
Scope: the repository as found before M1 implementation, plus the changes made in M1. This document
is a historical M1 record. M2 (LinkedIn OAuth and controlled publishing) is documented in the roadmap,
architecture, security, and testing notes.

## Baseline inventory

The tracked project was a React + Vite + TypeScript + Tailwind single-page demo. It contained:

- a large presentational UI with 13 tabs;
- client-side generator modules for posts, banners, carousels, video scripts, blog articles,
  Twitter threads, resume bullets, portfolios, and a "security audit";
- hard-coded "user", "analysis", "analytics", and "scheduled post" data;
- no backend, database, migrations, authentication, or automated tests;
- a GitHub Pages deployment workflow;
- a README claiming a cloud SaaS with OAuth publishing, GPT-5.5, analytics, and security scoring.

Baseline commands on the untouched tree:

| Command | Result |
| --- | --- |
| `npm run build` | Passed |
| `npm run lint` | 0 errors, 31 warnings |

## Defects found and removed

| Defect | Example in the baseline | M1 remediation |
| --- | --- | --- |
| Fabricated repository analysis | Hard-coded `RepoVision-AI` analysis with 342 stars, 89 forks, invented architecture and technologies | Replaced with API-backed analysis of a real, bounded GitHub snapshot |
| Invented technology stack | `OpenAI GPT-5.5`, `Redis`, `AWS S3`, `Cloudflare R2` without evidence | Technologies are detected from manifests, configuration, source extensions, and README mentions, each with evidence IDs |
| Fabricated metrics | Stars, forks, views, engagement rates, follower growth, "+7.6%" | Removed. Only GitHub API metadata and snapshot counts are shown |
| Fake OAuth | Hard-coded LinkedIn client ID and an authorization URL in `linkedInLiveService.ts` | Deleted. M1 reports LinkedIn configuration and preflight requirements only |
| Simulated publishing | "Published successfully" flows, queue counts, scheduled posts | Deleted. Content Studio copies text and opens LinkedIn manually; no success state is claimed |
| Fake exports | Buttons that reported success without producing a file | Replaced with real browser-side PNG (`html-to-image`) and PDF (`jsPDF`) downloads |
| Fake security scoring | `94/100`, `A+`, `0 CVEs`, "100% Clean Audit" | Replaced with static pattern findings, license detection, and an explicit "dependency scan not run" state |
| Dangerous admin UI | Masked API keys and LinkedIn tokens rendered and edited in the browser | Replaced with a read-only runtime view that exposes only booleans, never secret values |
| Invented ownership/impact claims | Resume bullets and first-person marketing copy | Resume module disabled; verifier blocks first-person voice in M1 |
| README overclaims | "Fully cloud-hosted SaaS", "publishes directly to LinkedIn", "GPT-5.5 engine" | README rewritten to match the implementation and its limits |

## Files deleted

Frontend views that only displayed fabricated data:

- `src/components/AnalyticsView.tsx`
- `src/components/BlogStudio.tsx`
- `src/components/PortfolioView.tsx`
- `src/components/ResumeView.tsx`
- `src/components/SchedulerView.tsx`
- `src/components/TwitterStudio.tsx`
- `src/components/VideoStudio.tsx`

Client-side fake generator/audit services:

- `src/services/aiContentGenerator.ts`
- `src/services/analyticsService.ts`
- `src/services/blogGenerator.ts`
- `src/services/githubAnalyzer.ts`
- `src/services/linkedInLiveService.ts`
- `src/services/portfolioBuilder.ts`
- `src/services/publisherService.ts`
- `src/services/resumeBulletGenerator.ts`
- `src/services/securityAuditor.ts`
- `src/services/twitterThreadGenerator.ts`
- `src/services/videoScriptGenerator.ts`

Stale product screenshots under `public/assets/` were also removed because they depicted features that
do not exist in M1.

## What M1 adds

- FastAPI backend with a versioned `/api/v1` API.
- SQLAlchemy models and an Alembic initial migration, verified on SQLite. Models target PostgreSQL
  but a PostgreSQL deployment has not been run in this environment.
- Strict GitHub URL parsing, a fixed GitHub API host, bounded snapshot reads, and no repository code
  execution.
- Deterministic analysis: technologies, README features, problem/solution extraction, API route
  declarations, testing/CI signals, license and static security patterns, and inferred structure.
- A stored evidence index. Every detected technology, feature, and security finding references one
  or more evidence IDs.
- Grounded draft generation with an optional OpenAI-compatible or Ollama provider. Without a provider,
  a deterministic generator is used and labelled as such.
- A fact verifier that rejects unsupported numbers, external URLs, first-person voice, superlatives,
  security guarantees, unverified attribution, and unsupported technology names.
- Real PNG banner and multi-page PDF carousel exports, rendered locally in the browser.
- Honest disabled views for scheduler, analytics, video, blog, X, resume, and portfolio modules.

## Verification after remediation

| Command | Result |
| --- | --- |
| `backend: .venv\Scripts\python -m pytest` | 26 passed, 1 warning |
| `backend: .venv\Scripts\python -m ruff check app tests migrations` | All checks passed |
| `backend: alembic upgrade head` / `downgrade base` on temporary SQLite | Both succeeded |
| `npm run lint` | 0 errors, 0 warnings |
| `npm run build` | Passed; one Vite chunk-size warning |

## Known remaining issues

- No live GitHub API request was verified from this machine (DNS resolution failed). GitHub behavior
  is covered with `respx` mocks.
- No live LLM call was verified: no API key or Ollama model was confirmed available.
- PostgreSQL and Docker were not available locally, so only SQLite was exercised.
- No browser end-to-end test downloads and inspects the PNG/PDF output.
- `npm audit` reports 4 vulnerabilities (1 moderate, 3 high); production dependencies account for
  3 of them (1 moderate, 2 high). No automatic upgrade was applied.
- LinkedIn OAuth, publishing, scheduling, analytics, and multiple content formats are not implemented.
- The `fact_checks` table exists in the schema, but verification results are computed on request and
  are not yet persisted.
- Analysis runs in a FastAPI background task, not a durable queue.
