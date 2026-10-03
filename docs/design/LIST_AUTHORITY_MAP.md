# LIST_AUTHORITY_MAP — سُنّة

| Field | Value |
|---|---|
| Status | **AUTHORITY MAP** |
| Date | 2026-10-03 |
| Exit | `LIST_AUTHORITY_ONLY` (product) |
| Façades | `design-system/ListSystem.tsx` |

No parallel list kit. Façades compose existing authorities only.

## Approved authorities (names → equivalents)

| Requested name | Canonical equivalent | Use |
|---|---|---|
| **SimpleList** | `SimpleList` → rows via `ContentRow` | Read-only / dense content rows |
| **InteractiveList** | `InteractiveList` → `Button`/`ContentRow` interactive rows | Expand, select, in-page actions |
| **NavigationList** | `NavigationList` → `SettingsList` · `SectionRow` · nav `Link` rows | Route / settings navigation |
| **ResultList** | `ResultList` → `VirtualList` (+ search empty/no-results) | Long / virtualized results |

Supporting: `ListScreen` shell · `HadithListCard` / `UnifiedLessonCard` as **item** façades (not alternate list systems) · `FilterChips` for list filters.

## Classification

| Surface | Class |
|---|---|
| Settings / account rows (`SettingsList` · `NavigationList` façade) | APPROVED |
| Section hubs (`SectionRow` · Hub cards) | APPROVED |
| Search / long feeds (`VirtualList` · `ResultList`) | APPROVED |
| Lesson / hadith card lists (AppCard item façades) | APPROVED (item) |
| Page-local `*-list` CSS without ContentRow/SettingsList | LEGACY |
| Admin list/grids · mushaf verse lists | SPECIAL_CASE |

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
