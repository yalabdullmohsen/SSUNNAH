# FULL_VISUAL_BASELINE

**Program:** `SUNNAH_FULL_APPLICATION_LAYER_ERADICATION_AND_SINGLE_VISUAL_AUTHORITY`  
**Machine source:** `artifacts/majalis/reports/eradication/FULL_VISUAL_BASELINE.json`  
**Regenerate:** `pnpm --filter @workspace/majalis run inventory:application-layer-eradication`

## Snapshot (PR A ground truth)

Values below mirror the JSON artifact at program start from latest `main` (`672573e09` era). Re-run the inventory script after each absorption wave; ceilings must not rise.

- CSS file count: **356**
- CSS total bytes: **3,872,733**
- Synchronous CSS imports (`main.tsx` before deferred loader): **14**
- Deferred CSS imports: **54**
- Rule blocks (approx `{`): **20,735**
- Hex count: **6,432**
- RGB/HSL count: **2,008**
- Unsafe Hex fallbacks `var(--token, #hex)`: **3,333**
- `!important` count: **4,746**
- Raw `box-shadow` decls: **986**
- Raw `border-radius` px decls: **392**
- Raw numeric `z-index` decls: **258** (eradication counter; visual-debt gate uses non-negative pattern ceiling 257)
- Inline color style matches (TSX): **39**
- Official Button import files: **287**
- Raw `<button` files: **76**

## Token authorities (allowed only)

- Foundation: `--sf-*` (decls 150 / var-uses 773 in CSS)
- Application: `--ss-*` (decls 109 / var-uses 524 in CSS)
- Bridge / legacy controlled: `--mj-*` (decls 193 / var-uses 10,889 in CSS)

No fourth token family.

## Layer classification counts

- CANONICAL_AUTHORITY: 8
- ACTIVE_COMPATIBILITY: 7
- ABSORB_NOW: 6
- KEEP_TEMPORARILY: 130
- SPECIAL_CASE: 36
- IOS_ONLY: 3
- SHARED_PLATFORM: 166

## Companion maps

- `FULL_STYLE_DEPENDENCY_GRAPH.json`
- `CSS_LOAD_ORDER_MAP.json`
- `TOKEN_ALIAS_GRAPH.json`
- `COMPONENT_CONSUMER_MAP.json`
- `ROUTE_TO_STYLE_MAP.json`
- `WEB_IOS_SHARED_OWNERSHIP_MAP.json`
- `HEX_FILE_RANKING.json`

## Platform separation

WEB success ≠ iOS success ≠ App Store readiness.  
See `docs/governance/SUNNAH_PLATFORM_ENFORCEMENT_PROTOCOL.md`.
