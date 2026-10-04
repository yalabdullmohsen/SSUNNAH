# DESIGN_AUTHORITY_LIVE_BASELINE

TASK_CLASSIFICATION: SHARED_PLATFORM  
Date: 2026-10-04  
Source SHA: `95b2081d58001e7feb7a60ffcc5aecbbe49fefc1` (PR #2558 head)  
Merge-base with origin/main: `f4275d913` (`chore(design): حذف CSS ميت بلا مستهلكين (Wave 6) (#2556)`)

WEB_IMPACT: shared CSS architecture  
IOS_APPLICATION_IMPACT: same CSS may render in Capacitor WebView  
APP_STORE_PRODUCT_IMPACT: none (no Build)  
SHARED_PLATFORM_IMPACT: design-system.css logical regions + debt scanners

## PR #2558 required checks (this SHA)

| Check | Result |
|---|---|
| classify-path-lane | PASS |
| static-checks | PASS |
| repo-gates | PASS |
| build | PASS |
| LHCI home | PASS |
| Color contrast | PASS |
| visual-snapshot | PASS |
| Verify build | PASS |
| ci-required | PASS |
| mergeable | MERGEABLE / CLEAN |
| draft | **true** (blocks auto-merge) |

## Physical architecture (live)

| Metric | Value |
|---|---|
| design-system.css lines | 3295 |
| design-system.css bytes | 90819 |
| CSS files (scanner) | **356** (ceiling 356) |
| CSS bytes (all src) | 3869357 |
| DS selectors (simple `{ }` rules) | 463 |
| Unique selectors | 422 |
| Repeated selectors | 36 (41 extra occurrences) |
| DS Hex | 43 |
| DS `!important` | 21 |
| DS rgb/hsl | 58 |
| DS unsafe `var(--x, #hex)` | 0 |
| `--ds-*` declarations in DS | 63 names |
| Authority regions | COMPONENT_AUTHORITY → FEATURE_AUTHORITY → FOUNDATION `html {` |

## Debt scanners (same as CI)

| Metric | Measured | Ceiling |
|---|---:|---:|
| cssFiles | 356 | 356 |
| important (visual) | 4745 | 4746 |
| hexInCss | 5615 | 5616 |
| rgbHslInCss | 2006 | 2006 |
| buttonRelatedImportantApprox | 1138 | 1138 |
| buttonRelatedHexApprox | 975 | 975 |

## Compatibility consumers still present

`styles/pages/{tasbih,tawhid,search,auth,user-stats}.css` — KEEP_COMPATIBILITY_WITH_EVIDENCE until A5 computed-style proof.

## Repeated-selector candidates (not yet removed)

Highest: `.search-result-row` ×3, `.tawheed-types-grid` ×3, `.ds-page-header__title` ×3, plus component/premium dual blocks (`.ds-btn`, `.ui-card-btn`, `.ds-stat strong`, `.tc-ring-btn`, `.search-result-row:hover`).

Classification at baseline: **KEEP_COMPATIBILITY_WITH_EVIDENCE** (documented winners in SELECTOR_COMPETITION_ZERO; defeated declarations still in file).

## Physical authority target (A2, not created yet)

`design-system.css` foundation-only + `component-authority.css` + `feature-authority-{public,account,admin}.css`  
Blocked until cssFiles has spare slots (currently 356/356). Creating files now would raise the ceiling. **NO_MICRO_FILE_EXPLOSION**.

## A1 status

PR_2558_REQUIRED_CHECKS_PASS = true  
NO_CEILING_RAISE = true  
Hold: PR is **draft**; merge requires ready-for-review + squash.
