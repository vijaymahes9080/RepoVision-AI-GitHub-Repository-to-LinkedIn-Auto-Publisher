# RepoVision gap analysis

This document separates what M1 actually does from what the original demo claimed and what remains
for later milestones. It is the reference for "is this real yet?" questions.

## Status legend

- **Implemented**: present in code and covered by automated tests or a verified command.
- **Implemented, limited**: real behavior with explicitly documented boundaries.
- **Not implemented**: absent. The UI shows a disabled panel or omits the feature; no sample data is
  substituted.

## Capability matrix

| Capability | Status | What exists in M1 | Gap / next milestone |
| --- | --- | --- | --- |
| Public GitHub snapshot ingestion | Implemented, limited | Strict URL validation, fixed API host, bounded tree/file/README reads, commit pinning | Live network path not verified from this machine; no private repository support |
| Evidence index | Implemented | Stored `evidence_items`, stable IDs, excerpts, paths, confidence | No full-file storage; excerpts are capped |
| Technology detection | Implemented, limited | Manifest, config, source extension, and README detection | Not an AST or build-system resolver; README-only items marked inferred |
| Feature extraction | Implemented, limited | README headings and bullets only | Non-README sources are not treated as features |
| Problem/solution extraction | Implemented, limited | Explicit README headings only | Empty when the README does not label them |
| API route discovery | Implemented, limited | Regex route declarations in selected files | Not a full framework router analysis |
| Testing/CI detection | Implemented, limited | Test paths, framework markers, CI config files | Tests are not executed |
| License detection | Implemented | License file signatures and GitHub metadata | Not legal advice; no compatibility analysis |
| Security review | Implemented, limited | Secret-like patterns, risky code patterns, committed `.env`, redaction | No dependency scan, CVE counts, grades, or penetration testing |
| Architecture inference | Implemented, limited | Grouping of detected technologies and top-level directories | Structural inference only; no runtime tracing |
| Grounded drafts | Implemented | Deterministic generator, claims with evidence IDs, optional LLM | LLM output is checked globally, not sentence-by-sentence |
| Fact verifier | Implemented, limited | Numbers, URLs, first-person, superlatives, security claims, attribution, technology names | Heuristic rules, not semantic entailment |
| Banner PNG export | Implemented | Real browser download from rendered node | No server-side rendering |
| Carousel PDF export | Implemented | Real multi-page 1080×1350 PDF | No automated visual regression test |
| LinkedIn configuration preflight | Implemented | Required products, scopes, and steps reported | No OAuth flow |
| LinkedIn OAuth | Not implemented | None | M2: app approval, HTTPS callback, state + PKCE, encrypted token storage |
| LinkedIn publishing | Not implemented | Always reported disabled | M2: manual-review publish action with explicit confirmation |
| Scheduling / queue | Not implemented | Disabled panel explaining requirements | M2/M3: durable queue, encrypted tokens, retries, cancel/edit |
| Engagement analytics | Not implemented | Disabled panel; no charts or metrics | M3: LinkedIn analytics scopes, stored post IDs, ingestion |
| Video short generation | Not implemented | Disabled panel | M3+: render worker, storage, licensed assets |
| Blog export | Not implemented | Disabled panel | M3: platform integrations and token storage |
| X/Twitter threads | Not implemented | Disabled panel | M3: X API approval, OAuth, rate limits |
| Resume bullets | Not implemented | Disabled panel; first-person claims blocked | Requires verified contributor identity and attested impact |
| Portfolio builder | Not implemented | Disabled panel | Requires hosting/deployment target |
| User accounts / auth | Not implemented | No login, no user table | Required before multi-user deployment |
| Durable analysis queue | Not implemented | FastAPI background task | Replace with Celery/RQ and a broker |
| Fact-check persistence | Not implemented | Verification computed per request | Persist `fact_checks` rows for audit history |
| PostgreSQL deployment | Not verified | Models and Alembic target PostgreSQL; SQLite exercised locally | Run migrations and tests against PostgreSQL in CI/staging |
| Docker / Compose | Not implemented | None | Add reproducible deployment assets |
| Live GitHub integration test | Not verified | `respx` mocks cover the client and API flow | Add a scheduled opt-in live smoke test |
| Live LLM integration test | Not verified | Adapters and fallback covered by unit behavior | Add opt-in provider test with a test key/model |
| Browser E2E exports | Not verified | Export code is real | Add Playwright coverage and inspect generated files |

## LinkedIn: what M1 does and does not do

M1 reports:

- whether all three LinkedIn settings are present as a boolean;
- the required products: **Sign In with LinkedIn using OpenID Connect** and **Share on LinkedIn**;
- the required scopes: `openid`, `profile`, `w_member_social`;
- the implementation steps for M2;
- `publishing_enabled: false` unconditionally.

M1 does not:

- start an OAuth authorization request;
- accept or store a member access token;
- call any LinkedIn API;
- upload media;
- create, schedule, or publish a post;
- display a connection, follower count, or engagement metric.

Real publishing requires an approved LinkedIn developer app, an HTTPS redirect URI, member consent,
server-side token encryption, and a review step. Those are M2 deliverables, not configuration toggles.

## Original claims corrected

| Original claim | M1 reality |
| --- | --- |
| "Fully cloud-hosted SaaS" | Local frontend + local FastAPI backend; no hosting or accounts |
| "Publishes directly via official OAuth" | No OAuth or publishing; manual copy and open LinkedIn |
| "GPT-5.5 engine" | Optional OpenAI-compatible/Ollama provider; deterministic fallback |
| "30-second short video" | Not implemented |
| "10-slide carousel" | Ten real slides exported to PDF, but generated only from snapshot facts |
| "AI security score / A+" | No score or grade; static pattern review only |
| "0 CVEs / 100% clean" | No dependency scan, no CVE data |
| "Analytics and growth insights" | Not implemented; no data collected |
| "Scheduled queue" | Not implemented |
| "342 stars, 89 forks" fixed demo numbers | Live metadata from the analyzed snapshot only |

## Definition of done for closing M1 gaps

The M1 gaps above are intentionally out of scope. Any future milestone should keep these rules:

1. Do not display a metric that was not fetched from a named source.
2. Do not show a success state until the underlying action completed and returned evidence of success.
3. Keep first-person and ownership claims blocked until contributor identity is verified.
4. Keep LinkedIn publishing disabled until OAuth, token storage, and explicit confirmation exist.
5. Keep security language descriptive ("pattern match", "review item") rather than evaluative
   ("secure", "grade", "clean").
