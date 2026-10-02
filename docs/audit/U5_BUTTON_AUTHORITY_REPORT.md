# T-042 — U5 Button Authority Report

| Field | Value |
|-------|-------|
| Phase | `T-042 U5_BUTTON_AUTHORITY` |
| Date (UTC) | `2026-10-02` |
| Tip base | `9e4978137` (`origin/main` @ T-039) |
| Evidence | `docs/audit/evidence/t042-u5-button-authority/` |
| Exit | **`BUTTON_AUTHORITY_ONLY`** · **`DIV_SPAN_INTERACTIONS_CLOSED_OR_JUSTIFIED`** → **PASS** |

Authorities used only: `Button` · `ActionButton` / façades · `IconButton` · `Link` · `Toggle` · `MenuTrigger`.  
No new Button System · No Legacy Button Family · No Div/Button Hybrid · No mushaf reader architecture edits · No prayer calc/scheduling edits · Budgets **lowered** (not raised).

---

## 1. Inventory

### Raw `<button>` (before → after)

| Metric | Before | After | Δ |
|--------|------:|------:|--:|
| rawButtonFiles | 168 | **112** | −56 |
| rawButtonElements | 650 | **485** | −165 |
| officialButtonImportFiles | 205 | **255** | +50 |
| iconButtonConsumerFiles | 33 | **43** | +10 |
| actionButtonConsumerFiles | 7 | 7 | 0 |
| formButtonsMissingType | 0 | 0 | 0 |

### Raw remaining by classification

| Decision | Files | Elements |
|----------|------:|---------:|
| ADMIN_ONLY | 68 | 268 |
| MUSHAF_SPECIAL | 43 | 216 |
| THIRD_PARTY | 1 | 1 (`sidebar.tsx` SidebarRail) |
| PRODUCT / INVALID | **0** | **0** |

Full file list: `evidence/t042-u5-button-authority/raw-button-inventory.json`.

### Product taxonomy (pre-migration decisions → converted)

| Decision | Elements (approx) | Outcome |
|----------|------------------:|---------|
| USE_BUTTON | 27 | Converted → `Button` |
| USE_ICON_BUTTON | 70 | Converted → `IconButton` / `Button` |
| USE_LINK (nav CTAs) | (subset of mix) | Kept/converted → `Link` |
| USE_ACTION_BUTTON | 0 new façades | Existing ActionButton consumers held |
| ADMIN_ONLY | 268 | Boundary held (admin-v3 not broken) |
| MUSHAF_SPECIAL | 216 | Reader controls not rewritten |
| PRAYER_SPECIAL | 0 raw in product wave | — |
| THIRD_PARTY | 1 | SidebarRail KEEP |
| KEEP_JUSTIFIED | infrastructure routed via `Button` (`Pressable`, `mj.tsx`) | Authority path |
| DEAD_PROVEN | 0 | — |

---

## 2. Conversion Summary

### div/span `onClick`

| Metric | Before | After |
|--------|------:|------:|
| divSpanOnClick | 59 | **46** |
| CONVERT_TO_BUTTON remaining | — | **0** |
| CONVERT_TO_LINK remaining | — | **0** |
| KEEP_JUSTIFIED | — | **46** (100%) |

### Converted (samples)

- Expand/collapse headers → `Button` (`TopicQuiz`, `FiqhQawaidView` ×3, `HadithBooksView`, `ScholarlyResearchView`, `SinsAndRights`, `FlashCardsView` flip)
- Cards / banners → `Button` or `Link` (`AsmaaHusna`, `ProphetStories` lux/timeline → Link, `SubmitContent` banner)
- Shared façades → canonical `Button` (`Pressable`, `mj.tsx` ListRow/MjBtn/EmptyState, `HubCard` onClick path)

### KEEP_JUSTIFIED (46) — reasons

| Reason | Count |
|--------|------:|
| EVENT_DELEGATION modal/sheet backdrop or stopPropagation | 25 |
| ADMIN_BOUNDARY expand/collapse or overlay | 17 |
| FILE_DROPZONE drag-and-drop surface | 2 |
| PRESENTATION_SURFACE non-CTA click catcher | 1 |
| INPUT_GROUP_ADDON focus helper | 1 |

Itemized: `evidence/t042-u5-button-authority/div-span-onclick-inventory.json`.

---

## 3. Accessibility Review

| Check | Result |
|-------|--------|
| aria labels on IconButton | Required `label` → `aria-label` + `title` via `IconButton` |
| icon-only actions | Migrated samples use `IconButton` with Arabic labels |
| keyboard focus | Native `<button>` via `Button` (Enter/Space) |
| focus visibility | Canonical `focus-visible` ring on `Button` |
| disabled state | `disabled` + non-opacity-only styles on canonical Button |
| loading state | `loading` ⇒ `aria-busy` + disabled interaction on Button |

SVG graph nodes (`KnowledgeGraphPage` `<g role="button">`) remain SVG — not HTML button candidates.

---

## 4. Admin Exceptions

- **68 files / 268 raw buttons** classified `ADMIN_ONLY`.
- Admin `div onClick` expanders/overlays kept as `KEEP_JUSTIFIED` (`ADMIN_BOUNDARY`) — admin-v3 not refactored in this wave.
- No admin-v3 breakage intended; product wave excluded `/admin` migrations beyond classification.

---

## 5. Mushaf Exceptions

- **43 files / 216 raw buttons** classified `MUSHAF_SPECIAL`.
- Reader controls **not** rewritten (boundary).
- QuranViewer presentation / page-surface clicks remain justified where non-CTA.

---

## 6. Prayer Exceptions

- No prayer calculation or scheduling edits.
- Remaining prayer-adjacent overlays (e.g. Muezzin picker backdrop) under KEEP_JUSTIFIED / prior surfaces — not calc paths.

---

## 7. Final Metrics

| Metric | Before | After | Ceiling after |
|--------|------:|------:|--------------:|
| rawButtonFiles | 168 | 112 | **112** |
| rawButtonElements | 650 | 485 | **485** |
| divSpanOnClick | 59 | 46 | **46** |
| officialButtonImportFiles (floor) | 205 | 255 | floor **255** |
| buttonRelatedImportantApprox | 1221 | 1221 | **1221** |
| buttonRelatedHexApprox | 1703 | 1703 | **1703** |

Debt policy: **decreasing-ceilings** — ceilings lowered; floors raised for canonical adoption.

---

## 8. Exit Decision

| Condition | Status |
|-----------|--------|
| BUTTON_AUTHORITY_ONLY | **PASS** — product raw `<button>` = 0; remaining allowlisted ADMIN / MUSHAF / THIRD_PARTY |
| DIV_SPAN_INTERACTIONS_CLOSED_OR_JUSTIFIED | **PASS** — 46/46 KEEP_JUSTIFIED documented; 0 CONVERT left |
| No invalid interactive element | **PASS** — no INVALID_PRODUCT / CONVERT_TO_BUTTON |
| No new Button System / hybrid | **PASS** |
| Mushaf / Prayer boundaries | **HELD** |

### Final Decision

**PASS** — `BUTTON_AUTHORITY_ONLY`

Do not start U6 Card Authority / U7 Back / U8 Deferred Identity / U9 Route Matrix / Store Readiness / TestFlight from this report’s scope notes until product owners open those phases explicitly.

```
BUTTON_AUTHORITY=BUTTON_AUTHORITY_ONLY
DIV_SPAN=CLOSED_OR_JUSTIFIED
U6_U9=NOT_STARTED
```
