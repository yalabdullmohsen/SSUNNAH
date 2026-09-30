# WAVE 1 — Identity Cascade Collapse Report

| Field | Value |
|---|---|
| Branch | `cursor/final-repo-closure-wave1` |
| Baseline tip | `d5262c77` (= production MATCH at Phase 0) |
| Status | **IMPLEMENTED** (awaiting merge/deploy) |

## IMPLEMENTATION_FROZEN (WAVE 1)

Declared before product patches. Scope Manifest:

| | |
|---|---|
| **Goal** | Collapse duplicate deferred identity imports; document layer taxonomy; reduce reload-only-to-win where safe without FOUC |
| **Files** | `main.tsx` · identity CSS (classify only / minimal hex fallback cleanup) · gates · this report · baseline |
| **Tests** | unify/dark-recovery gates · visual-system inventory/debt · focused main import gate · verify:ci |
| **Out** | Deleting unify/recovery files · legacy page CSS · raw buttons · mushaf/prayer · budget raises |

## Layer taxonomy (live `main.tsx`)

| File | Sync/Deferred | Status | Notes |
|---|---|---|---|
| `theme.css` | sync | CANONICAL | `--mj-*` |
| `sunnah-foundation-tokens.css` | sync | CANONICAL | `--sf-*` |
| `sunnah-foundation-v2.css` | sync | CANONICAL | `--sf2-*` |
| `ssunnah-theme-api.css` | sync | CANONICAL | `--ss-*` bridge |
| `theme-aliases.css` | sync | CANONICAL | alias → `--mj-*` |
| `brand-v4.css` · `tokens.css` · `design-tokens.css` | sync | ACTIVE_COMPATIBILITY | still in first paint |
| `visual-redesign-v2-tokens.css` | sync | ACTIVE_COMPATIBILITY | vars only |
| `sunnah-identity-reset.css` | sync | ACTIVE_COMPATIBILITY | |
| `visual-identity-unify.css` | sync + deferred after final-release | ACTIVE_COMPATIBILITY | deferred reload = cascade seal (gate-bound) |
| `sections-calm-polish.css` | sync | ACTIVE_COMPATIBILITY | |
| `ssunnah-ux-polish.css` | sync | ACTIVE_COMPATIBILITY | |
| `interaction-states.css` | sync + deferred | ACTIVE_COMPATIBILITY | late win after dark layers |
| `dark-mode-recovery.css` | sync + deferred after final-release | ACTIVE_COMPATIBILITY | html.dark scoped |
| `final-release.css` | deferred | ACTIVE_LEGACY | forces unify/recovery re-append |
| `design-system.css` | deferred | ACTIVE_LEGACY / COMPATIBILITY | |
| `green-surface-system.css` | deferred | ACTIVE_COMPATIBILITY | |
| `premium-dark-refine.css` | boot-dark + deferred | ACTIVE_COMPATIBILITY | |
| `m2030/*` | deferred | ACTIVE_LEGACY | |
| `card-decorative-strip-cleanup.css` | deferred (was ×2) | ACTIVE_COMPATIBILITY | **deduped in this wave** |

## Cascade problem

`final-release.css` loads late and overrides identity. Product historically re-imports full `visual-identity-unify` + `dark-mode-recovery` after it so rules win. That is **reload-to-win**, not a second source of truth.

**Absorb path (not fully completed this wave):** move only the final-release conflict winners into `theme-aliases` (or trim final-release) → then drop full-file re-import. Gates currently **require** deferred unify reload — update only with parity proof.

## Changes in this wave

1. Remove duplicate deferred `card-decorative-strip-cleanup` import.
2. Collapse dual-branch deferred `interaction-states` into a single post-dark import site.
3. Document taxonomy + residual BLOCKED absorb work.
4. Re-measure inventories; lower deferred import count if metrics allow.

## Parity checklist (manual / CI)

Light · Dark · System · RTL · refresh · cold start · warm nav · deep link — priority: Home, Search, Quran Hub, Mushaf, Prayer, Lessons, Hadith, Settings, My Learning, Login/Register. Admin v3 public edge remains 404 by design.

## Metrics measured

| Metric | Before | After |
|---|---:|---:|
| mainDeferredCssImports | 58 | **53** (−5) |
| hexInCss | 9044 | **9042** (−2) |
| mjDeclOutsideAllowlist | 0 | **0** |
| important | 4798 | 4798 (held) |
| mainSyncCssImports | 22 | 22 |
| critical CSS gzip | 60129 | **60125** (margin +4 B; ≤61440) |

## Residual (follow-up waves)

- Full absorb of unify/recovery deferred reload into theme-aliases still **BLOCKED** until final-release conflict winners are ported with visual parity.
- Legacy page CSS → Wave 2.
- Raw buttons → Wave 3.
