# Visual Batch 1 — Cards · Buttons · Forms · States

Date: 2026-10-03 · Branch: `cursor/visual-batch1-cards-buttons-forms-states` · Base: `d27895888` (#2492)

## Scope

Public product + settings/account + lessons/worship search surfaces. No Mushaf reader chrome. No prayer calculation logic. No admin editors in this batch.

## Migrations

### Forms → SearchInput authority
- `FawaidView` search
- `UpdatesPage` search
- `LessonsArchivePage` search
- `TeachersIndexPage` search
- `PrayerRanksView` search

### States → Feedback V2
- `UpdatesPage`: ErrorState/Empty → ErrorStateV2 / EmptyStateV2
- `RulingDetailView`: ErrorState → ErrorStateV2
- `FawaidView`: Empty → EmptyStateV2 / NoResultsState
- `LessonsArchivePage`: DIY empty → EmptyStateV2 / NoResultsState
- `TeachersIndexPage`: DIY empty → NoResultsState

### Cards / elevation / radius debt
- Page CSS `border-radius: {7,9,12,14,16,20,24}px` → `--sf-radius-*` tokens (15 page files + 3 component/shell files)
- Removed redundant `box-shadow: none` (identity cards, discover-islam, highlighted-content, sunnah-visual-language, card-system-v2, prophet-stories dark compact)

### Buttons
- Product public raw `<button>` outside ADMIN/QURAN_MUSHAF already **0** (held). No blind admin/mushaf absorb.

## Metrics

| Signal | Before | After |
|---|---:|---:|
| boxShadowDecls | 1026 | **1010** |
| borderRadiusPxDecls | 456 | **429** |
| sfTokenRefs | 1063 | **1090** |
| rawButtonFiles | 102 | 102 (held; residual ADMIN+QURAN) |
| rawButtonElements | 457 | 457 (held) |

Ceilings lowered to measured values. Floors for sfTokenRefs raised.

## Exits

- CARD_AUTHORITY_PROGRESS
- BUTTON_AUTHORITY_HELD (product)
- FORM_AUTHORITY_PROGRESS
- STATE_AUTHORITY_PROGRESS
- DESIGN_DEBT_REDUCED
