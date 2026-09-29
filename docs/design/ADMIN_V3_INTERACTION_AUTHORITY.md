# Admin v3 Interaction Authority — سُنّة

| Field | Value |
|---|---|
| Status | **AUTHORITY (Interaction PR-7)** |
| Scope | `artifacts/majalis/src/admin-v3/**` + shared admin primitives used by v3 |
| Actions | Canonical `Button` (`components/ui/button.tsx`) · façades `IconButton` where icon-only |
| Surfaces | `AppCard` · `InteractiveCard` · `StatusCard` (via `design-system`) |
| Forms | `FormLabel` · `FieldError` · `FormActions` · `SearchInput` (`FormFields.tsx`) |
| Feedback | `EmptyStateV2` · `LoadingStateV2` · `ErrorStateV2` · `OfflineStateV2` |
| Mushaf | **UNTOUCHED** — MUSHAF_SPECIAL |
| Store | **HOLD** · Web `WEB_RELEASED_NATIVE_HOLD` |

## Inventory (PR-7 focus)

Highest-traffic Admin v3 surfaces migrated first:

| Surface | Role |
|---|---|
| `AdminV3Shell` | Shell chrome · nav · search · account |
| `AdminV3Dashboard` | Overview center cards |
| `AdminV3CenterWorkspace` | Center tool grid · filters · pager |
| `ui/primitives` | Shared header/table/filter/form/dialog/load-gate |
| `states` | Empty / loading / error / offline façades |
| `domains/reviews/ReviewInboxPage` | Review inbox · filters · bulk decide |
| `domains/content/EntityCrudPage` | Lessons / sheikhs / fawaid CRUD |
| `domains/content/ContentHubPage` | Content hub cards |

Legacy `views/admin/**` remains compatibility — migrate in later waves; do not invent a parallel admin button kit there either when touched.

## Canonical mapping

| Admin need | Use | Forbidden |
|---|---|---|
| In-page action | `Button` (`primary` / `secondary` / `outline` / `ghost` / `destructive`) | Raw `<button>` · parallel `av3-btn` kit as the only control system |
| Route navigation | Wouter `Link` / `<a>` (optionally `Button asChild`) | Fake nav with `href="#"` · Button that only navigates without Link |
| Soft content card | `AppCard` | Ad-hoc `article` soft-card without AppCard when product surface |
| Navigable hub card | `InteractiveCard` `href=…` **or** `AppCard` + Link CTA (no nested interactive) | Card-looking static that feels clickable |
| Status / flash strip | `StatusCard` | Hex success boxes |
| Empty / error / loading / offline | `EmptyStateV2` / `ErrorStateV2` / `LoadingStateV2` / `OfflineStateV2` (thin `AdminV3*` wrappers OK) | Parallel `av3-state` markup as the sole contract |
| Field label / error | `FormLabel` · `FieldError` | Placeholder-only · unlinked error text |
| Search field | `SearchInput` | Raw search without ≥16px mobile text |

Thin wrappers (`AdminV3Empty`, `AdminLoadGate`, `AdminFormField`, …) may keep admin layout classes (`av3-*`) but **must compose** the canonical primitives above — no second button/form/feedback design system.

## Rules

1. **No parallel admin button system** — `av3-btn` CSS may remain transitional layout chrome; new actions ship via `Button`.
2. **RTL first** — `dir="rtl"` on shell; logical start/end; Arabic copy.
3. **No `!important` hide** · no hex/`!important` inside new admin interaction primitives.
4. **No `window.confirm` / `window.alert`** for product flows — use `AdminConfirmDialog` / `FieldError` / `ErrorStateV2`.
5. **Mushaf untouched** · Store **HOLD**.
6. Debt budget: run `inventory:interaction-system --write-budget` only when raw `<button>` ceilings drop.

## Gates

```bash
pnpm --filter @workspace/majalis run test:admin-v3-interaction-authority
pnpm --filter @workspace/majalis run test:sunnah-ui-refinement
```
