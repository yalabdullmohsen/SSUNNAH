# WAVE2 — Legacy Page CSS Retirement Report

| Field | Value |
|---|---|
| Date | 2026-09-30 |
| Base | `origin/main` `2ffa67984` (WAVE1 MATCH prod) |
| Branch | `cursor/final-repo-closure-wave2` |
| Status | **IMPLEMENTED** — awaiting CI/merge/deploy |

## Result

| Item | Before | After |
|---|---:|---:|
| `home-legacy.css` | ACTIVE import | **REMOVED** |
| `lessons-legacy.css` | ACTIVE import | **REMOVED** |
| `misc-page-legacy.css` | ACTIVE import | **REMOVED** |
| cssFiles | 357 | **356** |
| `!important` | 4798 | **4788** |
| hexInCss | 9042 | **9023** |
| rgbHslInCss | 2205 | **2149** |
| boxShadowDecls | 1134 | **1119** |
| zIndexRawDecls | 273 | **271** |
| borderRadiusPxDecls | 1316 | **1309** |
| mjDeclOutsideAllowlist | 0 | **0** |

Debt ceilings lowered to measured (decreasing-only). Floors held.

## Ports (authorities — not legacy-v2)

| Rules | Destination | Importer |
|---|---|---|
| `.optimized-sheikh-image*` | `styles/components/optimized-sheikh-image.css` | `OptimizedSheikhImage.tsx` |
| `.home-section*` · prayer ranks · `.home-daily-meta` | `styles/components/home/home-widget-chrome.css` | `Widget.tsx` |
| lessons-legacy live CSS | appended → `styles/pages/lessons.css` | `LessonsView` / `LessonDetailView` (already) |
| `.content-detail-*` | `content-reading-shell.css` | `ContentDetailLayout.tsx` |
| `.fiqh-review-*` | `topic-page.css` | ArbaeenLove + 3 admin sections |

## Dropped as dead (0 TSX)

- `.sheikh-detail-*` (misc)
- duplicate `.kuwait-tab*` hover block in misc (owned by `lessons.css`)
- home-legacy hero/prayer-widget dead selectors not referenced by home TSX

## Consumers cleared

- `HomeBelowFold` — no legacy import
- `LessonsView` — no legacy import
- `TasbihView` / `TopicQuiz` — no misc-legacy import
- Product corpus: zero `*-legacy.css` imports

## Gates

- `wave2-legacy-page-css-retirement-gate`
- `legacy-css-retirement-gate` (asserts files gone)
- `pagespeed-home-gate` (no home-legacy; Widget chrome)
- `a11y-contrast-100-gate` → `lessons.css`
- contrast hardFiles list dropped `lessons-legacy.css`
- visual + interaction debt budgets

## Out of scope (unchanged)

WAVE3 buttons · WAVE4 feedback · WAVE5 critical · WAVE6 mushaf · admin CSS mass · prayer calc · QPC fonts · soft-cards (stays removed)

## Docs

- Baseline: `WAVE2_LEGACY_PAGE_CSS_BASELINE.md`
- Matrix: `docs/design/LEGACY_CSS_RETIREMENT_MATRIX.md` WAVE2 note
- `docs/REPO_INDEX.md` legacy path note
