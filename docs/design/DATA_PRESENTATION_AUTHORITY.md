# DATA_PRESENTATION_AUTHORITY — سُنّة

| Field | Value |
|---|---|
| Status | **AUTHORITY** |
| Date | 2026-10-03 |
| Exit | `DATA_PRESENTATION_UNIFIED` |

## Hierarchy

| Layer | Authority |
|---|---|
| Cards | `AppCard` / `InteractiveCard` (+ façades) |
| Tables | `ui/table` + `.ss-data-table` |
| Lists | `ListSystem` façades → ContentRow / SettingsList / VirtualList |
| Stats / counters | semantic text + StatusCard strips — no ad-hoc stat kits |
| Badges / tags | `StatusBadge` · domain badges (HadithGrade, LessonStatus, Source) |
| Chips / filters | `FilterChips` / `FilterChip` |
| Metadata | Caption / SupportingText (`SsText`) |

## Status color

Use semantic tokens (`--mj-danger` · brand · muted) via `StatusBadge` tones.  
Forbidden: page-local hex status pills for new work.

## Density

| Context | Density |
|---|---|
| Reading / detail | Comfortable — cards + blocks |
| Settings / nav lists | Compact rows (`SettingsList` / ContentRow) |
| Admin tables | SPECIAL_CASE admin density |
| Search results | Virtualized ResultList |

## Eliminate

- Competing badge palettes on the same route
- Duplicate table recipes with hard-coded borders
- Metadata layouts that invent a third spacing scale

## Gates

`test:table-list-authority` · `test:card-surface-authority` · visual/interaction debt budgets
