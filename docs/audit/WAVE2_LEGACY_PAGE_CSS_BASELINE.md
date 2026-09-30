# WAVE2 — Legacy Page CSS Baseline (حي)

| Field | Value |
|---|---|
| Captured | 2026-09-30T06:44Z |
| Worktree | `/tmp/majlis-final-closure-wave2` |
| Branch | `cursor/final-repo-closure-wave2` |
| Tip | `2ffa67984` = `origin/main` |
| Production `version.json` | `2ffa6798` **MATCH** |
| Method | FS + regex inventory on `artifacts/majalis/src` — لا تخمين |

## Global visual debt (pre-WAVE2)

| Metric | Live |
|---:|---|
| cssFiles | **357** |
| `!important` | **4798** |
| hexInCss | **9042** |
| rgbHslInCss | **2205** |
| boxShadowDecls | **1134** |
| zIndexRawDecls | **273** |
| borderRadiusPxDecls (px literals) | **730** |
| main sync CSS imports | **22** |
| main deferred CSS imports | **53** |
| mjDeclOutsideAllowlist | **0** (budget) |
| Debt ceilings | `visual-system-debt-budget.json` — لا تُرفع |

## Target files (raw)

| File | Bytes | gzip | rules `{` | selectors≈ | !important | hex | rgb/hsl |
|---|---:|---:|---:|---:|---:|---:|---:|
| `styles/pages/home-legacy.css` | 22145 | 4918 | 126 | 91 | 10 | 20 | 54 |
| `styles/pages/lessons-legacy.css` | 13961 | 2775 | 91 | 80 | 0 | 21 | 13 |
| `styles/pages/misc-page-legacy.css` | 8741 | 2079 | 63 | 54 | 3 | 10 | 8 |
| **Total** | **44847** | **9772** | **280** | **225** | **13** | **51** | **75** |

## Product import consumers (TSX only)

| Legacy file | Importers |
|---|---|
| `home-legacy.css` | `pages/account/ui/HomeBelowFold.tsx` |
| `lessons-legacy.css` | `pages/lessons/ui/LessonsView.tsx` |
| `misc-page-legacy.css` | `OptimizedSheikhImage.tsx` · `TasbihView.tsx` · `TopicQuiz.tsx` |

Gate/test references (not product runtime): `legacy-css-retirement-gate` · `pagespeed-home-gate` · `a11y-contrast-100-gate` · `verify-color-contrast-gate.mjs` · quality/legacy-sections gates.

## Live class ownership (why side-effect imports exist)

| Rule family | Actual TSX users | Notes |
|---|---|---|
| `.optimized-sheikh-image*` | `OptimizedSheikhImage` | Must become component CSS |
| `.home-prayer-rank*` · `.home-daily-meta` | `HomePrayerRanks` · `HomeLatestUpdates` | Unique to home-legacy |
| `.home-section*` · `.home-section-link` | `Widget` · `HomeAboutSection` · `HomeWeekStreak` | Primary chrome in home-legacy |
| `.lesson-detail-stats*` · `--soon/--archived` · status chip-fg | `LessonDetailView` / cards | Detail page imports `lessons.css` only — latent miss without port |
| `.content-detail-*` | `ContentDetailLayout` · `AnnualCourseDetailView` | No CSS import on layout today |
| `.fiqh-review-*` | `ArbaeenLovePage` + 3 admin sections | Public page has `topic-page.css`; admin relies on side-effect |
| `.sheikh-detail-*` | **0 TSX** | Dead — drop with misc |
| `.kuwait-tab*` in misc | Lessons already owns in `lessons.css` | Drop duplicate from misc |
| `.lesson-card-pro*` | **0 TSX** | Dead with lessons-legacy |

## Affected routes (runtime)

`/` (below-fold widgets) · `/lessons` · `/lessons/:id` · `/tasbih` · any route mounting `TopicQuiz` / `OptimizedSheikhImage` · `/arbaeen-love` · admin review lists · ContentDetailLayout consumers.

## Acceptance for SAFE_REMOVE

1. Zero product `import` of each `*-legacy.css`
2. Zero dynamic string require of those filenames in `src/**` (excl. tests asserting absence)
3. Live selectors ported to authorities below
4. Equivalence gate + legacy-css-retirement + pagespeed-home + a11y-contrast + visual debt PASS
5. No debt ceiling raise

## Target authorities (WAVE2)

| From | To |
|---|---|
| sheikh image rules | `styles/components/optimized-sheikh-image.css` (NEW) |
| home widget chrome + prayer ranks + daily-meta | `styles/components/home/home-widget-chrome.css` (NEW) + import from `Widget.tsx` |
| lessons-legacy live rules | append into `styles/pages/lessons.css` |
| content-detail-* | `styles/components/content-reading-shell.css` + import from `ContentDetailLayout` |
| fiqh-review-* | `styles/components/topic-page.css` + admin importers |

Expected cssFiles after: **357 − 3 + 2 = 356** (ceilings may be lowered after inventory, never raised).
