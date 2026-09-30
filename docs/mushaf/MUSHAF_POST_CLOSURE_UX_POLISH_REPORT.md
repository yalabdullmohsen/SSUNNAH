# MUSHAF POST-CLOSURE UX POLISH REPORT

**Branch:** `cursor/mushaf-post-closure-polish`  
**Scope:** Post-closure UX polish only — not a new architecture wave; WAVE6 SM unchanged.  
**Decision:** see FINAL DECISION.

## AYAH NUMBER IMPROVEMENTS

| Item | Change |
|------|--------|
| Box size `--mushaf-ayah-mark-size` | **unchanged** `1.15em` (geometry / measure lock) |
| Glyph size `--mushaf-ayah-mark-number-size` | `1em` → **`1.10em`** (~+10%) |
| Quran body text | unchanged |
| Rosette clip-path / positions | unchanged |
| Clarity | `geometricPrecision` + grayscale font smoothing on `.nm-ayah-mark__glyph` |
| Gates | refine / appearance / pages-1-2 / dual / controls inventory updated to `1.10em` |

**Status:** PATCH_COMPLETE

## DIVIDER DELETE ACTION

| Surface | Behavior |
|---------|----------|
| Verse menu (`MushafVerseMenu`) | Shows **حذف الفاصل** when ayah has bookmarks; `alertdialog` confirm; busy guard; offline status; no `window.confirm` |
| Bookmarks manager | Same label + confirm; error alert; cancel; double-delete safe |
| Storage | `removeMyBookmark` + `bookmarkEpoch` refresh → markers remount without page refresh |
| Offline | Local delete works; status copy explains local persistence |

**Status:** PATCH_COMPLETE

## PAGE TURN MICRO LATENCY

### Measurement (repo code audit)

| Path | Finding |
|------|---------|
| Touch → First Translate (swipe) | WAVE6 pager path unchanged; no new timers/hacks |
| Arrows / scrubber | **Proven micro-latency:** gated on `neighborsReady` (adjacent font **and** page cache) even though `go()` already waits only for **target** page font |
| `go()` | Already commits immediately when target font ready; else `WAITING_FOR_FONT` then commit |
| Prefetch | `neighborsReady` still computed for diag / background warm — not removed |

### Fix applied (proven only)

- Removed `!neighborsReady` from **page arrows** and **scrubber** `goto`.
- Kept `edgesDisabled` + `pagerSettled` locks.
- Did **not** change WAVE6 state machine, page mapping, font mapping, or swipe SM.

### Residual

Swipe / compositor / device frame timing cannot be proven end-to-end in this environment without a physical device FPS capture.

**DEVICE_REQUIRED** for residual perceived lag on real iPhone/Android after this fix.

**Status:** PATCH_PARTIAL (repo-proven path fixed; device residual open)

## MICRO UX FIXES

| Fix | Detail |
|-----|--------|
| Verse menu touch targets | Compact overrides restored to ≥ `2.75rem` (close / actions) |
| Verse menu height | `max-height` raised so delete confirm is not clipped |
| Manager actions | Touch targets ≥ `2.75rem`; delete confirm layout |
| Focus / names | Delete controls have `aria-label`; confirm uses `alertdialog` |
| Safe area | Existing `--safe-bottom` padding retained on verse menu |

**Status:** PATCH_COMPLETE

## BEFORE VS AFTER

| Area | Before | After |
|------|--------|-------|
| Ayah digit | `1em` inside 1.15em box | `1.10em` glyph only |
| Divider delete | Create/edit only; manager delete without confirm | Explicit **حذف الفاصل** + confirm on menu + manager |
| Arrow / scrubber | Wait neighborsReady | Immediate `go()` (target font gate only) |
| Menu targets | Compact &lt;44px overrides | ≥44px |

## TESTS

Focused (run in delivery):

- `mushaf-ayah-marker-refine-gate`
- `mushaf-appearance-ayah-interaction-gate`
- `mushaf-pages-1-2-layout-gold-gate`
- `mushaf-dual-appearance-theme-gate`
- `mushaf-controls-inventory-gate`
- `mushaf-advanced-bookmarks-gate`
- `mushaf-bookmark-ops-unit`
- `mushaf-pager-recycle-gate`
- Quran checksum / 604 / page mapping / WAVE6 fluidity (via `verify:ci`)
- `verify:preflight` → `verify:ci` → `release:verify`

## REGRESSIONS

- No Quran text / tashkeel / 604 / 15-line / mapping / QPC association changes.
- No WAVE6 SM change.
- No checksum baseline edits.
- Marker box size remains `1.15em` so mushaf-measure geometry contract holds.

## FINAL DECISION

**PATCH_PARTIAL**

- PATCH1 ayah number: **PATCH_COMPLETE**
- PATCH2 divider delete: **PATCH_COMPLETE**
- PATCH3 page-turn micro-latency: **PATCH_PARTIAL** + **DEVICE_REQUIRED** for residual device lag
- PATCH4 micro UX: **PATCH_COMPLETE**
