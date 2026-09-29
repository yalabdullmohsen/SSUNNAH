# SOFT CARD RETIREMENT REPORT

| Field | Value |
|---|---|
| Date | 2026-09-29 |
| Status | **IMPROVED** |
| Inventory | `docs/audit/SOFT_CARD_CONSUMER_INVENTORY.md` |

## Measured

| Metric | Before (wave start) | After |
|---|---:|---:|
| tsx files mentioning `soft-card` | ~56–133* | **54** |
| `soft-cards.css` import | ACTIVE (`main.tsx` deferred) | **KEEP** (consumers > 0) |

\*Prior audits mixed CSS class refs vs import refs; inventory now lists exact tsx paths.

## Ports this wave

| File | From | To |
|---|---|---|
| `views/UserStatsPage.tsx` | `div.soft-card` | `AppCard` |
| `pages/account/ui/SettingsView.tsx` | redundant soft-card classes on AppCard | cleaned (AppCard only) |

## Target components (no CardV3)

- `AppCard`
- `SectionEntryCard`
- `NavigationCard` (= HubCard alias)

## Import deletion

**BLOCKED** until consumer inventory = 0 (AppCard itself still applies `soft-card` classes for surface parity — retiring CSS requires AppCard token-only surface first).

## Next

Migrate hub/list pages from inventory top-down; then strip soft-card classes from AppCard internals; then drop `soft-cards.css` import.
