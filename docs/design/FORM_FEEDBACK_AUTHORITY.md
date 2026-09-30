# Form + Feedback Authority — سُنّة

| Field | Value |
|---|---|
| Status | **AUTHORITY (Interaction PR-6)** |
| Controls | `components/ui` — `Input` · `Textarea` · `Select` · `Toggle` (Switch-like) · Checkbox via native/`SettingsToggleRow` |
| Field helpers | `design-system/FormFields.tsx` — `FormLabel` · `FieldDescription` · `FieldError` · `FormActions` · `SearchInput` |
| Actions | `FormActions` + `Button` `primary` / `secondary` (see Interaction PR-1) |
| Feedback | `EmptyStateV2` · `NoResultsState` · `LoadingStateV2` · `ErrorStateV2` · `OfflineStateV2` · `StaleDataIndicator` · `PermissionDeniedState` · `RateLimitedState` · `StatusCard` |
| Mushaf | **MUSHAF_SPECIAL** — لا ترحيل عام لنماذج المصحف |
| Store | HOLD · Web `WEB_RELEASED_NATIVE_HOLD` |

## Canonical primitives

| Role | Component | Source |
|---|---|---|
| Text | `Input` | `components/ui/input.tsx` |
| Multiline | `Textarea` | `components/ui/textarea.tsx` |
| Select | `Select` (+ trigger/content) | `components/ui/select.tsx` |
| Toggle / switch-like | `Toggle` · `SettingsToggleRow` | `ui/toggle` · `design-system/SettingsList` |
| Checkbox | native `type="checkbox"` in settings rows until a dedicated Switch lands | — |
| Label | `FormLabel` → wraps `ui/label` | `design-system/FormFields.tsx` |
| Hint | `FieldDescription` | same |
| Field / form error | `FieldError` (`role="alert"`) | same |
| Action row | `FormActions` (+ optional primary/secondary `Button`) | same |
| Search field | `SearchInput` (`type="search"`, optional clear `IconButton`) | same |

Do **not** invent parallel form kits or page-local hex/`!important` for controls.

## Feedback states (page / section)

| State | Component | Notes |
|---|---|---|
| Empty | `EmptyStateV2` | Request succeeded and there is **no source data** — not a filter miss |
| No results | `NoResultsState` | Index/data exists but search/filters returned nothing — keep query; offer clear |
| Loading | `LoadingStateV2` | Skeleton-first; reserve geometry; no banned busy copy; bounded by error path |
| Error (page) | `ErrorStateV2` | Friendly Arabic copy; optional `correlationId` only — never raw provider payloads |
| Offline | `OfflineStateV2` | Honest about stale cache; do not treat cached content as Error |
| Stale | `StaleDataIndicator` | Keep content visible; quiet refresh; no layout wipe |
| Permission denied | `PermissionDeniedState` | 401/403 — login/home actions; no admin internals |
| Rate limited | `RateLimitedState` | 429 — cooldown before retry; no retry storm |
| Inline status strip | `StatusCard` | Non-navigation status surface |

Field-level validation → `FieldError` linked with `aria-describedby`. Page/section failure → `ErrorStateV2` (or `StatusCard` when strip-sized).

### Contract rules (WAVE4)

1. **Empty ≠ NoResults** — never show “لا محتوى في النظام” when filters/search are the cause.
2. **Offline ≠ Error** — show `OfflineStateV2` (and cached content when available).
3. **Retry** — in-place refetch via canonical `Button`; no full `location.reload` unless proven necessary; cancel in-flight on unmount/route change.
4. **No raw API / stack / provider strings** in UI.
5. **Skeletons** match final card/list geometry to limit CLS.
6. **Admin access denial** for public → `PermissionDeniedState` or product 404 copy — never leak admin surfaces.

## Rules

1. **Mobile inputs ≥ 16px** — use `text-base` on controls (avoid iOS zoom); `md:text-sm` ok on larger breakpoints.
2. **Labels visible** — no placeholder-only fields; `FormLabel` (or visible `<label>`) associated via `htmlFor` / `id`.
3. **Errors linked** — every `FieldError` has a stable `id`; control sets `aria-describedby` (and `aria-invalid` when invalid).
4. **`type` explicit on buttons** — `type="button"` default outside intentional submit; submit uses `type="submit"`.
5. **No raw API / provider errors** in UI — map to Arabic product copy (`mapAuthError`, delete-friendly messages, etc.).
6. **No `window.confirm` / `window.alert`** for product flows — use in-page `alertdialog`, `FieldError`, or `ErrorStateV2`.
7. **Link vs Button** — navigation = `Link` / `<a>`; in-page actions = `Button` (Interaction PR-1). Never fake navigation with buttons or actions with `href="#"`.
8. **Touch-friendly** — prefer `min-h-11` / token density on form controls and action rows; no opacity-only disabled.
9. **No hex / `!important`** inside FormFields primitives.

## Migration rules

1. Thin wrappers only — compose existing `ui/*` + design-system feedback.
2. Migrate Account / Auth / Settings first; do not blind-codemod the tree.
3. Keep page layout classes (`login-field`, `accd-*`) when they own spacing; swap control/error atoms.
4. Mushaf forms stay MUSHAF_SPECIAL until a dedicated wave.
5. Debt budget: run `inventory:interaction-system --write-budget` only when raw `<button>` counts drop.

## Gates

```bash
pnpm --filter @workspace/majalis run test:form-feedback-authority
pnpm --filter @workspace/majalis run test:sunnah-ui-refinement
```
