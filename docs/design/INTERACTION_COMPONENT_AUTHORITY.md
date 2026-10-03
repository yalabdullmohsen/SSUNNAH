# Interaction Component Authority — سُنّة

| Field | Value |
|---|---|
| Status | **AUTHORITY (Interaction PR-1)** |
| Canonical button | `artifacts/majalis/src/components/ui/button.tsx` → `Button` |
| Product façades | `ActionButton` / `PrimaryButton` / `SecondaryButton` / `IconButton` / `LinkButton` / `ToggleButton` |
| Back | `AppBackButton` (in-page preferred over floating) |
| Baseline | `docs/design/SUNNAH_INTERACTION_SYSTEM_BASELINE.md` |
| Mushaf tools | **MUSHAF_SPECIAL** — not migrated in general waves |
| Store | HOLD · Web `WEB_RELEASED_NATIVE_HOLD` |

## Contract: which element to use

| Element | Correct use | Forbidden |
|---|---|---|
| **Button** | In-page actions: save, submit, cancel, delete, open dialog, run job | Navigation to a route/URL |
| **Link** (Wouter `Link` / `<a>`) | Navigate to route or external URL | Fake buttons with `href="#"` + preventDefault for actions |
| **IconButton** | Single-icon action with required `label` (accessible name) | Icon-only without name; using for primary multi-word CTAs |
| **Toggle** | Binary state | Navigation |
| **MenuTrigger** | Open action menu | Acting as the only destructive confirm |
| **FAB** | At most one primary floating action when product-proven | Stacking ScrollToTop + floating-back + assistant + page FAB without policy |
| **AppBackButton** | Unified back (history / Capacitor / fallback) | Per-page inventing back with conflicting z-index |

## Button API (canonical)

```tsx
<Button
  variant="primary | secondary | outline | ghost | destructive | link"
  size="small | medium | large | icon"
  loading={boolean}
  disabled={boolean}
  iconStart={node}
  iconEnd={node}
  fullWidth={boolean}
  type="button | submit | reset" // default: button
>
  النص
</Button>
```

Aliases kept for compatibility: `variant="default"` → primary; `size="sm"|"default"|"lg"`.

### Accessibility requirements

- Default `type="button"` outside intentional submit.
- `loading` ⇒ `aria-busy` + disabled interaction; spinner does not remove accessible name (label text remains).
- `disabled` uses attribute + distinct surface/text (not opacity-only).
- `focus-visible` ring required; never remove outline without replacement.
- Icon-only ⇒ `IconButton` with `label` / `aria-label`.
- Destructive spatially separated from primary when both appear.
- RTL: `iconStart` / `iconEnd` are logical; directional icons use `DirectionalIcon` where needed.
- Touch target ≥ 44px for medium/small/icon.

### Native / Capacitor

- Prefer in-page `AppBackButton` over floating-back.
- Do not place FABs over mushaf immersive chrome.
- Respect safe-area and bottom nav reservation (`--z-*` stack).

### Analytics

- Do not change analytics event names in migration waves unless a dead handler is removed with proof.

## Façades

| Façade | Behavior |
|---|---|
| `ActionButton` | `href` → Wouter `Link`; else → `Button` + legacy `ss-action-btn*` classes |
| `PrimaryButton` / `SecondaryButton` | Thin wrappers over `ActionButton` |
| `IconButton` | `Button` `size="icon"` + required `label` |
| `LinkButton` | `Button` `variant="link"` — in-page link look (not route nav) |
| `ToggleButton` | thin façade over `ui/toggle` |

## Migration rules

1. No blind codemod.
2. Do not convert links to buttons or submit to non-submit.
3. Mushaf controls = separate review (MUSHAF_SPECIAL).
4. Policy: **decreasing-ceilings** — lower `interaction-system-debt-budget` after each successful wave; ceilings must not rise without exception doc.
5. New raw `<button>` outside allowlist increases ceiling → CI fail.

## Allowlist (raw `<button>` temporarily valid)

- Third-party / Radix primitive slots where `asChild` owns the node
- Mushaf reader chrome (until Phase mushaf interaction)
- Dev-only galleries

## Gates

```bash
pnpm --filter @workspace/majalis run test:interaction-system-debt-budget
pnpm --filter @workspace/majalis run test:interaction-system-authority
```
