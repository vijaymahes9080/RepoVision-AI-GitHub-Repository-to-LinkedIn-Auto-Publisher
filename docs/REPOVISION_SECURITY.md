# RepoVision security notes (M1)

## Scope

M1 is a local, single-operator application. It analyzes public GitHub repositories and generates
drafts. It does not have user accounts, roles, multi-tenancy, or LinkedIn publishing. The controls
below are appropriate for that scope; they are not sufficient for a public multi-user deployment
without the additional work listed at the end.

## Threat model

| Threat | M1 control | Residual risk |
| --- | --- | --- |
| Server-side request forgery (SSRF) | Strict `https://github.com/{owner}/{repo}` parsing; fixed `https://api.github.com` base; redirects disabled | The fixed GitHub host is still an outbound dependency |
| Private repository access with a server token | Only public URLs are accepted; a configured token is used for public rate limits | A token with broad scopes could access more than intended if the URL parser were bypassed; review token scopes |
| Secret leakage in analysis output | Secret-like patterns are redacted before evidence is stored; findings store a redacted placeholder | Redaction is best-effort and pattern-based; unknown formats may pass through |
| Secret leakage to the browser | Config API returns booleans and non-secret metadata only; no token inputs in the UI | Browser devtools still show public analysis content |
| Repository code execution | No clone, install, build, or execution; only file text is read | Regex analysis can still be fooled by malicious text |
| Prompt injection via repository content | LLM receives a facts JSON payload; output must be strict JSON and pass the verifier; deterministic fallback | The verifier is heuristic, not a proof of grounding |
| Cross-site scripting | React escapes text; no `dangerouslySetInnerHTML` in application code | User-edited drafts are rendered as text only |
| CORS abuse | Explicit origin allowlist; credentials disabled; limited methods/headers | A permissive `CORS_ORIGINS` setting would weaken this |
| Unauthorized API use | None; no authentication | Anyone who can reach the API can start analyses and read runs if they know/guess IDs |
| Enumeration of stored runs | Run IDs are UUIDs | UUIDs are not an authorization mechanism |
| Dependency compromise | Pinned ranges and a CI install step | No SCA gate yet; `npm audit` reports known issues |
| Token leakage in logs | Tokens are not logged by application code; GitHub errors avoid printing authorization headers | Platform/proxy logs must also be configured carefully |

## Secrets

All secrets are server-side environment variables:

- `GITHUB_TOKEN`
- `OPENAI_API_KEY`
- `LINKEDIN_CLIENT_ID`, `LINKEDIN_CLIENT_SECRET`, `LINKEDIN_REDIRECT_URI`

Rules:

- Never place secrets in `VITE_*` variables. Vite inlines those into the public bundle.
- Never commit `.env` files. `.gitignore` excludes `.env`, `.env.local`, and related variants.
- `backend/.env.example` contains names and safe placeholders only.
- The config endpoint exposes `github_token_configured`, `llm_configured`, and
  `linkedin_configured` as booleans. It never returns values.
- LinkedIn publishing is hard-coded to `false` in M1, even when credentials are present.
- Rotate any credential that was ever committed to git history or pasted into a client-side file.
  The deleted demo contained a hard-coded LinkedIn client ID; treat it as compromised/invalid.

## GitHub ingestion

- Accepted format: `https://github.com/{owner}/{repo}` with optional `www.` and `.git`.
- Rejected: non-HTTPS schemes, credentials in the URL, ports, query strings, fragments, subpaths,
  non-GitHub hosts, and hostname tricks such as `github.com.evil.example`.
- The GitHub client uses a configured base URL, not a user-supplied one, and does not follow
  redirects.
- Reads are bounded: 5,000 tree entries, 40 analyzed files, 100 KB per file, 2 MB total, 150 KB
  README.
- Lockfiles, vendored dependencies, build output, binaries, and minified assets are skipped.
- File responses that are not base64 text, exceed the size limit, or contain NUL bytes are skipped.
- GitHub errors are mapped to stable application errors; rate-limit responses include only reset
  metadata.

## Redaction

`app/services/analysis/redaction.py` detects common credential formats:

- private key blocks;
- OpenAI-style `sk-...` keys;
- GitHub tokens (`ghp_`, `gho_`, `ghu_`, `ghs_`, `ghr_`);
- AWS access key IDs;
- credential-like assignments to key/secret/token/password/authorization variables.

Placeholder values containing markers such as `your`, `example`, `process.env`, or `os.environ` are
left readable so documentation remains useful. Redacted evidence stores a placeholder instead of the
value. The scanner also flags committed `.env` files by path without reading or displaying their
contents.

Limitations: this is not a secret scanner with entropy analysis, and it cannot guarantee detection
of every format. Do not rely on it as a pre-commit control.

## Prompt and output safety

The optional LLM path:

- receives repository metadata, documented features, detected technologies, testing/security
  summaries, limitations, and up to 20 evidence excerpts;
- is instructed to use only those facts, avoid first-person voice, avoid invented metrics and
  superlatives, and state that the analysis is static;
- must return strict JSON with a bounded body length;
- must pass the verifier before being stored; otherwise the deterministic draft is used.

Repository text is untrusted data. It can contain instructions aimed at the model. The provider has
no tools and no access to credentials, and its output is filtered. The verifier remains heuristic:
it checks numbers, URLs, first-person pronouns, known technology names, superlatives, security
claims, and attribution phrases. It does not prove semantic entailment.

If an external LLM provider is used, repository excerpts leave the server and are subject to that
provider's data policy. This is documented here so operators can make an informed choice. With
`LLM_PROVIDER=none`, no repository content leaves the server.

## API and browser

- CORS uses an explicit origin list from `CORS_ORIGINS`. Credentials are disabled.
- Allowed methods are `GET`, `POST`, and `OPTIONS`; allowed headers are `Content-Type` and
  `X-Request-ID`.
- Responses include an `X-Request-ID` for correlation.
- Application errors use a consistent envelope and do not include stack traces.
- The frontend stores only the active run ID in `localStorage`. Drafts and analysis results are held
  in memory for the session.
- Exports are rendered and downloaded locally. No media is uploaded.

## Data handling

- Analysis results, evidence excerpts, and drafts are stored in the configured database.
- Evidence excerpts are capped and redacted, but they still contain repository content.
- There is no automatic retention or deletion job in M1. A local SQLite database persists until
  deleted.
- No analytics, LinkedIn profile data, or member tokens are collected.
- There are no user accounts, so all runs are effectively owned by the operator.

Deployments must add retention, deletion, and access controls before handling third-party data at
scale.

## Dependency risk

`npm audit` at the time of writing reports:

- 4 total vulnerabilities: 1 moderate, 3 high;
- 3 production vulnerabilities: 1 moderate, 2 high (transitive packages such as `nanoid`,
  `postcss-selector-parser`, and `source-map-js`).

`npm audit fix` was not run automatically because it can change lockfile resolution and behavior.
Review and upgrade dependencies deliberately, then re-run lint, build, and tests.

The backend installs pinned major ranges from `pyproject.toml`. There is no automated Python
dependency vulnerability scan in M1; add one (for example `pip-audit`) in CI.

## Required before public/multi-user deployment

1. Authentication and authorization, with tenant isolation.
2. Per-user rate limits and quotas.
3. Encrypted secret storage or a managed secret store.
4. HTTPS termination and strict security headers.
5. Durable queue with isolated workers.
6. Retention, export, and deletion controls.
7. Dependency scanning and a patch cadence.
8. Audit logging for publish attempts and administrative actions.
9. LinkedIn OAuth with `state`, PKCE, token encryption, and revocation.
10. A reviewed privacy policy covering repository content and optional LLM processing.

## Reporting a vulnerability

Do not open a public issue with exploit details or secrets. Contact the repository owner privately
with reproduction steps, affected version/commit, and impact. Rotate any exposed credential before
sharing logs.
