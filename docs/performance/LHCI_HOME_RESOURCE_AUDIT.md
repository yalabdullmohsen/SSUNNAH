# LHCI Home Resource Audit (U1.1)

| Field | Value |
|-------|-------|
| Baseline artifacts | `/tmp/lhci-2434/reports/` (CI #2434 / main `d9822935`) + prior `/tmp/lhci-2433/` |
| Post-fix local | `artifacts/majalis/lhci-reports/` (`12_08_*`, post-U1 graph) |
| Route | `http://127.0.0.1:24216/` |
| Runs | 3 |
| Tooling | LHCI home mobile · same as CI (`lighthouse:ci` / `lighthouserc.cjs`) |
| Live main | `d9822935` |
| Live production | `https://www.ssunnah.com/version.json` → `d9822935` **MATCH** |
| PR #2433 | **MERGED** (startup flicker follow-up) |
| PR #2434 | **MERGED** (CLS hotfix only — U1 graph not included) |
| U1 graph PR | `cursor/u1-lhci-home-graph-closure` (this train) |

## Third audit identity (extracted, not guessed)

| Audit id | Assertion | Runs (score / numericValue) |
|----------|-----------|------------------------------|
| `forced-reflow-insight` | `["warn", { minScore: 1 }]` | baseline **0 / 0 / 1** → post-U1 **1 / 1 / 1** |

Primary attributed sources (baseline):

- `HeaderTicker-*.js` (scrollWidth / clientWidth measure)
- `react-dom-*.js` / `index-*.js`
- `[unattributed]` residual

## Aggregate LHCI values (Home mobile)

### A — latest main / #2434 arts (`d9822935`)

| Audit | Contract | Runs | Selected (optimistic) | Level |
|-------|----------|------|-----------------------|-------|
| `unused-css-rules` | ≤ 80 | 450 · 150 · 450 | **150** | warn |
| `unused-javascript` | ≤ 500 | 810 · 980 · 790 | **790** | warn |
| `forced-reflow-insight` | score ≥ 1 | 1 · 0 · 0 | **0** | warn |

### B — post-U1 local (`lhci-reports` `12_08_*`)

| Audit | Contract | Runs | Selected (optimistic) | Level |
|-------|----------|------|-----------------------|-------|
| `unused-css-rules` | ≤ 80 | 10 · 150 · 0 | **0** | warn |
| `unused-javascript` | ≤ 500 | 440 · 610 · 560 | **440** | warn |
| `forced-reflow-insight` | score ≥ 1 | 1 · 1 · 1 | **1** | warn |

> CI job can SUCCESS while warn thresholds miss. U1 closure requires numeric contract + score, not warn-only SUCCESS. Prompt “LHCI FAIL on #2433” is **STALE** vs live #2434 SUCCESS with remaining warn debt.

## U1.2 Classification vs main / PR

| Concern | Class |
|---------|-------|
| unused CSS / JS / forced-reflow on `d9822935` | **EXISTING_MAIN_DEBT** |
| AppRoutes warm @ idle 900ms | **JS_GRAPH_LEAK** · **ROUTE_PREFETCH_LEAK** |
| `homepage-layout` → sync `@/lib/supabase` via HomeBelowFold | **JS_GRAPH_LEAK** |
| Main sync CSS (~304KiB raw / ~56KiB transfer) 69% unused | **CSS_GRAPH_LEAK** |
| Deferred identity sheets on Home idle (design-system, cards, lessons…) | **DEFERRED_IDENTITY_LEAK** · **ROUTE_SPECIFIC_LEAK** (coverage; not in unused-css opportunity) |
| Dark layers loaded on light Home idle | **DARK_ONLY_LEAK** (ensureDarkCoreLayers always) |
| AdminInlineEdit CSS/JS via below-fold cards | **ADMIN_LEAK** (secondary) |
| HeaderTicker layout read | product forced-reflow (not schema) |

---

## CSS_RESOURCE_AUDIT

LHCI `unused-css-rules` opportunity lists **only** the entry stylesheet:

| Resource URL | Transfer | Resource | Wasted | Wasted % | Class | Notes |
|--------------|---------:|---------:|-------:|---------:|-------|-------|
| `/assets/index-Hr9oXwl3.css` | 56559 | 304368 | 39175 | 69.7% | HOME_CRITICAL (bundle) + CSS_GRAPH_LEAK | Sync entry CSS; sole unused-css item |

### All Home stylesheets observed (network) — classification

| Resource (stem) | Transfer≈ | Class |
|-----------------|----------:|-------|
| `index-*.css` | 56.6k | HOME_CRITICAL |
| `HomePage-*.css` | 4.4k | HOME_ABOVE_FOLD |
| `HomeUniversalSearch-*.css` | 1.8k | HOME_ABOVE_FOLD |
| `NavBar-*.css` | 3.8k | HOME_ABOVE_FOLD |
| `sunnah-identity-chrome-nav-*.css` | 2.0k | HOME_ABOVE_FOLD |
| `HeaderTicker-*.css` | 1.2k | HOME_ABOVE_FOLD |
| `HomeBelowFold-*.css` | 2.8k | HOME_USED_AFTER_INTERACTION |
| `HomeLiveNowBanner-*.css` | 1.3k | HOME_USED_AFTER_INTERACTION |
| `app-shell-v2` / `app-state-v2` / `app-bottom-sheet` | mid | KEEP_JUSTIFIED |
| `language-offline` / `FocusArrival` / `SafeAreaDebugOverlay` | low | KEEP_JUSTIFIED / debug |
| `design-system` / `final-release` / `card-system*` / editorial / green-surface / unify / matte | high | DEFERRED_IDENTITY_LEAK |
| `modern-section-shell` / `section-cards-theme` / `modern-ui-refresh` / SVL / geometry / native-feel | mid | DEFERRED_IDENTITY_LEAK |
| `dark-mode-surfaces` / `dark-design-system` / `premium-dark-refine` | mid–high | DARK_ONLY_LEAK |
| `QuranHubPage` / `quran-hub` / `prayer-times` / `lessons*` / `hadith*` / `fiqh*` / `TafsirPage` / `AdhkarPage` / `tasbih` / `islam-intro` / `tawhid` / topic / worship-history | mid–high | ROUTE_SPECIFIC_LEAK |
| `AdminInlineEdit-*.css` | 1.8k | ADMIN_LEAK |
| `m2030/foundation` · `navigation` · `brand-v4-contrast` · `a11y-release-gate` | mid | AFTER_IDLE KEEP / ACTIVE_COMPATIBILITY |
| `PageShell` / `z-index-layers` / `motion-policy` | low | KEEP_JUSTIFIED |

**Initiator / import chain (entry CSS):** Vite sync imports from `src/main.tsx` → single `index-*.css` chunk. Deferred sheets: dynamic `import()` from `loadNonCriticalCss` + route/component CSS.

---

## JS_RESOURCE_AUDIT

### unused-javascript opportunity (representative)

| Resource URL | Total | Wasted | % | Class | Owner |
|--------------|------:|-------:|--:|-------|-------|
| `supabase-CfRjZLbc.js` | 53971 | 51979 | 96.3% | JS_GRAPH_LEAK | `@supabase/supabase-js` via HomeBelowFold → `homepage-layout` sync import (+ Auth when session) |
| `index-CXPCt90d.js` | 115454 | 35474 | 30.7% | HOME_CRITICAL | entry / App shell |
| `react-dom-BpQxdMBs.js` | 64409 | 25590 | 39.7% | THIRD_PARTY_REQUIRED | React |
| `AppRoutes-D8KbJ9Bi.js` | 26209 | 25377 | 96.8% | ROUTE_PREFETCH_LEAK | `App.tsx` idle warm ≤900ms + BottomNav intent |

### Top Home JS by transfer (network) — classification

| Stem | Transfer≈ | Timing | Class |
|------|----------:|--------|-------|
| `index-*.js` | 123k | initial | HOME_CRITICAL |
| `react-dom` | 65k | initial | THIRD_PARTY_REQUIRED |
| `supabase` | 54k | ~111ms | JS_GRAPH_LEAK |
| `fawaid-curated-seed` / `fawaid-seed` | 70k / 63k | ~2s idle | HOME_USED_AFTER_INTERACTION / route warm |
| `IslamicGlossaryPage` | 48k | idle prefetch | ROUTE_SPECIFIC_LEAK |
| `quiz-performance-service` | 47k | idle | ROUTE_SPECIFIC_LEAK |
| `AppRoutes` | 27k | ~420ms | ROUTE_PREFETCH_LEAK |
| `import-wrapper-prod` | 32k | mid | KEEP_JUSTIFIED |
| `miracles-seed` / `adhkar-seed` / `library-service` | mid | idle | ROUTE_SPECIFIC_LEAK |
| `icons` / `radix` / `query` / `wouter` / `react` | mid | initial | HOME_CRITICAL / THIRD_PARTY |
| `HomePage` | 2.8k | initial | HOME_CRITICAL |
| `HomeBelowFold` | 12k | early | HOME_USED_AFTER_INTERACTION |
| `HeaderTicker` | 7.4k | early | HOME_ABOVE_FOLD |
| `AdminInlineEdit` | 2.8k | below-fold | ADMIN_LEAK |
| `TafsirPage` / `HadithPage` / `LessonsPage` / `FiqhPage` / `PrayerTimesPage` / … | mid | ≥25s or intent | ROUTE_SPECIFIC (prefetchTopRoutes / BottomNav) — outside strict startup if delayed |

**Initiator notes**

- Entry: `index.html` → `index-*.js` → `HomePage` + App shell.
- AppRoutes: `App.tsx` `requestIdleCallback(warm, { timeout: 900 })` — **fix target**.
- supabase: sync import in `homepage-layout.ts` pulled by lazy `HomeBelowFold` — **fix target** (dynamic import inside remote prefs only).
- Prefetch after 25s: `prefetchTopRoutesOnIdle` / BottomNav warm — KEEP_JUSTIFIED for interaction readiness if outside LHCI settle; still classified ROUTE_SPECIFIC when observed inside run.

---

## Closure targets (U1) — local evidence

| Metric | Before (CI #2434 / `d9822935`) | After (local U1) | Contract |
|--------|-------------------------------:|-----------------:|----------|
| unused-css-rules | 150–450 (selected 150) | **0–150** (selected **0**) | ≤80 |
| unused-javascript | 790–980 (selected 790) | **440–610** (selected **440**) | ≤500 |
| forced-reflow-insight | score 0–1 (selected 0) | **score 1 / 1 / 1** | ≥1 |

Fixes on `cursor/u1-lhci-home-graph-closure`: supabase `manualChunks` hoist · AppRoutes/home warm · FavoriteButton/lessons · CSS graph · HeaderTicker · non-ATF index CSS absorbed into `index-deferred-pages.css` (HomeView sync + idle).
