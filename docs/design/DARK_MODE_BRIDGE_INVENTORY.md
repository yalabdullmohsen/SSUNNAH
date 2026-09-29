# Dark Mode Bridge Inventory (PHASE 4)

| Field | Value |
|---|---|
| Authority | `DARK_MODE_AUTHORITY.md` |
| Switch | `html[data-theme]` / `html.dark` |
| Policy | No mass delete · parity before drop import |

## Layers

| File | Classification | Notes |
|---|---|---|
| `dark-mode-recovery.css` | **Active Compatibility** | Sync in `main.tsx` (gate requires); html.dark scoped |
| `dark-mode-surfaces.css` | **Active Compatibility** | Boot-dark parallel import |
| `dark-design-system.css` | **Active Compatibility** | Boot-dark parallel |
| `premium-dark-refine.css` | **Active Compatibility** | Boot-dark + ThemePreferenceProvider |
| `pages/luxury-night-v2.css` | **Active Compatibility** | Boot-dark parallel |
| `sunnah-identity-luxury-night.css` | **Replaceable → absorb** | Identity night polish; fold into `--sf2-*` / theme contract |
| `dark-emerald-menus.css` | **Compatibility** | Menus only |
| `theme.css` `--mj-*` night | **Canonical product contract** | Canvas `#0F1613` |

## This wave

Inventory only — **no mass import removal**. Light/Dark/RTL gates must stay green before any drop.

## Next

1. Rebind page-local night hex → `--mj-bg` / `--sf2-*`.  
2. Prove identity-luxury-night unused selectors → SAFE_REMOVE candidate.  
3. Never invent a third night palette.
