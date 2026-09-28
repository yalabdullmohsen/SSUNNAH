# VERCEL DEPLOYMENT ROOT CAUSE

| Field | Value |
|---|---|
| Generated | 2026-09-28 |
| Product | `artifacts/majalis` · React 19 · Vite 7 · Capacitor 8 · Vercel |
| Canonical domain | `https://www.ssunnah.com` |
| Baseline | `docs/architecture/SUNNAH_TECHNICAL_ARCHITECTURE_BASELINE.md` |
| Log access | No `VERCEL_TOKEN` in repo secrets — CLI inspect unavailable; diagnosis from GitHub Deployments + git ancestry |

## Failed deployments (measured)

| Order | GH deployment | Vercel dpl | Commit | State | When (UTC) |
|---|---|---|---|---|---|
| 1 | `6717296674` | `dpl_FMaX3KQwHGVdkdzEHy17FkfgbcEj` | `2478ebd7` (#2331 P2–P7) | **failure** | 2026-09-28T18:18:12Z |
| 2 | `6717842901` | `dpl_ECWtueNRuoPM1X6Mn8NbQVyyLFfU` | `0269e140` (#2332 docs) | **failure** | 2026-09-28T18:45:45Z |

## Last successful production

| Field | Value |
|---|---|
| Commit | `dba87a606` (#2330 mushaf editor) |
| GH deployment | `6716539790` |
| State | **success** — “Deployment has completed” @ 2026-09-28T17:40:33Z |
| Live `version.json` (still) | `dba87a60` · `builtAt=2026-09-28T17:40:07.818Z` |

## Project settings (repo-proven)

From `artifacts/majalis/vercel.json` + `artifacts/majalis/docs/VERCEL_DEPLOYMENT.md`:

| Setting | Value |
|---|---|
| Root Directory | `artifacts/majalis` |
| Framework | `vite` |
| Install | `corepack enable && cd ../.. && corepack pnpm install --frozen-lockfile --prod=false` |
| Build | `pnpm run build` |
| Output | `dist` |
| Git deploy | `main` only (`deploymentEnabled["*"]=false`) |
| Serverless functions (config) | `api/index.js`, `api/lessons/[id].js` |
| API rewrite | `/api/(.*)` → `/api/index` |

## Evidence that Vite/CI is NOT the failure mode

| Check | Result |
|---|---|
| GitHub CI on `2478ebd7` / `0269e140` | Build / Verify build **SUCCESS** |
| Local `pnpm run verify:ci` on integration tip | **PASS** |
| Import of handlers | `lib/api-handlers/*` load OK |

Therefore **not**: `VITE_ERROR` · `TYPECHECK_ERROR` · `PNPM_ERROR` (install/build succeed outside Vercel function packaging).

## Root cause (code-backed)

### Classification: `MONOREPO_ERROR` / Vercel Serverless surface regression (primary: **CONFIG_ERROR** in API entry layout)

**Responsible change:** Phase 2 commit on #2331 added **new Serverless entry files** under `artifacts/majalis/api/`:

```text
api/assistant.js
api/assistant/health.js
api/cron/sync-data.js
api/healthz.js
api/prayer-times.js
api/test-anthropic.js
```

### Proof by ancestry

| Tip | `artifacts/majalis/api/` tree | Production deploy |
|---|---|---|
| `dba87a606` (last good) | `_deps.mjs` · `index.js` · `lessons/[id].js` only | **SUCCESS** |
| `2478ebd7` (first fail) | above **+ 6 new entry files** | **FAILURE** |
| `0269e140` (docs only, same API tree) | same as first fail | **FAILURE** |

### Why this breaks Vercel but not GitHub CI

1. Vercel Root Directory = `artifacts/majalis` → every `api/**/*.js` becomes a **Serverless Function**.
2. Pre-P2 production relied on a **single** dispatcher (`api/index.js`) plus rewrite `/api/(.*)` → `/api/index`.
3. P2 baseline itself documented that those entry files were **missing** and that production uses the index rewrite (`docs/remediation/PHASE_2_API_BASELINE.md`).
4. Adding the files expands the Serverless surface (extra bundling / routing / function packaging). GitHub `verify:ci` runs Vite product build + tests — **it does not package Vercel Serverless the same way**.
5. Full build logs from Vercel CLI are **not readable** without `VERCEL_TOKEN` (OWNER_ACTION for log export). The git bisect-by-deploy is definitive for the **commit range** of the regression.

### Not the cause (ruled out)

| Candidate | Why ruled out |
|---|---|
| Contrast / mushaf editor | Tips `eef70667` / `dba87a60` deployed **successfully** |
| Docs-only #2332 | Failed only because tip still contained the new `api/*` entries |
| Wrong root / output / framework in `vercel.json` | Unchanged between last good and first fail |
| Missing secret failing the **site** shell | Would not flip GitHub Deployments to “Deployment has failed” for the same Vite build that CI greenlights; secrets fail-closed at runtime |

## Fix implemented (PR #2333)

Delete the six extra Serverless entries. Restore tree to last-good:

```text
artifacts/majalis/api/_deps.mjs
artifacts/majalis/api/index.js
artifacts/majalis/api/lessons/[id].js
```

Keep:

- `lib/api-dispatch.mjs` + `api-security-*` (P2 security)
- Root monorepo `api/*.js` re-exports → `lib/api-handlers/*` (non-Vercel / local)

## Verification plan after merge

1. Auto Deploy on `main` → GitHub status `Vercel – majalis-majalis` = success  
2. `https://www.ssunnah.com/version.json` commit == new main tip  
3. Smoke `/`, `/mushaf`, `/api/healthz`, `/search`, …

## Residual OWNER_ACTION

Add `VERCEL_TOKEN` (or paste build log) so future failures yield line-level bundler errors instead of ancestry-only diagnosis.
