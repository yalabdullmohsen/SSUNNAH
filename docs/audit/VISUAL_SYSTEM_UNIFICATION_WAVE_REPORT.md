# Visual System Unification — Final Wave

Date: 2026-10-03 · Tip base: production MATCH `830f641b` · Branch: `cursor/visual-unification-wave`

## Card authorities (inventory)

| Family | Role | Decision |
|---|---|---|
| `AppCard` | Static surface authority | KEEP |
| `InteractiveCard` (SurfacePrimitives) | Navigational/interactive surface | KEEP |
| `StatusCard` / `InsetSurface` / `ElevatedSurface` | Surface hierarchy façades over AppCard | KEEP |
| `cs-card` class on AppCard | Compat surface class | KEEP_JUSTIFIED |
| `ContentCard` / `FeatureCard` / `CardSystem` | Documented façades → AppCard | KEEP_JUSTIFIED |
| `SunnahCardV2` / `CardSystemV2` | V2 façades (gated) | KEEP_JUSTIFIED |
| `HubCard` / `SectionEntryCard` | Navigation entry | KEEP_JUSTIFIED |
| `HadithCard` / `UnifiedLessonCard` / section cards | Product façades → AppCard/InteractiveCard | KEEP_JUSTIFIED |
| CSS `.soft-card` | Compat remap only · 0 TSX emitters | KEEP_JUSTIFIED |
| Admin review cards | ADMIN_ONLY | Boundary held |
| Mushaf open/bookmark cards | MUSHAF_SPECIAL | Boundary held |

No new card system introduced. Duplicate visual recipes absorbed into sf/ss/mj/v2.

## Color / surface / elevation

- Duplicate emerald/gold/ink/white literals in pages/components absorbed into `sf` / `mj` / `ss` tokens.
- Gate-required on-brand text uses bare `var(--mj-white) !important` (contrast contract).
- Radius `Npx` → rem / `--radius-*` / `--sf-radius-*` (except gated soft-cards / pills / pts).
- Soft shadow recipes → `var(--v2-shadow-soft)`; noop shadows removed.

## Typography / spacing

- No new type scale; page radius/spacing drift reduced via shared tokens.
- Arbitrary px radii eliminated in favor of token rhythm.

## Legacy

- Absorption into existing token authorities only.
- No new theme engine · no new token family.
- Compatibility layers narrowed where overrides became obsolete after token absorption.

## Metrics (origin/main → this wave)

| Metric | Before | After |
|---|---:|---:|
| hexInCss | 8855 | 7026 |
| rgbHslInCss | 2121 | 2087 |
| boxShadowDecls | 1047 | 1026 |
| borderRadiusPxDecls | 1202 | 456 |
| sfTokenRefs (floor) | 794 | 1006 |
| buttonRelatedImportantApprox | 1220 | 1147 |
| buttonRelatedHexApprox | 1698 | 1184 |

## Success flags

- CARD_AUTHORITY_IMPROVED
- COLOR_SYSTEM_UNIFIED
- SURFACE_SYSTEM_UNIFIED
- ELEVATION_SYSTEM_UNIFIED
- TYPOGRAPHY_CONSISTENCY_IMPROVED
- SPACING_CONSISTENCY_IMPROVED
- VISUAL_DEBT_REDUCED
