# Visual I–L — Buttons · Forms · Identity · Debt

Date: 2026-10-03 · Branch: `cursor/visual-unification-wave` · Continues PR visual unification

## Phase I — Button authority

| Authority | Role |
|---|---|
| `Button` | Canonical product button |
| `IconButton` | Icon-only + required `label` |
| `LinkButton` | façade → `Button variant="link"` (in-page) |
| `ToggleButton` | façade → `ui/toggle` |
| `ActionButton` / Primary / Secondary | façades |

| Remaining raw `<button>` | Class |
|---|---|
| Admin editors / review hub | ADMIN_ONLY |
| Mushaf reader chrome | MUSHAF_SPECIAL |
| `sidebar.tsx` SidebarRail | THIRD_PARTY |
| Product public residual | absorbed this wave (ulum / duas / tafsir tabs+headers) |

### Metrics (interaction inventory)

| Metric | Before (wave tip) | After I |
|---|---:|---:|
| rawButtonFiles | 105 | **102** |
| rawButtonElements | 463 | **457** |
| officialButtonImportFiles | 257 | **260** |

Exit: **BUTTON_AUTHORITY_ONLY** (product) held · ADMIN/MUSHAF boundaries held.

## Phase J — Form authority

Created `docs/design/FORM_AUTHORITY_MAP.md`.

APPROVED: Input · Textarea · Select · Toggle/ToggleButton · FormLabel · FieldDescription · FieldError · FormActions · SearchInput  
LEGACY: native fields on public pages without ui import (migrate when touched)  
SPECIAL_CASE: admin editors · mushaf forms

Exit: **FORM_AUTHORITY_ONLY** contract documented · opportunistic migration path.

## Phase K — Visual identity

Continues CSS token absorption from visual unification wave (sf/ss/mj).  
Hierarchy: brand → surface → type → spacing → CTA → nav — no new DS.

Exit: **VISUAL_IDENTITY_UNIFIED** progress (UNIFIED_PARTIAL; not UNIFIED_100).

## Phase L — Design debt

Ceilings lowered only after measured reductions (interaction + visual inventories).  
No gate weakening.

## Success flags

- CARD_AUTHORITY_ONLY (prior U6 + visual wave)
- BUTTON_AUTHORITY_ONLY (product)
- FORM_AUTHORITY_ONLY (map + contract)
- COLOR_SYSTEM_UNIFIED / SURFACE_SYSTEM_UNIFIED (prior wave)
- VISUAL_IDENTITY_UNIFIED (partial → closer)
- DESIGN_DEBT_REDUCED
