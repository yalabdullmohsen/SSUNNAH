# T-044 — U7 Back Authority Report

| Field | Value |
|-------|-------|
| Phase | `T-044 U7_BACK_AUTHORITY` |
| Date (UTC) | `2026-10-02` |
| Base | T-043 tip (`CARD_AUTHORITY_ONLY`) |
| Evidence | `docs/audit/evidence/t044-u7-back-authority/` |
| Exit | **`BACK_AUTHORITY_ONLY`** · **`FLOATING_LAYER_CERTIFIED`** → **PASS** |

Allowed: `AppBackButton` · Native back integration · Floating back fallback · `FloatingLayerManager`.  
No new Back System · No page-local `history.back` · Mushaf reader flow untouched · Prayer engine/calc untouched.

Prerequisite: `docs/audit/U6_CARD_AUTHORITY_REPORT.md` = `CARD_AUTHORITY_ONLY`.

---

## 1. Back Inventory

### Patterns measured

| Pattern | Product hits (after) | Classification |
|---------|---------------------:|---------------|
| `history.back(` | 2 files | `navigation-back.ts` = APP_BACK_BUTTON · `MushafBookmarkEditorShell` = MUSHAF_SPECIAL |
| `navigate(-1)` | **0** | — |
| `goBackOrFallback` | central + FeatureTour | APP_BACK_BUTTON / KEEP_JUSTIFIED |
| `AppBackButton` consumers | expanded | APP_BACK_BUTTON |
| Floating / fixed back host | `FloatingBackButton` | FLOATING_FALLBACK |

### Migrated (this wave)

| Surface | Before | After |
|---------|--------|-------|
| PrayerTimesView `pts-back` | IconButton + local `goBackOrFallback` | `AppBackButton` |
| ProphetStoryReaderHeader | raw Button + `onBack` | `AppBackButton` |
| CompetitionDetailView | `Link` parent | `AppBackButton` |
| ArbaeenHadithDetailView | `Link` parent | `AppBackButton` |
| SubmitContentPage | `Link` home | `AppBackButton` |

`hasInPageBackChrome` expanded for: `/prayer-times`, `/prophets*`, `/competitions/:id`, `/arbaeen-nawawi*`, `/submit`.

---

## 2. Floating Inventory

| Control | Owner | Status |
|---------|-------|--------|
| Floating back host | `FloatingBackButton` → `AppBackButton` bar + `getFloatingBottomOffset("floating-back")` | FLOATING_FALLBACK |
| ScrollToTop | FloatingLayerManager offsets | OK |
| Assistant FAB | FloatingLayerManager suppress | OK |
| Mini player | slot `mini-player` | OK |
| Mushaf bookmark editor | suppresses background FABs | MUSHAF_SPECIAL |
| Dialog/Sheet overlays | `isModalLayerOpen` | OK |

Policy: `docs/design/FLOATING_CONTROLS_POLICY.md`. Operational SoT: `lib/floating-layer-manager.ts` + `FloatingLayerSync`.

Baseline `floatingControlFileMentions`: **10** (held).

---

## 3. Consolidation Summary

- Page-level route back → `AppBackButton` + `goBackOrFallback` only.
- Floating host suppressed when `hasInPageBackChrome` / immersive / home (rule 6).
- No second Back System introduced.
- Removed unjustified local IconButton/Link back chrome on prayer + detail pages listed above.

---

## 4. Mushaf Review

- Immersive `/mushaf*` still suppresses floating back via `isImmersiveChromePath`.
- `MushafBookmarkEditorShell` keeps `history.back()` for sheet dismiss — **MUSHAF_SPECIAL KEEP_JUSTIFIED**.
- No reader flow / page mapping / navigation model edits.

---

## 5. Prayer Review

- Calculation / scheduling / engine: **unchanged**.
- Navigation ownership: `pts-back` now `AppBackButton` (in-page); floating suppressed via `hasInPageBackChrome` + existing `isPrayerTimesPath`.

---

## 6. Exceptions

| Item | Decision | Reason |
|------|----------|--------|
| MushafBookmarkEditorShell `history.back` | MUSHAF_SPECIAL | Sheet dismiss |
| `navigation-back.ts` `history.back` | APP_BACK_BUTTON | Canonical helper |
| FeatureTour `goBackOrFallback` | KEEP_JUSTIFIED | Tour/sheet close |
| Wizard step «رجوع» (e.g. Mawarith) | KEEP_JUSTIFIED | Step state, not route stack |
| Mushaf search sheet back | MUSHAF_SPECIAL | Sheet close |
| Knowledge `kc-back` Links | KEEP_JUSTIFIED | Parent section Link |
| Admin dialogs | ADMIN_ONLY | Boundary |
| `/support` `/contact` floating suppress without in-page AppBack | KEEP_JUSTIFIED (P7) | Native/browser |

---

## 7. Final Metrics

| Metric | Result |
|--------|--------|
| Product page raw `history.back` | **0** (only authority + mushaf sheet) |
| `navigate(-1)` | **0** |
| Unclassified back systems | **0** |
| Floating layer SoT | FloatingLayerManager |
| Debt ceilings raised | **No** |
| Button import floor | 253→**252** (documented: IconButton/Button → AppBackButton) |

---

## 8. Exit Decision

| Condition | Status |
|-----------|--------|
| BACK_AUTHORITY_ONLY | **PASS** |
| FLOATING_LAYER_CERTIFIED | **PASS** |
| No multi-back ownership conflicts (unjustified) | **PASS** |
| Mushaf / Prayer boundaries | **HELD** |

### Final Decision

**PASS** — `BACK_AUTHORITY_ONLY` + `FLOATING_LAYER_CERTIFIED`

Do not start U8 Deferred Identity / U9 Route Matrix / Store / TestFlight until this exit is accepted and the next phase is opened.

```
BACK_AUTHORITY=BACK_AUTHORITY_ONLY
FLOATING_LAYER=CERTIFIED
U8_U9=NOT_STARTED
```
