# OVERLAY_AUTHORITY_MAP — سُنّة

| Field | Value |
|---|---|
| Status | **AUTHORITY MAP** |
| Date | 2026-10-03 |
| Exit | `OVERLAY_SYSTEM_UNIFIED` |
| Related | `FLOATING_CONTROLS_POLICY.md` · Modal map |

## Approved

| Surface | Component / owner |
|---|---|
| Tooltip | `ui/tooltip` |
| Sheet / modal overlays | Dialog · AlertDialog · AppBottomSheet · Sheet |
| Side drawer (nav) | `SideNavDrawer` / sheet drawer patterns |
| Floating FABs / back / scroll | `FloatingLayerManager` |
| Menus | Radix menu / menubar / navigation-menu primitives |
| Command palette | `ui/command` (Dialog-based) |

## Classification

| Surface | Class |
|---|---|
| tooltip · Dialog/Sheet overlays · FloatingLayerManager | APPROVED |
| Admin edit bar floating · high z legacy | SPECIAL_CASE (admin) |
| Mushaf portals / ayah action sheets | SPECIAL_CASE |
| Absolute `div` menus without focus trap | LEGACY |

## Contract

| Rule | Value |
|---|---|
| Elevation | `--z-*` tokens only |
| Backdrop | modal overlays dim; tooltips none |
| Radius / spacing | shared radius-control / card |
| Focus | focus-visible · restore on close |
| Positioning | Floating UI / Radix — no manual collide with BottomNav |
| Animation | Radix data-state enter/exit — no one-off kits |
| Under modal | ScrollToTop / FABs yield (policy rule 11) |

## Gates

`test:overlay-feedback-authority` · floating / back authority gates
