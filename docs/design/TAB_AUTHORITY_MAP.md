# TAB_AUTHORITY_MAP — سُنّة

| Field | Value |
|---|---|
| Status | **AUTHORITY MAP** |
| Date | 2026-10-04 |
| Exit | `TAB_AUTHORITY_ONLY` (product) |
| Façades | `design-system/TabSystem.tsx` |
| Wave | Eradication **PR G / Wave 4** |

No parallel tab kit. Compose `ContentTabs` / `PageTabs` or approved filter/nav surfaces.

## Approved

| Intent | Component | Source |
|---|---|---|
| Page / content section tabs | `ContentTabs` · `PageTabs` | `design-system/TabSystem.tsx` |
| Filter exclusive choice (chips) | `SegmentedFilter` · `FilterChips` | `filters/SegmentedFilter.tsx` |
| App shell bottom tabs | `BottomNavBar` | Navigation authority (not content tabs) |
| Story section TOC tabs | `ProphetStoryTabs` → **ContentTabs** façade | APPROVED |

## Classification

| Surface | Class |
|---|---|
| ContentTabs / PageTabs · SegmentedFilter | **CANONICAL_AUTHORITY** / APPROVED |
| BottomNavBar tab strip | APPROVED (navigation) |
| `ProphetStoryTabs` · `QuranEnginePage` nav | APPROVED (ContentTabs) |
| `QuranNumbersView` theme/group | APPROVED (`SegmentedFilter` — filter intent) |
| Admin category / admin-v3 tabs | SPECIAL_CASE (ADMIN_ONLY) |
| Mushaf reader chrome tabs / tafsir panels | SPECIAL_CASE (MUSHAF_SPECIAL) |
| Remaining page-local `role=tablist` DIY | LEGACY — migrate when touched (inventory in WAVE4 report) |

## Visual / interaction contract

| Rule | Value |
|---|---|
| Min height / touch | `--ss-tab-min-height` ≥ 44px (`2.75rem`) |
| Padding | `--ss-tab-pad-y` / `--ss-tab-pad-x` |
| Typography | `--ss-tab-font-size` · weight 500 → 700 active |
| Active | brand color + underline (or pill border) — not color-only |
| Inactive | muted ink (`--mj-ink-2`) |
| Hover | muted surface + ink |
| Focus | `focus-visible` ring brand |
| Icons | above label (underline) or inline (pill) |
| Mobile | horizontal scroll · hidden scrollbar |
| Desktop | same language · no second tab recipe |

## Gates

`test:tab-nav-authority`
