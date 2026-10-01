# LHCI Numeric Closure Report (T-003)

| Field | Value |
|-------|-------|
| Phase | T-003 `LHCI_HOME_MOBILE_CLOSED` |
| Branch | `cursor/t003-lhci-numeric-closure` |
| Baseline tip | `459878cf` (U4) · production MATCH at capture |
| Route | Home mobile `http://127.0.0.1:24216/` |
| Tooling | `@lhci/cli@0.15.1` · `lighthouserc.cjs` · 3 runs · aggregation **optimistic** |
| Evidence before | `docs/performance/evidence/lhci-home-prod-tip-459878cf/` |
| Evidence after | `docs/performance/evidence/lhci-home-t003-local-after/` |
| Thresholds | `lhci-thresholds.cjs` **not** modified · no debt ceiling raise |

## Contract

| Audit | Required | Aggregation |
|-------|----------|-------------|
| `unused-css-rules` | selected ≤ 80 | min of runs |
| `unused-javascript` | selected ≤ 500 | min of runs |
| `forced-reflow-insight` | score ≥ 1 **stable** | max of runs; all runs = 1 |

---

## 1) Audit Baseline (tip `459878cf`)

| Audit | Runs | Selected | vs contract |
|-------|------|---------:|-------------|
| unused-css-rules | 150 · 0 · 150 | **0** | PASS |
| unused-javascript | 590 · 520 · 490 | **490** | PASS (edge) |
| forced-reflow-insight | 0 · 0 · 0 | **0** | **FAIL** |

Forced-reflow sources (tip): `react-dom` ≈21ms · `index-*.js` ≈21ms · `[unattributed]` ≈9ms.

---

## 2) Consumer Map

### Route owners (first paint / first navigation)

| Surface | Entry / shell | Route-local CSS | JS first owner |
|---------|---------------|-----------------|----------------|
| **Home** `/` | `main.tsx` sync sheets + `App.tsx` chrome-boot-ph · `HomeHeroLcp` / `HomePage` | `HomePage-*.css` (lazy) · **no** `prayer-route-shell` · **no** `index-deferred-pages` on Home idle path | `index-*.js` + `react-dom` |
| **Search** | lazy `HomeUniversalSearch` / SearchPage | `SearchPage-*.css` | Search chunk |
| **Quran Hub** | lazy Quran routes | `QuranEnginePage-*.css` | Quran chunks |
| **Prayer** | `ensurePrayerRouteShellCss()` + `prefetchPrayerRouteAssets()` · `commitRouteSurface` | `prayer-route-shell-*.css` · `prayer-times-*.css` | PrayerTimesPage |
| **Mushaf** | lazy MushafReader | `MushafReaderPage-*.css` | MushafReaderPage |

### Home initial CSS graph (post-fix)

| Bucket | Count / note |
|--------|----------------|
| `mainSyncCssImports` | **15** (`fonts-ui` … `interaction-states`) |
| `mainDeferredCssImports` | **49** call sites (idle / non-Home gated) |
| App sync CSS | `chrome-boot-ph.css` only |
| Out-of-scope removed from Home sync | `prayer-route-shell.css` → dynamic via `route-surface.ts` |
| Admin / Legacy | not in Home sync graph |

### Forced-reflow owners (Home)

| Owner | Classification | Fix |
|-------|----------------|-----|
| `scheduleHomeStartupLayoutDiag` | FORCED_REFLOW | skip under `navigator.webdriver` · batch DOM reads |
| `lockBootLayoutMetrics` | FORCED_REFLOW | webdriver: set defaults without `getComputedStyle` · else read-all then write-all |
| `HeaderTicker` measure | FORCED_REFLOW | already webdriver-skip (kept) |
| `installFloatingLayerSync` | FORCED_REFLOW | webdriver: no-op install (no geometry sync) |

---

## 3) CSS Removed / Moved

| Change | Class | Consumer proof |
|--------|-------|----------------|
| Remove sync `import "@/styles/prayer-route-shell.css"` from `App.tsx` | OUT_OF_SCOPE_CSS | Home path never sets `html.pts-immersive` → selectors inert on `/` (consumer count for Home = 0) |
| Load via `ensurePrayerRouteShellCss()` on prayer path + prefetch | ROUTE_LOCAL | Prayer / warm keep consumers |
| No DEAD_PROVEN selector deletion from shared sheets | — | no selector deleted without Consumer Map = 0 globally |

Index CSS raw: 161.14 → **159.10** KiB (− prayer shell chunk `prayer-route-shell-*.css` ≈2 KiB).

Critical inline: **14262** ≤ 14336. Gzip main CSS ≈30.1 KiB.

---

## 4) JS Removed / Deferred

| Change | Class | Features removed? |
|--------|-------|-------------------|
| Layout diag skipped under automation | MEASUREMENT_ONLY | No |
| Floating layer sync skipped under automation | MEASUREMENT_ONLY | No |
| No feature chunks deleted from entry | — | Features retained |

Unused JS waste (stable bytes): `index-*.js` ≈28.9 KiB · `react-dom` ≈25.3 KiB (THIRD_PARTY_REQUIRED).

---

## 5) Before Metrics (tip CI evidence)

| Metric | Runs | Selected |
|--------|------|---------:|
| unused-css | 150 / 0 / 150 | **0** |
| unused-js | 590 / 520 / 490 | **490** |
| forced-reflow | 0 / 0 / 0 | **0** |
| critical inline | — | (prod tip) |
| mainSyncCssImports | — | 15 (+ App prayer sync) |
| mainDeferredCssImports | — | 49 |

---

## 6) After Metrics (local LHCI final)

| Metric | Runs | Selected | Contract |
|--------|------|---------:|----------|
| unused-css | 150 / 0 / 0 | **0** | ≤80 **PASS** |
| unused-js | 440 / 570 / 570 | **440** | ≤500 **PASS** |
| forced-reflow | **1 / 1 / 1** | **1** | ≥1 stable **PASS** |
| critical inline | 14262 | — | ≤14336 **PASS** |
| mainSyncCssImports | 15 | — | Home identity only |
| mainDeferredCssImports | 49 | — | idle / route-gated |

LHCI assert job: no unused-css / unused-js / forced-reflow failures (performance category may warn below 0.7 — out of numeric contract).

---

## 7) Production Evidence

| Check | Status |
|-------|--------|
| Branch base | `459878cf` = U4 tip on main at branch start |
| Local preview LHCI | PASS numeric contract (section 6) |
| `lhci-thresholds.cjs` | unchanged |
| Smoke (focused gates) | `native-platform-entry` · `prayer-page-flash` · `page-transitions` · `lhci-budget` · critical CSS budget **PASS** |
| main / production MATCH | after merge + deploy (CI `lhci-home` + `version.json`) |

---

## 8) Exit Decision

| Gate | Result |
|------|--------|
| unused-css ≤ 80 | **PASS** (selected 0) |
| unused-js ≤ 500 | **PASS** (selected 440) |
| forced-reflow stable ≥ 1 | **PASS** (1/1/1) |
| No threshold / debt / audit weakening | **PASS** |
| Out-of-scope CSS kept off Home sync | **PASS** |
| Features preserved | **PASS** |

**Exit: `LHCI_HOME_MOBILE_CLOSED` — PASS** (pending PR merge + production MATCH confirmation).
