# NO_UNPROVEN_CSS_DELETION

| Field | Value |
|---|---|
| Date | 2026-10-04 |
| Rule | Delete only `DEAD_WITH_PROOF` |

## This program

| Selector | Status | Proof | Action |
|---|---|---|---|
| `.tawheed-breadcrumb` | DEAD_WITH_PROOF | Wave 1A: 0 TSX/TS consumers; already absent | none (not restored) |
| `.fiqh-adopted-opinion` | DEAD_WITH_PROOF | Wave 1A comment; no `{` rule | none (not restored) |
| `.fm-parent` | KEEP_TEMPORARILY | empty rule, 0 consumers | kept in `legacy-surfaces.css` |
| Other KEEP_TEMPORARILY rows in the inventory | KEEP_TEMPORARILY | zero static hits is not proof (dynamic / CSS-only / future) | kept |

No selectors were deleted in this decomposition. Rule bodies were relocated by exact line partition.

Inventory: `docs/design/DESIGN_SYSTEM_SELECTOR_INVENTORY.md`
JSON: `artifacts/majalis/reports/design-system-selector-inventory.json`
