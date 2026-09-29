# PAGE CONTRACT MATRIX — AppPage / PageHeader

| Field | Value |
|---|---|
| Captured | 2026-09-29 |
| Tip | `ff77a662` |
| Target contract | `AppPage` · `PageHeader` · Feedback V2 |
| Feedback authority | `docs/design/FORM_FEEDBACK_AUTHORITY.md` |

## Measured adoption

| Shell / state | Files (approx) | Status |
|---|---:|---|
| `UtilityScreen` | **129** | **ACTIVE_LEGACY** — default for many public pages |
| `AppPage` references | **3** | **PARTIAL** — not yet sole owner |
| `EmptyStateV2` / `LoadingStateV2` / `ErrorStateV2` / `OfflineStateV2` | Authority present | Use for new/migrated pages |
| `LazySectionAccordionPage` + sheet details | ≥7 route modules | **NEEDS_PORT** → ReadingPage |

## Contract (required after migration)

| Slot | Canonical | Forbidden |
|---|---|---|
| Page shell | `AppPage` (or documented DashboardScreen for dashboards) | Ad-hoc full-bleed wrappers without safe-area |
| Header | `PageHeader` / `PageHeaderV2` | Duplicate title rows + search strips |
| Loading | `LoadingStateV2` / route skeleton matching final geometry | Busy copy banned strings |
| Empty | `EmptyStateV2` | «عنصر غير موجود» only |
| Error | `ErrorStateV2` | Raw provider payloads |
| Offline | `OfflineStateV2` | Fake online success |
| Forms | Form Feedback Authority | Native `<select>` on new public forms |

## Retirement plan for UtilityScreen

1. Migrate hubs → AppPage + SectionEntryCard.  
2. Migrate reading/detail → ReadingPage.  
3. Gate: no new `UtilityScreen` imports (follow-up).  
4. Delete UtilityScreen only after consumer=0.

## Explicit non-claim

`APP_PAGE_CONTRACT_COMPLETE` is **not** declared while UtilityScreen ≥ 100 files.
