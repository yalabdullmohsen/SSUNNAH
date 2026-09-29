# PAGE CONTRACT MATRIX — AppPage / PageHeader / ScreenShell

| Field | Value |
|---|---|
| Captured | 2026-09-29 (PR6) |
| Tip | post PR6 SAFE_REMOVE (`search-legacy` · `section-hub`) |
| Target contract | `AppPage` · `SectionTemplatePage` · `ScreenShell` patterns · Feedback V2 |
| Feedback authority | `docs/design/FORM_FEEDBACK_AUTHORITY.md` |
| Closure report | `docs/design/PR6_PAGE_LEGACY_CLOSURE_REPORT.md` |

## Measured adoption

| Shell / state | Files | Status |
|---|---:|---|
| `UtilityScreen` product consumers | **3** | **KEEP** settings/tools only (≤3) |
| `DetailScreen` / `ListScreen` / `DashboardScreen` | many | **Official ScreenShell adapters** (`compose=mark|layout`) |
| `AppPage` (`TopicPage`) / `SectionTemplatePage` | hubs/discover | Preferred for section chrome |
| Feedback V2 | via ScreenShell status | Loading/Empty/Error/Offline |

## Contract

| Slot | Canonical | Forbidden |
|---|---|---|
| Page shell | `AppPage` / `SectionTemplatePage` / ScreenShell patterns | New `UtilityScreen` outside KEEP allowlist |
| Detail / list | `DetailScreen` / `ListScreen` adapters | Re-implementing shell chrome per page |
| Header | `PageHeader` / `PageHeaderV2` / SectionHero | Duplicate title rows |
| Loading/Empty/Error/Offline | V2 via ScreenShell or direct V2 | Banned busy copy |

## Adapter proof

| Adapter | Primitive | Gate |
|---|---|---|
| `DetailScreen` … `UtilityScreen` | `ScreenShell` | `closure-pr6-page-legacy-gate` |
| `SectionTemplatePage` | `TopicPage` + `sectionTemplateChrome` | same |

## Gate

`no-new-utility-screen-gate.test.ts` — ceiling **3** product consumers.  
`test:final-internal-closure-pr6` — adapters + SAFE_REMOVE.

## Explicit non-claim

`APP_PAGE_CONTRACT_COMPLETE` — not declared (AppPage not universal; pattern screens remain).
