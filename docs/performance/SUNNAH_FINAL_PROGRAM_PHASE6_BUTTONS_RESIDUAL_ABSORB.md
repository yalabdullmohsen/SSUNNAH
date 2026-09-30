# SUNNAH FINAL Program — Phase 6: Buttons Residual Absorb

| Field | Value |
|---|---|
| Status | **IMPLEMENTED** (Delivery = merge + MATCH) |
| Base | `origin/main` @ `04ba4faf` (Phase 5 Cards MATCH) |
| Branch | `cursor/buttons-residual-absorb-p6` |
| Authority | `docs/design/INTERACTION_COMPONENT_AUTHORITY.md` · `docs/design/BUTTON_DEBT_PROGRESS.md` |

## Fix

Raw `<button>` on 15 public (non-mushaf / non-admin) surfaces → canonical `Button` / `IconButton` with preserved `className`, `role="tab"`, submit types, and labels.

| File | Change |
|---|---|
| `PrivacyCenterPage` | consent + export → `Button` secondary |
| `ProgressCenterView` | clear/refresh → `Button` secondary/destructive |
| `QuranCirclesView` | expand → `Button` ghost |
| `IslamicGlossaryView` | category tabs + term head → `Button` |
| `UpdatesPage` | filter tabs → `Button` |
| `UploadPage` | remove + submit → `Button` |
| `ContactPage` / `SupportPage` | copy → `Button` ghost |
| `SubmitContentPage` | submit → `Button` |
| `UserStatsPage` | resume delete → `IconButton` (`label`) |
| `AlamatSaahPage` | tabs → `Button` |
| `InstitutionsPage` | type chips → `Button` |
| `NewMuslimDayDetailPage` | complete → `Button` |
| `IslamicSectsDetailPage` | load heavy → `Button` |
| `UniversitiesComparePage` | remove → `Button` destructive |

## Debt

| Metric | Before | After |
|---|---:|---:|
| `rawButtonFiles` | 183 | **168** (−15) |
| `rawButtonElements` | 671 | **650** (−21) |
| `officialButtonImportFiles` | 189 | **202** |

Ceilings lowered (decreasing-ceilings). Floors raised for official imports.

## Gates

```bash
pnpm --filter @workspace/majalis run test:buttons-residual-absorb
pnpm --filter @workspace/majalis run test:interaction-system-debt-budget
pnpm --filter @workspace/majalis run test:visual-system-debt-budget
```

## Deferred (follow-up)

- `QuranViewer` (14) · `QuranMemorizationView` (12) · mushaf controls · admin editors — classify before migrate; not in this PR.

## Non-claims

لا نظام أزرار جديد · لا MUSHAF/Admin rewrite · لا رفع سقف دين · لا ZERO_INTERNAL_DEBT.
