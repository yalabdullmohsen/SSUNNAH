# PAGE CONTRACT MATRIX — AppPage / PageHeader

| Field | Value |
|---|---|
| Captured | 2026-09-29 (repo-closure-w1) |
| Tip | post UtilityScreen retirement wave |
| Target contract | `AppPage` · `PageHeader` · Feedback V2 · screen patterns |
| Feedback authority | `docs/design/FORM_FEEDBACK_AUTHORITY.md` |

## Measured adoption

| Shell / state | Files | Status |
|---|---:|---|
| `UtilityScreen` product consumers | **9** (was 128) | **KEEP** settings/tools only |
| `DetailScreen` mark shells | many (migrated from Utility) | Interim content shell |
| `AppPage` / `SectionTemplatePage` | growing | Preferred for hubs/discover |
| Feedback V2 | Authority present | Use on migrated pages |

## Contract

| Slot | Canonical | Forbidden |
|---|---|---|
| Page shell | `AppPage` / `SectionTemplatePage` / pattern screens | New `UtilityScreen` outside KEEP allowlist |
| Header | `PageHeader` / `PageHeaderV2` | Duplicate title rows |
| Loading/Empty/Error/Offline | V2 components | Banned busy copy |

## Gate

`no-new-utility-screen-gate.test.ts` — ceiling **9** product consumers.

## Explicit non-claim

`APP_PAGE_CONTRACT_COMPLETE` — not declared (DetailScreen interim + AppPage not universal).
