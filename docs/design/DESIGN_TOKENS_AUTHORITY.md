# DESIGN_TOKENS_AUTHORITY — سُنّة

| Field | Value |
|---|---|
| Status | **ACTIVE** |
| Date | 2026-10-03 |
| Exit | `DESIGN_TOKENS_AUTHORITY_ACTIVE` · `TOKEN_COMPLIANCE_ENFORCED` |
| Code | `artifacts/majalis/src/lib/design-tokens-authority.ts` |
| Related | `DESIGN_TOKEN_AUTHORITY.md` (stack layers) · COLOR/TYPE/SPACING/SIZE/ELEVATION/BORDER maps |

**Single product vocabulary.** Logical paths (`color.primary`, `spacing.md`, …) resolve **only** to Foundation `--sf*` / `--sf2-*` · Product `--mj-*` · Bridge `--ss-*`.

**Forbidden:** no new token family · no new CSS token families · page-local palettes · parallel type/spacing/shadow scales.

## Machine source

```ts
import { DESIGN_TOKENS_AUTHORITY, resolveDesignToken } from "@/lib/design-tokens-authority";
```

JSON export: `artifacts/majalis/reports/design-tokens-authority.json` (via compliance script).

## Groups (summary)

| Group | Examples → canonical |
|---|---|
| Colors | `color.primary` → `--mj-brand` · `color.text.primary` → `--mj-ink` · surfaces/borders |
| Typography | `typography.pageTitle` → `--sf-type-page-title` · body/caption/label |
| Spacing | `spacing.xs…3xl` → `--sf2-space-1…8` |
| Sizes | icon/avatar/button/input → touch + `--sf2-icon-box*` |
| Radii | `radius.md` → `--sf-radius-control` · `radius.lg` → `--radius-card` |
| Elevation | `elevation.0…4` → `--sf2-elevation-*` |
| Borders | `border.*` → `--ss-border-*` / hairline / focus |
| Breakpoints | mobile→`--bp-lg` · tablet · desktop · widescreen |
| Motion | `motion.fast/normal/slow` → `--motion-*` · ease → `--ease-*` · duration aliases |
| Focus / a11y | `focus.ring` → `--sf2-focus-ring` · `a11y.touchMin` → `--touch-min` · safe-area / content-max |
| Components | card/button/form/table/list/modal/sheet/alert/toast/drawer/tab/nav/search/filter/status |

Full path table: see `DESIGN_TOKENS_AUTHORITY` object in code (source of truth).

## Enforcement

| Rule | Mechanism |
|---|---|
| No rogue systems | Authority maps + decreasing visual debt ceilings |
| Compliance report | `TOKEN_COMPLIANCE_REPORT` via `token-compliance-report.mjs` |
| CI | `test:design-tokens-authority` · `test:design-governance` |
| Migration | New visual work must pick a path from this registry |

## Relation to DESIGN_TOKEN_AUTHORITY.md

That doc defines **layer ownership** (sf SoT · mj product · ss bridge).  
This doc defines the **product semantic catalog** on top of those layers.

## Non-claims

لا UNIFIED_100 · Mushaf/Prayer/Admin SPECIAL_CASE may hold non-catalog chrome · no rewrite of every page hex in this phase.
