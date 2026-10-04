# LIST_AUTHORITY_MAP — سُنّة

| Field | Value |
|---|---|
| Status | **AUTHORITY MAP** |
| Date | 2026-10-04 |
| Exit | `LIST_AUTHORITY_ONLY` (product) |
| Façades | `design-system/ListSystem.tsx` |
| Wave | Eradication **PR E / Wave 2** |

No parallel list kit. Façades compose existing authorities only.

## Approved authorities (names → equivalents)

| Requested name | Canonical equivalent | Use |
|---|---|---|
| **SimpleList** | `SimpleList` → rows via `ContentRow` | Read-only / dense content rows |
| **InteractiveList** | `InteractiveList` → `Button`/`ContentRow` interactive rows | Expand, select, in-page actions |
| **NavigationList** | `NavigationList` → `SettingsList` · `SectionRow` · nav `Link` rows | Route / settings navigation |
| **ResultList** | `ResultList` → `VirtualList` (+ search empty/no-results) | Long / virtualized results |

Supporting: `ListScreen` shell · `HadithListCard` / `UnifiedLessonCard` as **item** façades (not alternate list systems) · `FilterChips` for list filters · `SettingsList` as navigation/settings row authority.

## Classification

| Surface | Class |
|---|---|
| Settings / account rows (`SettingsList` · `NavigationList` façade) | **CANONICAL_AUTHORITY** / APPROVED |
| Section hubs (`SectionRow` · Hub cards) | APPROVED |
| Search / long feeds (`VirtualList` · `ResultList`) | APPROVED |
| Lesson / hadith card lists (AppCard item façades) | APPROVED (item) |
| Page-local `*-list` CSS without ContentRow/SettingsList | LEGACY → absorb in later waves |
| Admin list/grids · mushaf verse lists | **SPECIAL_CASE** |
| `mj.tsx` `ListRow` | **DEAD_WITH_PROOF** — removed; zero TSX consumers outside definition/re-export |

## Visual contract

| Rule | Value |
|---|---|
| Item padding | token rhythm (`--ds-space-*` / identity row classes) |
| Separators | hairline · avoid double borders |
| Radius | shared `--radius-card` / control — not page-unique |
| Hover / active | pressable + muted surface · no opacity-only |
| Empty / loading | Feedback V2 |
| Touch | ≥ 44px interactive rows |

## Gates

```bash
pnpm --filter @workspace/majalis run test:table-list-authority
```
