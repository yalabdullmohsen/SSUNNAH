# سُنّة — WAVE2 Legacy Page CSS Closure Report

| Field | Value |
|---|---|
| Captured | 2026-09-30 |
| PR | https://github.com/yalabdullmohsen/majalis/pull/2375 |
| Branch | `cursor/final-repo-closure-wave2` |
| Implementation commit | `56897ae58` / docs `397dcd70d` |
| Merge commit on main | `cfca1a68f` (#2375) |
| Production | `cfca1a68` **MATCH** · builtAt=2026-09-30T07:16:09.787Z |
| Pre-WAVE2 main/prod | `2ffa67984` / `2ffa6798` **MATCH** |

## STATUS

**COMPLETE** — merged to main, production `version.json` MATCH, smoke HTTP 200 on critical routes.

(Final decision updated after deploy.)

## LIVE BASELINE

See `docs/audit/WAVE2_LEGACY_PAGE_CSS_BASELINE.md`.

| Metric (pre) | Value |
|---|---:|
| cssFiles | 357 |
| important | 4798 |
| hexInCss | 9042 |
| rgbHslInCss | 2205 |
| Active page legacy files | 3 (~44847 B) |
| main sync / deferred | 22 / 53 |

## CONSUMER MAP

See `docs/design/WAVE2_LEGACY_PAGE_CSS_CONSUMER_MAP.md`.

UNKNOWN remaining after resolution: **0**.

## OPTIMIZED SHEIKH IMAGE EXTRACTION

| Item | Detail |
|---|---|
| From | `misc-page-legacy.css` `.optimized-sheikh-image*` |
| To | `styles/components/optimized-sheikh-image.css` |
| Importer | `OptimizedSheikhImage.tsx` |
| Notes | Exact port + shimmer keyframes + reduced-motion; no source/alt/lazy contract change |

## MISC PAGE MIGRATION

| Consumer | Action |
|---|---|
| OptimizedSheikhImage | component CSS |
| TasbihView | dropped unused misc import (styles in `tasbih.css`) |
| TopicQuiz | dropped unused misc import (`section-quiz.css`) |
| ContentDetailLayout | gained `content-reading-shell.css` (content-detail rules) |
| Admin review sections | import `topic-page.css` (fiqh-review rules) |
| misc-page-legacy.css | **REMOVED** |

## LESSONS MIGRATION

| Item | Detail |
|---|---|
| From | `lessons-legacy.css` |
| To | appended into `lessons.css` (page authority) |
| LessonsView | legacy import removed |
| a11y status chip-fg | now asserted against `lessons.css` |
| lessons-legacy.css | **REMOVED** |

## HOME MIGRATION

| Item | Detail |
|---|---|
| Widget chrome + prayer ranks + daily-meta | `home-widget-chrome.css` via `Widget.tsx` |
| HomeBelowFold | legacy import removed |
| Duplicated home cards | left on existing `index.css` / hub owners |
| Dead hero/widget selectors | dropped |
| home-legacy.css | **REMOVED** |

## FILES REMOVED

1. `artifacts/majalis/src/styles/pages/home-legacy.css`
2. `artifacts/majalis/src/styles/pages/lessons-legacy.css`
3. `artifacts/majalis/src/styles/pages/misc-page-legacy.css`

Gates prevent reintroduction (`legacy-css-retirement-gate` + `wave2-legacy-page-css-retirement-gate`).

## SELECTORS MIGRATED

- Sheikh image family → component CSS
- Home section/link/prayer-rank/daily-meta → widget chrome
- Lessons live rules → lessons.css
- content-detail-* → content-reading-shell
- fiqh-review-* → topic-page

## CANONICAL REPLACEMENTS

No new Card/Button/Token systems. No `*-legacy-v2.css`. No soft-cards restore.

## BEFORE VS AFTER (measured inventory)

| Metric | Before | After | Delta |
|---|---:|---:|---|
| cssFiles | 357 | 356 | IMPROVED −1 |
| important | 4798 | 4788 | IMPROVED −10 |
| hexInCss | 9042 | 9023 | IMPROVED −19 |
| rgbHslInCss | 2205 | 2149 | IMPROVED −56 |
| boxShadowDecls | 1134 | 1119 | IMPROVED −15 |
| zIndexRawDecls | 273 | 271 | IMPROVED −2 |
| borderRadiusPxDecls | 1316 | 1309 | IMPROVED −7 |
| mjDeclOutsideAllowlist | 0 | 0 | UNCHANGED |
| ACTIVE_LEGACY_PAGE_CSS (3 files) | 3 | **0** | IMPROVED |
| main sync/deferred | 22/53 | 22/53 | UNCHANGED |

Ceilings lowered to measured (decreasing-only). Floors held.

## CSS SIZE EFFECT

~45 KiB raw legacy page CSS removed; live rules absorbed into authorities (+2 small component files). Net cssFiles −1.

## CRITICAL CSS EFFECT

No change to `main.tsx` sync list (22). Deferred stayed 53. Critical gzip not intentionally expanded. Local verify:ci build passed without critical regression failure.

## PERFORMANCE EFFECT

Below-fold home no longer pulls a 22 KiB legacy blob via HomeBelowFold; widget chrome is scoped to Widget. Lessons detail gains styles from `lessons.css` without depending on list-page side-effect import.

## VISUAL PARITY

Intent: no intentional redesign. Ports preserve prior declarations for live selectors. Local visual-system debt/authority gates passed. GitHub visual-snapshot status tracked on PR checks.

## ACCESSIBILITY

- a11y-contrast-100 retargeted to `lessons.css` chip-fg status
- contrast hardFiles dropped deleted legacy path
- Tasbih in-page confirm contract unchanged
- RTL / focus contracts preserved by not changing interaction logic

## TESTS AND GATES

Local PASS:

- `wave2-legacy-page-css-retirement-gate`
- `legacy-css-retirement-gate`
- `pagespeed-home-gate`
- `a11y-contrast-100-gate`
- `content-reading-shell-gate`
- `test:visual-system-debt-budget`
- `test:interaction-system-debt-budget`
- `pnpm run verify:preflight`
- `pnpm run verify:ci` (~340s)

GitHub PR #2375: Verify build ✅ · ci-required ✅ · visual-snapshot ✅ · Color contrast ✅ · LHCI home ✅ · static/build/repo-gates ✅.

## PR DELIVERY

| Item | Value |
|---|---|
| PR | #2375 Ready (not draft) |
| Title | fix(closure): WAVE2 — تقاعد CSS صفحات home/lessons/misc-legacy |
| Base | main |
| Auto-merge path | repository workflow |

## PRODUCTION SMOKE TESTS

| Route | HTTP | Notes |
|---|---:|---|
| `/version.json` | 200 | `cfca1a68` MATCH |
| `/` | 200 | html present · no legacy CSS filenames in HTML |
| `/lessons` | 200 | same |
| `/tasbih` | 200 | same |
| `/mushaf` | 200 | OK |
| `/prayer-times` | 200 | OK |
| `/settings` | 200 | OK |
| `/search` | 200 | OK |
| `/quran-hub` | 200 | OK |
| `/api/healthz` | 200 | OK |

No blank screens in HTML samples. No `home-legacy` / `lessons-legacy` / `misc-page-legacy` strings in served HTML.

## REGRESSIONS

None observed. Local verify:ci PASS · GitHub required checks PASS · production smoke PASS.

## ROLLBACK EVENTS

None.

## REMAINING LEGACY CSS

Page `*-legacy.css` trio = **0**. Remaining KEEP/COMPATIBILITY (out of WAVE2): `brand-v4*` · `m2030/*` · `final-release` · dark bridges · admin/mushaf/prayer CSS (BLOCKED).

## NEXT WAVE READINESS

WAVE3 (raw buttons) may start from latest `origin/main`=`cfca1a68f` after this seal.

## FINAL DECISION

**WAVE2_MERGED_AND_DEPLOYED**
