# PROJECT_HEALTH — Continuous Governance Dashboard

**Baseline:** `QUALITY_BASELINE_V1`  
**SoT:** `yalabdullmohsen/SSUNNAH` · Prod: `https://www.ssunnah.com/version.json`  
**Identity:** `SUNNAH_CANONICAL_PLATFORM_IDENTITY` — evaluate **WEB · IOS · APP_STORE** separately (never merge surfaces).

## Platform separation (mandatory)

| Product | Scope | Success applies to |
|---|---|---|
| **WEB** | Browser, SEO, responsive, web routes/perf/a11y | WEB only |
| **IOS** | Capacitor shell, lifecycle, safe areas, gestures, deep links, push | IOS only |
| **APP_STORE** | Release/review readiness, polish, compliance, update safety | APP_STORE only |

Reports must include **WEB IMPACT · IOS IMPACT · APP STORE IMPACT**.  
Architecture classes: `WEB_ONLY` · `IOS_ONLY` · `SHARED_PLATFORM` · `APP_STORE_ONLY`.

## Health board

| Area | Status | Protection | Monitor |
|---|---|---|---|
| Canonical identity | LOCKED | `test:canonical-platform-identity` | contract doc + JSON |
| Design debt | GUARDED | visual debt budget · component/design-system authority · hero ceiling 95 | hex / !important / radii / shadows ceilings |
| Interaction debt | GUARDED | interaction debt budget · Button authority | raw buttons · onClick div/span |
| Performance | GUARDED | bundle · LHCI · sync CSS=14 · runtime excellence | entry/icons/CSS gzip budgets |
| Mushaf | GUARDED | fluidity audit · mushaf measure/unit in verify:ci | hotspots=0 · prefetch/selection freezes |
| Routes / feedback | GUARDED | product-completeness · Feedback V2 · route matrix | loading/empty/error/offline/retry |
| Architecture / state | GUARDED | platform-architecture · ownership map | provider/query ownership |
| Accessibility | GUARDED | a11y-contrast-100 · on-brand contrast | contrast regressions |
| Sustainability / docs | GUARDED | release-and-long-term-sustainability | authority-manifest |
| Continuous freeze | GUARDED | `test:continuous-governance-regression` | QUALITY_BASELINE_V1.json |

## How to read debt

1. Open `QUALITY_BASELINE_V1.json` for absolute ceilings.
2. Compare live `artifacts/majalis/reports/*-debt-budget.json` — ceilings must be ≤ baseline.
3. Run `pnpm --filter @workspace/majalis run test:continuous-governance-regression`.
4. Failures mean growth or missing protection wiring — fix without raising ceilings.

## Explicit non-actions

- No new design systems
- No major refactors “to pass”
- No store / Build / Quran / prayer-calc / Prod SQL changes from this program

PROJECT_HEALTH_VISIBLE
