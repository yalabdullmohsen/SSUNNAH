# LIVE UNIFICATION BASELINE — Phase U0

| Field | Value |
|---|---|
| Locked at (UTC) | `2026-10-01T10:34:00Z` |
| Program | SUNNAH 100% VISUAL, INTERACTION AND STARTUP UNIFICATION |
| Required state | `BASELINE_LOCKED` |
| Current verdict | `UNIFIED_PARTIAL` |
| Startup verdict | `STARTUP_FLICKER_PARTIALLY_FIXED` |

> Source-of-truth order: live code · GitHub CI · production `version.json` · then historical reports.  
> Stale claim in program prompt (“PR blocked by Color Contrast / Visual Snapshot”) is **superseded** by live evidence below.

---

## CODE_BASELINE

| Item | Value |
|---|---|
| Tip | `origin/main` @ `cb2d3636d` |
| Parents | `7d4b30443` (#2430 flicker final partial) ← `96db28345` (#2429) |
| Docs tip | `cb2d3636d` = #2431 production evidence after #2430 |
| Danger paths | none open for unification train |
| Worktrees (local) | main worktree + admin-final / flicker-rca detached (out of scope) |
| Stale open PRs (not this train) | #2299 native widgets (CONFLICTING) · #1791 mobile offline (draft) |

## PRODUCTION_BASELINE

| Item | Value |
|---|---|
| Endpoint | `https://www.ssunnah.com/version.json` |
| Live commit | `cb2d3636` |
| Match tip | **MATCH** (`main` tip == production) |
| Built at | `2026-10-01T09:54:41.898Z` |

## ACTIVE_PR / ACTIVE_HEAD / CI

| Item | Value |
|---|---|
| ACTIVE_PR (unification) | **none** — #2430 and #2431 already merged |
| ACTIVE_HEAD | `cb2d3636d` |
| Last green product gates | PR #2430 run `36842431440` |
| Color contrast | **SUCCESS** |
| visual-snapshot | **SUCCESS** |
| Verify build / ci-required | **SUCCESS** |
| Prompt claim “CI blocked” | **STALE** — closed on #2430 before this baseline |

## MEASUREMENT_BASELINE (production, tip `7d4b3044` evidence; tip docs `cb2d3636` MATCH)

Source: `docs/performance/evidence/zero-startup-flicker-prod-7d4b3044/summary.json`  
Viewport: **390×844 @ DPR 2** · cache disabled · Chrome headless / CDP.

| Route | FP ms | CLS | themeMutAfterFP | fontΔ | bgΔ | sheets early→final | Notes |
|---|---:|---:|---:|---:|---:|---|---|
| `/` | 684 | **0.0257** | 0 | 0 | 0 | 3→108 | hero presence false→true; CLS > 0.01 |
| `/search` | 724 | 0.0044 | **2** | 0 | 0 | 3→72 | header/bottom presence mount |
| `/quran-hub` | 688 | 0.0044 | **2** | 0 | 0 | 3→76 | chrome presence |
| `/mushaf` | 712 | **0.0000** | **2** | 0 | 0 | 3→54 | CLS protected |
| `/prayer-times` | 872 | **0.0552** | **2** | 0 | 0 | 3→55 | CLS > 0.01 |

Protected closed items (must not regress):

- fontΔ = 0 · bgΔ = 0 · Root Typography Authority · size-adjust 97%
- no html/body/#root repaint from `applyPageChromeDom`
- `data-app-booting` / `data-ab` (no class mutation for boot)
- Home themeMut = 0 in last prod measure · Mushaf CLS = 0
- Prayer route ownership · countdown isolation · unified dark loader
- Back Authority P7 (scope) · soft-cards.css removed · ACTIVE_LEGACY page CSS = 0 · mjDeclOutsideAllowlist = 0

---

## LIVE INVENTORY (official scripts @ tip)

Measured `2026-10-01T10:34:09Z` via:

- `artifacts/majalis/scripts/visual-system-inventory.mjs`
- `artifacts/majalis/scripts/interaction-system-inventory.mjs`

| Metric | Live | Visual ceiling | Interaction ceiling |
|---|---:|---:|---:|
| cssFiles | 356 | 356 | — |
| mainSyncCssImports | 22 | — | — |
| mainDeferredCssImports | 43 | — | — |
| important | 4779 | 4784 | — |
| hexInCss | 8881 | 8905 | — |
| rgbHslInCss | 2124 | 2124 | — |
| mjDeclarations | 193 | 193 | — |
| mjDeclOutsideAllowlist | **0** | 0 | — |
| boxShadowDecls | 1113 | 1113 | — |
| zIndexRawDecls | 258 | 258 | — |
| borderRadiusPxDecls | 1258 | 1258 | — |
| inlineColorStyleMatches | 48 | 48 | — |
| rawButtonFiles | 168 | 168 | 168 |
| rawButtonElements | 650 | — | 650 |
| officialButtonImportFiles | 205 | floor 202 | floor 202 |
| divSpanOnClick | 59 | — | 59 |
| sfTokenRefs | 758 | floor 757 | — |
| ssTokenRefs | 724 | floor 724 | — |
| buttonRelatedImportantApprox | 1258 | — | 1258 |
| buttonRelatedHexApprox | 1707 | — | 1708 |

### Parallel-system signals (heuristic file counts @ tip)

| Signal | Count | Implication for later phases |
|---|---:|---|
| soft-card / SoftCard ref files | 107 | U6 card collapse |
| AppCard / InteractiveCard family files | 45 | Canonical growing, not sole |
| legacy btn selector files (`.btn-primary` / `.mj-btn--primary` / …) | 27 | U5 button collapse |
| back implementation files | 44 | U7 finalize |
| theme writer TS files | 6 | U3 single pipeline |
| body/html/#root paint writers (CSS) | 8 | U4/U8 seal |

Theme writer files (product):

- `src/lib/theme-preference.ts`
- `src/components/ThemePreferenceProvider.tsx`
- `src/lib/boot-sequence.ts`
- `src/main.tsx`
- (+ tests / seo helpers)

---

## CONFLICT LOG (prompt vs live)

| Prompt claim | Live truth | Action |
|---|---|---|
| PR blocked by Color Contrast + Visual Snapshot | #2430 green; merged; prod MATCH `cb2d3636` | Treat as closed; do not reopen without new failure |
| Must recover current PR | No open unification PR | New phase branches from `origin/main` |
| UNIFIED_100 | Still `UNIFIED_PARTIAL` | Continue U1→U13 |

---

## CURRENT_VERDICT

```
BASELINE_LOCKED
CODE_BASELINE = cb2d3636d
PRODUCTION_BASELINE = cb2d3636 MATCH
MEASUREMENT_BASELINE = STARTUP_FLICKER_PARTIALLY_FIXED + UNIFIED_PARTIAL
ACTIVE_PR = none
NEXT_PHASE = U1 (verify gates still green on tip; close any NEW contrast/visual failures only — no threshold raises)
```

## Phase exit criteria (U0)

- [x] Latest `origin/main` checked out
- [x] Production `version.json` recorded and MATCH
- [x] Open PRs / worktrees catalogued
- [x] Live inventory numbers recorded
- [x] Stale CI-block claim documented
- [x] `BASELINE_LOCKED` declared
