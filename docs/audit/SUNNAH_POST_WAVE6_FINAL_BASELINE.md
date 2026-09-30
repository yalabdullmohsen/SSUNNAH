# SUNNAH — Post-WAVE6 Final Live Baseline (Phase 0)

**Measured at:** 2026-09-30T11:11:59Z  
**Method:** live Git + production HTTP + inventory scripts (no estimates)  
**Tip:** `origin/main` = `b0f1774d7cd71a6d33806eda7a47088be9463c02`

## MAIN AND PRODUCTION

| Field | Value |
|---|---|
| `origin/main` tip | `b0f1774d` — WAVE6 seal `#2384` |
| WAVE6 product PR | `#2383` merge `b38e51775` · MERGED 2026-09-30T10:42:05Z |
| WAVE6 seal PR | `#2384` merge `b0f1774d7` · MERGED 2026-09-30T10:52:18Z |
| Production URL | `https://www.ssunnah.com` |
| Production `version.json` | `commit/shortCommit/commitSha` = `b0f1774d` · `builtAt=2026-09-30T10:53:56.116Z` · `ref/branch=main` |
| MATCH | **YES** — production == `origin/main` |
| Home smoke | HTTP 200 |

## OPEN PRS (non-blocking / out of scope)

| PR | Title | State |
|---|---|---|
| #2299 | native widgets phase 1 | OPEN |
| #1791 | mobile offline-first | DRAFT |

No open WAVE7–13 closure PRs at measurement time.

## WAVE6 STATUS

`WAVE6_MERGED_AND_DEPLOYED_DEVICE_HOLD` — device Mushaf matrix remains **DEVICE_REQUIRED**.

## VISUAL DEBT (live inventory)

| Metric | Value | Ceiling |
|---|---:|---:|
| cssFiles | 356 | 356 |
| ruleBlocksApprox | 20037–20637 (two counters) | — |
| `!important` | 4787 | 4787 |
| hexInCss | 8988 (pre-WAVE7) · WAVE7 tip → 8979 | 8988 → lowered to 8979 in WAVE7 |
| rgbHslInCss | 2129 | 2129 |
| boxShadowDecls | 1113 | 1113 |
| borderRadiusPxDecls | 1303 | 1303 |
| zIndexRawDecls | 265–266 | 265 |
| inlineColorStyleMatches | 87 | 87 |
| mjDeclarations | 193 | 193 |
| mjDeclOutsideAllowlist | **0** | 0 |
| sfTokenRefs / ssTokenRefs | 688 / 722 | floors 688 / 722 |
| officialButtonImportFiles | 176 | floor 176 |
| rawButtonFiles | 192 | 192 |
| mainSyncCssImports | 22 | — |
| mainDeferredCssImports | 53 | — |

Source: `artifacts/majalis/reports/visual-system-baseline.json` + `visual-system-debt-budget.json` + `scripts/_wave7-baseline-measure.mjs`.

## INTERACTION DEBT (live inventory)

| Metric | Value | Ceiling / Floor |
|---|---:|---:|
| rawButtonFiles | 192 | ≤192 |
| rawButtonElements | 774 | ≤774 |
| divSpanOnClick | 59 | ≤59 |
| formButtonsMissingType | 0 | ≤0 |
| floatingControlFileMentions | 10 | ≤10 |
| buttonRelatedImportantApprox | 1262 | ≤1262 |
| buttonRelatedHexApprox | 1723–1728 | ≤1728 |
| officialButtonImportFiles | 176 | ≥176 |
| iconButtonConsumerFiles | 31 | — |
| actionButtonConsumerFiles | 7 | ≥7 |

## CSS IMPORT GRAPH (cascade issue)

Sync∩deferred allowlist (WAVE5):

1. `visual-identity-unify.css` — **ALLOWED_CASCADE_REIMPORT** after `final-release`
2. `dark-mode-recovery.css` — **ALLOWED_CASCADE_REIMPORT** after `final-release`
3. `interaction-states.css` — after dark deferred stack

Proven conflicts (WAVE7 input):

| Conflict | Sync winner | `final-release` override | Notes |
|---|---|---|---|
| `--color-text-muted` | unify → `var(--mj-ink-2)` | `var(--mj-muted)` | real token fight |
| `--shadow-soft` | unify → `var(--mj-sh)` | `var(--e-2)` | `--e-2` aliases to `--mj-sh` today; still reload-bound |
| Dark `.bottom-nav*` | recovery `!important` + `--dm-*` | final `!important` chrome | class overlap ×31; order-dependent |

Selector-string intersection unify∩final = 0; class-name overlap = 26. recovery∩final class overlap = 31.

## ROUTE QUALITY MATRIX

| Field | Value |
|---|---|
| File | `docs/audit/ROUTE_QUALITY_MATRIX.json` |
| generatedAt | 2026-09-30T08:10:08Z |
| totalRoutes | 415 |
| publicRoutes | 372 |
| adminRoutes | 42 |
| WAVE4 critical closure | limited high-traffic set COMPLETE with `wave4TestRef` |
| Remaining | vast majority fields still PENDING (honest default) |

## DEVICE QA REGISTER

All physical device rows remain **DEVICE_REQUIRED** (see `docs/audit/DEVICE_QA_REGISTER.md`). WAVE6 fluidity = code+gates green; device 25/100 turns not claimed.

## CRITICAL CSS / STARTUP (WAVE5 held)

| Metric | Post-WAVE5 held value |
|---|---|
| Critical gzip L9 | 57171 (budget 61440 · margin 4269) |
| Budget raised? | **no** |
| FOUC / theme boot | `mj-theme-boot` + sync recovery |
| Prayer theme leak | CODE_FIXED prior waves |

## MUSHAF

| Gate class | Status |
|---|---|
| Integrity / 604 / mapping / WAVE6 fluidity gates | PASS on tip (repo) |
| Real-device fluidity / VoiceOver / memory | **DEVICE_REQUIRED** |

## STALE DOC CONFLICTS (live wins)

| Doc | Claim | Live truth |
|---|---|---|
| `CURRENT_PROJECT_STATUS.md` | tip `24a5193ae` | tip `b0f1774d` MATCH prod |
| Older closure baselines | pre-WAVE6 SHAs | superseded; keep as history |

## CLASSIFICATION SNAPSHOT (input to WAVE7+)

| Class | Examples |
|---|---|
| FIXABLE_IN_REPOSITORY | reload-to-win unify/recovery · card/shadow/radius raw · Admin interaction · Mushaf control semantics · Route matrix expansion · index.css decomposition |
| DEVICE_REQUIRED | Mushaf device matrix · startup CLS/FPS · VO/TalkBack · Adhan delivery |
| OWNER_ACTION | Store signing · licenses · SQL/RLS · secrets |
| KEEP_JUSTIFIED / MUSHAF_SPECIAL / ADMIN_ONLY | per prior authority docs |

## PHASE 0 VERDICT

Gate open for WAVE7: production MATCH · WAVE6 sealed · inventories frozen above · cascade reload still required by gates until absorb.

Raw JSON: `docs/audit/_post_wave6_baseline_raw.json` (measurement artifact).
