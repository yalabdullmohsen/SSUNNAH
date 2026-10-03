# ADMIN_UI_AUTHORITY_MAP — سُنّة

| Field | Value |
|---|---|
| Status | **ACTIVE** |
| Date | 2026-10-03 |
| Exit | `ADMIN_UI_STANDARDIZED` |
| Scope | `artifacts/majalis/src/admin-v3/**` (+ shared primitives) |
| Related | `ADMIN_V3_INTERACTION_AUTHORITY.md` · FORM/TABLE/LIST/MODAL/FILTER maps |

**Goal:** Admin screens feel like one product — same spacing, cards, actions, navigation, and feedback as consumer chrome via authority composition.

## Canonical admin mapping

| Need | Authority | Forbidden |
|---|---|---|
| Tables | Admin table primitives composing `ss-data-table` / shared table rows | One-off table kits per domain |
| Forms | `FormLabel` · `FieldError` · `SearchInput` · `Button` | Placeholder-only errors · raw confirm |
| Filters | Filter authority + shared admin filter bar | Parallel chip systems |
| Dialogs | `AdminConfirmDialog` / `ConfirmDialog` / Dialog | `window.confirm` / `alert` |
| Editors | Compose Form + Button + Feedback V2 | Domain-local button CSS as sole kit |
| Spacing / cards | `--sf2-space-*` · `AppCard` / `InteractiveCard` | Page-local padding scales |
| Feedback | `EmptyStateV2` · `LoadingStateV2` · `ErrorStateV2` · `OfflineStateV2` | Parallel `av3-state` as sole contract |

Thin `av3-*` wrappers **OK** when they compose the above — not a second design system.

## Unification checklist

- [x] Interaction primitives documented (`ADMIN_V3_INTERACTION_AUTHORITY`)
- [x] This map binds admin UX to product authorities
- [ ] Migrate legacy `views/admin/**` when touched (LEGACY → compose)
- [ ] Coverage tracked via `AUTHORITY_COVERAGE_REPORT` (admin paths included)

## Gates

```bash
pnpm --filter @workspace/majalis run test:admin-v3-interaction-authority
pnpm --filter @workspace/majalis run test:polish-consistency
```

## Non-claims

لا UNIFIED_100 · Mushaf untouched · Store HOLD · legacy admin migrate-when-touched.
