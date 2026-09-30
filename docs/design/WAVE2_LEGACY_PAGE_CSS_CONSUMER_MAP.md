# WAVE2 — Legacy Page CSS Consumer Map

| Field | Value |
|---|---|
| Captured | 2026-09-30 |
| Base tip (pre-WAVE2) | `2ffa67984` |
| Implementation tip | `56897ae58` |
| Method | `git show` of retired files + TSX corpus scan + CSS authority presence |
| UNKNOWN remaining | **0** |

Statuses: `LIVE_REQUIRED` · `DUPLICATED_CANONICAL` · `COMPONENT_SPECIFIC` · `PAGE_SPECIFIC` · `DEAD_PROVEN` · `DYNAMIC_USAGE` · `TEST_ONLY` · `BLOCKED` · `FALSE_POSITIVE`

---

## 1) Import consumers (product TSX — before retirement)

| File | Importers | After WAVE2 |
|---|---|---|
| `home-legacy.css` | `HomeBelowFold.tsx` | import removed · file **REMOVED** |
| `lessons-legacy.css` | `LessonsView.tsx` | import removed · file **REMOVED** |
| `misc-page-legacy.css` | `OptimizedSheikhImage` · `TasbihView` · `TopicQuiz` | imports removed · file **REMOVED** |

Side-effect consumers (used classes without importing the file):

| Class family | Actual TSX | Notes |
|---|---|---|
| `.home-section*` / `.home-section-link` | `Widget.tsx` · `HomeAboutSection` · `HomeWeekStreak` | Now via `home-widget-chrome.css` imported by `Widget` |
| `.home-prayer-rank*` | `HomePrayerRanks.tsx` | Same chrome file |
| `.home-daily-meta` | `HomeLatestUpdates.tsx` | Same chrome file |
| `.content-detail-*` | `ContentDetailLayout` · `AnnualCourseDetailView` | Now `content-reading-shell.css` on layout |
| `.fiqh-review-*` | `ArbaeenLovePage` + 3 admin sections | Now `topic-page.css` (+ admin imports) |
| `.lesson-detail-stats*` / unified-card modifiers | `LessonDetailView` / `UnifiedLessonCard` | Ported into `lessons.css` (detail already imported it) |

---

## 2) Totals by file (selectors≈ class tokens)

| File | Selectors | LIVE_REQUIRED | DUPLICATED_CANONICAL | DEAD_PROVEN | FALSE_POSITIVE | PAGE/COMPONENT |
|---|---:|---:|---:|---:|---:|---:|
| home-legacy | 91 | 10 | 8 | 68 | 2 (`org`,`w3` from SVG data-URI) | 3 incidental |
| lessons-legacy | 80 | 28 | — | 36 | — | 16 (ported with file into lessons.css) |
| misc-page-legacy | 54 | 31 | 1 (`kuwait-tab` already in lessons.css) | 22 | — | — |

---

## 3) LIVE_REQUIRED → canonical replacement

### misc → OptimizedSheikhImage
| Selectors | Replacement | Importer |
|---|---|---|
| `.optimized-sheikh-image*` (full family) | `styles/components/optimized-sheikh-image.css` | `OptimizedSheikhImage.tsx` |

### misc → Content detail
| Selectors | Replacement | Importer |
|---|---|---|
| `.content-detail-header/title/meta/subtitle/body/heading/actions/action-btn/related/section/table/sources…` | `styles/components/content-reading-shell.css` | `ContentDetailLayout.tsx` |

### misc → Review lists
| Selectors | Replacement | Importer |
|---|---|---|
| `.fiqh-review-*` | `styles/components/topic-page.css` | ArbaeenLovePage (existing) · admin sections (added) |

### home → Widget chrome
| Selectors | Replacement | Importer |
|---|---|---|
| `.home-section` · `.home-section-head` · `.home-section-link` (+ hover) | `styles/components/home/home-widget-chrome.css` | `Widget.tsx` |
| `.home-prayer-ranks-list` · `.home-prayer-rank-*` | same | via Widget tree / HomePrayerRanks |
| `.home-daily-meta` (+ strong) | same | HomeLatestUpdates under Widget chrome load |

### lessons → lessons.css
| Selectors | Replacement | Importer |
|---|---|---|
| Entire live lessons-legacy body (incl. `.lesson-unified-card__status` chip-fg, `--soon/--archived`, detail stats, compact variants, …) | appended to `styles/pages/lessons.css` | `LessonsView` / `LessonDetailView` (already) |

---

## 4) DUPLICATED_CANONICAL (home) — not re-ported

Already owned outside home-legacy (primarily `index.css` / hub CSS). Legacy only added radius/shadow overrides; dropping legacy does not remove primary definitions:

- `home-more-card` · `home-occasion-card` · `home-progress-card` · `home-sunnah-card`
- `home-page` · `home-search`
- `assistant-message-reply` · `la-card`

---

## 5) DEAD_PROVEN (dropped with file)

Examples (no TSX class usage):

- Home: hero/prayer-widget/quick-link dead variants (`home-hero-stat*`, `home-prayer-cell`, `home-page--launch`, …)
- Lessons: `.lesson-card-pro*` (0 TSX)
- Misc: `.sheikh-detail-*` (0 TSX) · unused fiqh-review tag/issue variants without TSX

---

## 6) FALSE_POSITIVE

| Token | Reason |
|---|---|
| `org` · `w3` | Matched inside SVG `xmlns='http://www.w3.org/...'` data-URIs in home-legacy — not CSS classes |

---

## 7) Dynamic / conditional / test

| Kind | Finding |
|---|---|
| Dynamic class builders for retired selectors | **None** in product TSX after retirement |
| Test-only legacy path asserts | Updated: gates now assert files **gone** · pagespeed expects no `home-legacy` · a11y reads `lessons.css` |
| `TasbihView` / `TopicQuiz` | Did not use misc selectors directly — only side-effect import; safe to drop after sheikh/content/fiqh ports |

---

## 8) Consumer count = 0 proof

```
rg home-legacy|lessons-legacy|misc-page-legacy artifacts/majalis/src  (product TSX)
→ no imports
files under styles/pages/*-legacy.css → absent
wave2-legacy-page-css-retirement-gate → PASS
legacy-css-retirement-gate → PASS (SAFE_REMOVE lock)
```

ACTIVE_LEGACY_PAGE_CSS (these three) = **0**.
