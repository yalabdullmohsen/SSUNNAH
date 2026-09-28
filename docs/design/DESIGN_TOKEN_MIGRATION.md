# Design Token Migration — toward Foundation V2

**Authority lock:** `docs/design/DESIGN_TOKEN_AUTHORITY.md` · Baseline: `docs/design/SUNNAH_VISUAL_SYSTEM_BASELINE.md` · Debt gate: `pnpm --filter @workspace/majalis run test:visual-system-debt-budget`

## Current stack (runtime order, simplified)

1. `theme.css` / identity  
2. `sunnah-foundation-tokens.css` (`--sf-*`)  
3. `sunnah-foundation-v2.css` (`--sf2-*`) ← Wave 1  
4. `brand-v4` + `tokens.css` pairs (LEGACY_NON_SOT)  
5. `design-tokens` / `visual-redesign-v2` / `semantic-layer`  
6. Card system tokens + page CSS  

## Migration rules

1. New UI uses `--sf2-*` or `--sf-*` only — no new raw brand hex in components.  
2. Do not delete brand-v4 until page coverage ≥ prior quality (PR-13 path).  
3. Card System V2 classes consume `--sf2-*`.  
4. Contrast gate failures → fix product tokens/components, never thresholds.  
5. Quran/Hadith text styles stay on dedicated scripture roles — never “muted” for matn.

## Retirement candidates (later waves)

| File | Condition to retire |
|---|---|
| Duplicate soft-card hex overrides | After section hubs on cs2/sf2 |
| One-off page emerald washes | After hub migration |
| Glossy gradient hero utilities | After homepage Wave 3 |
