# LHCI Home Resource Audit (U1 Numeric Closure)

| Field | Value |
|-------|-------|
| Live main (pre-PR) | `2c8aa1ae` |
| Live production | `https://www.ssunnah.com/version.json` → `2c8aa1ae` **MATCH** |
| U2 tip CI LHCI | run `36868374411` (`/tmp/lhci-u2-tip/`) |
| Post-fix local | `artifacts/majalis/.lighthouseci/` + `lhci-reports/` |
| Route | `http://127.0.0.1:24216/` |
| Runs | 3 · aggregation **optimistic** |
| Tooling | `@lhci/cli@0.15.1` · `lighthouserc.cjs` · home mobile |
| Branch | `cursor/u1-lhci-numeric-closure` |

## Contract (must not raise thresholds)

| Audit | Assertion | Required |
|-------|-----------|----------|
| `unused-css-rules` | `maxNumericValue: 80` | selected ≤80 |
| `unused-javascript` | `maxNumericValue: 500` | selected ≤500 |
| `forced-reflow-insight` | `minScore: 1` | selected score ≥1 stable |

## Live baselines

### U2 tip CI (`2c8aa1ae` / #2436)

| Audit | Runs | Selected (optimistic) | vs contract |
|-------|------|----------------------:|-------------|
| unused-css-rules | 0 · 0 · 0 | **0** | PASS |
| unused-javascript | 550 · 550 · 560 | **550** | **FAIL** (>500) |
| forced-reflow-insight | 1 · 0 · 1 | **1** | PASS (flaky zero run) |

Unused JS items (stable bytes): `index-*.js` wasted ≈34659 · `react-dom-*.js` wasted ≈25614.

### Post-fix local (this PR)

| Audit | Runs | Selected (optimistic) | vs contract |
|-------|------|----------------------:|-------------|
| unused-css-rules | 0 · 150 · 0 | **0** | PASS |
| unused-javascript | 560 · 440 · 560 | **440** | PASS |
| forced-reflow-insight | 1 · 1 · 1 | **1** | PASS stable |

Unused JS items: `index-*.js` wasted ≈28890 (−~5.7KiB) · `react-dom` ≈25614.
Unused CSS items: `index-*.css` only · wasted ≈17206 · total ≈31487 (recovery + page unify moved out).

## Top unused resources — owning file · first route

### CSS

| Resource | Wasted ≈ | Owning file(s) | First route |
|----------|---------:|----------------|-------------|
| `index-*.css` (entry sync) | 17–22KiB | `main.tsx` sync sheets (`theme.css`, `index.css`, `brand-v4`, ATF `visual-identity-unify`, …) | `/` |
| ~~`index-deferred-pages-*.css` on Home~~ | — | was wrongly sync-imported from `HomeView.tsx` | removed from Home |
| `dark-mode-recovery-*.css` | dark-only | `ensure-dark-layers.ts` (boot dark / theme switch) | dark surfaces |

### JavaScript

| Resource | Wasted ≈ | Owning file(s) | First route |
|----------|---------:|----------------|-------------|
| `index-*.js` | ~29KiB | entry: `main.tsx` + `App.tsx` shell | `/` |
| `react-dom-*.js` | ~25KiB | React runtime (THIRD_PARTY_REQUIRED) | `/` |

## Classification of fixes

| Concern | Class | Fix |
|---------|-------|-----|
| `@capacitor/core` in entry via utils/splash/storage/chrome | **JS_GRAPH_LEAK** | `native-platform.ts` (window.Capacitor) |
| `prefetch-top-routes` sync in main | **ROUTE_PREFETCH_LEAK** | dynamic import after 25s → `runPrefetchTopRoutes` |
| HeaderTicker geometry under webdriver | **FORCED_REFLOW** | skip layout reads when `navigator.webdriver` |
| `dark-mode-recovery` sync on light Home | **DARK_ONLY_LEAK** / **CSS_GRAPH_LEAK** | `ensureDarkCoreLayers` |
| Section/login/fiqh unify + Night Reading in entry | **ROUTE_SPECIFIC_LEAK** | `index-deferred-pages.css` / recovery |
| HomeView importing deferred-pages | **CSS_GRAPH_LEAK** | removed |
| Entry CSS applied before FCP (local) | **CSS_GRAPH_LEAK** | defer boot: DOMContentLoaded + rAF×2 · CSP hash updated |

## Closure targets

| Metric | U2 tip CI | After local U1 numeric | Contract |
|--------|----------:|-----------------------:|----------|
| unused-css-rules | 0 | **0** (selected) | ≤80 |
| unused-javascript | 550 | **440** (selected) | ≤500 |
| forced-reflow-insight | 1/0/1 | **1/1/1** | ≥1 |

`lhci-thresholds.cjs` **not** modified.
