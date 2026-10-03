# ICON_AUTHORITY_MAP — سُنّة

| Field | Value |
|---|---|
| Status | **ACTIVE** |
| Date | 2026-10-03 |
| Exit | `ICON_SYSTEM_UNIFIED` |
| Family | **Lucide React** (single product icon language) |
| Sizes | `ICON_SIZE_SCALE` in `lib/size-authority.ts` · tokens `size.icon.*` |

## Size scale (authority)

| Token | px | Use |
|---|---:|---|
| `sm` | 16 | Dense meta / badges |
| `md` | 18 | Default inline |
| `lg` | 22 | Nav / list leading |
| `xl` | 24 | Emphasized / empty illustration seed |

Prefer `ICON_SIZE_SCALE` / design-token paths over ad-hoc `size={14|15|17|19|20|21|28…}`.

## Style rules

- Stroke: Lucide default — do not mix filled+outline metaphors for the same meaning
- Color: inherit ink / brand tokens — no per-icon hex
- RTL: directional icons via `DirectionalIcon` where needed
- Accessibility: decorative `aria-hidden` · actionable icons need accessible name (`IconButton` `label`)

## Meaning discipline

| Meaning | Prefer | Avoid parallel |
|---|---|---|
| Search | `Search` | magnifier variants from other packs |
| Settings | `Settings` / `SlidersHorizontal` (one per surface) | gear+sliders both as primary |
| Book / Quran | product-chosen Lucide book/scroll | emoji |
| Prayer | moon/sun sparingly per prayer chrome SPECIAL_CASE | — |

## Forbidden

- Second icon pack (FontAwesome/Material/…) in product chrome
- Inconsistent visual weight (mixing 14/16/18/20 randomly in one row)
- Icon-only controls without name

## Scan

`product-maturity-engine` → `ICON_SCAN` (lucide file count + size histogram).

## Non-claims

لا UNIFIED_100 · Admin may keep transitional icons until touched · Mushaf SPECIAL_CASE tools separate.
