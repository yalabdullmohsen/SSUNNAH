# FORM_AUTHORITY_MAP — سُنّة

| Field | Value |
|---|---|
| Status | **AUTHORITY MAP** |
| Date | 2026-10-04 |
| Source of truth | `docs/design/FORM_FEEDBACK_AUTHORITY.md` |
| Exit target | `FORM_AUTHORITY_ONLY` (product surfaces) |
| Wave | Eradication **PR F / Wave 3** — Quran Numbers search → `SearchInput` |

No new form kit. Compose `ui/*` + `design-system/FormFields`.

## Approved primitives

| Element | Component | Class |
|---|---|---|
| Text | `Input` | APPROVED |
| Search | `SearchInput` | APPROVED |
| Multiline | `Textarea` | APPROVED |
| Select | `Select` (+ trigger/content) | APPROVED |
| Toggle / switch-like | `Toggle` · `ToggleButton` · `SettingsToggleRow` | APPROVED |
| Checkbox (settings) | native in `SettingsToggleRow` / settings rows | APPROVED |
| Label | `FormLabel` | APPROVED |
| Helper | `FieldDescription` | APPROVED |
| Error | `FieldError` (`role="alert"`) | APPROVED |
| Action row | `FormActions` + `Button` | APPROVED |

## Classification rules

| Class | Meaning |
|---|---|
| APPROVED | Canonical control; new code must use it |
| LEGACY | Native/`page-local` control still present; migrate when touched |
| SPECIAL_CASE | Admin editor / Mushaf / third-party — out of general wave |

## Inventory snapshot (public non-admin / non-mushaf TSX)

| Kind | Count (approx) | Notes |
|---|---:|---|
| Files using `ui/input|textarea|select` | 30 | APPROVED path |
| Files with native `<input|textarea|select>` and no ui import | 104 | mostly LEGACY filters/settings; migrate opportunistically |
| Mushaf / Admin native fields | excluded | SPECIAL_CASE |

### LEGACY hotspots (migrate when page is next touched)

- Account: `NotificationsAndSoundView`, `NotificationSettingsView`, auth password forms
- Content filters: `HadithView`, `ReadingPlansView`, `ZakatView`, `SalahGuideView`, `CardsPage`
- Tools: `VaultPage`, `TranscribePage`, `MyCitationsPage`, `IslamStatsPage`

### SPECIAL_CASE (held)

- Mushaf search / prefs / audio docks
- Admin CRUD editors / review hub filters
- Third-party command/menu primitives

## Visual contract (shared)

| Token / rule | Value |
|---|---|
| Control min height | ≥ 44px (`min-h-11`) |
| Mobile font | `text-base` (≥16px) to avoid iOS zoom |
| Radius | `--sf-radius-control` / `--radius-control` |
| Focus | `focus-visible` ring — never remove without replacement |
| Error link | `aria-invalid` + `aria-describedby` → `FieldError` id |
| Disabled | attribute + distinct surface (not opacity-only) |

## Gates

```bash
pnpm --filter @workspace/majalis run test:form-feedback-authority
pnpm --filter @workspace/majalis run test:interaction-system-debt-budget
```
