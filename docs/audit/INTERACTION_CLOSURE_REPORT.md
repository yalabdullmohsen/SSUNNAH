# INTERACTION_CLOSURE_REPORT

| Field | Value |
|-------|-------|
| Status | `BUTTON_DEBT_REDUCED` |
| Date UTC | 2026-10-03 |
| Authority | `interaction-system-debt-budget.json` |
| Gates | interaction-system-authority · buttons-residual-absorb · u5-button-authority |

## Before / after

| Metric | Prior ceiling (this branch start) | After | Delta |
|--------|-----------------------------------|-------|-------|
| `rawButtonFiles` | 99 | **97** | −2 |
| `rawButtonElements` | 454 | **447** | −7 |
| `divSpanOnClick` | 42 | **42** | held |
| `officialButtonImportFiles` (floor) | 264 | **266** | +2 |
| `formButtonsMissingType` | 0 | 0 | held |

(Against older main HEAD: files 102→97, elements 457→447.)

## Replacements this wave

| Surface | Action | Class |
|---------|--------|-------|
| `AdminUI.tsx` error reset | → `Button` | REPLACE_WITH_BUTTON |
| `UsersSection.tsx` filters | → `Button` | REPLACE_WITH_BUTTON |
| `sidebar.tsx` trigger controls | → `Button` | REPLACE_WITH_BUTTON |
| `OpenPlatformSection.tsx` actions | → `Button` | REPLACE_WITH_BUTTON |
| `FeatureStatusPage.tsx` health actions | → `Button` | REPLACE_WITH_BUTTON |

## Remaining inventory (classified)

| Bucket | Count (approx) | Class |
|--------|----------------|-------|
| Admin raw `<button>` (ProphetStories, Automation*, BulkImport, …) | ~90 files residual | REPLACE_WITH_BUTTON (admin backlog) |
| Modal overlay `div onClick` dismiss | ContentFileImport, AdminModal, … | KEEP_JUSTIFIED |
| Mushaf word/ayah hit targets | MushafVerseLayer / madinah lines | SPECIAL_CASE / Mushaf_SPECIAL — do **not** force Button Authority into reading gestures |
| QuranViewer / GlobalSearchModal overlay hits | few | KEEP_JUSTIFIED or REPLACE case-by-case |

## Rules

- Reading gestures remain outside Button Authority (Mushaf_SPECIAL).
- No ceiling raises.
- Interaction consistency: official Button import floor raised.

## Exit

```text
BUTTON_DEBT_REDUCED
INTERACTION_CEILINGS_DECREASED
MUSHAF_GESTURES_NOT_FORCED_TO_BUTTON
ADMIN_RAW_BUTTON_BACKLOG_REMAINS
```
