# WAVE — Product Redesign Wave 1 (Foundation)

| Field | Value |
|---|---|
| Branch | `cursor/product-redesign-wave1-foundation` |
| State | **PR in flight** (continuation authorized) |
| Objective | Audit + Foundation V2 + Card V2 + state foundations |
| verify:preflight | pass |
| verify:ci | pass (269.5s) |
| Focused | loading-ux-gates · product-redesign-wave1-foundation-gate · ssunnah-stability-foundation-gate |

## Delivered

- Docs: PRODUCT_UX_AUDIT, ROUTE_COMPONENT_INVENTORY, SUNNAH_FOUNDATION_V2, DESIGN_TOKEN_MIGRATION, CARD_SYSTEM_V2, NAVIGATION_ARCHITECTURE, RESPONSIVE_AND_SAFE_AREA_SPEC, ACCESSIBILITY_STANDARD, VISUAL_MIGRATION_PLAN  
- Scientific scaffolds (docs only)  
- CSS/TS: `sunnah-foundation-v2`, `card-system-v2`, `app-state-v2`  
- Components: CardSystemV2, LoadingStateV2 (skeleton-first, no banned busy copy), ErrorStateV2; EmptyStateV2 retained  
- Gate: `product-redesign-wave1-foundation-gate.test.ts`  
- Wired in `main.tsx` + `design-system/index.ts`

## Contrast / loading root

- Foundation V2 semantic tokens (`--sf2-*`) layer after PR-1 foundation; contrast notes pinned in `sunnah-foundation-v2.ts`  
- LoadingStateV2 defaults to silent skeleton + `STATUS.contentLoading` aria-label (passes loading-ux-gates)

## Explicitly not done

Page redesigns · snapshot updates · Quran/Hadith edits · Wave 2+ navigation rewrite · commit/push/PR
