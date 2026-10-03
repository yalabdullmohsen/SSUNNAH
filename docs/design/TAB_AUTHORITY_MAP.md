# TAB_AUTHORITY_MAP — سُنّة

| Field | Value |
|---|---|
| Status | **AUTHORITY MAP** |
| Date | 2026-10-03 |
| Exit | `TAB_AUTHORITY_ONLY` (product) |
| Façades | `design-system/TabSystem.tsx` |

No parallel tab kit. Compose `Button` + role=tablist or approved filter/nav surfaces.

## Approved

| Intent | Component | Source |
|---|---|---|
| Page / content section tabs | `ContentTabs` · `PageTabs` | `design-system/TabSystem.tsx` |
| Filter exclusive choice (chips) | `SegmentedFilter` · `FilterChips` | `filters/SegmentedFilter.tsx` |
| App shell bottom tabs | `BottomNavBar` | Navigation authority (not content tabs) |
| Story section TOC tabs | `ProphetStoryTabs` (Button + tablist) | KEEP until ContentTabs absorb |

## Classification

| Surface | Class |
|---|---|
| ContentTabs / PageTabs · SegmentedFilter | APPROVED |
| BottomNavBar tab strip | APPROVED (navigation) |
| ProphetStoryTabs | APPROVED (façade; migrate markers to ContentTabs when touched) |
| Admin category / admin-v3 tabs | SPECIAL_CASE (ADMIN_ONLY) |
| Mushaf reader chrome tabs / tafsir panels | SPECIAL_CASE (MUSHAF_SPECIAL) |
| Page-local `*-tabs-bar` / `role=tab` DIY | LEGACY — migrate when touched |

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
